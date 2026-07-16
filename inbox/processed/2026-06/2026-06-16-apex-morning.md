# Apex Morning Briefing — 2026-06-16

**Run:** 04:45 SAST | v2026-05-20 | Automated (no user present)

---

## Summary

Carryover: 12 items (2 P0, 10 P1) · New discoveries: 5 (Granola 3, Teams 1, Confluence 1) · Notion creates: 5 · Jira writes: 0 · Slipping: 4 items ≥10 days old

---

## Stack A — Mine (cap 3)

**#1 · P0 · Frontier**
Reply to Steve: LawrieCo demo farms HORIZON output not showing on user dashboard
- Steve's DM sent Jun 11 (5+ days unanswered). Teams DM: "not on the user dashboard. I'm guessing I need to be a CP to get an Insight. Ultimate goal is for Harry to click on the farm and see th..."
- LawrieCo workshops are mid-to-late June. This blocks Harry Clark demos on AP-2367.
- **Next step:** Reply to Steve's Teams DM today.

**#2 · P0 · Operating system**
KCT Light vs Full: confirm approach with Will and German
- 4 days carried. This decision gates scope definition for AP-2330 (KCT Phase 2). Kieren's SLT Long Form (today) flagged KCT conversion as the company's #1 revenue blocker.
- **Next step:** Sync with Will and German; agree on Light vs Full and unlock scoping.

**#3 · P1 · Frontier**
Farm Boundary Drawing Tool: circulate requirements doc to Cadel, Ben, Daniel [NEW]
- Committed Jun 15 after requirements meeting. This is the explicit blocker called out in Granola: build cannot start and marketing copy cannot be defined until requirements are circulated.
- AP-2515 is "Ready for dev" in Jira; AP-2516 (PRD) is drafted; next step is Manager Briefing with Kieren then PRD Core approval.
- **Next step:** Write up and distribute requirements doc TODAY.

---

## Stack B — Complement (cap 3)

**#1 · Horizon snapshot · Operating system**
SLT Long Form (Jun 16) — performance framework rollout + Monthly TOMORROW [NEW]
- Kieren published the SLT Long Form this morning. Key decisions:
  - Performance framework going company-wide (D1) — controllable-variable empirical metrics for all seats including PM.
  - Monthly all-hands **TOMORROW Jun 17** (Cadel chairing, Kieren presenting framework, Daniel presenting marketing audit).
  - KCT conversion seat **unassigned** (A3) — urgent by Jun 19. Two-thirds of 30k ha in issued-but-unconverted KCTs; Ben moved to outbound without reallocating close-out responsibility. This is the company's highest-leverage unowned action.
  - Cash hold extended through July (D4).
  - Will's idea (A11): Claude + Cowork + Chrome + Ops MCP → end-to-end KCT generation from a single prompt. Dylan's surface.
- **Why complement:** Cross-functional decisions, not Dylan's assigned action — but PM implication is real (seat metrics, KCT conversion ownership, A11 scope).

**#2 · P1 · Horizon**
EIH flow: wireframes and trigger point logic for Cadel review
- Already in Notion Rank 3. Cadel is explicitly waiting before implementation begins on the EIH epic. The Granola Jun 15 meeting confirmed EIH/Consents Epic split (registration phase first) — Dylan needs to run through entry point design with Steve before wireframes can be finalised.
- **Why complement:** Unblocks Cadel dev start. High leverage per engineering hour if delivered this week.

**#3 · P2 · Stormboy**
Reply to Claudia Bryant DM: Storm Boy scope/tasks clarification [NEW]
- DM received Jun 15 23:24 UTC (Jun 16 01:24 SAST): "Just checking if there is anything other than calls needed for me to do for Storm Boy as i wasn't at the last meeting?" Unanswered.
- **Why complement:** Claudia is the lead scraping partner on Stormboy. If she's under-utilised, pipeline velocity drops.

---

## New discoveries by source

