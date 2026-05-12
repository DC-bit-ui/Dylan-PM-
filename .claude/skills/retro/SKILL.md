---
name: retro
description: Run a retrospective — daily, weekly, initiative, or incident. Delegates to the retrospector subagent. Use end-of-day, end-of-week, after launches, or after notable failures.
---

# Retro Skill

This skill is a thin wrapper that dispatches to the `retrospector` subagent.

## Workflow

1. **Confirm scope** with Dylan: session / day / week / initiative / incident.
2. **Dispatch** `retrospector` with the scope and the input window (e.g. "this session", "last 5 days", "the X launch").
3. **After the retro is filed**, ask Dylan if any of the durable learnings should be promoted from `memory/learnings/` to `memory/profile/` or `memory/business/` as standing rules.

## Cadence Dylan should keep

- **Daily** — 5 min, end of day. Worth it.
- **Weekly** — Friday afternoon or Monday morning, 15 min.
- **Initiative** — at every milestone and at close.
- **Incident** — within 48 hours of anything that surprised the org.
