# Glossary

**Last updated:** 2026-04-28 (initial population from Cowork handoff)

> Internal terminology, acronyms, codenames. Claude should check here before asking what something means.

---

## A
- **ACCU** — Australian Carbon Credit Unit. The tradable carbon credit issued under the ERF. AgriProve's commercial purpose is to enable landholders to earn ACCUs.
- **AEST** — Australian Eastern Standard Time. Team's primary timezone.
- **AP** — Jira project key for **AgriProve Platform** (primary delivery project).
- **AO** — Jira project key for **AgriProve Operations** (business workstreams).
- **Apex** — Dylan's automated daily workflow system: Morning Briefing (04:45 SAST) + EOD Reconciliation (12:00 SAST) + Command Center artifact. Lives in Cowork.
- **ArcGIS** — spatial data platform used by Frontier for GeoMapper.

## C
- **Chakra UI** — React design system used by AgriProve frontends.
- **Cowork** — the Claude environment where Apex runs and connectors live (vs Claude Code which runs this repo).

## E
- **ERF** — Emissions Reduction Fund (Australian government scheme that issues ACCUs).

## F
- **Frontier** — internal AgriProve tool for lead/property management, GeoMapper, snapshots. See `memory/business/products.md#frontier`.

## G
- **GA Espace** — government carbon registry integration (Australia).
- **GeoMapper** — Frontier's spatial mapping module.
- **Granola** — meeting transcript / notes platform; primary source for `meeting-synthesizer`.

## H
- **HORIZON** — AgriProve's predictive SOC model. Core product.
- **HubSpot** — AgriProve's CRM.

## J
- **JTBD** — Jobs To Be Done. Dylan's preferred framing for user need (Job Stories over feature descriptions).

## K
- **KCT** — Koolah Carbon Trust. Operation KCT is the related crediting workflow (epic AP-1964).

## L
- **LawrieCo** — partner/referrer with a dedicated referrer view in AgriProve (epic AP-1965).
- **Lean Core + Design Appendix** — Dylan's PRD format. Minimal core spec, design lives separately in appendix.

## P
- **P0 / P1 / P2 / P3** — Apex priority levels. See `memory/profile/decision-frameworks.md`.
- **PostGIS** — PostgreSQL spatial extension; used by AgriProve's database.
- **PRD** — Product Requirements Document.

## R
- **ReadyGraze** — separate AgriProve product line.
- **ROAD** — Jira project key for **Roadmap** (Product Discovery project).

## S
- **SAST** — South African Standard Time (UTC+2). Dylan's timezone.
- **Schedule 2** — regulatory schedule under the ERF / ACCU scheme. AgriProve preparing for first Schedule 2 model validation run (epic AP-2116).
- **Shape Up** — Basecamp's product development methodology. Dylan uses Shape Up-style **appetite sizing**.
- **SOC** — Soil Organic Carbon. The thing HORIZON predicts.
- **Stormboy** — codename for the lead generation pipeline + process alignment (Growth × Field × Product).
- **Supabase** — auth provider used by AgriProve.

## T
- **T1 Offsets Report** — first-tier offsets report; subject of crediting workflow template epic AP-2187.
- **Temporal** — workflow orchestration framework; used by HORIZON's Python workers.

## V
- **Verterra** — separate AgriProve product line.

---

## Active Jira epics (alphabetical-by-key)
- **AP-1963** — Frontier Phase 2 (Dylan, Development)
- **AP-1964** — Operation KCT (phase 1) (Steve Le Moenic, Development)
- **AP-1965** — LawrieCo referrer view (Steve Le Moenic, Development)
- **AP-2009** — Frontier property management (Dylan, Development)
- **AP-2116** — Prepare model validation framework for first Schedule 2 run (Cadel Watson, Development)
- **AP-2187** — CREDITING WORKFLOW TEMPLATE — T1 Offsets Report (Unassigned, Discovery)

## Codenames
- **Apex** → Dylan's daily workflow system (this repo + Cowork)
- **Stormboy** → lead generation pipeline / process alignment
- **Operation KCT** → Koolah Carbon Trust crediting workflow
