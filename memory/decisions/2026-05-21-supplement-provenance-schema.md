---
date: 2026-05-21
status: ACCEPTED 2026-05-21 — schema as drafted; validation nightly via weekly-system-retro; no backfill
supersedes: N/A — first formal provenance schema
tags: [data-architecture, provenance, supplements, shared-growth-memory]
authors: [Dylan + Claude Code Tier 1 data audit]
---

# Supplement provenance front-matter schema

## Context

The 2026-05-21 data architecture audit found that supplement files written to `shared-growth-memory/{deal,contact,persona}-supplements/<entity-id>/` lack stable external IDs and provenance metadata. Today's headers carry filename-encoded date + (sometimes) source webUrl, but:

- **No stable external ID** — if a Teams message gets edited, a Confluence page revised, a Granola meeting re-transcribed, we can't tell. We can't dedupe across re-runs reliably (filename collision is the only check).
- **No fetched_at** beyond the date in the filename — actual fetch time is lost.
- **No query/window record** — we don't know what was queried, over what window, with what result set.
- **No schema version** — a future schema change can't be detected; old supplements look the same as new ones.

The audit punch list (item #2) calls this out as the foundation for everything else. Provenance metadata makes:
- Deduplication deterministic (item #3 schema-drift detection becomes possible)
- Re-fetch / replay viable (audit a supplement → re-run the same query → diff)
- Quality scoring meaningful (we know what was in vs out of the query window)
- Feedback loops (item #4) reliable — pattern confidence can cite specific supplement IDs

## Decision

Every supplement file written to `shared-growth-memory/*-supplements/` MUST start with a YAML front-matter block matching the schema below.

### Required fields (every supplement)

```yaml
---
source: <canonical-system-name>            # one of: teams, granola, confluence, hubspot, outlook, sharepoint, aircall, jira, notion
source_id: <stable-external-id>            # see per-source ID format below
fetched_at: <ISO 8601 UTC>                 # exact UTC timestamp of fetch
fetched_by: <pipeline>:<run-timestamp>     # e.g. "daily-enrichment-pipeline:2026-05-21T03:00:00Z"
supplement_schema_version: 1               # bump on any field-list change
---
```

### Required for query-based sources (Teams, Granola, Confluence, Outlook)

```yaml
source_query: <verbatim query string>      # CQL, JQL, keyword, channel URI, etc.
source_window_start: <ISO 8601 UTC>        # lookback window start (inclusive)
source_window_end: <ISO 8601 UTC>          # lookback window end (inclusive)
```

### Required when source returns multiple records

```yaml
filtered_from_count: <int>                 # total returned by source query
included_count: <int>                      # how many landed in this supplement file
filter_reason: <string>                    # why the rest were dropped (e.g. "no contact match", "boilerplate only", "duplicate")
```

### Optional but recommended

```yaml
source_schema_version: <string>            # if source publishes one (HubSpot doesn't, Confluence pages do via revision)
parent_thread_id: <id>                     # Teams thread parent, Outlook conversation root
related_entity_ids: [<id>, <id>]           # if this supplement is cross-routed to multiple entities (deal + contact + persona)
related_supplement_ids: [<id>, <id>]       # if this supplement supersedes or extends another
```

### Per-source `source_id` formats

| Source | Format | Example |
|---|---|---|
| **teams** | `teams:msg:<channelId>:<messageId>` | `teams:msg:19:a987e6...@thread.tacv2:1716280938000` |
| **granola** | `granola:meeting:<meetingId>` | `granola:meeting:01HXYZ...` |
| **confluence** | `confluence:page:<pageId>:rev:<revisionNumber>` | `confluence:page:577011728:rev:42` |
| **hubspot** (engagement rollup) | `hubspot:<objectType>:<id>:rollup:<YYYY-MM-DD>` | `hubspot:deal:269686763993:rollup:2026-05-21` |
| **hubspot** (record) | `hubspot:<objectType>:<id>:<lastModified>` | `hubspot:deal:269686763993:2026-05-20T15:23:00Z` |
| **outlook** | `outlook:msg:<MessageId>` | `outlook:msg:AAMkAGI...` |
| **sharepoint** | `sharepoint:item:<driveId>:<itemId>:etag:<etag>` | `sharepoint:item:b!xyz...:item123:etag:"7,42"` |
| **aircall** (direct, when integrated) | `aircall:call:<callId>` | `aircall:call:1234567890` |
| **aircall** (via Confluence — DERIVATIVE) | `confluence:page:<pageId>:rev:<rev>:aircall_call_id:<callId>` | shows derivation path |
| **jira** | `jira:issue:<key>:<updated>` | `jira:issue:AP-2316:2026-05-20T10:00:00Z` |
| **notion** | `notion:page:<pageId>` | `notion:page:1234abcd-...` |

## Migration

### New writes
- `daily-enrichment-pipeline` (and `process-intelligence-bundles-afternoon`, `persona-supplements-refresh` if/when un-deprecated) MUST emit the schema starting next deploy. Patch is queued for daily-enrichment as patch batch #2.

### Existing supplements
- Files without front-matter are treated as `supplement_schema_version: 0` (pre-provenance) — backwards-compatible, but consumers may downgrade their confidence in v0 data.
- **No backfill** — too expensive, and historical context is preserved by file mtime + filename. New writes will overwrite v0 entries idempotently.

### Validation
- New script `shared-growth-memory/tools/validate-provenance.js` walks the bus and reports:
  - Files with no front-matter (count, by source)
  - Files with malformed front-matter (missing required fields)
  - Files with duplicate `source_id` (indicates a write bug)
- Runs nightly via `weekly-system-retro` or as a new daily step.

## Per-source implementation gotchas

**Teams `read_resource` doesn't return stable message IDs in the same format MS Graph does.** Need to confirm whether the MCP exposes `id` or just `from`/`timestamp`. If not, fall back to `teams:msg:<channelId>:<timestamp>:<from-name-hash>` as a synthesized stable ID — acceptable because Teams messages are immutable post-send.

**Granola meeting IDs** are exposed via `list_meetings` and `query_granola_meetings`. Confirm they're stable across re-queries (some systems return temporary IDs in search results).

**Confluence revision numbers** are exposed on every page object (`version.number`). Always available. Easiest source to instrument.

**HubSpot engagement rollups** don't have a single timestamp — they're aggregations. Use `notes_last_updated` as the closest stable signal; mark as `rollup:<YYYY-MM-DD>` to denote the snapshot date.

**Outlook MessageId** is stable but format varies by mailbox. Use whatever MS Graph returns verbatim — don't try to normalise.

**SharePoint ETags** change on every edit. Use `etag:<value>` to capture; if absent (folder-search vs item-get), fall back to `lastModified` timestamp.

## What this unlocks

After this schema lands:

1. **Dedup**: same `source_id` + same `fetched_by` run = overwrite. Same `source_id` + different runs = audit trail (keep both or supersede with `related_supplement_ids`).
2. **Drift detection** (item #3): pipeline records per-source `source_schema_version` in `apex-runs.log`; any change triggers an alert.
3. **Feedback loop** (item #4): `probe-outcomes/<id>.json` can cite the exact `source_id`s of supplements that informed a pattern. When the outcome resolves, pattern confidence updates against those specific source_ids — closing `FB -.-> ENG` for real.
4. **Re-fetch**: given a `source_id` and `source_query`, the pipeline can re-run the query to compare. Catches Confluence/Aircall derivative drift.
5. **Replay**: any supplement → trace back to the exact source state at the time of write.

## Decision needed from Dylan

- ✅ / ❌ on the schema as drafted
- ✅ / ❌ on the per-source ID formats (especially the synthesized fallback for Teams)
- ✅ / ❌ on the migration strategy (no backfill, treat existing as v0)
- ✅ / ❌ on the validation cadence (nightly via weekly-system-retro vs daily step)

Once approved, this becomes patch batch #2 for daily-enrichment-pipeline (plus equivalent patches for any other pipeline that writes supplements).

## Related

- `memory/learnings/2026-05/2026-05-21-architecture-diagram-vs-reality-drift.md` — companion finding about FB -.-> ENG fiction
- `.claude/skills/cowork-scheduled/daily-enrichment-pipeline/PROVENANCE.md` — will get patch batch #2 once this is approved
- Data audit punch list items #2, #3, #4 — this schema enables all three
