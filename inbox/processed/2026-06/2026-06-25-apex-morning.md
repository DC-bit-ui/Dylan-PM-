# Apex Morning Briefing — 2026-06-25 (Thursday)

**Generated:** 2026-06-25T02:47:00Z
**Trigger:** scheduled
**SAST time at run:** 04:47 SAST

---

## Headline

Farm Boundary Tool is in the home stretch (AP-2539 in Code Review, AP-2542 Referrer in Staging) — but HORIZON stuck snapshots are blocking Ben operationally and EIH/KCT designs are 2 days overdue to Steve.

---

## TOP 3 PRIORITIES

1. **Bugs — HORIZON Snapshot stuck 'In Progress'** — 4 snapshots (1× Jun 19, 3× Jun 22) are blocking Ben's workflow. Gayathri investigating (AP-2541). Track resolution and unblock today. [AP-2541 / Notion 3898c08e-b28f-81db]

2. **Frontier — EIH/KCT dashboard designs → Steve** — Committed Jun 23 (2 days overdue). Steve is waiting before he can build the KCT mapping tile. Open designs and share today. [Notion 3898c08e-b28f-81bf]

3. **Frontier — Referrer Portal staging review (AP-2542)** — Login redirect bugs moved to Staging 2026-06-24. LawrieCo workshops are mid-to-late June — that's NOW. Review staging and unblock push to prod. [AP-2542]

---

## Slipping items (>3 days, low movement)

- **DND API decision post (Teams, tag Will + Michael)** — Jun 15 commitment, 10 days old, no signal of completion. Quick Teams post. [Notion 3818c08e-b28f-8160]
- **Farm draw UX requirements doc → Cadel/Ben/Daniel** — Jun 15–16 commitment. AP-2514 epic description appears to have been circulated (PRD Core + Design Appendix referenced), but no explicit Teams confirmation found. Ambiguous — check with Cadel.
- **Frontier ticket review (Prod stage defects)** — Notion shows P0 Queued from Mar 18. Next step indicates a Teams post was made. Likely done — should be marked Done.

---

## Teams signal (structured)

**Note: channel posts are not accessible via chat_message_search (DMs only). The following is DM-only data.**

### Mentions of me (0 captured)
- No @mention signals in DM search window. Channel scan degraded — channel posts not covered by this connector.

### Decisions (0 captured)
- Channel posts not scanned this run. Teams is a degraded source today.

### Questions for me (0 captured)
- No DM questions found.

### Commitments to me (0 captured)
- Joanne Curran DM (2026-06-24T06:17): "Yep, here is one I'm doing as we speak" — context unclear, likely soil sampling operational.

**teams_pull_errors:** chat_message_search is DM-only; channel posts are not indexed. Per standing memory note, this is a known limitation. Channel content should be checked manually in Product > Stand Up and Product > Epics channels.

---

## Jira activity (last 24h)

- **AP-2542** — Referrer Login Redirect Bugs → Staging (Athul George, 2026-06-24T14:34 AEST). Time-sensitive: LawrieCo workshops NOW.
- **AP-2539** — Farm Boundary Tool: land titles not auto-selected on submission → Code Review (Gayathri Prakash Menakath, 2026-06-24T12:24 AEST). P1 bug per Dylan's ticket spec.

## Active epics (not Done)

| Epic | Status | Owner | Last updated |
|---|---|---|---|
| AP-2530 — HORIZON 2.0 Satellite imagery | Discovery | Cadel | 2026-06-18 |
| AP-2514 — Farm Boundary Drawing Tool | Discovery | Dylan | 2026-06-17 |
| AP-2488 — HORIZON 2.0 Canonical target table & sample QA | PRD | Cadel | 2026-06-15 |
| AP-2415 — CRS/GIS correctness remediation | Development | Unassigned | 2026-06-02 |
| AP-2367 — Referrer Portal Phase 2 | PRD | Steve | 2026-06-02 |
| AP-2330 — Project KCT Phase 2 | Designs | Unassigned | 2026-05-19 |
| AP-2187 — Crediting Workflow Template T1 | Discovery | Unassigned | 2026-04-21 |

---

## Granola week scan (Jun 15–25)

**13 meetings** captured, all heavily focused on Farm Boundary Drawing Tool.

Key open commitments from Dylan (per Granola, cross-referenced):
- Raise HORIZON stuck snapshot support ticket (Jun 23 commit — exists in Notion as Rank 1 task)
- EIH/KCT dashboard designs → Steve (Jun 23 commit, 2 days overdue — Rank 2 task)
- Post DND API drop decision to Teams, tag Will + Michael (Jun 15, 10 days overdue)
- Draft Soil Carbon 101 video series outline + share with Hobbs (open, no deadline stated)
- Post channel walkthrough: end-to-end Frontier parcel confirmation process for the Farm Boundary Tool

Key unresolved blockers from Granola:
- HORIZON runs stuck for properties ≥1,600 ha (memory vs large property — likely resolves when Cato returns)
- CPP placement in dashboard (Dylan has it under Consents; Steve elevated it) — awaiting Cato
- Farm Boundary Tool: multi-non-contiguous areas not yet built (future scope)
- UTM attribution via iframe (Cadel investigating)
- ACWIS/Vitera market activation timing uncertain

---

## Confluence (last 24h)

- **Daniel & Adeline weekly (22 Jun)** — ACWIS/Vitera knowledge base (~11 articles on credit stacking), Kieren reviewing. Signals upcoming product launch comms activity.
- **Ben's Aircall transcripts** — George Raynolds, Anna Houston, Annabel Sides, Andrew Cotter — Growth pipeline active, no PM-action signal.

---

## HubSpot (last 48h)

- Blewett Carbon Project 1–8 (Peart) and Lindsay Carbon Project 07 (Bryant) — bulk-updated 2026-06-24T17:36. Likely automated pipeline update, not a genuine stage change. No PM action needed.

---

## Source roll-up

- Notion Today view: 0 items
- Notion Overdue view: ~20+ items (includes stale items from Mar–Apr 2026)
- Granola open commitments: 8+ across 13 meetings — 3 already tracked in Notion, 1 newly created
- Jira: 0 blocked, 2 recently updated (AP-2542 Staging, AP-2539 Code Review), 7 active epics
- Teams: degraded (DM-only, no channel coverage)
- HubSpot: bulk update activity, no PM-action signal
- Confluence: 8 pages updated — Daniel/Adeline weekly + Aircall transcripts

---

## Notion writes this run

**Updated:**
- `3898c08e-b28f-81db-af6f-e7877adf57c6` — Bugs: HORIZON Snapshot stuck → Today Rank 1, P0, Due 2026-06-25
- `3898c08e-b28f-81bf-a38b-cf60ffc819cf` — Frontier: EIH/KCT designs → Steve → Today Rank 2, P0, Due 2026-06-25
- `3818c08e-b28f-8160-b539-f1c40090e819` — Operating system: DND API post → Today Rank 4, Due 2026-06-25

**Created:**
- `3898c08e-b28f-8170-aa70-cbeb0a5d7606` — Frontier: Review AP-2542 Referrer Login Redirect on staging → Today Rank 3, P1, Due 2026-06-25

---

## Errors / degraded sources

- **Teams channels:** chat_message_search is DM-only per known limitation. Channel posts in Product > Stand Up, Product > Epics, and Stormboy channels are NOT covered. All four Teams buckets (mentions, decisions, questions, commitments) are unreliable this run. Manually check Teams channels on waking.
- **Granola query inconsistency:** First commitment query returned "no meetings found" while second query returned full detail. Treated second response as authoritative (matched list_meetings output of 13 meetings).
