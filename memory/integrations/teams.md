> ⚠️ **CORRECTION (2026-07-16):** this contract documents `chat_message_search` only — that tool is **DM-only and silently blind to channels**. Channel reads use `read_resource` with `teams:///teams/{groupId}/channels/{channelId}/messages/` — full inventory + procedure: `cowork/apex-data-sources.md` (authoritative) and rules.md 2026-05-22.

# Integration: Microsoft Teams

**Purpose:** Async team comms — chat messages from team members, ad-hoc decisions made in chat, @Dylan mentions needing reply.
**Direction:** read; potential write for status posts (default off).
**Access:** via Teams MCP tool — same provider as Outlook (Microsoft Graph backed).
**Status:** **operational** (chat search validated; channel monitoring not yet wired).

---

## MCP access

**Tool (chat search):** `mcp__8ec8f3ea-1a9e-4ca7-9d6f-7758fe4b9a12__chat_message_search`

**Input:** `{ query: "search terms", afterDateTime: "YYYY-MM-DD", limit: 25 }`

**Output:** multiple result objects, each with:
```
{
  from: { displayName },
  summary: "<html content>",  // ⚠️ contains HTML tags — strip before display
  createdDateTime,
  chatId,
  uri
}
```

⚠️ **Parsing gotchas:**
- `summary` contains HTML — strip tags before showing
- Results come as **separate content blocks**, not a single array

---

## Channel monitoring
**Not yet wired.** Currently only direct chat search. Future enhancement (per cowork handoff): monitor specific channel posts for announcements, decisions, requests.

---

## When agents consult Teams

| Trigger | Approach |
|---|---|
| `initiative-tracker` looking for status updates | search by initiative keywords, last 24-48h |
| `meeting-synthesizer` for decisions made in chat | search by date, key participants |
| `/focus` for @Dylan mentions | search for `@Dylan Cronje` in last 24h |
| `stakeholder-comms` for context on a person | search by `from.displayName` |

---

## Where Teams data lands in this system

| Teams content | Lands at |
|---|---|
| Decisions made in chat | `memory/decisions/YYYY-MM-DD-<slug>.md` |
| Status updates from team | initiative `Recent changes` log |
| Mentions needing reply | Notion task (via Apex) or `workspace/current/actions.md` if Apex unavailable |
| Recurring patterns | `memory/learnings/...` |

---

## Write-back (default off)
- Posting status to channels — only when Dylan explicitly asks
- Acknowledging a mention — drafted, never auto-sent
- Confirm with Dylan before any write

---

## Failure mode
- Connector unavailable → ask Dylan to copy-paste relevant thread into `inbox/teams/`
- Don't fabricate "the team said X" without source.

---

## Conventions
- When summarising a Teams thread, name the participant and date
- Don't paste long chat logs verbatim — synthesize
- Strip HTML from `summary` field before quoting
