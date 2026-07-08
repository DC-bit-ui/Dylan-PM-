# DJ prototype review — durable changes

**Date:** 2026-06-25
**Source:** Granola "Call with Dylan Jones" (`964547d5-db41-4eb6-a008-429332202abb`). DJ = Dylan Jones (ops SME). Reviewed the Consents/Prospects prototype — strongly positive.
**Full detail + demo plan:** `EIH Automation/docs/2026-06-25-dj-review-changes-and-demo-plan.md`.

## Durable process changes
- **Register off the automated (KCT-light) mapping — don't gate registration on final mapping.** [high] Get the KCT out while the lead is warm; automated mapping is ~90% there and the price/sampling quote won't materially change from exclusion tweaks. **Detailed map refinement happens post-registration, up until baseline sampling** (the CER area can still change then). Carry a "follow-up mapping needed" flag.
- **Mapping confirmation = a pre-sampling checkpoint (post-registration), not pre-registration.** Landholder confirms the project area + consents to the sampling approach + books the visit just before sampling. This becomes the **first stage of the ACTIVE project ("confirm mapping")** → ties into the active-projects restructure.
- **Audit log = INTERNAL only.** [correction to the 2026-06-24 framing] DJ: exporting it to the regulator is over-engineering — for an exclusion they'd just supply the updated shapefile/title map as source of truth. Keep the audit log for internal tracking; don't position it as regulator evidence.
- **Easement exclusion → attach the title map to the application from the outset** (pre-empt the CER's RFI to confirm the exclusion). Source of truth = title map/shapefile.

## Technical/feasibility notes
- **DBYD API = high-value opportunity** (DJ: "huge gain"). DBYD is the clunkiest step (polygon redraw, Telstra polygon-size limits in WA, one-search-per-project). Explore 1100.com.au API; interim, pre-populate the polygon from the confirmed land-title boundary.
- **Easement *location* can't be automated.** Encumbrances are listed vaguely on a title (a caveat pointing to a child dealing you must purchase separately; can't fetch the child without buying the parent). System can flag "encumbrance present"; locating it is manual. QLD presents child docs clearly; other states don't.
- **Title purchase stays manual (V1).** D&D quoted ~$8k for their API. Assisted-but-manual is fine as V1.

## Build inputs / asks
- **Get 5 example CPPs from DJ** (incl. the stronger Mel-era ones with fleshed-out science) → template the full-CPP generator (activity patterns: new vs materially-different-vs-baseline; link to scientific principles/references where possible).
- **Registration split-screen script** wired: a second pop-out at registration showing AgriProve's CER form wording beside the portal. Saved at `EIH Automation/docs/reference/cer-registration-script.txt` (ULMS wording).
- Native Title: schedule numbers vary by case — don't hardcode "Schedule 2/3".

## Strategic framing (DJ)
The real bottleneck is **landholder data (farm-management records) + getting consents signed** — 14-month consent waits on already-sampled projects are blocking crediting; 25-yr-commitment trepidation + political headwinds (One Nation/Nationals). Internal-automation low-hanging fruit is solved; the hard part is the external data/consent. → Prioritise the consent machinery and the crediting-side consent unblock.

## Next action
Working Claude Code demo for DJ + Joe to test/break (Crown J sample data, spine + the 3 hero interactions, P0 changes, clean mocks). Plan in the doc above.
