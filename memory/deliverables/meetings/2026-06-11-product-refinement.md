# Product Refinement Meeting — Synthesis

**Date:** 2026-06-11 (recorded 04:31 SAST / 12:31 AEST, 12m 36s)
**Source:** Granola transcript "Product refinement meeting-20260611_143140" (uploaded to Cowork session 2026-06-12)
**Attendees:** Cadel Watson, Will Frecheville, Steve Le Moenic, Kieren Whittock
**Absent:** Dylan (synthesis prepared post-hoc)

---

## Decisions made

1. **KCT Light suspended.** Will + Kieren decided (via general discussion, not a formal forum) to suspend KCT Light documentation. Rationale: it added an extra information-gathering process on Ben while he is running outbound Storm Boy calls. Keep the current standard-KCT process and improve it incrementally; address the original KCT Light problems through an education series / comms instead of early document generation. [high]
2. **Press on with standard-KCT mapping.** Confirmed working well; continue. [high]

## Items touching Dylan's surfaces (EIH / land titles / Frontier)

- **EIH + land-title integration flagged as a priority bottleneck.** Will's point: each land title maps to a specific project, and ownership dictates whose consent/contact details are needed — but Ben isn't getting that info until *after* purchase, which delays getting the KCT out (he has to go back and chase emails). Will explicitly wants Dylan's EIH + land-title work prioritised so it ties into CPP generation. [high]
- **Cadel endorsed the full-pipeline vision:** prospecting → Frontier → KCT, with Dylan's EIH designs now being integrated into the ops app as the logical next step toward an automated flow. [high]
- **Old design specs can be repurposed.** Steve said he produced some design specs "a while ago but no one used them"; Will clarified the live version is Dylan's work with Claudia (template uploaded, running through Claudia now). Agreement to repurpose/improve those once in the full flow, with language tweaks. [high]

## Other items (FYI — not Dylan-owned)

- **CPP next iteration (Will/Joe):** current state is one template per project generated via Claudia (requested → pulls playbook → generates in template → downloaded → uploaded to SharePoint). Next step: once project configuration + paddock maps exist, generate the correct number of CPPs per project, templated and auto-dropped. Steve raised wanting CPP generation tied to an in-system audit trail rather than only living on SharePoint. [high]
- **Intra-land-title project split (Steve):** more cases than expected — Michael has one land title carrying 15 projects, splitting by paddock map. Needs paddock-level input, not just a hectare split. Cadel/Will see it as worth modelling. [high]
- **CER mapping order / UI confusion (Will/Joe):** CER's logical order is exclusions → CEA → EAA, but the team actually works exclusions → map ineligible land (EAA, e.g. sloping) → the gap becomes the CEA. Joe finds the UI/UX confusing as to what's accepted as CEAs/shapefiles and how it flows into Strata. Plan: Steve to sit with Joe, gather consistent feedback across 3–5 projects, then batch one change as a workstream rather than piecemeal. [high]
- **HORIZON / model changes (Cadel):** adding extra analytes (N, pH) into the model (validation already runs off SharePoint data); recording when a value is below limit of detection (currently halved per standard practice, which hides the distinction from the model). Audit logging for all lab results now implemented (baseline values + change tracking). Goal: after these changes, stock calculator and offsets reports should match exactly (within ~0.5% rounding); a mismatch becomes a failure case. Intent — submit Schedule 2 from the ops app once confident, with a manual check on the first one. [high]
- **Harry (WA customer) pressure (Will):** Harry asked when HORIZON v2 (Model 2) will be ready/deployed and how many more samples before accurate prediction; also "baffled" there are no factors for microbial activity / root depth. Will to deflect — big piece of work, no timeline — and frame the new architecture as able to ingest that data; if Harry shares his below-ground biomass database, AgriProve can correlate it. Cadel: "we're limited by availability, not lack of want." [high]

## Actions / next steps for Dylan

- **Reply to Will** confirming where the EIH / land-title → CPP integration sits in the queue; the post-purchase info gap is actively delaying KCTs. [recommended]
- KCT Light suspension resolves the open question in the Notion task "Operating system — Confirm KCT Light vs Full approach with Will and German" — candidate to close/update. [moderate — confirm before marking done]

## Related

- [2026-04-30 EIH Automation synthesis](2026-04-30-eih-automation-synthesis.md)
- Active EIH/land-title Notion tasks: PandaDoc API shape with Cadel (hard blocker), EIH ops dashboard app integration, Land Titles meeting with Michael + Cadel.
