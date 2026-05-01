# The "looks-like-work" anti-pattern: surface output without durable side effects

**Date:** 2026-05-01
**Type:** diagnostic / mental model
**Source:** Two same-week instances of the same failure mode (2026-04-29 Daily Briefing investigation; 2026-05-01 Cowork memory-export silent fallback). Caught while authoring [`../../decisions/2026-05-01-proactive-memory-capture-and-no-fallback.md`](../../decisions/2026-05-01-proactive-memory-capture-and-no-fallback.md).

---

## The pattern

A flow, skill, or session produces output that **looks like productive work** — a markdown digest, a folder of files, a chat summary — but produces **no durable side effects** the wider system reads. The output exists; it has no consumers. From the inside it feels like the task got done. From the outside, nothing changed.

## Two instances this week

### 1. Daily Briefing (2026-04-29)
- Cowork's `daily-briefing` flow ran with TBD instructions and produced a competent-looking markdown digest of Notion + Jira + Granola state.
- Zero Notion creates. Zero memory writes. Zero Jira comments.
- Mistakenly read as evidence for "light prompt > heavy prompt", because surface output looked fine.
- Captured in [`../2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md`](../2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md).

### 2. Cowork memory-export silent fallback (2026-05-01)
- Cowork was asked to capture platform learnings to memory.
- Tried Claude.ai's auto-memory tool (succeeded as a tool call, but the storage is not consumed by the wider OS).
- Tried `memory/` write — read-only mount.
- **Created a new `memory-export/` folder with 8 knowledge files plus an index, reported success.**
- Net canonical memory writes: zero. The capture is in a folder no Apex run, no Claude Code session, and no external skill pack reads.
- Captured in [`../../decisions/2026-05-01-proactive-memory-capture-and-no-fallback.md`](../../decisions/2026-05-01-proactive-memory-capture-and-no-fallback.md).

## Why it's pernicious

- The output is **legible** — it reads like a successful run, has structure, plausible content.
- Self-reports say "done" — both flows reported success.
- Detection requires checking **side effects, not artefacts**. Did Notion change? Did `memory/` change? Did Jira move? If not, the run produced nothing durable regardless of what the chat output looked like.
- Compounds because the surface success suggests the design is working, which delays the diagnostic.

## The diagnostic question

> *Did this run change state in the systems that consume its output?*

If yes → durable. If no or "not sure" → suspect "looks-like-work". Default to investigating before treating the run as evidence of design success.

Variants of the question for specific contexts:
- For an Apex flow → "Did Notion / Jira / `memory/` change after this run?"
- For a memory capture → "Is the file at the canonical path (`<connected-folder>/memory/...`)? If it's somewhere else, the capture didn't land."
- For a skill run → "What did the wider system gain that it can read tomorrow?"

## Why this is general (not a one-off)

Both instances above shared:
- A wrapper / runtime that defaults to "do something" when underspecified
- An execution surface where the chat output is highly visible
- A side-effect surface that's invisible from the chat surface
- No telemetry distinguishing "ran" from "ran and persisted"

That combination is going to recur. The 2026-04-29 observability addendum ([`inbox/cowork/2026-04-29-observability-addendum.md`](../../../inbox/cowork/2026-04-29-observability-addendum.md)) addresses it specifically for Apex flows by requiring a `Tier 1 Writebacks` line in run telemetry — empty list = signal. The same instinct should apply to any new flow, skill, or capture mechanism.

## Operational consequences flowing from this

- Apex flow design: keep the heavy-prescription protocol (decision: [`../../decisions/2026-04-29-heavy-prescription-over-light-prompt.md`](../../decisions/2026-04-29-heavy-prescription-over-light-prompt.md)). Light prompts default to "looks-like-work" by construction.
- Memory captures: canonical path or fail loudly (decision: [`../../decisions/2026-05-01-proactive-memory-capture-and-no-fallback.md`](../../decisions/2026-05-01-proactive-memory-capture-and-no-fallback.md)). No parallel folders.
- Future flow / skill design: telemetry includes a "what did this change in consuming systems" line. If the line can be empty without raising a flag, the design is incomplete.

## Candidate for promotion

This is general. It applies beyond Apex, beyond memory writes, to any flow whose value is judged by side effects rather than artefacts. **Recommend promoting to `memory/profile/decision-frameworks.md` as a standing diagnostic rule** after a third confirming instance — at which point the candidate-for-promotion footer in [`../2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md`](../2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md) (the parent observation) is also activated.

Working name: *"Verify side effects, not artefacts."*
