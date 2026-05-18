# Products

**Last updated:** 2026-04-28 (populated from Cowork handoff)

> One section per product / surface Dylan touches. Confirmed as of the cowork handoff.

---

## HORIZON
- **What it is:** AgriProve's predictive SOC (Soil Organic Carbon) model — the core product. Gives landholders spatial visibility into soil carbon, enabling ACCU earning.
- **Stage:** GA / mature; under continuous validation
- **Backend:** Python Temporal workers
- **Owner (engineering):** Cadel Watson is dev lead
- **Dylan's involvement:** PRD support, model validation framework requirements (epic AP-2116), Schedule 2 readiness
- **Active epic:** **AP-2116** — Prepare model validation framework for first Schedule 2 run (Cadel; Development)

## Frontier
- **What it is:** internal CRM-adjacent tool — lead management, property creation, GeoMapper-based spatial mapping, snapshot generation
- **Stage:** Phase 2 in Development — highest-activity area
- **Owner:** Dylan (PM)
- **Tech:** React + Chakra UI; ArcGIS for spatial; integrates with HubSpot
- **Active epics:**
  - **AP-1963** — Frontier Phase 2 (Dylan; Development)
  - **AP-2009** — Frontier property management (Dylan; Development)
- **Users:** internal team; Field team (Hobbs, Ben) are users

## Stormboy
- **What it is:** systematic field recruitment campaign targeting 500+ ha agricultural properties in the Murray-Darling Basin for soil carbon project sign-ups. 7-stage pipeline: Geographic Scoping → Lead Gen (Claude Code scraper) → Lead Research → Call List & Outreach → Farm Visit → HORIZON Snapshot (post-visit) → Post-Visit Conversion (KCT)
- **Stage:** active operational; Phase 1 delivered ~23,000 ha pipeline; VIC expansion underway
- **Owner:** cross-functional — Claudia (Growth tooling / Claude Code scraper), Hobbs & Ben (field team), Dylan (PM-side alignment + Frontier spatial intelligence)
- **Tech:** Storm Boy Claude Code Tool (Claudia's CLAUDE.md router architecture), HubSpot (`contact_lead_stage_storm_boy` 10-stage pipeline), Frontier (spatial view + snapshot automation), HORIZON model
- **Positioning:** "Fellowship Not Sales" — ~40% positive response rate vs industry 5-10%
- **Skill:** `memory/deliverables/skills/operation-stormboy-SKILL.md` — comprehensive end-to-end process reference
- **Note:** Stormboy spans process + tooling + field operations; not a discrete product surface

## Verterra
- **What it is:** separate product line
- **Stage:** _(to confirm)_
- **Owner:** _(to confirm)_
- **Dylan's involvement:** _(to confirm — likely lower priority than Frontier/HORIZON/Stormboy)_

## ReadyGraze
- **What it is:** separate product line
- **Stage:** _(to confirm)_
- **Owner:** _(to confirm)_

## KCT (Operation KCT)
- **What it is:** a crediting workflow tied to **Koolah Carbon Trust** context
- **Stage:** Phase 1 in Development
- **Owner:** Steve Le Moenic
- **Active epic:** **AP-1964** — Operation KCT (phase 1)

## LawrieCo referrer view
- **What it is:** referrer-view feature for LawrieCo (likely a partner / referrer)
- **Stage:** Development
- **Owner:** Steve Le Moenic
- **Active epic:** **AP-1965** — LawrieCo referrer view

## Crediting Workflow Template — T1 Offsets Report
- **What it is:** crediting workflow template; T1 Offsets Report
- **Stage:** Discovery
- **Owner:** unassigned
- **Active epic:** **AP-2187** — CREDITING WORKFLOW TEMPLATE — T1 Offsets Report

---

## Decommissioned / archive
_(none captured yet)_
