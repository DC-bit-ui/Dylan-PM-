# Decision: Layered curation cadence — daily / weekly / monthly / quarterly

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Related:** [`2026-04-28-cowork-bidirectional-contract.md`](2026-04-28-cowork-bidirectional-contract.md), [`2026-04-28-dual-stack-prioritisation.md`](2026-04-28-dual-stack-prioritisation.md), [`2026-04-28-reconciliation-flow.md`](2026-04-28-reconciliation-flow.md)

---

## Context

Dylan asked: how often should the system refresh its understanding of his preferences and behavioural rules? Monthly was rejected (too slow given his pace and high usage). The choice was between weekly and twice-weekly.

The deeper question: what does "customisation cadence" actually do, and is one cadence right for everything?

## The framing

**New learnings are visible immediately** — they land in `memory/learnings/` and any skill (`/recall`, `/focus`, `/standup`) reads them straight away. Cadence does NOT gate visibility.

**Cadence gates promotion** — taking accumulated learnings and turning them into standing rules in `memory/profile/`, or superseding stale decisions, or refreshing standing facts. Promotion requires **enough volume to spot patterns** ("Dylan corrected this 3 times → promote to standing rule"). Sweeping too often = no patterns yet to spot.

Different concerns also move at different speeds — operational state moves daily, behavioural patterns weekly, strategy monthly, system architecture quarterly. **One cadence for all of it would be wrong.**

## Decision

Layered cadence — different concerns on different rhythms, with triggers that override the schedule when activity spikes.

### Daily — Apex EOD (already running)
- Reconciliation
- Initiative state refresh (from Jira)
- Session retro entry → `memory/retros/session/`
- Tomorrow's dual stack

### Weekly — Friday 16:00 SAST
- **Memory sweep** (`memory-curator` agent via `/sweep`) — dedupe, link, supersede stale entries, update INDEXes
- **Weekly retro** (`/retro-week`) — what worked, what didn't, what to remember
- **Promotion review** — learnings that have appeared 3+ times → promote to standing rule in `memory/profile/`
- **Decision review** — flag any standing decision contradicted by recent activity for supersede
- **Source quality check** — for the dual-stack and reconciliation flows: which sources yielded engagement, which were noise?

**Why Friday SAST:** Dylan finishes his week before AEST does. 16:00 SAST = 18:00 AEST, after the team's working day, so Granola transcripts, Teams threads, and Jira activity from the team's Thursday/Friday are captured.

### Monthly — first Monday of the month
- **Strategic alignment** — does the workstack ladder to current strategy?
- **Owned-surfaces review** — has Dylan's role shifted? Update `memory/business/strategy.md` if so
- **Dual-stack source-quality review** — false-positive rate on Stack A, engagement rate on Stack B (per dual-stack decision file)
- **Reconciliation flow review** — phantom-done categorisation hit rate, ambiguous-flag rate
- **30-day validation reviews** for any new mechanism land in this slot — don't separate

### Quarterly — first week of quarter
- **System architecture review** — `CLAUDE.md`, `COWORK.md`, hard rules, agent + skill inventory
- **Integration contracts** — `memory/integrations/*.md` against actual usage; correct any drift
- **Retire / split** skills that have no traffic or are doing too much

## Triggers (override the weekly schedule)

Cadence alone fails on busy weeks. Two triggers run sweep early:

1. **Volume trigger:** if >12 unprocessed learnings accumulate before Friday → run sweep early (next available evening)
2. **Churn trigger:** if a learning supersedes another within 7 days → flag for immediate profile review (signals contradiction worth resolving fast, not on Friday)

Today (2026-04-28) is an example of when the volume trigger would have fired — 8+ learnings in one day during bootstrap. Steady-state should rarely trigger.

## Who runs what

| Cadence | Runner |
|---|---|
| Daily | Apex EOD (already scheduled in Cowork) |
| Weekly Friday 16:00 SAST | **Apex Weekly Sweep** — new scheduled task, added to `cowork/project-instructions.md` §10 |
| Monthly | Apex Monthly Review — new scheduled task, first Monday |
| Quarterly | Manual — Dylan + Claude Code session at start of quarter |

Triggers are evaluated by Apex Morning Briefing each weekday — if a trigger fires, prepend a "Sweep recommended today" note to the briefing output and queue the sweep for that evening.

## Consequences

**Positive**
- Learnings get promoted to standing rules at the right velocity (weekly catches patterns; daily would miss them; monthly would lose them)
- Strategic concerns aren't sucked into operational sweeps — separation of concerns
- Triggers handle activity spikes without requiring twice-weekly scheduled runs
- Friday SAST timing captures the AEST team's full week, not just Dylan's

**Negative / risk**
- More moving parts (4 cadences + 2 triggers) — risk of one cadence being skipped or running stale. Mitigation: each cadence's output writes a retro entry; if an entry is missing for a week / month / quarter, that's the alarm
- Trigger logic ("3+ occurrences = promote") is heuristic — false promotions possible. Mitigation: promotion is itself a Tier 2 PR (touches `memory/profile/`), so Dylan reviews
- Apex needs new scheduled tasks added — non-trivial setup. Mitigation: documented in `cowork/project-instructions.md` §10

## Alternatives considered

1. **Weekly only, no layering** — rejected; conflates operational, behavioural, and strategic concerns
2. **Twice-weekly sweep** — rejected; too sparse for pattern detection (often no third occurrence yet); twice-weekly retro is also misaligned with normal weekly rhythm
3. **Monthly only** — rejected by Dylan up-front (too infrequent at his pace)
4. **Daily sweep** — rejected; per-day curation is overkill; most days won't generate enough new learnings to spot patterns; would create noise

## Validation

- **First Friday after merge** — run the weekly sweep manually as a probe. Confirm output quality (is the volume right? Do patterns surface?)
- **30-day review** (lands in monthly slot): how often did triggers fire? How many learnings were promoted? Were any rolled back?
- Tune `>12` volume threshold based on observed steady-state learning rate
