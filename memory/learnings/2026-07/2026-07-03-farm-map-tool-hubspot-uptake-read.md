# Farm Map tool: HubSpot uptake marker + first-fortnight read

**Date:** 2026-07-03
**Type:** integration knowledge + market read — Farm Map Drawing Tool (AP-2514)
**Source:** Live HubSpot (connector `2b50367f...`), queried 2026-07-03. Dylan asked to assess market uptake; Platform notifications Teams channel not readable (connector = DMs only; browser blocked by Teams "Classic no longer available" wall), so used HubSpot instead.

## The marker [high]
Farm Map tool submissions are tagged on the CONTACT with property **`map_tool_submission = "Yes"`** (enumeration, single option "Yes"). This is the reliable way to count tool submissions in HubSpot. (Should be added to `memory/integrations/hubspot.md` as a Tier 2 contract note.)

## Read (2026-07-03) [moderate]
- **24 contacts** carry `map_tool_submission = Yes` (total, not sampled).
- After stripping obvious internal QA (3x "Attribution Test"/"Another Attribution", Dylan's own contact, Daniel Wortmann = Marketing), genuine submissions ~**18-20** in the tool's first ~1-2 weeks.
- **First real submissions ~18-25 June** (attribution testing 18-19 Jun, real external traffic from ~25 Jun), low single digits/day through 30 Jun.
- **Split:** ~8 net-new leads (created 25-30 Jun) + ~9 matched to EXISTING contacts/customers (tool set the flag on records dating 2023-2025). createdate is NOT submission date for the matched ones.
- The two farmers from the launch-feedback calls ([[2026-07-02-launch-feedback-complex-properties-cadastral-overlay]]) appear as matched existing contacts: **John Dowling** and **Brett Smith** — corroborates the feedback is real tool usage.

## Quality signals [moderate]
- Several net-new submitters converted to an associated deal / OPEN_DEAL (Tony Matchett, Troy Murphy, David Leeds, Sebastian Liphuyzen) — tool is generating pipeline, not just leads.
- A few flagged **"Not eligible"** (Feliks Merolli, Elias Khoury, Roy Roy) — some tool traffic is unqualified.

## Key strategic flag [moderate]
Traffic source for the net-new submissions is mostly **DIRECT_TRAFFIC to agriprove.io/snapshot + app.agriprove.io/snapshot**, plus some ORGANIC_SEARCH and one AI_REFERRAL (chatgpt.com) and one m.facebook.com. The **paid-social (FB/IG) ad funnel the tool was designed around is NOT visibly driving submissions yet** — either ads aren't scaled, or attribution is landing as direct. This is the biggest lever for volume and worth confirming with Marketing (Daniel).

## Limits / caveats
- Deal attribution for MATCHED existing contacts is unreliable (their deals may predate the tool).
- Test vs real split inferred from names/dates, not a flag — [moderate].
- Did not query the deals object directly or the notifications channel; contact-level flag is the basis.

## Correction + update (2026-07-07)
- **Supersede the "Zero via Storm Boy" line above.** That was based on `lead_source`. The `storm_boy_campaign_member = Yes` flag is set on 5 tool contacts (Sebastian Liphuyzen, David Leeds, David, Geoff & Heather Bush, Chris Liphuyzen) — real Storm Boy overlap. Use `storm_boy_campaign_member`, not `lead_source`, to judge Storm Boy linkage.
- Total flagged now **27** (up from 24); tool still taking submissions daily (Roger Hocking 07-07, Amelia Carter 07-05, Kevin & Jude Brennan). Current date confirmed 2026-07-07 via live data.
- **Requested insights not sourceable from HubSpot** (Dylan asked to source hectares / NRM region / highest-value / ACWIS response from engagement): value fields (`total_revenue`, `recent_deal_amount`, `herd__flock_size`, `eligible_activities`, `keen_engaged_`) are EMPTY on all tool contacts; `notes` and `emails` are permission-blocked on this connector (AUTHORIZATION_ERROR); no hectares/NRM/ACWIS property exists. Email open/click counts exist but are aggregate (tenure signal), not per-campaign. Fix = capture hectares + NRM (from polygon) on form submit; value needs deal amounts; ACWIS needs a list/flag to filter on.

## 2nd-order enrichment (2026-07-07) [moderate]
Fields that DO exist on the contact (found via get_crm_objects data model, not keyword search):
- **`total_property_ha`** — hectares drawn/submitted (e.g. Tony Matchett 266.56, Kevin & Jude Brennan 6070). THE hectares field.
- **`property___farm_name`**, **`address`**, **`zip`**, **`latitude`/`longitude`** (sparse), `state_region`, `primary_enterprise_type_s`.
- `hs_object_source_detail_1` = "2606 Map tool form" confirms tool source; `agriprove_platform` = Yes.
- `stacking__areas_of_interest`, `eligible_activities` exist but are EMPTY for all tool contacts.

Findings (genuine submissions only; excluded tests Attribution x3 + Roy Roy 7042 placeholder + Daniel Wortmann x2 + Dylan, and 2 overseas junk ~1ha Feliks/Elias):
- **Aggregate hectares ≈ 15,240 ha** across 15 properties with data. Net-new ≈ 5,330 ha (8); existing re-engaged ≈ 9,910 ha (7). 3 genuine contacts (Brett, Chris, Charles) have no ha captured.
- **NRM/catchment derived from address** (not a field): ~13 of 17 genuine sit in **Murray-Darling Basin** (Murray/Riverina/QMDC clusters) or a **Reef catchment** (Tony Matchett = Wet Tropics/Terrain; Troy Murphy = Fitzroy). Neither: Amelia Carter (TAS), Denis Scanlon (Fleurieu SA), Glenn Dale (SEQ).
- **Highest-value targets** (area x stacking catchment): Kevin & Jude Brennan 6,070 ha MDB (Connected, NO deal - biggest unconverted), Roger Hocking 2,088 ha MDB (new today), Jim Stower 1,600 ha MDB (Nurture), David Leeds 1,416 + John Dowling 1,500 MDB (open deals).
- **ACWIS / Verterra water-quality stacking engagement = none detectable.** stacking-interest empty; no last-email or last-URL touches Verterra/water-quality/stacking. Big cross-sell gap: ~13 MDB/Reef landholders in-funnel, none shown the water-quality stacking story. Caveat: per-campaign opens not queryable, note/email bodies permission-blocked.

[CAREER] Farm Map tool (Dylan-driven, AP-2514) shipped and generating early qualified pipeline within ~2 weeks of launch. Suggested Notion section: Portfolio / Quantified wins. STAR (sanitised): S: no low-friction top-of-funnel for a soil-carbon estimate. T: ship a self-serve map-draw lead tool. A: drove product from concept to launch. R: live within weeks, converting net-new submitters to deals; surfaced an attribution/paid-social gap early. (Ratios not absolutes; confirm numbers before use.)
