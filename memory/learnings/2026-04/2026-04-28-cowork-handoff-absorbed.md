# Cowork handoff absorbed — system architecture reconciled

**Date:** 2026-04-28
**Type:** mechanism
**Trigger:** Dylan provided full Cowork context handoff describing Apex (Morning Briefing + EOD Reconciliation + Command Center), the Notion + Jira workstack, all MCP tool IDs, AgriProve product context, and behavioural preferences.

## The learning

Before the handoff, this repo's design treated `workspace/current/actions.md` as the canonical action list and `cowork.md` as a vague summarisation system. Both were wrong. The handoff revealed:

1. **Apex already exists and runs in Cowork.** Two scheduled tasks (04:45 SAST morning briefing, 12:00 SAST EOD reconciliation) plus a persistent Command Center artifact. This is operational, not aspirational.
2. **Notion is the canonical workstack.** Database `fd5f23d7e071496dae6df273cbd901be` with a fully-defined schema (Status / Priority / Focus area / Origin tagging / Today Rank / Linked Jira). Apex creates `Proposed` items; Dylan triages.
3. **Jira is canonical for team delivery** in the AgriProve cloud (`93303eda-f479-47a1-ab3a-d4609f4901b3`). Six active epics in the AP project.
4. **AgriProve is confirmed** — soil carbon platform, Australia-specific, ACCU scheme, HORIZON predictive SOC model.
5. **Six external skill packs** in Cowork: `agriprove-pm`, `agriprove-backend`, `agriprove-design` (not `-design-system`), `soil-carbon-audit`, `soil-carbon-batch-audit`, `internal-comms`.
6. **HubSpot and Confluence connectors exist** — were missed in earlier scaffolding.
7. **Behavioural preferences are explicit:** accuracy / depth / push back / educate / clarify selectively / no flattery / modes (EXPLORE, EVIDENCE, PROFESSIONAL, DECISION, LEARN).

## What changes because of this

1. **Notion = canonical.** This repo doesn't duplicate the workstack. `/focus` and `/standup` query Notion via MCP; `actions.md` is fallback only. _(Decision filed: `memory/decisions/2026-04-28-notion-canonical-workstack.md`.)_
2. **Cowork integration contract corrected.** `memory/integrations/cowork.md` rewritten to document Apex as the execution layer with concrete schedules, schemas, and routing rules.
3. **Real MCP tool IDs documented** in each integration file (Notion, Jira, Granola, Teams, Outlook, HubSpot, Confluence).
4. **Profile fully populated** from explicit Cowork preferences (`memory/profile/communication.md` now contains the behavioural defaults; `decision-frameworks.md` contains the P0–P3 framework).
5. **Six initiative files created** for active AP epics — ground anchors for cross-referencing.
6. **External skills referenced, not copied** — corrected list in `memory/integrations/external-skills.md`.

## Pushback I should have offered earlier
- The earlier `cowork.md` should have been written with explicit "I don't know what cowork is yet — confirm before I scaffold" rather than guessing. I scaffolded a speculative integration that needed full rewrite. **General rule: when an integration isn't yet defined, don't pre-build a fake contract — leave a stub with a question instead.**

## Open questions for Dylan
- AgriProve OKRs / strategy detail (`memory/business/strategy.md` is sparse)
- HORIZON model success metrics
- Schedule 2 target date
- Stormboy success metrics
- Field team feedback loop — where does it live?
- Whether to copy AgriProve PRD template into `templates/prd.md` here or keep `agriprove-pm` (Cowork) as sole source

## Related
- Decision: `memory/decisions/2026-04-28-notion-canonical-workstack.md`
- Earlier learning (now contextualised): `memory/learnings/2026-04/2026-04-28-external-integration-need.md`
- Bootstrap retro: `memory/retros/session/2026-04-28-bootstrap.md`
