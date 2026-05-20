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
     — **strip the YAML frontmatter before sending** (Cowork auto-prepends frontmatter from task metadata; sending the full file produces doubled frontmatter). See [`memory/learnings/2026-05/2026-05-20-cowork-deploy-no-frontmatter.md`](../../../memory/learnings/2026-05/2026-05-20-cowork-deploy-no-frontmatter.md).
   - Record the deploy in `PROVENANCE.md`

2. **Verify after every pull.** When a `SKILL.md` is pulled from Cowork's `uploads/` snapshot (e.g. when bringing a new task into the repo), run `VERIFY.md` from a Cowork session before treating the repo file as source of truth. Snapshots from `uploads/` may be stale.

3. **Patch queue lives in PROVENANCE.md.** Surfaced patches (from audits, retros, decisions) sit in the patch queue until they're applied as a single commit + deploy. Don't half-apply.

4. **Snapshots are proof, not source.** The `uploads/SKILL.md` files on disk are useful for initial pull and as a comparison anchor — but they're never the source of truth once a task has a repo folder. The repo wins.

## Active tasks (as of 2026-05-20)

> **⚠️ Snapshot-date semantics:** the "Last edit" column below shows when each SKILL.md was last *edited* (the uploads/ snapshot only re-materialises on prompt changes), NOT when the task last *fired*. Do not infer firing failures from old snapshot dates. See [`memory/learnings/2026-05/2026-05-20-cowork-uploads-snapshot-semantics.md`](../../../memory/learnings/2026-05/2026-05-20-cowork-uploads-snapshot-semantics.md).

| Task | Domain | Last edit | Status |
|------|--------|-----------|--------|
| daily-enrichment-pipeline | Team Bus | 2026-05-18 | Pulled · 4 patches applied (Prompt A will deploy) |
| apex-morning-briefing | Personal PM | 2026-05-20 | Pulled |
| apex-eod-reconciliation | Personal PM | 2026-04-29 | Pulled · **cron expression wrong** — fires at 04:00 SAST instead of 17:30 SAST. Fix in PROVENANCE.md. |
| process-intelligence-bundles | Team Bus | 2026-05-19 | Pulled · queue jammed (80 pending, 0 results — confirmed by daily-enrichment audit, not by snapshot date) |
| career-signal-capture | Career | 2026-05-12 | Pulled · firing status TBD via Prompt C |
| career-weekly-promote | Career | 2026-05-12 | Pulled · should reference promoted career-sanitiser path after Tier 1 Skill 2 |
| career-audit-digest | Career | 2026-05-12 | Pulled |

**Retired:** `daily-briefing` — confirmed stub ("TBD" body, 0.1 KB). Superseded by `apex-morning-briefing`. Skip; can delete from Cowork.

## Hot signals from the pull (corrected 2026-05-20 after Prompt B response)

1. **apex-eod-reconciliation cron is wrong** — task IS firing daily, but at 04:00 SAST (before workday) instead of 17:30 SAST (true EOD). It reconciles nothing today's-work because today hasn't happened yet. Pending fix: change cron from `0 12 * * 1-5` to `30 1 * * 2-6`. See task's PROVENANCE.md.
2. **process-intelligence-bundles is queue-jammed** — 80 bundles pending, 0 in `results/`. Confirmed by daily-enrichment audit "scanned=0" evidence (independent of snapshot date). Expected to clear after junction install + bus-path fix on next bundle-processor run.
3. **Career portfolio firing status TBD** — three career tasks last *edited* on signoff day 2026-05-12. Whether they're actually firing as scheduled is unconfirmed; Prompt C will tell.

## Related

- Standing rule documented in `CLAUDE.md` §6 and `COWORK.md` (forthcoming, Tier 0d)
- Surfacing audit that prompted this directory: 2026-05-20 daily-enrichment-pipeline audit (in conversation, not yet routed to memory/)
