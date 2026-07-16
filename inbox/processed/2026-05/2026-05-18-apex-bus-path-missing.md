# Daily Enrichment Pipeline — BUS_ROOT Missing

**Date:** 2026-05-18
**Task:** daily-enrichment-pipeline (scheduled)
**Status:** ~~ABORTED~~ → **RESOLVED** — pipeline re-ran successfully in the same session. See `apex-runs.log` entry `2026-05-18T03:51:48Z`.

## Error

BUS_ROOT path is not accessible in this Cowork session:

```
C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

The SharePoint-synced folder is not connected as a workspace directory. The Glob tool returned:

> `C:\Users\DylanCronje\AgriProve\...` is outside this session's connected folders.

## What was NOT done

Per the HALT CHECK rule in the pipeline SKILL.md:
1. Did NOT create the directory
2. Did NOT fall back to `C:\Dylan PM\shared-growth-memory\` (historical archive only)
3. No enrichment data was written anywhere

## Resolution

To fix for next run, one of:
- **Option A (recommended):** Add the SharePoint-synced folder as a connected directory in Cowork → Project → Settings. Path: `C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory`
- **Option B:** Set `$env:BUS_PATH` environment variable to the correct path before the scheduled task fires
- **Option C:** If the SharePoint sync is broken or the folder moved, verify OneDrive sync status for the "AgriProve - Documents" library

## Note

All source connectors (HubSpot, Confluence, Teams, Granola, SharePoint) were available — the pipeline would have run successfully if BUS_ROOT were accessible.
