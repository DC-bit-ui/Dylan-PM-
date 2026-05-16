# Deal Supplements — Multi-source Enrichment for HubSpot Deals

This folder is where MCP-side systems (primarily **Apex / Cowork**) stage signal per HubSpot deal that the Frontier dashboard's WORK tab can join in at render time.

The dashboard reads HubSpot directly for the canonical deal record (stage, owner, hectares, dates). HubSpot is often the **laggard** — a farm visit happens on Tuesday, the deal note lands on Friday, sometimes never. Meanwhile the real signal lives in:
- Confluence (Aircall transcripts dropped daily ~1pm)
- Teams (Operation Stormboy > Deals channel posts where the team works through each deal in real time)
- Granola (meeting transcripts featuring the deal's contact)
- Outlook (emails about the deal — sometimes BCC'd to HubSpot, often not)

Apex pulls those daily and writes them here. The dashboard joins them onto each deal in the WORK tab so reps see what's actually current, not what HubSpot happens to have caught up on.

## Folder layout

```
deal-supplements/
  <deal_id>/                       ← matches HubSpot deal id exactly
    confluence-aircall-2026-05-14-tarcoola-discovery.md
    teams-deals-channel-2026-05-13.json
    teams-deals-channel-2026-05-14.json
    granola-meeting-2026-05-14-product-refinement.md
    outlook-email-2026-05-12-handover.md
    manual-2026-05-15-visit-debrief.md
  264733101515/                    ← e.g. Tarcoola CP
    ...
```

The folder name is the **HubSpot deal id** (numeric). Match exactly what `hs_object_id` returns.

## Filename prefix → source-type

The engine groups items by the first `[a-z]+(-[a-z]+)?` segment of the filename.

| Prefix | Source | Pull method |
|---|---|---|
| `confluence-aircall-` | Aircall transcripts saved to Confluence | Atlassian MCP — match transcript pages to deal via contact phone/name |
| `confluence-page-` | Other Confluence pages mentioning the deal | Atlassian MCP — CQL search by dealname |
| `teams-deals-channel-` | Operation Stormboy > Deals channel posts | Microsoft 365 MCP — chat_message_search filtered to channel + deal mention |
| `teams-channel-<name>-` | Other relevant Teams channels | Microsoft 365 MCP |
| `outlook-email-` | Emails about this deal | Microsoft 365 MCP — recipient or subject match |
| `granola-meeting-` | Meeting transcripts featuring deal participants | Granola MCP |
| `manual-` | Hand-curated debriefs, retros, etc. | Human or LLM-pre-processed |

## Accepted formats + recognised shapes

Same as persona-supplements. Engine reads `.md`, `.json`, `.txt`. Recognised JSON shapes:
- `{ "transcript": "..." }` — single transcript blob
- `{ "body": "..." }` — single body blob
- `{ "messages": [ { "from", "timestamp", "text" }, ... ] }` — channel/chat threads
- `{ "summary": "...", "raw": "..." }` — when Apex pre-processed it

## How Apex matches a source artifact to a deal

This is the hard part. Common matching strategies (Apex should try in order, fall back if no hit):

1. **Direct deal mention** — dealname appears in the artifact (e.g. Teams post says "Tarcoola CP")
2. **Contact phone/email/name** — Aircall transcript has the customer's phone; match via the deal's associated contact
3. **Property/site name** — Granola transcript names the property (e.g. "Augathella")
4. **Owner-context** — when a rep posts about "the deal I visited today" in Deals channel, Apex uses the most-recent farm visit on that rep's portfolio as the join key

When a single artifact references multiple deals (rare but possible), write it into **every** matched deal's folder. Idempotent re-runs handle the dedup.

## Idempotency

Re-running Apex with the same source-window must produce the same filenames (overwrite, don't accumulate). Use date in filename. The dashboard tolerates re-reads.

## Cadence

- **Apex runs daily** at 13:00 AEST. Refreshes the bus drops before any dashboard reads happen during work hours.
- **Dashboard** reads on every WORK tab render — supplements show up immediately after Apex finishes its run.
- **Per-deal manual refresh** trigger: hit `POST /api/work/refresh-deal/:id` (TBD on dashboard side) for on-demand pull.

## What Apex should NOT write here

- Generic team chatter that doesn't relate to a specific deal — let it go to persona-supplements instead
- Raw Aircall audio files — only transcripts
- NDA-bound content unless the owner-rep has consented
- HubSpot data that's already in the canonical record (notes, calls — the dashboard pulls those directly)

## Dashboard consumption (planned, not yet built)

The WORK tab's deal cards will gain a **"What's new"** strip showing:
- Most recent supplement per source-type
- Days since each source last produced signal
- Click to expand the supplement bodies inline

The expand-overlay's "What actually happened" right column will fold in supplements alongside the HubSpot engagement timeline.

This is queued as a backend extension once Apex starts producing drops — see `inbox/cowork/2026-05-15-dashboard-supplement-consumption-plan.md`.
