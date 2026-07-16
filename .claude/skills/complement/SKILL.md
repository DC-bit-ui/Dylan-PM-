---
name: complement
description: Surface complement opportunities — work the team is driving where Dylan's PM input adds leverage. Standalone version of /focus Stack B. Use when Dylan asks "where can I add value today?", "anything I'm missing?", or wants to scan for places to weigh in proactively.
---

# Complement Skill

The on-demand version of Stack B from `/focus` and `/standup`. Same logic, fuller treatment, no Stack A. Use when Dylan explicitly wants to see where his PM thinking could move something.

## Source of truth
- **Granola** for meeting transcripts (last 7 days)
- **Teams** for channel posts (last 7 days)
- **Jira** for active-epic ticket activity
- **Confluence** for doc-comment activity
- **`memory/business/strategy.md`** — owned-surfaces list (the adjacency anchor)
- **`memory/decisions/2026-04-28-dual-stack-prioritisation.md`** — the leverage scoring spec

## Workflow

### Step 1 — Read the owned-surfaces list

From `memory/business/strategy.md`:

| Tier | Surfaces | Weight |
|---|---|---|
| **Owns (PM)** | Frontier (AP-1963, AP-2009), Stormboy alignment | 1.0 |
| **Contributes (PM support)** | HORIZON Schedule 2 validation (AP-2116), KCT phase 1 (AP-1964), LawrieCo referrer view (AP-1965), T1 Offsets / Crediting Workflow (AP-2187) | 0.6 |

Build a keyword set from these surface names + their initiative file aliases (read `memory/initiatives/<file>.md` for known terms — "Frontier", "field UI", "property mgmt", "lead scraping", "Schedule 2 validation", etc.).

### Step 2 — Pull candidates from each source

| Source | Filter |
|---|---|
| **Granola** | last 7 days — transcripts mentioning surface keywords, where Dylan is NOT an attendee or NOT already actioned |
| **Teams (channels, not DMs)** | last 7 days — posts in product / eng / growth channels with open product Qs, scoping ambiguity, cross-functional alignment needs |
| **Jira (active epics)** | tickets in active AP-epics where work touches an owned surface, Dylan NOT assignee, recent activity (last 3 days) |
| **Granola (3rd-party commits)** | last 7 days — others' commitments mentioning Dylan but not assigning ("we should loop Dylan in", "Dylan's view on this") |
| **Confluence** | doc edits / comments on pages within owned-surface docs where Dylan hasn't engaged |

Deduplicate: if the same item shows up across multiple sources (e.g. a Granola decision later raised in a Teams thread), merge into one entry citing all sources.

### Step 3 — Score for leverage

Per `memory/decisions/2026-04-28-dual-stack-prioritisation.md`:

**Add to score:**
- +2 — open question with no answer for 24+ hours
- +2 — cross-team disagreement (Eng vs Growth, Eng vs Field)
- +1 — ambiguity on scope or success metric
- +1 — decision-needed flag in Granola

**Subtract:**
- −2 — routine status update / recap thread
- −2 — single-person thread (no real conversation)
- −1 — retrospective discussion (already-decided work)

**Final rank = surface-weight × leverage score.**

### Step 4 — Output

Default cap is **3**. If Dylan said "show me 5" or similar, expand to 5. If the leverage score for everything is below threshold (e.g. nothing above 0), say so — don't pad the list.

```
## Complement opportunities — <YYYY-MM-DD HH:MM SAST>

[source: Granola + Teams + Jira + Confluence — all live]

### High-leverage (rank order)

1. **<title>** — surface: <Frontier / Stormboy / etc.> · weight: <Owns/Contributes> · leverage: <score>
   why this matters: <one-line — open Q for 2 days / scope ambiguity / cross-team disagreement / decision needed>
   suggested action: <one-line — comment, DM, scope question, async write-up>
   source: <Granola meeting | Teams thread link | Jira AP-NNNN | Confluence page>
   why now: <urgency — meeting next week, decision pending, etc.>

2. …

3. …

### Lower-leverage (mentioned for completeness, may skip)

- <item> — <surface> · <reason it's lower>

### Nothing surfaced this round
[only when the high-leverage section is empty]
- Reason: <quiet week / sources unavailable / Dylan already engaged across all candidates>
- Suggested fallback: <run /focus on Stack A only / check back tomorrow>
```

### Step 5 — Read-only

This skill **does not act**. Output the candidates with suggested actions; Dylan decides whether to engage. If Dylan agrees on a specific complement, follow up with the relevant skill (`/meeting-prep` if it's a meeting, `/stakeholder-update` if drafting a comment, etc.).

## Failure modes

- **Granola / Teams / Jira / Confluence connector unavailable** → run with available sources; flag the gap. State explicitly which sources couldn't be queried.
- **Owned-surface list out of date** → output is miscalibrated. Check `memory/business/strategy.md`. If Dylan's role has shifted, propose a Tier 2 PR to update the list before re-running.
- **Empty result with active connectors** → genuinely quiet week, OR Dylan is already engaged across all candidates, OR keyword set is too narrow. Suggest expanding the keyword set as a Tier 2 update.

## Heuristic

The goal isn't volume — it's **finding the one thing where Dylan's input changes the trajectory**. If the top result has leverage score ≥3 on an Owns surface, that's the day's win. Below that, judgement call.

## When to NOT use this skill

- During synchronous focused work — checking complement opportunities mid-task is a distraction
- After Dylan has already engaged with the team for the day — risks duplicate effort
- When `/focus` Stack A is overloaded with P0s — `/focus` already compresses Stack B; running this would override that signal

## Validation
After 30 days, review with Dylan:
- Engagement rate — how often did Dylan act on a surfaced complement?
- False-positive rate — how often did he say "this isn't actually relevant"?
- Source coverage — which connectors yielded the most useful candidates?

Findings → learning entry; tune source filters and keyword sets accordingly.

---
**SUPERSEDED 2026-07-16:** the Stack B leverage-scoring mechanism this skill implements was retired with the simplified dual-stack (`memory/decisions/2026-07-16-os-rebuild.md`). The replacement is a one-line leverage watch inside /focus and briefings. Do not run this skill's scoring model; kept for history.
