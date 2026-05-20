# Provenance — career-weekly-promote

## Pull

- **Domain:** Apex / Career portfolio
- **Pulled from:** `…\local-agent-mode-sessions\…\local_71dc6468-3f78-43df-8c53-a9b3c4160a55\uploads\SKILL.md`
- **Pulled on:** 2026-05-20
- **Snapshot date:** 2026-05-12 (signoff day)
- **Size:** 2,901 bytes
- **Pull reason:** Tier 0 — Cowork scheduled-task prompts brought into repo as canonical source of truth.

## Verification status

- [x] **Proof-by-execution:** Last fired 2026-05-12. Friday auto-promote — should have fired 2026-05-15 (last Friday) but didn't. **Possible signal: also stuck, or hasn't been re-snapshotted to a new session.**
- [ ] **Diff against canonical task_prompt** — not feasible from Claude Code.

## Pending patches

- **Verify the Friday 2026-05-15 run.** Check `memory/deliverables/career/` for fresh entries on or around 2026-05-15. If absent, investigate.
- **6-transform sanitiser dependency** — this task invokes the sanitiser. Currently the sanitiser lives at `memory/deliverables/career/career-sanitiser-SKILL.md`. After Tier 1 Skill 2 promotes it to `.claude/skills/career-sanitiser/SKILL.md`, this task should reference the new path. Patch when promotion happens.

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet)_ | | | |

## Related

- `memory/decisions/2026-05-11-portfolio-rules.md`
- `memory/decisions/2026-05-11-no-proprietary-data-in-ai-for-portfolio.md`
