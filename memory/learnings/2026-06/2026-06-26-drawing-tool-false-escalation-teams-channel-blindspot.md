# Learning: False P0 escalation caused by Teams channel blindspot

**Date:** 2026-06-26  
**Source:** Dylan correction during Apex Morning Briefing review  
**Confidence:** [high]

## What happened

Apex escalated "Drawing Tool Manager Briefing" from P1 → P0 this morning on the basis that AP-2539 was in Code Review and AP-2542 was in Staging with no PM sign-off visible. The escalation was incorrect.

**Reality:** Dylan had signed off the Manager Briefing via async Teams review on **18/06**. The feature launched to production shortly after. The task was complete 8 days before this morning's briefing.

## Root cause

`chat_message_search` (Teams MCP) scans DMs only. Channel posts — including the sign-off message in Product > Epics or a related channel — are invisible to it. The reconciliation check for "Drawing Tool Manager Briefing" found no Teams signal and treated absence of evidence as evidence of absence.

This is the same blindspot flagged as `teams_pull_errors` in every Apex brief since Teams channel access was identified as missing. Today it caused a concrete false positive: a P0 escalation of a completed task.

## Rule

**Never escalate to P0 on a Jira ticket state (Code Review / Staging) alone if the sign-off path could run through Teams channels.** Corroborate with at least one other signal (Confluence comment, Outlook, Granola) before treating it as a PM gap.

When escalating based on Jira ticket status, explicitly flag: "Unable to verify sign-off via Teams channels (DM-only access). Escalating with low confidence — confirm with Dylan."

## Implication for reconciliation scoring

The `done-ack` category in the reconciliation flow should weight Teams channel sign-offs as **unverifiable**, not absent. Items where the sign-off mechanism is likely a channel post should be categorised as **❓ Ambiguous**, not ✅ Done-ack or 🟡 Still-open.

## Related

- `memory/decisions/2026-04-28-reconciliation-flow.md` — reconciliation framework
- `MEMORY.md` entries: `chat_message_search is blind to channel posts`, `Teams channels are primary signal source`
- AP-2539, AP-2542 — Drawing Tool tickets (both shipped)
