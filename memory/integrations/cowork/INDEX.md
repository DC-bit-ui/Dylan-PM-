# Cowork Integration Artifacts — Index

> Subdirectory for Cowork-specific integration artifacts that are too large or too iterated to live as a single section in [`../cowork.md`](../cowork.md). Snapshots, prompts, and operational diagnostics.
>
> **Rule:** the parent [`../cowork.md`](../cowork.md) holds the *contract* (what Apex does, where outputs land, off-limits files). This subdirectory holds *artifacts* (verbatim prompts, prompt-version history, diagnostic outputs that need persistence).

**Last updated:** 2026-05-20

---

## Apex prompt snapshots

| Date | Flow | File | Notes |
|---|---|---|---|
| 2026-04-29 | Morning Briefing | [`apex-morning-briefing-prompt-2026-04-29.md`](apex-morning-briefing-prompt-2026-04-29.md) | First captured snapshot. Source: Cowork per-task instructions field (inferred). **Superseded by 2026-05-20.** |
| 2026-05-20 | Morning Briefing | [`apex-morning-briefing-prompt-2026-05-20.md`](apex-morning-briefing-prompt-2026-05-20.md) | **Current.** Structured Teams Step 4 (mentions/decisions/questions/commitments + freshness), explicit memory-load Step 0, new Step 7 writes brief snapshot to `inbox/cowork/<date>-apex-morning.md` for apex-pm workbench ingestion. Paste into Cowork UI to activate. |
| 2026-05-20 | AI Pulse — Weekly | [`apex-ai-pulse-weekly-prompt-2026-05-20.md`](apex-ai-pulse-weekly-prompt-2026-05-20.md) | **New.** Monday 06:00 SAST. Filters past-7d AI feature drops by "would this change Dylan's workflows" + reads `apex-pm/ai-pulse/source_trust.json` for dynamic source weighting. Writes `inbox/cowork/<date>-ai-pulse.md`. |
| 2026-05-20 | AI Pulse — Breaking | [`apex-ai-pulse-breaking-prompt-2026-05-20.md`](apex-ai-pulse-breaking-prompt-2026-05-20.md) | **New.** Daily 09:00 SAST. Lightweight breaking-news check — fires only when major Anthropic/Claude Code/OpenAI/Notion/Granola/Atlassian release lands in last 24h. Writes `inbox/cowork/<date>-ai-pulse-breaking.md`. |
| 2026-05-20 | Memory Curator | [`apex-memory-curator-prompt-2026-05-20.md`](apex-memory-curator-prompt-2026-05-20.md) | **New.** Sunday 08:00 SAST. Reads last 7d of `memory/learnings/` + `memory/retros/session/` + AI Pulse source_trust, detects recurring patterns, proposes rule changes via Tier 2 PRs. Tier 3 files are off-limits. |
| 2026-04-29 | EOD Reconciliation | [`apex-eod-reconciliation-prompt-2026-04-29.md`](apex-eod-reconciliation-prompt-2026-04-29.md) | First captured snapshot. EOD time intent in prompt = 17:30 SAST; conflicts with `../cowork.md` and current cron. |
| 2026-05-11 | Career Signal Capture (4 tasks: daily, weekly auto-promote, weekly audit digest, monthly) | [`apex-career-signal-capture-prompt-2026-05-11.md`](apex-career-signal-capture-prompt-2026-05-11.md) | **DRAFT. NOT ACTIVE.** Activation gated by compliance assessment + canary list. Trustless automation model — once gates pass, runs without Dylan's per-entry review. Writes to personal Notion via separate `personal_notion` MCP token. |

**Capture rule:** when Dylan edits an Apex prompt in Cowork, capture a fresh dated snapshot (don't overwrite). Keeps a diff trail.

---

## Operational diagnostics

| Date | Output | Where |
|---|---|---|
| 2026-04-29 | Apex flow diagnostic (SKILL.md inspection, cron forensic, workspace mount check) | [`../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md`](../../../inbox/cowork/2026-04-29-apex-flow-diagnostic.md) |
| 2026-04-29 | Daily Briefing sample run output (degenerate — TBD instructions) | [`../../../inbox/cowork/2026-04-29-daily-briefing-sample.md`](../../../inbox/cowork/2026-04-29-daily-briefing-sample.md) |

> Diagnostics live in `inbox/cowork/` rather than here because they're event-shaped (one-off captures), not durable artifacts.
