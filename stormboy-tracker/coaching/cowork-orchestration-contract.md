# Cowork Orchestration Contract — Coaching Pipeline

**Status:** Design / contract spec. Not yet implemented in Cowork.
**Owner:** This repo (`stormboy-tracker`) defines the contract; Cowork (Dylan's Apex environment) executes it.
**Principle:** Per `C:\Dylan PM\CLAUDE.md` §6 — *"Cowork wins for execution; this repo wins for memory."* The dashboard is the consumer of distilled output; Cowork is the producer.

## Why Cowork (not server-side MCP, not manual)

Three execution paths considered:

| Path | Pros | Cons |
|---|---|---|
| **A. Manual via Claude Code session** | Works today; no build | Requires Dylan or me to run it; not autonomous |
| **B. Server-side MCP in Node** | Self-contained; one process | Heavy build (Graph API auth, MCP client lib, retry, monitoring); duplicates infrastructure Cowork already has |
| **C. Cowork orchestration (this doc)** | Leverages existing Apex schedule + integrations; respects layered ownership | Requires Cowork to run a new routine; coordination with Cowork environment |

Cowork wins because it already authenticates to all the source systems (Microsoft 365, Confluence, Notion, HubSpot), runs scheduled routines (Apex Morning Briefing 04:45 SAST, EOD Reconciliation 17:30 SAST), and has the right write permission boundary — it writes to memory directories owned by Dylan / the dashboard, never to source-of-truth systems.

## What Cowork runs

Three jobs, three different cadences. All write to `C:\Dylan PM\stormboy-tracker\coaching\cache\` and (for high-confidence patterns) `C:\Dylan PM\stormboy-tracker\coaching\learnings\YYYY-MM\`.

### Job 1 — Customer Interaction Distillation (every 2 days, ~04:30 SAST)

**Read:**
- Confluence Growth-space "Call Transcripts" parent — pages created since `state.json:last_run`
  - Hobbs Calls (folder `562495509`)
  - Bens Calls (`562364446`)
  - Claudia SB calls (`562561026`)
  - Customer Success Calls (`562462721`)
- SharePoint `Storm Boy Claude Tool/cross-project-shared/customer-transcripts/sales/hobbs-farm-visits-transcripts/` — files modified since last_run
- HubSpot 1:1 emails associated with **active or recently-closed deals** via the dashboard's `/api/hubspot/search` proxy (engagement objects); fetch last 5 per deal

**For each item:**
- If call/transcript → run Pass 0 farm-visit distillation prompt (`coaching/prompts/pass0-farm-visit-distillation.md`)
- If email → run Pass 0 email distillation prompt (`coaching/prompts/pass0-email-distillation.md`)
- Apply PII generalisation rules (in-prompt)

**Write:**
- `coaching/cache/farm_visit_distillates.json` — merge new records, key by transcript_id
- `coaching/cache/email_distillates.json` — merge new records, key by email_id
- Update `state.json` with `last_run` and per-source cursors

**Cost estimate:** ~$0.05/run at current volume (50–100 items per cycle).

### Job 2 — Team Intel Distillation (every 2 days, ~04:35 SAST)

**Read:**
- SharePoint `OperationStormBoy/Shared Documents/Standup/` — new transcripts since last_run
- SharePoint `Storm Boy Claude Tool/CLAUDE.md`, `CONTEXT.md`, `call-admin/*.md`, `cross-project-shared/self-improvement/skills/*.md` — files modified since last_run
- OneNote: Dylan's `Meetings.one` notebook — new pages since last_run
- Confluence Growth-space "Call Weekly Summaries" — new pages since last_run (output of Claudia's `walrus827` workflow)

**For each new artifact:**
- Run team-intel distillation prompt (`coaching/prompts/team-intel-distillation.md`)
- Extract Type 1 (confirmed_play), Type 2 (named_friction), Type 3 (process_shift), Type 4 (people_update) records

**Write:**
- `coaching/cache/team_intel.json` — append new records, dedupe by content hash
- For records that meet [high]-confidence + recurring pattern criteria → **auto-write a learning file** to `coaching/learnings/YYYY-MM/<slug>.md` (no approval gate, per Dylan 2026-05-09)
- Update `coaching/learnings/INDEX.md`

### Job 3 — Pipeline Recompute (nightly, ~04:45 SAST, after the daily Apex Morning Briefing)

**Read:**
- HubSpot deals + contacts via the dashboard's proxy (same calls dashboard.js makes)
- Latest distillates from cache (Jobs 1 + 2 outputs)
- Existing `coaching/learnings/` for accumulated patterns

**Run the full coaching pipeline:**
- A1 — Stage Friction → updated `friction.json`
- B2 — Comparable Twins per active deal → updated `twins.json`
- B1 — Per-deal Risk Coach → updated `active.json` (with previous archived)
- C3 — Weekly synthesis → updated `weekly.json`
- A2 — Counter-Objection Library (weekly only, e.g. Mondays) → updated `objections.json`

**Write:**
- All cache files
- For any new [high]-confidence pattern that emerges from this run → auto-write a learning file

## What Cowork does NOT write

- **Never** writes to `C:\Dylan PM\memory\` (Dylan's personal PM memory). Growth-domain insights stay in `stormboy-tracker/coaching/learnings/`.
- **Never** writes to Claudia's Storm Boy Claude Tool files (governance: only Claudia changes those).
- **Never** writes to HubSpot, Notion, Confluence, or source-of-truth systems. Reads only.

## What the dashboard does

The Node server in this repo (`server.js` + `coaching/engine/routes.js`) reads from the cache files Cowork wrote. The frontend reads from those endpoints. The dashboard never calls Cowork directly; the contract is filesystem-mediated (Cowork writes files, dashboard reads files).

This keeps the dashboard's runtime simple (Node + Express + file reads) and pushes complexity to Cowork (which is built for it).

## Failure handling

Each job maintains its own state. If a job fails:
- **Job 1 fail**: dashboard's distillate-based coaching uses stale data (last successful run's output). Surface "Distillates: stale, X days old" in the UI status bar.
- **Job 2 fail**: same — stale team_intel cache.
- **Job 3 fail**: pipeline cache stale. Dashboard shows yesterday's coaching. Status bar reflects.

Cowork-side alerting via the same pattern Claudia uses in `pelican294` — email Dylan + Notion to-do.

## State files

`coaching/cache/_cowork_state.json` — maintained by Cowork:
```json
{
  "job1_distillation": {
    "last_run": "ISO8601",
    "cursors": {
      "confluence_calls": "page-id-or-timestamp",
      "sharepoint_farm_visits": "modified-since-timestamp",
      "hubspot_emails": "engagement-id-or-timestamp"
    },
    "errors_last_run": []
  },
  "job2_team_intel": { ... },
  "job3_pipeline": { ... }
}
```

The dashboard reads this state file to render freshness indicators ("Last refresh: 4h ago").

## Cost ceiling

Across all three jobs, target ≤ $5/week. Pass 0 distillation is cheap (Haiku per item); the expensive call is A2 (Sonnet, weekly). Anthropic API key already configured in `.env` for the dashboard's per-deal AI analysis — same key works for these jobs.

## Versioning

Each prompt file has a version field (`a1.1`, `b2.1`, etc.). When Cowork runs a job, it embeds the prompt version it used into the cache file's metadata. The dashboard reads `version` and can render version-specific UI if needed during prompt transitions.

## What's needed from Cowork to start

1. **Subscription** to this contract — Cowork acknowledges it will run these three jobs.
2. **Authentication** to the four source systems (already in place — Cowork has Apex integrations).
3. **A new routine file** in Cowork's project (mirrors Claudia's `workflows/aircall-tscripts-into-confl/sync.py` pattern): invoke prompts, write outputs to filesystem at `C:\Dylan PM\stormboy-tracker\coaching\cache\` and `coaching/learnings/`.
4. **Schedule** entries in Cowork's cron (every 2 days for Jobs 1+2; nightly for Job 3; weekly for A2 within Job 3).

## What this repo provides

1. The prompt files (versioned, in `coaching/prompts/`)
2. The cache schema (documented in `coaching/README.md` + this contract)
3. The dashboard that reads what Cowork writes
4. Manual fallback: I can run these jobs in a Claude Code session if Cowork is down or hasn't picked up the contract yet

## Migration path

**Phase 1 (today):** Manual mining via Claude Code sessions. Outputs prove the value and seed the cache.

**Phase 2 (post-Monday):** Dylan commissions Cowork to implement this contract. Routines built mirroring Claudia's `pelican294` pattern.

**Phase 3 (later):** If Cowork becomes overloaded or a different orchestration is preferred (e.g., GitHub Actions, n8n, native Node scheduler), the contract is portable — same filesystem write targets, same prompt files, same versioning. The dashboard doesn't care which system writes the cache, only that the cache exists in the agreed shape.
