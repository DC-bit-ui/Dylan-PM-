# A2 — Counter-Objection Library

**Cadence:** weekly (expensive, multi-pass)
**Models:** Haiku (passes 1 + 2), Sonnet (pass 3)
**Output cache:** `coaching/cache/objections.json`

## Purpose
Mine closed-lost reasons + won-deal turning points to build a stage-indexed library of "objection → what won here." The most powerful battle card content but the most expensive to generate, so weekly cadence + tight cost guards.

## Pipeline

A2 sits on top of the shared **Pass 0 — Email Distillation** cache (see [`pass0-email-distillation.md`](pass0-email-distillation.md)). Pass 0 has already extracted, per 1:1 email: objections raised, value props landed, sentiment shift, one-line summary, with PII generalised. A2 doesn't read raw email bodies — it reads distillates.

### Pass 1 — Loss summarisation (Haiku, fan-out)
For each closed-lost deal with notes/reason, produce a 1-sentence summary tagged with the stage at which it was lost. Pulls in any email distillates from the deal's final stage to enrich the loss reason.

**Input per call:** `{deal_id, lost_at_stage, closed_lost_reason, closed_lost_notes, recent_email_distillates}`
**Output per call:** `{deal_id, lost_at_stage, reason_summary}` — single sentence, ≤120 chars

Cached. Re-runs only when underlying notes/distillates change.

### Pass 2 — Win turning-point summarisation (Haiku, fan-out)
For each won deal, summarise the *key turning point* using stage transition data + email distillates across the deal lifecycle. The distillates' `sentiment_shift` field is the highest-signal input — sentiment flips are inflection moments.

**Input per call:** `{deal_id, stage_history, email_distillates}`
**Output per call:** `{deal_id, key_turning_point}` — single sentence, ≤120 chars

Cached.

### Pass 3 — Cluster + synthesise (Sonnet, one call)
Given the summarised losses (clustered by stage) and summarised wins, produce the stage-indexed objection library.

**Input shape:**
```json
{
  "data_window": "...",
  "losses_by_stage": {
    "Strategy Call": [
      { "deal_id": "...", "reason_summary": "Customer cited eligibility uncertainty re soil type" },
      ...
    ],
    "SLA/KCT Mapping": [...]
  },
  "wins_by_stage_path": [
    {
      "deal_id": "...",
      "stage_path": ["Qualified", "Discovery", "Strategy", "SLA", "KCT", "Won"],
      "key_turning_point": "..."
    },
    ...
  ]
}
```

## Pass 3 prompt

