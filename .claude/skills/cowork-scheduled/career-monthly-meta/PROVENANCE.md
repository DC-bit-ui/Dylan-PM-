# Provenance — career-monthly-meta

## Pull

- **Domain:** Career
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 2,113 bytes / 45 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. Part of the career portfolio automation stack (`career-signal-capture` → `career-weekly-promote` → `career-audit-digest` → `career-monthly-meta`).

## Cowork task metadata at pull time

- **taskId:** `career-monthly-meta`
- **cronExpression:** `0 6 1-7 * 1`
- **enabled:** true
- **last_run_at:** N/A (not yet fired since pull)
- **next_run_at:** 2026-05-31T20:06:08Z
- **schedule (human):** At 06:00 AM, between day 1 and 7 of the month, and on Monday — i.e. first Monday of each month

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [ ] Diff against repo on next deploy — repo + canonical should match at deploy time; any drift indicates someone edited Cowork directly (violates the edit-in-repo convention).

## Pending patches

(None surfaced yet. Audit at next significant change.)

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
