# Integration: Notion

**Purpose:** source of truth for Dylan's work items and longer-form docs.
**Direction:** read primarily; potential write-back for status updates.
**Access:** via Notion MCP server — must be enabled in the active session.
**Status:** aspirational — MCP setup TBD.

## When agents consult Notion
- `initiative-tracker` reconciling initiative state
- `/focus` and `/standup` pulling current task list
- `deliverable-builder` checking for an existing PRD before drafting a new one
- `researcher` for prior context on a topic

## Where Notion data lands in this system
| Notion content | Lands at |
|---|---|
| Active work items / tasks | `workspace/current/actions.md` |
| Initiative-level docs | linked from `memory/initiatives/<slug>.md` (don't copy — link) |
| Long-form notes | summarised into `memory/deliverables/research/...` if material |

## Write-back (if enabled)
- Status updates from `initiative-tracker` may post back to the corresponding Notion page
- Draft PRDs may be exported to a Notion doc once approved (skill: `prd` extension)
- **Default off** — only enable when Dylan explicitly asks

## Failure mode
- State explicitly when connector is unavailable.
- Use the last-known snapshot in `workspace/current/actions.md` as authoritative.

## Setup checklist (Dylan)
- [ ] Configure Notion MCP server (or Anthropic connector)
- [ ] Identify the workspaces / databases Claude should have access to (least-privilege)
- [ ] Decide write-back policy: read-only? read-and-comment? read-and-write?
