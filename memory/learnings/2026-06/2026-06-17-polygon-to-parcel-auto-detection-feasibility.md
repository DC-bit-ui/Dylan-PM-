# Polygon -> parcel auto-detection for property creation: feasibility

**Date:** 2026-06-17
**Type:** technical feasibility exploration (grounded) — Farm Map Drawing Tool fast-follow
**Trigger:** Dylan asked whether "GeoMapper" could detect parcels under a drawn polygon, as an automated way for Ben to create a property.

## Findings

- **GeoMapper is NOT the parcel engine** [moderate]. Across our docs (Storm Boy SOP, HORIZON Snapshot Claude AI Workflow SOP, apex briefing, snapshot backend handoff) GeoMapper is a **Frontier/HubSpot map visualisation** — it shows property polygons linked to HubSpot contacts, and the snapshot page-4 regional map is "a manual HubSpot GeoMapper screenshot." It displays geometry, it does not resolve cadastral parcels. Don't use the GeoMapper name when scoping this with eng.
- **The parcel engine is Geoscape (our GA Espace integration)** [high]. Per the Frontier Property Creation PRD (Confluence 524189703): property creation = "lightweight Geoscape parcel lookup + save to Platform DB," keyed off the **address** (address search → Geoscape → "an initial set of cadastral parcels"), which Growth reviews + supplements via Manage Land Titles. Geoscape "returns a starting set, not a complete boundary" — human review is already designed in.
- **Polygon -> parcels is a spatial intersection** (drawn polygon ∩ cadastral parcels). Feasibility hinges on one question: does our Geoscape/GA Espace integration support a **spatial/geometry query** (parcels intersecting a polygon, or point-in-parcel) or only the **address** query we use today? [unconfirmed — the key question for Cadel/Gayathri]
  - If geometry query supported: modest extension of the existing lookup (pass polygon/vertices/centroid instead of address).
  - If address-only: query an ArcGIS/Esri cadastre feature layer by geometry, or PostGIS `ST_Intersects`. But we likely only store parcels for already-created properties, not the national cadastre [ASSUMPTION], so a pure-internal query won't cover cold prospects.
- **Data-model fit is clean** [high]: HORIZON runs per property; the property boundary is the union of its parcels (never stored). Auto-selecting intersecting parcels directly yields the property geometry.
- **Realistic outcome = pre-select-and-confirm, not unattended auto-create.** A rough hand-drawn boundary clips parcels partially / grabs neighbours / misses corners, so you get a candidate set needing an overlap rule (intersect / majority-overlap / centroid-inside) plus Ben's confirm gate. This is exactly the "auto first-pass property lookup / auto-match polygons" fast-follow already deferred with Cadel.
- **Already being evaluated:** a standing task "analyse last 10 snapshot requests vs Geoscape data (address/parcel accuracy)" is noted in EOD retros as **gating the automated-property-creation decision** [high]. The accuracy evidence is being gathered.

## Recommendation

1. Ask Cadel/Gayathri (Gayathri owns the parcel-level connection per domain-model) the precise question: does Geoscape/GA Espace support a spatial query (polygon-intersect or point-in-parcel) or only address lookup?
2. Frame the goal as pre-select-and-confirm (pre-fill candidate parcels for Ben), not auto-create. Gate on the Geoscape-accuracy analysis in flight.
3. Keep as the fast-follow (v1 stays manual). If feasible it is the single biggest lever on Ben's per-submission setup time (the scaling bottleneck).

Source: agriprove-backend skill (system-architecture, domain-model, request-lifecycle); Confluence PRD Frontier Property Creation (524189703); memory EOD retros (Geoscape-accuracy task). This Cowork session, 2026-06-17.

## Update (2026-06-17) — Cadel confirmed; automated property creation moved INTO v1 [high]

Cadel's answer to "does Geoscape/GA Espace support a spatial query": "We can pick up parcels underneath the polygon easily - either any that are completely contained, or any which are contained or overlapping." So the spatial query is feasible.

**Decision (Dylan):** change direction to **automated property creation in v1**. New flow: on submit, auto-create/match the HubSpot contact -> **Geoscape detects the parcels under the polygon and auto-creates the Frontier property** (or matches an existing one), linked to the contact -> notify the platform notifications channel + Aircall SMS/email -> **Ben confirms via Manage Parcels** (drawn polygon side-by-side), trims/adds parcels -> requests the Snapshot and calls.

This **supersedes** the round-5 "manage-vs-create is manual in v1" call (manual lookup is no longer needed) and the round-4 "auto-match polygons is a future phase." It is the pre-select-and-confirm model from above, now confirmed feasible and pulled into v1 because Cadel says it is easy and we already have the contact + address + property name.

**Two open sub-decisions (flagged to Dylan, not yet locked):**
1. **Parcel-selection rule:** parcels *contained* vs *contained-or-overlapping* the polygon. Recommend **contained-or-overlapping** so a loose hand-drawn boundary never under-captures; Ben trims neighbours in Manage Parcels. (Under-capture = Ben hunts for missing parcels; over-capture = Ben deselects. Over-capture is the safer error.)
2. **HubSpot->Platform sync timing:** the funnel writes the new contact to HubSpot directly, but HubSpot->Platform is polled ~15 min, so confirm how the auto-created Frontier property links to the just-created contact (timing/ordering). Ask Cadel.

Boundary stays **display-only** (Frontier overlay + notification thumbnail), never the cadastral boundary; Ben confirms parcels. Propagated to: proposal-and-flows.html (both diagrams + all sections), ben-handoff-concept.html, Confluence PRD Core (v7) + Epic Hub (v5). The tokenised "Request Map from User" URL remains a fast-follow.

