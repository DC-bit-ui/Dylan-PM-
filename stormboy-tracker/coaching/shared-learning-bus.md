# Shared Learning Bus — Dashboard ↔ Claudia's Claude Code Tool

**Status:** Design / contract. Implementation requires coordination with Claudia.
**Principle (Dylan, 2026-05-11):** *"These systems cannot live in isolation."*

## The problem

Two systems generate learnings about the same customer base:

1. **This dashboard** — observes pipeline patterns, coaches deals, distills farm-visit transcripts, identifies systemic friction. Writes to `coaching/learnings/`.
2. **Claudia's Storm Boy Claude Tool** — handles call admin, lead research, has its own `/improve` loop, Friday weekly logs, captures preferences and ideas. Writes to her tool's own memory.

Without a shared bus:
- Same insight is "discovered" twice (waste)
- One system's learning doesn't help the other (loss)
- Ben using Claudia's tool to make a call doesn't get the dashboard's coaching context
- The dashboard's "deal at risk because customer raised eligibility concern" isn't visible to Claudia's call-admin skill when Ben dials the next customer
- Each system reasons from incomplete data

## The principle

Both systems read + write to a **single shared substrate**. Pattern propagates automatically:

```
                  ┌──────────────────────────────────────────┐
                  │  SHARED LEARNINGS BUS                     │
                  │  - patterns/                               │
                  │  - probe-outcomes/                         │
                  │  - deal-signals/                           │
                  │  - customer-positions/                     │
                  └──────────────────────────────────────────┘
                          ↑                    ↑
              read + write              read + write
                          │                    │
        ┌─────────────────┴────┐    ┌──────────┴─────────────┐
        │ Dashboard Coaching   │    │ Claudia's Claude Code  │
        │ ─────────────────    │    │ Storm Boy Tool         │
        │ A1, B1, B2 reason    │    │ ─────────────────────  │
        │ over signals;        │    │ get-leads, call-admin, │
        │ writes patterns,     │    │ research read patterns │
        │ probe outcomes,      │    │ before each action;    │
        │ deal-level signals   │    │ writes probe outcomes  │
        └──────────────────────┘    │ + preferences          │
                                    └────────────────────────┘
```

## Bus layout

Physically, the bus is a directory pair on the filesystem — both systems mount/access the same files:

### Proposed location
```
C:\Dylan PM\shared-growth-memory\
  patterns/                       — durable, attributed
    2026-05-11-nurture-back-horizon.md
    2026-05-11-hobbs-2575-frame.md
    ...
  probe-outcomes/                 — per-deal, transient (rolling 90 days)
    2026-05-11-deal-31711997037-checkin-probe.json
    ...
  deal-signals/                   — current state per active deal
    deal-31711997037.json         — overwritten on each update
    ...
  customer-positions/             — what we've heard customers say, by contact
    contact-{id}-positions.json
    ...
  INDEX.md
```

Outside both projects so neither "owns" it. Symbolic links from each project for convenience.

**Alternative:** Confluence space (e.g., "Growth Learnings" page tree) — both systems read/write via Atlassian API. More heavyweight but provides search + UI.

For v1, filesystem. v2 could migrate to Confluence if cross-machine sharing becomes critical.

## Schema per record type

### `patterns/` — durable learnings (long-lived)

Same shape as `stormboy-tracker/coaching/learnings/` already uses. YAML front-matter + markdown body. Adding one field: `surfaced_in_systems`.

```yaml
---
title: <pattern title>
category: tactical_play | tactical_framing | strategic_finding
confidence: high | moderate | low
written_at: ISO8601
sources: [...]
evidence: [...]
applicability: [...]
surfaced_in_systems:
  - dashboard_coaching      # the dashboard wrote this
  - claudia_storm_boy_tool  # Claudia's tool also confirmed
last_validated: ISO8601
---
```

If Claudia's tool also surfaces the same pattern via her `/improve` loop, it appends its system to `surfaced_in_systems`. Confidence increases through cross-confirmation.