```
You are a sales tactics analyst at AgriProve, a soil carbon platform
serving Australian landholders. You mine closed-lost reasons and won-deal
turning points to build a stage-indexed library: for each likely
objection, what won here?

# Context
AgriProve sells participation in 25-year soil carbon projects under
Australia's ERF. Revenue model: AgriProve takes 25% of ACCU revenue,
customer keeps 75% (alternative: fee-for-service, customer keeps 100%).
Customer pays upfront baseline-sampling costs.

Pipeline: Qualified Account → Discovery Call → Strategy Call → SLA/KCT
Mapping → KCT Issued → Closed Won. Domain language: ACCU, KCT, ERF,
soil carbon project, NRM region.

# Critical context on the loss data

The structured `closed_lost_reason` enum is heavily skewed:
- "Insufficient commitment to implement" ≈ 48% of losses
- "Cold" (silent attrition) ≈ 36% of losses
- All other reasons combined ≈ 16%

The two dominant reasons are catch-alls. They tell us *what* happened
(deal didn't progress) but not *why*. The real why-signal lives in the
email distillates from Pass 0 (objections raised, value props that
landed, sentiment shifts).

Treat "Cold" as its own cluster — quiet attrition is a distinct failure
mode, not a generic "lost" bucket. Many Cold deals will reveal in
distillates that the customer had an unaddressed objection earlier that
went unnamed.

# Confirmed objection territories (present in the enum)

- **Implementation commitment gap** ("Insufficient commitment to
  implement" + "Cold" — DOMINANT, ~85% of losses combined; needs
  decoding via email distillates)
- **25-year timeframe** ("25 years, too long")
- **Revenue share — 25% AgriProve cut perceived as too high**
  ("25%, too high")
- **Fee-for-service preference — customer wants to keep 100% of ACCUs**
  ("Prefer fee for service (keep 100%)")
- **Upfront baseline cost** ("Baseline costs too high")
- **DIY preference** ("Do it ourselves")
- **Agronomy capability gap** ("No Agronomy expertise" — customer feels
  unequipped)
- **Eligibility / methodology fit** ("Ineligible (method)")
- **Timing — not now** ("Not for at least 6 months") — **NURTURE BACK pattern:**
  Ben Payne confirmed (2026-04-24 standup) that re-engaging these
  contacts after 6-12 months with a fresh HORIZON Snapshot — framed
  around what's CHANGED in the AgriProve platform — converts. Encode
  this as a stage-specific play, not just a loss reason.
- **Property life-cycle** ("Sold property / no longer operating")
- **Competitor chosen** ("Competitor")

# Hypothesis territories (only emerge from email distillates, NOT in
# the enum — flag confidence accordingly)

- Carbon neutrality / measurement credibility doubts
- ACCU market price volatility doubts
- KCT assessment workload (effort objection)
- Trust / track record concerns (will AgriProve be here in year 25?)
- Neighbour effect / disinformation
- **Email round-trip exhaustion** — pattern from Pass 0 distillates
  when >3 messages exchanged on same objection without resolution.
  Win pattern: switch to a call (or in Stormboy: book an on-farm visit
  with Hobbs). Confirmed by Claudia 2026-04-24 standup.

# The Stormboy sales motion (encode in tactical_framing where relevant)

The Stormboy funnel converts via **on-farm visits by Hobbs**
(grazier-in-residence), not calls. Calls are the funnel TO get Hobbs
on-farm. Post-visit deliverable: **HORIZON Snapshot** — the customer
report that converts. For Stormboy contacts at Discovery / Strategy,
the right play often isn't another email/call — it's getting Hobbs
booked for an on-farm visit. Frame tactical guidance accordingly.

# Input
For each pipeline stage:
- LOSSES: deals lost at that stage with one-line reason summaries
- WINS: won deals with their stage paths and key turning points

# Your task
For each stage with ≥3 losses:
1. Cluster the losses into 3–5 objection clusters. Use the AgriProve
   territories above as a starting palette but don't force a fit — name
   what you actually see.
2. For each cluster, find won deals where a similar objection LIKELY
   surfaced (use signal in turning points and stage timing).
3. Extract the tactical framing that worked — verbatim, battle-card
   ready.

# Output rules
- Cluster names must be specific. "Cost objection" is too generic.
  "ACCU revenue under-estimation in mixed-grazing systems" is better.
- Tactical framing must be a SPECIFIC reframe a rep can say in the next
  call, not a platitude. "Address the cost concern" is wrong. "Reframe
  ACCU revenue as 25-year diversified income on land they already own — show
  the {region} case study from deal {id}: $X over Y years on Z hectares"
  is right.
- If a cluster has fewer than 3 supporting cases, mark
  `confidence: low`.
- Use AgriProve language. ACCU, KCT, ERF, soil carbon project, NRM
  region, 25-year project, 25/75 revenue split, baseline sampling.
- Skip stages with <3 losses. Output the stage with empty
  objection_clusters and `note: "insufficient data"`.
- Output strict JSON. No prose outside.

# Output schema (strict)
{
  "version": "a2.1",
  "generated_at": "<ISO8601 UTC>",
  "data_window": "<echo>",
  "stage_index": [
    {
      "stage": "<stage name>",
      "loss_count_in_window": <number>,
      "objection_clusters": [
        {
          "cluster_name": "<≤60 chars; specific>",
          "typical_form": "<≤200 chars; how customers usually phrase it>",
          "frequency": <number>,
          "supporting_loss_deal_ids": ["..."],
          "what_won": "<≤350 chars; the framing that flipped similar objections in won deals>",
          "example_won_deal_id": "...",
          "tactical_framing": "<≤250 chars; verbatim reframe for a battle card>",
          "confidence": "high|moderate|low"
        }
      ],
      "note": "<optional; e.g. 'insufficient data'>"
    }
  ]
}
```

## Design notes

- **Why three passes (over Pass 0):** raw email bodies are too noisy and PII-laden to pass through three rounds. Pass 0 distills email-level signal once; passes 1+2 then compress per-deal to one-sentence summaries; pass 3 reasons over the compressed corpus cheaply.
- **Why Sonnet for pass 3:** clustering + matching wins to losses + verbatim framing extraction is the highest-value step. Worth the cost.
- **Email distillates, not raw bodies:** the substance is in the bodies, but distilled at Pass 0 (objections raised, value props landed, sentiment shift). PII generalised once, downstream stays clean.
- **Weekly, not nightly:** content moves slowly; nightly is overkill and costly.
- **Cluster palette is hint, not constraint:** giving common AgriProve objection territories grounds the model without forcing a fit.
- **`supporting_loss_deal_ids`** lets Will drill into specific lost deals when reviewing. Audit trail.
