---
name: weekly-system-retro
description: Weekly system retro — synthesises the last 7 days of enrichment volume, pattern activity, probe loops, and heuristic drift into a markdown retro file. Runs Friday 16:45 SAST, 15 minutes after pattern curation.
---

You are running the Weekly System Retro for the Frontier coaching system. Your job: call the dashboard's retro endpoint to generate a weekly summary of system activity, then log the result and surface headline numbers.

## Step 0 · Resolve BUS_ROOT

The canonical output path is the SharePoint-synced folder. Resolve dynamically — never hard-code a Windows username:

```
BUS_ROOT = C:\Users\{current-windows-user}\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

Resolve `{current-windows-user}` via `os.homedir()` or `%USERPROFILE%`. If `$env:BUS_PATH` is set, use that instead.

**HALT CHECK:** Verify `BUS_ROOT` exists as a directory. If not:
1. Do NOT create it
2. Write an error file to `C:\Dylan PM\inbox\cowork\{YYYY-MM-DD}-apex-retro-bus-missing.md`
3. Abort the run

## Step 0.5 · Validate supplement provenance (added 2026-05-21)

Before generating the retro, sweep `{BUS_ROOT}/{deal,contact,persona}-supplements/**/*` and audit provenance front-matter compliance per `memory/decisions/2026-05-21-supplement-provenance-schema.md`.

For each supplement file:
1. Parse the leading YAML front-matter (`.md`) or top-level `_provenance` key (`.json`)
2. Check required fields: `source`, `source_id`, `fetched_at`, `fetched_by`, `supplement_schema_version`
3. Categorise:
   - **v1-compliant** — required fields present + `supplement_schema_version: 1`
   - **v0-legacy** — no front-matter (pre-2026-05-21 writes; tolerated indefinitely per migration decision)
   - **malformed** — front-matter present but missing required fields (write bug)
   - **duplicate-id** — same `source_id` in multiple files (write bug — should be idempotent overwrite)

Write the audit summary to `{BUS_ROOT}/system-retros/_provenance-audit-{YYYY}-W{nn}.json`:
```json
{
  "audit_date": "<ISO 8601>",
  "iso_week": "{YYYY}-W{nn}",
  "totals": { "v1_compliant": <int>, "v0_legacy": <int>, "malformed": <int>, "duplicate_id": <int> },
  "by_source": { "teams": {...}, "granola": {...}, "confluence": {...}, "hubspot": {...} },
  "malformed_files": [<path>, ...],
  "duplicate_ids": [{"source_id": <id>, "files": [<path>, ...]}, ...]
}
```

Include the headline numbers in the retro markdown (Step 1 below) under a new `## Provenance compliance` section.

If `malformed` > 0 OR `duplicate_id` > 0: surface in chat as a `⚠` warning — these indicate a pipeline bug needing investigation.

## Step 1 · Generate the retro

Try the dashboard endpoint first:

```
POST http://localhost:3401/api/system/retro?write=1
```

If the dashboard is unreachable (connection refused, timeout after 10s), fall back to calling the node module directly:

```bash
cd "C:\Dylan PM" && node -e "console.log(JSON.stringify(require('./stormboy-tracker/coaching/engine/system-retro').generate({write:true}), null, 2))"
```

The endpoint writes a markdown file to:
```
{BUS_ROOT}\system-retros\{YYYY}-W{nn}.md
```

Idempotent — re-running on the same ISO week overwrites the file with the latest snapshot. A mid-week trigger followed by an end-of-week trigger results in one final summary, not two.

## What the retro includes (five sections)

1. **Apex enrichment volume** — supplement files written this week, by source (aircall, outlook, teams, granola, farmvisit, hubspot_snapshot) and by entity type (contact, deal, persona)
2. **Patterns added or promoted** — new patterns this week, plus existing patterns whose confidence changed
3. **Probe loop** — created, closed, still-open, outcome mix
4. **Notable** — heuristic observations (hot weeks, dormant weeks, backlog warnings). Each section includes a `> ⚠` warning line when a signal stalls.
5. **Generation metadata** — bus path, timestamp

## Step 2 · Log the run

Append to `{BUS_ROOT}\apex-runs.log`:
```
{ISO-timestamp} · system-retro · period={YYYY}-W{nn} supplements={total_supplement_count} patterns_new={n} probes_created={n} file=system-retros/{YYYY}-W{nn}.md
```

Use atomic write for the log append: read existing content, append new line, write to `.tmp`, rename.

## Step 3 · Report

Surface in chat:
- The retro file path (so Dylan can review the format)
- Headline numbers:
  - Supplement volume this week vs. last week (trending up / flat / down)
  - New patterns count
  - Probe loop activity (created vs. closed)
  - Any `⚠` warnings the retro included
- Note that the next Monday morning briefing should reference this retro file and lift the headline numbers into Dylan's brief

## Step 4 · Empty week handling

If ALL enrichment counts are zero for the week:
- Still write the retro file (a "the system did nothing" retro is the most important one)
- Flag prominently in chat: "⚠ Zero enrichment activity this week — investigation needed"
- The retro markdown itself should include a `> ⚠ No enrichment activity detected this week` warning

## Rules

1. **All writes to SharePoint bus** — same rules as the daily-enrichment-pipeline. Never write to `C:\Dylan PM\shared-growth-memory\`.
2. **Atomic writes** — tmp + rename for every file write.
3. **Halt on missing BUS_ROOT** — abort, don't fall back.
4. **Reads post-curation state** — this task runs 15 minutes after `weekly-pattern-curation`. The pattern counts should reflect the post-curation state (archived patterns excluded from active counts).
5. **OneDrive conflict detection** — if conflict files exist in `system-retros/`, log `conflicts=N` in the run log.
6. **No hard-coded usernames** — BUS_ROOT resolved dynamically every run.
