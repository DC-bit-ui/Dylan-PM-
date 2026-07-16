# Apex Morning Briefing — 2026-07-14 (Tuesday)

**Generated:** 2026-07-14T02:45:00Z
**Trigger:** scheduled
**SAST time at run:** 04:45 SAST

---

## Headline

HORIZON snapshot queues are broken (AP-2632, assigned Athul) — blocks all snapshot generation while Morton Co. (160,000 ha) is a live hot prospect who engaged over the weekend.

---

## TOP 3 PRIORITIES (Stack A — Mine)

1. **Bugs — Triage HORIZON snapshot queues not starting (AP-2632)** — New bug Jul 13, Athul investigating. ALL snapshot generation blocked. AP-2625 (queue-starvation, unassigned) likely root cause — Cadel commented Jul 13 suggesting Horizon 2.0 may eliminate these heavy jobs entirely. Check Athul's ETA + get AP-2625 assigned. [AP-2632] [Notion: 39c8c08eb28f81e8a891ef9770317ab6]

2. **Horizon snapshot — Confirm Morton Co. (160,000 ha) turnaround time** — 7 days old (due Jul 7). Ops meeting Jul 13 confirms Kenneth Drysdale engaged with mapping tool over the weekend — prospect is HOT. Ben blocked on setting expectations with Kenneth Drives. Reply to Ben now. [Notion: 3958c08eb28f81eda24ce77169ef39f3]

3. **Operating system — ECP cost reconciliation analysis for Will/Matthew/Steve** — 4 days overdue (due Jul 10). Will Frecheville explicitly requested via DM Jul 9. Pull Jira timeline of marketplace activities since ECP signing, reverse-engineer ticket sizing, deliver. [Notion: 3998c08eb28f81358bdcc8239e5e6114]

---

## Stack B — Complement (3 leverage opportunities)

1. **AP-2625 (SAGA queue-starvation, unassigned) — assign before it falls through** — Cadel Watson commented Jul 13 with a fix direction ("Horizon 2.0 won't use SAGA/GRASS — heavy jobs may go away naturally"). Root cause of AP-2632. Unassigned and marked Ready for Dev. Dylan's leverage: get it assigned to Athul or Gayathri, or align with Cadel on whether Horizon 2.0 supersedes the patch. [AP-2625]

2. **Farm Draw v2 staging review — unblocks Gayathri PR + parcel renumbering** — Athul confirmed Jul 13 (Teams DM): property name update on Staging; draw tool fixes in PR waiting for Gayathri's approval. AP-2624 in Staging, AP-2629 in Code Review. Dylan's review unblocks the parcel renumbering push to prod and the Cracour project fix. [AP-2624, AP-2629] [Notion: 3988c08eb28f81839058e95279563005]

3. **Snapshot generator native rebuild: 4 tickets created (AP-2619–2621, AP-2614) — all To Do, unstarted** — Big new work parcel (PRD, Design, Dev handoff, Combined snapshot Canva pages). These are Dylan-assigned with no movement yet. The PRD (AP-2619) is the gate for everything else. Consider blocking 90 min today to start the PRD structure. [AP-2619–2621, AP-2614]

---

## Slipping items (>3 days, low movement)

