> ⚠️ **CORRECTION (2026-07-16):** MCP tool-ID prefixes below (e.g. `mcp__b19a3849-…`) are stale — prefixes are instance-specific. Trust the tool NAMES (`searchJiraIssuesUsingJql`, `getJiraIssue`, …) and discover the live prefix in-session. The late-April epics snapshot below is historical; active epics: `memory/state/NOW.md`. Also: inspect descriptions after `createJiraIssue` (newline double-escape bug — rules.md 2026-07-08).

# Integration: Jira — Team Workstack

**Purpose:** AgriProve Jira is the **canonical source for team delivery state**. This repo reads it for initiative-tracker reconciliation, sizing, and unblocking analysis.
**Direction:** read primarily; write-back via Apex EOD reconciliation (status transitions on linked tickets, comments). This Claude Code repo writes only when explicitly asked.
**Access:** via Atlassian MCP tool — must be enabled in active session.
**Status:** **operational**.

---

## Site
- **Cloud ID:** `93303eda-f479-47a1-ab3a-d4609f4901b3`
- **Site:** `agriprove.atlassian.net`

## Projects
| Key | Name | Type | Issue Types |
|---|---|---|---|
| **AP** | AgriProve Platform | Software | Epic, Story, Task, Bug, Subtask |
| **AO** | AgriProve Operations | Business | Workstream, Task, Sub-task |
| **ROAD** | Roadmap | Product Discovery | Idea |

**AP is the primary project** — most of Dylan's PM work happens here.

## Status flow
`Discovery → Development → Prod → Done` (also: `Blocked`)

## Dylan's Jira account
- **accountId:** `712020:177437ab-7799-4e10-8604-116a8def9eb1`

---

## Active epics (snapshot — late April 2026)

| Key | Summary | Status | Assignee |
|---|---|---|---|
| AP-2187 | CREDITING WORKFLOW TEMPLATE — T1 Offsets Report | Discovery | Unassigned |
| AP-1963 | Frontier Phase 2 | Development | Dylan Cronje |
| AP-2116 | Prepare model validation framework for first Schedule 2 run | Development | Cadel Watson |
| AP-2009 | Frontier property management | Development | Dylan Cronje |
| AP-1965 | LawrieCo referrer view | Development | Steve Le Moenic |
| AP-1964 | Operation KCT (phase 1) | Development | Steve Le Moenic |

> Initiative files for these live at `memory/initiatives/<slug>.md`. Refresh from live Jira when the snapshot is stale.

---

## MCP access

**Tool:** `mcp__b19a3849-7be2-4183-9786-51f9c690e73f__searchJiraIssuesUsingJql`

**Input:**
```json
{
  "cloudId": "agriprove.atlassian.net",
  "jql": "...",
  "fields": ["summary", "status", "priority", "assignee", "updated"],
  "maxResults": 20,
  "responseContentFormat": "markdown"
}
```

**Output:** `{ issues: [{ key, fields: { summary, status: { name, statusCategory }, priority: { name }, assignee: { displayName, accountId }, updated } }], isLast }`

⚠️ **Parsing gotcha:** Jira responses may include a deprecation notice as a separate content block before the actual data. Parse all blocks, don't assume the first is the data.

---

## Useful JQL queries (copy-paste ready)

| Purpose | JQL |
|---|---|
| Active epics | `project = AP AND type = Epic AND status != Done ORDER BY updated DESC` |
| Dylan's tickets | `project = AP AND assignee = '712020:177437ab-7799-4e10-8604-116a8def9eb1' AND status != Done` |
| Recently updated (last 24h) | `project = AP AND updated >= -1d ORDER BY updated DESC` |
| In Prod (needs review) | `project = AP AND status = Prod` |
| Blocked | `project = AP AND status = Blocked` |
| Roadmap ideas (last 7d) | `project = ROAD AND created >= -7d` |

---

## When agents in this repo consult Jira

| Trigger | Query type |
|---|---|
| `initiative-tracker` weekly sweep | active epics, recently updated, blocked |
| `/focus` | Dylan's open tickets |
| `data-analyst` sizing engineering scope | filter by epic, story-point sums |
| `pm-strategist` prioritising | what's already in flight + roadmap ideas |
| `meeting-synthesizer` cross-checking actions | search by assignee + recent date |

---

## Write-back rules

**Default: read-only from this Claude Code repo.** Apex EOD handles the routine sync.

When write needed (rare):
- `deliverable-builder` may create a ticket when a PRD lands — confirm with Dylan first
- `meeting-synthesizer` may comment on a ticket when a meeting decision touches it — confirm first
- **Never auto-transition status from this repo** — that's Apex's job, and only for team-visible work

---

## Failure mode
- Jira connector unavailable → fall back to the snapshot in `memory/initiatives/INDEX.md`, **state explicitly that it's a snapshot**, and recommend Dylan kick Apex morning briefing for fresh state.
- Don't invent ticket numbers or status. Cite by key (e.g. `AP-1963`) only when read live or recorded in initiative file.

---

## Conventions
- Reference tickets by key: `AP-1963`. Other tools resolve this format.
- Don't paste full ticket descriptions into memory; link and summarise.
- When updating an initiative file from Jira, append a `Recent changes` line with date.
