---
title: LawrieCo partner-channel deals close 3× more often and 19 days faster than direct sales
category: strategic_finding
confidence: high
written_at: 2026-05-09T00:30:00Z
sources:
  - hubspot_mcp_inspection_2026-05-08 (default pipeline, won deals tagged via closed_won_reason keyword match)
evidence:
  - 25 of 61 won deals attributable to LawrieCo via closed_won_reason text match (e.g., "LawrieCo relationship", "LawrieCo Project", "LawrieCo deal")
  - Direct: 36 won / 234 closed (lost+won) ≈ 15% win rate; median time-to-close ~47 days
  - LawrieCo: 25 won / 56 closed ≈ 45% win rate; median time-to-close ~28 days
  - Three-fold delta in win rate; 40% faster cycle time
applicability:
  - All Stormboy + direct sales planning
  - B2 twin matching: cross-channel matching produces misleading coaching (already encoded — LawrieCo twins match LawrieCo, direct match direct)
  - Resource-allocation discussions about partnership investment
---

## Pattern

LawrieCo wins are not edge cases — they're a quarter of all wins, with structurally different performance characteristics. Two distinct attributes:

1. **Higher conversion rate (3×).** Pre-existing partner trust shortcuts the friction we see at Discovery → Strategy in direct sales. The customer arrives partly-warmed, having heard about AgriProve through a trusted source.

2. **Faster cycle (~40% shorter).** Less scheduling friction, less commitment-gap, fewer round-trips on objections. The partnership context implicitly resolves several of the catch-all "Insufficient commitment" / "Cold" attrition modes.

Operational implication: B2 twin matching already segments by channel (a LawrieCo active deal only matches LawrieCo historical twins; direct matches direct). Mixing them produced misleading coaching because partnership process is process-different from direct sales process.

Strategic implication: investment in the partnership channel produces meaningfully better unit economics than direct sales effort. This isn't a comment on whether to scale partnerships — it's an empirical observation that the team's coaching, prompt design, and channel-mix decisions should treat the two channels as different products.

## How to apply

Already encoded:
- B2 twin similarity scoring excludes cross-channel matches
- Patterns tab "Channel comparison" section surfaces the metric to leadership

Worth investigating in the LawrieCo Learnings v2 analytical pass (`coaching/prompts/lawrieco-learnings.md`):
- What specifically does LawrieCo do at Discovery / Strategy that direct sales doesn't?
- Can patterns transfer? Which can't?
- Inverse analysis: what's uniquely PRESENT in LawrieCo wins that's uniquely ABSENT in direct losses?

## What we don't yet know

- Selection bias: are LawrieCo customers fundamentally different (size, geography, sophistication)? Need to control for this.
- Whether the partnership channel scales — could be relationship-network bound rather than process-replicable.
- What the comparable "loss" rate looks like for LawrieCo (the n=31 LawrieCo losses we have is small).
- Whether other partner channels (if AgriProve adds them) would replicate LawrieCo's pattern, or if it's specific to LawrieCo's customer relationships.
