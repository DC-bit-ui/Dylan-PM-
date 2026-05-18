# Apex task attribution errors — 2026-05-18

**Date:** 2026-05-18
**Source:** Dylan triage of Apex Morning Briefing 2026-05-18
**Confidence:** [high]

## Error 1 — KCS run-through with Joe

Apex created a Notion task for "Coordinate with Joe for real customer KCS run-through" based on a Granola mention in the snapshot automation blockers meeting (15/05). Dylan confirmed this is **Steve's task**, not his.

**Rule:** When a Granola meeting mentions "coordinate with [person] for [X]" in a technical/ops context, default assumption should be that the action sits with the person closest to that work (in this case Steve, the engineer running staging). Do not attribute to Dylan unless Dylan is named as the actor.

## Error 2 — Sampling cost analysis (Schedule 2 vs Schedule 1)

Apex created a Notion task for "Deliver sampling cost analysis: Schedule 2 vs Schedule 1 costs + next year projection" based on the Cadel 1-on-1 (15/05). Dylan confirmed this is **not his task**.

**Rule:** Financial/technical analysis deliverables for clients mentioned in 1-on-1s with engineers (Cadel) may be the engineer's deliverable, not the PM's. Do not attribute to Dylan unless Dylan is explicitly the named actor or it's a PM artefact (PRD, brief, decision doc).

## Pattern

Two Apex errors in one run where Granola meeting context was attributed to Dylan when the action sat with another team member. Both were surfaced as "Dylan committed to X" when the actual commitment was from the meeting context, not explicitly Dylan's voice.

**Suppression signal to add:** Before creating a Notion task from Granola, verify the sentence structure — "coordinate with X" or "deliver Y for the client" said in a technical meeting does not automatically mean Dylan is the actor. Cross-reference with Dylan's first-person verb ("I'll", "I will", "I'm going to") where possible.
