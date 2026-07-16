# Stale Proposed — paste-ready Notion action list

**Source:** [`memory/retros/session/2026-04-29-eod.md`](../../memory/retros/session/2026-04-29-eod.md) §"STALE PROPOSED"
**Generated:** 2026-04-29
**Total items:** 11 stale Proposed tasks (Apex · Morning origin), age 1–5 days, never triaged
**Action format:** for each item — recommended status transition, brief why, optional secondary action

**How to use:** Open Notion's "Work Priorities" database. For each row below, locate the matching task by title and apply the recommended action. Time estimate: ~10 minutes for the full list. Do these in the order presented; the first 4 are quick wins, the last 7 are the 5-day-old block where the cancellation default applies.

---

## Group 1 — From Apr 28 (1 day old) — keep, surface tomorrow

These are too fresh to cancel. Triage on tomorrow's `/focus`.

### 1. [Operating system] Review Operations Team Huddle Confluence page (P2)
**Action:** Keep as Proposed. No status change.
**Why:** Less than 24h since creation. Below P2 cancellation threshold even after rule tightens.
**Optional:** Set Today Rank to bury it under tomorrow's top 3.

### 2. [Frontier] AP-2242 Soils design & prototyping active — Steve working (P2)
**Action:** Keep as Proposed.
**Why:** Steve is actively working — this is a watch-item, not an action-item. Will resurface naturally on Granola scan if it stalls.
**Optional:** Add Next step: "Watch — Steve owns. Re-evaluate if no Confluence/Jira motion in 3 days."

---

## Group 2 — From Apr 27 (2 days old) — one matters, one is noise

### 3. [Frontier] Review AP-2231 snapshot automation bug in Prod (P1) — **customer-facing**
**Action:** Move to **Today** status. Keep P1.
**Why:** Customer-facing bug. Two days as Proposed without triage means it's been sitting while the customer experience degrades. Pair with task #1 in tomorrow's top 3 (Ben's snapshot automation bug, P0, AP-2232) — likely related root cause.
**Next step:** Add note: "Linked to AP-2232 root-cause investigation; pair on diagnostic with Cadel."

### 4. [Operating system] Review Operations Meeting Confluence page (P2)
**Action:** **Cancel** (Status → Cancelled). Add reason in Next step: "Duplicate-purpose with #1 above (Operations Team Huddle); review one, not both."
**Why:** Two near-duplicate Operations review tasks created on consecutive days. Keep the fresher one.

---

## Group 3 — From Apr 24 (5 days old) — apply the 3-day cancellation default

These are past the proposed `cancel-by-default-after-3d` threshold. Each gets a recommended action with one-line evidence.

### 5. Stormboy — run Victorian import on production database (P2)
**Action:** **Cancel.**
**Why:** EOD report flags this as "may be overtaken if Athul's CSV import covers this". AP-2241 is in active development with Athul (Stormboy CSV import). Resurrection signal absent.

### 6. Frontier — record Loom videos for Ben (P2)
**Action:** **Cancel** (Apr 24 instance only — the manual P1 instance with same description stays).
**Why:** Direct duplicate of an existing Manual task tracking the same commitment. Keep one record.

### 7. Horizon — assign engineering owner to AP-2230 high-res SOC (P1) — **still relevant**
**Action:** **Re-scope.** Move to Today. Re-write Next step to reflect 5-day staleness: "5 days unassigned — pursue with Cadel directly tomorrow. If still no owner by EOD Apr 30, escalate as a process gap (Apex flagged, action didn't follow)."
**Why:** P1 customer-impact item that the system surfaced and Dylan didn't action. Cancelling would reward the gap. Re-scoping makes the gap visible in tomorrow's top 3.

### 8. Horizon — review HORIZON Feedback page from Claudia (P3)
**Action:** **Cancel.**
**Why:** P3, 5 days untouched, no Granola/Teams resurrection signal. Default applies.

### 9. Frontier — review Steve's 26Q1 UX review PRD (P2)
**Action:** **Cancel.**
**Why:** EOD report notes "Steve actively updating this today per Confluence". Steve will surface a "ready for review" signal when he's done. A new Proposed will be created at that point with fresh context.

### 10. Stormboy — run Victorian import on production (P2)
**Action:** **Cancel.**
**Why:** Direct duplicate of #5 above. Apex created two near-identical entries on Apr 24 — symptom of the dedup logic missing case-variation in the title. (Worth flagging as an Apex-improvement item separately — see "Follow-up" below.)

### 11. Frontier — call with Hobbs for Ardrossan parcels (P1)
**Action:** **Cancel** (Proposed instance) — keep the Manual P0 instance dated Apr 28.
**Why:** Duplicate of Manual task ("Frontier — call with Hobbs to clean up Ardrossan parcels"). Apex re-surfaced what was already on the workstack.

---

## Summary

| Action | Count |
|---|---|
| Keep as Proposed | 2 |
| Move to Today | 1 |
| Re-scope (Today + new context) | 1 |
| Cancel | 7 |
| **Total** | **11** |

7 cancellations × ~30s in Notion = ~3.5 minutes. Plus ~2 minutes for the Today/re-scope edits. **Total time: ~6 minutes.**

---

## Follow-up (separate, not part of this paste-list)

- **Notion task:** Add a P2 to the workstack: "Tighten Apex `apex-morning-briefing` dedup logic — case-variation in title not currently caught (see Apr 24 duplicates: 'Stormboy run Victorian import on production database' vs 'on production')." Origin: this stale audit. Linked artifact: this file.
- **Decision-log candidate:** Once the cancellation-default rule is implemented in the EOD prompt, capture as `memory/decisions/2026-04-30-stale-cancel-default.md`. Today's bulk cancellations are the empirical seed for that rule's design.
- **Follow-up retro item:** Note for tomorrow's `/retro-day` — "11 stale items, 7 cancelled, 1 re-scoped → 64% of Apex Morning's Apr 24–28 Proposed output was noise or duplicate. The dedup gap (#10) is the single biggest contributor."
