# Learning: DROVER name correction + reconciliation signals

**Date:** 2026-07-06  
**Confidence:** [high] — Dylan corrected directly  
**Source:** Dylan's reconciliation feedback on Apex Morning Briefing 2026-07-06  
**Captured by:** Apex Morning Briefing 2026-07-06

---

## Name correction: DROVER (not Drova)

The HORIZON workshop is with **DROVER**, not "Drova". Correct all future references.

- Affected files: `inbox/cowork/2026-07-06-apex-morning.md`, `memory/learnings/2026-07/2026-07-06-cadel-departure-team-restructure.md` — both used "Drova". Mark as superseded on the name; content otherwise correct.
- Notion task title corrected to "DROVER x HORIZON workshop".
- Going forward: use DROVER (all caps appears to be the correct form based on Dylan's usage).

---

## DROVER workshop — blocked on Cadel's leave, not slipping

The workshop was flagged as P0/slipping in the morning briefing. Correction: it is **blocked on Cadel returning from leave next week**, not a slipping commitment. It is not actionable until Cadel returns. Apex should not flag as "slipping" when the blocker is a known external constraint (person on leave).

**Rule:** Before escalating a task as slipping, check whether it's blocked on a person's availability (leave, travel, etc.).

---

## Reconciliation signals — phantom tasks identified

Two tasks created by Apex this morning were already done:

| Task | Status | Signal |
|---|---|---|
| Frontier — Send Gayathri Prospective Projects package | Done — completed in Teams channel long before Apex created the task | Phantom: Apex had no visibility of the Teams channel completion signal |
| Frontier — Finalize land titles requirements for Cadel sign-off | Done — Steve signed off | Phantom: completion happened but wasn't captured as a Notion task transition |

**Apex gap:** Both tasks were visible in Granola as commitments (Jun 29) but the completion signals were in Teams channels, which Apex either couldn't reach (rate-limited) or didn't check. The reconciliation scan should have caught these if Teams channels had been fully scanned.

**Rule:** When Apex creates tasks from Granola Jun 29 commitments that are now 7 days old with no Notion task, treat as high phantom-risk. For Frontier tasks involving Gayathri/Steve, check Teams channels (Product > Epics, or Frontier-specific) for completion signals before creating a Notion task.

---

## Cross-links

- `memory/learnings/2026-07/2026-07-06-cadel-departure-team-restructure.md` — DROVER reference needs updating
- `memory/decisions/2026-04-28-reconciliation-flow.md` — Teams channel gap is a known limitation; this case reinforces it
