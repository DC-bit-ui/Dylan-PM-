---
description: Run the memory-curator sweep — dedupe, link, index, supersede stale entries, promote patterns to standing rules. Default cadence Friday 16:00 SAST; volume + churn triggers can run it early.
---

# Sweep — Memory Curation

Dispatch the `memory-curator` subagent against `memory/` to keep it healthy and promote what the system has learned into standing rules.

## Cadence
Per `memory/decisions/2026-04-28-curation-cadence.md`:

- **Default schedule:** Friday 16:00 SAST (paired with `/retro-week`)
- **Volume trigger:** if >12 unprocessed learnings since last sweep → run early
- **Churn trigger:** if a learning supersedes another within 7 days → run that day for the affected file (don't wait for Friday)
- **Manual:** `/sweep` invocation any time

## What the sweep does

1. **Dedupe and link** — if two learnings cover the same fact, merge with forward link
2. **Update INDEXes** — every directory's `INDEX.md` reflects current contents
3. **Supersede stale entries** — never delete; mark old + forward-link to new
4. **Pattern promotion** — when a learning has appeared 3+ times (same correction, same preference, same rule), draft a Tier 2 PR promoting it to a standing rule in `memory/profile/`
5. **Decision review** — flag any standing decision in `memory/decisions/INDEX.md` that recent activity has contradicted; surface for supersede
6. **Source-quality check** — for the dual-stack and reconciliation flows, summarise which sources yielded engagement vs noise (feeds the monthly review)
7. **Cross-link gaps** — find learnings / decisions that should reference each other but don't; add the links

## Output

```
## Memory Sweep — <YYYY-MM-DD HH:MM SAST>
[run via: scheduled / volume trigger / churn trigger / manual]

### Counts
- Learnings since last sweep: <N>
- Decisions touched: <N>
- INDEX updates: <N>
- Files superseded: <N>

### Patterns ready to promote (Tier 2 PR proposed)
1. <pattern> — appears in <learning A>, <learning B>, <learning C> — propose: <where to land in profile/>
2. …

### Decisions flagged for review
- <decision> — contradicted by <recent learning / activity>
- <decision> — possibly stale, no recent activity referencing

### Cross-link gaps fixed
- <file> ↔ <file> — relationship: <…>

### Source-quality snapshot (for monthly review)
- Stack A false positives this week: <count>
- Stack B engagement: <Dylan acted on N of M surfaced opportunities>
- Reconciliation accuracy: <ambiguous flags / correct done-acks / etc.>

### Nothing to do this round
[when applicable]
- Reason: <quiet week / no new learnings / patterns not yet at 3+ occurrences>
```

## Where the sweep writes

- **Tier 1 (direct):** INDEX updates, dedupe merges, supersede markers, cross-links
- **Tier 2 (PR):** profile promotions (changes `memory/profile/working-style.md` etc.), `memory/decisions/` superseding entries
- **Off-limits:** `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `memory/profile/identity.md`, `memory/profile/communication.md` — surface as recommendations only

## Heuristics

- **Promotion bar:** 3+ confirming occurrences across separate learnings, or one explicit Dylan statement of preference. Not 2 occurrences "feels right" — that's pattern-matching on noise
- **Supersede, never delete** — even patterns that turned out to be wrong stay in the log with a forward link to the correction
- **A quiet sweep is a healthy week** — if there's nothing to promote, nothing to supersede, nothing to merge, that's signal that the system is keeping pace day-to-day. Don't pad the report

## Failure modes

- **Memory-curator subagent unavailable** → produce a manual checklist for Dylan to triage; don't fabricate auto-actions
- **Conflicting promotions** (two learnings point opposite directions on the same rule) → flag for Dylan's eye; never auto-resolve; produce a churn-flag for the next sweep
- **Source-quality data incomplete** (a connector was offline part of the week) → mark "best-effort, reduced coverage" in the source-quality block

## Validation
After the first month of weekly sweeps, review with Dylan:
- How many promotions happened? Were any rolled back?
- How often did triggers fire?
- Was Friday 16:00 SAST the right slot, or shift earlier/later?
