# Provenance — apex-eod-reconciliation

## Pull

- **Domain:** Apex / Personal PM
- **Pulled from:** `…\local-agent-mode-sessions\…\local_c9cc179d-f5bb-4b11-8dd8-2102818ea2b2\uploads\SKILL.md`
- **Pulled on:** 2026-05-20
- **Snapshot date:** 2026-04-29 (oldest active scheduled task — last edit landed before the 2026-04-29 Apex flow consolidation)
- **Size:** 6,933 bytes
- **Pull reason:** Tier 0 — Cowork scheduled-task prompts brought into repo as canonical source of truth.

## Verification status

- [x] **Proof-by-execution:** Last fired 2026-04-29. Has not run since (Apex EOD is `30 1 * * 2-6` AEST = 17:30 SAST Mon-Fri; should have fired daily since). **Possible signal: this task may be stuck or not firing.**
- [ ] **Diff against canonical task_prompt** — not feasible from Claude Code.

## Pending patches

- **Investigate why this task hasn't fired since 2026-04-29.** Either: (a) Cowork-side cron expression broken, (b) task disabled, (c) snapshot timestamp lies and it has fired but didn't re-materialise SKILL.md to a new session. Resolution: check Cowork project task list, look for EOD retros in `memory/retros/session/` after 2026-04-29.

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
