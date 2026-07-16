# Apex Morning Briefing — 2026-07-13 (Monday)

**Generated:** 2026-07-13T04:00:00Z  
**Trigger:** scheduled  
**SAST time at run:** ~06:00 SAST

---

## Headline

Ben flagged a prod queue visibility issue this morning — a large property submitted via the mapping tool is not showing in the snapshot queue, with 7 others queued. Triage with Ben is the top priority before standup.

---

## TOP 3 PRIORITIES

1. **Horizon snapshot — Investigate: large property mapping tool request not visible in queue** — Ben DM 01:20 AEST: 7 snapshots queued + one mapping tool submission missing from queue (water project property). Dylan already ack'd (03:34). Triage at Stormboy Standup 07:30 SAST. [Notion: 39c8c08eb28f81b9aa54dc9468a84fc3]
2. **Frontier — Reply to Athul: confirm HubSpot properties for 2 new form field additions** — 3 days unanswered, blocking dev. Escalated to P0. [Notion: 3998c08eb28f81ff9504dd982b710e3a]
3. **Horizon snapshot — Test Farm Draw Tool v2 on staging** — Gayathri has it ready. Gates prod push. Test enterprise type question + map drawer prototype. [Notion: 3998c08eb28f81bb8422dcac7dff54f6]

---

## Slipping items (>3 days, low movement)

- **Operating system — ECP cost reconciliation for Will/Matthew/Steve** — 3 days old, Proposed, not actioned. Will is covering ECP for Kieren (on leave). Time-sensitive.
- **Horizon snapshot — Morton Co. (160,000 ha) snapshot turnaround time for Ben/Kenneth** — 4+ days old, still Proposed. Ben needs this to set expectations with prospect. Related to today's queue discussion.
- **Operating system — Book afternoon session with Steve** — ✅ DONE-ACK: "SLM:DC 1:1 PM alignment" calendar invite confirmed for 2026-07-14 07:30 SAST. Recommend marking done.
- **Operating system — Create Farm Draw Tool v2 epic** — ✅ DONE-ACK: AP-2616 "Farm Map Tool V2" exists in Jira. Recommend marking done.

---

## Teams signal (structured)

### Mentions of me (0 confirmed @mentions in scan window)
- Scan via chat_message_search returned DMs only; channel @mentions not captured in this run.

### Decisions (0 confirmed in scan window)
- No explicit decisions captured.

### Questions for me (2 unanswered of 2)
- [DM Ben → Dylan] Ben Payne @ 01:20 AEST: "Let me know when you can chat. There are 7 snapshots in the queued and the massive property that was interested in water project has requested one off the mapping tool. I can't see that one in the queue though" — answered: yes (Dylan replied 03:34)
- [DM Hobbs → Dylan] Hobbs Magaret @ 01:48 AEST: "Also ask me about the 'similar projects map in the snapshot'" — answered: no — (no thread response found)

### Commitments to me (0 in scan window)
- None captured.

### Channel freshness
- DM activity confirmed active as of 03:34 AEST today.
- Channel scan limited (chat_message_search covers DMs, not full channel history).

---

## Jira updates (last 24h)

- **AP-2557** [KCT] File Import — Append EZ/EAA/CEA shapefiles (Staging, Gayathri) — updated 13:07 AEST today
- **AP-2628** Add tests (Ready for dev, Gayathri) — updated 13:05
- **AP-2627** Updates to PDF outputs (Ready for dev, unassigned) — updated 12:37
- **AP-2625** Fix calculate_saga_predictors queue starvation — Cadel commented 11:47: "Option A makes sense as first remedy. Ideally Horizon 2.0 wouldn't use SAGA/GRASS at all." Decision on implementation approach needed.

---

## Confluence (last 24h)

