# Ben feedback: outbound draw-and-confirm flow + non-contiguous boundaries

**Date:** 2026-06-17
**Type:** product feedback + scope additions (Ben, via meeting) — Farm Map Drawing Tool (AP-2514)
**Trigger:** Ben's feedback on the tool in a meeting, relayed by Dylan.

## 1. Outbound "Ben draws, customer confirms" flow [feasible, high]

Ben wants to send an **outbound** version: **he draws the boundary**, sends it to the customer, the customer **receives it and confirms whether it's them** — with the land **titles listed** and the ability to **add/remove** any — then it triggers the Snapshot.

- This is the **inverse** of the inbound flow (customer draws). It reuses the same pieces: the map/draw tool (Ben draws), Geoscape parcel detection (titles under the drawing), and a customer-facing **"Confirm your property"** view (map + titles list + add/remove + confirm).
- It is the natural shape of the deferred **"Request Map from User" tokenised URL** (AP-2525 fast-follow): Ben draws -> system detects titles -> sends a tokenised confirm link -> customer confirms/adjusts -> Snapshot. Confirmation doubles as a soft consent + data-quality signal.
- Customer-side titles: present visually (tap land on the map to toggle), plain language, not lot/plan jargon front-and-centre.

## 2. Non-contiguous boundaries [feasible, low/med — mostly draw-UX]

Current design only handles **contiguous** (one connected) boundaries. Need the customer to **add non-contiguous** areas (land in separate blocks/paddocks that don't touch).

- **The parcel/property model already supports this** [high, grounded in agriprove-backend domain-model]: a Property is a set of Parcels (via Property_Parcel) and the property boundary is computed at runtime as the union of its parcels — nothing requires them to be contiguous. So multi-part is native on the back end.
- The change is mainly **front-end draw UX**: after closing the first area, "Add another area" to draw more separate polygons; sum hectares across all; list/edit/remove each area. Parcel detection runs per polygon; property = union of all detected parcels.
- Flag to confirm with Cadel: HORIZON running on a **multi-part AOI** (disjoint geometry) — confirm the model accepts it.

## Actioned
- Added two design-prompt iterations to `design/claude-design-prompt.md`: Round 7 (non-contiguous multi-area drawing) and the outbound customer "Confirm your property" screen.
- Drafted a Cadel update (`Farm Map Drawing Tool/comms/cadel-update-outbound-noncontiguous.md`).
- Not yet in PRD / tickets — pending Cadel's read on whether they change AP-2519 or need their own stories.

Source: Ben (meeting, 2026-06-17) via Dylan; agriprove-backend domain-model for the parcel-model grounding.

## Decision (2026-06-17, Dylan): outbound confirm = tap-to-toggle titles, not re-draw

For the outbound "Confirm your property" screen, the customer **confirms/adjusts by tapping titles on/off** (the parcels are already detected) — NOT by re-drawing. Re-drawing would re-introduce the over-capture problem the confirm is meant to close. Draw is for the blank-slate inbound flow; tap-to-toggle titles is for confirming an existing detection.

- Deliberate split from the inbound rule "don't expose the parcel selector to users": that holds for the cold draw, but a warm Ben-initiated confirm uses a **simplified** title toggle.
- **Design principle [Dylan, applies going forward]:** the title/parcel selection must be **aesthetic and simple, not overwhelming**. Standard parcel-selection UIs (dense tables, codes, many controls) are too much for a farmer-facing screen. Lead with the land + area in plain language; lot/plan codes are secondary; map is the hero; soft highlights; generous whitespace.
- "Add a block somewhere else" (draw/add a separate area) is a tucked-away secondary escape for land Ben did not include — this is where non-contiguous lives in the outbound flow.

Locked into the outbound "Confirm your property" Claude Design prompt in `design/claude-design-prompt.md`.

## Decisions (2026-06-17, Dylan) — outbound reshaped + non-contiguous settled

**Outbound is select-not-draw.** Ben does NOT draw the boundary; he **selects the property's parcels in the existing Frontier parcel selector (Manage Parcels)** and **sends them to the customer to confirm via Frontier**. So the old "Ben draws -> Geoscape detects" steps are dropped. New flow: Ben selects parcels in Frontier -> send to customer to confirm (Frontier) -> customer taps to keep/remove/add titles + confirms -> finalise + request Snapshot + ack -> HORIZON -> Snapshot emailed. The confirm link is the parked tokenised "Request Map from User" link (AP-2525). "Something's not right" = request a call.

**Non-contiguous settled:**
- **No cap on areas**, but **one request per property** — if a landholder has multiple properties, that's a separate request each, because the HORIZON model gives **property-relative carbon variation insights** (mixing properties would muddy it). Add a gentle disclaimer.
- **Touching/overlapping areas: keep as drawn**, let parcel detection resolve it (no merge).
- UX: confirm the single area, then choose to add more blocks; mobile = crosshair + "Add point" per area, then "Add another area" / "Done".
- Ben's review overlay shows all areas.
- **HORIZON accepts a multi-part area of interest — confirmed** (Dylan). The one prior unknown is closed.

Both diagrams updated in `design/explore-flows.html`; prompts updated (outbound = select-and-send; Round 7 non-contiguous + the per-property disclaimer). No ticket changes (designs only; this week is the test).

**Confirm-screen map (2026-06-17, Dylan):** the customer confirm map must look like the REAL parcel map (full cadastre/parcel boundary lines across the view, like the Frontier Select Parcels flow), with owned titles highlighted on top — not titles floating on bare satellite. **Limit rendered parcels to a 5-10km radius** around the property (performance + don't overwhelm). Baked into the outbound prompts.
