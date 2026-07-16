# AP-2514 — Farm Boundary Drawing Tool

**Jira epic:** [AP-2514](https://agriprove.atlassian.net/browse/AP-2514) · **DRI:** Dylan · **Stage:** Discovery · **Created:** 2026-06-15 (live, this session)
**Source:** Requirements meeting 2026-06-15 (Granola, "Map draw and lead capture lightweight flow").

**Workspace:** all deliverables for this initiative now live in the top-level folder **`/Farm Map Drawing Tool/`** (moved from `memory/deliverables/*` on 2026-06-15). See its `README.md`. This file remains the `memory/initiatives/` index entry.

## What it is
Lightweight, mobile-first, no-login landing page where any Australian farmer finds their farm on a satellite map, finger-draws a rough boundary, and submits 4 fields to get a free HORIZON Snapshot. Turns the Snapshot into an always-on national acquisition surface. One link serves cold ad traffic, warm HubSpot leads, and existing contacts.

## Flow (as of 2026-06-15)
On submit (automatic): create/match HubSpot contact, store boundary (GeoJSON), instant SMS + email, surface on Ben's worklist. Ben then calls the customer straight away, and in Frontier creates the property, links the HubSpot contact, uses the parcel selector to identify the correct area, and submits the HORIZON Snapshot request. Customer-facing promise: within 1 business day.

## Engine / imagery [per independent research]
Engine: MapLibre GL JS + Terra Draw + Turf.js. Runner-up: ArcGIS JS SDK. Avoid Google Maps (ToS prohibits tracing off satellite + cost + removed drawing library). Imagery is a separate, swappable decision: recommend a free CC-BY state-government aerial trace surface (e.g. NSW SIX Maps), Esri/global fallback. Tracing permission attaches to the imagery, not the engine; Esri's free tier does NOT permit commercial tracing. Confirm CC-BY licence + tracing terms per state before build lock.

## Stories (live in Jira)
- [AP-2515](https://agriprove.atlassian.net/browse/AP-2515) — Scope requirements (Dylan)
- [AP-2516](https://agriprove.atlassian.net/browse/AP-2516) — Create PRD (Dylan)
- [AP-2517](https://agriprove.atlassian.net/browse/AP-2517) — Create implementation plan (Dylan)
- [AP-2518](https://agriprove.atlassian.net/browse/AP-2518) — Scope potential mapping solutions (Dylan)
- [AP-2519](https://agriprove.atlassian.net/browse/AP-2519) — Create technical implementation plan (Cadel)

## Deliverables
All consolidated in the top-level workspace **`/Farm Map Drawing Tool/`** (see its `README.md`): PRD Core + Design Appendix (`prd/`), proposal & flows (`proposal/`), engine research incl. the canonical independent version (`research/`), mobile + desktop concepts, working prototype, Ben handoff, Claude Design prompts (`design/`), and the Cadel post (`comms/`).

## Open / next
- Confluence Epic Hub + child pages created (see below); Cadel briefed.
- Confirm CC-BY imagery licence + tracing terms per target state before build lock.
- Watch-item: Ben's per-submission setup is the scaling bottleneck — auto-prefill property-from-polygon.
- Ben handoff concept in rework; mobile v2 (playful) exploration running in Claude Design.

## Confluence (SCRUM space)
- [Epic Hub](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/615120907) · [PRD Core](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/615448578) · [Design Appendix](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/615514124) · [Implementation Plan and Flows](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/615874562) · [Engine Research](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/615710752) · [Farmer Design Concept](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/615710731)

## Changelog
- 2026-06-15 — Epic + 5 stories created live in Jira; initiative opened. Deliverables drafted from requirements meeting.
- 2026-06-15 — Confluence Epic Hub + 5 child pages created in SCRUM; epic AP-2514 cross-linked via comment. Cadel post sent. Source meeting confirmed as the session with Hobbs.
- 2026-06-15 — Independent engine research corrected the Esri overstatement (free tier is not licensed for commercial tracing); imagery strategy = CC-BY state-gov aerial trace surface. Fun made an explicit PRD requirement; desktop concept added.
- 2026-06-15 — Consolidated all deliverables into the top-level workspace `/Farm Map Drawing Tool/` (moved from `memory/deliverables/*`).
