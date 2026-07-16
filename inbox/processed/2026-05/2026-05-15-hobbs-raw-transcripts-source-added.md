# Apex update — new Hobbs source registered

**Date:** 2026-05-15
**Action required by Apex:** pick this up on next daily-enrichment run.

## What's new

Dylan has created a Confluence destination for **Hobbs's raw farm-visit transcripts** to be uploaded ongoing.

- **Folder** id `577011728` — *"Hobbs' Raw transcripts"*, space `AG`. URL: <https://agriprove.atlassian.net/wiki/spaces/AG/folder/577011728>
- **Database** id `576192562` — *"Hobbs Raw Transcripts"*, tinyURL `/x/MgBYIg`. Structured index of visits (date / customer / region). URL: <https://agriprove.atlassian.net/wiki/x/MgBYIg>

## What's already done on this side

- `coaching/cache/persona-registry.json` → Hobbs entry now has a `confluence_sources` array listing both ids
- `shared-growth-memory/persona-supplements/README.md` updated — explains the `confluence_sources` contract
- `inbox/cowork/2026-05-15-system-enrichment-pipeline-commission.md` Step 2 (Confluence sweep) explicitly names the folder id
- `coaching/hobbs-profile.md` lists this as an active source

## What Apex needs to do

In the daily Confluence sweep (Step 2 of the commission):

1. Read each persona's `confluence_sources` from the registry.
2. For Hobbs specifically:
   - **Folder sweep:** CQL `ancestor = 577011728 AND lastmodified > -3d`. For each child page found, write `confluence-farmvisit-<YYYY-MM-DD>-<slug>.md` into `persona-supplements/hobbs/`.
   - **Cross-join to contacts:** parse the customer-name / visit-date from each transcript page. If a matching HubSpot contact exists in the join-key universe, also drop the file into `contact-supplements/<contact_id>/`.
   - **Database query:** read rows from database `576192562` for the structured metadata — gives a clean visit-date / customer-name pair without parsing the page body. Use as the primary join key when available.

## Idempotency

Same source-window + same artifact = same filename = overwrite. Re-running on the same day must not accumulate dupes.

## Why this matters

Hobbs's HubSpot email footprint is zero (external contractor, sends via Gmail not @agriprove.io). Without this Confluence sweep + the existing "Hobbs Calls" Aircall sweep, his persona builds from nothing. With it, his next persona refresh produces a deep profile from his **actual farm-visit conversations** — the primary surface where he generates revenue.

Hobbs himself uploaded the transcripts. Succession knowledge extraction is the explicit goal.

## Acceptance

After Apex's first daily run picks this up:
- [ ] `persona-supplements/hobbs/` contains at least one `confluence-farmvisit-*` file
- [ ] Hitting `POST localhost:3401/api/brain/refresh-persona/hobbs` produces a profile that quotes verbatim from one of those transcripts
- [ ] `apex-runs.log` line includes `confluence-hobbs-farmvisits=N` count

## Reply with

Confirmation you've added this folder to your daily sweep + an ETA for the first cycle.
