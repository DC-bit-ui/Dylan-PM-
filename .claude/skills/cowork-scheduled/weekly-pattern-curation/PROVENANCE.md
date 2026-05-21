# Provenance — weekly-pattern-curation

## Pull

- **Domain:** Team Bus
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 3660 bytes / 80 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. Pairs with `weekly-system-retro` (runs 15 min later) to provide weekly maintenance + observability for the shared-growth-memory bus.

## Cowork task metadata at pull time

- **taskId:** `weekly-pattern-curation`
- **cronExpression:** `30 16 * * 5`
- **enabled:** true
- **last_run_at:** N/A (not yet fired or not in returned data)
- **next_run_at:** 2026-05-22T06:32:17Z
- **schedule (human):** At 04:32 PM, only on Friday (= 18:32 AEST)

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [ ] Diff against repo on next deploy — repo + canonical should match at deploy time; any drift indicates someone edited Cowork directly (violates the edit-in-repo convention).

## Pending patches

(None surfaced yet. Audit at next significant change.)

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
