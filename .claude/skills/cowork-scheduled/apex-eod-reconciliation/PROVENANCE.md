# Provenance — apex-eod-reconciliation

## Pull

- **Domain:** Apex / Personal PM
- **Pulled from:** `…\local-agent-mode-sessions\…\local_c9cc179d-f5bb-4b11-8dd8-2102818ea2b2\uploads\SKILL.md`
- **Pulled on:** 2026-05-20
- **Snapshot date:** 2026-04-29 (oldest active scheduled task — last edit landed before the 2026-04-29 Apex flow consolidation)
- **Size:** 6,933 bytes
- **Pull reason:** Tier 0 — Cowork scheduled-task prompts brought into repo as canonical source of truth.

## Verification status

- [x] **Proof-by-execution (corrected 2026-05-20):** Task IS firing daily — verified via live Cowork diagnostic (Prompt B response). EOD files in `memory/retros/session/` for every weekday from 2026-04-30 through 2026-05-19, plus 5 Apex EOD commits in 20 days. The uploads/ snapshot date of 2026-04-29 tracks the SKILL.md's last *edit*, NOT its last *invocation* — see `memory/learnings/2026-05/2026-05-20-cowork-uploads-snapshot-semantics.md`.
- [x] **Diff against canonical task_prompt** — not feasible from Claude Code. But Prompt B diagnostic confirmed the running task matches the SKILL.md content (no drift detected on the prompt itself).

## Pending patches

### Cron expression — task is firing at the wrong time

**Current cron (in Cowork):** `0 12 * * 1-5` — interpreted in AEST = 04:00 SAST. The task fires BEFORE Dylan's workday starts, so it can only reconcile work from prior days. This is functionally a "ghost EOD."

**Intended cron (per SKILL.md TIMEZONE CONTEXT line):** `30 1 * * 2-6` = 01:30 AEST Tue–Sat = **17:30 SAST Mon–Fri**. Matches the prompt's own statement: *"At 5:30 PM SAST, it's 1:30 AM AEST — the team has finished their day. This reconciliation captures everything that happened."*

**History:** Flagged on 2026-04-29 in `memory/integrations/cowork/apex-eod-reconciliation-prompt-2026-04-29.md` (three-source disagreement noted). Source-of-truth was clarified in `memory/integrations/cowork.md` §2 (12:00 SAST claim marked superseded). Never deployed.

**Fix (DEPLOYED 2026-05-21):** Updated `cronExpression` from `0 12 * * 1-5` to `30 1 * * 2-6` via `mcp__scheduled-tasks__update_scheduled_task`. SKILL.md content unchanged. See Deploy history row below.

## Adjacent items queued for later

- **Filename normalisation in `memory/retros/session/`:** mix of `<date>-eod.md` and `<date>-apex-eod.md`. Memory-curator sweep.
- **Notion `Origin` taxonomy:** EOD writes land under `Apex · Reconciliation` (the enum doesn't include `Apex · EOD`). If finer filterability matters, add the enum and update the SKILL.md to use it.

## 2026-05-22 patch batch 1 — applied to repo, NOT yet deployed to Cowork

Source: companion to apex-morning-briefing batch 1 fix. Dylan flagged 2026-05-22 that Apex was missing Teams channel signal. EOD Step 2c had the same `chat_message_search` bug as morning Step 4.

1. ✅ **Step 2c rewritten — replace `chat_message_search` with `read_resource` per channel URI.** All 4 Operation Stormboy channels + all 6 Product Team channels enumerated inline. DMs still use `chat_message_search` (correct for DMs). Lookback window -8h (afternoon coverage). Reference: `memory/integrations/cowork/apex-data-sources.md`.

Companion patches:
- `apex-morning-briefing/SKILL.md` Step 4 — same fix, -18h window
- `memory/learnings/2026-05/2026-05-22-apex-teams-blind.md` — discovery + impact

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| 2026-05-21 | cron: `0 12 * * 1-5` → `30 1 * * 2-6` (04:00 SAST → 17:30 SAST) | Cowork session hopeful-admiring-dijkstra | next_run_at verified 2026-05-20T15:38:12Z (= 17:38:12 SAST Wed, in 17:30-17:50 SAST Mon-Fri window) |
