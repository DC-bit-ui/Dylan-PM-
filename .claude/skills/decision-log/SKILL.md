---
name: decision-log
description: Capture a decision in ADR-style — context, decision, consequences, alternatives. Use whenever Dylan makes (or hears) a meaningful decision. The log is permanent — supersede, never delete.
---

# Decision Log Skill

## When to log

Log a decision when:
- It commits resources (time, money, headcount)
- It locks in a direction that's costly to reverse
- It rejects an alternative that someone might raise again
- It changes how a team operates

If in doubt, log.

## Format

Save as `memory/decisions/YYYY-MM-DD-<slug>.md`:

```
# <Decision title>

**Date:** <YYYY-MM-DD>
**Status:** proposed | accepted | superseded
**Owner:** <name>
**Stakeholders:** <names>

## Context
<the situation that forced the decision — 3-5 lines>

## Decision
<what we are doing, in plain language>

## Alternatives considered
- <option> — rejected because <…>
- <option> — rejected because <…>

## Consequences
**Positive:**
- <…>
**Negative / costs:**
- <…>
**What we accept and won't revisit:**
- <…>

## Revisit triggers
<what would cause us to reopen this? a metric, a date, an event>

## Links
- Related decisions: <…>
- Related initiatives: <…>
```

## Workflow

1. Capture the facts from Dylan's input.
2. If the decision contradicts a prior one, **link both** and update the prior with `**Superseded by:** <new path>`.
3. Update `memory/decisions/INDEX.md` with the new entry.
4. If the decision affects an initiative, append to its `Recent changes`.
