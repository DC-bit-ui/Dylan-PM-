# Apex Morning Briefing — 2026-06-12 (Friday)

**Run at:** 04:45 SAST · 2026-06-12  
**Status:** Complete

---

## Carryover

- **Today view:** 0 tasks specifically due today at run time
- **Overdue:** ~60+ tasks spanning March–June (reviewed; existing stack not restaged — reconciliation run separately as needed)

---

## New discoveries by source

### Granola (Jun 5–12)
- **Jun 9 — 1:1 Steve (KCT automation + EIH roadmap):** Steve needs direction on KCT Light vs Full before he can proceed. Will requested full PDFs but no formal decision. Blocks dev work and the 2–3 KCT issuance target from Town Hall.
- **Jun 9 — Town Hall:** R&D tax calendar exports required from all team ASAP. Snapshot process discussed (Cadel/Joe Duncombe pipeline).
- **Jun 10 — EIH redesign with Cadel:** PandaDoc API shape flagged as hard blocker — no implementation can start until confirmed.
- **Jun 10 — 1:1 Cadel (HORIZON):** Jira/LAFI state discussed. Cadel published LAFI database validation PRD to Confluence Jun 11 (AP-2488).

### Teams (partial — rate limited after 45/47 chats)
- **Cadel Watson, channel, Jun 11 06:00 UTC:** "Transcript export - FYI Dylan Cronje" [mention, no action required]
- **Steve Le Moenic, DM, Jun 11 01:09 UTC:** UNANSWERED — "I'm trying to work out how to get a Horizon output on the LawrieCo demo farms. Snapshots visible in Frontier but not on user dashboard — suspects CP requirement for Insight." Directly blocks AP-2367 Harry Clark workshop readiness.

### HubSpot (last 48h)
- Bulk Howson Carbon Projects update (likely automated pipeline)
- Killen Carbon Project stage change
- Gunthorpe deal update
- No clear PM action identified; monitoring only.

### Confluence (last 24h)
- Cadel published **26Q3 - LAFI database validation** PRD (Jun 11) — linked to AP-2488 (HORIZON 2.0 canonical table & sample QA). Needs PM review.

### Jira
- **AP-2367 (Referrer Portal Phase 2):** PRD status, Steve assigned. Harry Clark workshops mid-to-late June — demo farm readiness at risk given Steve's DM.
- **AP-2488:** LAFI database validation / HORIZON 2.0 canonical table — Cadel's new PRD published.
- **AP-2366:** Data segregation (Steve) — prerequisite for AP-2367 demo farms.

---

## Stack A — Mine (cap 3)

| Rank | Task | Priority | Blocker |
|---|---|---|---|
| 1 | Confirm KCT Light vs Full approach with Will & German | **P0** | Steve blocked in dev; 2–3 KCT target at risk |
| 2 | Reply to Steve: LawrieCo demo farms HORIZON output not on dashboard | **P1** | DM unanswered 30+ hrs; blocks AP-2367 |
| 3 | R&D tax: collect calendar exports from all team | **P1** | Town Hall commitment Jun 9; ASAP |

## Stack B — Complement (cap 3)

| Rank | Task | Why it matters |
|---|---|---|
| 1 | Review Cadel's 26Q3 LAFI database validation PRD (AP-2488) | Unblocks Cadel's sprint planning for HORIZON 2.0; published yesterday |
| 2 | AP-2367: validate demo farm readiness for Harry Clark workshops | Harry Clark workshops mid-to-late June; Steve's DM surfaced a potential blocker today |
| 3 | EIH: confirm PandaDoc API shape with Cadel | Hard blocker called out in Jun 10 meeting; Cadel cannot start implementation |

---

## Notion writes (6 new Proposed tasks created)

| Task | Notion ID | Priority |
|---|---|---|
| Operating system — Confirm KCT Light vs Full | 37d8c08e-b28f-81f7-b490-d4494ad66659 | P0 |
| Frontier — Reply to Steve: LawrieCo demo farms | 37d8c08e-b28f-8174-9167-c417af73fc19 | P1 |
| Operating system — R&D tax calendar exports | 37d8c08e-b28f-81a5-968e-c930c4dc94c7 | P1 |
| Horizon — Review Cadel's LAFI PRD (AP-2488) | 37d8c08e-b28f-8196-b699-c99b965753f0 | P1 |
| Frontier — AP-2367 demo farm readiness | 37d8c08e-b28f-8149-996c-f71e3c83f6cd | P1 |
| Frontier — EIH PandaDoc API shape with Cadel | 37d8c08e-b28f-81a1-8b99-d9fe2499dddf | P1 |

---

## Gaps / flags

- **Teams rate limiting:** Only 2 of 45+ chats fully scanned. Second and third query batches 429'd (retry-after 60s). Some overnight channel posts may be missed — run Teams scan manually if needed.
- **Jira large query:** "recently updated -1d" returned 72k+ chars, exceeded token limit. Active epics and Dylan-assigned tickets captured; full recent-update sweep not completed.
- **Joe Duncombe HORIZON snapshot:** Commitment from an earlier week flagged as at risk (14+ days since commitment) — not captured as a new task today as it may already exist in overdue stack. Reconcile manually.

---

## Durable learnings captured

None this run — no corrections or new business facts from sources. Existing memory current.

---

*Source: Granola (Jun 5–12), Teams (Jun 11, partial), HubSpot (Jun 10–12), Confluence (Jun 11), Jira (active epics + Dylan tickets), Notion (Today + Overdue views)*
