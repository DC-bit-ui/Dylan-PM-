# Apex Morning Briefing — 2026-05-27 (Wednesday)

**Generated:** 2026-05-27T04:45:00Z
**Trigger:** scheduled
**SAST time at run:** 06:45 SAST

---

## Headline

Cadel is out sick (COVID, day 2), Ben has a live Frontier blocker, and Athul's two Friday deliverables are at risk — today is about unblocking the team and keeping KCT momentum without the dev lead.

---

## TOP 3 PRIORITIES

1. **Frontier — Ben's property creation blocker** — Ben DMed Dylan at 01:10 AEST unable to create a property at "5854 Gregory Springs Road, Pentland QLD" due to duplicate address conflict. Dylan said "let's chat" at 03:09. Confirm this is resolved; if not, investigate and unblock. [Teams DM 2026-05-27]
2. **Horizon snapshot — Create pipeline ticket for Athul** — Dylan committed in standup (26/05 Granola) to create a Jira ticket for Athul to investigate the snapshot pipeline staging vs prod connection. Not yet in Jira. Athul's notifications deliverable due Friday is blocked without it. [Granola standup 2026-05-26]
3. **Horizon snapshot — Test exclusions box in staging, feedback to Ben** — Committed in standup 25/05. 2 days elapsed, no signal it's been done. Due today. [Notion 2026-05-25]

---

## Slipping items (>3 days, low movement)

- "Sit with Joe for KCT workflow session" (Today Rank 1, P1, AP-1964) — Note in Notion says "next week" but due date is today. Steve away until Jun 8. Cadel also sick today. Confirm: is this session happening today or has it been deferred? If deferred, update the Notion task. [Notion created 2026-05-21]
- "Cadel: unpaid invoice flag in Product > Tech" (P1, Today Rank 2) — Cadel is out today with COVID. This may need to be raised via Teams/email to Kieren or wait until Cadel returns tomorrow. [Notion created 2026-05-25]
- AP-2217 EIH handoff — EIH materials sent to Athul via chat. Athul said "got my main blocker out of the way" (26/05) in a different context (HubSpot). Confirm Athul explicitly acknowledged the EIH handoff materials. [Notion In Progress]

---

## Teams signal (structured)

### Mentions of me (1 direct, multiple DMs)
- [DM: Dylan ↔ Ben Payne] Ben Payne @ 2026-05-27T01:10 AEST: "Dylan Cronje, I'm having issues creating a property in frontier for 5854 Gregory Springs Road, Pentland, QLD, 4816 — When I click to search, it's taking me here and stopping me from creating a new property" — Dylan responded, agreed to chat.
- [DM: Dylan ↔ Athul George] @ 2026-05-26T06:34 AEST: "Hey Dylan, its hard to say, still a lot of unknowns, especially navigating hubspot. Could we hop on a call to discuss creating an additional ticket status in hubspot." — Dylan said "Yep let me just get off with Will — we gotta have them both delivered for Friday."

### Decisions (1)
- [Standup channel] Cadel Watson @ 2026-05-26T22:38 AEST: "Hi again - I have COVID - going to take another day off to try to get on top of it. See you all tomorrow" — Cadel absent today (Wed 27/05). Expected back Thursday.

### Questions for me (1 unanswered of 2)
- [DM: Dylan ↔ Ben Payne] Ben Payne @ 2026-05-27T03:05 AEST: "I'm trying to tackle another issue. I'm having. Do you have time to chat? Really struggling with Frontier." — Dylan: "Yep let's chat then." — Status: chat agreed, outcome unknown. Potentially still open.
- [DM: Dylan ↔ Athul] Athul @ 2026-05-26T06:34: HubSpot ticket status blocker question — Dylan sent HubSpot link in standup. Partially answered but blocker may persist.

### Commitments to me (1)
- [DM: Dylan ↔ Athul] Athul George @ 2026-05-26T06:39 AEST: "Awesome, thankyou. I can most likely have them done by Friday, hopefully before then." — deadline: 2026-05-29 (Friday)

### Notable intel
- Ben Payne @ 2026-05-26T06:20: Mentioned "Six Maps" — NSW platform that produces land titles from property addresses. Potentially relevant to EIH/land title automation work.
- Athul @ 2026-05-26T06:58: "I think it's alright for now, got my main blocker out of the way. Will let you know if I need some more clarification." — likely refers to HubSpot link Dylan sent, not EIH handoff.

---

## Jira signal

### Active epics (not Done)
- AP-2330: Project KCT Phase 2 — Designs — updated 2026-05-19
- AP-2367: Referrer Portal Phase 2 — Discovery — updated 2026-05-18
- AP-2342: Sampling Leaderboard v2 — PRD (Steve Le Moenic) — updated 2026-05-18
- AP-1964: Operation KCT Phase 1 — Development (Steve Le Moenic, away until Jun 8)
- AP-2253: Frontier Address Search — Development (Athul George)
- AP-2187: Crediting Workflow Template T1 — Discovery — updated 2026-04-21

