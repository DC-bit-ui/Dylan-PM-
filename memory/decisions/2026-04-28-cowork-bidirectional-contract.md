# Decision: Cowork bidirectional contract — Cowork reads from and writes back to `memory/`

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Related:** [`2026-04-28-integration-architecture.md`](2026-04-28-integration-architecture.md), [`2026-04-28-notion-canonical-workstack.md`](2026-04-28-notion-canonical-workstack.md), [`2026-04-28-reconciliation-flow.md`](2026-04-28-reconciliation-flow.md)

---

## Context

Up to today, the Cowork ↔ this-repo relationship was effectively one-way: Cowork (Apex) wrote to Notion / Jira / Granola, and surfaced summaries this repo could optionally consume via `inbox/cowork/`. This repo *read* Apex's outputs but Cowork never wrote back to `memory/`.

The consequence: durable insights synthesised by Cowork (meeting decisions, learnings about people, initiative state changes, retro entries) didn't compound in the strategic memory layer. Each Apex run started from connected-systems state without a growing memory of what Dylan and the team had decided.

Dylan asked: "should we write project instructions for cowork to implement the necessary processes to ensure it updates these files as well as draws from this so this system becomes as intellegent as possible?"

## Decision

Establish a **bidirectional contract** between Cowork and this repo, formalised in a new top-level file `COWORK.md` (the symmetric mirror of `CLAUDE.md`). The contract has two halves:

### Read-side
Cowork (Apex + each external skill pack) reads `memory/` at session/job start. Specifically: `CLAUDE.md`, `memory/profile/*`, relevant `memory/business/*`, `memory/people/roster.md`, relevant `memory/initiatives/*`, `memory/decisions/INDEX.md`, and `memory/integrations/cowork.md`.

### Write-side — tiered protocol
| Tier | What | Mechanism |
|---|---|---|
| Tier 1 — direct commit | Learnings, meeting syntheses, decisions (small/scoped), people roster additions, initiative state changes, retros | Cowork commits via GitHub MCP `mcp__github__create_or_update_file` |
| Tier 2 — PR required | Behavioural rules, new skills/agents, integration contracts, strategy edits, routing rule changes (incl. `COWORK.md` itself) | Cowork opens a PR; Dylan reviews and merges |
| Tier 3 — off-limits | `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `memory/profile/identity.md`, `memory/profile/communication.md` | Cowork logs a learning instead |

### Universal write rules
Append don't overwrite; date-stamp; update INDEX.md; cross-link with relative paths; cite sources (Granola/Jira/Teams/Outlook); use confidence markers; match Dylan's voice.

### Sync mechanics
- Read at every Apex run; cache in-session
- Write on capture moments (don't batch — loses context)
- Conflicts → open PR rather than force-push

## Consequences

**Positive**
- Strategic memory compounds across both environments — Cowork's syntheses don't evaporate
- Each Apex run starts smarter than the last — a growing roster, decision log, and learning library
- External skill packs (`agriprove-pm` etc.) inherit Dylan's voice and frameworks automatically
- Dylan reviews Tier 2 changes via PR — he stays in the loop on architectural shifts without micromanaging Tier 1 noise

**Negative / risk**
- Cowork's write quality varies — bad writes pollute `memory/`. Mitigation: Tier 3 protects the operating shape; Tier 2 PR gate catches the rest; voice rule forces self-review
- Conflicts between Cowork edits and Claude Code edits on the same file. Mitigation: feature-branch workflow + conflict-on-PR rule
- Auth / GitHub MCP setup overhead. Mitigation: bootstrap probe in §11 of `COWORK.md` validates the path with one safe write before any production use
- Risk of Cowork echo-chamber — it reads, agrees with itself, writes back. Mitigation: Dylan reviews Tier 2; Tier 1 changes are factual (meeting happened, person exists), not opinion

## Alternatives considered

1. **Keep one-way (Cowork → Notion only)** — rejected; loses the compounding benefit
2. **Cowork writes to a separate `cowork-memory/` directory; Dylan manually merges** — rejected; adds friction, defers compounding
3. **Cowork has full write access including Tier 3** — rejected; the operating shape (CLAUDE.md, agents, skills) needs to be Dylan-driven, not auto-evolved
4. **Cowork only writes via PR (no Tier 1 direct commits)** — rejected; would slow capture moments to the point Cowork stops capturing. Tier 1 is for facts, not architecture

## Validation

- [ ] Cowork's GitHub MCP enabled, scoped to `DC-bit-ui/Dylan-PM-` (read + write)
- [ ] Bootstrap probe: Apex commits a placeholder learning to confirm the path
- [ ] First real write: an Apex EOD reconciliation deposits a session retro into `memory/retros/session/`
- [ ] First Tier 2 PR: Cowork proposes an edit to `working-style.md` (or similar), Dylan reviews
- [ ] Review at 30 days: did `memory/` get smarter? How many writes were Tier 1 vs Tier 2? Any rollbacks needed?

## Open questions for Dylan

- `[ASSUMPTION]` GitHub MCP is the access mechanism. If Cowork has filesystem access via clone-and-work pattern, that may be cleaner — TBD on Cowork's capabilities
- Branching strategy after this PR merges: Tier 1 directly to `main`, or always via short-lived branches? Currently writing it as "to `main` for Tier 1, branches for Tier 2"
- Frequency of memory reads — every Apex run reads everything, or cache between runs and refresh weekly? Default: every run, cache in-session
