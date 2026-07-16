---
name: All Meta ad leads tagged Stormboy regardless of region
description: Decision in Stormboy standup 2026-05-15 — every Meta-sourced lead gets the storm_boy_campaign_member=Yes flag regardless of geography, as part of the broader campaign attribution
type: decision
---

# Decision: All Meta ad leads tagged Stormboy

**Date:** 2026-05-15
**Context:** Stormboy standup, 2026-05-15
**Decided by:** Team consensus

## What changed
Going forward, every lead sourced from Meta ads gets the HubSpot contact property `storm_boy_campaign_member = Yes`, regardless of whether the property is geographically within the Storm Boy region.

## Why
The Meta campaign is part of the broader Storm Boy push — attribution should reflect the campaign budget, not just the geographic eligibility. Geographic eligibility is checked downstream when a contact moves into the qualification stage.

## Implications for the system
- **Storm Boy contact universe expands.** The dashboard's "total visits booked" and "Storm Boy wins" metrics will see growth from outside the historical Storm Boy region. This is correct — those leads ARE Storm Boy by campaign attribution.
- **Per-rep dashboards** that filter by `storm_boy_campaign_member = Yes` will pick up these leads automatically with no code change.
- **Storm Boy contact count discrepancy** (the ~1,300 figure Claudia is reconciling) becomes more important to keep clean — the count grows by Meta volume and the universe is harder to bound by geography alone.
- **`contact_lead_stage_storm_boy`** still does the gating — a Meta lead outside the region either gets staged "Not Eligible" or stays "Identified" depending on whether the property qualifies. The Stormboy *campaign* tag is broader than the Stormboy *pipeline*.

## What does NOT change
- Geographic eligibility logic for the actual carbon project remains unchanged
- The 30K hectare target stays anchored to enrolled hectares, not contact counts
- Hobbs's visit territory remains region-bound (he physically goes there)

## Action items
- Confirm in HubSpot that the Meta integration's lead-creation workflow is setting `storm_boy_campaign_member = Yes` by default for any Meta-sourced contact
- Update `memory/business/products.md` Storm Boy definition to reflect that campaign tag is broader than geographic eligibility
