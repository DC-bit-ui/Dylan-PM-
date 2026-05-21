# Provenance — career-canary-reaudit

## Pull

- **Domain:** Career
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 1,006 bytes / 17 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. Manual-trigger safety tool — used after Dylan adds new terms to the Confidentiality Canary List to ensure no previously-promoted Portfolio entries now leak the new term.

## Cowork task metadata at pull time

- **taskId:** `career-canary-reaudit`
- **cronExpression:** N/A (manual-trigger only)
- **enabled:** true
- **last_run_at:** N/A
- **next_run_at:** N/A
- **schedule (human):** Manual only

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [ ] Diff against repo on next deploy — repo + canonical should match at deploy time; any drift indicates someone edited Cowork directly (violates the edit-in-repo convention).

## Pending patches

(None surfaced yet. Audit at next significant change.)

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
