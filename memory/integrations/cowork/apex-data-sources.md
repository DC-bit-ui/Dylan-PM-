> ✅ **AUTHORITATIVE** for Teams channel inventory + T0–T3 source tiers. ⚠️ One correction (2026-07-16): the tool is named `read_resource` — the `mcp__claude_ai_Microsoft_365__` prefix cited below is stale; prefixes are instance-specific, discover in-session.

---
date: 2026-05-22
status: PROPOSED — schema laid out; Product Team channel inventory needs Dylan's input
tags: [cowork, apex, data-sources, contract, teams]
applies_to: [apex-morning-briefing, apex-eod-reconciliation, apex-midday, daily-enrichment-pipeline, persona-supplements-refresh]
---

# Apex data-sources contract

## Why this exists

Apex scheduled tasks (morning briefing, EOD reconciliation, midday standup, daily enrichment) read from multiple connected systems. Each task has its own SKILL.md that enumerates which sources to read and how. Until 2026-05-22, those enumerations drifted: `apex-morning-briefing` and `apex-eod-reconciliation` used `chat_message_search` for Teams (which is blind to channel posts — only sees DMs), while `daily-enrichment-pipeline` correctly used `read_resource` for channels. **Apex was effectively running without Teams channel signal**, the richest live source of task ground-truth.

