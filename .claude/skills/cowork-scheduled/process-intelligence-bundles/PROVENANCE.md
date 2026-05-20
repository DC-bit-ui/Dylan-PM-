# Provenance — process-intelligence-bundles

## Pull

- **Domain:** Apex / Team Bus
- **Pulled from:** `…\local-agent-mode-sessions\…\local_c71d5285-d328-4097-9180-8dbba493cfa2\uploads\SKILL.md`
- **Pulled on:** 2026-05-20
- **Snapshot date:** 2026-05-19
- **Size:** 6,225 bytes
- **Pull reason:** Tier 0 — Cowork scheduled-task prompts brought into repo as canonical source of truth.

## Verification status

- [x] **Proof-by-execution:** Last fired 2026-05-19. Per the 2026-05-20 daily-enrichment audit, the last 3 runs reported `scanned=0` — almost certainly because of the same bus-path mount race that bit daily-enrichment.
- [ ] **Diff against canonical task_prompt** — not feasible from Claude Code.

## Pending patches

**Surfaced by 2026-05-20 daily-enrichment audit:**

1. **Same Step 0 retry-on-mount fix as daily-enrichment-pipeline.** This task hits BUS_ROOT too. If daily-enrichment patches Step 0 with retry-with-backoff, this one needs the identical patch.
2. **Queue is jammed.** 80 bundles pending, 0 in `results/`. Three consecutive `scanned=0` runs (2026-05-18/19/19). After bus-path is fixed, expect a heavy single run to drain. Verify behaviour under that load.
3. **Investigate processing logic** — does it actually drain pending bundles when bus is reachable? Or has another bug crept in?

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |
