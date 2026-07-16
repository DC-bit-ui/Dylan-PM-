# Apex Morning Briefing — 2026-06-04 (Thursday)

**Generated:** 2026-06-04T02:50:00Z
**Trigger:** scheduled
**SAST time at run:** 04:50 SAST

## Headline

Land Titles meeting in ~70 min (Michael + Cadel, EIH context) — KCT stratification partially unblocked overnight but Gayathri still needs prod access from Cadel; 2 bug tickets committed Jun 3 not yet raised.

---

## TOP 3 PRIORITIES

1. **Operating system — Land Titles meeting with Michael + Cadel (06:00 SAST TODAY)** — Michael requested, Cadel added Dylan as he's across EIH land title processing. Prepare Tallawanta / Clear View context before this. [Notion: 3758c08e-b28f-81ad-adca-f1faf98cee83]
2. **Frontier — KCT stratification + Gayathri prod access** — Jo Curran active in Teams overnight; Dylan confirmed Crown J working but Gayathri needs Cadel for DB change (no prod access). Raise at standup today. [Notion: existing task 039]
3. **Frontier — Raise bug tickets: HORIZON blank page + overlapping geometry** — Committed to Gayathri + Cadel on Jun 3. 1 day elapsed. Two Jira tickets needed before or at standup. [Notion: 3758c08e-b28f-8194-9f85-eb007deb67b4]

---

## Slipping items (>3 days, low movement)

- **Task 078** — Draft CERES escalation email for Kieren — P0, due 2026-05-22 — 13 days overdue — suggest archiving or superseding with new Paniri email task
- **Task 088** — Coordinate with Joe for KCS run-through — P0, due 2026-05-18 — 17 days overdue — check if still relevant given active KCT work with Jo
- **Task 079** — Deliver v1 sales intelligence system (Will + Kieren) — P1, due 2026-05-22 — 13 days — In progress; Claudia MCP blocker (403) is blocking this pipeline
- **Task 086** — Test and release CA + EIA component — P1, due 2026-05-22 — 13 days — In progress; check if Gayathri has picked this up
- **Task 060** — Verify Athul's HubSpot notification system live + tested — P0, due 2026-05-29 — 6 days overdue — still Proposed; confirm with Athul at standup today
- **Task 061** — Test snapshot automation on staging + send feedback to Ben — P0, due 2026-05-29 — 6 days overdue — still Proposed; 5 days elapsed since commitment

---

## Teams signal (structured)

### Mentions of me (1)
- [DM] Cadel Watson @ 2026-06-03T23:02 UTC: "Morning - got this request from Michael, I've added you to the meeting too since you're across land titles for EIH" — this is the Land Titles meeting today at 06:00 SAST

### Decisions (1)
- [Standup meeting chat] Cadel Watson @ 2026-06-03T21:30 UTC: "Hey everyone, need to move this back to 3pm today" — standup moved to 3pm AEST = 07:00 SAST (matches calendar entry at 05:00 UTC)

### Questions for me (1 unanswered of 2 total)
- [DM Gayathri] Gayathri Menakath @ 2026-06-03T06:38 UTC: "Could you please me the access?" — re: KCT bug needing prod DB access — answered: no (Gayathri established she needs Cadel for prod; unclear if Dylan provided any non-prod access)
- [DM Jo Curran] Joanne Curran @ 2026-06-03T06:27 UTC: "Did you have any luck working out the issues with Tallawanta CPs 1 & 3?" — answered: yes (Dylan replied at 03:06 UTC Jun 4: "hey Jo, everything is working")

### Commitments to me (1)
- [DM Dylan Jones] Dylan Jones @ 2026-06-03T22:58 UTC: "yes let's do that today or tomorrow" — re: EIH tool review — deadline: today or tomorrow (2026-06-04/05)

### Technical blocker surfaced (not a commitment but high-signal)
- [DM Claudia] Claudia Bryant @ 2026-06-03T06:47 UTC: "Trial blocker: custom-object writes via AgriProve MCP failing with 403 MISSING_SCOPES" — this blocks the Stormboy intelligence pipeline. New Notion task created.

---

## Today's calendar

| Time (SAST) | Meeting | Organizer | Attendees |
|---|---|---|---|
| 06:00–06:30 | Land Titles | Michael | Michael, Cadel, Dylan |
| 07:00–07:15 | Development standup | Cadel | Cadel, Dylan, Gayathri, Athul, Steve |
| 09:30–10:00 | R&D calendar | Dylan | Andrew, Will, Steve, Satheesh + others |

---

## Source roll-up

- Notion carryover: 100 tasks (11 P0, 43 P1, 27 P2) — 12 in progress, 9 blocked, 46 Proposed, 5 waiting
- Granola open commitments: 15 open items across last week of meetings — 1 already in Notion (Geoscape analysis), ~8 partially tracked, ~6 new or untracked
- Teams: 1 mention of me, 1 decision, 1 unanswered question, 1 commitment + 1 critical MCP blocker
- HubSpot: 15 recently modified deals — mostly crediting pipeline activity (Messner, Zeebra Plains, Gorton, Scullin, Minchin). No PM-specific action required from Dylan.
- Confluence: not available this run (Atlassian MCP requires fresh OAuth)
- Jira: not available this run (Atlassian MCP requires fresh OAuth)

---

## Notion writes this run

**Created (5 new Proposed tasks):**
- Operating system — Attend Land Titles meeting with Michael + Cadel (EIH context) — P0 — 3758c08e-b28f-81ad-adca-f1faf98cee83
- Frontier — Raise Jira bug tickets: HORIZON blank page refresh + overlapping geometry — P1 — 3758c08e-b28f-8194-9f85-eb007deb67b4
- Operating system — Draft email to Paniri: direct tag purchase (bypass CERS minimum order) — P1 — 3758c08e-b28f-81c1-ad5e-d03cbb8eeba3
- Operating system — Review Kieren's contractor agreement + schedule follow-up call — P1 — 3758c08e-b28f-81fb-ae5a-c21e6a5247b0
- Stormboy — Resolve Claudia's AgriProve MCP 403 MISSING_SCOPES error — P1 — 3758c08e-b28f-8159-8aba-ec2d458f2d2b

**Updated:** 0 (Today Rank refresh deferred — Atlassian Jira unavailable)

---

## Errors / degraded sources

- **Atlassian MCP (Jira + Confluence):** requires fresh OAuth authentication. Both Jira workstack and Confluence doc signals unavailable this run. No Jira ticket status or recent PRD updates available.
- **Teams channel posts:** chat_message_search covers DMs only — channel posts (Product > Epics, #standup, etc.) not scanned this run. This is a known limitation (per memory: feedback_teams_channels_no_chat_search.md). DM signal used as proxy.
