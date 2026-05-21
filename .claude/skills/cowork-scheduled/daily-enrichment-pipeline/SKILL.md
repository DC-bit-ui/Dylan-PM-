---
name: daily-enrichment-pipeline
description: Daily enrichment pipeline — sweeps HubSpot engagement roll-ups, Confluence (Aircall + farm visits), Teams (9 channels), Granola, SharePoint document index → routes to SharePoint-synced shared-growth-memory bus for Frontier dashboard + team access.
---

You are running the Daily Enrichment Pipeline for the Frontier dashboard. Your job: sweep every connected source for deal/contact/persona signal, route it to the correct bus folder under the SharePoint-synced `shared-growth-memory/`, and log the run.

## Step 0 · Resolve BUS_ROOT (must pass before any writes)

The canonical output path is the SharePoint-synced folder. Resolve dynamically — never hard-code a Windows username:

```
BUS_ROOT = C:\Users\{current-windows-user}\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

On Dylan's machine, `{current-windows-user}` = `DylanCronje`. Resolve via `os.homedir()` or `%USERPROFILE%` environment variable, then append the fixed SharePoint suffix.

If `$env:BUS_PATH` is set, use that instead (override for non-standard setups).

**SYMLINK ALTERNATIVE:** A junction at `C:\Dylan PM\shared-growth-memory-bus` may exist on Dylan's machine pointing to the SharePoint path. If it resolves, use that path — it's reachable via the standard `C:\Dylan PM` mount without requiring SharePoint to be a second connected folder. Try the junction first; fall back to the full SharePoint path if it doesn't resolve.

**MOUNT-RACE RETRY:** Before declaring BUS_ROOT missing, retry the access check up to 3 times with 10s backoff between attempts. The Cowork mount can race at session start — observed pattern is "first access fails, succeeds on retry after MCP reconnect cycle." Only after 3 consecutive failed attempts proceed to HALT CHECK below.

**HALT CHECK:** Verify `BUS_ROOT` exists as a directory BEFORE proceeding. If it does not exist (after the mount-race retry above):
1. Do NOT create it (the dashboard side owns the folder structure)
2. Do NOT fall back to `C:\Dylan PM\shared-growth-memory\` — that path is historical archive only
3. Write an error file to `C:\Dylan PM\inbox\cowork\{YYYY-MM-DD}-apex-bus-path-missing.md` explaining the failure
4. Surface the error in chat and abort the run

All paths below that say `deal-supplements/`, `contact-supplements/`, `persona-supplements/`, and `apex-runs.log` are RELATIVE to `BUS_ROOT`.

## Atomic writes — non-negotiable

OneDrive sync is sensitive to partial writes — readers across the team can see half-synced files.

**If running in a Cowork session:** the `Write` tool is host-atomic at the OS level (writes via tmp+rename internally). Use it directly to the final filename. **Do NOT attempt manual tmp+rename in a Cowork session** — the bash sandbox cannot reach BUS_ROOT, so a shell-side `mv` is impossible, and the `Write` tool's atomicity is sufficient.

**If running via bash against the bus directly (rare):** use manual tmp + rename:
1. Write content to `{target-path}.tmp`
2. Rename `.tmp` to the final filename

JSON files: pretty-printed (2-space indent). Markdown: LF line endings.

## Provenance front-matter — REQUIRED on every supplement write

Every file written to `{BUS_ROOT}/{deal,contact,persona}-supplements/...` MUST begin with a YAML front-matter block (markdown) or `_provenance` top-level key (JSON) matching the schema in `memory/decisions/2026-05-21-supplement-provenance-schema.md`.

### Required fields (every supplement)

```yaml
---
source: <canonical-system-name>            # one of: teams, granola, confluence, hubspot, outlook, sharepoint, aircall, jira, notion
source_id: <stable-external-id>            # see per-source format below
fetched_at: <ISO 8601 UTC>                 # exact UTC timestamp of fetch
fetched_by: <pipeline>:<run-timestamp>     # e.g. "daily-enrichment-pipeline:2026-05-21T03:00:00Z"
supplement_schema_version: 1
---
```

### Required for query-based sources (Teams, Granola, Confluence, Outlook)

```yaml
source_query: <verbatim query>
source_window_start: <ISO 8601>
source_window_end: <ISO 8601>
```

### Required when source returns multiple records

```yaml
filtered_from_count: <int>
included_count: <int>
filter_reason: <string>
```

### Per-source `source_id` formats

| Source | Format |
|---|---|
| teams | `teams:msg:<channelId>:<messageId>` (or `teams:msg:<channelId>:<timestamp>:<from-name-hash>` if MCP doesn't expose stable IDs) |
| granola | `granola:meeting:<meetingId>` |
| confluence | `confluence:page:<pageId>:rev:<revisionNumber>` |
| confluence (Aircall derivative) | `confluence:page:<pageId>:rev:<rev>:aircall_call_id:<callId>` |
| hubspot (engagement rollup) | `hubspot:<objectType>:<id>:rollup:<YYYY-MM-DD>` |
| hubspot (record) | `hubspot:<objectType>:<id>:<lastModified>` |
| outlook | `outlook:msg:<MessageId>` |
| sharepoint | `sharepoint:item:<driveId>:<itemId>:etag:<etag>` |

### JSON example (engagement rollup)

```json
{
  "_provenance": {
    "source": "hubspot",
    "source_id": "hubspot:deal:269686763993:rollup:2026-05-21",
    "fetched_at": "2026-05-21T03:00:12Z",
    "fetched_by": "daily-enrichment-pipeline:2026-05-21T03:00:00Z",
    "supplement_schema_version": 1
  },
  "source": "hubspot-engagement-rollup",
  "snapshot_date": "2026-05-21",
  "deal_id": "269686763993",
  "...": "..."
}
```

### Markdown example (Aircall transcript)

```markdown
---
source: confluence
source_id: confluence:page:577123456:rev:7:aircall_call_id:8901234567
fetched_at: 2026-05-21T03:05:42Z
fetched_by: daily-enrichment-pipeline:2026-05-21T03:00:00Z
supplement_schema_version: 1
source_query: "text ~ \"Routed to Hobbs\" AND type = page AND space = \"AG\" AND lastModified >= now('-3d')"
source_window_start: 2026-05-18T03:00:00Z
source_window_end: 2026-05-21T03:00:00Z
---

