# Learning: Reconciliation rule + connector-first protocol + PRD template = reference-only

**Date:** 2026-04-28
**Source:** Dylan in session, in response to my open questions after the Cowork-handoff bootstrap.

---

## What Dylan taught me

### 1. Phantom-open tasks are the workstack's biggest signal failure
Tasks like "Book meeting with X" frequently get completed within minutes via Outlook or Teams, but sit in Notion as open. Apex's daily EOD reconciliation isn't enough — Dylan calls `/focus` and `/standup` on demand throughout the day, and the workstack lies until 12:00 SAST.

**The rule he wants:**
> Review commitments via Granola and Notion → review Teams, Jira, Confluence, Notion to assess if the requested task was completed → if yes, mark done with context copy → if no, add to work stack and prioritise with reference to commitment from source.

Implemented as `/reconcile` skill, mandatory chain into `/focus` and `/standup`. Logged in `memory/decisions/2026-04-28-reconciliation-flow.md`.

### 2. Connectors first, ask second
"Please fetch these sorts of information yourself via connections moving forward where possible."

The default protocol: before asking Dylan for a fact a connected system already holds, try the MCP. Person's name, meeting status, ticket comment, doc edit, email thread — all live retrievable. Logged in `memory/decisions/2026-04-28-connector-first-protocol.md`.

### 3. PRD template stays in Confluence — reference-only
"In case any edits are made the system can align to live documentation."

The canonical AgriProve PRD template lives at <https://agriprove.atlassian.net/wiki/spaces/SCRUM/folder/367656961>, accessed via **AgriProve Platform → Product Requirements → Create new PRD**. Don't copy it into this repo — pull it live (or via Cowork's `agriprove-pm` skill). `templates/prd.md` is now a pointer, not a template.

### 4. OKRs aren't ready yet
"Still being decided for the quarter." `/okr-check` falls back to checking against the strategic-priorities list in `strategy.md` until OKRs land.

### 5. People-data lives in Teams (and other connectors)
Hobbs Margaret, Ben Payne, Claudia Bryant — all sourceable via Teams. Roster updated. Sourcing protocol added: connectors before questions.

### 6. Metrics need a multi-system review (incl. FullStory)
The `metrics.md` population task isn't a one-shot — it requires reviews across all of Dylan's systems including FullStory. Parking until that pass can happen.

## Mental model shift this triggers

The system has been thinking of `memory/` as the source of truth for everything. That's wrong. **The connected systems are the truth; `memory/` is for things the connected systems can't carry** — strategy, decisions, voice, retros, reasoning, drafts. Anything that *is* in a connected system, fetch live.

This is consistent with the Notion-canonical-workstack decision (`2026-04-28-notion-canonical-workstack.md`) but generalises it.

## Implications for skills

| Skill | Change |
|---|---|
| `/focus` | Calls `/reconcile` first |
| `/standup` | Calls `/reconcile` first |
| `/okr-check` | Falls back to strategic-priorities when OKRs are pending |
| `/prd` | Pulls Confluence template live; saves drafts here but reminds Dylan to publish in Confluence |
| _(any skill that asks for a person fact)_ | Connector-first by default — see `working-style.md` item 6 |

## Implications for behaviour

CLAUDE.md §6.1 (connector-first) and §6.2 (reconciliation) capture the behavioural rules. These are now baked into the always-loaded prompt, so every session inherits them.
