# Apex Morning Brief — 2026-06-18
**Run time:** ~04:45 SAST (completed ~05:30 SAST — context overflow mid-run, resumed from summary)
**Status:** partial — Teams channel posts inaccessible (chat_message_search DM-only); Teams rate-limited on ~3 searches (30/48 DM chats scanned); Jira open-tickets response overflowed (AP-2522 visible, full list partial)

---

## Stack A (Mine — cap 3)

| Rank | Item | P | Source |
|------|------|---|--------|
| 1 | Reply to Steve: LawrieCo HORIZON dashboard outputs not showing — Harry Clark workshops likely this week | P0 | Granola + Notion carryover (6 days) |
| 2 | Reply to Cadel: Drawing Tool sign-up edge cases + tokenised URL (40+ hrs unanswered in Product > Epics, blocks build start) | P0 | Notion carryover |
| 3 | KCT Light vs Full: confirm scope with Will + German — SLT A3 deadline Jun 19 escalates this | P0 | Notion carryover (5 days) + Confluence SLT Jun 16 |

**Stack A has 3 P0s → Stack B compressed per suppression rule**

---

## Stack B (Complement — suppressed)

3 complement opportunities available — SLT performance framework rollout (Kieren running per-seat 1:1s, Dylan's coming), KCT conversion seat unassigned (A3 deadline Jun 19, PM implications for AP-1964), John Monaghan callback created as P1 task. Ask if interested.

---

## New discoveries

- **Confluence (SLT Long Form Jun 16):** Performance framework rolling company-wide; individual 1:1s with line managers to set per-seat metrics. Cash discretionary hold extended through July. KCT conversion seat unassigned — URGENT by Jun 19.
- **Confluence (Aircall log Jun 17):** John Monaghan (McLachlan CP) called Dylan at 13:38 AEST — "Can you give me a call when you're free." No Notion task existed.
- **Jira:** 5 new sub-tasks under AP-2514 (Drawing Tool) moved to Ready for Dev Jun 17: AP-2525, AP-2526, AP-2527, AP-2528, AP-2529. AP-2524 (Referrer Portal data widgets) in Staging (Athul). AP-2523 (Daily bugs) in Development (Gayathri).
- **Teams DMs:** Ben Payne x2 DMs Jun 17 ("need you for a quick minute") — likely resolved after the Jun 17 1:1 re Hobbs farm visit. Flagged ambiguous.
- **HubSpot:** New deal Tom Johnson created Jun 16 (dealstage 64066367). Routine — no PM action.

---

## Granola (past 7 days — key open actions)

22 open action items extracted. Top unresolved:
- Drawing Tool UX requirements (Cadel) — 2+ weeks overdue
- Account-linking open question (Cadel)
- Share playful design with Dan + request landing page copy
- Circulate requirements doc to Cadel, Ben, Daniel
- EIH flow wireframes for Cadel
- DND API cost decision — post in Teams
- KCT flow redesign with Jo

---

## Notion writes

- **Created:** 3 tasks
  - Operating system — Return John Monaghan's call (P1, due today)
  - Operating system — Read SLT Long Form + prepare for performance framework 1:1 (P2, due today)
  - Frontier — AP-2527: Define parcel-correction workflow with Cadel (P1, due today)
- **Updated:** 3 tasks (Today Rank refresh + Next step for Steve/Cadel/KCT P0 carryovers)

---

## Errors / blindspots

- **Teams channel posts:** `chat_message_search` covers DMs only — all Product > Epics channel posts (Cadel Drawing Tool questions Jun 15–16) are not accessible via this tool. Cadel's sign-up edge case + tokenised URL questions inferred from Notion task context, not live channel pull.
- **Teams rate limit:** 429 TooManyRequests on ~3 DM search queries (~30/48 chats scanned). Missed: "question blocked issue", "performance framework monthly", "update thoughts?" searches partial.
- **Jira Dylan tickets:** Response overflow (49.8KB). AP-2522 (platform sign-up native fix) visible; full open ticket list only partially retrieved.
- **Context overflow:** Session hit token limit mid-run; resumed from conversation summary. All data gathered before overflow; write phase completed after resume.
