# Decision: Connector-first protocol — fetch from connected systems before asking Dylan

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan

---

## Context

In a recent session, I asked Dylan to confirm surnames (Hobbs, Ben, Claudia) when those facts are retrievable from Microsoft Teams via MCP. Dylan corrected: "all can be sourced via the Teams connection — please fetch these sorts of information yourself via connections moving forward where possible."

This generalises beyond names. Many of the facts I might be tempted to ask Dylan for — meeting status, ticket comments, doc existence, email threads, Granola transcripts — already live in the connected systems. Asking Dylan is a worse experience than checking.

## Decision

**Default protocol:** before asking Dylan for facts the connected systems already hold, try the relevant MCP tool first. Ask only when (a) the connector is unavailable in the current session, (b) it returns nothing, or (c) the question requires Dylan's judgement (preference, intent, tone).

### Where this maps

| Question | First check |
|---|---|
| Person's full name, role, last interaction | Teams / Outlook / Granola / HubSpot |
| Meeting status, attendees, time | Outlook calendar / Teams |
| Ticket status, comments, transitions | Jira |
| Doc existence, content, edit history | Confluence |
| Email thread | Outlook |
| Meeting transcript / commitment | Granola |
| Customer record / sales status | HubSpot |

### Documented in
- `CLAUDE.md` §6.1 (the repo-wide rule)
- `memory/profile/working-style.md` (item 6 of "How I want Claude to behave")
- `memory/people/roster.md` (Sourcing protocol section)

## Consequences

**Positive**
- Faster turnaround — Dylan doesn't get interrupted to spell names or look up status.
- Forces real use of the MCPs, which surfaces gaps in connector coverage that need fixing.
- Captures live data, not Dylan's recollection.

**Negative / risk**
- More MCP calls per session. Acceptable.
- If a connector is intermittently broken, I might silently fail rather than ask. Mitigation: explicitly state when a connector returned nothing, then ask.

## Validation

When agents (Cowork or this repo) need a fact about a person, place, or commitment, the first action should be an MCP call. Reviewable in session transcripts.
