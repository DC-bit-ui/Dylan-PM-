# 2026-07-16 — Operating System rebuild (kernel + state layer + single-source)

**Status:** accepted · **Deciders:** Dylan (approved in Cowork session, 2026-07-16) · **Executor:** Claude (Fable 5)

## Context

A full audit (2026-07-16) found the OS structurally sound in intent but failing on maintenance economics: every upkeep process that ran separately from daily work had a 0% execution rate over 11 weeks (weekly sweep, learning promotion, inbox archival, INDEX discipline); the same facts were maintained in 2–4 places and had diverged; no freshness contract existed, so April-era files were silently presented as current. Audit + proposal: `memory/deliverables/system/2026-07-16-os-rebuild-changelog.md` (links both).

## Decision

1. **Kernel:** always-loaded core moves to `core/` (MAP, IDENTITY, PRINCIPLES, PROTOCOLS). CLAUDE.md becomes a thin adapter; COWORK.md and `memory/profile/*` become pointer stubs. Cowork Project Instructions restate bootstrap essentials only and point to core/.
2. **State layer:** `memory/state/NOW.md` is the single source for current strategy, priorities, owned epics, org, schedules (freshness-dated). `memory/state/rules.md` is the learned-rules register — rules land there at capture time; `/sweep` graduates them to PRINCIPLES (Tier 2).
3. **Single-source rule:** every fact lives in one file per `core/MAP.md` §2; duplicates become pointers (hard rule 8).
4. **Freshness contract:** `Last-verified`/`Review-by` headers on state/business/initiatives/integrations files; past-review facts are `[STALE]` and must be flagged (PROTOCOLS §Freshness).
5. **Maintenance folded into daily runs:** Morning Briefing reads yesterday's EOD + flags Review-by breaches + warns on inbox backlog and stale sweep marker; EOD updates NOW.md, processes + archives inbox. Weekly/monthly scheduled reviews are deleted from the spec; `/sweep` is on-demand hygiene.
6. **Workstack model — simplified dual-stack:** Stack A (Mine, cap 3, P0–P3 due-date weighted) + one-line leverage watch. Supersedes `2026-04-28-dual-stack-prioritisation.md` and the drifted 4-bucket production format.
7. **Canonical prompt store:** `.claude/skills/cowork-scheduled/` only; `memory/integrations/cowork/` snapshots are HISTORICAL. Legacy Apex machinery (apex-pm server, apex-* commands, AI-Pulse/memory-curator prompts) retired.
8. **INDEX policy:** hand-maintained INDEXes abolished except `decisions/` and `initiatives/` (regenerated in full, never appended) and the accurate deliverables sub-INDEXes (prds/, meetings/). Filename convention `YYYY-MM-DD-slug` is the primary index.
9. **Non-OS trees** (apex-pm, EIH Automation, shared-growth-memory, product tool folders, root artifacts) stay in place, declared "not the OS" in MAP §6.

## Alternatives considered

Clean-slate re-namespace (rejected: 14 deployed prompts + 19 skills reference `memory/…` paths and the deploy loop is the proven weakest link); radical 6-artifact OS (rejected: glossary/integration-contract/initiative recall value is real; its spirit adopted); patch-in-place without restructure (rejected: symptoms would recur).

## Consequences

- Old paths keep resolving (stubs), so deployed prompts don't break; scheduled prompts should still be updated to read `core/` + `state/` on their next deploy cycle.
- `strategy.md` history remains, but current strategy authority moved to NOW.md.
- The system's health is now checkable daily: Review-by breaches, inbox backlog, and sweep age surface in the Morning Briefing.

## Revisit triggers

- Morning/EOD prompts redeployed without the kernel reads → the rebuild's maintenance model silently fails; fix on next deploy.
- NOW.md goes >30 days without verification → the state layer is decaying; run `/sweep` and confirm ownership of updates.
- 30-day validation (due ~2026-08-16): are rules landing in rules.md at capture time? Is inbox/processed/ filling? Are INDEX regenerations happening?
