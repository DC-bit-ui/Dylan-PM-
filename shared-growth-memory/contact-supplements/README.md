# Contact Supplements — Multi-source Enrichment for HubSpot Contacts

Parallel to `deal-supplements/` — but keyed by HubSpot contact id. Captures signal about a person across sources where HubSpot doesn't.

Use when the unit of analysis is **the landholder/prospect**, not the deal — e.g. a Storm Boy contact who hasn't converted to a deal yet, or a recurring relationship across multiple deals.

## Folder layout

```
contact-supplements/
  <contact_id>/                    ← matches HubSpot contact id exactly
    confluence-aircall-2026-04-15-discovery.md
    teams-channel-stormboy-2026-04-30.json
    granola-meeting-2026-05-01-farm-visit.md
    outlook-email-2026-05-10.md
```

Same filename-prefix → source-type mapping as `deal-supplements/README.md`.

## When to write to contact-supplements vs deal-supplements

| If the artifact is primarily about… | Stage |
|---|---|
| A specific deal in active pipeline | `deal-supplements/<deal_id>/` |
| A landholder in Storm Boy funnel before deal creation (Identified / In Conversation / Farm Visit booked or completed) | `contact-supplements/<contact_id>/` |
| Both (a Storm Boy contact who now has an open deal) | **Both folders** — small duplicate cost, big read-side simplification |

## Matching strategy for Apex

Same fall-back chain as deals — match via phone, email, name, then contextual cues. Storm Boy contacts have `storm_boy__meeting_date` set when a farm visit was booked, which is a strong join key for Confluence Aircall transcripts dated near that meeting.

## Cadence + idempotency + sensitivity

Same as deal-supplements — daily Apex run at 13:00 AEST, overwrite-not-accumulate, same NDA rules.

## Dashboard consumption (planned)

The WORK tab's Storm Boy stream (Stream 2 — recruitment outreach) will surface contact-level supplements in the per-contact expand overlay. Same right-column "What actually happened" pattern.