### `probe-outcomes/` — closed-loop learning

When a probe is run (e.g., low-pressure check-in email), the outcome is recorded:

```json
{
  "probe_id": "...",
  "deal_id": "31711997037",
  "deal_name": "Daisy Bank + Bellevue",
  "probe_type": "low_pressure_checkin_email",
  "probe_text": "<verbatim what was sent>",
  "sent_at": "ISO8601",
  "outcome": "reply_warm" | "reply_neutral" | "reply_cool" | "no_reply_7d" | "no_reply_14d",
  "outcome_at": "ISO8601",
  "outcome_detected_by": "dashboard" | "claudia_tool" | "manual",
  "downstream_action_taken": "<optional; what was done after>",
  "deal_state_change": "warming" | "cooling" | "no_change" | "closed_won" | "closed_lost"
}
```

Detection mechanism:
- **Dashboard**: polls HubSpot for new engagement objects associated with the deal after the probe's `sent_at`. If reply within 24h → `reply_warm`. If reply 3-7d → `reply_neutral`. No reply 14d → `no_reply_14d`. Tone classification via Pass 0 distillation of the reply.
- **Claudia's tool**: when call-admin runs after a probe period (rep calls the same customer), the tool reads probe-outcomes/, sees there was a recent probe, can ask the rep "did the customer mention the carbon update email?"
- **Manual**: rep can update via dashboard or via Claudia's tool's `log-idea` flow

This is the **learning loop** Dylan asked for. Probe outcomes accumulate; the model learns what works.

### `deal-signals/` — current state per active deal

Read by both systems before acting on a deal. Written by the dashboard's nightly pipeline (and overwritten on each update — not append-only).

```json
{
  "deal_id": "31711997037",
  "deal_name": "Daisy Bank + Bellevue - James Almond",
  "as_of": "ISO8601",
  "stage_signal": { "stage": "KCT Issued", "days_in_stage": 426, "health": "red" },
  "behavioral_signal": { "last_meaningful_contact": "2026-04-15", "contact_velocity_30d": 1, "reply_latency_trend": "slowing", "health": "amber" },
  "content_signal": { "latest_customer_position": "...", "sentiment_trajectory": "neutral", "unresolved_objections": ["..."], "health": "green" },
  "coaching_mode": "stuck_but_live",
  "active_probes": ["..."],
  "supporting_twins": ["..."]
}
```

When Claudia's tool's `get-leads` or `call-admin` skill operates on this deal, it reads this file. Now the call admin knows: "This deal is RED at stage but content was warm last we heard — focus the call on the unresolved objection."

### `customer-positions/` — verbatim what customers have said

Indexed by contact_id, not deal_id, so we can track customers across multiple deals over time (e.g., a property changes hands or runs in multiple pipelines).

```json
{
  "contact_id": "<HubSpot contact ID>",
  "positions": [
    {
      "as_of": "ISO8601",
      "verbatim_or_distilled": "<200 chars max, PII-generalised>",
      "source": "email" | "call" | "farm_visit" | "note",
      "source_id": "...",
      "topic": "...",
      "sentiment": "..."
    }
  ]
}
```

Both systems write to this. Both read. The dashboard's "Latest from customer" callout pulls from here; Claudia's call-admin reads recent positions before each call to brief the rep.

## Implementation phases

### Phase 1 — Read-only consumption (this dashboard reads existing Claudia outputs)
Lower-coordination. The dashboard's coaching engine reads:
- Claudia's `cross-project-shared/customer-transcripts/` for farm-visit transcripts (already specified in cowork-orchestration-contract.md)
- Claudia's `cross-project-shared/self-improvement/skills/claude-weekly-log.md` outputs for team intel
- Confluence "Call Transcripts" + "Call Weekly Summaries" pages

No writes back to Claudia's territory. Single-direction integration. This is what we have today.

