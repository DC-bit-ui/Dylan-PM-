# Water-quality credits: ACWIS + Reef Credit eligibility (for the Farm Map tool trigger)

**Date:** 2026-07-15
**Type:** business/domain reference — Farm Map Drawing Tool V2 (AP-2616) + water-credit stacking
**Source:** Web research 2026-07-15 (Eco-Markets Australia, Qld reefplan, MDBA, state NRM lists). Full dev reference: `../../Farm Map Drawing Tool/data/water-credit-eligibility.md`.

## Key facts [high unless noted]
- **ACWIS = Australasian Catchment Water Improvement Standard**, by Eco-Markets Australia (the Reef Credit administrator). Extends water-quality credits beyond the GBR to catchments nationally (Aus + NZ). Status mid-2026: **emerging** (consultation Jul-Aug 2025, webinar Nov 2025), not a live region-specific market yet. This is the Murray-Darling water-credit pathway.
- **Reef Credit = LIVE** water-quality market (Eco-Markets), ~14 projects / ~69k credits issued. Applies to the **6 GBR NRM regions + 35 catchments** (424,000 km² coastal QLD): Cape York, Wet Tropics, Burdekin, Mackay Whitsunday, Fitzroy, Burnett Mary. Grazing is 77% of land use = AgriProve's base.
- **Trigger rule for the tool:** location in Reef zone -> Reef Credit ("eligible now"); location in MDB zone -> ACWIS ("register interest", emerging, do NOT imply available now); else -> hide. Zones defined by postcode in `catchment-postcodes.md`; use polygon centroid vs official boundaries (MDBA / Reef 2050) for accuracy.
- **MDB NRM regions** [moderate]: QLD Southern Queensland Landscapes; NSW LLS North West/Central West/Central Tablelands/Northern Tablelands(part)/Riverina/Murray/South East(W)/Western(E); ACT; VIC CMAs North East/Goulburn Broken/North Central/Mallee/Wimmera; SA Murraylands and Riverland Landscape Board.

## Watch-out
Do not claim MDB landholders can generate water credits today. ACWIS is the route and it is emerging; confirm current MDB methodology/market status with Eco-Markets Australia (and AgriProve's water-quality partner) before making the MDB option more than an early-interest gate. [[2026-07-13-map-tool-meta-ads-tagging-gap]] relates (ACWIS engagement was the "did they see the water-quality story" question).
