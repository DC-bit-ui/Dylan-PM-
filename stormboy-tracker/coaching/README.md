# Coaching engine

The intelligence layer underneath the Stormboy Tracker dashboard. Turns descriptive analytics ("here's where deals drop") into prescriptive plays ("do this to combat X").

## Architecture

```
SCHEDULED JOBS  →  cache/*.json  →  /api/coaching/*  →  frontend (Plays + Patterns + inline cards)
```

Jobs are server-side. They fetch HubSpot, shape the input, call Claude, write JSON cache. The frontend only ever reads cache — fast, predictable cost.

## The prompts

Each prompt is the IP. Generic "analyze this" gives generic insights. These encode AgriProve domain (KCT, ACCU, ERF, soil carbon JTBD) and force *plays*, not stats.

**Pass 0 is shared upstream** — it distills 1:1 email bodies into structured signal once. B2 and A2 then consume distillates instead of raw bodies. Substance preserved, cost controlled, PII isolated to one pass.

| File | What it produces | Cost class | Cadence |
|---|---|---|---|
| [`prompts/pass0-email-distillation.md`](prompts/pass0-email-distillation.md) | Per email: objections, value props, sentiment shift, summary | Haiku per email (cached) | Nightly on new emails |
| [`prompts/a1-stage-friction.md`](prompts/a1-stage-friction.md) | Per stage transition: friction pattern + tactical play | Single Sonnet call | Nightly |
| [`prompts/b2-comparable-twins.md`](prompts/b2-comparable-twins.md) | Per active deal: 3–5 historical twins + lessons | Haiku per active deal (cached) | Nightly |
| [`prompts/a2-counter-objection.md`](prompts/a2-counter-objection.md) | Stage-indexed objection library + counter-framing | Multi-pass Haiku → Sonnet | Weekly |
| [`prompts/b1-deal-risk-coach.md`](prompts/b1-deal-risk-coach.md) | Per active deal: risk score + 3-action coaching message | Code + small Haiku call | Nightly |

## Design rules (apply to every prompt)

1. **Plays, not stats.** "Improve discovery" is wrong. "Send Schedule 2 prefill within 24h of Discovery Call ending" is right.
2. **Cite evidence.** Every assertion has a number, deal ID, or quote behind it.
3. **Confidence levels.** `[high]` / `[moderate]` / `[low]` per output, calibrated to data signal strength.
4. **Strict JSON output.** No prose outside the JSON. Frontend renders predictably.
5. **AgriProve language.** ACCU, KCT, Schedule 2, ERF, soil carbon project — not generic sales-talk.
6. **Version every output.** Schema bumps as we iterate prompts; frontend can render multiple versions.

## Era classification (computed, not stored)

Eras are derived from each deal's stage history at job time, not read from a HubSpot property:

- **Legacy** — closed before Stormboy launch, no KCT Issued stage entry
- **KCT** — closed before Stormboy launch, has KCT Issued stage entry
- **Stormboy v1** — closed at/after Stormboy launch, did NOT pass through Discovery Call (the stage was added mid-Stormboy)
- **Stormboy v2** — closed at/after Stormboy launch, passed through Discovery Call as a structured gate

Stormboy launch date is a config variable (`STORMBOY_LAUNCH_DATE`); change once, all jobs re-classify on next run.

## Memory architecture — three layers, separate ownership

```
┌──────────────────────────────────────────────────────────────────────┐
│  Claudia's Storm Boy Claude Tool                                     │
│  Authority: Claudia (only she changes files)                         │
│  Holds: live operational state — call admin, farm-visit transcripts, │
│         lead research, Friday weekly logs, friction-points, the      │
│         pelican294 workflow that writes Aircall transcripts to       │
│         Confluence                                                   │
│  Pattern: she writes, others read (incl. our coaching engine)        │
└──────────────────────────────────────────────────────────────────────┘
                          │ (read-only)
                          ↓
┌──────────────────────────────────────────────────────────────────────┐
│  Our coaching system memory  (stormboy-tracker/coaching/learnings/)  │
│  Authority: this repo's coaching engine                              │
│  Holds: growth-domain learnings the pipeline auto-writes — tactical  │
│         plays, tactical framings, strategic findings. Same           │
│         conventions as Claudia's tool (markdown, dated folders,      │
│         INDEX.md, supersede-via-forward-link).                       │
│  Pattern: AUTO-WRITE on emergence. No approval gate. Append-only;    │
│         revisions use supersedes/superseded_by front-matter.         │
└──────────────────────────────────────────────────────────────────────┘

Dylan's PM memory (`C:\Dylan PM\memory\`) is intentionally NOT in this
diagram. Growth insights live with the growth product. PM memory holds
cross-product strategy/decisions and stays uncluttered.
```

See [`learnings/README.md`](learnings/README.md) for conventions.

## Region derivation — postcode → NRM, not deal property

AgriProve's HubSpot has no `region` field on deals. Region is derived at job time:
1. Find each deal's primary associated contact
2. Read contact's `zip` (postal code)
3. Look up postcode → NRM region in `coaching/data/postcode-to-nrm.json` (build deferred — see [`data/postcode-to-nrm-plan.md`](data/postcode-to-nrm-plan.md))
4. Fallback to contact `state` (NSW/VIC/etc.) if zip is missing

NRM regions (Natural Resource Management — ~56 nationally) cluster by soil type, rainfall, and production system — exactly the variables a 25-year soil carbon project depends on. State alone is too coarse.

## Channel attribution — LawrieCo vs Direct

Won deals are tagged `attribution: "lawrieco"` or `attribution: "direct"` based on `closed_won_reason` keyword match. **MCP inspection found LawrieCo deals close at 3× the win rate of direct sales (~45% vs ~15%) and 19 days faster.** B2 twin matching only matches twins within the same channel — partnership wins are process-different and mixing them produces misleading coaching.

LawrieCo deals are also a strategic intelligence asset — see [`prompts/lawrieco-learnings.md`](prompts/lawrieco-learnings.md) for the planned v2 analytical layer that mines transferable patterns. v1 surfaces channel comparison metrics on the Patterns tab.

## Twin selection (B2) — heuristic, not LLM

Twins are picked deterministically in code. Weights:
- region (NRM) match: 0.25
- stage_path Jaccard: 0.25
- duration cosine: 0.20
- era match: 0.15
- size_bucket match: 0.15

Region weighted heavier than era because regional farming context (rainfall, soil, production system) shapes customer reasoning more than AgriProve's operational era. The LLM only narrates the chosen twins.

## Commercial model context (informs every prompt)

- 25-year project commitment under the ERF (NOT 7-year — earlier prompt drafts had this wrong; corrected after MCP-validated inspection of `closed_lost_reason` enum showing "25 years, too long")
- Revenue split: AgriProve takes 25% of ACCU revenue, customer keeps 75%
- Alternative: fee-for-service (customer keeps 100%, pays AgriProve a service fee)
- Customer pays upfront baseline-sampling costs

## Real loss-reason distribution

`closed_lost_reason` is heavily skewed:
- "Insufficient commitment to implement" — ~48% of losses
- "Cold" (silent attrition) — ~36% of losses
- All other reasons combined — ~16%

The two dominant reasons are catch-alls. The real why-signal lives in Pass 0 email distillates — which is why **Pass 0 is critical, not optional**, for A2's value.

## Cost discipline

Frontend never calls Claude directly for coaching content. Every coaching insight is precomputed in a scheduled job and served from cache. Manual `/api/coaching/refresh` for Will to force regen.