- **HORIZON Snapshot Rebuild — Phase 1 slicing (proposal for comment)** — Gayathri commented Jul 10 (unread). She proposed splitting slice 1 into backend/frontend. Dylan's response unblocks engineering approach.
- **Week of 6 Jul 2026 — Daniel & Adeline** — created today (ops/marketing recap, low PM signal).
- Sales call logs (Aircall auto-sync) — no PM action required.

---

## Calendar today (SAST)

- 07:00 SAST — New Stand-up (Steve, Gayathri, Athul, Cadel) — likely already happened at run time
- 07:30 SAST — Stormboy Standup (Dylan organiser: Ben, Hobbs, Will, Claudia, Daniel, Cadel, Kieren)
- 09:30 SAST — R&D calendar
- **Tomorrow 05:00 SAST** — Town Hall (all-hands, Kieren organising)
- **Tomorrow 07:30 SAST** — SLM:DC 1:1 PM alignment (Dylan + Steve) — prep agenda today

---

## Source roll-up

- Notion carryover: 8 in Today view (all Not started/Proposed); ~40+ Overdue (mix of recent relevant + stale backlog from Mar-Apr)
- Granola: No meetings recorded this week yet (briefing runs before Mon standup). Last week = 18 meetings Jul 6-10, carryover items already in Notion from EOD reconciliation.
- Teams: 2 DMs (Ben + Hobbs), Cadel in standup meeting chat. Channel posts not captured (chat_message_search limitation — DMs only).
- HubSpot: No stage changes flagged in scan window. Sales activity active (Ben calls, Stormboy).
- Confluence: Gayathri's Phase 1 slicing comments flagged (unread, PM action needed).

---

## Reconciliation findings

| Task | Signal | Verdict |
|---|---|---|
| Create Farm Draw Tool v2 epic | AP-2616 "Farm Map Tool V2" exists in Jira | ✅ Done-ack — mark done |
| Book afternoon session with Steve | "SLM:DC 1:1" calendar event 2026-07-14 07:30 SAST confirmed | ✅ Done-ack — mark done |
| Reply to Athul: HubSpot properties | No reply signal found; Athul still waiting | 🟡 Still-open (escalated to P0) |
| ECP reconciliation for Will | No Teams/Outlook signal | 🟡 Still-open |
| Morton Co. turnaround time | Ben still referencing this morning | 🟡 Still-open |
| Get Kieren decisions before leave | Kieren now away (jul 14 Town Hall he's back briefly) | ❓ Ambiguous — may have been covered in Jul 9 1:1 |

---

## Notion writes this run

### Created:
- [Horizon snapshot — Investigate large property mapping tool request not visible in queue (Ben flagged today)](https://app.notion.com/p/39c8c08eb28f81b9aa54dc9468a84fc3) — P0
- [Horizon snapshot — Review Gayathri's Phase 1 slicing comments on Confluence](https://app.notion.com/p/39c8c08eb28f81e39064d3d41411abd0) — P1
- [Operating system — Prep agenda for Steve 1:1 tomorrow (SLM:DC PM alignment)](https://app.notion.com/p/39c8c08eb28f81e09ae8ed1add3254bd) — P1
- [Horizon snapshot — Discuss 'similar projects map' concept with Hobbs](https://app.notion.com/p/39c8c08eb28f8167baf3ceb3d82f980e) — P2

### Updated (Today Rank + Next step):
- Reply to Athul: HubSpot properties → Today Rank 2
- Test Farm Draw Tool v2 on staging → Today Rank 3
- Confirm HORIZON Profile heatmap with Hobbs → Today Rank 6

---

## Errors / degraded sources

- **Jira epic query** failed on first attempt (server timeout), succeeded on retry with fewer fields
- **Teams channel posts** not captured — chat_message_search scans DMs only (known limitation; channel scan requires separate channel-specific queries). @mentions in channels may be missed.
- **Granola query** returned no results for "last_week" — possible sync gap for the Jul 6-10 meetings already listed. Action items from those meetings were captured in prior EOD reconciliation runs and are already in Notion.