| Source | Signal |
|---|---|
| Granola (Jun 15) | Farm Boundary Drawing Tool requirements doc must be circulated (BLOCKER) |
| Granola (Jun 15) | DND API drop decision → post in channel, tag Will + Michael |
| Granola (Jun 15) | EIH/Consents Epic: registration phase first; entry point design session with Steve needed |
| Granola (Jun 15) | 25-Year commitment artifact: re-edit to remove AI tone, fix revoked-projects stat, determine Snapshot placement |
| Teams DM | Claudia Bryant (Jun 15): Stormboy scope question — unanswered |
| Confluence (Jun 16) | Kieren SLT Long Form: performance framework, Monthly Jun 17, KCT conversion unassigned (Fri Jun 19 urgent), cash hold Jul, A11 idea |
| Jira (Jun 15) | AP-2514 cluster (AP-2514–2518) all updated — Farm Boundary Drawing Tool requirements locked, PRD drafted, implementation plan drafted, solution scoped |

---

## Notion writes

**5 new Proposed tasks created:**
1. `Frontier — Farm Boundary Drawing Tool: circulate requirements doc to Cadel, Ben, Daniel` · P1 · Today · Rank 3 · [notion](https://app.notion.com/p/3818c08eb28f81879120cb68c6cf3c30)
2. `Stormboy — Reply to Claudia Bryant DM: Storm Boy scope/tasks clarification` · P2 · Today · [notion](https://app.notion.com/p/3818c08eb28f81778d9ae3e81ba52230)
3. `Operating system — Post DND API drop decision in channel, tag Will and Michael` · P2 · Today · [notion](https://app.notion.com/p/3818c08eb28f8160b539f1c40090e819)
4. `Operating system — Read SLT Long Form (Jun 16): performance framework rollout + Monthly Jun 17` · P2 · Today · [notion](https://app.notion.com/p/3818c08eb28f8103b4e6e9a4e3542f5a)
5. `Frontier — EIH Consents Epic: run through entry point design with Steve` · P1 · Today · [notion](https://app.notion.com/p/3818c08eb28f8100a96ae5441bec7208)

**No Jira writes** — read-only run per standing rule.

---

## Reconciliation

| Task | Signal | Status |
|---|---|---|
| Reply to Steve re LawrieCo | Teams DM Jun 11 — no reply found | 🟡 Still-open, P0 |
| KCT Light vs Full decision | No Teams/Jira signal found | 🟡 Still-open, P0 |
| Raise Jira bug tickets (Jun 3) | AP-2514 cluster exists in Jira — partial signal | ❓ Ambiguous — AP-2514 tickets were created; original Notion task may be phantom |
| Land title field workflow with Hobbs | Hobbs met Jun 15 per Frontier standup context | ❓ Ambiguous — may be done |
| Reply to Claudia Bryant | Teams DM Jun 15 — no reply found | 🟡 Still-open (just created) |

---

## Slipping items (≥10 days old, action required)

| Task | Age | Notes |
|---|---|---|
| Stormboy — KCT operationalisation: guide Joe and DJ | 25 days (May 22) | Very stale — verify with Stormboy context; may be superseded |
| Frontier — Raise Jira bug tickets (HORIZON blank page + geometry) | 13 days (Jun 3) | AP-2514 tickets may satisfy this — recommend marking Done if so |
| Operating system — Paniri email re direct tag purchase | 13 days (Jun 3) | Kieren commitment — likely still relevant |
| Operating system — Kieren contractor agreement review | 13 days (Jun 3) | Explicit Kieren 1:1 commitment — still open |

---

## HubSpot

Routine pipeline activity — no PM-actionable signals. Benembra (new growth deal Jun 4) and Bradley Boldiston both in DM stage. No dramatic stage changes.

---

## Context note: SLT Long Form (Jun 16)

Kieren's Long Form is unusually high-signal today. Three things to flag for when Dylan reads:

1. **Performance framework seat metrics** — Kieren is extending Ben's empirical controllable-variable model company-wide. Dylan's PM seat will likely get metrics defined. Worth knowing before the Monthly tomorrow.
2. **KCT conversion seat is unassigned** — This is not just an ops problem. The conversion gap (30k ha of issued KCTs not converted to carbon projects) is the company's main revenue-generation bottleneck. Dylan's surface (KCT Phase 2, AP-2330) is directly in this chain. Understanding who owns conversion matters for scoping.
3. **A11: Claude + Cowork + Ops MCP for KCT auto-generation** — Will's idea. If Dylan picks this up, it would be a Claude Improvement / Operating system initiative. No action needed today but worth tracking.

---

*Generated by Apex Morning Briefing · 2026-06-16 04:45 SAST*
