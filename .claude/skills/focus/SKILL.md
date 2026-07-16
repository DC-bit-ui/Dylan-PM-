---
name: focus
description: Surface today's dual stack — Stack A (Mine, cap 3) + Stack B (Complement, cap 3 / compressed when Stack A is overloaded). Queries Notion + Jira + Granola + Teams + Outlook + Confluence. Reconciliation runs first. Use first thing in the morning, after a context-switch, or when Dylan feels scattered.
---

# Focus Skill

## Source of truth
**Notion is canonical** for Dylan's tasks (`memory/integrations/notion.md`). Apex maintains it via Morning Briefing and EOD Reconciliation. This skill consults Notion + Jira + Granola + Teams + Outlook + Confluence via MCP, reconciles, then produces a dual stack per `memory/decisions/2026-04-28-dual-stack-prioritisation.md`.

## Workflow

### Step 1 — Reconcile first

Run `/reconcile` (`.claude/skills/reconcile/SKILL.md`). Eliminate phantom-open tasks against connector signals before ranking. Items the reconciliation marks ✅ done don't appear in Stack A.

### Step 2 — Build Stack A (Mine)

Pull from these sources, deduplicate, score P0–P3 with due-date weighting:

| Source | Query |
|---|---|
| **Notion** | `mcp__notion__query-database-view` — Today view, Overdue view, Backlog (ranked) — items where Dylan is assignee |
| **Jira (assignee)** | `project = AP AND assignee = '712020:177437ab-7799-4e10-8604-116a8def9eb1' AND updated >= -7d` |
| **Jira (action-implied comments)** | recent Jira comments mentioning Dylan with action verbs ("@Dylan can you…", "Dylan to…", "needs Dylan's…") on tickets where he's not assignee — these still belong in Mine if action is implied |
| **Granola (first-person commitments)** | last 7 days, Dylan-spoken commitments: "I'll send…", "let me follow up…", "I'll book…" |
| **Teams DMs / @mentions** | last 7 days, messages directed at Dylan asking something or requiring action |
| **Confluence comments** | tagging Dylan (`@Dylan Cronje`) on any page, last 7 days |

**Scoring (per `memory/profile/decision-frameworks.md`):**
- P0 + due today/overdue → top
- P1 with Today Rank → next
- Granola commitment >3 days old without action → escalate (bump priority, flag in output)

**Cap: 3.** Anything below is `Defer`.

### Step 3 — Build Stack B (Complement)

The adjacency anchor is the owned-surfaces list in `memory/business/strategy.md`:

- **Owns (PM)** weight 1.0: Frontier (AP-1963, AP-2009), Stormboy alignment
- **Contributes (PM support)** weight 0.6: HORIZON Schedule 2 validation (AP-2116), KCT phase 1 (AP-1964), LawrieCo referrer view (AP-1965), T1 Offsets / Crediting Workflow (AP-2187)

Pull complement candidates:

| Source | Filter |
|---|---|
| **Granola** | last 7 days — transcripts mentioning an owned-surface keyword, where Dylan is NOT an attendee or NOT already actioned |
| **Teams (channels)** | last 7 days — channel posts with open product questions, scoping ambiguity, or cross-functional alignment needs (Eng vs Growth, Eng vs Field) |
| **Jira (active epics)** | tickets in active AP-epics where work touches an owned surface, Dylan NOT assignee, recent activity (last 3 days) |
| **Granola (3rd-party commitments naming Dylan)** | last 7 days — commitments by others that mention Dylan but don't assign ("we should loop Dylan in on…", "Dylan's view on this…") |

**Leverage scoring:**

Add to score:
- +2 — open question with no answer for 24+ hours
- +2 — cross-team disagreement (Eng vs Growth, Eng vs Field)
- +1 — ambiguity on scope or success metric
- +1 — decision-needed flag in Granola

