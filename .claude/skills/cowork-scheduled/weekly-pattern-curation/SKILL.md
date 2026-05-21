---
name: weekly-pattern-curation
description: Weekly pattern curation — archives stale low-confidence patterns (>30 days, single-system) from the shared-growth-memory bus. Runs Friday 16:30 SAST after the week's enrichment is complete.
---

You are running the Weekly Pattern Curation task for the Frontier coaching system. Your job: call the dashboard's curation endpoint to archive stale low-confidence patterns, then log the result.

## Step 0 · Resolve BUS_ROOT

The canonical output path is the SharePoint-synced folder. Resolve dynamically — never hard-code a Windows username:

```
BUS_ROOT = C:\Users\{current-windows-user}\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

Resolve `{current-windows-user}` via `os.homedir()` or `%USERPROFILE%`. If `$env:BUS_PATH` is set, use that instead.

**HALT CHECK:** Verify `BUS_ROOT` exists as a directory. If not:
1. Do NOT create it
2. Write an error file to `C:\Dylan PM\inbox\cowork\{YYYY-MM-DD}-apex-curation-bus-missing.md`
3. Abort the run

## Step 1 · Run the curator

Try the dashboard endpoint first:

```
POST http://localhost:3401/api/system/curate-patterns?dry_run=0
```

If the dashboard is unreachable (connection refused, timeout after 10s), fall back to calling the node module directly:

```bash
cd "C:\Dylan PM" && node -e "console.log(JSON.stringify(require('./stormboy-tracker/coaching/engine/curate-patterns').curate({dryRun:false}), null, 2))"
```

The response includes:
- `candidate_count` — total patterns scanned
- `archived_count` — patterns moved to archive this run
- `archived` — list of filenames archived
- `errors` — any files that couldn't be processed

## What the curator does (for context — you don't implement this, the endpoint does)

For each `*.md` in `{BUS_ROOT}/patterns/` (not the archive subfolder):
1. Parse front-matter — extract `confidence`, `written_at`, `surfaced_in_systems`
2. If `confidence === 'low'` AND `age > 30 days` AND `surfaced_in_systems.length < 2` → archive
3. Archive = move to `{BUS_ROOT}/patterns/archive/{filename}` with three new front-matter fields:
   - `archived_at: {ISO timestamp}`
   - `archive_reason: 'confidence=low for N days without a second system confirming'`
   - `status: archived`
4. Atomic write (tmp + rename) before deleting the original

## Step 2 · Log the run

Append to `{BUS_ROOT}\apex-runs.log`:
```
{ISO-timestamp} · pattern-curation · scanned={candidate_count} candidates={candidates meeting age+confidence criteria} archived={archived_count}
```

Use atomic write for the log append: read existing content, append new line, write to `.tmp`, rename.

## Step 3 · Report

Surface the result in chat:
- How many patterns were scanned
- How many were candidates (low confidence, >30 days, single system)
- How many were archived (with filenames)
- Any errors encountered

If `archived_count === 0` and `candidate_count > 0`, that's normal — it means all patterns either have sufficient confidence or cross-system confirmation. Note this explicitly.

## Rules

1. **All writes to SharePoint bus** — same rules as the daily-enrichment-pipeline. Never write to `C:\Dylan PM\shared-growth-memory\`.
2. **Atomic writes** — tmp + rename for every file write.
3. **Halt on missing BUS_ROOT** — abort, don't fall back.
4. **No patterns younger than 30 days get touched** — this is a safety invariant.
5. **OneDrive conflict detection** — if conflict files exist in `patterns/`, log `conflicts=N` in the run log.
6. **Malformed front-matter** — log error, leave the file alone. Don't delete or move files you can't parse.
