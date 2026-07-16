# Decision: Dual-stack prioritisation — Mine (priority) + Complement (secondary)

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Related:** [`2026-04-28-reconciliation-flow.md`](2026-04-28-reconciliation-flow.md), [`2026-04-28-cowork-bidirectional-contract.md`](2026-04-28-cowork-bidirectional-contract.md)
**Origin:** PR #1 capability-ask comment

---

## Context

The `/focus` and `/standup` skills (and Apex's Morning Briefing / EOD Reconciliation) produce a single ranked list of Dylan's work. That misses two distinct kinds of attention Dylan needs to allocate:

1. **What's mine** — deliverables he owns, where output is on him
2. **Where can my PM thinking add leverage** — work the team is driving where Dylan's perspective changes the outcome

Without separating these, the system either (a) drowns Stack 2 in Stack 1 noise, or (b) ignores Stack 2 entirely. Dylan's leverage as a PM comes from both — but only the first is visible in current outputs.

## Decision

Produce a **dual stack** in every prioritisation output. Two distinct ranked lists, each capped, with a suppression rule for overload days.

### Stack A — Mine (priority). Cap 3.

Deliverables with Dylan's name on them. Sources:

- Notion tasks where Dylan is assignee
- Jira tickets where Dylan is assignee, **plus tickets where Dylan is tagged in a comment with an action implied**
- Granola commitments Dylan made personally ("I'll send…", "let me follow up…")
- **Teams DMs and channel mentions where Dylan is asked something**
- **Confluence comments tagging Dylan**

Scored P0–P3 with due-date weighting per the existing `/focus` heuristic. Reconciliation runs first (per `2026-04-28-reconciliation-flow.md`) — phantom-done items don't appear.

### Stack B — Complement (secondary). Cap 3.

Work the team is driving where Dylan's PM input adds leverage. Sources:

- Granola transcripts mentioning Dylan's owned surfaces where Dylan is not already on the action
- Teams channel responses with open product questions, scoping ambiguity, or cross-functional alignment needs
- Jira tickets in active epics where Dylan is not the assignee but the work touches an owned surface
- Granola commitments by others that name Dylan without assigning

### Owned surfaces (the adjacency anchor)

From `memory/business/strategy.md` — corrected via commit `781b6b0`:

| Tier | Surfaces | Weight |
|---|---|---|
| **Owns (PM)** | Frontier (AP-1963, AP-2009), Stormboy alignment | 1.0 |
| **Contributes (PM support)** | HORIZON Schedule 2 validation (AP-2116), KCT phase 1 (AP-1964), LawrieCo referrer view (AP-1965), T1 Offsets / Crediting Workflow Template (AP-2187) | 0.6 |

Adjacency check uses **both** lists; Owns weights higher than Contributes in leverage scoring.

### Leverage scoring — ranks Stack B

Weight high (each adds to the leverage score):
- Open question with no answer for 24+ hours
- Cross-team disagreement (Eng vs Growth, Eng vs Field)
- Ambiguity on scope or success metric
- Decision-needed flag in Granola transcripts

Weight low (penalised, may bump out of Stack B):
- Routine status updates
- Single-person threads (no real conversation)
- Retrospective discussion (already-decided work)

Final rank = surface-weight × leverage score.

### Suppression rule

When Stack A is overloaded (3 P0s already in Top 3), **compress Stack B to a one-line tease**:

> "1 complement opportunity available — ask if interested."

Preserves signal without competing for attention. Be ruthless with signal; the cost of a missed complement is less than the cost of a fragmented attention day.

### When to expand

If Dylan asks ("show me 5", "anything else?"), expand the cap. Default is 3.

## Consequences

**Positive**
- Dylan sees both his accountability stack and his leverage opportunities in one view
- Surfaces team work that matches Dylan's owned surfaces but isn't formally his — closes a known signal-loss path
- Forces explicit prioritisation of "where to chime in" rather than letting it happen by chance / Slack scrolling
- Suppression rule means Stack B doesn't add noise on heavy days

**Negative / risk**
- More queries per `/focus` invocation (Granola scan, Teams scan, Jira filter, Confluence mentions). Bound to last 7 days.
- "Owned surface" classification is brittle — when Dylan's role changes, the adjacency anchor needs updating. Mitigation: Tier 2 PR to `strategy.md` whenever owns/contributes shifts.
- Leverage scoring is heuristic, not data-driven. False positives in Stack B (low-leverage items) will happen early; refine over 30 days based on Dylan's "skip" feedback.
- "Action implied in a Jira comment" / "asked something on Teams" requires NLP-style classification. Apex / Cowork can do this but accuracy varies. Mitigation: when ambiguous, default to including in Stack A (false positive = harmless reminder; false negative = missed accountability).

## Alternatives considered

1. **Single ranked list with a "complement" tag.** Rejected — interleaving means Stack B always loses to Stack A. The whole point is to make complement visible without competing for the top slot.
2. **Stack B always shown in full, never compressed.** Rejected — Dylan said "be ruthless with signal". On a 3-P0 day, Stack B is a distraction.
3. **Cap 5 on Stack B.** Rejected — Dylan said 3.
4. **No Stack B; just Stack A.** Rejected — the whole reason for this decision.

## Implementation scope (PR #2)

- `.claude/skills/focus/SKILL.md` — split output into Top 3 (mine) + Complement (3 / compressed)
- `.claude/skills/daily-standup/SKILL.md` — same split
- `.claude/skills/complement/SKILL.md` — new skill for on-demand "where can I add value today?"
- `cowork/project-instructions.md` §10 — extend Apex Morning + EOD prompts to produce both stacks
- `memory/integrations/cowork.md` — reflect dual-stack expectation in design decisions

## Validation

- After 30 days of use, review:
  - Stack A: false-positive rate (how often did Dylan say "this isn't mine")
  - Stack B: useful-rate (how often did Dylan engage with a complement item)
  - Suppression: did the one-line tease ever surface a real opportunity Dylan would have missed
- Tune weights and source filters based on the review
- Capture findings in a learning entry; if structural changes needed, supersede this decision

---

**SUPERSEDED 2026-07-16** → by [`2026-07-16-os-rebuild.md`](2026-07-16-os-rebuild.md) §Workstack model. The full Stack A/B mechanism (leverage scoring, suppression rules) was never validated in its 30-day review and production had drifted to a flat 4-bucket model. Replacement: **simplified dual-stack** — Stack A (Mine, cap 3) + one-line leverage watch. Spec: `core/PRINCIPLES.md` §2.