- **Cadel knowledge extraction** (Tasks #67, #77) — P0, due Jun 30 / Jul 2. CRITICAL: Cadel IS back — he commented on AP-2625 on Jul 13. Book the session TODAY while he's available.
- **Farm Draw Tool v2 epic in Jira** (Task #43) — P1, due Jul 9. Athul has AP-2629 (testing updates) but the epic (AP-2616) exists — confirm Athul is formally assigned.
- **Horizon — DROVER x HORIZON workshop** (Task #62) — P0, due Jul 3. Cadel back; book immediately.
- **Review Kieren's process docs + client fitness scoring matrix** — P1, from Granola Jul 6-10. Not yet in Notion. Note: Kieren is on LEAVE this week (confirmed Ops meeting Jul 13 — absent). Task #41 ("get key decisions from Kieren") is blocked by his leave.
- **Share combined snapshot structure with Daniel** (Task #44) — P1, due Jul 9. Daniel was OOO but may be back today.

---

## Teams signal (structured)

**Rate limit hit:** chat_message_search scanned 33-40 of 46 chats before hitting Microsoft Graph 429. Results are partial — channel posts NOT covered.

### Mentions of me (1 confirmed)
- [DM: Athul George] Athul @ 2026-07-13T06:48Z: "Hey Dylan, updating a property name should be available to test on Staging. I have added the draw tool fixes in another PR, waiting for Gayathri to approve before merging to Staging, will let you know. The other draw tool changes for the updated HubSpot properties..." — unanswered as of this run

### Decisions (0 confirmed via search)
- Teams scan was channel-blind (DMs only per known limitation). Decisions likely in Product and standup channels — not captured this run.

### Questions for me (1 — unanswered)
- [DM: Athul George] Jul 13 — implicit ask re: HubSpot properties for the draw tool (AP-2631 "Add draw tool HubSpot integration for water credits" in Development). Dylan's confirmation still needed on the 2 new HubSpot properties.

### Commitments to me (1)
- [DM: Athul George] Jul 13: "will let you know" on draw tool fixes merging to Staging — deadline: pending Gayathri PR approval

### Channel freshness
- DMs: Athul George active Jul 13 06:48Z
- Channels: not scanned (rate limit)

### Teams pull errors
- `chat_message_search` returned 429 rate limit mid-scan on two queries. Channel posts not covered — results are partial.

---

## Confluence signal

- **260713 - Operations Meeting** (Will Frecheville, Jul 13): Castle Hill at solicitor stage; Rain KCT at solicitor stage; Kenneth Drysdale (Morton Co, 160,000 ha) engaged with mapping tool over the weekend. Kieren on leave. Jo Curran away. Matthew, Steve, Will, Ben, Claudia present.
- **Week of 6 Jul 2026 – Daniel & Adeline** (Daniel, Jul 13): HubSpot attribution bug on new map-tool landing page still open. Action items from week still unticked.
- All other Confluence updates are Aircall call logs (Growth space) — no PM action.

---

## Jira signal

**Active epics (18):** All in Discovery/PRD/Designs. Key:
- AP-2609 Modular Snapshot Generator (Dylan, Discovery)
- AP-2608 Verterra Collaboration (Dylan, Discovery)
- AP-2616 Farm Map Tool V2 (Unassigned, Discovery)
- AP-2554 KCT Automation Workflow Phase 3 (Designs)

**Dylan's assigned tickets (17):** 11 new To Do (snapshot/Verterra cluster Jul 7-9). 4 older In Progress (AP-2522, AP-2413, AP-2217, AP-2221).

**Recent 24h (11 updates):**
- AP-2632 [BUG] Investigate why horizon snapshot queues are not starting — Development, Athul George
- AP-2630 [BUG] Fix unreliable status badge for referrer table — Development, Athul George
- AP-2629 [BUG] Farm Draw v2 testing updates — Code Review, Athul George
- AP-2622 [BUG] Bastion vRack down after OVH reboot — Code Review, Gayathri
- AP-2631 Add draw tool HubSpot integration for water credits — Development, Athul George
- AP-2624 Frontier — add quick edit-property-name function — Staging, Athul George
- AP-2625 Fix calculate_saga_predictors queue-starvation — Ready for Dev, **Unassigned** (Cadel commented)
- AP-2627 Updates to pdf outputs — Ready for Dev, **Unassigned**
- AP-2557 [KCT] File Import — Append Exclusion Zone shapefiles — Staging, Gayathri
- AP-2574 [KCT] Remove project from configuration — Development, Gayathri
- AP-2628 Add frontend tests — Code Review, Gayathri

**No blocked tickets** in last 24h Jira pull.

---

## HubSpot signal

- 1,227 active deals. No stage changes requiring PM action.
- Lindooga - Jacob Wright closing Jul 16 (2 days) — Ben's deal, no PM action.
- Rosemont, John Dowling Hillside/Sequoia, Talkook all recently touched (normal Growth activity).

---

## Source roll-up

- Notion carryover: 100 overdue tasks (0 due Today — "Today" view was empty). 18 P0, 43 P1, 16 P2, 6 P3.
- Granola: 17 meetings Jul 6-10 scanned. 20+ open commitments identified. Multiple untracked items (ECP reconciliation, Kieren process docs, Verterra integration).
- Teams: 3 DMs found (rate-limited at 33-40/46 chats). Key: Athul DM Jul 13 re Farm Draw staging. Channel posts not scanned.
- Jira: 18 active epics, 17 Dylan-assigned tickets, 11 recent updates (4 bugs). AP-2632 is the critical new item.
- Confluence: 15 pages updated. Key: Ops Meeting Jul 13 (Morton Co. hot), Daniel/Adeline week.
- HubSpot: 1,227 deals checked, no PM-action stage changes.

---

## Notion writes this run

**Created:**
- "Bugs — Triage HORIZON snapshot queues not starting (AP-2632)" — P0, Today Rank 1 [page: 39c8c08eb28f81e8a891ef9770317ab6]

**Updated:**
- Morton Co. turnaround time (3958c08eb28f81eda24ce77169ef39f3) — Priority upgraded to P0, Today Rank 2, Next step refreshed with Ops meeting signal
- Heat map staging review (3988c08eb28f81839058e95279563005) — Today Rank 3, Next step refreshed with Athul's Teams confirmation
- ECP cost reconciliation (3998c08eb28f81358bdcc8239e5e6114) — Today Rank 4, Next step refreshed

## Jira comments added: 0

---

## Errors / degraded sources

- **Teams channel posts**: `chat_message_search` only covers DMs (known limitation per memory). All channel decisions and @mentions in product channels not captured this run.
- **Teams rate limit**: Hit Microsoft Graph 429 mid-scan on two separate queries (scanned 33/46 and 40/46 chats). Partial DM coverage.
- **Notion "Today" view**: returned 0 results — no tasks have due date set to 2026-07-14. Overdue view confirmed 100 tasks.
- **Jira "Prod status" + ROAD queries**: not run this cycle to stay within context budget — covered by the 24h recent updates query.
