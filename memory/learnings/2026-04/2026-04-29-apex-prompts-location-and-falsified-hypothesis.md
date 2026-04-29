# Apex Prompts Live in Cowork Per-Task Instructions Field — and the "Light Prompt" Hypothesis Is Falsified

**Date:** 2026-04-29
**Type:** correction + architecture
**Source:** Bootstrap-day deep dive on Cowork's Apex flows. Triggered by [`workspace/current/handoff-2026-04-29.md`](../../../workspace/current/handoff-2026-04-29.md)'s Phase 1 hypothesis. Resolved through three rounds of Cowork diagnostic + Dylan pasting the actual prompts.

---

## The two findings

### 1. Where the prompts actually live

Both `apex-morning-briefing` and `apex-eod-reconciliation` run with comprehensive, multi-step prompts (~80-100 lines each, covering all 6 connected systems, prioritisation logic, focus-area mapping, dedup, write-back rules, stale-cancellation policy, and an explicit output format).

**Those prompts live in the per-task `Instructions` field on each scheduled task in Cowork's UI.** Not in:
- `.claude/skills/<flow>/SKILL.md`
- `.claude/commands/`
- The Cowork project's project-level instructions
- Any file on disk in the repo

The diagnostic at [`../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md`](../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md) classified Morning + EOD as "[NO SKILL.md EXISTS]" — technically correct, operationally misleading. The diagnostic searched on-disk locations and the task description. It didn't probe the per-task `Instructions` field where the actual content lives.

**Implication:** the prompts are single-sourced in the Cowork UI with no version control. Dylan iterates on them directly (the "scan inbox/cowork/ and run /inbox-process" line at the bottom of the Morning prompt is direct evidence). Snapshots now live at [`../../integrations/cowork/`](../../integrations/cowork/). Capture a fresh dated snapshot whenever the prompt is materially edited — never overwrite.

**Decision (2026-04-29):** do NOT mirror prompts to `.claude/skills/`. Cowork doesn't load from there for scheduled runs; mirroring would create two sources of truth with no automatic sync. Repo is the version-control mirror; Cowork UI is the runtime source.

### 2. The "light prompt > heavy prompt" hypothesis was falsified

The prior session's handoff (§"Decisions made this session" item 5) hypothesised: *"Heavy prescription in Morning + EOD instructions may be over-constraining the model. 'Light prompt > heavy prompt' worth capturing as a learning if Daily Briefing's output validates it."*

The Daily Briefing sample [`../../../inbox/cowork/2026-04-29-daily-briefing-sample.md`](../../../inbox/cowork/2026-04-29-daily-briefing-sample.md) appeared to validate this — it ran on a "TBD" prompt and produced decent output. But:

- It produced **zero durable writes** (no Notion creates, no memory writes). The wrapper enforces "only write if the task file asks" — TBD doesn't ask.
- It missed **all the Apex-specific protocol** (no dual-stack, no 7-day Granola scan, no origin tags, no stale-cancellation check, no Tier 1 memory writes).
- Its Notion writes happened only because Dylan was in-session to direct them mid-run.

The decent surface output came from the **model's general capability** scanning all available connectors. It was *not* "good without instructions" — it was "competent default, missing the Apex-specific value entirely."

When Morning's actual prompt (and EOD's) was inspected, the heavy prescription is exactly what makes Apex *Apex*. Without it, you're paying for a scheduled run that produces a markdown digest no one durably consumes.

**Hypothesis: falsified.** Heavy prescription is load-bearing.

---

## The durable lesson

> **Don't validate a flow's design by examining output that was produced without the design loaded.**

Concretely: if you're trying to evaluate whether a heavy prompt is over-constrained vs an alternative, you have to compare *executions of the heavy prompt* against *executions of the alternative*, not against *executions where neither was loaded*. The TBD-instructed flow doesn't tell you anything about the heavy-instructed flow's necessity — it only tells you what the runtime defaults to.

This is the same anti-pattern as concluding "we don't need the safety check" from observing runs where the safety check never had any reason to fire.

---

## Operational consequences flowing from these findings

| What | Where it landed |
|---|---|
| Snapshot Morning prompt | `memory/integrations/cowork/apex-morning-briefing-prompt-2026-04-29.md` |
| Snapshot EOD prompt | `memory/integrations/cowork/apex-eod-reconciliation-prompt-2026-04-29.md` |
| Reconcile `cowork.md` (GitHub MCP claim, AEST/SAST timezone errors, EOD time) | done in commit `c956241` |
| Cron timezone fix (Cowork interprets in AEST, expressions written in SAST) | pending Dylan's UI execution: `45 12 * * 1-5` (Morning), `30 1 * * 2-6` (EOD) |
| Delete redundant `daily-briefing` flow | pending Dylan's UI execution |
| Bake observability into both prompts | pending — addendum drafted in conversation |
| Update CLAUDE.md / COWORK.md / project-instructions.md to reflect EOD = 17:30 SAST (not 12:00 SAST) | done in this commit |

---

## Cross-links

- [`../../integrations/cowork/apex-morning-briefing-prompt-2026-04-29.md`](../../integrations/cowork/apex-morning-briefing-prompt-2026-04-29.md)
- [`../../integrations/cowork/apex-eod-reconciliation-prompt-2026-04-29.md`](../../integrations/cowork/apex-eod-reconciliation-prompt-2026-04-29.md)
- [`../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md`](../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md) — the diagnostic that missed the prompts' location
- [`../../../inbox/cowork/2026-04-29-daily-briefing-sample.md`](../../../inbox/cowork/2026-04-29-daily-briefing-sample.md) — the degenerate sample that masqueraded as evidence for "light prompt > heavy prompt"
- [`../../../workspace/current/handoff-2026-04-29.md`](../../../workspace/current/handoff-2026-04-29.md) §"Decisions made this session" — the falsified hypothesis source

## Candidate for promotion

The "don't validate from output produced without the design loaded" lesson is general — applies beyond Apex. If it surfaces again in another context (e.g. evaluating a /skill, comparing prompts, A/B testing), promote to `memory/profile/decision-frameworks.md` as a standing diagnostic anti-pattern.
