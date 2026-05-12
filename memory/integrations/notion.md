# Integration: Notion — Personal Workstack

**Purpose:** Notion is **Dylan's personal workstack**. The "Work Priorities" database is the canonical source of truth for what Dylan is working on, including items that don't live in Jira.
**Direction:** read for `/focus`, `/standup`, `recall`, `brief`; write when this repo creates new task entries (rare — Apex usually does this).
**Access:** via Notion MCP tool — must be enabled in active session.
**Status:** **operational**.

---

## The "Work Priorities" database

- **Database ID:** `fd5f23d7e071496dae6df273cbd901be`
- **Data source URL:** `collection://8a19720a-fddb-4ea5-87dc-ca05797fa3dd`

### Schema (properties)

| Property | Type | Values / Notes |
|---|---|---|
| **Task** | title | Format convention: "[Focus area] — [action] ([context])" |
| **Status** | status | Groups: `to_do` (Proposed, Not started, Queued), `in_progress` (In progress, Waiting on others, Blocked), `complete` (Done, Cancelled) |
| **Priority** | select | P0, P1, P2, P3 |
| **Focus area** | select | Frontier, Horizon, Stormboy, Verterra, Operating system, Horizon snapshot, ReadyGraze, Claude Improvement, Testing, Bugs, UX improvement |
| **Due** | date | ISO date |
| **Next step** | text | 1-2 sentences: WHY this matters and WHAT to do next |
| **Origin** | select | Manual, Apex · Morning, Apex · Standup, Apex · Chat, Apex · Reconciliation, Imported |
| **Today Rank** | number | Numerical sort order for the day (1 = highest) |
| **Est minutes** | number | Estimated effort |
| **Linked Jira** | url | Full Jira ticket URL |
| **Related docs** | url | Confluence pages, design files |
| **Claude thread** | url | Link to the Claude conversation that produced this task |
| **Source Ref** | text | Free-text reference to source (meeting, message) |
| **Committed at** | date | When the task was committed to |
| **Created** / **Last updated** | timestamp | Auto |

### Key views

| View | URL param (v=) | Purpose |
|---|---|---|
| Today | `b920ba6653a54dee973847b167cadfd7` | Tasks due today, not complete |
| Overdue | `57a05dc240464ae394be512a932db9a9` | Tasks due before today, not complete |
| This week (by due day) | `772cfb01d43541438c420d7935ab2157` | Board view |
| Backlog (ranked) | `27ba53cd27444506910b03f29392577c` | All incomplete by priority |
| Done (recent) | `c3221ec7cf9a43d7b66f8d808ad16a00` | Completed, most recent |

---

## MCP access

**Read:** `mcp__47501ce1-32b1-4956-a3cf-3a370bc547c9__notion-query-database-view`
- Input: `{ view_url: "https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=<view_id>" }`
- Output: `{ results: [ { Task, Status, Priority, "Focus area", "date:Due:start", "Next step", "Today Rank", "Linked Jira", url, ... } ], has_more: boolean }`

**Write:**
- New tasks: `notion-create-pages` against database `fd5f23d7e071496dae6df273cbd901be`
- Updates: `notion-update-page`

---

## When agents in this repo consult Notion

| Trigger | Notion view consulted |
|---|---|
| `/focus` | Today + Overdue + Backlog (ranked) |
| `/standup` | Today + Done (recent) |
| `/recall` (task / focus area) | search across all views |
| `initiative-tracker` reconciling state | filter by Linked Jira present |
| `meeting-synthesizer` placing actions | check if task already exists before creating |

---

## Write-back rules

This Claude Code repo writes to Notion sparingly. Most writes are Apex's job. When this repo writes:

1. **`meeting-synthesizer`** can create a Notion task when a meeting produces a Dylan-owned action — but **prefer letting Apex handle it** in the next morning briefing unless urgency demands now
2. **`deliverable-builder`** when a PRD is approved, may create / update a Notion task
3. **Always:**
   - Set `Origin = Manual` (since it's coming from this Claude Code session, not Apex)
   - Set `Status = Proposed` (preserve Dylan's triage authority — same convention Apex uses)
   - Set `Source Ref` to identify the conversation / file that produced it
   - Set `Claude thread` URL if available

---

## Failure mode
- Notion connector unavailable → state explicitly. Fall back to `workspace/current/actions.md` only as a session-scratch substitute. **Do NOT fabricate task lists from memory of past conversations.**
- Stale snapshot → if last successful Notion read was >24 hours ago, flag the staleness when answering questions about current state.

---

## Conventions
- When citing a Notion task, use the format `[Focus area — Task title](url)` for clarity
- Don't paste full Notion task content into memory — link, summarise key fields
