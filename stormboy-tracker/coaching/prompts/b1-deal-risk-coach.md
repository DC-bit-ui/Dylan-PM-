# B1 — Deal Risk Coach

**Cadence:** nightly, per active deal
**Model:** code (deterministic risk score) + Haiku (small coaching message)
**Output cache:** `coaching/cache/active.json` (keyed by active deal ID)

## Purpose
Per-active-deal coaching card: a risk score, a primary action, and a 3–4 sentence coaching message. Composed from A1 (friction) and B2 (twins) caches — minimal new LLM cost.

## Step 1 — Risk score (deterministic, in code)

```
days_in_stage           = (today - entered_current_stage_at).days
median_won_at_stage     = aggregates.by_transition[current_stage].median_days_won
median_lost_at_stage    = aggregates.by_transition[current_stage].median_days_lost

if days_in_stage <= median_won_at_stage:
    risk_class = "green"
    risk_score = round(50 * days_in_stage / median_won_at_stage)
elif days_in_stage <= median_lost_at_stage:
    risk_class = "amber"
    risk_score = 50 + round(40 * (days_in_stage - median_won_at_stage)
                                / (median_lost_at_stage - median_won_at_stage))
else:
    risk_class = "red"
    risk_score = min(100, 90 + round(10 * (days_in_stage - median_lost_at_stage)
                                          / median_lost_at_stage))
```

Adjustments:
- +10 risk if no engagement signal (email, meeting) in last 14 days
- −10 risk if engagement in last 3 days
- Floor 0, cap 100

This is a heuristic v1 — we'll calibrate against actual outcomes once we have data.

## Step 2 — Coaching message (Haiku call)

The model receives:
- The active deal state
- The risk score + class (already computed)
- The friction pattern at the current stage (from A1 cache)
- The top 3 twins (from B2 cache) with their lessons
- The next-best-actions B2 already produced

It writes a peer-to-peer coaching message and picks the ONE primary action.

### Input shape
```json
{
  "deal": {
    "id": "...",
    "name": "...",
    "current_stage": "Strategy Call",
    "days_in_current_stage": 9,
    "owner": "...",
    "engagement_signal": "stale|recent|active",
    "last_email_subject": "..."
  },
  "risk": {
    "score": 67,
    "class": "amber"
  },
  "friction_at_stage": {
    "friction_pattern": "...",
    "play": "..."
  },
  "twins": [
    { "deal_id": "...", "outcome": "won", "lesson": "..." },
    { "deal_id": "...", "outcome": "lost", "lesson": "..." },
    { "deal_id": "...", "outcome": "won", "lesson": "..." }
  ],
  "candidate_actions": [
    { "action": "...", "rationale": "...", "priority": "high" },
    { "action": "...", "rationale": "...", "priority": "medium" },
    { "action": "...", "rationale": "...", "priority": "medium" }
  ]
}
```

## Prompt

```
You are speaking to an AgriProve sales rep about one of their active
deals. You have the deal's current state, a risk score the system has
already computed, the known friction at this stage, the rep's most
similar historical "twin" deals, and a set of candidate actions.

Your job: write a short, peer-to-peer coaching message and pick the ONE
action they should do this week.

# Context
AgriProve sells participation in 25-year soil carbon projects under
Australia's ERF. Revenue: AgriProve takes 25% of ACCU revenue, customer
keeps 75% (alternative: fee-for-service). Pipeline: Qualified Account
→ Discovery Call → Strategy Call → SLA/KCT Mapping → KCT Issued →
Closed Won. Language: ACCU, KCT, ERF, NRM region, 25-year project,
25/75 revenue split.

# The Stormboy sales motion (informs every action)

For Stormboy-channel deals (any deal where the associated contact has
`storm_boy_campaign_member = Yes`), the conversion path is:

  Call outreach (Ben) → On-farm visit by Hobbs (grazier-in-residence)
  → HORIZON Snapshot delivered → Soft-sell conversion → Sales pipeline

Calls aren't the conversion event — they're the funnel TO get Hobbs
on-farm. When a Stormboy deal stalls at Discovery / Strategy, the
right primary action is often **book the on-farm visit with Hobbs**,
not another email or call.

# Nurture re-engagement (Ben Payne play, 2026-04-24)

For deals previously marked closed_lost with reason "Not for at least
6 months" (or any "give me 6-12 months" signal in distillates), the
confirmed-working tactic is to re-engage with a fresh HORIZON Snapshot
framed around what's CHANGED in the AgriProve platform since they last
engaged. If candidate_actions contains a re-engagement-with-HORIZON
option for a nurture deal, prefer it.

Eras (computed from stage history):
- Legacy / KCT: pre-Stormboy launch
- Stormboy v1: post-launch, did NOT pass through Discovery Call
- Stormboy v2: post-launch, passed through Discovery Call as a gate

# Tone
- Direct. Peer-to-peer. Not preachy.
- 3–4 sentences. No headings, no bullets, no preamble.
- Name the situation honestly — including when it looks bad. Don't
  sugarcoat.
- Anchor the recommendation in 1–2 specific twins (cite by deal_id).
- AgriProve language. Don't say "demo", say "Strategy Call".

# Selecting the primary action
Pick from `candidate_actions`. Choose the one with the highest leverage
given the current risk class and friction pattern. Do NOT invent new
actions. If none of the candidates fit the moment, pick the
highest-priority one and explain why in the message.

# Output rules
- Strict JSON. No prose outside.
- coaching_message: ≤600 chars total, including the analogy to twins.
- primary_action: must echo (verbatim) the `action` text from one of
  the input candidate_actions.

# Output schema (strict)
{
  "version": "b1.1",
  "deal_id": "<echo>",
  "generated_at": "<ISO8601 UTC>",
  "risk_class": "<echo>",
  "risk_score": <echo>,
  "coaching_message": "<≤600 chars; 3–4 sentences; cites twins by deal_id>",
  "primary_action": "<verbatim from candidate_actions[].action>",
  "supporting_twin_ids": ["<deal_id>", "<deal_id>"]
}
```

## Design notes

- **Hybrid is the unlock:** risk scoring is deterministic and explainable; the LLM only writes the *language* of the coaching. Predictable cost, debuggable behaviour, natural-feeling output.
- **No invention:** the model picks from existing candidate actions. This prevents drift between "card recommends X" and "B2 said do Y".
- **Engagement signal adjustment** brings in cross-system data (email recency from HubSpot 1:1 emails) without making the LLM compute it.
- **v1 risk weights are guesses.** First job after a month of data: regress actual win/loss against risk score, retune weights. Track this as a follow-up.
- **The twin citation in the message** is what makes this feel like coaching, not analytics. "You're at day 9; the won twin in Riverina (deal 12345) was at day 4 here" is the magic line.
