# Apex Morning Briefing — 2026-06-05 (Friday)

**Generated:** 2026-06-05T04:45:00+02:00
**Trigger:** scheduled
**SAST time at run:** 04:45 SAST

---

## Headline

Farm visits are TOMORROW — Frontier properties must be created today, and Joanne has been stuck on Talawunta CPs 1+3 for two days with no response.

---

## TOP 3 PRIORITIES

1. **Frontier — Create Frontier properties for Saturday farm visits** — Time-critical. Farm visits scheduled for Sat 6 June. Properties need to be set up today before EOD. [Granola b64daec9]
2. **Frontier — Confirm Hobbs' field land title requirements (offline capability)** — Hobbs conversation is gating both Starlink sourcing and the Field Maps vs. Frontier decision. Flagged as most time-sensitive in Granola. [Granola 5734e217]
3. **Operating system — Tell Claudia: AgriProve MCP permissions fixed, she can test** — Athul messaged June 4. Claudia has been blocked since June 3 (403 MISSING_SCOPES on custom-object writes). Quick Teams ping. [Teams, Athul George 2026-06-04T03:34]

---

## Slipping items (>2 days, awaiting response)

- **Joanne Curran: Talawunta CPs 1+3 stratification blocker** — asked June 3 (2 days), unanswered. Joe also blocked downstream. [Teams DM 2026-06-03T02:00]
- **Review Kieren's contractor agreement** — committed in 1:1 with Kieren June 3 (2 days ago). Leadership commitment. [Granola e6ab9409]
- **Draft email to Paniri** (direct tag purchase) — committed to Kieren June 3. [Granola e6ab9409]

---

## Teams signal (structured)

### Mentions of / Questions for Dylan (3 unanswered of 4 total)

- [DM] Athul George @ 2026-06-04T03:34: "Hi Dylan, the permissions for the AgriProve MCP have been updated so it should work now. Can you let Claudia know so she can test it again?" — **unanswered**
- [DM] Gayathri Menakath @ 2026-06-03T05:25: "Hi Dylan, can I initiate a Horizon run for that project?" — likely answered (lastModified 05:45)
- [DM] Joanne Curran @ 2026-06-03T02:00: "I managed to get the stratification done for Tallawanta CPs 2+4, but having trouble with projects 1+3. Could you help me troubleshoot?" — **unanswered, 2 days old**
- [DM] Ben Payne @ 2026-06-03T00:48: "Hobbs had a visit yesterday with Andrew Scott who has two properties. What's the process for one contact with two properties in Frontier?" — addressed in 1:1 meeting June 3

### Decisions (from Granola this week)

