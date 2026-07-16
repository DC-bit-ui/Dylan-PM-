# Cowork Task — HubSpot EIH Property Flow Diagram

**Date:** 2026-05-25
**From:** Claude Code (EIH Automation repo)
**To:** Cowork — `agriprove-pm` skill (PM framing) + `agriprove-design` skill (visual production)
**Action requested:** Produce a single-page visual diagram explaining the HubSpot EIH property flow — what fields exist, where each one is sourced from, where it makes a difference operationally, and why some data stays local rather than going to HubSpot.

---

## Why Dylan needs this

Dylan is briefing AgriProve internal stakeholders (sales / ops / legal / compliance / leadership) on the EIH automation rollout. The HubSpot integration is the most-visible surface for non-EIH-app users — most stakeholders will only ever see the deal record, not the EIH app itself. The diagram should make it obvious:

1. Why each HubSpot field exists (so admin understands and doesn't archive them)
2. Where each field drives a real operational consequence (so users know which to watch)
3. Where the "single source of truth" lives for each piece of data
4. **Specifically** what the `partner` enum does — it's the highest-impact field in the entire map (drives KCT template selection) and the most likely to be set wrong

The Cowork `agriprove-pm` skill should calibrate tone for AgriProve internal voice. The `agriprove-design` skill (or fall back to FigJam / Miro / Lucid via Cowork's diagram tools) should produce the visual.

---

## Source material

Full HubSpot property map: [`memory/deliverables/2026-05-25-hubspot-eih-property-map.md`](../../memory/deliverables/2026-05-25-hubspot-eih-property-map.md)

This is the authoritative content — use it as the data layer the diagram visualises.

---

## Suggested diagram structure (proposal — Cowork may iterate)

A left-to-right flow with five swim-lanes:

```
┌──────────────┐    ┌────────────┐    ┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│  Sources     │ →  │  Parser    │ →  │  EIH app    │ →  │  HubSpot     │ →  │  Consumers     │
│              │    │            │    │  (project)  │    │  (deal)      │    │                │
├──────────────┤    ├────────────┤    ├─────────────┤    ├──────────────┤    ├────────────────┤
│ Title PDFs   │    │ Track B    │    │ LandTitle   │    │ 7 EIH props  │    │ Sales (deal    │
│ D&D portal   │    │ parsers    │    │ EIH         │    │ (agriprove_* │    │  review)       │
│ SharePoint   │    │ (NSW/QLD/  │    │ Project     │    │  group)      │    │ Ops (workflow  │
│ Frontier     │    │  VIC/etc)  │    │ Snapshot    │    │              │    │  queue)        │
│ HubSpot deal │ →  │ classifier │ →  │             │ →  │ 'partner'    │ →  │ Legal (KCT     │
│ ('partner')  │    │            │    │             │    │ READ ←──────│    │  template      │
│              │    │            │    │             │    │              │    │  routing)      │
└──────────────┘    └────────────┘    └─────────────┘    └──────────────┘    │ Compliance     │
                                       ↓                                      │  (audit log)   │
                                  ┌─────────────┐                             │ CER lodgement │
                                  │ Snapshot    │                             │  (ERF CSV)     │
                                  │ (13 fields, │                             └────────────────┘
                                  │  local only)│
                                  │ — audit     │
                                  └─────────────┘
```

### Key visual cues to include

1. **Direction of flow arrows.** Most data flows L→R. The `partner` property is the one major **R→L** read (HubSpot is the source of truth; EIH app reads it). Make this arrow's direction explicit — it's the "input from sales" into the operational flow.

2. **The `partner` legal-document fork.** A clear branching visual in the EIH app lane:
   - `partner === "LawrieCo"` → LawrieCo KCT template
   - `partner` is null / other → AgriProve KCT template
   - Both branches feed into PandaDoc → signed agreement
   - Highlight the consequence: wrong setting = wrong legal doc to the client

3. **What stays local.** ProjectSummarySnapshot (13 fields) sits in a separate visual block from the 7 HubSpot fields. Annotate why: "Compliance audit — CER-defensible record. Doesn't bloat HubSpot deal view."

4. **Consumer arrows** show WHO uses each HubSpot field:
   - `agriprove_consents_outstanding` → Sales/ops pipeline review
   - `agriprove_mortgagee_names` → Bank-chase workflow (separated from summary for filterability)
   - `agriprove_has_crown_eih` → Crown lands engagement timeline
   - `agriprove_titles_progress` → Status calls
   - `agriprove_app_url` → Drives back to the canonical EIH workspace
   - `agriprove_eih_summary` → Account-exec reviews, status updates
   - `agriprove_erfid` → Universal ID for cross-system reconciliation

5. **Partner badge surface.** Show that the `partner` property doesn't just route templates — it also surfaces as an **orange badge in the EIH app project header**, so operators know which template a Create-KCT click will use before they click. This is the operational guard against silent mis-routing.

---

## Constraints

- **Single page.** Stakeholders should grasp the whole flow in 30 seconds.
- **No code/JSON.** This is for non-developers. Translate `agriprove_eih_summary` → "EIH summary text on the deal", etc.
- **Stress the `partner` lynchpin.** It's the field most likely to be mis-set and most operationally consequential. Visually anchor it.
- **AgriProve voice.** Direct, no jargon-padding. Calibrate against `memory/profile/communication.md`.

---

## Deliverable

Save the polished diagram + a brief annotating note to `memory/deliverables/2026-05-25-hubspot-eih-property-diagram.md` (or equivalent visual file format). Don't auto-share to external stakeholders — Dylan reviews + distributes.

Optional: if the `agriprove-design` skill produces a FigJam/Miro link, surface that for in-Cowork preview before saving the static export.
