# Daily-enrichment pipeline — two operational learnings (2026-06-10 run)

**Date:** 2026-06-10
**Source:** Apex daily-enrichment-pipeline scheduled run, 2026-06-10T03:39:55Z (run log: `shared-growth-memory/apex-runs.log`)
**Type:** operational hazard + tooling change
**Confidence:** [high] — both observed directly during the run

## 1. Placeholder HubSpot contacts named "Storm Boy" poison Teams matching

The Storm Boy contact universe (storm_boy_campaign_member = Yes, 1,783 records) contains ~15 placeholder contacts whose literal name is "Storm Boy". During the Teams channel sweep, the name-match step matched these against the "Operation Storm Boy" @mention present in every call-admin post — producing 31 false-positive supplement files in one run. A separate near-miss: deal 13702560650 "Bryant" substring-collided with rep name "Claudia Bryant".

Files could not be deleted (bus mount denies deletes), so they were neutralised in place as retraction stubs (`included_count: 0`, `messages: []`, retraction noted in `filter_reason`).

**Rule for future runs:** exclude contacts whose full name matches the campaign/operation name (or any rep name) from the match universe before Teams/Confluence matching. Candidate permanent fix: add an exclusion list to the daily-enrichment-pipeline SKILL.md (edit-in-repo per the §6.3 convention in `CLAUDE.md`) — and ideally clean the placeholder contacts in HubSpot.

**Cleanup needed:** the 31 retraction stubs (teams-channel-*-2026-06-09/10.json under contact-supplements for the "Storm Boy" placeholder contact IDs, and deal-supplements/13702560650) can be removed by the weekly curator or dashboard-side owner.

## 2. Granola `get_meeting_transcript` is now gated to paid tiers

`get_meeting_transcript` returned "Transcripts are only available to paid Granola tiers" (2026-06-10). Verbatim transcripts are no longer retrievable via MCP on the current plan. Workaround used: `query_granola_meetings` scoped by `document_ids` returns the notes synthesis, which is adequate for supplement files but is NOT verbatim — supplements now note this caveat inline.

**Implication:** any skill or pipeline step that assumes verbatim Granola transcripts (meeting-synthesizer, Step 5 of daily-enrichment) silently degrades to synthesis. If verbatim transcripts matter, the Granola plan needs upgrading or the assumption needs removing from SKILL.md files.

## Run context (for provenance)

Diff-mode run, window since 2026-06-08T19:18:43Z (Teams) / 72h (Confluence, Granola). Outputs: deals=1099 contacts=1774 confluence=80 teams=37 granola=2 hubspot-engagement=1521 sharepoint=deferred (rule-13 budget drop, second consecutive run) personas-refreshed=skipped (odd day-of-year). Step 2's ~1,521 individual writes remain the dominant budget pressure — the queued JSONL-rollup refactor (see PROVENANCE.md) is still the right fix.
