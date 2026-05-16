# Bus → SharePoint move · runbook

The shared-growth-memory bus is currently at `C:\Dylan PM\shared-growth-memory\` on Dylan's machine — only the dashboard can read/write it. To make it accessible to the whole team (Claudia's tool, each rep's Claude Code), it needs to live in a SharePoint folder that OneDrive syncs to every team member's machine.

## Where it should live

**SharePoint location** (recommended, subject to Claudia's sign-off):

```
Claude Code Projects/shared-growth-memory/
```

This sits parallel to Claudia's `Claude Code Projects/Storm Boy Claude Tool/` — every rep already has the parent folder syncing via OneDrive.

**OneDrive local path** on each rep's machine will resolve to something like:

```
C:\Users\<windows-user>\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory\
```

## What's in it (snapshot from 2026-05-13)

```
shared-growth-memory/
├── README.md                            ← bus contract + storage topology
├── INTEGRATION-FOR-CLAUDIA.md           ← integration guide for her tool
├── sales-motion-separation.md           ← two-motion principle (read first)
├── schemas/                             ← pattern · deal-signal · probe-outcome · customer-position
├── patterns/                            ← 4 captured patterns (learnings)
├── deal-signals/                        ← 12 live deal signals (one per active deal)
├── customer-positions/                  ← (empty — for Claudia's writes)
├── probe-outcomes/                      ← (empty — for action records from both systems)
├── team-brain/                          ← profiles + distillates
│   ├── README.md
│   ├── ask-team-skill-template.md
│   ├── profiles/ (hobbs · ben · claudia · will)
│   └── distillates/ (hobbs-farm-visits · hobbs-calls)
└── queues/                              ← per-rep work-card queues (nightly)
    ├── INDEX.json
    ├── ben/work-cards.json
    ├── hobbs/work-cards.json
    ├── dylan-jones/work-cards.json
    └── harrison-inactive/work-cards.json
```

## Move steps

Once Claudia confirms the SharePoint location, run these in order:

### Step 1 — Make sure OneDrive is syncing the parent folder

On Dylan's machine, check that `Claude Code Projects/` (under the AgriProve SharePoint) is set to "Always keep on this device." This avoids the bus disappearing from disk on a sync clean-up.

Right-click the folder in File Explorer → **"Always keep on this device."**

### Step 2 — Copy the bus contents into the SharePoint folder

PowerShell (or Git Bash) one-liner:

```powershell
$dest = "$env:USERPROFILE\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
robocopy "C:\Dylan PM\shared-growth-memory" $dest /E /XO /R:2 /W:2
```

`robocopy` with `/XO` (skip-older) is idempotent and re-runnable. Don't worry about re-running it; only changed files get copied.

### Step 3 — Update `.env`

In `C:\Dylan PM\stormboy-tracker\.env`, set:

```
BUS_PATH=C:\Users\DylanCronje\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory
```

(Adjust the username if your OneDrive resolves under a different user folder.)

### Step 4 — Restart the dashboard

```powershell
# kill the existing server (find PID from netstat or Task Manager) then:
cd "C:\Dylan PM\stormboy-tracker"
node server.js
```

Server log should now say it's writing to the SharePoint-synced path. The next scheduler fire (daily 05:00 SAST) will write all updates into the synced folder.

### Step 5 — Verify sync from Claudia's machine

Get Claudia to navigate to her local `Claude Code Projects/shared-growth-memory/` folder and confirm she can see the same files. Test write from Dylan's side (e.g., touch a test file in `patterns/`) and confirm it appears on Claudia's side within ~1 minute.

### Step 6 — Decommission the local bus

Once verified, the local `C:\Dylan PM\shared-growth-memory\` is redundant. Two options:

a) **Delete it** — clean break, no duplicate maintenance
b) **Rename to `shared-growth-memory.local-backup`** — keep as offline snapshot for ~1 week, then delete

Lean toward (a) once sync is confirmed working for a few days.

### Step 7 — Announce in the Stormboy Deals Teams channel

Tell the team the bus is live in SharePoint and how to use it:
- Reps' Claude Code tool will start reading their queue file from `~\Claude Code Projects\shared-growth-memory\queues\<their-slug>\work-cards.json`
- Anyone running `/ask-team` (once Claudia ships the skill) hits the synced brain

## What can go wrong

| Risk | Mitigation |
|---|---|
| OneDrive sync delay > 5 min on a slow connection | Atomic write protects readers; just means stale data, not corruption |
| Two systems writing the same file at the same time | OneDrive keeps both as conflict copies. File-per-entity scheme + slug naming makes this rare. Manual merge if it occurs. |
| Rep doesn't have OneDrive sync configured | Cannot use queue file. They fall back to the dashboard. No silent failure. |
| Path contains spaces — Node treats it as one path (no quoting issue) | Already handled in `engine/shared-bus.js` and `engine/scheduler.js`. |
| OneDrive offline | Bus reads/writes fall back to the locally cached copy. Sync resumes on reconnect. |

## What this unlocks

Once the move is done:

1. **Claudia's tool can read the team brain** — feed it into `/ask-team` skill, or to power objection lookups inside `call-admin/`.
2. **Each rep's Claude Code can read their own queue** — `~\Claude Code Projects\shared-growth-memory\queues\<rep-slug>\work-cards.json` is their morning briefing surface.
3. **Bidirectional learning is live** — Claudia's tool writes patterns to `shared-growth-memory/patterns/` per the schema; the dashboard reads them on next ASK or refresh.
4. **The system is portable** — Dylan's machine isn't a single point of failure. The bus survives independently of any one workstation.

## Cross-references

- `shared-growth-memory/README.md` — full bus contract
- `shared-growth-memory/INTEGRATION-FOR-CLAUDIA.md` — Claudia's tool integration
- `shared-growth-memory/team-brain/README.md` — brain contract specifically
- `stormboy-tracker/briefings/to-claudia-system-context-2026-05-13-update.md` — what's changed for her
