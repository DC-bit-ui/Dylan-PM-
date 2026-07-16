# Daily Enrichment Pipeline — BUS_ROOT Missing → RESOLVED ON RETRY

**Date:** 2026-05-20
**Task:** `daily-enrichment-pipeline` (scheduled)
**Status:** Initially aborted at Step 0 halt check, then **completed successfully on retry**.
**Run:** Confidence [high] that the initial issue was a transient mount-access state, not folder existence.

## Retry resolution

After an MCP server disconnect/reconnect event mid-run, the SharePoint folder became accessible to the session's file tools (Write succeeded on the same path that had failed minutes earlier). The pipeline ran to completion on retry. See the new `apex-runs.log` entry dated `2026-05-20`.

**Implication:** the BUS_ROOT mount state is not stable across an unattended scheduled run. Recommend the symlink fix below as the durable solution, since the access state cannot be relied on. The original abort report follows for completeness.

---

## What happened

The SharePoint-synced bus directory exists on the Windows filesystem (confirmed via Glob — all four required READMEs found at the expected paths), but it is **not accessible from this Cowork session**.

Expected BUS_ROOT (per SKILL.md):

```
C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

Both the Read and Write file tools return:

> `...shared-growth-memory\...` is outside this session's connected folders, so Read/Write can't reach it. If this is a user project or working folder, request it with the `request_cowork_directory` tool — the user will be asked to approve it.

This is a scheduled (unattended) run, so `request_cowork_directory` would block on user approval and is not viable.

## Why

The Cowork sandbox only mounts the folder selected in Project settings (`C:\Dylan PM` → `/sessions/.../mnt/Dylan PM`). The SharePoint-synced growth memory bus lives under the AgriProve OneDrive/SharePoint tree at a separate Windows location, which is not included in this session's connected folders.

Per SKILL.md Rule 1 (non-negotiable): NEVER write to `C:\Dylan PM\shared-growth-memory\` — that is historical archive only. So I cannot fall back to the local path even though it is writable.

## Precedent

This is the **third reported abort** for the same root cause:
- `2026-05-18-apex-bus-path-missing.md` (intelligence-bundles)
- `2026-05-18-apex-bundles-bus-missing.md` (intelligence-bundles)
- `2026-05-19-apex-bundles-bus-missing.md` (intelligence-bundles)

Note: `apex-runs.log` shows a successful `daily-enrichment-diff` run on 2026-05-19 — that run wrote to `C:\Dylan PM\shared-growth-memory\` (the now-deprecated local path). If those writes happened *under the current SKILL.md spec*, that previous run violated Rule 1. If the SKILL.md was updated after that run, then today's halt is the first enforcement.

## Resolution options (in order of effort)

1. **Symlink** (cheapest) — in an elevated PowerShell on the Windows host, run:
   ```powershell
   mklink /D "C:\Dylan PM\shared-growth-memory-bus" "C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory"
   ```
   Then update SKILL.md Step 0 to resolve BUS_ROOT to `C:\Dylan PM\shared-growth-memory-bus`. No Cowork config change needed.

2. **Add SharePoint folder as a second connected folder** in Cowork → Project → Settings. Mounts it alongside `C:\Dylan PM`. Requires the SharePoint path to be a valid Cowork-mountable directory.

3. **Set `$env:BUS_PATH`** if Cowork's scheduled task runner honours env overrides (SKILL.md mentions this as an override path).

Option 1 is the lowest-friction fix and removes the recurring abort for both this pipeline and the intelligence-bundles processor.

## What was NOT done

- No data fetched from HubSpot, Confluence, Teams, Granola, or SharePoint.
- No files written to any bus location (SharePoint or local).
- No entry appended to `apex-runs.log` (since that file itself lives under BUS_ROOT).
- Task list created in Cowork was halted at task #1 (`Read READMEs and persona-registry`) when the BUS_ROOT inaccessibility was confirmed.

## Next run

If the mount/symlink fix is applied, the next scheduled run should proceed normally. The lookback heuristic (seed vs diff) will read `apex-runs.log` at the new path — since that file may be empty/missing on the SharePoint side after the migration, the next run will likely operate in **seed mode (30-day lookback)** to backfill.
