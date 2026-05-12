# Session Retro: Cowork Handoff Integration — 2026-04-28

**Scope:** session
**Outcome:** ground-truth context absorbed; ~25 files written/updated; Notion-canonical architecture committed

## What happened
Dylan provided a comprehensive Cowork handoff (~2.5k words) describing AgriProve, the Apex daily workflow system, all connected systems with MCP tool IDs, the Notion workstack schema, Jira project structure, six active epics, key people, behavioural preferences, and existing skill packs.

I absorbed this systematically:
- Populated 4 profile files (identity, communication, decision-frameworks, working-style)
- Populated 5 business files (company, products, customers, glossary, strategy)
- Populated people roster
- Rewrote 6 integration contracts with real MCP tool IDs (cowork, notion, jira, granola, teams, outlook); created 2 new (hubspot, confluence); corrected external-skills list
- Created 6 initiative files for active AP epics + updated INDEX
- Updated `/focus` and `/standup` skills to query Notion as canonical source
- Major rewrite of CLAUDE.md (Notion-as-workstack, Apex, modes, behavioural defaults)
- Logged a decision (Notion-canonical-workstack) and a durable learning

## What worked
- **Plain-markdown-in-git architecture held up.** Absorbing 2.5k words of structured context into ~25 files was a Write/Edit grind, not a re-architecture.
- **The system rules paid off:** "supersede, don't delete" meant the earlier `cowork.md` and `integration-architecture.md` decision could be extended without losing history.
- **Initiative files are the right granularity** — each AP epic now has a strategic anchor independent of Jira state.

## What didn't
- **The earlier `cowork.md` was speculative and wrong** in shape, not just detail. I should have left a stub with explicit unknowns rather than scaffold a guessed contract. Cost: a full rewrite vs incremental update.
- **`workspace/current/actions.md` was a wrong design choice** — it positioned this repo to compete with Notion as a task store. Should have asked "where do tasks actually live today?" before scaffolding it. Cost: small (the file is now repurposed as fallback), but it's a pattern to avoid.
- **I missed HubSpot and Confluence entirely** in the original integration list. The handoff exposed both. Lesson: when scaffolding integrations, ask broadly ("what other systems?") rather than work from initially-named ones.

## Decisions made
- → `memory/decisions/2026-04-28-notion-canonical-workstack.md` — Notion is canonical for tasks; this repo is the strategic memory layer.
- → existing `memory/decisions/2026-04-28-integration-architecture.md` — extended (not superseded). Two-layer connector + contract model still correct; Notion-canonical decision sharpens the edges.

## Durable learnings
- → `memory/learnings/2026-04/2026-04-28-cowork-handoff-absorbed.md` — full account of corrections needed and pattern for future integration scaffolding (don't pre-build speculative contracts).

## Changes to the system
1. `/focus` and `/standup` skills now query Notion via MCP (was: read `actions.md`)
2. CLAUDE.md §5 establishes Notion-canonical workstack as a hard rule
3. CLAUDE.md §2 surfaces behavioural defaults from Cowork preferences (accuracy / depth / push back / educate / no flattery / modes)
4. `memory/integrations/INDEX.md` now has a "Authoritative source-of-truth map" — explicit assignment per domain
5. New initiative files for all 6 active AP epics

## Pushback I owe Dylan
- **Skill overlap with Cowork:** this repo's `/stakeholder-update` overlaps with Cowork's `internal-comms`; this repo's `/prd` overlaps with `agriprove-pm`. The current resolution ("Cowork wins for execution; this repo wins for memory") is a reasonable boundary but probably needs the Agriprove PRD template to be either copied here or referenced — Dylan to decide.
- **`workspace/current/actions.md` is now mostly dead weight.** Recommendation: keep as fallback only, document that in the file header. Don't delete (per system rules); but stop treating as source of truth.
- **`memory/business/strategy.md` is sparse.** Without OKRs in this file, the `/okr-check` skill can't function. This is the highest-value gap to fill next.

## Next concrete actions
- [ ] **Dylan:** confirm AgriProve OKRs to populate `memory/business/strategy.md`
- [ ] **Dylan:** decide on PRD template — copy Agriprove version into `templates/prd.md` here, or keep referenced from `agriprove-pm`?
- [ ] **Dylan:** test the updated `/focus` skill in a session with Notion connector enabled — confirm it pulls live state correctly
- [ ] **Dylan:** validate HubSpot and Confluence MCP responses (per cowork handoff "Immediate priorities")
- [ ] **Claude (next session):** populate `memory/business/metrics.md` with HORIZON, Frontier, Stormboy KPIs once Dylan provides
- [ ] **Claude (next session):** when Apex first writes to `inbox/cowork/`, route per `memory/integrations/cowork.md`

## Linked
- Decision: `memory/decisions/2026-04-28-notion-canonical-workstack.md`
- Learning: `memory/learnings/2026-04/2026-04-28-cowork-handoff-absorbed.md`
- Earlier session retro: `memory/retros/session/2026-04-28-bootstrap.md`
