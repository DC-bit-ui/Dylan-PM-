# Schema — `probe-outcomes/`

Records of probes sent and what came back. The learning loop closure: every probe is a data point about what works.

## File location
```
probe-outcomes/probe-<probe_id>.json
```

`probe_id` is a UUID assigned by the system that creates the probe (typically the dashboard).

## Shape

```json
{
  "probe_id": "uuid-v4",
  "deal_id": "31711997037",
  "deal_name": "Daisy Bank + Bellevue - James Almond",
  "contact_id": "<HubSpot contact ID>",

  "probe_type": "low_pressure_checkin_email | partner_alignment_offer | competitor_comparison_send | dollar_anchor_share | call_invitation | farm_visit_offer",
  "rationale": "Why this probe was selected (≤200 chars)",
  "probe_text": "<verbatim what was sent — email body, message text, talking points>",

  "created_at": "ISO8601 — when the dashboard suggested this probe",
  "created_by": "dashboard_coaching | claudia_storm_boy_tool | manual_by_rep",
  "sent_at": "ISO8601 — when the rep actually sent it; null if not yet sent",
  "sent_by": "<owner email or HubSpot owner ID>",
  "sent_channel": "email | call | sms | farm_visit",

  "predicted_outcomes": [
    {
      "signal": "reply within 24h with positive sentiment",
      "interpretation": "Partner-alignment landed — push toward SLA Mapping",
      "deal_state_implied": "warming"
    }
  ],

  "actual_outcome": {
    "detected_at": "ISO8601 — null until detected",
    "detected_by": "dashboard_polling | claudia_call_admin | manual",
    "outcome_class": "reply_warm | reply_neutral | reply_cool | no_reply_7d | no_reply_14d | no_reply_30d | rep_marked_complete",
    "reply_latency_hours": <number>,
    "reply_sentiment": "positive | neutral | negative | unclear",
    "reply_summary": "<≤200 chars, PII-generalised>",
    "reply_distillate_ref": "<reference to Pass 0 distillate of the reply, if any>"
  },

  "deal_state_change": {
    "observed_at": "ISO8601",
    "from_state": "stuck_but_live | cooling | cold_loss_imminent | etc.",
    "to_state": "warming | still_ambiguous | confirmed_cold | won | lost",
    "drove_action": "<the next action the rep took>"
  }
}
```

## Lifecycle

1. **Create** — dashboard's coaching pipeline identifies ambiguity; suggests a probe; creates file with `predicted_outcomes` but no `actual_outcome` yet
2. **Send** — rep clicks "send via Outlook" enablement; dashboard updates the file with `sent_at`, `sent_by`, `sent_channel`
3. **Poll** — Cowork polls HubSpot for new engagement objects on the deal after `sent_at`. If reply within 24h, classify tone via Pass 0 → write `actual_outcome` with class `reply_warm`
4. **Update state** — dashboard's next coaching run reads probe-outcomes/; if outcome was warm, deal-signal's coaching_mode shifts from "stuck-but-live" to "warming"; if no reply 14d, shifts to "confirmed_cold"
5. **Pattern accumulate** — over time, the pipeline analyzes probe outcomes to learn: "probes of type X at stage Y converted warm N% of the time"

## When to read

- Dashboard's coaching pipeline reads recent probe-outcomes when computing deal-signals (active probes affect interpretation)
- Claudia's call-admin reads recent probe-outcomes for a contact before briefing the rep for a call (so rep knows "Ben sent a check-in 3 days ago — has James responded?")

## When to write

- **Create** on probe suggestion (dashboard side, before rep sends)
- **Update** on send (dashboard side, when rep clicks Send-via-Outlook)
- **Update** on outcome detection (Cowork side, polling)
- **Update** on rep manual feedback (either system — rep marks "this didn't work")

## Why not just a Notion table

We considered Notion + DB. Filesystem + JSON wins because:
- No third-party auth dependencies
- Both systems already operate on filesystem (Claudia's tool extensively)
- Atomic writes are trivial
- Schema evolution is text-based, version-controllable
- Diffs in git show what changed
