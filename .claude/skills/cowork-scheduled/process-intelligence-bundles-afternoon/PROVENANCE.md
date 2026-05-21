# Provenance — process-intelligence-bundles-afternoon

## Pull

- **Domain:** Team Bus
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 6211 bytes / 139 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. **Sibling of `process-intelligence-bundles`** (morning drain at 00:30 SAST). This afternoon drain at 06:00 SAST gives the bundle queue a second opportunity to clear inside the working day. Together they cap latency from bundle creation → result at ~6 hours.

## Cross-task relationship

- **process-intelligence-bundles** (morning) — `30 0 * * 1-5` (00:30 SAST) — first drain of the day, clears anything queued overnight
- **process-intelligence-bundles-afternoon** (this task) — `0 6 * * 1-5` (06:00 SAST) — second drain, clears anything Dylan queued during the SAST morning

Both task_prompts are identical body content (only the descriptions and cron differ). Any edits to the bundle processing logic should be applied to BOTH SKILL.md files. Worth considering: refactor to a single canonical body referenced by both task definitions, or accept the duplication and lean on the SHA256 verification flow to catch drift.

## Cowork task metadata at pull time

- **taskId:** `process-intelligence-bundles-afternoon`
- **cronExpression:** `0 6 * * 1-5`
- **enabled:** true
- **last_run_at:** 2026-05-20T04:09:56Z
- **next_run_at:** 2026-05-20T20:09:25Z
- **schedule (human):** At 06:09 AM, Monday through Friday (= 06:00 SAST = 14:00 AEST)

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [ ] Diff against repo on next deploy — repo + canonical should match at deploy time; any drift indicates someone edited Cowork directly (violates the edit-in-repo convention).

## Pending patches

(None surfaced yet. Audit at next significant change.)

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
