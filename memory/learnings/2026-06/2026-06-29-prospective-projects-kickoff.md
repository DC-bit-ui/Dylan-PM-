# Prospective Projects Restructure — Epic Kickoff outcomes

**Date:** 2026-06-29
**Source:** Prospective Projects Epic Kickoff meeting (Dylan + Gayathri Menakath + Athul George), 29 Jun 2026. Transcript on file.
**Confidence:** [high] — direct from the meeting.

## Naming (correction)
- Refer to the 5-epic stream as **"Prospective Projects Restructure"**, NOT "Consents" / "Consents Phase 1". [high]
- The Jira epics (AP-2564 + 4) were created with a legacy "Consents Phase 1 —" prefix; rename pending Dylan's confirmation.

## Decisions / facts
- **Gayathri Menakath** assigned the Project Hub & Dashboard epic first (pending Cadel's final confirmation). Athul George provides backend support. [high]
- **Approved to build now:** Dashboard (Project Hub & Dashboard) + KCT mapping re-skin only. Land titles, consents, registration are later epics. [high]
- **Land-titles requirements are NOT signed off by Cadel.** Dylan's flow is high-level/indicative only until then. [high]
- **One-at-a-time vs property-level batch** processing is **undecided** — Steve is gathering requirements. Dylan's steer: support either/both; don't hard-code a single order. [high]
- Designers/Figma contract **terminated** (~US$5k/mo retainer, used sporadically). Now using **Claude Design** for internal-product prototyping; may re-engage Figma contractually for customer-facing work. [high]
- Claude Design workflow: *Share → Export → send to Claude Code* to pull the front end across. Don't pixel-match — follow the design (same approach as Magic Patterns on KCT/referral portal). [high]

## Reinforced (already known, confirmed in meeting)
- Property↔carbon-project level model; KCT mapping config is the fan-out point. [high]
- No-blockers rule: amber flags, never gates; a project can register with consents outstanding (amber flag after). [high]
- Ops app = interaction layer; SharePoint + HubSpot = repositories underneath. [high]

## Deliverable produced
- `docs/2026-06-29-epic1-dashboard-handoff.md` — Epic 1 dev handoff (scope, level model, 2 surfaces, 7 atomic stories, code map, metrics, attachments).
