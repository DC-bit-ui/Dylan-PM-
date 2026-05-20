# Cowork-scheduled SKILLs — source of truth

This directory is the **canonical source of truth** for the task_prompt of every Cowork scheduled task that runs against Dylan's machine.

## Why this exists

Cowork stores scheduled-task prompts opaquely in its task-definition store. The runtime copy materialised into the session's `uploads/SKILL.md` is ephemeral — overwritten on every invocation. Without a repo-side copy:

- Every prompt change happens invisibly (no diff, no review, no blame)
- The "commission docs" in `inbox/cowork/` are intent specs, not the actual prompt that runs
- Drift between intent and runtime is undetectable
- Production behaviour cannot be audited

This directory makes Cowork orchestration version-controlled.

## The convention

```
.claude/skills/cowork-scheduled/
├── README.md                              ← this file
├── <task-name>/
│   ├── SKILL.md                          ← canonical task_prompt, verbatim
│   ├── PROVENANCE.md                     ← where pulled from, verification, patch queue, deploy log
│   └── VERIFY.md                         ← Cowork prompt that diffs SKILL.md against the canonical task store
```

Each scheduled task gets one folder. The `SKILL.md` filename matches what Cowork materialises into `uploads/SKILL.md` at run start — Claude Code reads from this folder; Cowork reads from its own store. The two are kept in sync via the deploy flow below.

## The contract

1. **Edit-in-repo, deploy-via-MCP.** Never edit a scheduled-task `task_prompt` directly in Cowork chat. Always:
   - Edit `SKILL.md` here
   - Commit the change to git (PR if non-trivial)
   - Deploy via `mcp__scheduled-tasks__update_scheduled_task` from a Cowork session
   - Record the deploy in `PROVENANCE.md`

2. **Verify after every pull.** When a `SKILL.md` is pulled from Cowork's `uploads/` snapshot (e.g. when bringing a new task into the repo), run `VERIFY.md` from a Cowork session before treating the repo file as source of truth. Snapshots from `uploads/` may be stale.

3. **Patch queue lives in PROVENANCE.md.** Surfaced patches (from audits, retros, decisions) sit in the patch queue until they're applied as a single commit + deploy. Don't half-apply.

4. **Snapshots are proof, not source.** The `uploads/SKILL.md` files on disk are useful for initial pull and as a comparison anchor — but they're never the source of truth once a task has a repo folder. The repo wins.

## Active tasks (as of 2026-05-20)

| Task | Domain | Last fired | Status |
|------|--------|-----------|--------|
| daily-enrichment-pipeline | Team Bus | 2026-05-20 | Pulled · 4 patches queued in PROVENANCE |
| apex-morning-briefing | Personal PM | 2026-05-20 | Pulled |
| apex-eod-reconciliation | Personal PM | **2026-04-29** | Pulled · **may not be firing** — investigate |
| process-intelligence-bundles | Team Bus | 2026-05-19 | Pulled · queue jammed (80 pending, 0 results — bus-path blocker) |
| career-signal-capture | Career | 2026-05-12 | Pulled · check Friday firings since signoff |
| career-weekly-promote | Career | 2026-05-12 | Pulled · should reference promoted career-sanitiser path after Tier 1 Skill 2 |
| career-audit-digest | Career | 2026-05-12 | Pulled |

**Retired:** `daily-briefing` — confirmed stub ("TBD" body, 0.1 KB). Superseded by `apex-morning-briefing`. Skip; can delete from Cowork.

## Hot signals from the pull

The proof-by-execution pull surfaced three issues that didn't come out in the original audit:

1. **apex-eod-reconciliation last fired 2026-04-29** — three weeks of missed EOD runs if true. Either the task is disabled, the cron expression is wrong, or the snapshot timestamp is misleading.
2. **process-intelligence-bundles is queue-jammed** — 80 bundles pending, 0 in `results/`. Tied to the same bus-path mount race that daily-enrichment hit.
3. **Career portfolio cadence unclear** — three career tasks last fired on compliance signoff day (2026-05-12). The Friday 2026-05-15 weekly promote + audit digest may or may not have run.

These need a separate verification pass.

## Related

- Standing rule documented in `CLAUDE.md` §6 and `COWORK.md` (forthcoming, Tier 0d)
- Surfacing audit that prompted this directory: 2026-05-20 daily-enrichment-pipeline audit (in conversation, not yet routed to memory/)
