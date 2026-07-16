# Apex commission — Weekly pattern curation

**Date:** 2026-05-17
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Awaiting Apex pickup
**Cadence:** Weekly · Friday 16:30 SAST (00:30 Saturday AEST) · cron `30 16 * * 5`
**Related:** [2026-05-16 bus-path commission](2026-05-16-apex-bus-path-to-sharepoint-commission.md) — this task ALSO writes to SharePoint; rules from that doc apply.

## The shift

Patterns are meant to be hypotheses that get corroborated. The shared-bus contract says a pattern starts at `confidence: low` and gets bumped to `moderate` then `high` when a second system independently confirms it. Without an active gate, low-confidence patterns linger forever and dilute the signal.

This task runs a weekly gate: any pattern that's been at `confidence: low` for more than 30 days **and** is still surfaced in only one system (no cross-confirmation) gets archived out of the active pool.

## What to run

Apex hits the dashboard's endpoint (POST, no body, dry-run off):

```
POST http://localhost:3401/api/system/curate-patterns?dry_run=0
```

If the dashboard isn't reachable from where Apex runs, alternatively run the curator directly via node:

```
node -e "console.log(JSON.stringify(require('./stormboy-tracker/coaching/engine/curate-patterns').curate({dryRun:false}), null, 2))"
```

(working dir: `C:\Dylan PM\` or wherever the repo is checked out).

## What it does

For each `*.md` in `<bus>/patterns/` (not the archive subfolder):
1. Parse front-matter — extract `confidence`, `written_at`, `surfaced_in_systems`
2. If `confidence === 'low'` AND `age > 30 days` AND `surfaced_in_systems.length < 2` → archive
3. Archive = move to `<bus>/patterns/archive/<filename>`, with three new front-matter fields:
   - `archived_at: <ISO timestamp>`
   - `archive_reason: 'confidence=low for N days without a second system confirming'`
   - `status: archived`
4. Atomic write (tmp + rename) before deleting the original

The full response includes `candidate_count`, `archived_count`, lists of files archived, and errors.

## What to log

Append a line to `<bus>/apex-runs.log`:
```
2026-05-17T16:30:00Z · pattern-curation · scanned=N candidates=M archived=K
```

If 0 archived but candidates>0, that's normal in dry-run mode. The endpoint defaults to dry-run; only `dry_run=0` actually moves files.

## Failure modes

- **Bus unreachable** — halt, log to `inbox/cowork/<date>-apex-curation-bus-missing.md`, skip this run. Same convention as the daily-enrichment commission.
- **Archive entry already exists** — skip that file, log to errors. Shouldn't happen since filenames are unique slugs.
- **Pattern has malformed front-matter** — log to errors, leave the file alone. Don't delete or move if we can't parse.

## Acceptance criteria

After the first weekly run:
- [ ] `<bus>/patterns/archive/` directory exists (created lazily on first archive)
- [ ] `apex-runs.log` has a `pattern-curation` line for today
- [ ] Each archived file has the three new front-matter fields
- [ ] Dashboard `/api/system/health` shows the `archived` count moving from 0 to N
- [ ] No patterns younger than 30 days got touched

## Reply with

Confirmation that the weekly cron is scheduled + the result of the first dry-run pass (so we can sanity-check what would be archived before turning on real writes).
