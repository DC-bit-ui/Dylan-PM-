# Apex Morning Briefing — 2026-06-29 (Monday)

**Generated:** 2026-06-29T04:45:00+02:00
**Trigger:** scheduled
**SAST time at run:** 04:45 SAST

## Headline

The prospective projects workflow is the week's centrepiece — Cadel approved the design Thursday but UX revisions are due before dev handoff, and DJ is waiting 4 days on a testable prototype.

## TOP 3 PRIORITIES

1. **Frontier — Incorporate Cadel UX feedback into prospective projects workflow before dev handoff** — 5 specific UX items from Cadel 1:1 (Jun 26) must land before this goes to dev; also sequence 5 sub-epics each with one measurable target. Dylan already updating Confluence Epic Hub and Project Hub requirements doc this morning. [Notion: 38e8c08eb28f81809180c11e0a48f316]

2. **Frontier — Define spatial matching rule for farm map property deduplication + resolve Glen Home manually** — First real farm map submission (Jun 26) hit a routing bug: creates new property instead of routing to existing one. Ben is blocked on Glen Home prospect. Spatial matching condition (~1km) needs spec for Gayathri. [AP-2514 | Notion: 38e8c08eb28f81cfbb35d0cc766e40cb]

3. **Frontier — Build working prototype of prospective projects tool for DJ and Joe** — Committed Jun 25, now 4 days old. DJ said explicitly he can't identify gaps without going through it. Confluence shows active work happening this morning — prototype should follow. [Notion: 38e8c08eb28f81f9b80be929be51d83c]

## Slipping items (>3 days, low movement)

- **Prospective projects prototype for DJ/Joe** — 4 days old (committed Jun 25). DJ waiting. Create testable version today.
- **Pull farm map leads into shared list for Ben** — 3 days old (committed Jun 26). Ben cannot follow up inbound without this.
- **Check in with Ben on snapshot rollout** — Jun 25 standup action, 4 days old. No signal found.
- **Walk through updated project hub design with Matt (Cato)** — Jun 25 standup action, 4 days old. Confluence shows Dylan active on Project Hub doc today — may be in progress.

## Teams signal (structured)

### Mentions of me (0)
- No @mentions found in last 18h. Teams rate-limited on search (searched 45/46 chats). AU team just starting Monday.

### Decisions (0)
- No new decisions found in last 18h Teams scan.

### Questions for me (0 unanswered of 0)
- No open questions found. Note: Ops daily standup now live in Teams Ops Run channel (per today's ops meeting) — new signal source to monitor from tomorrow.

### Commitments to me (0)
- No commitments found in Teams. Pending: DJ (Dylan Jones) to send ~5 Mel-era CPP examples for template training (committed Jun 25 meeting).

## Source roll-up

- Notion carryover: 0 items due today (Today view empty); Overdue view has chronic backlog from Mar–Apr (not fresh signals)
- Jira open tickets assigned to Dylan: 8 items across AP-2528, AP-2522, AP-2514, AP-2413, AP-2221, AP-2220, AP-2218, AP-2217
- Jira updates last 24h: 0 (no team commits over the weekend)
- Granola meetings scanned: 16 meetings (Jun 22–26) across 8 meeting notes; 4 Granola query timeouts, pivoted to direct get_meetings — full content retrieved
- Teams: 0 mentions, 0 decisions, 0 questions, 0 commitments (rate-limited; AU team not yet at full cadence at 04:45 SAST)
- HubSpot: 10 deals modified today (Jun 29) — routine CRM activity; no PM action items
- Confluence changes last 24h: 9 pages — 2 updated by Dylan this morning (Prospective Projects Epic Hub, Project Hub requirements), today's Ops Meeting (260629), Kieren+Daniel 1:1

## Notion writes this run
- Created: 4 new Proposed tasks (see page IDs above)
  - "Frontier — Incorporate Cadel UX feedback into prospective projects workflow before dev handoff" [38e8c08eb28f81809180c11e0a48f316]
  - "Frontier — Define spatial matching condition for farm map property deduplication + help Ben resolve Glen Home submission" [38e8c08eb28f81cfbb35d0cc766e40cb]
  - "Stormboy — Pull farm map tool inbound leads into shared list and post link in channel for Ben" [38e8c08eb28f8188af6ef656165ee2a8]
  - "Frontier — Build working prototype of prospective projects tool and share with DJ and Joe for testing" [38e8c08eb28f81f9b80be929be51d83c]
- Updated: 0

## Key context from today's Ops Meeting (260629 — 8h ago)

- Daily standup launched in Teams Ops Run channel — new signal source
- DJ (Dylan Jones, Crediting) priorities: weather all projects report (urgent, needed today per John's Friday email), project mapping SOP (OP-003) to Kieren today
- Castle Hill KCT sent Friday; Renee KCT sent; Tall and Carbon 1&2 registration submitted (Jo) — crediting pipeline moving
- Blockers in ops: Paltridge ANZ EIH, Essential Energy EIH–Scullin, Transgrid EIH–Barton (all under DJ/Crediting)
- Steve unwell today — Michael cannot liaise on Wanbanu process

## Complement opportunities (Stack B)

- **AP-2554 KCT Automation Phase 3 in Designs** (updated Jun 26) — now that the 5-sub-epic sequencing is being defined, confirm AP-2554 scope aligns with Dylan's sequencing plan
- **HORIZON 2.0 priority elevation** — Cadel flagged Schedule 2 near-top priority given expected Schedule 1 changes. AP-2488 (canonical target table) is in PRD status with Cadel. Worth a check-in on whether there's a PM input needed
- **CPP placement decision unresolved** — Dylan: under Consents tile; Steve: top-level prominence. Confirm with Cato (back from absence?) this week — blocks dashboard build sequencing

## Errors / degraded sources

- Granola `query_granola_meetings` timed out twice when passed 8 document IDs each. Pivoted to `get_meetings` for direct content retrieval — full data obtained. Future runs: use `get_meetings` directly, not query with batched IDs.
- Teams `chat_message_search` hit Microsoft Graph rate limit (429) on multiple queries; searched 38–45 of 46 chats. Channel posts not covered by this tool. Results are partial for Teams — channel-based activity (Ops Run standup, product channels) not captured in this run.
- Jira last-24h query returned 0 results — team was off Friday/weekend; expected for a Monday morning run.
