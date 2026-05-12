# B2 — Comparable Twins

**Cadence:** nightly, per active deal
**Model:** Haiku (tight, narrative)
**Output cache:** `coaching/cache/twins.json` (keyed by active deal ID)

## Purpose
For an active deal, surface 3–5 historical "twin" deals (similar farm size, region, era, stage path), explain how each progressed, and extract lessons. Powers the Plays tab and the per-deal Risk Coach (B1).

## Twin selection — heuristic, not LLM

Selection runs in code *before* the LLM call. The LLM only narrates.

**Similarity score for each historical deal vs the active deal:**
```
score =
   0.25 * region_match           (1 if same NRM region, 0 otherwise)
 + 0.25 * stage_path_jaccard     (overlap of stages reached)
 + 0.20 * stage_duration_cosine  (cosine sim on per-stage duration vector)
 + 0.15 * era_match              (1 if same era, 0 otherwise)
 + 0.15 * size_bucket_match      (1 if same size bucket, 0 otherwise)
```

Region weighted heavier than era because regional farming factors
(rainfall, soil type, neighbour density, prevailing land use) drive
customer reasoning more than AgriProve's operational era.

**Region derivation (NRM, not state):** AgriProve's HubSpot has no
region property on deals. Region is computed at job time:
1. Find each deal's primary associated contact
2. Read contact's `zip` (postal code)
3. Look up postcode → NRM region in
   `coaching/data/postcode-to-nrm.json`
4. Fallback to contact `state` if zip is missing or unmapped

NRM regions (Natural Resource Management — ~56 nationally) are the
right granularity: they cluster by soil type, rainfall band, and
production system. State alone (NSW/VIC) is too coarse to be useful
for matching.

**Twin pool segmentation by attribution channel:** Deals are tagged
`attribution: "lawrieco"` or `attribution: "direct"` based on
`closed_won_reason` keyword match (LawrieCo wins are partner-channel
deals). When matching twins, **only match within the same channel**
unless the active deal has no attribution yet — partnership wins are
process-different from direct sales wins, and mixing them produces
misleading coaching.
Pick top-5 by score. **Force at least 1 won and 1 lost** in the final set if both exist within top-15.

## Input shape (LLM call)

```json
{
  "active_deal": {
    "id": "...",
    "name": "...",
    "current_stage": "Strategy Call",
    "days_in_current_stage": 9,
    "owner": "...",
    "era": "stormboy_v2",
    "size_bucket": "1000-5000ha",
    "region": "Riverina",
    "stage_history_so_far": [
      { "stage": "Qualified Account", "duration_days": 3.2 },
      { "stage": "Discovery Call",    "duration_days": 5.1 },
      { "stage": "Strategy Call",     "duration_days": 9.0 }
    ]
  },
  "twins": [
    {
      "deal_id": "...",
      "deal_name": "...",
      "outcome": "won|lost",
      "similarity_score": 0.82,
      "era": "...",
      "size_bucket": "...",
      "region": "...",
      "stage_history": [...],
      "closed_lost_reason": "...",
      "email_distillates": [
        {
          "deal_stage_at_time": "Strategy Call",
          "sender_role": "customer|rep",
          "objections_raised": ["...", "..."],
          "value_props_landed": ["...", "..."],
          "sentiment_shift": "positive|neutral|negative|none",
          "summary": "..."
        }
        // typically 5–15 distillates per deal, from Pass 0 cache
      ]
    },
    ... up to 5
  ]
}
```

## Prompt

