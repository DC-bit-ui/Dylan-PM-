# Integration: HubSpot — CRM / Customer Data

**Purpose:** AgriProve's CRM. Surfaces customer signals that should inform PM priorities — deal stage changes, Aircall call transcripts, feature requests.
**Direction:** read.
**Access:** via HubSpot MCP — must be enabled in active session.
**Status:** **available — usage not yet validated against live data** (per cowork handoff).

---

## MCP tools

All share prefix `mcp__2b50367f-2df5-43a9-b576-bd90cff24102__`:

| Tool | Purpose |
|---|---|
| `search_crm_objects` | Search contacts, deals, etc. |
| `get_crm_objects` | Fetch by ID |
| `get_properties` | Inspect available fields on an object type |

---

## When agents consult HubSpot

| Trigger | Approach |
|---|---|
| `/focus` surfacing customer signals | filter for high-value deal stage changes / customer pings |
| `pm-strategist` weighing customer demand | feature requests by frequency / deal size |
| `stakeholder-comms` for context on a customer | get_crm_objects by deal/contact ID |

---

## Where HubSpot data lands

| HubSpot content | Lands at |
|---|---|
| Recurring feature requests | `memory/business/customers.md` (themes) |
| Customer-named PM asks | Notion task (via Apex) with `Linked Jira` if applicable |
| Deal-stage signals | `memory/business/customers.md` only when durably useful |

---

## Failure mode
- Connector unavailable or untested → ask Dylan to share the relevant CRM context.
- **Don't fabricate customer names, deal values, or stage states.**

---

## Setup checklist
- [ ] Probe `search_crm_objects` against live data — confirm response shape
- [ ] Probe `get_properties` to enumerate available fields on contacts and deals
- [ ] Define which deal stages / pipelines are the priority signal Dylan cares about

---

## Privacy notes
- Customer data is sensitive. Don't commit raw HubSpot objects to git.
- When summarising in retros / learnings, anonymise where possible (e.g. "a Tier-1 customer" rather than the named org) unless Dylan has named them.
