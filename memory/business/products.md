# Products

Last-verified: 2026-07-16 · Review-by: 2026-10-14 · Verified-by: claude-code (rebuild pass: statuses/epics removed → NOW.md; Verterra/HORIZON Profile/Groundwork added)

> One section per product/surface: what it IS (durable). What's active on it right now — status, epics, owners — lives in `memory/state/NOW.md` (single-source rule).

---

## HORIZON
- Predictive SOC (Soil Organic Carbon) model — the core product. Python Temporal workers. Source of truth for carbon calculations; validated against Schedule 2 requirements (first validation framework epic AP-2116, Done 2026).
- HORIZON 2.0 model generation in progress (handover from Cadel underway — see NOW.md).

## HORIZON Profile (product — formerly "Snapshot", renamed 2026-07-11)
- The per-property carbon/natural-capital report generated from a boundary + HORIZON run. Historically produced off-platform ("vibe build"); being rebuilt natively as the **Modular Snapshot Generator** (AP-2609) with water-quality pages.
- ⚠️ Naming collision: "Horizon Profile" is also the working title of the bank risk-profiling artifact — see NOW.md §Naming.

## Groundwork (working name, 2026-07-13)
- The top-of-funnel acquisition tool: farmer finds their farm, draws a boundary, submits details, receives a free HORIZON Profile. Comprises the Farm Boundary Drawing Tool (v1 live; AP-2514) + landing pages + HubSpot/Aircall automation + Frontier property auto-creation.

## Frontier
- Internal CRM-adjacent tool: lead management, property creation, GeoMapper spatial mapping, HORIZON Profile generation. React + Chakra; ArcGIS; HubSpot-integrated. Field team (Hobbs, Ben) are primary users.
- Current investment: the **Prospective Projects restructure** — 4-stage model: Land Titles (AP-2566) → KCT Mapping → Consents (AP-2567) → Registration.

## Stormboy
- Systematic field-recruitment campaign targeting 500+ ha properties (Murray-Darling Basin; VIC expansion). 7-stage pipeline: Geographic Scoping → Lead Gen (Claudia's scraper) → Lead Research → Outreach → Farm Visit → HORIZON Profile → Post-Visit Conversion (KCT). "Fellowship Not Sales" positioning (~40% positive response vs industry 5–10%). Spans process + tooling + field ops, not a discrete product surface. Full reference: `memory/deliverables/skills/operation-stormboy-SKILL.md`.

## Verterra
- Water-quality/reef-credit collaboration partner (HoA executed 2026-04-16; UJV in negotiation; Joint IP analytical layer). AgriProve × Verterra pathway: HORIZON × DROVER attribution validation + water-quality data exchange (AOI in / results out). Technical contact: Olivier Decitre. Epic AP-2608.

## ReadyGraze
- Grazing-management software line: turns device data (Ceres GPS tags, moisture/water probes) into on-farm insight. Monetised inside the ECP deal at $70/tag. Major UX rebuild epic AP-948. Related concept work: grazing infrastructure planner (design stage — rules.md 2026-07-08 ×2).

## KCT (Operation KCT)
- Crediting workflow for the Koolah Carbon Trust (phase 1 epic AP-1964, Done). KCT tooling continues inside Frontier (KCT mapping stage of Prospective Projects; live dev tickets — see NOW.md).

## Crediting Workflow Template — T1 Offsets Report
- Template for the full crediting workflow to a first Offsets Report + ACCU application under the ERF 2021 Soil Carbon Method (pipeline stages OPS012→OPS017). Epic AP-2187 (Discovery).

## Bank / insurer risk-intelligence offering (