# Aircall Transcript — {Contact Name}
...
```

Validation runs nightly via `weekly-system-retro` Step 0.5. Non-compliant writes will surface as `malformed_files` in the weekly retro audit.

## Read before acting

1. `{BUS_ROOT}\deal-supplements\README.md`
2. `{BUS_ROOT}\contact-supplements\README.md`
3. `{BUS_ROOT}\persona-supplements\README.md`
4. `C:\Dylan PM\stormboy-tracker\coaching\cache\persona-registry.json`

## First-run vs diff mode

Check `{BUS_ROOT}\apex-runs.log`. If missing or empty → **seed mode** (30-day lookback). Otherwise → **diff mode** (72h for Confluence/Granola, 24h for Teams, daily for HubSpot/SharePoint).

---

## Step 1 · Discover working sets from HubSpot (~5 min)

Use `mcp__2b50367f-2df5-43a9-b576-bd90cff24102__search_crm_objects`.

**Active deals:** objectType `deals`, properties `["dealname", "dealstage", "hubspot_owner_id", "hs_object_id"]`. Filter: dealstage NEQ closedlost. Paginate with limit=200. Build a `dealname → dealId` map for matching.

**Active Storm Boy contacts:** objectType `contacts`, properties `["firstname", "lastname", "phone", "email", "hs_object_id", "storm_boy_campaign_member"]`. Filter: storm_boy_campaign_member EQ Yes. Paginate. Build maps: `phone → contactId`, `email → contactId`, `name (lowercase) → contactId`.

**Recently won deals:** dealstage EQ closedwon, hs_lastmodifieddate GT 60 days ago. Add to deal map.

For contact→deal associations, use `mcp__61bbfc64-98a1-45e7-8005-061c606b49ec__list_associations` **lazily** during matching (not upfront for all 1800 contacts).

---

## Step 2 · HubSpot engagement roll-ups (~5 min)

Pull engagement telemetry from HubSpot roll-up fields. This is structured activity data that no other source captures — engagement velocity, recency, and marketing metrics.

### 2a. Deal engagement snapshots

Use `mcp__2b50367f-2df5-43a9-b576-bd90cff24102__search_crm_objects` with:
- objectType: `deals`
- properties: `["dealname", "dealstage", "hubspot_owner_id", "notes_last_contacted", "notes_last_updated", "num_notes", "num_contacted_notes", "engagements_last_meeting_booked", "notes_next_activity_date"]`
- Filter: `notes_last_contacted` HAS_PROPERTY (only deals with activity)
- Sort: `notes_last_contacted` DESCENDING
- Paginate with limit=200

For each deal, write `deal-supplements/{dealId}/hubspot-engagement-snapshot-{YYYY-MM-DD}.json`:
```json
{
  "source": "hubspot-engagement-rollup",
  "snapshot_date": "YYYY-MM-DD",
  "deal_id": "{id}",
  "deal_name": "{dealname}",
  "deal_stage": "{dealstage}",
  "owner_id": "{hubspot_owner_id}",
  "engagement": {
    "last_contacted": "{notes_last_contacted}",
    "last_updated": "{notes_last_updated}",
    "total_activities": {num_notes},
    "outbound_contacts": {num_contacted_notes},
    "last_meeting_booked": "{engagements_last_meeting_booked}",
    "next_activity": "{notes_next_activity_date}"
  }
}
```

### 2b. Contact engagement snapshots

Use `search_crm_objects` with:
- objectType: `contacts`
- properties: `["firstname", "lastname", "email", "phone", "notes_last_contacted", "notes_last_updated", "num_notes", "num_contacted_notes", "hs_time_to_first_engagement", "engagements_last_meeting_booked", "hs_sales_email_last_replied", "hs_analytics_num_visits", "hs_analytics_last_visit_timestamp", "storm_boy_campaign_member"]`
- Filter: storm_boy_campaign_member EQ Yes AND notes_last_contacted HAS_PROPERTY
- Sort: `notes_last_contacted` DESCENDING
- Paginate with limit=200

For each contact, write `contact-supplements/{contactId}/hubspot-engagement-snapshot-{YYYY-MM-DD}.json`:
```json
{
  "source": "hubspot-engagement-rollup",
  "snapshot_date": "YYYY-MM-DD",
  "contact_id": "{id}",
  "name": "{firstname} {lastname}",
  "email": "{email}",
  "phone": "{phone}",
  "engagement": {
    "last_contacted": "{notes_last_contacted}",
    "last_updated": "{notes_last_updated}",
    "total_activities": {num_notes},
    "outbound_contacts": {num_contacted_notes},
    "time_to_first_engagement_ms": {hs_time_to_first_engagement},
    "last_meeting_booked": "{engagements_last_meeting_booked}",
    "last_email_reply": "{hs_sales_email_last_replied}",
    "website_visits": {hs_analytics_num_visits},
    "last_website_visit": "{hs_analytics_last_visit_timestamp}"
  }
}
```

Include `chatInsights` with userIntent "daily enrichment pipeline engagement roll-ups" and satisfaction "NEUTRAL" on all HubSpot calls.

---

## Step 3 · Sweep Confluence (~15 min)

Use `mcp__52e82941-f638-4c6b-a958-34b16185b058__searchConfluenceUsingCql` with cloudId `93303eda-f479-47a1-ab3a-d4609f4901b3`.

### 3a. Aircall transcripts

Per-rep CQL queries (space AG):
- Hobbs: `text ~ "Routed to Hobbs" AND type = page AND space = "AG" AND lastModified >= now('-3d')`
- Ben: `text ~ "Routed to Bens Calls" AND type = page AND space = "AG" AND lastModified >= now('-3d')`
- Claudia: `text ~ "Routed to Claudia" AND type = page AND space = "AG" AND lastModified >= now('-3d')`
- Will: skip (operations, no Aircall calls)

(Seed mode: replace `-3d` with `-30d`)

**Page structure** (consistent, Claudia's automation is sole author):
- Title: `YYYY-MM-DD HH:MM - Contact Name`
- Header: Contact, Company, **Phone** (`+61...` — primary join key), Direction, Date, Duration, AgriProve user, **Routed to**, Aircall call ID
- Phone extractable from search result `summary` without fetching full page

**HHMM-disambiguated filenames** (multiple calls to same contact per day are common):
`confluence-aircall-{YYYY-MM-DD}-{HHMM}-{contact-slug}.md`

Extract HHMM from the page title (the `HH:MM` after the date). Convert to 4-digit format (e.g. "16:51" → "1651").

For each transcript:
1. Extract phone from summary → look up in phone→contactId map
2. If no phone match, search HubSpot contacts by name
3. If contact found, lazily check deal associations
4. Fetch full page via `getConfluencePage` (contentFormat: "markdown") for the 20 most recent; use summary for older

**Write to ALL matched entities:**
- Contact found → `contact-supplements/{contactId}/`
- Deal found → `deal-supplements/{dealId}/`
- Rep identified (from "Routed to") → `persona-supplements/{rep-slug}/`
- No contact match → persona-supplements only

Rep slug mapping: "Hobbs Calls"→hobbs, "Bens Calls"→ben, "Claudia SB calls"→claudia

File content format:
```markdown
# Aircall Transcript — {Contact Name}

