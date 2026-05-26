# Install — Ben's work-insights Claude bootstrap

One-time setup. Takes ~3 minutes.

## Prerequisites

1. **Claude Code CLI installed** on Ben's laptop. If not yet: https://claude.com/claude-code
2. **OneDrive sync running** for the AgriProve workspace. Verify by opening File Explorer and looking for `OneDrive - AgriProve`. If not visible: sign into OneDrive with `ben@agriprove.io`.
3. **Bus folder shared with Ben**. The shared folder is at `Claude Code Projects/shared-growth-memory/` inside the AgriProve workspace. If you can't see it: ping Dylan, he'll re-share.

## Step 1 — Copy the bootstrap folder to your local desktop

Don't run Claude Code against the OneDrive-synced bootstrap folder directly — OneDrive locking can cause weirdness. Copy this entire folder (`ben-bootstrap/`) to somewhere on your local drive:

```
Suggested: C:\Users\<your-windows-user>\ben-work-insights\
```

You only need:
- `CLAUDE.md`
- `INSTALL.md` (this file)
- `README.md`

## Step 2 — Verify the bus path resolves

Open PowerShell. The bus should be discoverable at:

```powershell
$busRoot = if ($env:OneDriveCommercial) { $env:OneDriveCommercial }
          elseif ($env:OneDrive) { $env:OneDrive }
          else { "$env:USERPROFILE\OneDrive - AgriProve" }
$busPath = Join-Path $busRoot "Claude Code Projects\shared-growth-memory"
Test-Path $busPath
```

Expected: `True`. If `False`, OneDrive hasn't finished syncing yet — give it a few minutes, then re-run.

Sanity-check that Ben's queue actually exists:

```powershell
Test-Path (Join-Path $busPath "queues\ben\work-cards.json")
```

Expected: `True`. If `False`, the dashboard hasn't generated Ben's queue yet — ping Dylan.

## Step 3 — Open Claude Code in the bootstrap folder

```powershell
cd C:\Users\<your-windows-user>\ben-work-insights\
claude
```

Claude will read `CLAUDE.md` automatically (that's the convention). It'll resolve the bus path and read `INSTRUCTIONS-FOR-BEN.md` from the bus before answering anything.

## Step 4 — Ask your first question

```
> Who should I follow up with today?
```

Claude will read `queues/ben/work-cards.json`, sort by heat, and surface the top 5 with rationale.

## Optional — Pin the bus path

If auto-discovery isn't resolving (e.g., your OneDrive is at a non-standard path), set the env var explicitly. Add this line to your Windows User environment variables (search "Edit the system environment variables" → User variables → New):

```
Name:  BUS_PATH
Value: C:\Users\<your-windows-user>\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory
```

Restart Claude Code after setting. Claude will use `BUS_PATH` if present, ahead of auto-discovery.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Claude says bus path not found | OneDrive not synced, or folder not shared | Open File Explorer, look for `OneDrive - AgriProve\Claude Code Projects\shared-growth-memory`. If missing, ping Dylan. |
| `queues/ben/work-cards.json` is missing | Apex hasn't run yet today | Check `apex-runs.log` last line. If >36h old, ping Dylan. |
| Claude gives generic advice instead of reading the queue | `CLAUDE.md` not in working dir | `pwd` to confirm you're in the bootstrap folder, then restart Claude. |
| Want to log a correction | Tell Claude *"log a correction for [deal/contact]: [text]"* | Claude writes to `<busRoot>/feedback/feedback-<id>.json` atomically. Dashboard reads it within ~1 minute. |

## What's next

After a week of using it: tell Dylan what's missing or wrong. The friction you hit is the most valuable signal — every correction makes the next week's queue sharper.
