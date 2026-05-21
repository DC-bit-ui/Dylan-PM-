# Provenance — daily-briefing

## Pull

- **Domain:** Personal PM (overlap with apex-morning-briefing — flagged below)
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 128 bytes / 6 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. Earlier inference that this task had been retired was wrong: it's enabled and ran today (2026-05-20 03:48 UTC).

## Cowork task metadata at pull time

- **taskId:** `daily-briefing`
- **cronExpression:** `45 12 * * 1-5`
- **enabled:** true
- **last_run_at:** 2026-05-20T03:48:57Z
- **next_run_at:** 2026-05-21T02:45:46Z
- **schedule (human):** At 12:46 PM, Monday through Friday (local-time interpretation depends on Cowork host timezone)

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [ ] Diff against repo on next deploy — repo + canonical should match at deploy time; any drift indicates someone edited Cowork directly (violates the edit-in-repo convention).

## Pending patches

### CRITICAL — task_prompt is a stub

The current canonical task_prompt is literally:

```
TBD
```

This is not a functional prompt. The task is enabled and has been firing weekdays (last run 2026-05-20), which means Cowork is running a no-op against the description "Scrape all my work systems and suggest work items of highest value for execution" with no implementation.

**Decision queued for Dylan (P1 — pick one):**

1. **Disable** the task. The stub keeps firing, consuming a scheduled slot for no work.
2. **Define a purpose** that complements rather than duplicates `apex-morning-briefing`. The description ("scrape work systems → suggest priorities") overlaps almost completely with apex-morning-briefing's mandate. If `daily-briefing` is meant to be a lighter/different cadence (e.g., midday scan, end-of-day prep, weekend sync), write that prompt. Otherwise it's redundant.
3. **Delete** the task entirely if apex-morning-briefing covers the need.

**Overlap with apex-morning-briefing:**

Both are enabled, both run weekdays. `apex-morning-briefing` cron is `45 4 * * 1-5` (04:45 SAST) and its description is "synthesise priorities from all systems into Notion daily task list" — functionally the same intent as `daily-briefing`'s description. The `daily-briefing` schedule string says "12:46 PM" but both tasks' lastRunAt are 2026-05-20T03:48 UTC (05:48 SAST = same window as apex-morning-briefing). Either there's a host-timezone interpretation pulling them together, or both fire in the same window and produce conflicting Notion writes.

Recommend Dylan inspect Cowork's task scheduler UI for the actual fire-time and resolve.

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