### Recently active (Gayathri, past 24h — KCT Phase 2 shipping fast)
- AP-2412: [Frontend] Prospective group sidebar — Development — updated 13:54 AEST 27/05
- AP-2409: Strata shapefile export (confirmed plan/matrix) — **Prod** — updated 08:40 AEST 27/05
- AP-2407: Stratify — Confirm + Unlock & Edit Flow — **Prod** — updated 08:40 AEST 27/05
- AP-2410: Sample point generation — Development — updated 14:00 AEST 26/05
- AP-2411: Extend Python workflow to save geometry to DB — Ready for dev (unassigned) — updated 26/05

**Note: Gayathri shipped AP-2409 and AP-2407 to Prod today with Cadel absent. PM verify these in Prod before EOD? AP-2407 (Stratify Confirm flow) is user-facing.**

### Dylan's open Jira tickets
- AP-2221: Scope solution and identify dependencies/risks — Development
- AP-2220: Draft engineering ticket or brief for review — Ready for development
- AP-2218: Document requirements and acceptance criteria — Development
- AP-2217: Support Will's automation request — PM discovery — Development

### Blocked: 0 items

---

## Confluence signal

- **"CEA creation parcel split vs SOC"** — Updated by Gayathri ~4 hours ago (2026-05-27 ~09:00 AEST). Live doc in Platform space about CEA creation algorithms (parcel split vs SOC raster split). Relevant to KCT Phase 2 and HORIZON. No PM comment needed yet — awareness item.
- Aircall call logs: Ben Payne active making/receiving calls this morning (09:31 AEST inbound, 10:03 AEST outbound). Growth activity normal.

---

## Granola commitments open (this week)

From query across May 18–27 meetings:

| Commitment | Source | Status |
|---|---|---|
| Test HORIZON snapshot exclusions box in staging, feedback to Ben | Standup 25/05 | No signal — overdue |
| Create Jira ticket for Athul: snapshot pipeline staging vs prod investigation | Standup 26/05 | Not yet created |
| Audit HubSpot "Qualified Account" contacts for snapshot requests | Meetings (this week) | Not yet tracked |
| Send Ben the Claude routing prompt for SharePoint prospect reengagement | Meetings (this week) | Ambiguous — not in Notion |
| Query Mark's property exclusions with Caitlyn/Gayathri (43.3ha eligible of ~180ha) | Meetings (this week) | Not in Notion |
| Confirm Athul received and acknowledged EIH handoff materials | Standup 25/05 | In progress — unconfirmed |

---

## Source roll-up

- Notion Today: 6 items (0 blocked, 1 in progress, 5 proposed)
- Notion Overdue: Large set (view query too large to fully parse — carry-over items from April-May exist)
- Granola commitments: 6 open across the week — 3 already tracked in Notion, 3 new
- Jira: 5 active epics, 4 Dylan-assigned tickets, 5 items updated in last 24h (Gayathri KCT shipping)
- Teams: Cadel sick, Ben live blocker, Athul deliverable pressure, Ben Six Maps intel
- Confluence: Gayathri CEA algorithm doc updated (PM awareness); call logs normal
- HubSpot: Not pulled this run (no PM-action-grade stage changes identified from Confluence call signals)

---

## Notion writes this run

### Created (3 new Proposed tasks):
1. "Frontier — Resolve Ben's property creation blocker (5854 Gregory Springs Road, Pentland QLD)" — P1, due 2026-05-27, Today Rank 1
2. "Horizon snapshot — Create ticket for Athul: investigate snapshot pipeline staging vs prod connection" — P1, due 2026-05-27, Today Rank 2
3. "Horizon snapshot — Audit HubSpot 'Qualified Account' stage contacts for snapshot requests" — P2, due 2026-05-28

### Not created (already in Notion):
- "Horizon snapshot — Test exclusions box in staging" (Notion 36b8c08...) — already Proposed, P1, due today
- "EIH handoff — Confirm Athul acknowledged" (Notion 3678c08...) — In progress, AP-2217

---

## Errors / degraded sources

- Notion Overdue view returned >64KB output — saved to temp file, could not parse in this run. Overdue items from April visible in preview (P0 "Ticket review" from 2026-03-19 in Queued status, several April items). **Overdue backlog not fully reconciled this run.**
- Jira Prod query returned >67KB — parsed key titles via bash but full content not available. Top items: AP-2407, AP-2409 (both shipped today by Gayathri).
- chat_message_search returns DMs only (not channel posts) per standing memory rule. Channel signal may be incomplete. No errors reported.
- Granola: list_meetings returned 16 meetings for May 18–22 period. query_granola_meetings successfully synthesised commitments.

