# Schema — `customer-positions/`

Verbatim or distilled customer voice, indexed by HubSpot contact. Tracks what customers have actually said across emails, calls, farm visits — separate from deal-level signals because a customer may be associated with multiple deals (and may even be associated with a deal that's currently closed_lost but worth re-engaging).

## File location
```
customer-positions/contact-<contact_id>.json
```

One file per HubSpot contact. **Appended to** on each new observation — but old positions get truncated after 5 most-recent (rolling window).

## Shape

```json
{
  "contact_id": "<HubSpot contact ID>",
  "contact_name_generalised": "5000ha grazing operation in Riverina, partner-aligned household",
  "associated_deal_ids": ["<deal_id>", "<deal_id>"],
  "last_updated": "ISO8601",
  "positions": [
    {
      "as_of": "ISO8601",
      "verbatim_or_distilled": "Thanks for the update Ben — the wife and I are talking it through over Easter. I'll get back to you in early May.",
      "is_verbatim": true,
      "source": "email | call | farm_visit | note",
      "source_id": "<HubSpot engagement ID or Confluence page ID>",
      "topic": "partner_alignment | timing | 25_year_commitment | revenue_split | etc.",
      "sentiment": "positive | neutral_warm | neutral | neutral_cool | negative",
      "captured_by": "dashboard_coaching | claudia_storm_boy_tool | claudia_call_admin"
    }
  ],
  "rolling_sentiment_trajectory": "warming | neutral | cooling"
}
```

## PII rules

The `contact_name_generalised` field intentionally describes the contact in non-identifying terms ("5000ha grazing operation in Riverina"). Both systems agree to use this rather than the real name in downstream prompts.

`verbatim_or_distilled` text may include the customer's first name when it's part of the quote (e.g., "Ben, the wife and I are..." — the rep's name in customer's voice is fine to keep). Customer's own name in third-person reference should be generalised.

`source_id` references the original artifact (email ID in HubSpot, page ID in Confluence) so anyone reading can verify the original context.

## When to write

- **Dashboard** writes a position when Pass 0 distills a farm-visit transcript, email, or call. Source is the distillate that produced the position.
- **Claudia's call-admin** writes a position after the rep logs a call. Source is the call transcript page in Confluence (`pelican294` already routes these).
- **Claudia's log-idea** writes a position when the rep types something like "James said the wife isn't sold yet." Source is the manual note.

## When to read

- **Claudia's `get-leads`** reads positions before surfacing a call list — uses sentiment trajectory to prioritise
- **Claudia's `call-admin/triage-call`** reads positions before briefing the rep about an incoming call — shows the rep "James last said X 23 days ago"
- **Dashboard's B1** reads positions when composing per-deal coaching — surfaces "latest from customer" in the Plays tab
- **Dashboard's A2** reads positions across the customer base when synthesising counter-objection patterns

## Truncation rules

Each contact file keeps:
- The 5 most-recent positions
- All positions where `is_verbatim: true` and the source is a farm visit (these are highest-value Hobbs language)
- Anything captured in the last 14 days

Older positions are dropped from the file but remain accessible via the source artifact (HubSpot engagement, Confluence page).

## Why per-contact, not per-deal

A customer may have a closed_lost deal from 2025 and a new active deal in 2026. We want the system to remember what they said in 2025 when coaching their 2026 deal. Indexing by contact (which persists across deals) captures this.
