# Build decisions from Cadel's review: reuse Mapbox, tap-to-place only, no in-app SMS

**Date:** 2026-06-16
**Type:** decisions + corrections (eng-led) — supersede the research's v1 engine/imagery recommendation for this build
**Trigger:** Cadel's feedback on the Farm Map Drawing Tool epic (Teams, Product/Epics, 2026-06-15/16), worked through with Dylan.

## Decisions (locked with Dylan)

1. **Reuse the existing Mapbox stack for v1.** Do NOT switch to MapLibre or integrate SIX/CC-BY imagery — that is weeks of work the app does not need for a v1 validation tool, and Mapbox is already wired in. This **supersedes** the independent research's "MapLibre + CC-BY trace surface" recommendation *for this build*; the research remains valid as general analysis and for cost-at-scale later. [Cadel, eng lead]
2. **The Mapbox/Google "tracing" ToS concern was over-read.** A farmer outlining *their own paddock* is user-generated content about their property, not "tracing imagery to create a derivative vector dataset" (which is what that clause targets — recreating map features into your own basemap/vector tileset). So it does not block Mapbox here. Keep a quick read of the exact clause as cheap insurance, not a blocker. Correction to my earlier strong "avoid Google/Mapbox tracing" framing.
3. **Tap-to-place ("stake method") only; freehand dropped.** Cadel's sketch showed one freehand scribble reads three ways to a computer (human / missed corner / all touched). Explicit vertices remove the ambiguity. Still fun via animation + the area reveal. Pending Hobbs confirming farmers are happy tapping corners.
4. **Base layer: hybrid (satellite + streets/labels).** Imagery farmers recognise plus orientation; cadastral parcel overlay is a nice-to-have where data exists.
5. **No in-app SMS anymore.** v1 acknowledgement = **email + Ben's 15-minute call**; SMS is a fast-follow pending a marketing SMS tool (open question from the Storm Boy discussion).
6. **Account button:** leaning **exclude from v1** (pending final confirm) — excluding removes the only true blocking edge case (account-creation collision); contact match-don't-block handles the rest. See `Farm Map Drawing Tool/prd/signup-edge-cases.md`.
7. **Sign-up edge cases = match, don't block.** One contact, many properties/projects; match on email/phone and attach a new boundary as a new property request; never duplicate; existing project holders route to their owner.
8. **"Fix sign-up natively" is a real red flag** (Cadel agreed) — raise a discovery ticket under AP-2514.

## Why it matters
Engine/imagery is now a settled, pragmatic eng call (reuse what we have) rather than the theoretical optimum. Don't re-surface MapLibre/CC-BY for this build. Tap-to-place + hybrid + no-SMS-v1 are the locked design constraints.


## Update (round 2, 2026-06-16) — finalised with Cadel + Daniel

