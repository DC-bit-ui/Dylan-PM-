# Intelligence Bundle Processor — BUS_ROOT Missing

**Date:** 2026-05-19
**Task:** `process-intelligence-bundles` (scheduled)
**Status:** ABORTED

## What happened

The SharePoint-synced bus directory is not accessible from this Cowork session. The expected path:

```
C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

This folder is not mounted in the Linux sandbox. Only `C:\Dylan PM` (→ `/sessions/.../mnt/Dylan PM`) is available.

## Why

Cowork's sandboxed environment only has access to the folder selected in the Project settings (`C:\Dylan PM`). The SharePoint-synced growth memory bus lives under the AgriProve OneDrive/SharePoint tree, which is a separate mount point not included in this session.

## Resolution options

1. **Add the SharePoint folder as a second connected folder** in Cowork → Project → Settings. This would mount it alongside `C:\Dylan PM`.
2. **Set `$env:BUS_PATH`** if Cowork supports environment variables for scheduled tasks.
3. **Symlink** `C:\Dylan PM\shared-growth-memory` → the SharePoint path (Windows mklink /D), so the bus is reachable under the existing mount.

Option 3 is simplest and doesn't require Cowork config changes — a single `mklink /D` in an elevated PowerShell prompt.
