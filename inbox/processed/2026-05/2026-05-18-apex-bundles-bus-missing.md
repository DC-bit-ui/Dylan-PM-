# Intelligence Bundle Processor — BUS_ROOT Missing

**Date:** 2026-05-18
**Task:** process-intelligence-bundles (scheduled, every 2h)
**Status:** ABORTED

## Error

BUS_ROOT path is not accessible in this Cowork session:

```
C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

The SharePoint-synced folder is not connected as a workspace directory. The Read tool returned:

> `C:\Users\DylanCronje\AgriProve\...` is outside this session's connected folders.

This is the same root cause as the daily-enrichment-pipeline abort earlier today (`2026-05-18-apex-bus-path-missing.md`).

## What was NOT done

Per the HALT CHECK rule in the task SKILL.md:
1. Did NOT create the directory
2. Did NOT process any intelligence bundles
3. No results were written anywhere

## Resolution

The SharePoint-synced folder must be added as a connected directory in Cowork for any bus-dependent scheduled task to run. Options:

- **Option A (recommended):** Add the folder in Cowork → Project → Settings. Path: `C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory`
- **Option B:** Set `$env:BUS_PATH` environment variable before scheduled tasks fire
- **Option C:** Verify OneDrive sync status if the folder has moved

## Note

This will recur every 2 hours until BUS_ROOT is connected. All queued intelligence bundles remain untouched in `intelligence-bundles/` on the bus — no data loss, just delayed processing.
