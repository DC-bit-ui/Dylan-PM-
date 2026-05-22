---
date: 2026-05-22
source: Dylan flagged that Apex morning briefings weren't surfacing Teams channel context; verified via SKILL.md inspection
tags: [cowork, apex, teams, ms-graph, observability]
severity: critical
---

# Apex was blind to all Teams channel content

## The bug

`apex-morning-briefing` SKILL.md (v2026-05-20) line 88: *"Pull the last 18 hours of Teams activity via `chat_message_search`."* Same in `apex-eod-reconciliation` SKILL.md line 33.

**`chat_message_search` is DM-only.** It silently returns zero results for channel posts. Every Apex morning + EOD run since 2026-04-29 has therefore had zero visibility into:
- Operation Stormboy channels (Deals, General, Standup, ToF) — where farm-visit briefs, deal updates, decisions live
- Growth Deals channel — where Ben posts SLA handoffs
- Product Team channels — where product discussion happens
- Operations channels — where ops projects move

Apex's prioritisation rules in PRIORITISATION LOGIC § "Teams weighting" had clauses like:
> @mention in #standup or #product channel: +1 priority tier

These never fired. Apex never saw a single @mention in any channel.

## Why the symptom was invisible

`chat_message_search` returns 200 OK with `results: []` for channel queries. No error. No "did you mean" suggestion. The downstream Apex steps just got empty buckets and proceeded as if "no Teams activity today". Dylan's `Teams: 0 mentions, 0 decisions, 0 questions, 0 commitments` lines in every morning brief looked like quiet days; they were actually blind runs.

The pattern was caught when Dylan observed that none of his Teams channel activity (which is constant in the Operation Stormboy and Product Teams) ever surfaced in priority bumps or task creation. He flagged it on 2026-05-22.

## The fix

Use `mcp__claude_ai_Microsoft_365__read_resource` with the channel URI. This is the same tool `daily-enrichment-pipeline` uses correctly — it has been reading channels via `read_resource` since at least 2026-05-18. The pattern was sitting next to the broken code the entire time.

URI format:
```
teams:///teams/{groupId}/channels/{channelId}/messages/
```

Client-side date filtering is required — `read_resource` doesn't have a date param. Filter by `createdDateTime` after pulling.

## The pattern to enforce going forward

`memory/integrations/cowork/apex-data-sources.md` is the canonical contract. Standing rule:
- **Channel posts:** always `read_resource`, never `chat_message_search`
- **DMs:** `chat_message_search` is correct
- **Each Apex SKILL.md** embeds the relevant subset of the contract inline (because Cowork's task_prompt is single-string with no include mechanism)
- **Validation:** a Cowork-side audit periodically lists every SKILL.md that mentions Teams + flags any still using `chat_message_search` against channel URIs

## Patches queued

- `apex-morning-briefing/SKILL.md` — rewrite Step 4 (currently uses `chat_message_search`)
- `apex-eod-reconciliation/SKILL.md` — rewrite Step 2c (currently uses `chat_message_search`)
- Both need to include the full channel enumeration from `apex-data-sources.md`
- Deploy via Cowork following the patch-batch + frontmatter-strip + pre-flight integrity check pattern from 2026-05-21

## What's blocking immediate full deploy

Dylan flagged "Product Team channels" as critical but the groupId + channel IDs are not yet captured. Operation Stormboy channels are known. Two options:
1. Patch with OSB channels only, then second wave once Product is known
2. Wait for Product inventory before patching

Going with option 1 — every day without the Teams fix is another blind run.

## Related

- `memory/integrations/cowork/apex-data-sources.md` — the contract
- `daily-enrichment-pipeline/SKILL.md` Step 4 — reference implementation
- `apex-morning-briefing/SKILL.md` and `apex-eod-reconciliation/SKILL.md` — pending patches