Subtract:
- −2 — routine status update / recap thread
- −2 — single-person thread (no real conversation)
- −1 — retrospective discussion (already-decided work)

**Final rank = surface-weight × leverage score.** Cap: 3.

### Step 4 — Apply suppression rule

Check Stack A composition:

- **3 P0s in Top 3** → Stack A is overloaded → **compress Stack B to a one-line tease**:
  > "1 complement opportunity available — ask if interested." (or "N opportunities available")
- **Otherwise** → show Stack B in full (up to 3).

The compressed form preserves signal without competing for attention. Be ruthless with signal.

### Step 5 — Output

```
## Focus — <YYYY-MM-DD>

[source: Notion + Jira + Granola + Teams + Outlook + Confluence — all live | snapshot]

### Stack A — Mine (Top 3)
1. <task title> (P0/P1, Focus area, due) — why: <…> — done looks like: <…>
   sources: <Notion url | Jira AP-NNNN | Granola meeting | Teams thread | Confluence page>
2. …
3. …

### Stack B — Complement (3 OR compressed)

[full form when Stack A is not P0-overloaded]
1. <ticket / thread title> (surface: <Frontier/Stormboy/etc.>) — leverage: <score>
   why this matters: <one line — open Q age, disagreement, ambiguity, decision-needed>
   action: <suggested response — comment, DM, scope question>
   source: <Granola meeting | Teams thread | Jira AP-NNNN | Confluence page>
2. …
3. …

[compressed form when Stack A overloaded with P0s]
> 3 complement opportunities available — ask if interested.

### Defer (mine, but not today)
- <item> — <reason>

### What I'd cut entirely
- <item> — <reason>

### Slipping items (escalation rule fired)
- <item> — <days old> — recommended bump: P<x> → P<x-1>

### Gaps (in Jira, not in Notion)
- <ticket> — <reason it should probably be in Notion>
```

### Step 6 — Read-only

**Don't write back to Notion** from this skill. Recommendations only. If Dylan agrees on a Stack A change, separately update Notion (or wait for Apex EOD). Stack B items are never auto-actioned — Dylan decides whether to engage.

## Failure modes

- **Notion connector unavailable** → fall back to `workspace/current/actions.md`; state staleness explicitly. If empty, ask Dylan rather than fabricate.
- **Granola / Teams / Outlook / Confluence connector unavailable** → omit the source from Stack A scan; flag the gap. Stack B may degrade to "best-effort with reduced coverage" — say so.
- **Owned-surface list out of date** → Stack B will be miscalibrated. The list lives in `memory/business/strategy.md`; if Dylan's role changes, update via Tier 2 PR.
- **Action-implied classification miss** → bias toward including in Stack A when ambiguous. False-positive (harmless reminder) is cheaper than false-negative (missed accountability).

## Heuristics

- **Stack A:** if Dylan finishes all 3, that's a good day. More than 3 = thrash. Same as before.
- **Stack B:** the goal isn't "do all 3"; it's "spot the one where your input actually moves something". Engaging with 1 of 3 is success.
- **Compression:** when in doubt, compress. The cost of a missed complement is less than the cost of a fragmented attention day.

## Validation
After 30 days, review Stack B usefulness with Dylan (per `memory/decisions/2026-04-28-dual-stack-prioritisation.md`). Tune source filters and leverage weights based on which items he engages vs skips.

---
**UPDATE 2026-07-16 (overrides conflicting content above):** the workstack model is now the SIMPLIFIED dual-stack — Stack A (Mine, cap 3, P0–P3 due-date weighted) + max one leverage-watch line. No Stack B scoring/suppression. Spec: `core/PRINCIPLES.md` §2; decision: `memory/decisions/2026-07-16-os-rebuild.md`. Read `memory/state/NOW.md` (not `memory/business/strategy.md`) for current priorities. Always run /reconcile first (procedure now at `core/PROTOCOLS.md` §Reconciliation).
