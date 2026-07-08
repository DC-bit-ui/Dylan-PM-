# Requirements / tickets must be written for a zero-context reader

**Date:** 2026-06-10
**Type:** feedback / working-style rule (Cadel-flagged — "the last bastion to solve")
**Confidence:** [high] — raised directly by Cadel
**Source:** Granola 2026-06-10 "EIH workflow and project structure redesign with Cadel" (`37571c50-a74f-47ed-8acc-c7b2d4c621a6`)

---

## The rule

Claude-drafted requirements/tickets currently **make too many assumptions about the reader's technical and contextual understanding**, and **reference iterative decisions no one else has context for**. Devs (Athol, Gav) are frustrated. Cadel called ticket quality "the last bastion to solve."

Going forward, every ticket / requirement must be **self-contained for someone with zero iterative context**:
- No references to prior conversations, earlier decisions, or "as we discussed" / "the approach we landed on".
- State the assumption explicitly rather than implying shared understanding.
- Spell out the technical context a fresh reader needs.
- Split into tickets **only after wireframes are reviewed and coverage confirmed** — not before.
- Explore **NotebookLM visual summaries** as an aid for Athol.

## Why / how to apply

This is the recurring failure point between PM output and dev execution. Apply to all `agriprove-pm` drafting (PRDs, epics, Jira tickets, requirements). When drafting on Dylan's behalf, write as if the reader has never seen the project history.

**Promote to** `memory/profile/working-style.md` (Tier 2) once confirmed — pattern has been raised explicitly by eng.
