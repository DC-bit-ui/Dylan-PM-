# Integration: Outlook

**Purpose:** Dylan's email — surfaces stakeholder asks, threads needing reply, and meeting invites.
**Direction:** read primarily; potential write for drafting (not sending) replies.
**Access:** via Microsoft Graph MCP server — must be enabled in the active session.
**Status:** aspirational — Microsoft Graph setup is non-trivial; defer until Granola/Notion/Jira are wired.

## When agents consult Outlook
- `/focus` for "emails needing reply" surfaced as today's work
- `stakeholder-comms` when Dylan asks "what did <person> say in their last email?"
- `meeting-synthesizer` to cross-check meeting invites and pre-reads
- `initiative-tracker` to spot stakeholder pings about an initiative

## Where Outlook data lands in this system
| Outlook content | Lands at |
|---|---|
| Threads needing reply | `workspace/current/actions.md` (with link) |
| Stakeholder follow-ups / quotes | append to `memory/people/roster.md` (Notes) |
| Customer feedback in email | summarised into `memory/business/customers.md` if durable |

## Write-back policy
- **Drafting only — never send.** Drafts go into Outlook drafts folder if connector supports; otherwise `workspace/current/drafts/`.

## Failure mode
- Ask Dylan to forward / paste the relevant thread into `inbox/outlook/` if connector unavailable

## Setup checklist (Dylan)
- [ ] Decide if Outlook integration is worth the Graph setup cost
- [ ] If yes: configure Microsoft Graph MCP, scope to your account only
- [ ] Define inbox filters Claude should respect (e.g. ignore newsletters, calendar spam)

## Privacy notes
- Email is the highest-sensitivity connector. Default to never auto-summarising emails into shared docs without Dylan's say-so.
