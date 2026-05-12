# Team Intel Distillation — every 2 days

**Status:** Design doc. Manual mining today; automation to be built post-Monday once the live HubSpot/Claude pipeline is in place.
**Cadence:** every 2 days (Mon/Wed/Fri or similar).
**Model:** Haiku for transcript distillation, Sonnet for cross-document synthesis.
**Output cache:** `coaching/cache/team_intel.json`.
**Consumed by:** A1 (friction patterns), A2 (objection palette + tactical framings), B1 (recommendation context), Plays "Top 3" panel (gets `team_intel.json` as additional input).

## Why this exists

The MCP-validated correction pass (2026-05-08) showed two things:
1. **The team's process is shifting fast.** Lead allocation moved from HubSpot tasks to a Claude Code-based system in the last 2 weeks. Pipeline mid-pivot. Static prompts go stale within days.
2. **Tactical wins surface verbally before they land in HubSpot.** Ben's confirmed-working "nurture re-engagement with HORIZON Snapshot" play (2026-04-24 standup) is exactly the kind of insight the system should auto-encode the moment it's named — not 3 months later when the pattern crystallises in `closed_won_reason`.

The structured loss/won enums are too coarse and too lagging. The team's own retrospection in standups is the leading signal. This pass mines it.

## Sources to mine

| Source | Where | Cadence |
|---|---|---|
| Stormboy standup transcripts | SharePoint `OperationStormBoy/Shared Documents/Standup/` + Dylan's OneDrive Teams chat files | New transcript every standup (~weekly) |
| OneNote meeting notes | Dylan's OneDrive `Meetings.one` notebook | Continuous |
| Storm Boy Claude Tool docs | SharePoint `Claude Code Projects/Storm Boy Claude Tool/` (CLAUDE.md, CONTEXT.md, call-admin notes) | Updated as Claudia builds |
| Process Overview transcripts | SharePoint Standup folder | Periodic |
| **Aircall call transcripts** | **Confluence Growth-space — four folders routed by Claudia's `pelican294` workflow**: `Hobbs Calls` (562495509), `Bens Calls` (562364446), `Claudia SB calls` (562561026), `Customer Success Calls` (562462721) | New page per call; manual or scheduled `pelican294` runs |
| Hobbs farm-visit transcripts | SharePoint `Storm Boy Claude Tool/cross-project-shared/customer-transcripts/sales/hobbs-farm-visits-transcripts/` | New file per visit |

For v1, focus on the standup folder — densest signal per token.

### Aircall is NOT a blocker

Earlier this design assumed Aircall transcripts required an upgraded-tier account. **That's solved.** Claudia's `pelican294` workflow (in her Storm Boy Claude Tool at `workflows/aircall-tscripts-into-confl/`) uses Aircall's `/auth/v1/tokens/refresh` endpoint with a long-lived refresh token to mint fresh id_tokens per run, fetches transcripts directly via Aircall API, and writes one Confluence page per call to the appropriate Growth-space folder.

This means our team-intel distillation reads transcripts from **Confluence**, not from Aircall direct. We depend on Claudia's pipeline being run (`pelican294` is currently manual; she may schedule it). If `last_run` in `state.json` falls behind, we surface fewer recent transcripts — that's the failure mode, and it's transparent.

We do NOT replicate Claudia's Aircall pipeline in our system. We consume what hers produces.

## What to extract

Each pass produces structured records of three types:

### Type 1 — Confirmed-working tactical plays
A team member explicitly names a tactic that worked. Encode with:
```json
{
  "type": "confirmed_play",
  "named_by": "Ben Payne",
  "context": "Stormboy nurture re-engagement",
  "tactic": "Re-engage 6-12mo nurture contacts with fresh HORIZON Snapshot framed around what's changed in the platform.",
  "evidence": "Used on a customer who'd asked for a 6-12 month break; customer was receptive and engaged.",
  "applicability": "closed_lost with reason 'Not for at least 6 months' OR distillates show timing-deferral signal",
  "source_meeting": "Stormboy Standup 2026-04-24",
  "extracted_at": "ISO"
}
```

### Type 2 — Friction patterns the team is naming
A pattern the team identified as causing stalls. Encode with:
```json
{
  "type": "named_friction",
  "named_by": "Claudia Bryant",
  "pattern": "Email round-trip exhaustion on Stormboy contacts",
  "evidence": "'Worst week with farmers — not one thing was solved in one email, so many back and forth.'",
  "implied_play": "Switch to call (or book Hobbs on-farm) when distillates show >3 round-trips on same objection",
  "source_meeting": "Stormboy Standup 2026-04-24",
  "extracted_at": "ISO"
}
```

