# Skills Roadmap — post-rebuild (Phase 5)

**Date:** 2026-07-16 · **Author:** Claude (Fable 5), Dylan-approved rebuild session · **Status:** recommendations — build on demand
**Context:** the OS rebuild (see `2026-07-16-os-rebuild-changelog.md`) moved maintenance into daily runs and single-sourced the truth. These skills compound that design. Each entry: the job, why a skill beats inline instructions, what it contains, priority.

A skill beats inline instructions when the job is (a) procedural with failure modes a weak model must not improvise around, (b) recurring across sessions/surfaces, and (c) longer than the context it deserves in an always-loaded file. Everything below passes that test.

---

## Infrastructure skills (maintain the system itself)

### 1. `deploy-scheduled-task` — **build first**
- **Job:** execute `core/PROTOCOLS.md` §Deploys end-to-end for one named task: pre-flight sentinel read, frontmatter strip, MCP update, post-deploy body diff, PROVENANCE entry, commit.
- **Why a skill:** this is the system's proven weakest link — the Teams `read_resource` fix sat undeployed for 11 weeks and the July 16 rebuild queued two more patches (morning + EOD overrides). Every step has a documented failure mode (mount truncation, frontmatter doubling, cron-timezone confusion). A checklist skill turns a fragile manual ritual into a one-command operation, which is the difference between patches shipping and rotting.
- **Contains:** the §Deploys procedure verbatim as executable steps; the sentinel-line convention; the body-diff verification; the PROVENANCE entry template; the UTC-cron conversion table; a final "verify next-run time via list_scheduled_tasks" step.
- **First use:** deploying the pending morning/EOD patches — the single highest-value action left after this rebuild.

### 2. `sweep` (rebuilt — command already updated 2026-07-16)
- **Job:** on-demand hygiene: regenerate the two INDEXes, freshness sweep with connector verification, rules graduation (rules.md → PRINCIPLES via PR), duplication spot-check against MAP §2, pack staleness, inbox archival check, last-sweep marker.
- **Why a skill:** it is the only remaining "maintenance as a process" — everything else rides on daily runs. Making it one command with an exact checklist is what keeps it a 10-minute habit instead of a decaying intention. The Morning Briefing nags when it's >14 days stale, closing the loop.
- **Contains:** already drafted in `.claude/commands/sweep.md`; promote to a full SKILL.md with per-step output templates once run twice.

### 3. `state-update`
- **Job:** refresh `memory/state/NOW.md` from live systems: Jira epic pull (statuses/assignees), Notion priority scan, HubSpot signals, calendar for schedule changes; diff against the current file; apply updates with Dylan's one-line confirmation per changed section; bump As-of dates.
- **Why a skill:** NOW.md is the single point of failure the design deliberately created — if it decays, the system lies from one file instead of four. The rebuild seeded it manually; a repeatable connector-driven refresh de-risks it. Inline instructions can't carry the JQL, the diff discipline, and the confirm-before-write gate.
- **Contains:** the exact JQL (`key in (...)` from NOW.md's own epic table + `assignee = Dylan AND issuetype = Epic AND statusCategory != Done`), section-by-section diff format, the freshness-header update rule, and a "never rewrite sections with no new evidence" guard.

### 4. `pack-regen`
- **Job:** regenerate `packs/chat-core.md` per `playbooks/pack-regen.md`.
- **Why a skill:** the playbook is already procedural; a skill makes it invocable by the sweep and by Apex when the 14-day stamp trips. Low complexity, low urgency — fold into `sweep` if building it standalone feels heavy.

### 5. `session-handoff`
- **Job:** end any surface's session by generating the capture block (decisions / rules / new facts / actions), writing it to `inbox/cowork/` when file access exists, or emitting it for paste when it doesn't (chat). Replaces the manual multi-surface-capture playbook ritual.
- **Why a skill:** capture is the compounding loop; the audit showed silence is the failure mode. One command lowers the cost to near zero on every surface that supports skills.
- **Contains:** the capture template (same as packs/chat-core.md §End-of-session), the §Writes routing table for direct-write surfaces, the one-line confirmation format.

## Workflow skills (recurring PM jobs)

### 6. `epic-file` 
- **Job:** create or refresh a `memory/initiatives/<key>.md` file in the AP-2514 pattern: pull the epic live from Jira, status block, ticket list, artefact links, dated changelog entry.
- **Why a skill:** five active epics currently have no local file ("Jira-only" in the INDEX); the audit showed hand-created initiative files freeze at birth. A generator that pulls live data makes the files cheap to create and cheap to refresh, and it updates the INDEX by regeneration as a side effect.
- **Priority:** medium — build when the next epic starts substantive work.

### 7. `prd` (existing — needs a targeted update, not a rebuild)
- Keep the Confluence-canonical discipline. Update its read list to the kernel (NOW.md for epic context, rules.md for drafting rules — zero-context tickets, business-days copy). Pair with the Cowork `agriprove-pm` + `agriprove-backend` packs as today.

### 8. `meeting-prep` / `stakeholder-update` (existing — light path updates only)
- Point reads at `core/IDENTITY.md`, `memory/state/NOW.md`, `memory/people/roster.md`. No structural change; their workflow logic held up in the audit.

## Explicitly NOT recommended

- **A "memory search" skill** — `/recall` + the MAP §2 canonical-source table already answer this; adding retrieval machinery on 300 files is complexity without payoff.
- **Rebuilding the Stack B / complement engine as a skill** — retired by decision 2026-07-16; revisit only if the one-line leverage watch demonstrably misses real opportunities for 30 days.
- **An automated INDEX-regeneration daemon** — regeneration is deliberately attached to the writes that change the indexed directories, plus `/sweep`. A separate process would recreate the dead-cadence failure mode.

## Build order

1. `deploy-scheduled-task` (unblocks the pending production patches)
2. `state-update` (protects the single point of truth)
3. `sweep` promotion to full skill (after two manual runs prove the checklist)
4. `session-handoff`
5. `epic-file`
6. `pack-regen` (or fold into sweep)
