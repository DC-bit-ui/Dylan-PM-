# Learning: Dual-stack prioritisation — what Dylan needed and how it landed

**Date:** 2026-04-28
**Source:** PR #1 capability-ask comment, design-question session, PR #2 implementation
**Status:** Implementation complete, validation pending (30-day review)

---

## What Dylan asked for

"Make sure the system has context of all epics in flight and work the team is doing — but specifically focus on the deliverables that have my name on it as priority, then as a secondary mechanism suggest work tasks that I can complement or directly relate to some of my work or thinking based on the conversations, transcripts, teams channel responses."

## What that translated to in the system

A **dual stack** — two distinct ranked outputs in every prioritisation flow, not interleaved:

- **Stack A (Mine, cap 3):** what's mine, scored P0–P3
- **Stack B (Complement, cap 3 / compressed):** team work where Dylan's PM input changes the trajectory, leverage-scored

The implementation lands in `/focus`, `/standup`, the new `/complement` skill, Apex Morning + EOD + Command Center, and the integration contract with Cowork.

## The mental model — why two stacks beats one

A single ranked list always optimises for one dimension. If the dimension is "what's mine", complement opportunities are invisible. If the dimension is "highest leverage", Dylan loses sight of his own commitments. **Both lists matter; they answer different questions.**

- Stack A answers: "What am I accountable for today?"
- Stack B answers: "Where could my input change something I'm not formally on?"

Interleaving them — even with tags — would fail because Stack A always wins when the question is "what should I do next?". Two lists make the second question askable independently.

## Sources Dylan locked in (after design-question round)

For Stack A, beyond the obvious:
- Jira tickets where Dylan is tagged in a comment with action implied (not just assignee) ✓
- Teams DMs and channel @-mentions where Dylan is asked something ✓
- Confluence comments tagging Dylan ✓
- Outlook action-implied emails — not added (Dylan didn't include in the lock-in list); too noisy

For Stack B:
- Granola transcripts mentioning owned surfaces ✓
- Teams channel responses with open Qs / scoping ambiguity / cross-team disagreement ✓
- Jira tickets in active epics touching owned surfaces, Dylan not assignee ✓
- Granola 3rd-party commits naming Dylan without assigning ✓

## The adjacency anchor

The owned-surfaces list in `memory/business/strategy.md` is the load-bearing data for Stack B. **Get it wrong → Stack B miscalibrates.** Dylan corrected T1 Offsets ownership during design-question round (commit `781b6b0` in PR #1) — moved from Owns to Contributes. This is exactly why the list needs Tier 2 PR review when role changes happen.

Current state (canonical):
- **Owns (PM)** weight 1.0: Frontier (AP-1963, AP-2009), Stormboy alignment
- **Contributes (PM support)** weight 0.6: HORIZON Schedule 2 validation (AP-2116), KCT phase 1 (AP-1964), LawrieCo referrer view (AP-1965), T1 Offsets / Crediting Workflow (AP-2187)

## Suppression rule — "be ruthless with signal"

Dylan's exact words. The compression rule (Stack A overloaded → Stack B reduced to a one-line tease) embodies that. The default failure mode of "complement opportunities" features in productivity tools is noise — they end up presenting 5-10 maybe-relevant items every morning, train the user to ignore them, and become invisible. The compression rule guards against that:

- 3 P0s in Stack A → Stack B is one line ("3 opportunities available — ask if interested")
- <3 P0s → Stack B shows up to 3 in full

The signal is preserved; the noise is suppressed.

## What I'd watch for in the 30-day validation

1. **Stack A false-positive rate.** How often did Dylan say "this isn't mine"? If high, the Jira-comment-action-implied classifier is too aggressive — tighten.
2. **Stack B engagement rate.** How often did Dylan act on a complement item? If <20%, the leverage scoring is miscalibrated — tune weights.
3. **Suppression frequency.** How often did Stack B get compressed? If >50% of days, Dylan is consistently P0-overloaded — probably a workstack hygiene issue, not a stack-B issue.
4. **Source quality.** Which sources produced the most-engaged Stack B candidates? Probably Granola (richest signal). If Teams channels yield mostly noise, drop to a stricter filter (only specific channels).

## Implications

- **Cowork's Apex prompt** must be updated when Dylan onboards Cowork — the Project Instructions in `cowork/project-instructions.md` §10 carry the new dual-stack flow
- **The Complement tab** in Apex Command Center is new — needs implementation in the Cowork artifact
- **`/complement` is on-demand only** — when Dylan wants a fuller scan than the standup teaser allows
- **The owned-surface list is now load-bearing infrastructure** — every change goes through Tier 2 PR

## Related
- Decision: `memory/decisions/2026-04-28-dual-stack-prioritisation.md`
- T1 Offsets correction: `memory/learnings/2026-04/2026-04-28-t1-offsets-not-owned.md`
- Skills: `.claude/skills/focus/SKILL.md`, `.claude/skills/daily-standup/SKILL.md`, `.claude/skills/complement/SKILL.md`
