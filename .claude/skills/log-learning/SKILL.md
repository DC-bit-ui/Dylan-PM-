---
name: log-learning
description: Capture a single learning into memory/learnings/. Use whenever Dylan teaches something, corrects you, reveals a preference, or reflects on what just happened. The fastest way to make this system smarter.
---

# Log Learning Skill

## Workflow

1. **Restate** the learning in one sentence — fact, preference, mechanism, or principle.
2. **Classify** the type:
   - `preference` → `memory/profile/<right-file>.md`
   - `business-fact` → `memory/business/<right-file>.md`
   - `person-fact` → `memory/people/roster.md`
   - `process / mechanism / general` → `memory/learnings/YYYY-MM/YYYY-MM-DD-<slug>.md`
3. **Write the entry**:

```
# <Title — what's the learning?>

**Date:** <YYYY-MM-DD>
**Type:** <preference / business-fact / person-fact / mechanism / principle>
**Trigger:** <what happened that produced this>

## The learning
<one or two paragraphs>

## What changes because of this
<concrete: a process change, a default, a checklist item, a rule>

## Related
- <links to memory/ files this touches or supersedes>
```

4. **Update indexes** — `memory/learnings/INDEX.md` if filed there; the relevant section if filed in `profile/` or `business/`.
5. **Cross-link** — if it supersedes an older note, update both.
6. **Promote when warranted** — if a learning has been confirmed multiple times, propose folding it into `memory/profile/` or `CLAUDE.md` as a standing rule.

## Examples of good log entries

- "Dylan prefers short Slack messages over long emails for time-sensitive things" → `memory/profile/communication.md`
- "Our north-star metric is weekly active accounts, not MAU" → `memory/business/metrics.md`
- "Sarah (CFO) wants numbers before narrative; show the chart first" → `memory/people/roster.md`
- "When sizing opportunities, always include a 'no-action' counterfactual" → `memory/learnings/...`

---
**UPDATE 2026-07-16 (routing change):** behavioural rules/preferences now land in `memory/state/rules.md` (entry format at top of that file) — NOT as loose learnings awaiting promotion. Events/meeting syntheses still go to `memory/learnings/<YYYY-MM>/`. Routing table: `core/PROTOCOLS.md` §Writes.
