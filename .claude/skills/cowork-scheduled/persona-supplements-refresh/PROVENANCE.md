# Provenance — persona-supplements-refresh

## Pull

- **Domain:** Team Bus (SUPERSEDED)
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 3,774 bytes / 79 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. Pulled despite being DISABLED, because the prompt is non-trivial and the audit trail matters.

## Cowork task metadata at pull time

- **taskId:** `persona-supplements-refresh`
- **cronExpression:** `0 5 * * 1,3,5`
- **enabled:** false
- **last_run_at:** N/A (disabled before any tracked run)
- **next_run_at:** N/A (disabled)
- **schedule (human):** At 05:02 AM, only on Monday (paused — was originally MWF)

## SUPERSEDED status

The task's own description states: "SUPERSEDED by daily-enrichment-pipeline. Re-disabled after channel mapping merged into daily pipeline."

The Teams channel mapping in Step 1 (OSB Deals / OSB General / OSB Standup / OSB ToF + Growth Deals) has been absorbed into the `daily-enrichment-pipeline` SKILL.md as Step 4. The functionality of this task is now covered there.

**Decision queued for Dylan (P3):**

1. **Delete the task** entirely from Cowork. The repo snapshot lives here as audit trail; no need to keep the disabled task slot.
2. **Keep disabled** as a soft archive. Zero cost since `enabled: false` means it never fires.

Recommended: keep disabled. The cost of leaving it in place is near-zero and accidentally hitting "enable" without realising it's superseded is the only risk — which is mitigated by the description string already calling it out.

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [ ] Diff against repo on next deploy — repo + canonical should match at deploy time; any drift indicates someone edited Cowork directly (violates the edit-in-repo convention).

## Pending patches

(None. Task is superseded; further edits should land in `daily-enrichment-pipeline` SKILL.md instead.)

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |

## 2026-07-16 — re-disabled via MCP (OS rebuild)
- Live inventory showed the task enabled:true and firing (last run 2026-07-14) despite its SUPERSEDED status — it had been re-enabled at some point. Disabled via mcp__scheduled-tasks__update_scheduled_task on 2026-07-16. If it re-enables again, investigate Cowork-side re-arming.
