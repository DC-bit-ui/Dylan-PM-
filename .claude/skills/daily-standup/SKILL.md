---
name: daily-standup
description: Generate today's standup entry as a dual stack — Yesterday + Today (Mine, cap 3) + an optional "Watching for opportunity" line (Complement, compressed). Pulls Notion + Jira + Granola + Teams + Outlook + Confluence. Reconciliation runs first. Use first thing in the morning or when Dylan says "standup".
---

# Daily Standup Skill

## Source of truth
- **Notion** — what's on Dylan's plate, what was completed (canonical)
- **Jira** — ticket-level updates where Dylan is assignee or tagged
- **Granola / Teams / Outlook / Confluence** — overnight team activity, action-implied signals
- **`memory/decisions/2026-04-28-dual-stack-prioritisation.md`** — the dual-stack rule this skill applies

## Workflow

### Step 1 — Reconcile

Run `/reconcile` first. The "✅ recommend mark done" items go in **Yesterday**, not **Today**.

### Step 2 — Compose Yesterday

From the reconciled state + Notion Done view + Jira tickets transitioned in last 24h:

- ✅ Done items (with system + timestamp, per reconciliation evidence)
- 🟡 In-progress (carrying into today)
- ❌ Didn't get to (with reason, if useful)

### Step 3 — Build Today (Stack A — Mine, cap 3)

Same source set as `/focus` Stack A:

| Source | Query |
|---|---|
| **Notion** | Today view + Overdue (assigned to Dylan) |
| **Jira (assignee)** | `assignee = Dylan AND updated >= -7d` |
| **Jira (action-implied comments)** | recent @-mentions of Dylan with action verbs |
| **Granola (first-person)** | last 7 days, Dylan-spoken commitments |
| **Teams DMs / @mentions** | last 7 days, asks directed at Dylan |
| **Confluence** | tagging Dylan in comments |

Score P0–P3 with due-date weighting. Cap 3.

### Step 4 — Build Watching (Stack B — Complement, compressed)

Pull complement candidates per `/focus` Stack B logic:

- Granola transcripts mentioning owned surfaces (Frontier, Stormboy, HORIZON Sch 2, KCT, LawrieCo, T1 Offsets) where Dylan isn't on the action
- Teams channel posts with open product Qs / scoping ambiguity / cross-team disagreement
- Jira tickets in active epics where Dylan isn't assignee but work touches an owned surface
- Granola 3rd-party commitments naming Dylan without assigning

Apply leverage scoring (per `memory/decisions/2026-04-28-dual-stack-prioritisation.md`):
- +2 open Q 24+ hr, +2 cross-team disagreement, +1 scope/metric ambiguity, +1 decision-needed flag
- −2 routine status, −2 single-person thread, −1 retrospective discussion

Surface-weight: Owns 1.0, Contributes 0.6.

**Standup compresses Stack B by default** — standups are short. Never list >1 item; surface as a teaser.

### Step 5 — Apply suppression rule

- **Stack A has 3 P0s** → omit "Watching" line entirely (signal too noisy)
- **Stack A has <3 P0s + at least one Stack B candidate** → include compressed teaser
- **No Stack B candidates** → omit the line

### Step 6 — Compose

```
## Standup — <YYYY-MM-DD>
[source: Notion + Jira + Granola + Teams + Outlook + Confluence — all live | snapshot]

**Yesterday**
- ✅ <done item> — <system: evidence + timestamp>
- 🟡 <in-progress>
- ❌ <didn't get to> — <reason if useful>

**Today (Mine, top 3)**
1. <item> — <P0/P1, due, source>
2. …
3. …

**Watching for opportunity** [compressed; omit if Stack A is P0-overloaded]
- <surface area>: <one-line reason — "open Q on X for 2 days", "scoping ambiguity in Y">
  ask if you'd like context

**Blockers**
- <item> — waiting on <person> since <date>

**Heads up for the team**
- <one thing the team should know — overnight Teams signals, Granola decisions>
```

### Step 7 — Read-only

**Don't post to Teams from this skill.** Output the draft; Dylan posts.

## Failure modes

- **Notion connector unavailable** → fall back to `workspace/current/actions.md`; state staleness
- **Jira connector unavailable** → omit Jira-derived sections; flag
- **Granola / Teams / Confluence connector unavailable** → omit Stack B sources; mark "Watching: best-effort, reduced coverage"
- **Owned-surface list out of date** → Stack B teaser may be miscalibrated; check `memory/business/strategy.md`

## Heuristics

- **Today:** if >3 items, you haven't prioritised. Cut.
- **Watching:** never more than one teaser. Standups are short; the goal is signal, not list.
- **Yesterday:** done items must cite the system (Outlook/Teams/Jira/Granola) + timestamp — the reconciliation flow gives this evidence; use it.

## Heuristic for Dylan
A good standup is "yesterday I did X, today I'm doing Y, watching Z develop, blocked on W". Four lines. If it's more, it's a status report, not a standup.
