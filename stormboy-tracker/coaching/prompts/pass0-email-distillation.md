# Pass 0 — Email Distillation (shared upstream pass)

**Cadence:** nightly, only on emails not yet distilled
**Model:** Haiku (cheap, per-email fan-out)
**Output cache:** `coaching/cache/email_distillates.json` (keyed by email_id)
**Consumed by:** B2 (Twins), A2 (Counter-Objection), optionally B1 (Risk Coach)

## Purpose

The substance of customer interactions is in 1:1 email bodies, not subject lines. But raw bodies are voluminous, contain PII, and are noisy. Pass 0 reads each email **once** and produces a structured signal record — objections raised, value props landed, sentiment shift, one-line summary — with PII generalised in the prompt itself. Downstream prompts (B2, A2, B1) then consume distillates, never raw bodies.

This isolates the PII surface to one upstream pass, controls cost via fan-out caching, and produces a clean structured signal layer that's reusable across all coaching analysis.

## Input shape (per email)

```json
{
  "email_id": "...",
  "deal_id": "...",
  "deal_stage_at_time": "Strategy Call",
  "sender_role": "customer|rep",
  "sent_at": "ISO8601",
  "subject": "...",
  "body": "<raw email body>"
}
```

## Prompt

```
You are distilling a single 1:1 email between an AgriProve sales rep
and an Australian landholder customer (or vice versa) into structured
signal for downstream coaching analysis. You read the email once; this
distillate is what every downstream prompt sees.

# Context
AgriProve sells participation in soil carbon projects under Australia's
ERF (Emissions Reduction Fund). Pipeline: Qualified Account → Discovery
Call → Strategy Call → SLA/KCT Mapping → KCT Issued → Closed Won. Domain
language: ACCU (Australian Carbon Credit Units), KCT (Knowledge &
Capability Tool), Schedule 2 (project schedule under the ERF), soil
carbon project.

AgriProve commercial model (relevant for objection interpretation):
- 25-year project commitment under the ERF
- Revenue split: AgriProve takes 25% of ACCU revenue, customer keeps 75%
- Customer pays upfront baseline-sampling costs
- Alternative arrangement available: fee-for-service (customer keeps 100%
  of ACCUs but pays AgriProve a service fee)

Common objection territories — CONFIRMED (present in HubSpot
closed_lost_reason enum):
- Eligibility / methodology fit (does my farm qualify? "Ineligible (method)")
- Implementation commitment gap ("Insufficient commitment", customer
  goes "Cold" — these together account for ~85% of structured loss
  reasons; the substance is in emails, not the enum)
- 25-year timeframe concern ("25 years, too long")
- Revenue share resistance — 25% AgriProve cut perceived as too high
  ("25%, too high")
- Fee-for-service preference (customer wants 100% of ACCUs, prefers
  service fee model — "Prefer fee for service (keep 100%)")
- Upfront baseline costs too high ("Baseline costs too high")
- DIY preference ("Do it ourselves")
- Agronomy capability gap ("No Agronomy expertise" — customer feels
  unequipped to implement)
- Timing — "not now" ("Not for at least 6 months")
- Property life-cycle change ("Sold property / no longer operating")
- Competitor chosen ("Competitor")

Hypothesis territories — only surfaceable from email signal, NOT in the
enum:
- Carbon neutrality / measurement credibility doubts
- ACCU market price doubts
- KCT effort (assessment workload)
- Trust / track record (will AgriProve be here in year 25?)
- Neighbour effect / disinformation

# Task
Read the email. Extract:

1. objections_raised — max 3 short strings, ≤80 chars each. Distil
   what the customer is pushing back on, even if implied between the
   lines (e.g., "delaying the Strategy Call" → "timing concern").
   For rep-sent emails, capture objections the rep is *anticipating*
   or *responding to* if visible in framing.

2. value_props_landed — max 3 short strings, ≤80 chars each. Things
   that received explicit positive customer signal, OR rep-stated
   value props followed by customer agreement / engagement. Empty
   array if none.

3. sentiment_shift — the directional change in customer tone vs the
   prior tone (or vs neutral if first email). Values:
   - "positive": customer warming, more engaged, asking next-step
     questions
   - "neutral": flat, transactional
   - "negative": cooling, raising new objections, going quiet
   - "none": single-direction email or no detectable shift

4. summary — ≤200 chars. One sentence: what did this email do for the
   deal?

# PII rules (strict)
- Do NOT echo full names, exact addresses, financial figures, or
  property names into the output.
- GENERALISE specifics: "5000ha grazing operation in Riverina" not
  "the Smith family's Wagga property"; "concerns about ACCU revenue"
  not "$45,000 over 7 years on Edmunds farm".
- If the email mentions a specific dollar figure, abstract to a band
  (small / mid / large ACCU revenue scenario).

# Output rules
- Concise, signal-only. No commentary, no preamble.
- Strict JSON.
- If the email has no clear signal in a category, use empty array
  or "none".
- Use AgriProve language. Tag objections from the territory list
  above when the fit is clear.

# Output schema (strict)
{
  "version": "p0.1",
  "email_id": "<echo>",
  "deal_id": "<echo>",
  "deal_stage_at_time": "<echo>",
  "sender_role": "<echo>",
  "objections_raised": ["<≤80 chars>", ...],
  "value_props_landed": ["<≤80 chars>", ...],
  "sentiment_shift": "positive|neutral|negative|none",
  "summary": "<≤200 chars; PII-generalised>"
}
```

## Design notes

- **One pass per email, ever.** Distillates are cached by `email_id`. Re-runs only on first sight of a new email. Storage is tiny (~500 bytes per email), compute is one Haiku call per new email.
- **PII generalisation in-prompt, not post-hoc.** The model is instructed to never write specifics into the output. Cheaper and more reliable than regex stripping.
- **Tagging objections to the territory palette** keeps downstream clustering (A2) clean. The model can still emit objections outside the palette if novel.
- **Sentiment shift is the highest-leverage field.** A2's "key turning point" extraction depends on it. Spec'd carefully — direction relative to prior tone, four-state enum.
- **Why Haiku:** structured extraction with tight constraints. Sonnet would lift quality marginally at 5× cost. Haiku is the right tier here.
- **Cost estimate:** ~$0.0001 per email. 500 backlog emails ≈ $0.05 one-off; ~$0.005/day at 50 new emails per day. Cheap.
