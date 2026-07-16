# Farm Map tool: Meta-ads landing-page submissions not tagged (missed-submission root cause)

**Date:** 2026-07-13
**Type:** data-pipeline gap + reconciliation method — Farm Map Drawing Tool (AP-2514)
**Source:** Live HubSpot reconciliation, 2026-07-13. Dylan flagged missed submissions from the Platform Notifications channel.

## Root cause [high]
The tool has two form variants writing the same conversion event:
- `HORIZON Snapshot Tool: 2606 Map tool form` (main) -> sets `map_tool_submission = Yes`.
- `Meta ads - Landing page: 2606 Map tool form` (paid-social landing page) -> does NOT set `map_tool_submission`.

So Meta-ads submissions land in HubSpot as contacts but are untagged, and drop out of any view keyed on the flag. Found **Jack Sykes** (submitted 2026-07-08) untagged this way. This also explains why paid-social looked invisible in earlier uptake reads.

## Reliable capture method [high]
Do NOT rely on `map_tool_submission = Yes` alone. The reliable fingerprint for every tool submission is: **conversion event contains "2606 Map tool form"** in `recent_conversion_event_name` OR `first_conversion_event_name` (CONTAINS_TOKEN "2606"), which spans both variants. Dashboard `farm-map-uptake` updated 2026-07-13 to key off this OR the flag.

## Durable fix (recommended, needs HubSpot config) [moderate]
Add a HubSpot workflow: set `map_tool_submission = Yes` on any contact whose conversion event contains "2606 Map tool form" (covers both variants, retro-tags Jack). Alternatively fix the Meta landing-page form to set the property. This is HubSpot/RevOps/Marketing config; not doable from the read-only MCP connector here. Candidate Jira ticket under Farm Map Tool V2 (AP-2616) or a Marketing task.

## Residual limit
Cannot read the Platform Notifications Teams channel (connector = DMs only; Teams web blocked). If any channel notification never creates a HubSpot contact at all, this HubSpot-based reconciliation won't see it. The platform team should confirm every notification creates a contact. New QA test records to ignore: "Test farmer" (317504755173), "Fred Tfarm" (336101419501). Outlier to sanity-check: Kenneth (Mac) Drysdale = 160,000 ha (likely large pastoral lease or data-entry error; dominates aggregate ha).
