# Cowork Integration Artifacts — Index

> Subdirectory for Cowork-specific integration artifacts that are too large or too iterated to live as a single section in [`../cowork.md`](../cowork.md). Snapshots, prompts, and operational diagnostics.
>
> **Rule:** the parent [`../cowork.md`](../cowork.md) holds the *contract* (what Apex does, where outputs land, off-limits files). This subdirectory holds *artifacts* (verbatim prompts, prompt-version history, diagnostic outputs that need persistence).

**Last updated:** 2026-04-29

---

## Apex prompt snapshots

| Date | Flow | File | Notes |
|---|---|---|---|
| 2026-04-29 | Morning Briefing | [`apex-morning-briefing-prompt-2026-04-29.md`](apex-morning-briefing-prompt-2026-04-29.md) | First captured snapshot. Source: Cowork per-task instructions field (inferred). |
| 2026-04-29 | EOD Reconciliation | [`apex-eod-reconciliation-prompt-2026-04-29.md`](apex-eod-reconciliation-prompt-2026-04-29.md) | First captured snapshot. EOD time intent in prompt = 17:30 SAST; conflicts with `../cowork.md` and current cron. |

**Capture rule:** when Dylan edits an Apex prompt in Cowork, capture a fresh dated snapshot (don't overwrite). Keeps a diff trail.

---

## Operational diagnostics

| Date | Output | Where |
|---|---|---|
| 2026-04-29 | Apex flow diagnostic (SKILL.md inspection, cron forensic, workspace mount check) | [`../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md`](../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md) |
| 2026-04-29 | Daily Briefing sample run output (degenerate — TBD instructions) | [`../../../inbox/cowork/2026-04-29-daily-briefing-sample.md`](../../../inbox/cowork/2026-04-29-daily-briefing-sample.md) |

> Diagnostics live in `inbox/cowork/` rather than here because they're event-shaped (one-off captures), not durable artifacts. If a diagnostic produces a finding worth keeping, the finding migrates here or into a learning.