- **Account button: REMOVED from v1** (decision B: match-don't-create). Funnel matches an existing HubSpot contact (email/phone); if none, Ben creates it with the Storm Boy placeholder check. No auto-create from cold traffic (avoids the AP-2145 dedup mess).
- **SMS = Aircall** (Daniel's pick; also Ben's calling tool). Acknowledgement = Aircall SMS + email + Ben's 15-min call. Confirm the HubSpot/Aircall sync is healthy.
- **Ben handoff is lightweight image + info only.** The drawn boundary is a REFERENCE IMAGE for Ben, not ingested into the DB. Ben creates the property in Frontier himself (address to Geoscape parcels, confirm against the image, link contact, submit Snapshot), per the [PRD — Frontier: Property Creation](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/524189703). Auto-matching polygons is a future phase.
- **Drop the 96-97% Hobbs conversion figure** (unverified).
- **Daniel (head of marketing):** the map/draw tool is the asset, landing pages are flexible wrappers; build it as an embeddable drop-in component. Two desktop variants: full cold/acquisition landing page (Daniel's extended copy) + a map-only one-screen version (warm/known, Hobbs). Make the map obviously the action point; fix mobile miss-clicks with a crosshair + "Add point" model + reassurance microcopy.
- **Discovery ticket AP-2522** raised for fixing platform sign-up natively.


## Correction (same day) — contact creation is AUTOMATED

Reverses the round-2 "match-don't-create / Ben creates manually" note. Final flow: submit -> check **email + name** -> no match: **auto-create the contact** (funnel writes to HubSpot directly) and notify Ben to **create the property + call**; match: **link** and notify Ben to **manage parcels**. email+name dedupe + Storm Boy placeholder check is the safeguard. Account button still removed.


## Update (round 3, 2026-06-16) — unified journey decisions [high]

Added a unified two-route user journey diagram to `Farm Map Drawing Tool/proposal/proposal-and-flows.html`. Decisions made with Dylan while building it:

- **Two lookups, two purposes (the design's spine).** The **HubSpot match** (email + name) decides matched vs auto-created and shapes Ben's notification + dedupe. A **separate Frontier property lookup** (does a property already exist for this land) decides **manage parcels vs create property**. They usually correlate (warm = matched + property exists) but not always, e.g. a known contact with no property yet, so they are distinct steps. Do not collapse "known contact" into "manage parcels".
- **Ben handoff = Teams notification + deep link** (Dylan's pick over HubSpot task / worklist / email). On submit, post to Ben (DM or dedicated channel) with contact, property name, hectares, boundary image, and a deep link to the HubSpot contact; notification text differs by match result.
- **Manage-vs-create signal = auto first-pass lookup, manual fallback** (Dylan's framing). Try to match address / contact / property name -> Frontier property ID and surface it in the Teams notification; if no confident match, Ben searches contact + property name manually. Lean on the existing Frontier->HubSpot sync where the reference already exists.
- **Warm-route (Route 1) link = generic for v1** (recommended given the EOW timeline; Dylan asked which is simpler). Rely on the email + name match (Ben confirms identity on the call). **Personalised/tokenised link** (carries contact + property ID, deterministic match + pre-fill) is a fast-follow.
- **Other proposed automations surfaced as gaps:** trigger Aircall SMS + email on the submit event (ideally a HubSpot workflow, config not code); render the polygon to a static image attached to the contact + embedded in Teams; completion handback event when the HORIZON run finishes so the follow-up is prompted.
- **EOW scope call:** ship the low-cost items (Teams notify, acknowledgement, boundary image, generic link); Frontier auto-lookup and completion handback follow if not trivial against the sync.

Source: this Cowork session (Dylan, 2026-06-16). Not yet propagated to PRD Core / signup-edge-cases (those still describe contact-handling but not the separate Frontier lookup); flagged to Dylan.


## Update (round 4, 2026-06-16) — channel post, unique-URL, backend grounding [high]

Feedback on the proposal/flows doc:

- **Team notification = post to a dedicated Team CHANNEL, not a DM** (Dylan). Rationale: if Ben is on leave, cover can pick it up. Updated both diagrams + gaps + note. Grounds: the existing **HORIZON Snapshot request already fires a Teams notification on submit** (immutable-log + Teams-notify, Pattern C, per agriprove-backend request-lifecycle), so our funnel reuses that exact shape.
- **Unified journey now shows the differing entry UI** (Route 1 = map-only, Route 2 = landing page + map) as a separate row before the shared core converges. Route 1 box copy shortened to fit.
- **Internal flow split into two explicit Frontier boxes** (Existing property → Manage Parcels; No property yet → Create Property) for clarity.
- **Unique-URL idea (Dylan): "Request Map from User" action in Frontier.** Mints a tokenised URL from a Property (or contact), copies to clipboard + opens the HubSpot contact with a template email Ben pastes into. Scoped feasibility [moderate, grounded]: good idea and the right long-term shape for Route 1; the token carries contact + property identity so the return submission links **deterministically** and collapses BOTH lookups (HubSpot match + Frontier property lookup) for known landholders, routing straight to Manage Parcels. Reuses the HorizonSnapshotRequest Pattern C. Needs a new token record (token, contact_id, property_id?, expiry, used), a mint mutation behind the Frontier action, and the map tool reading the token. Medium build, not EOW. Design point: expose the action at **both** Property and contact level (property may not exist in Frontier yet). Verdict: generic link for EOW, unique-URL action as v1.1; short scoping pass with Cadel on the token store.
- **Backend facts used (agriprove-backend skill):** Property boundary is NOT stored (derived from parcels) so the drawn polygon can only ever be a reference image; HorizonSnapshotRequest is an immutable log, BFF writes REQUEST_SUBMITTED + fires Teams notification, rest is back-office; HubSpot sync is polled ~15 min (not real-time), but a tokenised link does not depend on that sync.


## Update (2026-06-17) — Cadel sign-off + boundary decision [high]

Cadel reviewed and signed off (LGTM). Decisions locked from his responses + Dylan's call:

- **Mapbox hybrid → trivial** (Cadel). Dependency closed.
- **Frontier auto property-lookup → deferred.** So **manage-vs-create is MANUAL in v1**: Ben searches contact + property name in Frontier himself. Auto first-pass match is a fast-follow. (Reverses the round-4 "auto first-pass, manual fallback" framing for v1.)
- **Tokenised "Request Map from User" URL → deferred** to a fast-follow (Cadel). Ship the generic link + email/name match for v1.
- **Teams channel: cannot create a NEW channel without paying.** Use the **existing platform notifications channel** (it predates Teams' Workflows push). Notifications post there, not a dedicated new channel. (Refines the round-4 "dedicated Team channel".)
- **Boundary visual = BOTH** (Dylan's call over Cadel's lean): a **display-only map overlay in Frontier** (Cadel: easier for Ben than a flat image) **plus a thumbnail in the notification**. The polygon is stored for display only, NOT used as the cadastral boundary; Ben still confirms parcels. (Refines round-4 "reference image only" — it is now overlay + thumbnail, still not ingested.)
- **Aircall/HubSpot sync question → Daniel / RevOps** (Cadel has no Aircall access).
- **New risk:** embedding the tool in the agriprove website is **unproven** ("I think it's ok but we will see when we try"). Validate during build.

Propagated to: `Farm Map Drawing Tool/proposal/proposal-and-flows.html` (both diagrams + gaps/feasibility/deps/open), `design/ben-handoff-concept.html`, Confluence PRD Core (v6) + Epic Hub (v4). Source: Cadel's Teams reply pasted by Dylan, 2026-06-16/17.
