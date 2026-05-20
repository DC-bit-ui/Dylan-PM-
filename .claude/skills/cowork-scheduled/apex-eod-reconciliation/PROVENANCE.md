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

**Fix (pending Dylan deploy):** Update `cronExpression` to `30 1 * * 2-6` via `mcp__scheduled-tasks__update_scheduled_task`. SKILL.md content does not change. Log the cron change in the Deploy history below.

## Adjacent items queued for later

- **Filename normalisation in `memory/retros/session/`:** mix of `<date>-eod.md` and `<date>-apex-eod.md`. Memory-curator sweep.
- **Notion `Origin` taxonomy:** EOD writes land under `Apex · Reconciliation` (the enum doesn't include `Apex · EOD`). If finer filterability matters, add the enum and update the SKILL.md to use it.

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
