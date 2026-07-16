# Map tool submission ↔ snapshot pipeline reconciliation (full period)

**Date:** 2026-07-13
**Type:** integration knowledge + operational finding — Farm Map Drawing Tool (AP-2514)
**Trigger:** Dylan asked to check the Platform notifications Teams channel for outstanding map tool submissions and confirm they landed in the HORIZON Snapshot ticket pipeline — flag any genuine ones missed. Extended back to tool release.
**Sources (live, this session):** Teams `Platform notifications` channel (browser); HubSpot pipeline `1433968072` (connector `2b50367f`).

## Integration facts [high]
- Every map tool submission creates a **TICKET** in the **HORIZON Snapshot Requests** pipeline (`hs_pipeline = 1433968072`). The Teams channel card is a parallel Power Automate post ("Cadel Watson used a Workflow template"). The pipeline is the authoritative record; the channel is a notification mirror. In the 8–13 Jul window the two were 1:1 (no orphan posts).
- Tool-submission tickets have content format: `Name / Email / Property Address / Total Area / Submitted / Platform User ID`. Manual call-booking tickets in the SAME pipeline have a different format (`Name+email+phone+Company / date-time AEST / address / state / postcode`, often `hobbs@agriprove.io`) — these are NOT tool submissions.
- Contact-level marker: `map_tool_submission = "Yes"`; `hs_object_source_detail_1 = "2606 Map tool form"`; hectares in `total_property_ha`. (see [[2026-07-03-farm-map-tool-hubspot-uptake-read]])
- **Pipeline stage IDs (`hs_pipeline_stage`):** New HORIZON Snapshot Request `2379316691` · Snapshot In Progress `2379316693` · Ready for Review `3138482662` · Complete & Sent `2379316694`. Only "New" is un-actioned; the other three are working stages.

## Test signatures — how to strip internal QA [high]
- **Steve Le Moenic:** `slemoenic+NNNN@agriprove.io` (e.g. +1051..+1064). ~10 fake-name WA/VIC properties, 16–17 Jun, all sitting in New.
- **Daniel Wortmann:** `daniel+NN@agriprove.io` (e.g. +37..+42), names like "TEST MA LP", "MA test farm".
- Generic dev tests: `*@test.com`, `test54321@gmail.com`, `tfarm12345@gmail.com`, `fredtfarm1010@gmail.com`, `testfarmerstation@gmail.com`; fake phones `0400 000 000`, `0444444444`, `0466666666`, etc.; placeholder names (Jim Tfarm, Farmer Dan, Test farmer).

## Finding — genuine tool submissions NOT in a working stage (i.e. missed) [high]
Reviewed all 51 tickets in the "New" stage. Genuine map-tool submissions stuck there:
1. **Jacqui Carolan** — 1505 Killarney Gap Road, Narrabri NSW — `jacqui.carolan@bioconversiontech.com.au` — 808 ha — submitted 11 Jun — stuck ~1 month. **Strongest miss.**
2. **Dean Viall** — 121 Morey Road, Glossop SA — `dean@asheyaalchemy.com` — 5.68 ha — submitted 13 Jun — stuck ~1 month. Genuine but tiny/sub-scale.
3. **2× "Unknown Contact"** (no email captured) — YELLOWIN Access Rd (22 Apr, 32,391 ha) + 351 Trewalla Rd (23 Apr, 2,333 ha) — early tool submissions with no contact info; unactionable without follow-up detail.

Recent window (8–13 Jul) reconciled clean: all 7 genuine submissions (Yeo, Bailey ×3, Perola Park/Drysdale, Blue Mountain/Carter, Liebenberg) in Snapshot In Progress or Complete & Sent. A Daniel/dev test ("Fred Tfarm") leaked into Ready for Review — worth closing.

## Caveats
- Teams channel UI does not page efficiently (PageUp intercepted; wheel ≈1 card/scroll) — full manual scroll to release not done; pipeline used as the authoritative full-period record instead. Residual gap the pipeline can't detect: a submission posted to the channel that never created a ticket (workflow failure). Not observed in the sampled window.
- The ~38 manual call-booking tickets also sitting in "New" (some since Feb) are a separate pipeline-hygiene question, not map-tool submissions.