```
You are a sales coach for AgriProve, a soil carbon measurement platform
serving Australian landholders. Your job is to help a rep understand a
current deal by analogy — by showing them how historical "twin" deals
progressed, and what the lessons are.

# Context
AgriProve sells participation in 25-year soil carbon projects under
Australia's ERF. Revenue model: AgriProve takes 25% of ACCU revenue,
customer keeps 75% (alternative: fee-for-service, customer keeps 100%).

Customers progress through: Qualified Account → Discovery Call →
Strategy Call → SLA/KCT Mapping → KCT Issued → Closed Won.
Domain language: ACCU (Australian Carbon Credit Units), KCT (Knowledge
& Capability Tool), ERF (Emissions Reduction Fund), NRM region (Natural
Resource Management region — geographic cluster shared with similar
soil/rainfall/production conditions).

Eras (computed from stage history, not a property):
- Legacy: pre-Stormboy launch, often no Discovery Call stage
- KCT era: pre-Stormboy launch, deal has KCT Issued entry
- Stormboy v1: post-Stormboy launch, deal did NOT pass through
  Discovery Call (the stage didn't exist yet within the Stormboy window)
- Stormboy v2: post-Stormboy launch AND deal passed through
  Discovery Call as a structured gate before Strategy Call

# Input
You receive ONE ACTIVE DEAL and 3–5 TWINS — historical deals chosen by
similarity (region, stage path, duration profile, era, size). Each twin
has full stage history, outcome, closed-lost reason if applicable, and
EMAIL DISTILLATES — structured signal pre-extracted from the 1:1 emails
between the rep and customer (objections raised, value props that
landed, sentiment shifts, one-line summaries). Distillates carry the
substance of what was said without the raw body.

# Your task

For each twin, in 3–4 sentences:
1. Similarity basis — why is this a useful analogue? (era, size, stage
   path so far)
2. What happened — the inflection moment, not just the timeline. What
   tipped this deal into a win or a loss?
3. The lesson — what does this twin teach the rep about their CURRENT
   active deal?

Then synthesise across all twins:
- The pattern: what does this set of twins suggest is the rep's likely
  path?
- 3 next-best-actions, each tied to specific evidence from one or more
  twins.

# Output rules
- Concrete, not platitudinous. "Engage the customer earlier" is wrong.
  "Book the Strategy Call within 5 days of Discovery — the won Riverina
  twin (deal {id}) did this; the lost one stalled at 14 days" is right.
- Every next_best_action must reference a twin's deal_id in its rationale.
- When email distillates surface specific objections or value props,
  USE them — quote the objection territory ("eligibility uncertainty",
  "ACCU market doubts") and the framing that flipped it.
- Do not invent details not in the data. If you can't see why a twin won
  or lost, say so.
- Use AgriProve language. Don't say "demo", say "Strategy Call" or
  "carbon project walkthrough". Reference the customer's NRM region
  by name when comparing twins.
- Output strict JSON. No prose outside.

# Output schema (strict)
{
  "version": "b2.1",
  "generated_at": "<ISO8601 UTC>",
  "active_deal": {
    "id": "<echo>",
    "name": "<echo>",
    "current_stage": "<echo>",
    "days_in_current_stage": <number>
  },
  "twins": [
    {
      "deal_id": "<echo>",
      "deal_name": "<echo>",
      "outcome": "won|lost",
      "similarity_basis": "<≤200 chars>",
      "what_happened": "<≤350 chars; the inflection, not the timeline>",
      "lesson": "<≤200 chars; applied to the active deal>"
    }
  ],
  "synthesis": "<≤400 chars; cross-twin pattern>",
  "next_best_actions": [
    {
      "action": "<≤200 chars; tactical, executable, AgriProve-specific>",
      "rationale": "<≤200 chars; cite twin deal_id(s)>",
      "priority": "high|medium|low"
    }
  ]
}
```

## Design notes

- **Twin selection in code** keeps cost predictable and behaviour debuggable. The LLM doesn't pick twins; we just hand it 5.
- **Forcing won + lost mix:** without this, a winning region/era can dominate the twin set and the rep gets only "you'll win" framing. The contrast is what teaches.
- **Region weighted heavier than era (0.25 vs 0.15):** regional farming factors (rainfall, soil type, neighbour density, prevailing land use) shape customer reasoning more than AgriProve's operational era. Same go-to-market period still matters, but it's secondary.
- **Email distillates, not subjects, not bodies:** Pass 0 distills each 1:1 email into structured signal (objections, value props, sentiment, summary) with PII generalised. B2 consumes distillates — substance preserved, cost controlled, PII contained to one upstream pass.
- **Why Haiku:** narrative task with bounded inputs. Sonnet adds latency without lifting quality here.
- **Per-deal cache key:** active deals only; refreshed nightly. Won/lost deals are static — no need to refresh their twin pools.
