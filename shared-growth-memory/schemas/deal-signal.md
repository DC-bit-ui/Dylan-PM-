# Schema — `deal-signals/`

Current multi-signal state per active deal. Read by both systems before acting; written by the dashboard's coaching pipeline.

## File location
```
deal-signals/deal-<deal_id>.json
```

One file per active deal. **Overwritten** on each pipeline run — this file represents *current state*, not history.

For historical signal trajectory, downstream systems should keep their own snapshot diffs.

## Shape

```json
{
  "deal_id": "31711997037",
  "deal_name": "Daisy Bank + Bellevue - James Almond",
  "contact_id": "<HubSpot contact ID — primary contact>",
  "as_of": "ISO8601",
  "written_by": "dashboard_coaching",

  "attribution": "direct | lawrieco",
  "era": "Legacy | KCT Process | Stormboy v1 | Stormboy v2",
  "current_stage": "Qualified Account | Discovery Call | Strategy Call | SLA/KCT Mapping | KCT Issued",
  "days_in_current_stage": 426,

  "signals": {
    "stage": {
      "health": "red | amber | green",
      "value": "Human-readable status (≤80 chars)",
      "confidence": "high | moderate | low",
      "note": "What this signal tells us (≤160 chars)",
      "median_days_won_at_stage": 6,
      "median_days_lost_at_stage": 12
    },
    "behavioral": {
      "health": "red | amber | green",
      "value": "Human-readable status (≤80 chars)",
      "confidence": "high | moderate | low",
      "note": "...",
      "last_meaningful_contact": "ISO8601",
      "contact_velocity_30d": 2,
      "reply_latency_trend": "slowing | steady | improving",
      "last_engagement_was_rep_initiated": true
    },
    "content": {
      "health": "red | amber | green",
      "value": "Human-readable status (≤80 chars)",
      "confidence": "high | moderate | low",
      "note": "...",
      "latest_customer_position": "Verbatim or distilled customer quote (≤300 chars, PII-generalised)",
      "latest_customer_position_at": "ISO8601",
      "latest_customer_position_source": "email | call | farm_visit | note",
      "sentiment_trajectory": "warming | neutral_warm | neutral | neutral_cool | cooling",
      "unresolved_objections": ["objection 1", "objection 2"]
    }
  },

  "coaching_mode": "healthy_progression | stuck_but_live | cooling | cold_loss_imminent | mystery_disconnect | early_warning | partner_alignment_blocked",

  "active_probes": [
    "probe-<probe_id>"
  ],

  "what_we_dont_know": [
    "<gap statement 1>",
    "<gap statement 2>"
  ],

  "supporting_twin_ids": ["40789889068", "147625095632"],

  "next_recommended_action": "<single sentence, verbatim from coaching pipeline>"
}
```

## Coaching mode reference

| Mode | When the system assigns this |
|---|---|
| `healthy_progression` | Stage/behavioral/content all green or warming |
| `stuck_but_live` | Stage red, behavioral amber, content green or warming |
| `cooling` | Stage amber, behavioral cooling, content negative |
| `cold_loss_imminent` | Stage red, behavioral red, content cool or absent |
| `mystery_disconnect` | Stage red, content was last warm, behavioral cool — ambiguous; probe to disambiguate |
| `early_warning` | Stage green/amber, behavioral cooling, content showing friction — head off before stage advances |
| `partner_alignment_blocked` | Content shows explicit partner-pending; stage red because waiting on external decision |

The dashboard's B1 prompt chooses the mode; downstream systems treat it as authoritative.

## When to write

- **Every live coaching run** writes deal-signals for every active deal coached
- A probe-outcome detection may trigger an out-of-band update (e.g., warm reply detected → re-coach this deal)
- Manual override: a rep can mark a deal-signal stale ("I just had a call, this is now stuck-but-live not cold") — Claudia's call-admin would write this

## When to read

- Claudia's `get-leads/` reads when surfacing a call list: filters out `cold_loss_imminent` unless rep asks for them; sorts by `next_recommended_action` priority
- Claudia's `call-admin/` reads when triaging a call: briefs the rep on signals before they dial
- Dashboard reads its own to render Plays tab + briefings
- Cowork orchestrator reads to decide which probes to poll for outcomes
