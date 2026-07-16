# Apex commission — Persona Supplements multi-source pipeline

**Date:** 2026-05-14
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Ready for Apex to pick up

## What's being asked

The Frontier dashboard now has a multi-source persona-builder. Server-side it pulls **HubSpot** directly (notes/calls/meetings/contacts/deals — plus emails once that scope lands). Every ~48 hours it synthesises a persona per rep via Claude Sonnet and writes to `shared-growth-memory/team-brain/profiles/<slug>.md`.

**The dashboard server can't reach Confluence / Teams / Outlook / Granola** — those need Dylan's delegated auth, which lives in Cowork's MCP session.

**Apex's job:** every ~48 hours, pull the multi-source signal for each persona in the registry and stage it at the bus path the dashboard reads from.

## The drop location + contract

Full spec: [`shared-growth-memory/persona-supplements/README.md`](../../shared-growth-memory/persona-supplements/README.md)

TL;DR — write one file per artifact into:
```
shared-growth-memory/persona-supplements/<slug>/<source-type>-<id>.{md,json}
```

Source-type prefixes Apex should produce:

| Prefix | Pull from | Filter |
|---|---|---|
| `confluence-aircall-` | Confluence pages in the rep's calls space | Filename or page-title matches rep |
| `confluence-page-` | Confluence pages mentioning the rep by name | `text ~ "[Rep Name]" AND type = page` |
| `teams-channel-` | Teams channel posts | `from: rep` OR `mentions: rep` in relevant channels (Stormboy, Operations) |
| `teams-chat-` | Teams DMs | rep participant, last 14 days |
| `outlook-email-` | Outlook sent items | `sender: rep@agriprove.io` OR `recipient: rep@agriprove.io`, last 90 days |
| `granola-meeting-` | Granola meetings | `participants: rep`, last 30 days |

## Registry of personas to populate

The current registry is at [`stormboy-tracker/coaching/cache/persona-registry.json`](../../stormboy-tracker/coaching/cache/persona-registry.json):

| Slug | Name | Email | Status |
|---|---|---|---|
| `bill-hyem` | Bill Hyem | william@agriprove.io | historical (no recent supplements expected) |
| `hobbs` | Hobbs | hobbs@agriprove.io | active |
| `ben` | Ben Payne | ben@agriprove.io | active |
| `claudia` | Claudia Bryant | claudia@agriprove.io | active |
| `will` | Will Donovan | will@agriprove.io | active |

Apex should keep this registry as source-of-truth — read it on each run.

## Cadence

- **Apex runs every 48 hours** (suggested: 14:00 AEST Mon/Wed/Fri). Refreshes the bus drops before the dashboard wakes.
- **Dashboard runs every 48 hours** (timestamp-gated in `_last_refreshed`). Synthesises from HubSpot + whatever's in the bus at run-time.
- **Manual triggers** still work both ways: Dylan hitting the ⟳ Rebuild button in BRAIN forces a synthesis with current supplements; Dylan running an Apex command forces a fresh pull.

## Backfill (bootstrap)

For the existing active reps (Hobbs, Ben, Claudia, Will), their profiles were originally built from a larger corpus than the current registry will continue refreshing from. To get the next refresh to a richer starting point, Apex should do a one-time deeper backfill:

- **Hobbs:** all Farm Visit Transcripts (already in `coaching/cache/hobbs-distillates-bulk.json` and `hobbs-calls-distillates.json` — could be linked or copied into supplements as `manual-` prefix)
- **Ben:** Confluence Aircall transcripts in "Bens Calls" folder, last 6 months
- **Claudia:** Confluence ACORE transcripts she writes daily — last 6 months
- **Will:** standups he runs, Teams channel posts in Stormboy/Operations
- **Bill:** skip — no recent supplements expected, historical only

## Idempotency rule

Re-running Apex with the same date-window should produce the same filenames (overwrite, not append). The dashboard tolerates re-reads and uses the file's content directly, so versioning isn't critical.

## Acceptance criteria

When this is live:
- [ ] Hitting `POST /api/brain/refresh-persona/hobbs` produces a profile that mentions a recent Aircall transcript or Granola meeting Apex staged.
- [ ] The profile "Source corpus" header lists supplement counts (e.g. `- 12 supplemental confluence-aircall items (from bus)`).
- [ ] On Day 3, the daily scheduler's `refresh-personas` step says `ran: 5, total: 5` with `hours_since_last: ~48`.
- [ ] On Day 4, the same step says `skipped: last refresh ~24h ago (< 48h gate)`.

## Why this matters

The system is meant to be living team intelligence — what each rep does, where it's working, where it's stalling. Without the multi-source enrichment, the persona-builder only sees what HubSpot captures (notes after the fact, structured deal moves). The richer signal is in the conversations themselves (Aircall transcripts, meeting recordings, Teams discussions, customer emails). Apex is the only system that can reach those without manual export.

Once Apex is doing this on schedule, every rep's profile gets sharper every 48 hours, automatically, from real interactions. That's the collective intelligence loop Dylan asked for.

## Open questions for Apex

1. Auth: confirm Cowork's MCP session still has the scopes (Confluence read, Teams message read, Outlook mail read, Granola query). All worked during the Bill scrape on 2026-05-14.
2. Volume: does the Aircall Confluence folder produce >50 transcripts per rep per refresh window? If yes, Apex should de-dup by call-ID and keep only the most recent N per rep.
3. Sensitivity: NDA flagging — Apex should follow the existing portfolio-rules sanitiser conventions when content might be sensitive.