### Phase 2 — Shared substrate (mutual writes)
Establish `C:\Dylan PM\shared-growth-memory\` as the canonical bus. Both systems write here. Both read here.

Required:
1. Coordination with Claudia — she needs to update her tool's skills to read + write this location
2. Schema agreement — both systems agree on the JSON shapes above
3. Conflict resolution rules — if both write to the same record, last-write-wins with audit trail

### Phase 3 — Cross-system reasoning
Each system's prompts reference the shared bus as authoritative state:
- Dashboard's B1 prompt: "Read latest deal-signal from `shared-growth-memory/deal-signals/deal-{id}.json` before composing coaching"
- Claudia's call-admin: "Read latest customer-positions from `shared-growth-memory/customer-positions/contact-{id}.json` before drafting talking points"

At this point the two systems are coherent — neither sees a different version of the truth.

## Probe outcome loop (the learning closure)

Dylan's specific ask: probes need to be **automated** and **connect to Claudia's tool for learning**.

Mechanics:
1. **Dashboard surfaces a probe**: e.g., "Send low-pressure check-in to James Almond. Expected outcomes: reply <24h → live; reply 3-7d → cooling; no reply 14d → cold."
2. **Rep runs the probe** (via the inline-draft enablement built in Phase 2; one click → email goes to Outlook drafts → rep sends)
3. **Record the probe** in `shared-growth-memory/probe-outcomes/` immediately when sent
4. **Auto-detect the outcome** via nightly poll of HubSpot engagement objects on that deal:
   - New customer-initiated email within 24h → `reply_warm`, Pass 0 sentiment classification labels tone
   - Same 3-7d → `reply_neutral`
   - No engagement 14d → `no_reply_14d`
5. **Update the probe outcome record**
6. **Both systems consume it**:
   - Dashboard updates the deal's coaching: "Probe outcome was warm — reclassify from 'cold loss imminent' to 'stuck but live'"
   - Claudia's tool's `call-admin` skill reads it: "When Ben next calls James, brief: probe sent 2026-05-11 generated warm reply with mention of 'wife on board'"
7. **Accumulate**: probe outcomes feed back into A1 friction analysis — "probes at KCT-Issued stage convert warm 60% of the time when sent within 14d of stage entry."

This is the closed loop. Each probe is a data point. The system learns what works.

## What Cowork's role is in this

The Cowork orchestration contract (`cowork-orchestration-contract.md`) already specifies Cowork as the executor. Cowork additionally:
- Polls HubSpot for engagement deltas (probe outcome detection)
- Updates `shared-growth-memory/probe-outcomes/` files
- Triggers re-coaching when probe outcomes invalidate a previous deal-signal

## Coordination needed

Before implementing this, three things need to happen:

1. **Dylan + Claudia conversation** — agreement that shared substrate is the architecture, not isolated tools
2. **Schema lock** — final JSON shapes for the four record types
3. **Filesystem location** — `C:\Dylan PM\shared-growth-memory\` or alternative (Confluence space, OneDrive shared folder)

Implementation can then start with Phase 1 (read-only consumption) immediately, Phase 2 within ~1 week of Claudia's coordination, Phase 3 after both systems have a few weeks of bus-reading and outcomes flowing.

## Why this matters

Without the bus: Ben uses Claudia's tool to call James Almond tomorrow. The tool surfaces "this is a Storm Boy contact, lead stage: Proceed to Sales Pipeline." That's it. Ben doesn't know the dashboard flagged Daisy Bank as zombie-RED, doesn't know the recommended probe is a low-pressure check-in, doesn't know what twin deals have worked at this exact age cohort. Two separate systems telling Ben different parts of the same story.

With the bus: Ben opens Claudia's tool, asks for his call list, the tool reads `shared-growth-memory/deal-signals/deal-31711997037.json`, sees the multi-signal state, surfaces it inline: *"James Almond — Daisy Bank — KCT Issued 426d (zombie). Last meaningful contact 23d ago — warm. Recommended probe: low-pressure check-in with HORIZON Snapshot mention. Predicted: warm reply in <48h means the deal is live; no reply 14d means Cold loss imminent."*

That's one coherent system that happens to live in two execution environments.
