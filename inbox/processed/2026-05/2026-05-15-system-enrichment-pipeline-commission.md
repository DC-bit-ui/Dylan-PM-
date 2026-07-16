# Apex commission — System-wide Enrichment Pipeline

**Date:** 2026-05-15
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Picked up — scheduled task `daily-enrichment-pipeline` created 2026-05-15, cron `0 5 * * 1-5` (05:00 SAST = 13:00 AEST weekdays). Old `persona-supplements-refresh` disabled.
**Supersedes:** [2026-05-14 persona-supplements commission](2026-05-14-persona-supplements-pipeline-commission.md) — that task is folded into this larger pipeline. Don't run both.

## The shift

The 2026-05-14 commission was scoped to **persona supplements only**. This expands it: the Frontier dashboard reads multiple bus locations now, and HubSpot is often a laggard. Real-time signal lives in Confluence (Aircall transcripts), Teams (Operation Stormboy > Deals channel especially), Granola (meetings), Outlook (emails). HubSpot eventually catches up but often not before a rep needs the information.

Apex's expanded job: **daily, pull every source we have, route signal to the right bus folder by entity type, leave the dashboard to join at render time.**

## The four bus folders Apex writes to

All under `shared-growth-memory/`. Each has a README with full schema + matching guidance.

| Folder | Keyed by | Cadence | Source spec |
|---|---|---|---|
| `persona-supplements/<slug>/` | Persona slug from `coaching/cache/persona-registry.json` (hobbs, ben, claudia, will — skip bill-hyem, historical) | every 48h | [README](../../shared-growth-memory/persona-supplements/README.md) |
| `deal-supplements/<deal_id>/` | HubSpot deal id (numeric) | **daily** | [README](../../shared-growth-memory/deal-supplements/README.md) |
| `contact-supplements/<contact_id>/` | HubSpot contact id (numeric) | **daily** | [README](../../shared-growth-memory/contact-supplements/README.md) |
| (Optional, phase 2) `signal-index/` | Date-stamped daily roll-up | daily | TBD — only after deal/contact supplements running smoothly |

## The daily run — recommended sequence (13:00 AEST)

### Step 1 · Discover the working sets (~5 min)

Pull from HubSpot via MCP (you have read access):
- **Active deals** — every deal where `dealstage` is not `closedwon` or `closedlost`. Capture `id`, `dealname`, owner, associated contact ids, last activity date.
- **Active Storm Boy contacts** — every contact with `storm_boy_campaign_member = Yes` and `contact_lead_stage_storm_boy` in {Identified, In Conversation, Farm Visit booked, Farm Visit completed, In Sales Pipeline}. Capture id, name, phone, email, meeting_date if set.
- **Recently won deals** — last 60 days of closedwon (some post-close supplements still arrive).

This is your join-key universe. ~120 deals + ~1500 contacts typical.

### Step 2 · Sweep Confluence (~15 min)

Atlassian MCP. CQL queries:
- All Aircall transcript pages updated in the last 72h: `lastmodified > -3d AND space = "AG"` (or wherever the Aircall sync lives)
- For each transcript page, parse the contact name/phone from the page header. Match to your contact-id universe. Write `confluence-aircall-<YYYY-MM-DD>-<short-slug>.md` into the matched `contact-supplements/<contact_id>/` and, if the contact has an associated active deal, **also** into `deal-supplements/<deal_id>/`.
- Other Confluence pages mentioning a known contact/deal name (CQL `text ~ "<dealname>" AND lastmodified > -7d`).

