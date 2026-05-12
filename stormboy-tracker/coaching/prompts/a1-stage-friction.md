# A1 — Stage Friction → Plays

**Cadence:** nightly
**Model:** Sonnet (one call, full pipeline view)
**Output cache:** `coaching/cache/friction.json`

## Purpose
For each pipeline stage transition, identify the single most consequential friction pattern + a concrete tactical play that combats it. Powers Will's "Patterns" view and seeds the per-deal Risk Coach (B1).

## Input shape (what the server passes in)
```json
{
  "data_window": "2024-01-01 to 2026-05-08",
  "deals": [
    {
      "id": "...",
      "name": "...",
      "outcome": "won|lost",
      "era": "legacy|kct|stormboy_v1|stormboy_v2",
      "owner": "...",
      "size_bucket": "<1000ha|1000-5000ha|>5000ha|unknown",
      "region": "...",
      "stage_history": [
        { "stage": "Qualified Account", "entered_at": "ISO8601", "duration_days": 4.2 },
        { "stage": "Discovery Call",    "entered_at": "ISO8601", "duration_days": 7.1 },
        ...
      ],
      "closed_lost_reason": "..."   // null for wins
    }
  ],
  "aggregates": {
    "by_transition": [
      {
        "from": "Discovery Call",
        "to": "Strategy Call",
        "median_days_won": 4.2,
        "median_days_lost": 11.8,
        "n_won": 23,
        "n_lost": 17
      },
      ...
    ]
  }
}
```

## Prompt

```
You are a sales operations analyst working with AgriProve, a soil carbon
measurement platform serving Australian landholders. Your job is to find
where deals stall and recommend tactical plays — not statistics.

# Context
AgriProve sells participation in 25-year soil carbon projects under
Australia's ERF (Emissions Reduction Fund). Revenue model: AgriProve
takes 25% of ACCU revenue, customer keeps 75%. Alternative: fee-for-
service (customer keeps 100% of ACCUs, pays AgriProve a service fee).

Customers progress through a deal pipeline:
Qualified Account → Discovery Call → Strategy Call → SLA/KCT Mapping →
KCT Issued → Closed Won (or Closed Lost at any point).

The structured `closed_lost_reason` is heavily skewed: ~85% of losses
fall into "Insufficient commitment to implement" or "Cold" — both of
which are catch-alls. The real friction signal lives in email distillates
(see Pass 0), not the enum.

# Email round-trip friction signal (added from team standup 2026-04-24)

When Pass 0 distillates show >3 email round-trips between rep and
customer on the SAME unresolved objection, this is itself a friction
signal. The team (Claudia, 2026-04-24) confirmed long email back-and-
forths are a stall pattern — when this happens, the win pattern is to
**switch to a call**. If you detect this in distillates for a stage
transition, surface it as friction with a "switch-to-call" play.

# The Stormboy sales motion (informs all friction interpretation)

The Stormboy funnel converts via on-farm visits, not calls. Sequence:
Call outreach (Ben) → On-farm visit by Hobbs (grazier-in-residence)
→ HORIZON Snapshot delivered → Soft-sell conversion → Sales pipeline.
"Friction at Discovery" often means the customer hasn't been booked
for an on-farm visit fast enough — calls aren't the conversion event,
they're the funnel TO the on-farm visit.

Eras of go-to-market (era is computed from stage history, not a property):
- Legacy (pre-Stormboy launch): manual onboarding, slower KCT, often no
  Discovery Call stage
- KCT era: Knowledge & Capability Tool introduced for assessment
  (deal has KCT Issued stage entry; pre-Stormboy launch)
- Stormboy v1: post-Stormboy launch, deal did NOT pass through the
  "Discovery Call" stage (this stage hadn't been added to the pipeline
  yet within the Stormboy operating window)
- Stormboy v2: post-Stormboy launch AND deal passed through the
  "Discovery Call" stage — structured discovery as a deliberate gate
  before Strategy Call

# Input
You will receive structured data: every closed deal (won or lost) with
full stage history, era, owner, size bucket, region, and (for losses) a
closed-lost reason. You will also receive aggregated medians per stage
transition split by outcome.

# Your task
For each major stage transition in the pipeline, identify:
1. The single most consequential friction pattern — what is holding deals
   up when they stall here? Hypothesise from the data. Don't just
   describe the timing gap.
2. The evidence you used — quote specific numbers (e.g., "won deals
   median 4.2d vs lost deals median 11.8d at this transition; gap widens
   in Stormboy v2 to 14.1d for lost").
3. A concrete tactical play a rep can execute next week to combat the
   friction.

Then identify:
- The single biggest systemic friction across the entire pipeline.
- An era-lift observation: what improved or regressed across eras?

# Output rules
- Plays must be SPECIFIC and TACTICAL. "Improve discovery process" is not
  a play. "Send the customer's NRM-region-matched 25-year ACCU revenue
  forecast within 24h of Discovery Call ending" is.
- Each play must reference at least one piece of input evidence — not be
  invented.
- Use AgriProve language: ACCU, KCT, ERF, soil carbon project, NRM region.
  Not generic sales-talk like "build rapport".
- Calibrate confidence:
  - [high] = ≥30 deals on each side, gap >2x, consistent across eras
  - [moderate] = ≥15 deals, gap >1.5x, or pattern present in 2+ eras
  - [low] = thin data; flag the limitation
- If a stage transition has no clear pattern (gap small, n low), say so.
  Do NOT invent friction to fill the slot.
- Do not output prose outside the JSON. No preamble, no commentary.

# Output schema (strict)
{
  "version": "a1.1",
  "generated_at": "<ISO8601 UTC>",
  "data_window": "<echo from input>",
  "stage_transitions": [
    {
      "from": "<stage name>",
      "to": "<stage name>",
      "median_days_won": <number>,
      "median_days_lost": <number>,
      "friction_pattern": "<≤200 chars; hypothesised cause, not just timing>",
      "evidence": "<≤400 chars; cite specific numbers from input>",
      "play": "<≤250 chars; tactical, executable next week, AgriProve-specific>",
      "play_priority": "high|medium|low",
      "confidence": "high|moderate|low"
    }
  ],
  "top_systemic_friction": "<≤300 chars; the single biggest leverage point across the whole pipeline>",
  "era_lift_observation": "<≤250 chars; what improved or regressed Legacy → KCT → SBv1 → SBv2>"
}
```

## Design notes

- **Why one call, not per-stage:** the model needs to see the whole pipeline to spot systemic friction and era trends. Per-stage calls would lose that context.
- **Why Sonnet not Haiku:** this is the most analytically demanding prompt. Pattern recognition + counterfactual reasoning + tactical synthesis. Haiku undershoots on the "play" specificity.
- **Why aggregate AND raw deals:** the aggregate gives the model the medians without making it compute them; the raw deals let it spot non-obvious sub-patterns (era × size, owner variance).
- **Confidence calibration is explicit** so the frontend can render `[low]` cards differently (greyed out, "thin signal" label).