- [Granola] EIH: Dual-track approach — stopgap Claude skills (immediate) + proper in-app integration (separate). [962aa94e]
- [Granola] Field Maps (offline) preferred for Hobbs' fieldwork land title collection — pending confirmation from Hobbs. [5734e217]
- [Granola] Pre-create Frontier properties before farm visits (Ben's responsibility, supported by Dylan). [b64daec9]
- [Granola] Disable CET export during progress steps, enable only at sample points stage. [d21e9cb8]
- [Granola] Maintain old stratification page as "Manual Stratification" alongside KCT workflow. [808d57ea]

### Commitments to Dylan (3)

- [Granola] Athul: AgriProve MCP to link HubSpot objects now live in Prod (June 3) — permissions fixed June 4
- [Granola] Gayathri: Assigned to fix project sorting/assignment bug (carbon projects reshuffling numbers)
- [Granola] Cadel: Lab data audit system (audit logging + Claude validation vs. SharePoint) to be deployed this sprint

### Channel freshness

- DM chats: last active 2026-06-04T08:07 (Dylan Jones — EIH consent packages)
- Note: `chat_message_search` covers DMs only. Channel posts not included in this scan.

---

## Active Jira epics (non-Done)

| Epic | Status | Assignee | Last updated |
|---|---|---|---|
| AP-2458 — HORIZON v2 data pipeline | PRD | Cadel Watson | 2026-06-03 |
| AP-2415 — CRS/GIS correctness remediation | Development | (unassigned) | 2026-06-02 |
| AP-2367 — Referrer Portal Phase 2 | PRD | Steve Le Moenic | 2026-06-02 |
| AP-2446 — Auditable lab result ingestion | Write stories | Cadel Watson | 2026-06-02 |
| AP-2330 — Project KCT Phase 2 | Designs | (unassigned) | 2026-05-19 |
| AP-2187 — Crediting Workflow Template T1 | Discovery | (unassigned) | 2026-04-21 |

**Dylan's open tickets:** AP-2413 (Build Stormboy Sales Intelligence Tool — Development), AP-2217/2218/2220/2221 (EIH / Will automation discovery — Development/Ready for dev, from April)

**Blocked items:** 0 in Jira. Key blockers are in Granola/Teams (Talawunta stratification, EIH architecture decision, CERS, MCP annual reviews association writes).

---

## Open blockers flagged in meetings this week

1. **Talawunta/Crown J: CPs 1+3** — "not using latest boundary" error, blocking HORIZON runs and KCT stratification. Joe and Joanne blocked.
2. **EIH architecture decision** — Cadel: in-app vs. standalone cannot be delayed. MCP-bridge will "implode" at scale. DJ/Joe demo June 10 is the validation gate.
3. **Field land title offline capability** — Field Maps vs. Frontier decision pending Hobbs confirmation.
4. **CERS tag supply** — won't negotiate minimum order. Halter partnership (replacement) in early conversation.
5. **MCP annual review association writing** — Claudia's automation blocked: can create annual review objects but cannot write associations to deals/projects.
6. **Project sorting bug** — carbon projects reshuffling numbers between sessions. Gayathri assigned to fix.

---

## Source roll-up

- Notion carryover: 0 tasks in Today view, Overdue view parse not available (file too large for inline read)
- Granola open commitments: 10+ across 20 meetings this week (June 1–4) — 10 newly created in Notion
- Teams: 4 messages to/mentioning Dylan (3 unanswered); DM-only scan
- HubSpot: 1,340 total deals in pipeline — no stage changes requiring specific PM action identified
- Confluence: 15 pages updated — all Aircall call logs from Claudia/Ben (Growth space); no PRD/product docs updated
- Jira: 6 active epics, 5 Dylan-assigned tickets, 0 Blocked

---

## Notion writes this run

### Created (10 new Proposed tasks):

1. Frontier — Create properties for Saturday farm visits (URGENT — tomorrow) [P0, rank 1] — `3758c08e-b28f-8199-a3d6-e009a0dcb3da`
2. Operating system — Tell Claudia: AgriProve MCP permissions fixed [P0, rank 2] — `3758c08e-b28f-8192-9f68-f91a3cfae1e3`
3. Frontier — Confirm Hobbs' field land title requirements [P0, rank 3] — `3758c08e-b28f-8140-a433-f2ed057ee8c2`
4. Frontier — Triage Joanne's stratification blocker (Talawunta CPs 1+3) [P1, rank 4] — `3758c08e-b28f-8199-a107-f72d19bf3661`
5. Operating system — Review Kieren's contractor agreement + schedule follow-up [P1, rank 5] — `3758c08e-b28f-81fd-b5c7-cc7523cc9483`
6. Operating system — Draft email to Paniri re: direct tag purchase [P1, rank 6] — `3758c08e-b28f-8163-a996-f225102ec0bd`
7. Frontier — EIH demo prep: restore dashboard + extend HubSpot MCP whitelist [P1, rank 7] — `3758c08e-b28f-8198-afe4-cbd3314e81cd`
8. Bugs — Raise bug tickets: blank page HORIZON + overlapping geometry [P2, rank 8] — `3758c08e-b28f-8118-a064-e8d471906aa3`
9. Horizon — Communicate model v2 rollout approach to ops team [P2, rank 9] — `3758c08e-b28f-8133-89a5-e8d922da2681`
10. Stormboy — Audit HubSpot tickets older than 7 days [P2, rank 10] — `3758c08e-b28f-81f6-8f5a-f6fc69ef0468`

### Updated: 0 (Notion Today view was empty; Overdue parse not available this run)

---

## Errors / degraded sources

- **Notion Overdue view**: result was 77KB, exceeds context limit. Could not parse carryover. Dedup against Overdue tasks was not performed — check Notion manually for duplicates.
- **Teams**: `chat_message_search` covers DMs and group chats only — **channel posts are not scanned**. This is a known gap (standing rule: channels are the primary signal source for team updates). Completion signals for channel-based tasks may be missed.
- **Jira recently updated (last 24h)**: result was 92KB, exceeds context limit. Summarised from epics view instead.
- **Jira Prod status**: result was 55KB, exceeds context limit. Not summarised this run.
