# Learning: Cadel Departure + Team Restructure

**Date:** 2026-07-06  
**Confidence:** [high] — confirmed across 3 Granola meetings (Jun 30, Jul 1, Jul 2)  
**Source:** Granola transcripts: "Kieren Checkin - CADEL departure 2026-06-30", "Standup - KCT stratification workflow and HORIZON run visibility 2026-07-01", "Offshore employment structure and HORIZON program funding with Kieran 2026-07-02"  
**Captured by:** Apex Morning Briefing 2026-07-06

---

## What changed

**Cadel Watson is departing AgriProve.** Effective timeline: approximately 3 weeks from 2026-07-06 (i.e., ~late July 2026). Exact last day not yet confirmed in transcripts — treat window as closing fast.

### New team structure (post-Cadel)

| Person | Previous role | New role |
|---|---|---|
| Cadel Watson | Dev lead / backend engineer (HORIZON owner) | Departing |
| Steve Le Moenic | Developer (KCT, LawrieCo) | **Program Manager** — elevated to product/delivery ownership |
| Gayathri Menakath | Frontend developer (HubSpot team) | **Technical Lead** — now leading frontend delivery on Frontier/KCT |
| Athul George | _(new)_ | **Developer** — onboarded to team |
| Dylan Cronje | Product Manager | Expanded scope: design/UX/feature delivery directly with Steve and Gayathri |

### HORIZON ownership post-Cadel
- Cadel owns HORIZON model validation framework (epic AP-2116). His departure creates a knowledge and ownership gap.
- Kieren has flagged TERA (Temporal Ecological Restoration Assessment — or similar) / Verterra integration as a strategic direction Cadel would have driven.
- Dylan's expanded role includes more direct involvement in HORIZON direction in the medium term.

### Key risks flagged

1. **Knowledge transfer gap** — HORIZON x Drova workshop must happen before Cadel leaves. Goals: lock technical direction, capture knowledge for Gayathri and Athul, define validation cohort, align on TERA integration.
2. **Pending epics need Cadel sign-off** — Frontier Epics 3-5 (land titles, consents, registration) require Cadel sign-off before build can start. Must be actioned now.
3. **Developer capacity** — With Gayathri as Technical Lead and Athul as developer, team is lean. Steve bridges PM and delivery. Dylan must be more prescriptive with design/UX direction.

### TERA / Verterra direction
- Kieren and Cadel discussed DROVER integration and TERA scope — this was under Cadel's purview. Dylan needs to pick up the thread.
- Granola Jul 2 Kieren 1:1 flagged TERA integration as one item to lock before Cadel leaves.
- **Name correction (2026-07-06):** Programme is called DROVER, not Drova. Supersedes any prior "Drova" references.

---

## How this changes Apex behavior

- Roster updated: Steve = Program Manager, Gayathri = Technical Lead, Athul George = Developer added
- HORIZON-tagged tasks now also check for Gayathri/Athul involvement (not just Cadel)
- Cadel's Jira assignee status on HORIZON epics (AP-2116) may transition — watch for reassignment signals
- Any Granola transcript mentioning "Cadel" + "before he leaves" or "handover" should be escalated to Stack A

---

## Cross-links

- `memory/people/roster.md` — updated (see 2026-07-06 additions)
- `memory/initiatives/` — AP-2116 (HORIZON validation, owned by Cadel — needs update when reassigned)
- Notion tasks: HORIZON workshop P0, land titles requirements P1, Gayathri package P1
