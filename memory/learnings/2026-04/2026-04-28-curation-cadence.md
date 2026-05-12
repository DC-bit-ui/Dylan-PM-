# Learning: Curation cadence — weekly default, layered by concern, triggered when activity spikes

**Date:** 2026-04-28
**Source:** Dylan in session — initially proposed "weekly or twice-weekly", agreed to weekly with layered cadence after discussion

---

## What Dylan said

"I think a good customisation cadence of preferences etc. based on the system's learning about me is weekly? What do you think or should a twice a week cadence for higher fidelity outputs be implemented. I think monthly is too infrequent given the pace at which things move and my high usage."

## What we converged on

**Weekly default (Friday 16:00 SAST), layered by concern, with triggers.**

| Concern | Cadence | Why |
|---|---|---|
| Operational (reconciliation, retros) | Daily | Already running via Apex EOD |
| Behavioural (pattern promotion, learning curation) | Weekly Friday 16:00 SAST | Volume needed to spot patterns; pairs with weekly retro |
| Strategic (alignment, owned-surfaces) | Monthly first Monday | Strategy moves slower; 30-day validation reviews land here |
| Architectural (CLAUDE.md, COWORK.md, agents/skills) | Quarterly manual | Architecture is slow-moving by design |

Plus triggers: >12 unprocessed learnings → run sweep early; supersede-within-7-days → immediate profile review.

## The reframe that mattered

Dylan asked the question as "weekly vs twice-weekly". The reframe: **cadence isn't the bottleneck for fidelity; promotion is.** New learnings are visible to all skills the moment they land — `/recall`, `/focus`, `/standup` read them straight away. What cadence gates is whether those learnings get **promoted to standing rules** in `memory/profile/`.

Promotion needs **volume** to spot patterns ("3+ occurrences = standing rule"). Twice-weekly often won't have the third occurrence yet. Weekly has enough volume; daily has too little; monthly loses the pattern before catching it.

## Why Friday 16:00 SAST specifically

Dylan finishes his week before AEST does. 16:00 SAST = 18:00 AEST — after the team's full Thursday/Friday is captured in Granola transcripts, Teams threads, Jira activity. Earlier in the day misses that.

## Why layered, not single-cadence

Trying to do all curation on one rhythm is the failure mode of most "weekly review" systems. Different concerns move at different speeds:
- Operational state changes hourly — daily curation makes sense
- Behavioural patterns emerge over a week — weekly catches them
- Strategy shifts over months — monthly review is the right granularity
- Architecture should change reluctantly — quarterly review forces deliberation

Single cadence either over-curates the slow concerns (noise) or under-curates the fast ones (drift).

## Why triggers (not just schedule)

Today (2026-04-28) was the bootstrap day. 8+ learnings landed in one session. Pure weekly cadence would let those sit until Friday. The volume trigger (>12 unprocessed learnings) catches that. The churn trigger (learning supersedes another within 7 days) catches contradictions early — like the GitHub-MCP-vs-folder correction earlier today.

## Implications

- **`/sweep` skill updated** with the cadence + triggers in `.claude/commands/sweep.md`
- **Apex gets two new scheduled tasks** in Cowork:
  - Apex Weekly Sweep — Friday 16:00 SAST
  - Apex Monthly Review — first Monday 16:00 SAST
- **`memory/profile/working-style.md`** has the rhythm table updated
- **30-day validation reviews** (reconciliation, dual-stack, this cadence itself) all land in the monthly slot — no separate review schedule
- **Quarterly review is manual** — Apex prepares a pre-read; Dylan + Claude Code make architectural calls

## What I'd watch

- How often do triggers fire vs schedule? If triggers fire most weeks, the steady-state learning rate is higher than 12/week and we should adjust the threshold or move to twice-weekly.
- Are promotions actually happening? If 4 weekly sweeps land with zero promotions, the threshold is wrong (probably "3+" is too high — try 2 confirmed).
- Is anyone reading the source-quality output? If yes, it's earning its slot. If no, drop it.

## Related
- Decision: `memory/decisions/2026-04-28-curation-cadence.md`
- Skill: `.claude/commands/sweep.md`
- Cowork instructions: `cowork/project-instructions.md` §10
- Reflected in: `memory/profile/working-style.md`
