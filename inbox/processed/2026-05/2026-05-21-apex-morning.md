# Apex Morning Briefing — 2026-05-21 (Thursday)

**Generated:** 2026-05-21T04:45:00+02:00
**Trigger:** scheduled
**SAST time at run:** 04:45 SAST

---

## Headline

Steve left on leave today — LawrieCo workshop timeline (mid-June) is at risk unless dev coverage for AP-2361–2366 is assigned to Cadel this morning.

---

## TOP 3 PRIORITIES

1. **Frontier — Assign LawrieCo demo network to Cadel (AP-2361–2366)** — Steve left TODAY. 6 tickets in Ready for dev, unassigned. LORICO confirmed highest-priority workstream in Cadel 1:1 (20 May). Workshops start mid-June — ~4 weeks. [AP-2366](https://agriprove.atlassian.net/browse/AP-2366)
2. **Operating system — SLT 19 May: Total docs input due Kieren COB TOMORROW (Fri 22 May)** — Product team costs input needed. Also: Ceres Tag enquiry (await Kieren), Maki Planet commercial proposal awareness. 2 days carried. Deadline is TOMORROW. [Notion](https://www.notion.so/3658c08eb28f814b8658ffaf6d629d2c)
3. **Stormboy — Deliver v1 sales intelligence system to Will + Kieren** — Committed May 14, 7 days ago. Escalated per rule (>3 days, was not in Notion). Will + Kieren explicitly waiting. [Notion](https://www.notion.so/3678c08eb28f8103bd85ee0ee499aee0)

---

## Stack A — Mine (Top 3)

| Rank | Priority | Task | Source | Age |
|---|---|---|---|---|
| 1 | P0 | Assign LawrieCo demo dev coverage to Cadel (AP-2361–2366) | Notion carryover + Granola 20 May | 2 days carried; Steve left today |
| 2 | P0/P1 | Total docs COB tomorrow + Ceres Tag response | SLT Confluence 19 May | 2 days; deadline tomorrow |
| 3 | P1→P0 | Deliver v1 Stormboy sales intelligence system | Granola 14 May | 7 days — escalated |

## Stack B — Complement (Top 3)

| Score | Task | Leverage signal |
|---|---|---|
| High | AP-2373 Schedule 2 Amber cohort — Discovery, no PM, Cadel deadline end of week | +2 open Q; Dylan's PM input accelerates scope definition for Total docs submission |
| High | KCT operationalisation with Joe + DJ — Steve away, adoption at risk | +2 scope ambiguity; preventing KCT dev value from being unused |
| Medium | AP-2372 WA HORIZON investigation ("huge miss") — S2 cohort confidence dependency | +1 decision-needed; Cadel/Will on it but PM scoping adds leverage |

---

## Slipping items (>3 days, low movement)

- **Stormboy V1 delivery** — 7 days since May 14 commit — NEW TASK CREATED in Notion
- **EIH tool restructure to hub-and-spoke** — 7 days since May 14 commit — NEW TASK CREATED
- **Frontier contact click redirect bug** — 7 days since May 14 commit — NEW TASK CREATED
- **SLT 19 May Total docs** — 2 days, deadline tomorrow — TODAY RANK UPDATED to 2
- **LawrieCo demo network (P0)** — 2 days, Steve left today — TODAY RANK UPDATED to 1

---

## Teams signal (structured)

**⚠️ FULLY DEGRADED — teams_pull_errors:**
- `chat_message_search` returns no results: tool only queries DMs; all channel posts inaccessible
- Known limitation per memory/feedback_teams_channels_no_chat_search.md
- All four structured buckets (mentions, decisions, questions, commitments) could not be populated
- Workaround: channel scanning requires a different tool — not available this session

### Mentions of me (0 — degraded)
_No data — DMs only._

### Decisions (0 — degraded)
_No data — DMs only._

### Questions for me (0 — degraded)
_No data — DMs only._

### Commitments to me (0 — degraded)
_No data — DMs only._

---

## Granola — key findings (past 7 days, 30 meetings across May 11–20)

### Last week (May 11–15) — open commitments not previously in Notion (now created):
- Restructure EIH tool to hub-and-spoke model → Will/Kieren
- Stormboy V1 delivery → Will/Kieren
- Frontier contact click redirect bug investigation → Ben
- Set up snapshot automation review with Daniel
- Record Loom videos: contact merging + company linking → Stormboy team
- Contractor transition: establish sole trader structure → Karen/Ciaran

### This week (May 18–20) — open commitments now created:
- Land title API vendor email (questions 1, 2, 7 only) → Carol
- KCT operationalisation: hand-hold Joe + DJ adoption
- Sit with Joe next week for hands-on KCT session
- Loom tutorials: property creation + snapshot request workflows → Ben/field team
- InfoTrack alternatives exploration + post in channel

### Key decisions from this week:
- Steve gone → KCT operationalisation is top priority over new dev
- LORICO/LawrieCo demo confirmed highest-priority workstream (Workstream A)
- React to be used from start for new apps going forward
- James Merbon's account back to Ben (marketing contact only, no entity yet)
- Calls at noon; meetings shifted to 2pm

### Active blockers raised this week:
- Exclusion zones API broken (buildings API permissions issue) — blocks KCT workflow
- Claude API issues blocking snapshot generation
- CERES TAG customer complaints requiring active management
- EIH API 90-day DND timeline creating operational challenges
- 120+ manual onboards from Claudia stuck (password expiry)
- Towan Park not in staging, blocked in production
- Demo farm setup blocked — needs 5 min from CADL to create demo group

---

## Jira snapshot (live — 2026-05-21)

**Active epics (non-Done):**
| Epic | Status | Assignee | Last updated |
|---|---|---|---|
| AP-2330 Project KCT Phase 2 | Designs | Unassigned | 19 May |
| AP-2373 Submit Amber Schedule 2 cohort | Discovery | Unassigned | 19 May |
| AP-2367 Referrer Portal Phase 2 | Discovery | Unassigned | 18 May |
| AP-2342 Sampling Leaderboard v2 | PRD | Steve Le Moenic | 18 May |
| AP-1964 Operation KCT Phase 1 | Development | Steve Le Moenic | 7 May |
| AP-2253 Address search + property linkage | Development | Athul George | 6 May |
| AP-2187 Crediting Workflow Template T1 | Discovery | Unassigned | 21 Apr |

**Dylan's assigned tickets (4 open):**
- AP-2217 Support Will's automation request (EIH) — Development
- AP-2221 Scope solution + identify dependencies/risks — Development
- AP-2218 Document requirements + acceptance criteria — Development
- AP-2220 Draft engineering ticket/brief for review — Ready for dev

**Blocked:** 0 items blocked across the project.

---

## HubSpot signal

1,325 deals total. Recently modified (today): bulk update across Glenavon/Silver Hills Holland group (crediting pipeline), Weatherall CP 1 & 2 (close date 9 Jun — active), Killawarra (close date 2 Jun). No clear PM action items from HubSpot — crediting pipeline activity is ops-led.

---

## Confluence — last 24h

7 pages updated — all Aircall call transcripts in AgriProve Growth space (Ben Payne + Claudia Bryant outbound calls). Normal Stormboy activity. No PRD or epic doc changes requiring PM attention.

---

## Source roll-up

- Notion carryover (Today view): 8 items, all Proposed, all carried from ≥19 May
- Notion Overdue view: unable to read (path outside session connected folders) — [DEGRADED]
- Jira: 7 active epics, 4 Dylan-assigned tickets, 0 blocked
- Granola open commitments: 30 meetings across May 11–20; 10+ actionable commitments surfaced across last week + this week; 3 already-slipping (>3 days)
- Teams: 0 mentions / 0 decisions / 0 questions / 0 commitments — FULLY DEGRADED (DMs only)
- HubSpot: 1,325 deals, bulk activity on crediting pipeline — no PM actions
- Confluence: 7 pages — Aircall transcripts only, no PM-relevant doc changes

---

## Notion writes this run

**Created (8):**
- Stormboy — Deliver v1 sales intelligence system to Will + Kieren → [3678c08eb28f8103bd85ee0ee499aee0](https://www.notion.so/3678c08eb28f8103bd85ee0ee499aee0)
- Operating system — KCT operationalisation: hand-hold Joe + DJ through adoption → [3678c08eb28f81138604d06f9a782d30](https://www.notion.so/3678c08eb28f81138604d06f9a782d30)
- Frontier — Restructure EIH automation tool to hub-and-spoke model → [3678c08eb28f8175b2fec60b74fc8a90](https://www.notion.so/3678c08eb28f8175b2fec60b74fc8a90)
- Operating system — Set up sole trader structure for contractor transition → [3678c08eb28f81828ec6dc6f7e778521](https://www.notion.so/3678c08eb28f81828ec6dc6f7e778521)
- Operating system — Send simplified land title API vendor email → [3678c08eb28f81e4b5f0c2a66fee11af](https://www.notion.so/3678c08eb28f81e4b5f0c2a66fee11af)
- Frontier — Create Loom tutorials: property creation + snapshot workflows → [3678c08eb28f8108974afd130283bdfb](https://www.notion.so/3678c08eb28f8108974afd130283bdfb)
- Frontier — Investigate and fix contact click redirect bug → [3678c08eb28f81a68cebf4fe7af388be](https://www.notion.so/3678c08eb28f81a68cebf4fe7af388be)
- Operating system — Sit with Joe for hands-on KCT session next week → [3678c08eb28f81c3a88bdff1aa84e1a8](https://www.notion.so/3678c08eb28f81c3a88bdff1aa84e1a8)

**Updated (2):**
- Frontier — URGENT LawrieCo demo network (Today Rank → 1, Next step updated) → [3658c08eb28f81a78f2be97ac593aab2](https://www.notion.so/3658c08eb28f81a78f2be97ac593aab2)
- Operating system — SLT 19 May outputs (Today Rank → 2, Next step updated) → [3658c08eb28f814b8658ffaf6d629d2c](https://www.notion.so/3658c08eb28f814b8658ffaf6d629d2c)

---

## Errors / degraded sources

1. **Teams channels — FULLY DEGRADED.** `chat_message_search` only queries DMs; channel posts (where team signals live) are inaccessible. All four structured buckets empty. This is a persistent session-level limitation. No workaround available without a channel-aware tool.
2. **Notion Overdue view — path inaccessible.** Persisted output file from the query was written to a path outside the session's connected folders, could not be read back. Today view was fully read (8 items). Overdue items likely exist but count is unknown this run.
3. **Jira recently-updated query — output exceeded token limit.** Saved to disk; jq extraction returned no output (possible jq path issue on this sandbox). Recently-updated signal is therefore missing from this brief. Epics + Dylan's tickets were successfully extracted via separate queries.
