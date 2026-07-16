---
name: reconcile
description: Reconcile Dylan's open Notion tasks against connector signals (Outlook calendar, Teams chat, Jira activity, Confluence edits, Granola commitments) before surfacing them as "open". Catches phantom work — e.g. "book meeting" tasks that were completed minutes after creation. Run before /focus and /standup, or on demand when the workstack feels stale.
---

# Reconcile Skill

## The problem this solves

Tasks like "Book meeting with X", "Reply to Y", "Update Jira AP-1234" often get created and then completed within the hour — but they sit in the Notion workstack as "open" for days. This pollutes `/focus`, inflates `/standup`, and creates the impression of a longer queue than reality.

Apex's EOD Reconciliation handles part of this at 17:30 SAST, but it doesn't run on-demand. This skill is the on-demand version, callable any time and chained automatically by `/focus` and `/standup`.

## The flow

**Input:** Open Notion tasks (any view) + Granola commitments from the last 7 days.

**For each open task, determine the completion signal — what evidence in the connected systems would prove it's done?** Then check.

| Task pattern | Completion signal — query |
|---|---|
| "Book meeting with X" / "Schedule X" | **Outlook calendar:** invite sent or accepted with X after task creation timestamp |
| "Reply to X" / "Email X" | **Outlook sent items:** message to X with subject relating to task, after creation |
| "Message X on Teams" / "Ping X" | **Teams chat:** Dylan's outbound message in 1:1 or relevant channel, after creation |
| "Review PRD / doc" | **Confluence:** Dylan's comment, edit, or page-view on the doc after creation |
| "Update / comment Jira AP-NNNN" | **Jira:** Dylan's comment or transition on that ticket after creation |
| "Follow up with X on Y" | **Teams + Outlook + Granola:** any outbound communication to X mentioning Y, after creation |
| "Read / digest X" | (no reliable signal — leave open, flag as ambiguous) |
| Generic / project work ("Draft X") | (no reliable signal — leave open) |

**Two-pass logic:**

1. **Pass 1 — Granola → commitments.** Scan the last 7 days of Granola transcripts for things Dylan committed to. Match each commitment to an open Notion task; if no matching task exists, flag as "missing from workstack".
2. **Pass 2 — Open tasks → completion signals.** For each open Notion task, infer the signal type and run the relevant MCP query. Categorise into: **done-ack** (signal found), **still-open** (no signal), **ambiguous** (can't be programmatically verified).

## Workflow

1. **Pull open Notion tasks** via `mcp__47501ce1-32b1-4956-a3cf-3a370bc547c9__notion-query-database-view`:
   - Active view: `https://www.notion.so/fd5f23d7e071496dae6df273cbd901be?v=b920ba6653a54dee973847b167cadfd7` (Today)
   - Plus Overdue + Backlog as scope demands

2. **Pull Granola commitments** (last 7 days) via Granola MCP — look for first-person commitments by Dylan ("I'll send…", "I'll book…", "let me follow up with…"). Map to source meeting + timestamp.

3. **For each open task, run the completion-signal query.** Use the table above. Key MCP calls:
   - **Outlook calendar / mail** — search for sent items / events post-creation, recipients matching task subject
   - **Teams** — search Dylan's outbound messages post-creation
   - **Jira** — `assignee = Dylan AND key = AP-NNNN AND updated >= <task-creation>` for ticket-named tasks
   - **Confluence** — page revisions / Dylan's comments post-creation

4. **Output the reconciliation report:**

```
## Reconciliation — <YYYY-MM-DD HH:MM SAST>
[source: Notion + Outlook + Teams + Jira + Confluence + Granola, all live]

### ✅ Recommend mark done (signal found)
- <Notion task title> — done <YYYY-MM-DD HH:MM> via <system>
  - Evidence: <one-line context — e.g. "Outlook invite to Kieren accepted at 09:14">
  - Notion URL: <url> | Resolution note to copy: "<system>: <evidence + link>"

### 🟡 Still open, prioritise with source
- <Notion task title> — created <date>, source: <Granola meeting / self-set>
  - Why: <commitment quote from Granola, or Dylan's own note>
  - Recommended priority: P<x> | Suggested today rank: <n>

### ❓ Ambiguous (can't programmatically verify)
- <task> — needs Dylan's eye

### 🔍 Missing from workstack (commitment without task)
- <Granola commitment quote> — from <meeting, date> — should this be a Notion task?
```

5. **Don't auto-write to Notion.** Output the recommended changes; Dylan confirms, and either:
   - Dylan updates Notion directly, or
   - On confirmation, this skill writes via Notion MCP (one-by-one, named).

   The default is **read-only with recommendation**, matching the repo-wide rule.

## Failure modes

- **Connector unavailable:** State explicitly which connector is offline; reconcile what you can; mark the rest as "could not verify". Don't fabricate.
- **Ambiguous task title:** When the signal is unclear (e.g. "Frontier feedback"), default to leaving it open and flagging as ambiguous — false-positive done is worse than a phantom open.
- **Time skew:** Always reason in SAST and tag the timestamp; AEST team activity often happens during Dylan's overnight.

## Heuristics

- **Conservative on done.** A task should only be auto-recommended for completion when there's a clear, time-stamped, post-creation signal in a connected system. When in doubt, leave open.
- **Aggressive on ambiguity flag.** Better to surface "I can't tell" than to silently leave something on the stack.
- **Log resolutions.** Every "mark done" recommendation includes the evidence + system + timestamp — that becomes the Notion resolution note when Dylan confirms.

## Chaining
- `/focus` calls this **first**, then ranks the still-open subset.
- `/standup` calls this **first**, then composes Yesterday/Today against the reconciled state.
- Standalone use: when Dylan says "what's stale", "reconcile my stack", or "anything I missed".

---
**UPDATE 2026-07-16:** the canonical reconciliation procedure now lives at `core/PROTOCOLS.md` §Reconciliation (adds: Teams channels via read_resource, availability-blocked ≠ slipping, no P0 on Jira state alone). Where this file and PROTOCOLS differ, PROTOCOLS wins.