**Per-persona Confluence sources (read from `persona-registry.json` → `confluence_sources`).** For each persona entry, pull from the listed ids. Today these include:
- **Hobbs's raw farm-visit transcripts** — Confluence folder id **`577011728`** (`Hobbs' Raw transcripts`, space `AG`). CQL: `ancestor = 577011728 AND lastmodified > -3d`. For each child page, write `confluence-farmvisit-<YYYY-MM-DD>-<slug>.md` into `persona-supplements/hobbs/`. Also parse the customer-name / visit-date from the page metadata (the companion database id `576192562` holds structured rows — query it as the join-key for matching to `contact-supplements/<contact_id>/` when an associated HubSpot contact exists).
- **Hobbs Aircall transcripts** — existing "Hobbs Calls" Confluence folder (already cached at `coaching/cache/hobbs-calls-distillates.json`). Daily diff only.

**General principle.** When a persona-registry entry adds new `confluence_sources`, Apex picks them up automatically on the next run. Dylan + the team can add new sources by editing the registry — no Apex code change needed.

### Step 3 · Sweep Teams (~10 min)

Microsoft 365 MCP. Key channels (check exact names with Dylan if needed):
- **Operation Stormboy > Deals** — high-priority. This is where Hobbs/Ben/Will work through specific deals in real time. Pull messages from last 24h.
- **Operation Stormboy > general** — secondary.
- **Operations** — for cross-deal patterns.

For each message:
- Extract any dealname or contact-name references (lightweight pattern match against your universe)
- Bundle messages per deal into a single `teams-deals-channel-<YYYY-MM-DD>.json` with shape `{ messages: [ { from, timestamp, text }, ... ] }`
- Write to matched `deal-supplements/<deal_id>/`. If no specific deal match, write to relevant rep's `persona-supplements/<slug>/teams-channel-<YYYY-MM-DD>.json`.

### Step 4 · Sweep Granola (~5 min)

Granola MCP. `list_meetings` for last 72h. For each meeting:
- Identify participants (rep + customer if external)
- If participants include a known contact, write `granola-meeting-<YYYY-MM-DD>-<slug>.md` to that `contact-supplements/<contact_id>/` and any matched deal
- If purely internal team meeting (e.g. Stormboy standup), write to the relevant rep's `persona-supplements/<slug>/` as `granola-meeting-...`

### Step 5 · Sweep Outlook (~10 min)

Microsoft 365 MCP. Email search for last 72h:
- `sender:rep@agriprove.io` for each active rep, OR `recipient:rep@agriprove.io` — capture both directions
- For each email, match to deal/contact via subject (deal name) or recipient (contact email)
- Strip sig blocks + meeting invite footers
- Write to `deal-supplements/<deal_id>/outlook-email-<YYYY-MM-DD>-<short-slug>.md` or `contact-supplements/<contact_id>/...`

### Step 6 · Refresh persona supplements (every 2nd day only)

If today's day-of-year is even, refresh each active rep's `persona-supplements/<slug>/` per the [persona-supplements README](../../shared-growth-memory/persona-supplements/README.md). Skip otherwise — the dashboard's persona synthesis is 48h-gated and Apex shouldn't waste effort on days it can't use.

### Step 7 · Log the run (~30s)

Append a single line to `shared-growth-memory/apex-runs.log`:
```
2026-05-15T03:00:00Z · daily-enrichment · deals=128 contacts=1523 confluence=24 teams=87 granola=12 outlook=156 personas-refreshed=4
```

This gives the dashboard a heartbeat to display ("Apex last ran 2h ago, X new items").

## Performance budget

The whole daily run should fit in ~45 minutes of Apex wall-clock time. Most of that is MCP latency, not compute. If it's running longer, the working-set queries are probably too broad — narrow the time window in each sweep first.

## Idempotency + dedup

Per the supplement READMEs: same source-window + same artifact = same filename = overwrite. Apex MUST be safe to re-run on the same day without doubling drops.

When the same artifact is relevant to multiple entities (e.g. a Teams post mentions two deals), write to **all** matched folders. Dashboard handles dedup on render side.

## Sensitivity

Same conventions as before. Follow [`memory/decisions/2026-05-11-portfolio-rules.md`](../../memory/decisions/2026-05-11-portfolio-rules.md) for what to strip. If unsure, over-strip and flag for Dylan rather than write.

## Acceptance criteria

By day 3 of this running:
- [ ] At least 10 deal-supplement folders exist with at least one `confluence-aircall-` and one `teams-deals-channel-` artifact each
- [ ] At least 30 contact-supplement folders exist with Aircall transcripts matched to Storm Boy contacts
- [ ] `apex-runs.log` shows three daily entries
- [ ] Hitting `/api/brain/refresh-persona/hobbs` produces a profile that mentions a recent Teams Deals-channel quote or Granola meeting (not just HubSpot notes)

## What's next on the dashboard side (parallel work by Dylan)

Once Apex starts producing deal/contact supplements, the dashboard needs three additions:

1. **Supplement-aware engagement timeline.** The WORK tab's expand overlay's "What actually happened" right column folds in deal-supplements alongside the HubSpot timeline. Sort merged by timestamp.
2. **"What's new" indicator on deal cards.** If a deal has any supplement file dated after its last HubSpot activity, show a small badge: `↗ Confluence + Teams · 6h ago`.
3. **API endpoints.** `GET /api/work/deal-supplements/:id`, `GET /api/work/contact-supplements/:id`, `GET /api/work/apex-heartbeat` (latest log line). The persona-supplement endpoint pattern.

These are queued — see `inbox/cowork/2026-05-15-dashboard-supplement-consumption-plan.md` (TBD).

## Open questions for Apex

1. **Channel names.** Confirm exact Teams channel names — "Operation Stormboy > Deals" is the most important. If the channel is structured differently, name them in your reply.
2. **Aircall page parsing.** Confluence Aircall transcript page structure is consistent (Phone, Contact, Direction, Date, Duration, Transcript). Confirm you can extract the phone number reliably for join-key matching.
3. **Granola filter.** Are there meeting types Apex should exclude (e.g. internal-only standups → persona, not deal)? Suggested default: any meeting with an `@agriprove.io`-only attendee list goes to persona-supplements; any with an external attendee goes to contact/deal supplements.
4. **First-run scope.** For the first run, suggest going back 30 days on Confluence/Granola/Outlook (not just 72h) to seed each active deal/contact with historical context. Subsequent runs do daily-diff only.
