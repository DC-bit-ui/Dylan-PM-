---
name: monday-token-overrun-analysis
date: 2026-05-27
type: learning
tags: [scheduled-tasks, apex, cowork, token-budget, system-hygiene]
source: in-session prompt from Dylan + general-purpose subagent audit of 14 scheduled-task SKILL.md files + live mcp__scheduled-tasks__list_scheduled_tasks
confidence: high (for the audit findings); moderate (for absolute token estimates — buckets are reliable, exact numbers are directional)
---

# Monday token overrun — root cause + standing rule

## What happened

Dylan flagged that Cowork sessions run out of tokens every Monday. Investigation traced the cause to **scheduled-task concentration on Monday**: 6 tasks fire on a normal Monday, 7 on the first Monday of the month, with two XL-bucket tasks (`daily-enrichment-pipeline`, `apex-morning-briefing`) firing 10 minutes apart at 04:53 and 05:03 SAST. One task was confirmed zombie: `persona-supplements-refresh` (self-declared superseded but still enabled M/W/F). A second SKILL.md `daily-briefing` exists as an orphan stub in the repo but is NOT registered in the live scheduler — it's dead inventory, not contributing load. (Note: `apex-eod-reconciliation` does NOT fire on Monday itself — cron `30 1 * * 2-6` means it runs Tue–Sat. It contributes to Tuesday's session, not Monday's.)

## Standing rule emerging from this

**Quarterly system review must include a scheduled-task census** comparing the live inventory from `mcp__scheduled-tasks__list_scheduled_tasks` against `.claude/skills/cowork-scheduled/` contents. Drift between "what is scheduled to run" and "what the canonical prompt says" is a recurring failure mode — `persona-supplements-refresh` had been documented as superseded for weeks while still firing.

Concrete checks to add to the quarterly review:
1. Is every enabled task in the scheduler reflected in `.claude/skills/cowork-scheduled/<task>/SKILL.md`?
2. Does any SKILL.md self-declare as superseded / deprecated / TBD while the task is still enabled?
3. Per task, do the connector pulls + prompt size justify the firing frequency?
4. What's the cumulative token weight per weekday? Any day over ~150k-equivalents is a Monday-style risk.

## Token-weight buckets — calibration

This audit used bucket estimates rather than exact counts. Calibration anchors for future audits:

- **XS:** <2k token-equivalents per run (e.g. `career-audit-digest`, `career-canary-reaudit`)
- **S:** 2–5k (e.g. `career-weekly-promote`)
- **M:** 5–15k (e.g. `career-signal-capture`, `persona-supplements-refresh`)
- **L:** 15–30k (e.g. `apex-eod-reconciliation`, `process-intelligence-bundles` on busy days)
- **XL:** 30k+ (e.g. `apex-morning-briefing`, `daily-enrichment-pipeline`)

A prompt's bucket is driven by three factors, in order: (1) connector pull breadth and lookback window, (2) write fan-out (per-record write loops are murder), (3) prompt size itself. Item (1) and (2) dominate; (3) is a secondary concern.

## Why these tasks must stay on their current cadence

Don't try to move the daily tasks off Monday:
- `apex-morning-briefing` — daily by definition. The Monday-specific load is the same as Tue–Fri at the prompt level.
- `apex-eod-reconciliation` — daily. Tuesday's reconciliation is Monday's EOD.
- `daily-enrichment-pipeline` — daily. Dashboard expects fresh enrichment each day.
- `process-intelligence-bundles` — drains the bundle queue. Queue producer (Frontier dashboard) generates work daily.
- `career-signal-capture` — daily by design per career-portfolio standing decision.

The fix is per-run token reduction (lean prompts, externalised references, write rollups), not redistribution of cadence.

## Cross-link

Full proposal: [`memory/deliverables/2026-05-27-scheduled-task-token-optimisation.md`](../../deliverables/2026-05-27-scheduled-task-token-optimisation.md)

Related standing decisions:
- `memory/decisions/2026-05-20-cowork-deploy-no-frontmatter.md` (Cowork scheduled-task workflow) — referenced in CLAUDE.md §6.3
- [`2026-05-21-skill-md-onedrive-truncation.md`](2026-05-21-skill-md-onedrive-truncation.md) — related risk re: SKILL.md sync hygiene
- [`2026-05-22-apex-teams-blind.md`](2026-05-22-apex-teams-blind.md) — Apex Teams scanning method, relevant to channel-inventory consolidation

## Action carried forward

Verification gates Mon–Fri (per Dylan's "carry across the week" choice):
- Wed 2026-05-27 (today): zombies disabled, audit captured
- Thu 2026-05-28: Teams channel inventory externalised in 3 SKILL.md files
- Fri 2026-05-29: post-deploy load measurement
- Mon 2026-06-01: verify normal-Monday holds (this was the original failure mode)
- Tue 2026-06-02: if Mon held, ship P1 layer (Granola collapse + memory rotation); if not, debug