This contract is the canonical inventory of what sources to read, at what priority, with what MCP tool. Each Apex SKILL.md embeds the relevant subset inline (Cowork's `task_prompt` is a single string — no include mechanism). When this contract changes, the SKILL.md embeds get re-synced.

## Standing rule (added 2026-05-22)

**For Teams CHANNEL posts: always use `mcp__claude_ai_Microsoft_365__read_resource` with the channel URI.** Never `chat_message_search` — it's DM-only and silently returns zero results for channels.

**For Teams DMs: `chat_message_search` is correct.** Use the right tool for the right thing.

## Source priority tiers

| Tier | Why it's load-bearing | Drop only if budget is catastrophic |
|---|---|---|
| **T0** | Single source of canonical state | Notion workstack views, Jira (Dylan's tickets + epics), Outlook calendar |
| **T1** | Where the team's daily ground-truth lives | **Operation Stormboy channels (all)**, **Product Team channels (all)**, Granola meetings (last 7d) |
| **T2** | Cross-functional context, valuable but slower | Growth Deals channel, Operations channels, HubSpot recent activity, Confluence (recent edits) |
| **T3** | Indirect signal | SharePoint document index, Granola older than 7d |

T0 + T1 are mandatory. T2 + T3 are best-effort.

## Teams channels — canonical inventory

### Operation Stormboy — Tier 1 (REQUIRED) — `groupId: 560034d9-961e-44dc-9f25-93fe08bb19ef`

| Channel | URI | Signal |
|---|---|---|
| OSB Deals | `teams:///teams/560034d9-961e-44dc-9f25-93fe08bb19ef/channels/19:a987e623bc9e43c5bd47ff3955424c33@thread.tacv2/messages/` | Farm visit briefs, deal updates, hot leads — **richest signal** |
| OSB General | `teams:///teams/560034d9-961e-44dc-9f25-93fe08bb19ef/channels/19:9ZFencCSMMkAQYnRJBQpounrI9gHqfSoJ5lZc8BKjAM1@thread.tacv2/messages/` | Call admin, process updates, lead research, announcements |
| OSB Standup | `teams:///teams/560034d9-961e-44dc-9f25-93fe08bb19ef/channels/19:ee468569d8c8470ca543c59821faed64@thread.tacv2/messages/` | Structured standups, action items, weekly recaps |
| OSB Top of Funnel | `teams:///teams/560034d9-961e-44dc-9f25-93fe08bb19ef/channels/19:ba231945226e4e378172839f651a3a7b@thread.tacv2/messages/` | Data reconciliation, property identity checks |

### Product Team — Tier 1 (REQUIRED) — `groupId: 6257a7df-cdec-4e2b-874d-c673782caabb`

Inventory captured 2026-05-22 from Dylan's Teams channel URLs.

| Channel | URI | Signal |
|---|---|---|
| General | `teams:///teams/6257a7df-cdec-4e2b-874d-c673782caabb/channels/19:2ydR2PMGWfJeohnDjbsBUvg5GLX2AP8bupBpJG2IYiY1@thread.tacv2/messages/` | Main Product team chat — decisions, broad announcements, cross-functional context |
| Epics | `teams:///teams/6257a7df-cdec-4e2b-874d-c673782caabb/channels/19:7e0584c8b8d2408193030bb436730e4e@thread.tacv2/messages/` | **Highest PM-relevant signal** — epic-level discussion, scope, blockers |
| Stand up | `teams:///teams/6257a7df-cdec-4e2b-874d-c673782caabb/channels/19:54b5f5aba6b64653a19e48eecb6c8e5e@thread.tacv2/messages/` | Product team standups, action items, weekly recaps |
| bugs | `teams:///teams/6257a7df-cdec-4e2b-874d-c673782caabb/channels/19:b37cfa878d304a0cad5ce8710396a729@thread.tacv2/messages/` | Bug tracking, prod issues, customer-facing breakage |
| Tech | `teams:///teams/6257a7df-cdec-4e2b-874d-c673782caabb/channels/19:248262429ed346549a3d79331424eeae@thread.tacv2/messages/` | Technical discussion among devs — architecture, implementation choices |
| Platform notifications | `teams:///teams/6257a7df-cdec-4e2b-874d-c673782caabb/channels/19:b44a2798cd814a4db0cbeefeda2b3596@thread.tacv2/messages/` | Automated platform alerts — higher volume, lower per-message signal, but flags incidents |

### Growth — Tier 2 — `groupId: 2d72f724-ba52-4088-ac22-07ab382bd9cc`

| Channel | URI | Signal |
|---|---|---|
| Growth Deals | `teams:///teams/2d72f724-ba52-4088-ac22-07ab382bd9cc/channels/19:06099e1fc7144c58b0185490abaf26c8@thread.tacv2/messages/` | SLA handoff, deal progression, pricing. Ben primary poster. |
| Growth General | — | **SKIP** — attachment-only, no text signal |

### Operations — Tier 2 (lower priority) — `groupId: e2cb5732-8b71-411e-9921-8bb97f54a896`

| Channel | URI | Short name |
|---|---|---|
| Projects | `teams:///teams/e2cb5732-8b71-411e-9921-8bb97f54a896/channels/19:fc201b6055814794acb20cb824bde8b1@thread.tacv2/messages/` | `ops-projects` |
| Auditing & Crediting | `teams:///teams/e2cb5732-8b71-411e-9921-8bb97f54a896/channels/19:eeeff48750994e92b118ffbe2d09d3fa@thread.tacv2/messages/` | `ops-auditing` |
| General | `teams:///teams/e2cb5732-8b71-411e-9921-8bb97f54a896/channels/19:3KABb6qYtcyrR9Sd6b-Ukj433LyFq1R9suJCyPX5P0Q1@thread.tacv2/messages/` | `ops-general` |
| Soil Sampling | `teams:///teams/e2cb5732-8b71-411e-9921-8bb97f54a896/channels/19:f1596b8d9e994eb5819390d2bcc35699@thread.tacv2/messages/` | `ops-sampling` |

## Per-task source matrix

### apex-morning-briefing

| Source | Tool | Lookback | Mandatory? |
|---|---|---|---|
| Notion workstack views (Today + Overdue) | `notion-query-database-view` | n/a (live state) | **YES (T0)** |
| Jira | `searchJiraIssuesUsingJql` | -1d / -7d depending on query | **YES (T0)** |
| Outlook calendar | `outlook_calendar_search` | today + tomorrow | **YES (T0)** |
| Operation Stormboy channels (4) | `read_resource` per channel URI | -18h | **YES (T1)** |
| Product Team channels (TBD) | `read_resource` per channel URI | -18h | **YES (T1)** once known |
| Granola meetings | `list_meetings`, `query_granola_meetings` | -7d | **YES (T1)** |
| Growth Deals + Ops channels | `read_resource` per URI | -18h | T2 — best-effort |
| Teams DMs | `chat_message_search` | -18h | T2 — for @mentions in 1:1s |
| HubSpot (active deals/contacts) | `search_crm_objects` | -48h | T2 — best-effort |
| Confluence (recent) | `searchConfluenceUsingCql` | -1d | T2 — best-effort |

### apex-eod-reconciliation

Same channel inventory. Lookback windows: -8h for Teams (post-morning-brief afternoon coverage), -8h for Confluence, -8h for Jira. Granola: today only.

### daily-enrichment-pipeline

Already aligned (uses `read_resource` for channels). Lookback windows differ (24h for Teams, 72h for Confluence/Granola). No change needed to its Step 4 from this contract — it's the reference implementation.

### apex-midday / persona-supplements-refresh

Same channel pattern. Smaller lookback (since last morning brief, typically -8h).

## Why `read_resource` and not `chat_message_search` for channels

Discovered 2026-05-22 (the impetus for this contract): `chat_message_search` returns ZERO results for channel posts. It only indexes DMs. **An Apex run that uses `chat_message_search` against a channel URI returns empty without error** — the failure is silent. Every Apex morning + EOD run before this fix was therefore blind to all channel discussion, including team standups, deal updates, decisions, commitments, @mentions in channels.

This bug existed in apex-morning-briefing v2026-05-20 (the most recent prompt). It exists in apex-eod-reconciliation v2026-04-29. Both need patching as a single batch.

Reference: this same pattern is documented in `daily-enrichment-pipeline/SKILL.md` Step 4: *"CRITICAL: Use `read_resource` with channel URIs. `chat_message_search` is blind to channel posts — only hits DMs. Never use it for channels."*

## What this contract enforces

When an Apex SKILL.md is reviewed or deployed:
1. Its Teams source step MUST use `read_resource` (not `chat_message_search`) for channel reads
2. Its channel enumeration MUST include all T1 channels (OSB all 4, Product all when known)
3. Its priority weighting MUST reflect the tier system above
4. Validation: a Cowork-side audit can list every SKILL.md that mentions Teams + flag any still using `chat_message_search` for channels

## Related

- `daily-enrichment-pipeline/SKILL.md` — reference implementation of Teams channel reading
- `apex-morning-briefing/SKILL.md` — needs patch batch (Step 4 rewrite)
- `apex-eod-reconciliation/SKILL.md` — needs patch batch (Step 2c rewrite)
- `memory/learnings/2026-05/2026-05-22-apex-teams-blind.md` (forthcoming) — the discovery + impact
