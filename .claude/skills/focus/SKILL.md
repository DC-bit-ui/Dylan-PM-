---
name: focus
description: Surface today's top 3 priorities. Queries Notion ("Work Priorities" DB) as the canonical source; reconciles with Jira active epics and recent Granola/Teams signals. Use first thing in the morning, after a context-switch, or when Dylan feels scattered.
---

# Focus Skill

## Source of truth
**Notion is canonical** for Dylan's tasks (see `memory/integrations/notion.md`). Apex maintains it via the morning briefing and EOD reconciliation. This skill consults Notion via MCP, then reasons about prioritisation.

## Workflow

1. **Pull live state from Notion** via `mcp__47501ce1-32b1-4956-a3cf-3a370bc547c9__notion-query-database-view`:
   - **Today view** — `https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=b920ba6653a54dee973847b167cadfd7`
   - **Overdue view** — `https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=57a05dc240464ae394be512a932db9a9`
   - **Backlog (ranked)** — `https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=27ba53cd27444506910b03f29392577c`

2. **Cross-reference Jira** for any AP-tickets where Dylan is assignee and recently updated (`project = AP AND assignee = '712020:177437ab-7799-4e10-8604-116a8def9eb1' AND updated >= -1d`). Items in Jira but not yet in Notion are gaps Apex should have caught — flag them.

3. **Score each open Notion item** using Dylan's P0–P3 framework (see `memory/profile/decision-frameworks.md`):
   - P0 priority + due today/overdue → top of stack
   - P1 with Today Rank set → next
   - Watch for escalation rule violations (Granola commitment >3 days old without active Notion task → bump priority and flag)

4. **Pick top 3.** Be ruthless. Anything below #3 is "later".

5. **Output:**

```
## Focus — <YYYY-MM-DD>

[source: Notion live | snapshot]

### Top 3
1. <task title> (P0/P1, Focus area, due) — why: <…> — done looks like: <…> — Notion: <url> — Jira: <key if linked>
2. …
3. …

### Defer (acknowledged but not today)
- <item> — <reason>

### What I'd cut entirely
- <item> — <reason>

### Slipping items (escalation rule fired)
- <item> — <days old> — recommended bump: P<x> → P<x-1>

### Gaps (in Jira, not in Notion)
- <ticket> — <reason it should probably be in Notion>
```

6. **Don't write back to Notion** from this skill. Recommendations only. If Dylan agrees, separately update Notion (or wait for Apex EOD).

## Failure mode
- Notion connector unavailable → state explicitly: "Notion connector not available; falling back to last-known state in `workspace/current/actions.md` (last-updated: <date>)." If `actions.md` is also empty, ask Dylan what he's working on rather than fabricate.

## Heuristic
If Dylan finishes the day having done all 3, that's a good day. More than 3 = thrash.
