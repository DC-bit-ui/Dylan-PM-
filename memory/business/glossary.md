# Glossary

Last-verified: 2026-07-16 · Review-by: 2026-10-14 · Verified-by: claude-code (rebuild pass: added HORIZON Profile, Groundwork, DROVER, ACWIS, EIH; epic block → NOW.md) — prev 2026-07-10 (ECP / Tags for Tonnes)

> Internal terminology, acronyms, codenames. Claude should check here before asking what something means.

---

## A
- **ACCU** — Australian Carbon Credit Unit. The tradable carbon credit issued under the ERF. AgriProve's commercial purpose is to enable landholders to earn ACCUs.
- **AEST** — Australian Eastern Standard Time. Team's primary timezone.
- **AP** — Jira project key for **AgriProve Platform** (primary delivery project).
- **AO** — Jira project key for **AgriProve Operations** (business workstreams).
- **Apex** — Dylan's automated daily workflow system: Morning Briefing (04:45 SAST) + EOD Reconciliation (17:30 SAST) + Command Center artifact. Lives in Cowork.
- **ArcGIS** — spatial data platform used by Frontier for GeoMapper.

## C
- **Chakra UI** — React design system used by AgriProve frontends.
- **Cowork** — the Claude environment where Apex runs and connectors live (vs Claude Code which runs this repo).

## D
- **DROVER** — HORIZON workshop partner (attribution validation with Verterra pathway). Spelling is DROVER, all caps — never "Drova" (rules.md 2026-07-06).

## E
- **EIH** — Eligible Interest Holder (CFI Act s43–45A): a party whose consent a carbon project registration needs. Core concept in the Prospective Projects land-titles/consents epics (AP-2566/2567) and the EIH Automation tooling.
- **ACWIS** — the water-quality/reef-credit standard context relevant to the Verterra collaboration. Eligibility notes: `memory/learnings/2026-07/2026-07-15-acwis-reef-credit-water-quality-eligibility.md`. [moderate — expansion unconfirmed]
- **AASB S2** — Australian sustainability disclosure standard requiring physical climate-risk disclosure; the regulatory wedge behind the bank channel (`memory/learnings/2026-07/2026-07-15-regulatory-wedge-verification-aasb-s2-apra-tnfd.md`).
- **ECP** — **Environmental Commodity Partners LP** (US fund; contracting via **ECP Capital LP** / **ECP Fund GP LLC**; domain envcp.com; contacts Alex Rau, Clark O'Bannon). Counterparty to AgriProve's **Product Prepay Financing Agreement — "Tags for Tonnes"** (signed 28 Apr 2025, via SPV **AgriProve Solutions Co No.3 Pty Ltd**). ECP prepaid a **$2.25M** facility; AgriProve repays in kind with **100,000 ACCUs @ $22.50** (incl. 30,000 Secured ACCUs) over a 5-yr term to **31 Dec 2029**, using funds to buy/deploy **9,000 Ceres Tags** (or tag-equivalent) to landholders at no upfront cost. Funds also cover a software-dev line ($50k/yr), S&M, satellite uplink, concierge/helpdesk. ECP is ALSO an **investor/portfolio-reporting client** (investor dashboard reused from TotalEnergies; clause 4.3 quarterly reporting). [high] Sources: SharePoint `.../Environmental Commodity Partners LP/` (250428 signed agreement, 250403 board summary, 251119 business plan update); Jira AP-780/803/998/1003/791, ROAD-74; captured 2026-07-10. See reconciliation deliverables in `C:\Dylan PM\ECP_Reconciliation_*`.
- **ERF** — Emissions Reduction Fund (Australian government scheme that issues ACCUs).

## F
- **Frontier** — internal AgriProve tool for lead/property management, GeoMapper, snapshots. See `memory/business/products.md#frontier`.

## G
- **GA Espace** — government carbon registry integration (Australia).
- **GeoMapper** — Frontier's spatial mapping module.
- **Granola** — meeting transcript / notes platform; primary source for `meeting-synthesizer`.
- **Groundwork** — working name (Dylan, 2026-07-13; leadership alignment pending) for the top-of-funnel tool that produces a HORIZON Profile: draw-your-farm boundary → free profile. See `memory/decisions/2026-07-13-groundwork-tool-name.md`.

## H
- **HORIZON** — AgriProve's predictive SOC model. Core product.
- **HORIZON Profile** — renamed from "Snapshot" 2026-07-11 (Kieren + Matthew): the per-property report produced from a boundary + HORIZON run. ⚠️ Also the working title of the *bank risk-profiling artifact* — two objects, same name; disambiguate by context (see `memory/state/NOW.md` §Naming).
- **HubSpot** — AgriProve's CRM.

## J
- **JTBD** — Jobs To Be Done. Dylan's preferred framing for user need (Job Stories over feature descriptions).

## K
- **KCT** — Koolah Carbon Trust. Operation KCT is the related crediting workflow (epic AP-1964).

## L
- **LAFI** — Lab and Field Integration. AgriProve's backend database where all project data, sample results, and project history live. The PostgreSQL store behind the GraphQL API. Surfaced as a distinct ask by Claudia 2026-05-22 in the context of MCP-exposed reads/writes for the Stormboy conversion intelligence layer. Captured: `memory/learnings/2026-05/2026-05-22-mcp-phase2-prioritisation-and-stormboy-ci-attribution.md`.
- **LawrieCo** — partner/referrer with a dedicated referrer view in AgriProve (epic AP-1965).
- **Lean Core + Design Appendix** — Dylan's PRD format. Minimal core spec, design lives separately in appendix.

## P
- **P0 / P1 / P2 / P3** — priority levels. Criteria: `core/PRINCIPLES.md` §2.
- **PostGIS** — PostgreSQL spatial extension; used by AgriProve's database.
- **PRD** — Product Requirements Document.

## R
- **ReadyGraze** — AgriProve grazing-management software product line. Monetised inside the **ECP** deal at $70/tag (bundled with each Ceres tag); the layer that turns device data (GPS tags, moisture/water probes) into on-farm insight. Major UX rebuild = epic AP-948. [high, 2026-07-10]
- **ROAD** — Jira project key for **Roadmap** (Product Discovery project).

## S
- **SAST** — South African Standard Time (UTC+2). Dylan's timezone.
- **Schedule 2** — regulatory schedule under the ER