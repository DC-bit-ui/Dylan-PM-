# HubSpot Sales Pipeline — Four Eras (Corrected)

**Date:** 2026-05-01 (updated same day)
**Source:** Stormboy Standup meeting (Granola ID: 536649de-9452-4044-a74e-8ab2a1d783c7) + HubSpot live data investigation + Dylan correction on Stormboy identification
**Confidence:** [high] — verified against HubSpot stage transition timestamps + contact-level campaign tags

## Finding

The AgriProve Sales Pipeline (HubSpot `default` pipeline) has four eras, classified by two dimensions: (1) pipeline structure changes, (2) Stormboy campaign membership on contacts.

### Stormboy identification — CORRECTED
Stormboy deals are **NOT** identified by pipeline stage. They are identified by the HubSpot **contact-level** property `storm_boy_campaign_member` = `"Yes"`. A deal is a Stormboy deal if any of its associated contacts carry this tag. As of 2026-05-01: 1,799 tagged contacts, 19 with associated deals (24 deals total across pipelines, 18 in default Sales Pipeline).

Additional Stormboy contact properties: `contact_lead_stage_storm_boy`, `storm_boy__call_outcome`, `storm_boy__proceed_to_kct_stage`, `storm_boy__meeting_completed`, `storm_boy__meeting_scheduled`, `storm_boy__meeting_date`, `storm_boy__date_called`, `storm_boy__date_assessed`.

### Era 1: Legacy (origin — Feb 2025)
- **Pipeline:** Qualified Account → Strategy Call → SLA/KCT Mapping → Closed Won
- No KCT Issued checkpoint
- Not tagged Stormboy

### Era 2: KCT Process (March 2025 — present for non-Stormboy deals)
- **Pipeline:** Qualified Account → Strategy Call → SLA/KCT Mapping → **KCT Issued** → Closed Won
- KCT Issued stage first used: **2025-03-07** (batch move)
- Not tagged Stormboy

### Era 3: Stormboy v1 (~13 Jan 2026 — 22 Apr 2026)
- Same pipeline stages as KCT Process
- Deal associated with contact tagged `storm_boy_campaign_member = Yes`
- No Discovery Call stage entry
- Stormboy launch date: ~13 Jan 2026 (AP-1594 scrape executed; ROAD-131 created 19 Jan; Confluence Wk3 Kickoff 27 Jan)

### Era 4: Stormboy v2 (22 Apr 2026 — present)
- **Pipeline:** Qualified Account → **Discovery Call** → Strategy Call → SLA/KCT Mapping → KCT Issued → Closed Won
- Discovery Call stage first used: **2026-04-22** (batch move of 13 deals)
- Deal associated with contact tagged `storm_boy_campaign_member = Yes` AND has entered Discovery Call stage
- Discovery Call addition is a "Stormboy Recruitment Process v2" milestone, not a separate era

### Key structural notes
- Separate "Operation StormBoy" pipeline (ID: 1550345705) exists but has **zero deals** — all deals flow through the default Sales Pipeline
- Discovery Call (stage ID `2929183214`) has a much higher ID than original stages, confirming it was added later
- Both KCT Issued and Discovery Call were introduced via batch moves of existing deals, not gradual adoption
- SLA/KCT Mapping remains the primary bottleneck across all eras
- No deal-level Stormboy property exists — classification must go through contact associations

## HubSpot engagement permissions gap

- Cannot read individual engagement objects (emails, calls, meetings, notes) — MCP connector returns "User does not have permissions"
- Aggregate counts (`num_contacted_notes`, `num_notes`) available as proxy
- **Action required:** Re-authorise HubSpot MCP connector with engagement read scopes (recommended Option A from session)
- No Aircall integration data found in HubSpot

## Artifact

Built and deployed: `stormboy-conversion-tracker` Cowork artifact with 6 tabs (Overview, Process Evolution, Deal Ranking, Active Pipeline, Trends, Deep Dive). Era classification uses contact-level `storm_boy_campaign_member` tag via association lookup. AgriProve Light theme applied.

## Cross-references

- [Stormboy glossary entry](../business/glossary.md) — lead generation pipeline / process alignment
- Granola meeting: Stormboy Standup 2026-05-01
