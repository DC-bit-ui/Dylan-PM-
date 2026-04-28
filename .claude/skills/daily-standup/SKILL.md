---
name: daily-standup
description: Generate today's standup entry. Pulls yesterday's actions from workspace/current/actions.md, today's commitments, and blockers. Use first thing in the morning or when Dylan says "standup".
---

# Daily Standup Skill

## Workflow

1. **Read** `workspace/current/actions.md` — yesterday's commitments.
2. **Diff against** `memory/initiatives/INDEX.md` — anything moved?
3. **Check blockers** — any action that's been pending >2 days is a blocker, surface it.
4. **Produce:**

```
## Standup — <YYYY-MM-DD>

**Yesterday**
- ✅ <done item>
- 🟡 <in-progress item>
- ❌ <didn't get to>

**Today**
- <top 1-3 priorities — be ruthless>

**Blockers**
- <item> — waiting on <person> since <date>

**Heads up**
- <one thing the team should know>
```

5. **Save to** `workspace/current/standup-YYYY-MM-DD.md` and update `workspace/current/actions.md` with today's commitments.

## Heuristic

If "Today" has more than 3 items, you haven't prioritised. Cut.
