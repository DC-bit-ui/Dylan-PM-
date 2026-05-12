# Decision Frameworks — Dylan

**Last updated:** 2026-04-28 (populated from Cowork handoff)

---

## Prioritisation framework (P0–P3)

This is **the framework** Apex uses to rank items in Notion. Claude should apply the same lens when reasoning about priority.

| Priority | Criteria |
|---|---|
| **P0** | Someone BLOCKED waiting on Dylan. Explicit commitment with deadline TODAY. Customer-facing production issue. Leadership (Kieren) explicitly asked for something urgently. |
| **P1** | Material value to active epics in Development. Unblocks team members. Meeting commitments from this week not yet actioned (escalate if >2 days old). Design reviews blocking dev. |
| **P2** | Requirements gathering for upcoming epics. Documentation and PRD work. Roadmap thinking and discovery. Non-urgent stakeholder requests. |
| **P3** | Internal tooling improvements. Nice-to-haves. Low-signal follow-ups. |

### Escalation rule
> If a meeting commitment is >3 days old with no matching Notion task, *or* the task is still "Not started", **bump priority by one level** and note elapsed time. Apex enforces this on the morning briefing.

---

## Focus area taxonomy (Notion `Focus area` property)

| Focus area | Covers |
|---|---|
| **Frontier** | Frontier platform, lead management, property creation, GeoMapper-based spatial mapping, snapshot generation |
| **Horizon** | HORIZON model, carbon calculations, model validation, Schedule 2 |
| **Stormboy** | Lead generation pipeline, process alignment with Growth (Claudia) and Field (Hobbs, Ben) |
| **Verterra** | Verterra product line |
| **Operating system** | Internal processes, standup notes, team comms, scheduling, Apex itself |
| **Horizon snapshot** | Snapshot-specific Horizon work |
| **ReadyGraze** | ReadyGraze product line |
| **Claude Improvement** | Improvements to Apex / this Claude OS / workflows |
| **Testing** | QA, review of launched products |
| **Bugs** | Bug fixes, production issues |
| **UX improvement** | Design reviews, UX feedback sessions |

---

## Workstack model — two stores

> **Notion is Dylan's personal workstack. Jira is the team workstack.**

- **Notion** — everything Dylan personally tracks: tasks, scheduling, comms, personal follow-ups, items that don't belong in Jira. Source of truth for `/focus`, `/standup`.
- **Jira** — source of truth for team delivery. Epics, stories, tickets, sprint state.
- **Linking** — Notion tasks have a `Linked Jira` URL when relevant. The system writes to Jira only for team-visible work (status transitions, completion, epic decisions). Personal/operational tasks stay Notion-only.

### Triage discipline
- New items discovered by Apex enter Notion as **Status = "Proposed"**. Nothing auto-enters Dylan's active stack.
- Dylan triages Proposed → Not started / Queued / In progress, or Cancelled.
- Origin tag distinguishes manually created (`Manual`), Apex-created (`Apex · Morning`, `Apex · Reconciliation`), and other sources.

---

## Standard frameworks Dylan applies

| Framework | When |
|---|---|
| **JTBD (Job Stories)** | Framing user need; preferred over feature descriptions |
| **Shape Up appetite sizing** | Bounding scope of new work — small batch / big batch / not now |
| **Lean Core + Design Appendix** | PRD format — minimal core spec, design lives in appendix |
| **PM workflow stages** | Discovery → Definition → Product Refinement Meeting → Sprint Planning → Requirements → Design → Development → Testing → Technical Release → Release Notes → Product Release → Feedback → Campaigns → Internal Training |

---

## Decision rules Dylan has stated

- **Notion ↔ Jira write discretion** — only write to Jira for team-visible work; personal ops stays Notion-only.
- **Apex creates Proposed, never active** — preserves Dylan's triage authority.
- **Granola scan window = 7 days** — not just yesterday; catches earlier-week commitments at risk of slipping.
- _(populate as more decisions surface)_

---

## What changes Dylan's mind
_(populate with evidence — what arguments / data actually move him; track over time)_

## Decisions Dylan won't revisit
_(append-only log of decided things; point here when topics try to relitigate)_
