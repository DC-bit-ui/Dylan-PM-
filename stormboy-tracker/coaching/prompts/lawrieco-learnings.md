# LawrieCo Learnings — Channel Pattern Mining

**Status:** Design doc, build deferred to v2.
**Cadence (planned):** weekly
**Model (planned):** Sonnet, multi-pass

## Why this exists

MCP inspection (2026-05-08) revealed that LawrieCo partner-channel deals close at **3× the win rate of direct sales (~45% vs ~15%) and 19 days faster (28d vs 47d median)**. Multiple won deals show `closed_won_reason = "LawrieCo relationship"` / `"LawrieCo Project"` / `"LawrieCo deal"`.

Two implications:

1. **Operational:** B2 twin matching must segment by channel (already wired in `b2-comparable-twins.md`) — partnership wins are process-different from direct wins, mixing them produces misleading coaching.
2. **Strategic:** LawrieCo wins represent an *intelligence asset*. What does LawrieCo do at Discovery / Strategy that direct sales doesn't? Can patterns transfer? Which can't?

This prompt mines LawrieCo wins for transferable patterns and surfaces them as a "LawrieCo Playbook" — guidance for direct sales that's grounded in *what's actually working in the partner channel*.

## Inversion lens

The most powerful framing is **inverse**: "What is uniquely PRESENT in LawrieCo wins that is uniquely ABSENT in Direct losses?" This is the Inverse Win Analysis pattern (cluster C, idea C1) applied to one specific channel comparison.

Examples of what the data might reveal:
- LawrieCo customers arrive pre-warmed (trust transfer from existing relationship) — direct sales spends ~10 days in scheduling friction that LawrieCo skips entirely
- LawrieCo conversations open at a different stage of the customer's mental model (already convinced of the methodology; questions are about specifics)
- LawrieCo's framing of the 25/75 split lands differently — perhaps LawrieCo positions AgriProve as a service-provider, not a counter-party
- LawrieCo wins skip stages that direct deals get stuck on

Some of these will be transferable; some will be intrinsic to having a partner. The prompt's job is to separate the two.

## Planned input shape

```json
{
  "data_window": "...",
  "lawrieco_wins": [
    {
      "deal_id": "...",
      "stage_history": [...],
      "email_distillates": [ ... from Pass 0 ... ],
      "closed_won_reason": "LawrieCo relationship"
    }
  ],
  "direct_wins": [ ... same shape ... ],
  "direct_losses": [ ... same shape ... ]
}
```

## Planned prompt sketch

```
You are mining a partner-channel sales pattern at AgriProve. LawrieCo
deals close at 3× the win rate of direct sales. Your job: identify what
LawrieCo does that's unique, and separate transferable patterns from
channel-intrinsic advantages.

# Task
For each pipeline stage, perform inverse analysis:
1. What objections appear in LawrieCo wins' email distillates?
   (Often the same objections direct customers raise.)
2. How do LawrieCo wins handle each objection? (The framing,
   the cadence, the supporting materials.)
3. How do direct LOSSES handle the same objection? (Where the
   gap is.)
4. What does LawrieCo skip entirely? (Stages, content, friction
   that direct deals carry.)

Then categorise findings:
- TRANSFERABLE: a tactic, framing, or sequencing that direct sales
  can adopt without partner channel access
- CHANNEL-INTRINSIC: an advantage that depends on pre-existing
  partner trust and cannot transfer
- HYBRID: a tactic that's harder for direct but partially
  reproducible

# Output
A "LawrieCo playbook" — stage-indexed list of patterns with
transferability tags and tactical framings direct sales can adopt
next week.
```

## Output schema (planned)

```json
{
  "version": "lc.0",
  "generated_at": "ISO",
  "channel_metrics": {
    "lawrieco": { "win_rate": 0.45, "median_days_to_close": 28, "n": 56 },
    "direct":   { "win_rate": 0.15, "median_days_to_close": 47, "n": 234 }
  },
  "stage_patterns": [
    {
      "stage": "Discovery Call",
      "lawrieco_distinctive": "<≤300 chars; what LawrieCo does that direct doesn't>",
      "direct_loss_pattern": "<≤300 chars; what direct losses look like at this stage>",
      "transferability": "transferable|hybrid|channel_intrinsic",
      "tactical_framing_for_direct": "<≤350 chars; what a direct rep can do next week>",
      "supporting_lawrieco_deal_ids": ["..."],
      "supporting_direct_loss_deal_ids": ["..."],
      "confidence": "high|moderate|low"
    }
  ],
  "channel_intrinsic_advantages": [
    "<≤200 chars each; what cannot transfer>"
  ],
  "transferable_playbook": [
    "<≤300 chars each; ranked tactics direct sales should adopt>"
  ]
}
```

## Open questions for v2 build

1. **Partnership context:** what exactly does LawrieCo do upstream of HubSpot (introductions, joint visits, branded materials)? Email distillates may not capture this — may need rep-side context capture.
2. **Selection bias:** are LawrieCo customers fundamentally different (size, geography, sophistication)? Need to control for this when comparing patterns.
3. **Direct rep capacity:** even if a tactic transfers, does the direct sales team have the bandwidth to adopt it? Some LawrieCo motions are time-intensive.

## v1 in the meantime

The v1 dashboard surfaces channel metrics on the Patterns tab (Channel Comparison section in `patterns.js`). That's the entry point. v2 adds this analytical depth.
