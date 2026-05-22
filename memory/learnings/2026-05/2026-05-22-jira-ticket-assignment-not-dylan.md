# Learning: Jira ticket assignment — devs self-assign, not Dylan's job

**Date:** 2026-05-22
**Source:** Dylan correction during EOD reconciliation
**Confidence:** [high]

Apex surfaced multiple Notion tasks telling Dylan to "assign" Jira tickets to developers (LawrieCo demo network AP-2361–2366, Referrer Portal Phase 2 AP-2383–2388). Dylan's response: "Devs assign the tickets to themselves when they are ready."

## Rule

Do NOT create Notion tasks for Dylan to assign Jira tickets to developers. The dev team self-assigns when they have capacity. Surfacing "unassigned ticket in Ready for dev" as a Dylan action item is phantom work.

**Exception:** If a ticket has been in Ready for dev for >2 sprints with no assignment movement AND it's on a deadline-critical path (e.g., LawrieCo mid-June), flag it as a signal to Cadel, not an action for Dylan.

## What Apex should do instead

When a ticket is unassigned in Ready for dev:
- Note it in the briefing as a signal if it's on a deadline-critical path
- The Notion task should be "Flag unassigned AP-XXXX to Cadel [if deadline-critical]" not "assign AP-XXXX"
- Do not create blocking P0/P1 tasks for Dylan around dev assignment

## Why this matters

Multiple cancelled Notion tasks this session were phantom PM tasks about dev assignment. This creates noise and makes the workstack feel out of Dylan's control when it isn't.
