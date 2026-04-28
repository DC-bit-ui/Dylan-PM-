# Learning: Dylan does NOT own T1 Offsets Report (AP-2187) — corrected from bootstrap snapshot

**Date:** 2026-04-28
**Source:** Dylan in session — "I am not owning T1 offsets but agree on the plan"

---

## What I had wrong

The bootstrap snapshot from the Cowork handoff inferred that Dylan owns T1 Offsets Report PRD-side. I captured this in `memory/business/strategy.md` line 30 ("Owns (PM): … T1 Offsets Report PRD-side") and marked the AP-2187 initiative file with "DRI: Unassigned (likely needs Dylan PRD ownership)".

**Correction:** Dylan **contributes** to T1 Offsets but does not own it. Ownership TBD.

## What I corrected

- `memory/business/strategy.md` line 30 — moved T1 Offsets from "Owns (PM)" to "Contributes (PM support)"
- `memory/initiatives/ap-2187-crediting-workflow-t1-offsets.md` — DRI line and Current state — explicit "Dylan is not the intended owner; contributes only (corrected 2026-04-28)"

## Why this matters for the system

The owned-surfaces list in `strategy.md` is the **anchor for the dual-stack prioritisation** (forthcoming PR #2 — see PR #1 capability-ask comment). If T1 Offsets stays in the "Owns" list, the system would pull T1-related Granola transcripts and Jira tickets into Stack A (mine, priority) when they should go in Stack B (complement opportunity, secondary). Getting the surface list right matters for prioritisation hygiene.

## Lesson

Inference from a snapshot ≠ confirmation. The handoff said T1 Offsets was likely Dylan-owned ("[ASSUMPTION]"). I captured it as fact-shaped (only marked "likely needs Dylan PRD ownership" in the initiative file, not in strategy.md). Should have either:
- Carried the [ASSUMPTION] tag through to strategy.md, or
- Asked Dylan explicitly during bootstrap to confirm the owns-vs-contributes split

Pattern: when capturing role / ownership data from a handoff, **always ask the principal to confirm** before treating it as canonical. Roles are high-leverage facts that downstream skills lean on heavily.

## Corrected owned-surfaces list (canonical)

- **Owns (PM):** Frontier (AP-1963, AP-2009), Stormboy alignment
- **Contributes (PM support):** HORIZON validation framework (AP-2116), KCT phase 1 (AP-1964), LawrieCo referrer view (AP-1965), T1 Offsets Report / Crediting Workflow Template (AP-2187)
