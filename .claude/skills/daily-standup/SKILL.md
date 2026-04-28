---
name: daily-standup
description: Generate today's standup entry. Pulls live from Notion (Today + Done views) and Jira (recently updated tickets where Dylan is assignee). Use first thing in the morning or when Dylan says "standup".
---

# Daily Standup Skill

## Source of truth
- **Notion** for what's on Dylan's plate today and what was completed (canonical)
- **Jira** for ticket-level updates where Dylan is assignee
- **Granola / Teams** optional — for context on overnight team activity

## Workflow

1. **Pull from Notion:**
   - Today view: `https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=b920ba6653a54dee973847b167cadfd7`
   - Done (recent): `https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=c3221ec7cf9a43d7b66f8d808ad16a00`

2. **Pull from Jira:** `project = AP AND assignee = '712020:177437ab-7799-4e10-8604-116a8def9eb1' AND updated >= -1d ORDER BY updated DESC`

3. **Optional — overnight context:**
   - Teams chat search since last standup time (helpful given the SAST↔AEST gap)
   - Granola scan for any meeting Dylan missed overnight

4. **Compose:**

```
## Standup — <YYYY-MM-DD>
[source: Notion live + Jira live | snapshot]

**Yesterday**
- ✅ <done item> (Notion / Jira ticket)
- 🟡 <in-progress item>
- ❌ <didn't get to> — <reason if useful>

**Today**
- <top 1-3 priorities — be ruthless>

**Blockers**
- <item> — waiting on <person> since <date>

**Heads up for the team**
- <one thing the team should know — overnight Teams signals, Granola decisions>
```

5. **Don't post to Teams from this skill.** Output the draft; Dylan posts.

## Failure mode
- Notion connector unavailable → fall back to `workspace/current/actions.md` and state staleness explicitly
- Jira connector unavailable → omit the Jira-derived sections; flag

## Heuristic
If "Today" has more than 3 items, you haven't prioritised. Cut.
