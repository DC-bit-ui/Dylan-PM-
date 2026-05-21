---
date: 2026-05-21
source: Cowork response to apex-eod-reconciliation cron fix prompt, 2026-05-21
revised: 2026-05-21 — root-cause hypothesis WRONG (see verification at bottom)
tags: [infrastructure, git, onedrive, defender, claude-code]
severity: moderate-recurring
---

# Windows real-time scanning interference — NOT OneDrive

> **RETRACTION 2026-05-21:** The original framing of this learning attributed the corruption to OneDrive. Verification ran 2026-05-21 (`memory/jobs/76c4d1c9/verify-onedrive.ps1` — actually the inline tests) proved `C:\Dylan PM\` is NOT under any OneDrive sync root, not a junction, not a reparse point, and its files carry no cloud-sync attributes. **OneDrive is innocent.** Likely actual cause: Microsoft Defender real-time scanning (running, repo not excluded). The original analysis below is preserved for the symptom catalogue; the fix is Defender exclusion, not migration.

## The trap

The Dylan PM repo lives at `C:\Dylan PM\`, which is inside a folder OneDrive actively syncs. Three distinct failure modes have surfaced in three days:

1. **`.git/index.lock` held by external process.** Git creates the lockfile during `add`/`commit`/`merge`; OneDrive (or another sync agent) opens or holds it for inspection, preventing git from removing it cleanly. Cowork's sandbox cannot `rm` the file ("Operation not permitted"). The user must clear it manually from PowerShell.
   - 2026-05-20: blocked Cowork's Prompt A deploy commit; commit rescued from staged limbo as `0cd21f9`.
   - 2026-05-21: blocked Cowork's cron-fix deploy commit; rescued as `ead742c`.

2. **Working-tree file truncation.** Cowork's 2026-05-21 cron-fix run found `PROVENANCE.md` on disk at 1299 bytes, truncated mid-line, while `git show HEAD:…` returned the full 2722-byte content. The truncation pre-dated Cowork's session — almost certainly a OneDrive partial-sync write that left the working tree in an invalid state. Cowork worked around it by rebuilding from `git show HEAD:` + intended edits and writing atomically (`.tmp` + `mv`).

   **Update 2026-05-21 (incident #4):** Cowork's Prompt F deploy session hit the same truncation pattern on BOTH `daily-enrichment-pipeline/SKILL.md` (truncated at "Never write withou") and `weekly-system-retro/SKILL.md` (truncated at "probes_created={"). HEAD was clean (444 lines / 115 lines respectively), working tree was missing ~30 lines from each. **Cowork halted on hash-check, refusing to deploy a truncated prompt** — correct behaviour. By the time Dylan re-checked ~15 minutes later, OneDrive had resynced and the files were intact again. **The corruption is transient AND self-healing**, which is in some ways worse than persistent corruption: tools that read mid-sync see broken state, but a later `git status` shows clean. Migration urgency now critical — this is the 4th distinct incident.

3. **Sandbox cannot delete files in OneDrive-synced paths.** Even when Cowork's session has the connected-folder grant, it can only create + read + append to OneDrive-synced files, not delete or rename. This breaks any tooling that expects standard POSIX file semantics (including git itself for lock cleanup).

## Why these happen

OneDrive's sync client treats the `.git/` directory the same as any other folder: it watches for changes, syncs them, and may hold files open during sync verification. Git's lockfile dance was designed for local-only filesystems, not networked sync. Even the working-tree files (large markdown, big diffs) can be mid-sync when a tool reads them.

## Options

### A — Move `C:\Dylan PM\` out of OneDrive (recommended)
Relocate the working tree to a non-synced path (e.g. `C:\dev\Dylan PM\` or `C:\Users\DylanCronje\Repositories\Dylan-PM\`). Keep the SharePoint-synced bus at the existing SharePoint path via the junction (already installed). The repo lives off OneDrive; the bus stays on OneDrive — separation of concerns.

**Pros:**
- Eliminates all three contention modes
- Git semantics work normally
- Cowork's connected-folder grant works the same after pointing at the new path
- No cloud-backup loss for the repo (use GitHub as the durable backup — that's already the model)

**Cons:**
- One-time migration cost (~30 min — clone fresh, update Cowork connected-folder setting, point shortcuts/scripts)
- Lose "auto-backup to OneDrive" of working-tree state — but the repo is already in GitHub, so this is redundant anyway

### B — Exclude `.git/` from OneDrive sync
Some OneDrive clients support per-folder sync exclusion (right-click → "Free up space" or via `Files-On-Demand` settings). Mark `.git/` as not-cached.

**Pros:**
- No path migration
- Working tree still gets sync (some marginal value as a personal backup)

**Cons:**
- Doesn't address working-tree truncation (issue 2)
- Doesn't address sandbox delete restrictions (issue 3)
- OneDrive UI for sync exclusion is fiddly and per-machine — easy to forget on a new device
- Doesn't survive OneDrive resync events

### C — Live with it (status quo)
Every Cowork prompt that commits to git must expect index.lock failure, surface the staged diff for the user, and stop. User commits from PowerShell as a last step.

**Pros:**
- Zero migration cost

**Cons:**
- Friction tax every deploy (3 incidents in 3 days)
- The truncation risk is real and silent — file edits can lose data
- Sandbox restrictions compound the friction
- Doesn't scale as scheduled-task automation grows

## Recommendation (REVISED 2026-05-21)

~~Option A — migrate out of OneDrive.~~ **Wrong.** Verification proved OneDrive is not syncing this path.

**Correct fix: exclude `C:\Dylan PM` from Microsoft Defender real-time scanning.** Run in elevated PowerShell:

```powershell
Add-MpPreference -ExclusionPath "C:\Dylan PM"
```

Then verify:
```powershell
(Get-MpPreference).ExclusionPath
```

If the contention disappears, hypothesis confirmed. If it persists, investigate Windows Search indexer next (`Control Panel → Indexing Options → Modify → uncheck C:\Dylan PM`).

## Verification log (2026-05-21)

| Test | Result | Inference |
|---|---|---|
| `(Get-Item "C:\Dylan PM").Attributes` | `Directory` only | Not a junction/symlink |
| `fsutil reparsepoint query` | "not a reparse point" | Confirms |
| OneDrive process | Running | Active but not relevant unless syncing the path |
| OneDrive mount points | OneDrive-AgriProve, OneDriveCloudTemp, AgriProve-Documents | `C:\Dylan PM` not among them |
| File attributes on `.git/index`, `CLAUDE.md`, etc. | `Archive` only | No cloud-sync flags |
| Defender RealtimeMonitoring | Enabled, repo not excluded | Most likely culprit |

The migration playbook is roughly:
1. Clone the GitHub repo to `C:\dev\Dylan PM\` (or wherever)
2. Copy any uncommitted local state from old `C:\Dylan PM\` (use `git status` + `git stash`)
3. In Cowork: Project Settings → Connected Folders → swap path (or add new + remove old)
4. Update any scripts that reference `C:\Dylan PM\` (search `playbooks/`, `.env` files, scheduled-task SKILL.md files for the literal path)
5. Move the junction `C:\Dylan PM\shared-growth-memory-bus` to the new path — or just create a new junction at the new repo root
6. Decommission old path: rename to `C:\Dylan PM.deprecated\` for a week, then delete

Bus stays on SharePoint via OneDrive as designed.

## Related

- `memory/learnings/2026-05/2026-05-20-cowork-deploy-no-frontmatter.md` — companion deploy-time learning
- `memory/learnings/2026-05/2026-05-21-cowork-uploads-incomplete-inventory.md` — companion inventory learning
- `.claude/skills/cowork-scheduled/apex-eod-reconciliation/PROVENANCE.md` — cron fix deploy log (the trigger for this learning)
- `inbox/cowork/2026-05-20-apex-bus-path-missing.md` — earlier related abort report