**Date:** {date} | **Direction:** {direction} | **Duration:** {duration}
**AgriProve rep:** {rep name} | **Phone:** {phone}
**Confluence:** {webUrl}

## Transcript

{transcript text — strip Confluence header metadata}
```

### 3b. Hobbs' raw farm-visit transcripts

**Skipped per Rule 16.** The intended individual-transcript folder (577011728) and companion database (576192562) both return 404 from the Confluence API. These IDs are marked `status: "404-not-found"` in `persona-registry.json`. The historical bulk dump (page 569049089) has been decomposed into individual files (2026-05-16). New farm-visit sources will be added to `persona-registry.json` `confluence_sources` array; this pipeline auto-extends via §3c below.

### 3c. General principle for extensible Confluence sources

Check `persona-registry.json` for a `confluence_sources` array on each persona entry. If present and `status` is NOT `"404-not-found"`, pull from the listed Confluence folder IDs using `ancestor = {id}` CQL. This makes the pipeline auto-extensible — new sources are added to the registry, not to this prompt.

---

## Step 4 · Sweep Teams channels (~10 min)

**CRITICAL:** Use `mcp__8ec8f3ea-1a9e-4ca7-9d6f-7758fe4b9a12__read_resource` with channel URIs. `chat_message_search` is blind to channel posts — only hits DMs. Never use it for channels.

Client-side date filtering required: `read_resource` returns all messages without server-side date filtering. Filter by `createdDateTime` after pulling.

### Operation Stormboy (groupId: `560034d9-961e-44dc-9f25-93fe08bb19ef`) — TOP PRIORITY

| Channel | Channel ID | Short name | Signal |
|---|---|---|---|
| **OSB Deals** | `19:a987e623bc9e43c5bd47ff3955424c33@thread.tacv2` | `osb-deals` | Farm visit briefs, deal updates, hot leads, pre-visit research — **richest signal** |
| **OSB General** | `19:9ZFencCSMMkAQYnRJBQpounrI9gHqfSoJ5lZc8BKjAM1@thread.tacv2` | `osb-general` | Call admin summaries, process updates, lead research, tool announcements |
| **OSB Standup** | `19:ee468569d8c8470ca543c59821faed64@thread.tacv2` | `osb-standup` | Structured standups with action items, weekly recaps, focus priorities |
| **OSB Top of Funnel** | `19:ba231945226e4e378172839f651a3a7b@thread.tacv2` | `osb-tof` | Data reconciliation queries, property identity checks |

### Growth (groupId: `2d72f724-ba52-4088-ac22-07ab382bd9cc`)

| Channel | Channel ID | Short name | Signal |
|---|---|---|---|
| **Deals** | `19:06099e1fc7144c58b0185490abaf26c8@thread.tacv2` | `growth-deals` | SLA handoff posts, deal progression, pricing updates. Ben is primary poster. |
| General | — | — | **SKIP** — attachment-only posts, no text signal |

### Operations (groupId: `e2cb5732-8b71-411e-9921-8bb97f54a896`) — lower priority

| Channel | Channel ID | Short name |
|---|---|---|
| Projects | `19:fc201b6055814794acb20cb824bde8b1@thread.tacv2` | `ops-projects` |
| Auditing & Crediting | `19:eeeff48750994e92b118ffbe2d09d3fa@thread.tacv2` | `ops-auditing` |
| General | `19:3KABb6qYtcyrR9Sd6b-Ukj433LyFq1R9suJCyPX5P0Q1@thread.tacv2` | `ops-general` |
| Soil Sampling | `19:f1596b8d9e994eb5819390d2bcc35699@thread.tacv2` | `ops-sampling` |

### Processing logic:

For each message from all 9 active channels:
1. Filter by `createdDateTime` — last 24h (diff) or 30d (seed)
2. Strip HTML from `bodyPreview` (`<p>`, `<at>`, `&nbsp;` etc.)
3. Match `subject` and body against deal/contact universe from Step 1
4. If matched to deal → `deal-supplements/{dealId}/teams-channel-{short-name}-{YYYY-MM-DD}.json`
5. If matched to contact → `contact-supplements/{contactId}/teams-channel-{short-name}-{YYYY-MM-DD}.json`
6. ALWAYS write per-rep files to `persona-supplements/{slug}/teams-channel-{short-name}-{YYYY-MM-DD}.json` for each active rep who posted or is @mentioned

Group same-deal same-day same-channel messages into one file.

JSON shape: `{ "channel": "{display name}", "date": "YYYY-MM-DD", "messages": [{ "from": "Name", "timestamp": "ISO8601", "text": "plain text" }] }`

Rep routing: Ben Payne→ben, Hobbs Magaret→hobbs, Will Frecheville→will, Claudia Bryant→claudia. Skip: Kieren Whittock, Harrison Chapman, Joanne Curran, Dylan Cronje, Dylan Jones, Cadel Watson (not persona targets).

---

## Step 5 · Sweep Granola meetings (~5 min)

Use `mcp__6822ab7d-9ca1-41e0-b837-6faca8873afe__list_meetings` or `query_granola_meetings`.

Query: each rep's name (Hobbs, Ben, Claudia, Will) for the lookback window. Note: reps are NOT on calendar invites — use keyword queries, not participant search.

For each meeting:
- **External attendee present** (email NOT @agriprove.io): match to contact → `contact-supplements/{contactId}/` and deal → `deal-supplements/{dealId}/`
- **Internal only** (all @agriprove.io): route to `persona-supplements/{slug}/` for each active rep participant
- Internal meetings mentioning a deal by name → also route to `deal-supplements/{dealId}/`

Filename: `granola-meeting-{YYYY-MM-DD}-{topic-slug}.md`

Use `get_meeting_transcript` for full transcripts when available. Strip boilerplate.

---

## Step 6 · SharePoint document index (~10 min)

Scan SharePoint for deal-keyed documents and write metadata indexes to deal-supplements. This captures proposals, contracts, project reports, and other document artefacts.

Use `mcp__8ec8f3ea-1a9e-4ca7-9d6f-7758fe4b9a12__sharepoint_search` and `mcp__8ec8f3ea-1a9e-4ca7-9d6f-7758fe4b9a12__sharepoint_folder_search`.

### 6a. ERF Projects folders

Search: `sharepoint_folder_search` for "ERF Projects". List project subfolders — names follow pattern "AP {Surname} Carbon Project - {Property}".

For each project folder:
1. Match project name against deal universe from Step 1
2. If matched, search within folder for documents (proposals, lab results, offsets reports, field logs)
3. Write `deal-supplements/{dealId}/sharepoint-documents-{YYYY-MM-DD}.json`

### 6b. Storm Boy Deals folder

Search the Operation Storm Boy site for deal-keyed documents: `sharepoint_search` with queries for deal/contact names from the working set.

### 6c. Primary Files company folders

Search: `sharepoint_folder_search` for "Primary Files". Match company folder names against HubSpot companies/deals.

JSON shape for all SharePoint index files:
```json
{
  "source": "sharepoint-document-index",
  "snapshot_date": "YYYY-MM-DD",
  "deal_id": "{dealId}",
  "deal_name": "{dealname}",
  "documents": [
    {
      "name": "{filename}",
      "type": "{extension}",
      "folder": "{folder path}",
      "last_modified": "{date}",
      "url": "{sharepoint url}"
    }
  ]
}
```

**Performance note:** SharePoint enumeration can be slow. In diff mode, only re-index deals with `notes_last_updated` in the last 7 days (from Step 2 data). In seed mode, index all matched deals.

---

## Step 7 · Persona supplement refresh (every 2nd day only)

If today's day-of-year is even, the persona files written in Steps 3-5 are supplemented with a targeted backfill for each active rep. If odd, Steps 3-5 already wrote persona files — no extra work needed.

The dashboard's persona synthesis is 48h-gated (`_last_refreshed` in persona-registry.json).

---

## Step 8 · Log the run

Append to `{BUS_ROOT}\apex-runs.log`:
```
{ISO-timestamp} · daily-enrichment · deals={n} contacts={n} confluence={n} teams={n} granola={n} hubspot-engagement={n} sharepoint={n} personas-refreshed={n|skipped}
```

Use atomic write for the log append: read existing content, append new line, write to `.tmp`, rename.

---

## Rules (non-negotiable)

1. **BUS_ROOT is SharePoint** — all writes go to the SharePoint-synced path resolved in Step 0. NEVER write to `C:\Dylan PM\shared-growth-memory\` — that is historical archive only.
2. **Atomic writes** — Cowork's `Write` tool is host-atomic; use it directly. For bash writes against the bus (rare), use manual tmp+rename. Never write without atomicity.
3. **Mount-race retry, then halt** — if BUS_ROOT is initially unreachable, retry 3× with 10s backoff before declaring missing. If still unreachable, abort the run and report. Do NOT create the folder structure. Do NOT fall back to the local path.
4. **HHMM in Confluence filenames** — `confluence-aircall-YYYY-MM-DD-HHMM-slug.md` prevents same-day collisions
5. **Idempotent filenames** — same source window + same artifact = same filename = overwrite
6. **One artifact per file** — don't pack multiple transcripts or conversations
7. **Date in every filename** — stale supplements should be obvious
8. **Strip boilerplate** — sig blocks, "Sent from my iPhone", meeting invite footers, legal disclaimers
9. **Cross-entity writes** — artifact matches multiple entities → write to ALL matched folders
10. **Teams: use read_resource, never chat_message_search** — the latter is blind to channels
11. **No PII** beyond business context — no personal phone numbers, home addresses
12. **No NDA-bound content** unless about the rep's own performance with consent
13. **Performance budget** — under 60 minutes. If running long, **defer in this priority order** (drop earlier items first):

    | Priority | What to drop | Reason |
    |---|---|---|
    | 1 (drop first) | Step 6 (SharePoint document index) | Lowest dashboard payload-per-call |
    | 2 | Step 4 low-signal channels (Ops · OSB General · Standup · ToF) | Keep OSB Deals + Growth Deals only |
    | 3 | Step 3 cap Aircall transcripts to N=10 most recent | Narrative content, dashboard doesn't depend on individual transcripts |
    | 4 | Step 2 contact engagement | Deal engagement is load-bearing; contact-side can defer if budget catastrophic |
    | NEVER drop | Step 1 (working set) · Step 2 deal engagement | Required by all downstream steps |

    **Known issue (queued refactor):** Step 2 currently makes ~400 individual writes per run (200 deals + 200 contacts). This is the primary budget pressure. A JSONL-rollup refactor under `_rollup/` is queued — see `PROVENANCE.md`. Until then, expect Step 2 to be the heaviest step and budget around it.
14. **Continue on partial failures** — log errors, keep processing other sources
15. **Create subdirectories as needed** — deal/contact/persona folders may not exist yet (use mkdir -p equivalent before writing)
16. **Skip 404 Confluence sources** — check `status` field in persona-registry.json `confluence_sources`; skip entries marked `404-not-found`
17. **OneDrive conflict detection** — if you detect any files matching `* (Conflict*` pattern in BUS_ROOT during writes, log `conflicts=N` in the run log entry. Do not delete conflict files.
18. **No hard-coded usernames** — the BUS_ROOT path must be resolved dynamically every run. Never embed `DylanCronje` or any username literal in file paths.
