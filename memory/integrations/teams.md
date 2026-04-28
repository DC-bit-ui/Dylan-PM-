# Integration: Microsoft Teams

**Purpose:** team channel updates, async status, ad-hoc decisions made in chat.
**Direction:** read; potential write for status posts (default off).
**Access:** via Microsoft Graph MCP server — same connector as Outlook.
**Status:** aspirational — pairs with Outlook setup.

## When agents consult Teams
- `initiative-tracker` for status updates posted by team members in initiative channels
- `meeting-synthesizer` for chat threads that decided something async
- `/focus` for @Dylan mentions that need response

## Where Teams data lands in this system
| Teams content | Lands at |
|---|---|
| Decisions made in chat | `memory/decisions/YYYY-MM-DD-<slug>.md` |
| Status updates from team | initiative `Recent changes` log |
| Mentions needing reply | `workspace/current/actions.md` |
| Recurring patterns / themes | promoted to `memory/learnings/` |

## Write-back (default off)
- Posting status to channels — only when Dylan explicitly asks
- Acknowledging a mention — drafted, never auto-sent

## Failure mode
- Ask Dylan to copy-paste relevant thread into `inbox/teams/`
- Don't fabricate "the team said X" without source

## Setup checklist (Dylan)
- [ ] Identify the channels Claude should monitor (initiative channels + leadership)
- [ ] Define mention filter (default: only `@Dylan` mentions in monitored channels)
- [ ] Decide whether to ingest channel-by-channel or org-wide

## Conventions
- When summarising a Teams thread, name the channel and link
- Don't paste long chat logs verbatim into memory — synthesize