### Type 3 — Process / pipeline-state shifts
Structural change to how the system works. Encode with:
```json
{
  "type": "process_shift",
  "summary": "Manual HubSpot task allocation has stopped; Claudia's Claude Code Storm Boy Tool now owns task prioritisation + research.",
  "implications": ["Dashboard pipeline metrics will show inflow drift as bulk imports land", "Reps still source work from HubSpot Storm Boy contact list directly"],
  "named_by": "Daniel Wortmann + Kieren Whittock",
  "source_meeting": "Stormboy Standup 2026-04-24",
  "extracted_at": "ISO"
}
```

### Type 4 — People / role changes (feeds roster.md)
Confirmed role corrections or new people. Encode with:
```json
{
  "type": "people_update",
  "person": "Hobbs Margaret",
  "correction": "Grazier-in-residence — does on-farm visits and soft-sell conversion. Not just 'field team'. The closer in the Stormboy motion.",
  "source_meeting": "Dylan's clarification 2026-05-09 + Stormboy Standup 2026-04-24",
  "extracted_at": "ISO"
}
```

## How A1/A2/B1 consume the cache

Each downstream prompt receives `team_intel.json` as an additional input section labelled "Recent team-named patterns (from standups, last 14 days)". The model is instructed to:

- **Weight team-named tactics as [high] confidence** even if structured data is thin (the team's first-hand experience > sparse enum signal).
- **Cite the team member who named it** when surfacing the framing in a play (e.g., "Per Ben's nurture-back tactic, ...").
- **Not hallucinate beyond the cache** — if the cache doesn't surface a relevant team intel, don't invent one.

Operationally, this means the dashboard reflects what the team is *currently* learning, not just what HubSpot has captured. Tactical plays propagate into coaching cards within 2 days of being voiced.

## Pipeline (planned)

```
Every 2 days:
  1. SharePoint search — newest Stormboy standup transcript + new
     OneNote pages in Meetings.one since last_run.
  2. For each new transcript:
     - Haiku call: distill into Type 1 / 2 / 3 / 4 records
     - Each record gets `extracted_at`, `source_meeting`, `confidence`
  3. Sonnet synthesis: dedupe against existing cache, merge new
     records, retire stale ones (>90 days, superseded).
  4. Write coaching/cache/team_intel.json (with .previous archived).
  5. Trigger downstream cache regeneration so A1/A2/B1 pick up new
     patterns immediately.
```

Cost estimate: ~$0.05 per run. Trivial.

## Why "every 2 days" and not "weekly" or "real-time"

- **Daily** burns cache without enough new signal — most days have no standup.
- **Weekly** misses the most consequential moment: the day after a standup. Ben names a tactic Thursday → if we run weekly Friday, the system has it Friday; if we run weekly Monday, the system has it 3 days later.
- **Every 2 days** catches the day-after-standup window and amortises across other intel sources (OneNote, Claudia's tool docs).

## Manual operating mode (today, until automation lands)

The mining I did 2026-05-09 (Ben's nurture play, Claudia's round-trip pattern, role corrections, sales-motion clarification) is the manual analogue of one Type 1 + Type 2 + Type 3 + Type 4 extraction. Findings have been encoded directly into prompts (A1, A2, B1) and `memory/people/roster.md`. Same pattern repeats every 2 days until the automated pipeline ships.

## Open questions for v2 build

1. **Teams chat search reliability:** today the Microsoft 365 MCP `chat_message_search` timed out repeatedly. SharePoint search worked. Need to test direct Teams Graph API calls (with the channel IDs already discovered: Storm Boy team `560034d9-961e-44dc-9f25-93fe08bb19ef`, Standup channel `19:ee468569d8c8470ca543c59821faed64@thread.tacv2`).
2. **PII in transcripts:** team members name customers and farm names freely. Pass 0's PII generalisation rules apply here too — the model must not write specifics into the cache.
3. **OneNote API access:** OneNote pages in Meetings.one are in `Dylan @ AgriProve` notebook on personal OneDrive. Need to confirm Microsoft Graph access pattern.
4. **Conflict resolution:** if a team member's named tactic contradicts what the data shows, which wins? Default: surface both with context, let the rep decide. Don't auto-suppress either.
