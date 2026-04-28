# Integration: Outlook (Email + Calendar)

**Purpose:** Dylan's email and calendar — surfaces stakeholder asks, threads needing reply, meeting invites, availability.
**Direction:** read primarily; draft (not send) for replies.
**Access:** via Microsoft Graph MCP — same provider prefix as Teams.
**Status:** **operational** (tools available; usage patterns to be refined).

---

## MCP tools

All share prefix `mcp__8ec8f3ea-1a9e-4ca7-9d6f-7758fe4b9a12__`:

| Tool | Purpose |
|---|---|
| `outlook_email_search` | Search emails |
| `outlook_calendar_search` | Search calendar events |
| `find_meeting_availability` | Find free slots for scheduling |

---

## When agents consult Outlook

| Trigger | Tool / approach |
|---|---|
| `/focus` "emails needing reply" | `outlook_email_search` filtered to unread/flagged |
| `stakeholder-comms` "what did <person> say last?" | `outlook_email_search` by sender + recent |
| `meeting-synthesizer` cross-checking invites / pre-reads | `outlook_calendar_search` by date |
| `initiative-tracker` stakeholder pings about an initiative | `outlook_email_search` by keywords |
| Scheduling — find time with attendee | `find_meeting_availability` |

---

## Where Outlook data lands

| Outlook content | Lands at |
|---|---|
| Threads needing reply | Notion task (via Apex) — set `Linked Jira` if relevant |
| Stakeholder follow-ups / quotes | append to `memory/people/roster.md` (Notes) when durable |
| Customer feedback in email | summarised into `memory/business/customers.md` if durable |
| Calendar context | inform `meeting-prep` skill — what's happening today/this week |

---

## Write-back policy
- **Drafting only — never send.** Drafts go to Outlook drafts folder if connector supports; otherwise `workspace/current/drafts/`.

---

## Failure mode
- Connector unavailable → ask Dylan to forward / paste the relevant thread into `inbox/outlook/`.

---

## Privacy notes
- **Highest-sensitivity connector.** Default to never auto-summarising emails into shared docs without Dylan's say-so.
- Don't commit email content to git unless explicitly approved.
