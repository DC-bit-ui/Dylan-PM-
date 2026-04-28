# Integration: Cowork (Apex)

**Purpose:** Cowork is the Claude environment where **Apex** runs. Apex is Dylan's automated daily workflow system — the orchestration layer that pulls from connected systems and writes outputs Dylan and this Claude Code repo consume.
**Direction:** primarily outbound (Apex writes to Notion / Jira / Granola directly, and drops summaries into this repo when relevant).
**Access:** Apex runs *in* Cowork. This Claude Code session reads its outputs but doesn't trigger it.
**Status:** **operational** (vs aspirational). Validated by Cowork handoff 2026-04-28.

---

## What Apex is — three components

### 1. Apex Morning Briefing
- **Schedule:** 04:45 SAST (06:45 AEST), weekdays. Cron: `45 4 * * 1-5`.
- **Location:** `C:\Users\DylanCronje\Documents\Claude\Scheduled\apex-morning-briefing\SKILL.md`
- **What it does:** Pre-work synthesis. Pulls from Notion (carryover), Jira (team updates), Granola (past 7 days of meetings), Teams (overnight messages), HubSpot (customer signals), Confluence (doc changes). Creates **Proposed** tasks in Notion with context.
- **Granola scan window:** 7 days — catches commitments from earlier in the week at risk of slipping.
- **Output:** summary with carryover count, new discoveries by source, Notion creates/updates, Jira comments, top-3 priorities, slipping items.

### 2. Apex EOD Reconciliation
- **Schedule:** 12:00 SAST (14:00 AEST), weekdays. Cron: `0 12 * * 1-5`.
- **Location:** `C:\Users\DylanCronje\Documents\Claude\Scheduled\apex-eod-reconciliation\SKILL.md`
- **What it does:** Progress consolidation. Reviews Today/Overdue. Categorises tasks (completed, in progress, blocked, not touched, stale proposed). Scans for items added during the day. Handles carryovers (P0/P1 keep due date, P2/P3 push to tomorrow). Syncs to Jira where appropriate.
- **Jira sync rules (built into EOD):**
  - Notion `Done` + `Linked Jira` → transition Jira ticket + add comment
  - Jira status changed → update linked Notion task
  - **Only for team-visible work**, not personal ops tasks
- **Output:** structured summary — completed, in progress, blocked, not touched, new items, Jira synced, stale items, tomorrow's top 3.

### 3. Apex Command Center (artifact)
- **Type:** persisted Cowork HTML artifact
- **Artifact ID:** `apex-command-center`
- **Tabs:** Today | Overdue | Jira | Meetings | Teams
- **Live data sources:** Notion (Today + Overdue views), Jira (active epics), Granola (this week's meetings), Teams (last 24h messages)
- **Features:** AI Priority Synthesis (uses `window.cowork.sample()`), live refresh on open, diagnostic debug panels on parse failure

---

## Design decisions Apex enforces (replicate in this Claude Code repo)

1. **Notion = personal workstack. Jira = team workstack.** Notion holds everything Dylan personally tracks. Jira is source of truth for team delivery.
2. **New items → Status "Proposed".** Apex never auto-enters Dylan's active stack. Dylan triages.
3. **Jira writes use discretion.** Personal/operational tasks ("send notes", "schedule meeting") stay Notion-only. Team-visible work syncs.
4. **Granola scan = 7 days.** Items >3 days old with no Notion task get priority bumped (escalation rule).
5. **Origin tagging.** All auto-created Notion tasks tagged `Apex · Morning` or `Apex · Reconciliation`.

---

## Where Apex outputs land

| Apex output | Lands at |
|---|---|
| **Proposed tasks** (auto) | Notion DB `Work Priorities` (id `fd5f23d7e071496dae6df273cbd901be`) |
| **Jira comments / transitions** | AgriProve Jira (cloud `93303eda-f479-47a1-ab3a-d4609f4901b3`) |
| **Daily summary** | Cowork conversation; can be dropped to `inbox/cowork/YYYY-MM-DD-<type>.md` |
| **Slipping items** | Notion (priority bumped); referenced in summary |

---

## What this Claude Code repo does with Apex outputs

This repo is **the strategic memory + reasoning + artifact layer**:
- Reads from Notion / Jira via MCP to ground decisions in current state (when connectors enabled)
- Receives ad-hoc Apex summaries via `inbox/cowork/`
- Writes durable artifacts (PRDs, decisions, retros, learnings) that Apex can reference back

This repo does **not** duplicate the Notion workstack. `workspace/current/actions.md` is a fallback only when Notion is unreachable.

---

## What Apex needs / can read from this repo

When Apex prioritises, it benefits from:
- `memory/business/strategy.md` — to weight against OKRs (currently sparse)
- `memory/initiatives/INDEX.md` — for cross-epic context
- `memory/profile/decision-frameworks.md` — the P0–P3 lens (already populated)
- `memory/people/roster.md` — for stakeholder context on tasks

---

## Failure modes
- Apex morning run can stall if MCP tool permissions weren't granted on first run — needs manual "Run now" once
- HubSpot scan: included in Morning Briefing prompt but not yet validated against live data
- Confluence scan: same — `searchConfluenceUsingCql` needs a probe call against the AgriProve cloud
- This Claude Code session can't trigger Apex; if it needs Apex output now, ask Dylan to run Cowork

## Setup status (2026-04-28)
- [x] Apex skills configured in Cowork
- [ ] First manual run of each scheduled task (to grant tool permissions)
- [ ] HubSpot CRM search validated against live data
- [ ] Confluence CQL search validated
- [ ] Bidirectional Notion ↔ Jira sync (currently primarily one-direction Notion writes)

## Discussed future enhancements (per handoff)
- Bidirectional Notion ↔ Jira sync (create Jira from Notion, two-way status)
- Granola transcript → structured action items → Notion tasks
- Teams **channel** monitoring (currently only chat messages)
- Standup auto-generation from EOD reconciliation
- HubSpot deal pipeline → product priority signal

## Privacy notes
- Apex handles meeting transcripts, customer data, internal comms. Treat all surfaced content as confidential.
- Don't commit raw Apex summaries containing names/customer detail to git unless Dylan confirms.
