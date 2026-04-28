# Integration: Jira

**Purpose:** tickets, sprint state, and roadmap items.
**Direction:** read primarily; potential write-back for ticket creation / comments.
**Access:** via Atlassian MCP server — must be enabled in the active session.
**Status:** aspirational — MCP setup TBD.

## When agents consult Jira
- `initiative-tracker` mapping initiatives to engineering tickets and surfacing slip risk
- `/focus` and `/standup` for any tickets Dylan owns or is reviewing
- `data-analyst` when sizing scope or estimating engineering cost
- `pm-strategist` when prioritising — needs to know what's already in flight

## Where Jira data lands in this system
| Jira content | Lands at |
|---|---|
| Tickets owned by Dylan | `workspace/current/actions.md` |
| Roadmap items | linked from `memory/initiatives/<slug>.md` (link, don't copy) |
| Sprint status / burn-down | summarised in initiative `Recent changes` log |
| Blocker patterns | flagged into `memory/learnings/` if recurring |

## Write-back (if enabled)
- `deliverable-builder` may create a ticket when a PRD lands
- `meeting-synthesizer` may file a Jira ticket for an action item assigned to engineering
- **Default off** — only enable when Dylan explicitly asks

## Failure mode
- State explicitly when unavailable; do not invent ticket numbers or status.

## Setup checklist (Dylan)
- [ ] Configure Atlassian MCP server
- [ ] Identify projects / boards Claude should have access to
- [ ] Decide write-back policy
- [ ] Map your Jira `assignee = Dylan` filter so `/focus` knows what to pull

## Conventions
- When agents reference a Jira ticket, use the format `PROJ-123` so other tools can resolve it
- Don't paste full ticket descriptions into memory — link, summarise
