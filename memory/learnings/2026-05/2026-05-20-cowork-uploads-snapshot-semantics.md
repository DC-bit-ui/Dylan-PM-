---
date: 2026-05-20
source: Cowork diagnostic response to Prompt B (apex-eod-reconciliation investigation)
tags: [cowork, scheduled-tasks, observability, snapshot-semantics]
---

# Cowork uploads/ snapshot timestamps reflect last edit, not last fire

## The trap

When Cowork's scheduled-task runner materialises a task's `task_prompt` into the session's `uploads/SKILL.md` directory, it does so **only when the prompt changes** — not on every invocation. The on-disk timestamp of the snapshot file therefore tracks **last prompt edit**, NOT **last task fire**.

I fell into this trap on 2026-05-20 while inventorying the 7 Cowork scheduled tasks (Tier 0 pull). I read the `uploads/SKILL.md` file timestamps, assumed they tracked firing, and surfaced three "hot signals" — `apex-eod-reconciliation last fired 2026-04-29`, `career-* last fired 2026-05-12`, etc. The Prompt B diagnostic showed the EOD task IS firing daily; its SKILL.md just hasn't been edited since 2026-04-29.

## What this means in practice

| Wrong inference | Right inference |
|---|---|
| Snapshot dated 2026-04-29 → task hasn't fired in 3 weeks | Snapshot dated 2026-04-29 → SKILL.md was last edited 2026-04-29; firing status independent |
| Old snapshot = stuck/disabled task | Old snapshot = stable prompt + actively firing |

## How to actually check fire status

When you need to know whether a Cowork scheduled task is firing as expected:

1. **Live query:** `mcp__scheduled-tasks__list_scheduled_tasks` from a Cowork session, look at `last_run_at` and `next_run_at`. This is the authoritative source.
2. **Output evidence:** Glob for the artefacts the task is supposed to write — for EOD that's `memory/retros/session/<date>-eod.md` or `<date>-apex-eod.md`. For daily-enrichment that's writes under `<BUS_ROOT>/{deal,contact,persona}-supplements/<id>/...-{YYYY-MM-DD}.{md,json}`. For career-signal-capture that's entries in the personal Notion workspace.
3. **Git evidence:** for tasks that commit, `git log --since=<date> --grep=<task-name>`.
4. **Heartbeat logs:** `apex-runs.log` for the team-bus tasks. Tail it.

## How to flag this in PROVENANCE.md

PROVENANCE.md's "Verification status" section should NOT phrase the date as "last fired"; phrase it as "last edit" with an explicit caveat. Add a separate field for actual firing status if needed, sourced from one of the four methods above.

Template:
```markdown
## Verification status

- [x] **Proof-by-execution:** SKILL.md last edited <date>. Actual firing status:
      <verified via …> — fires at <cadence>, last observed <date+source>.
- [ ] **Diff against canonical task_prompt** — not feasible from Claude Code.
```

## Related

- Original misinterpretation: `.claude/skills/cowork-scheduled/README.md` "Hot signals" section (corrected 2026-05-20).
- Actual EOD diagnostic: live Cowork response to Prompt B, 2026-05-20.
- Real EOD bug found: cron expression `0 12 * * 1-5` (= 04:00 SAST) should be `30 1 * * 2-6` (= 17:30 SAST). See `.claude/skills/cowork-scheduled/apex-eod-reconciliation/PROVENANCE.md`.
