# Integration architecture — two-layer model

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Stakeholders:** Dylan (sole user)

## Context
Dylan wants this Claude OS to be hands-off — pulling work items from Notion, tickets from Jira, meeting notes from Granola, emails from Outlook, team updates from Teams, and consuming cross-system summaries from cowork. He also wants to leverage existing skill packs (`agriprove-pm`, `agriprove-backend`, `agriprove-design-system`) that live outside this repo.

The question: how should this repo integrate with all of that?

## Decision
Use a **two-layer architecture**:

1. **Connector layer (live data pull):** MCP servers / Claude connectors enabled in the active session. This repo cannot call them directly — agents only reach them when the *running session* has them enabled.

2. **Memory/contract layer (this repo):** every external system gets a contract file at `memory/integrations/<system>.md` documenting:
   - What flows in and where it lands
   - What flows out and from what paths
   - Failure mode when the connector is unavailable
   - Setup checklist for Dylan

Inbound drops follow the convention `inbox/<source>/` — namespaced so the source is unambiguous.

External skill packs are **referenced, not copied** — single source of truth. `memory/integrations/external-skills.md` documents where they live and when to invoke them.

## Alternatives considered

- **Copy external skills into this repo** — rejected; creates drift, breaks single source of truth.
- **One mega-agent that calls all connectors** — rejected; loses specialisation, harder to reason about. Better to keep specialised agents (`meeting-synthesizer` for Granola, `initiative-tracker` for Notion/Jira) and have each consult its relevant connector.
- **No contracts, just trust the connectors** — rejected; without contracts, there's no failure mode discipline (agents would silently fabricate when connectors are unavailable).

## Consequences

**Positive:**
- New systems plug in by adding one file in `memory/integrations/` plus one `inbox/<source>/` subdirectory.
- Agents have a deterministic fallback chain (live connector → namespaced inbox → generic inbox → ask Dylan).
- External skills stay where they are — no drift risk.
- Privacy posture is explicit per-system (see e.g. Outlook contract).

**Negative / costs:**
- Setup burden falls on Dylan to configure each MCP / connector once.
- Some integrations (Outlook, Teams via Microsoft Graph) are non-trivial to set up — deferred behind Granola/Notion/Jira.
- Until Dylan confirms what cowork is, the cowork contract is partly speculative.

**What we accept and won't revisit:**
- Plain markdown + git as the substrate for the memory layer (decided 2026-04-28 in bootstrap).
- External skills referenced, not copied.

## Revisit triggers
- If a connector becomes unavailable for >2 weeks → decide whether to deprecate the integration or invest more in inbox-drop fallback.
- If a new high-value system enters Dylan's workflow → add a contract file.
- If skill drift makes external referencing painful → reconsider copying agriprove-* skills in.

## Links
- Index: `memory/integrations/INDEX.md`
- Bootstrap retro: `memory/retros/session/2026-04-28-bootstrap.md`
- Earlier learning that prefigured this: `memory/learnings/2026-04/2026-04-28-external-integration-need.md`
