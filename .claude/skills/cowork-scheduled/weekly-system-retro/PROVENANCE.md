# Provenance — weekly-system-retro

## Pull

- **Domain:** System Meta (also Team Bus — writes to bus, but its output is meta-observability)
- **Pulled from:** Cowork scheduled-tasks store via `mcp__scheduled-tasks__list_scheduled_tasks`
- **Pulled on:** 2026-05-21
- **Source-of-truth:** Cowork task_prompt field (live read), NOT a stale `uploads/` snapshot
- **Size:** 4204 bytes / 86 lines
- **Pull reason:** Tier 0e — discovered via Prompt A response (2026-05-20); was missing from the original `uploads/`-based inventory. Pairs with `weekly-pattern-curation` (runs 15 min before) to provide weekly meta-pass over the bus.

## Cowork task metadata at pull time

- **taskId:** `weekly-system-retro`
- **cronExpression:** `45 16 * * 5`
- **enabled:** true
- **last_run_at:** N/A (not yet fired or not in returned data)
- **next_run_at:** 2026-05-22T06:47:07Z
- **schedule (human):** At 04:47 PM, only on Friday (= 18:47 AEST, 15 minutes after `weekly-pattern-curation`)

## Verification status

- [x] **Pulled live from Cowork task_prompt on 2026-05-21** — this IS the canonical source by definition (read directly, not via stale snapshot).
- [x] **Verified 2026-05-21 (batch 2)** — repo body SHA256 `a7748d7c7b9d44ee88bbf96117132f4b7b2316ee1229c3f196798af257a031e8` (5,550 bytes body / 115-line file). Pre-deploy Cowork body SHA256 `3336df8aeeb37876b5b9c798d496a0de49d8ffcab24788a323f7c4381dca2586` (3,945 bytes body / 86-line file — pre-batch-2 state). Initial deploy produced 1-byte drift due to Cowork's auto-separator; redeployed body-only without leading newline. Post-deploy materialised body matches repo body SHA byte-identical (file: 115 lines with `---\n...---\n\n<content>` structure).

## Patch history

### 2026-05-21 patch batch 2 — deployed to Cowork

Source: 2026-05-21 data architecture audit + accepted provenance schema (companion to daily-enrichment-pipeline batch 2).

1. ✅ **Step 0.5 supplement provenance validation.** New section added to SKILL.md between "Step 0" and "Step 1" — sweeps `{BUS_ROOT}/{deal,contact,persona}-supplements/**/*` and audits front-matter compliance. Categorises files as v1-compliant / v0-legacy / malformed / duplicate-id. Writes `_provenance-audit-{YYYY}-W{nn}.json` to `system-retros/`. Surfaces malformed/duplicate counts as `⚠` warnings in chat. Headline numbers feed into the retro markdown under `## Provenance compliance` section. See `memory/decisions/2026-05-21-supplement-provenance-schema.md`.

Decisions implemented (per Dylan 2026-05-21):
- Validation cadence: weekly (this task, runs Friday 16:47 SAST after pattern curation)
- Migration tolerance: v0-legacy files tolerated indefinitely (no backfill)
- Failure mode: any malformed or duplicate-id surfaces as chat warning + retro section flag

## Pending patches

(None surfaced yet. Audit at next significant change.)

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| 2026-05-21 | Patch batch 2: Step 0.5 supplement provenance validation | Cowork session `vibrant-laughing-fermat` | SHA256 match post-deploy: `a7748d7c7b9d44ee88bbf96117132f4b7b2316ee1229c3f196798af257a031e8` (5,550 bytes body / 115-line file). Required two `update_scheduled_task` calls — first attempt sent body with leading newline → Cowork auto-separator produced 1-byte drift; second attempt sent body without leading newline and byte-matched the repo. |
