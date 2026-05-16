# Persona Supplements — Multi-source Enrichment Bus

This folder is where MCP-side systems (primarily **Apex / Cowork** — it holds the user's auth for Confluence, Teams, Outlook, Granola) stage signal for the Frontier dashboard's persona-builder to consume.

The dashboard server-side persona-builder pulls **HubSpot** directly (notes, calls, meetings, contacts, deals — and emails too once `crm.objects.emails.read` is added to the Private App). It cannot reach Confluence / Teams / Outlook / Granola because those need user-delegated auth, which lives in Cowork's MCP session.

So the architecture is **federated**: each source-owner writes its slice here on its own cadence, the persona-builder runs every ~48 hours and fuses everything into one profile.

## Folder layout

```
persona-supplements/
  bill-hyem/
    confluence-aircall-2024-06-15-FredBryant.md
    confluence-aircall-2024-06-13-TomWebster.md
    teams-channel-stormboy-2024-08-24.json
    outlook-email-pardoo-scoping-study.md
    manual-interview-stephen-2026-05-14.md
  hobbs/
    confluence-aircall-2026-04-08-GeorgieMillard.md
    granola-meeting-stormboy-standup-2026-05-04.md
    teams-channel-stormboy-2026-04-30.json
  ben/
    confluence-aircall-2026-04-15-GeorgieMillard.md
    ...
```

**Slug.** Match the slug in `coaching/cache/persona-registry.json` (e.g. `bill-hyem`, `hobbs`, `ben`, `claudia`, `will`). The registry entries may also include a `confluence_sources` array — Apex must read these and pull from the listed page/folder/database ids as part of that persona's daily sweep.

**Filename prefix.** The first hyphen-separated token declares the **source type** so the synthesis prompt can group/weight items. Recognised prefixes (extensible — the engine takes the first `[a-z]+(-[a-z]+)?` segment as source-type):

| Prefix | Source | Owner |
|---|---|---|
| `confluence-aircall-` | Aircall transcripts saved to Confluence (Claudia's daily 1pm automation) | Apex / cron |
| `confluence-page-` | Other Confluence pages mentioning the rep | Apex / cron |
| `teams-channel-` | Teams channel messages by or about the rep | Apex |
| `teams-chat-` | Direct messages where the rep was a participant | Apex |
| `outlook-email-` | Outlook emails by or about the rep | Apex |
| `granola-meeting-` | Granola meeting transcripts featuring the rep | Apex |
| `manual-` | Hand-curated notes — interview transcripts, post-mortem retros, anything written deliberately about the rep | Dylan / human |

## Accepted formats

- **`.md`** — preferred for transcripts and narrative content. The engine ships the full text into the synthesis prompt verbatim (truncated to ~20K chars per item).
- **`.json`** — preferred for structured drops. Recognised top-level shapes:
  - `{ "transcript": "..." }` — single transcript blob
  - `{ "body": "..." }` — single body blob
  - `{ "messages": [ { "from": "...", "timestamp": "...", "text": "..." }, ... ] }` — chat-like multi-message threads (Teams, Slack)
  - Anything else gets JSON.stringified into the prompt — keep payloads tight.
- **`.txt`** — fine, treated as raw text.

## Contract guarantees (from the writer's side)

- **Idempotent file names.** Re-running an Apex pull should overwrite the same filename, not accumulate dupes.
- **Date in filename.** Include a date so stale supplements are obvious (`...-2024-06-15.md`).
- **One artifact per file.** Don't pack multiple transcripts into one file — each artifact in its own file keeps the synthesis prompt cleanly groupable.
- **Strip irrelevant boilerplate** before writing — meeting invite footers, sig blocks, "Sent from my iPhone." The engine doesn't.

## Cadence

- **Apex** should run the multi-source pull **every 48 hours** (Mondays + Wednesdays + Fridays, say), refreshing this folder before the dashboard scheduler fires.
- **The dashboard scheduler** runs the persona-builder **every 48 hours** (gated by `_last_refreshed` timestamp in `coaching/cache/persona-registry.json` — won't run if already ran within 48h).
- **Manual refresh** of any single persona: hit `POST /api/brain/refresh-persona/<slug>` from the dashboard BRAIN tab's "⟳ Rebuild from HubSpot" button — picks up any supplements already in the bus at run time.

## What the persona-builder does with supplements

1. On `refreshOne(slug)` it scans `persona-supplements/<slug>/` and reads every `.md`/`.json`/`.txt` file.
2. Groups items by source-type.
3. Folds them into the Claude Sonnet synthesis prompt as a `=== SUPPLEMENT · CONFLUENCE-AIRCALL (12 items) ===` block (etc.), preceding the HubSpot contact/deal threads.
4. The synthesis prompt instructs Claude to weight sources appropriately and quote verbatim where possible.
5. Renders the profile markdown and writes to `shared-growth-memory/team-brain/profiles/<slug>.md` + the coaching mirror.

## Inverse — what Apex should NOT write here

- **Raw Aircall recordings** (they're large, transient, and Confluence already has the transcript version). Link in a manual note if a recording is unusually important.
- **Granola transcripts that don't feature the rep.** Filter for participant-presence before staging.
- **PII the rep didn't share** (personal phone numbers other than business mobile, home addresses, etc.).
- **Anything covered by an NDA** unless it's about the rep's own performance and the rep has consented.

## Implementation notes for the Apex side

Once Cowork's Apex (or any other automation) is set up to populate this folder, the dashboard side is fully passive — the next scheduled `refreshAll()` picks the new files up automatically. No code changes required when adding/removing a source type as long as the filename prefix follows the convention.

For a one-shot bootstrap (catching up the back-log for active reps), see `inbox/cowork/persona-supplements-bootstrap-task.md` (TBD — Dylan to commission Apex when ready).
