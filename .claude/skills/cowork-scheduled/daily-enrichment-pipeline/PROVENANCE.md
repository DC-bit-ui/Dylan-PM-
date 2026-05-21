# Provenance — daily-enrichment-pipeline

## Pull

- **Pulled from:** `C:\Users\DylanCronje\AppData\Roaming\Claude\local-agent-mode-sessions\e45b448d-522a-41d6-be0e-a7d2360cb6ce\f261866e-3e24-4e38-96d7-3552beb690b6\local_47792549-04b9-4590-a6d1-ecbff4c341fe\uploads\SKILL.md`
- **Pulled on:** 2026-05-20
- **Snapshot date:** 2026-05-18 03:07 (last-modified timestamp on the uploads/ copy)
- **Size:** 18,569 bytes / 358 lines
- **Pull reason:** Tier 0 — Cowork scheduled-task prompts brought into repo as canonical source of truth. See `.claude/skills/cowork-scheduled/README.md`.

## Verification status

- [x] **Verified 2026-05-20** — pre-deploy canonical SHA256 `21bd60b3c2e6dac974bc06460862dcc88c7caff85658bc647a42fe118f0af488` (18,569 bytes / 358 lines) matched the 2026-05-18 snapshot. Diff against repo showed only the 4 documented patches — no unexpected drift. Post-deploy SHA256 `ee5e575bc6e85700ad3e2c48a1218286344595c31e488c79bd7b7d4f27eb4661` (20,114 bytes / 362 lines) byte-identical to repo SKILL.md.

## Patch history

### 2026-05-20 patch batch 1 — deployed to Cowork

Source: 2026-05-20 daily-enrichment-pipeline audit (run completed today). Deployed via `mcp__scheduled-tasks__update_scheduled_task` from Cowork session `zealous-fervent-meitner` at 13:53 UTC.

1. ✅ **Rule 2 (atomicity):** Softened wording — Cowork `Write` tool is host-atomic; manual tmp+rename only required for bash writes against the bus.
2. ✅ **Step 0 (mount-race retry):** Added retry-with-backoff (3 tries, 10s apart) before writing the abort file. Removes unattended-run failure mode. Also added junction-first resolution at `C:\Dylan PM\shared-growth-memory-bus`.
3. ✅ **Step 3b (Hobbs 404 contradiction):** Deleted "Daily check" paragraph and following CQL block. Rule 16 is the truth; new sources flow via persona-registry.json + §3c.
4. ✅ **Rule 13 (budget priority):** Added explicit deferral order — Step 6 → Step 4 low-signal channels → Step 3 N=10 cap → Step 2 contact engagement. Step 1 + Step 2 deal engagement protected as never-drop. Documented queued JSONL refactor for Step 2.

## 2026-05-21 patch batch 2 — applied to repo, NOT yet deployed to Cowork

Source: 2026-05-21 data architecture audit + accepted provenance schema.

1. ✅ **Provenance front-matter REQUIRED on every supplement write.** New dedicated section added to SKILL.md between "Atomic writes" and "Read before acting" defining the schema (per-source `source_id` formats, required vs optional fields, JSON + markdown examples). See `memory/decisions/2026-05-21-supplement-provenance-schema.md`.

Decisions implemented (per Dylan 2026-05-21):
- Schema as drafted in the decision doc (no field changes)
- Validation cadence: nightly via `weekly-system-retro` Step 0.5 (NOT a daily step in this pipeline — kept budget light)
- Migration: no backfill; existing supplements stay as `supplement_schema_version: 0` (consumers downgrade confidence in v0)

## Pending architectural refactors (Tier 1+ work)

- **Step 2 → JSONL rollup.** 400 individual writes per run is the primary budget pressure. Move to `_rollup/hubspot-engagement-{deal,contact}-rollup-{YYYY-MM-DD}.jsonl` (one line per entity). Requires dashboard read-side coordination. See Task #9 in main session.
- **Bundle queue drainage.** After bus is healthy, expect `process-intelligence-bundles` to drain 80 pending. If it doesn't, investigate that task's pull/scan logic separately.

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| 2026-05-20 | Patch batch 1 (Rule 2, Step 0 junction-first + mount-race retry, Step 3b Rule-16 reframe, Rule 13 budget priority + Step 2 JSONL note) | Cowork session `zealous-fervent-meitner` | SHA256 match post-deploy: `ee5e575bc6e85700ad3e2c48a1218286344595c31e488c79bd7b7d4f27eb4661` (20,114 bytes / 362 lines). Required two `update_scheduled_task` calls — first attempt left leading YAML frontmatter in the prompt and produced doubled frontmatter (Cowork auto-prepends from task metadata); second attempt sent body-only and byte-matched the repo. |
