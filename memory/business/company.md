# Company — AgriProve

**Last updated:** 2026-04-28 (populated from Cowork handoff)

## Basics
- **Name:** AgriProve
- **Domain:** soil carbon measurement platform for Australian landholders
- **Core mission:** give landholders spatial visibility into their soil carbon, enabling them to earn ACCUs (Australian Carbon Credit Units)
- **Atlassian / Confluence site:** agriprove.atlassian.net

## What it does (one sentence)
AgriProve operates a predictive soil organic carbon (SOC) modelling platform — **HORIZON** — that gives Australian landholders the spatial intelligence and audit-ready outputs needed to participate in the carbon market under the Emissions Reduction Fund.

## Core product family
- **HORIZON** — predictive SOC model. Backend on Python Temporal workers. Source of truth for carbon calculations. Validated against Schedule 2 requirements.
- **Frontier** — internal CRM-adjacent tool for lead management, property creation, GeoMapper-based spatial mapping, and snapshot generation. Highest-activity area (Phase 2 in Development as of late April 2026).
- **Stormboy** — codename for the lead generation pipeline and process alignment between Growth (Claudia's lead scraping), Field team (Hobbs, Ben), and Product.
- **Verterra** — separate product line _(needs detail)_
- **ReadyGraze** — separate product line _(needs detail)_
- **KCT (Operation KCT)** — a crediting workflow; Koolah Carbon Trust context.

See `products.md` for detail.

## Tech stack
- Backend: TypeScript, GraphQL API, PostgreSQL + PostGIS
- Auth: Supabase
- Long-running compute: Temporal (Python workers)
- File storage: AWS S3
- Frontend: React with Chakra UI design system
- Integrations: ArcGIS (spatial), HubSpot (CRM), GA Espace (government carbon registry)

## How AgriProve makes money
_(To confirm with Dylan)_ Likely model: enable landholders to earn ACCUs and take a share / fee on the credits generated. Frontier and HORIZON are the productised funnel; field/audit work supports compliance.

## Org context (relevant to Dylan)

| Function | Lead | Notes |
|---|---|---|
| Product | Kieren Whittock (CPO-equivalent — leadership stakeholder) | Dylan's leadership stakeholder |
| Engineering | Cadel Watson (dev lead / backend), Steve Le Moenic, Will Frecheville | See `memory/people/roster.md` |
| Growth | Claudia (lead scraping) | Stormboy partner |
| Field | Hobbs, Ben | Frontier users / process alignment |

## Internal context Claude should know
- The **Apex** workflow system (Morning Briefing + EOD Reconciliation + Command Center) is Dylan's daily operating system — see `memory/integrations/cowork.md`.
- The team operates in **AEST** (Australia/Sydney). Dylan is in **SAST** (UTC+2). 8-hour gap.
- Atlassian is the primary collaboration suite: Jira for delivery, Confluence for docs.

## Open / unconfirmed
- [ ] Stage (seed / Series X / etc.)
- [ ] Headcount
- [ ] Public-facing positioning beyond "soil carbon for Australian landholders"
- [ ] Vision (3+ year picture)