### Both sub-decisions locked (2026-06-17, Dylan)

1. **Parcel rule = contained-or-overlapping** (Dylan agreed; Ben trims extras in Manage Parcels).
2. **Ordering = wait for the ~15-min HubSpot→Platform sync, then create the property, then notify Ben** (Dylan: create the property only once the contact is fully set up, so Ben opens a fully set-up property; the instant Aircall SMS + email still fires at submit).

**V1 build story raised: [AP-2525](https://agriprove.atlassian.net/browse/AP-2525)** (Story under AP-2514, Ready for development, unassigned for a dev to self-assign).

**New diagram:** added an **ENG vs Ben swimlane** (replaced the linear internal-flow diagram in `proposal/proposal-and-flows.html` section 2) — ENG lane runs to a confirm-ready property (contact, ack, wait-for-sync, Geoscape auto-create, channel post); Ben lane confirms via Manage Parcels, requests Snapshot, calls; then HORIZON delivery. Propagated the ordering into the unified journey too. Confluence PRD Core now v8, Epic Hub v6 (AP-2525 added to the Jira table). Saved the swimlane as `design/farm-map-internal-flow.png` (+ .svg).

### Delivery tail corrected (2026-06-17, Dylan) — and "Vibezone" [moderate]

The delivery end is **Ben-driven, not automated**. Corrected sequence after Ben requests the Snapshot + calls:
1. **HORIZON model run** (ENG).
2. **Teams channel notification to Growth** (ENG) when the run completes.
3. **Ben creates the Snapshot in the Vibezone app** — `Vibezone` is the app Ben uses to build the HORIZON Snapshot report (new term; the deliverable is produced here, not auto-generated). [moderate]
4. **Snapshot delivered by email from Ben** (the customer-facing "within 1 business day" is Ben's email, not an automated send).
5. **Follow-up email** (Ben).

This corrects the earlier "Snapshot delivered (automated)" framing in the diagrams. Updated: swimlane SVG + PNG, the unified-journey delivery tail, and the Ben handoff concept steps.

### 2nd Cadel meeting (2026-06-17, [Granola](https://notes.granola.ai/t/90e3ee22-7a43-4576-a599-7e4d30108b62-008umkv4)) — swimlane review [high]

- **SMS/email = HubSpot / Marketing automation, NOT platform-native.** Split it out as its own owner/stage; likely owned by Daniel / Marketing (Daniel already said AgriProve can facilitate it). Shown as a separate lane in the swimlane.
- **15-min HubSpot sync wait REMOVED** (reverses the prior-turn lock). The platform creates the HubSpot contact **directly at submission**, so there is no downstream-sync dependency and the workflow proceeds immediately. (Dylan had worried the wait was a bottleneck; Cadel confirmed it's unnecessary.)
- **Overlap parcel logic confirmed** as the default (safer to over-capture than under-capture). **Ben is the manual review gate**: open the submitted map, compare against Frontier, and remove any neighbour parcel caught by slight overlap (Dylan's example: a drawing clipping ~3% of an adjacent parcel). Overlap alone is not a trusted final answer.
- **OPEN (Dylan + Cadel to define): the actual Frontier parcel-correction UX** — once Ben sees an incorrectly included parcel, how does he remove/adjust it inside Frontier, and does it differ for a brand-new property vs an existing prospect? The flow is agreed in intent but the Frontier-side action is not yet defined.
- **New contact vs existing prospect:** new = clean create-and-review (platform creates contact + property; notification links to the new record). Existing prospect = **notification + Ben manual review/management** (no automated merge — avoid overwriting/confusing existing records).

Diagram rebuilt as a **3-lane swimlane (Platform (ENG) / HubSpot-Marketing / Ben)**; PNG + SVG re-rendered (`design/farm-map-internal-flow.png`). Propagated to the proposal HTML + Confluence PRD (v10) / Hub (v8) + AP-2525.

**Ben calls the farmer FIRST** (within 15 min, confirm receipt + re-engage) **before** reviewing the map against Frontier — reinstated as its own step in the swimlane (it had been bundled into "request + call"). Ben lane order: call → review map vs Frontier (trim overlap) → request Snapshot → (after run) Vibezone → email → follow-up.

### Actions (2026-06-17): tickets + design prompts

New stories raised under AP-2514 (non-eng; the eng build breakdown is left for Cadel via AP-2519, per Dylan):
- **AP-2525** Automated property creation from the drawn polygon
- **AP-2526** Aircall SMS + email acknowledgement (HubSpot / Marketing automation, Daniel)
- **AP-2527** Discovery: Frontier parcel-correction workflow (Dylan + Cadel)
- **AP-2528** Design: Ben handoff (notification + Manage Parcels review)
- **AP-2529** Design: dev-ready screens + wireframes for the 3 approved designs

Epic AP-2514 description + Epic Hub Jira table refreshed to the current flow. Two Claude Design prompts added to `design/claude-design-prompt.md`: Ben's internal view (dark Frontier) and dev-ready wireframes for the approved Desktop / Desktop Map Only / Mobile designs.

**Tooling [high]:** Jira descriptions via the Atlassian MCP must be set with **contentFormat=adf** (a proper ADF doc object) to render rich text. Creating with `contentFormat=markdown` double-escaped the newlines (stored literal `\n`), and markdown edits stored raw markdown that Jira showed as plain code. ADF doc objects render correctly.
