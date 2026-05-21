---
name: persona-supplements-refresh
description: SUPERSEDED by daily-enrichment-pipeline. Re-disabled after channel mapping merged into daily pipeline.
---

## Persona Supplements Refresh — MWF 13:00 AEST (05:00 SAST)

Pull multi-source signal for each active sales rep and stage files at `shared-growth-memory/persona-supplements/<slug>/` for the Frontier dashboard persona-builder.

### Step 0 — Read registry
Read `stormboy-tracker/coaching/cache/persona-registry.json`. Process only `status: "active"` personas (currently: hobbs, ben, claudia, will).

### Step 1 — Teams channels (MANDATORY, TOP PRIORITY)

Pull from ALL of these channels using `read_resource` with Teams channel URIs. Filter messages per rep (posted BY or mentioning the rep).

**Operation Stormboy** (groupId: `560034d9-961e-44dc-9f25-93fe08bb19ef`):
| Channel | Channel ID | Signal |
|---|---|---|
| OSB General | `19:9ZFencCSMMkAQYnRJBQpounrI9gHqfSoJ5lZc8BKjAM1@thread.tacv2` | Call admin summaries, process updates, lead research, tool announcements |
| OSB Deals | `19:a987e623bc9e43c5bd47ff3955424c33@thread.tacv2` | Farm visit briefs, deal updates, hot leads — RICHEST signal source |
| OSB Standup | `19:ee468569d8c8470ca543c59821faed64@thread.tacv2` | Standup summaries, action items, weekly recaps |
| OSB Top of Funnel | `19:ba231945226e4e378172839f651a3a7b@thread.tacv2` | Data reconciliation, property questions |

**Growth** (groupId: `2d72f724-ba52-4088-ac22-07ab382bd9cc`):
| Channel | Channel ID | Signal |
|---|---|---|
| Deals | `19:06099e1fc7144c58b0185490abaf26c8@thread.tacv2` | SLA handoffs, deal progression, project readiness |
| General | `19:NQfL82bNfMzdU1OaSVFgnAAn7VDjdwHsWzZdGGHO0ck1@thread.tacv2` | SKIP — all "Unknown" sender with attachment-only posts, no text signal |

URI format: `teams:///teams/{groupId}/channels/{channelId}/messages/`

IMPORTANT: `chat_message_search` does NOT work for channel posts — only DMs. Must use `read_resource`.

For each rep × channel combination with signal, write a JSON file:
```
teams-channel-osb-general-YYYY-MM-DD.json
teams-channel-osb-deals-YYYY-MM-DD.json
teams-channel-osb-standup-YYYY-MM-DD.json
teams-channel-osb-tof-YYYY-MM-DD.json
teams-channel-growth-deals-YYYY-MM-DD.json
```

Canonical JSON shape:
```json
{ "messages": [{ "from": "Name", "timestamp": "ISO8601", "text": "plain text, HTML stripped" }] }
```

### Step 2 — Confluence Aircall transcripts

Search using `searchConfluenceUsingCql` (cloud ID: `93303eda-f479-47a1-ab3a-d4609f4901b3`):
- Hobbs: `text ~ "Routed to Hobbs" AND type = page AND space = "AG" AND lastModified >= now('-3d')`
- Ben: `text ~ "Routed to Ben" AND type = page AND space = "AG" AND lastModified >= now('-3d')`
- Claudia: `text ~ "Routed to Claudia" AND type = page AND space = "AG" AND lastModified >= now('-3d')`
- Will: no Aircall calls — skip

Write as `confluence-aircall-YYYY-MM-DD-<ContactName>.md` with the transcript content.

### Step 3 — Outlook emails (last 7 days)

Search `outlook_email_search` for each rep's email:
- hobbs@agriprove.io, ben@agriprove.io, claudia@agriprove.io, will@agriprove.io

Write as `outlook-email-YYYY-MM-DD-<subject-slug>.md`. Strip sig blocks and boilerplate.

### Step 4 — Granola meetings (last 7 days)

Use `query_granola_meetings` with keyword queries per rep name. Reps aren't on calendar invites so participant search won't work.

Write as `granola-meeting-YYYY-MM-DD-<meeting-slug>.md`.

### Rules
- Idempotent filenames — same date window = same filename, overwrite not accumulate
- One artifact per file
- Strip irrelevant boilerplate (sig blocks, "Sent from my iPhone", meeting invite footers)
- No PII the rep didn't share
- No NDA-bound content unless about the rep's own performance
- Date in every filename
