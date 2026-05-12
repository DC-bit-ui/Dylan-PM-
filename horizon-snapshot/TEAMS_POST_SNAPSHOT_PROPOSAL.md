# Teams Channel Post — HORIZON Snapshot Automation Proposal

> **Instructions:** Post to the relevant Teams channel. Attach both diagrams from `diagrams/`:
> 1. `snapshot-frontend-flow.svg` — the two entry paths + 3-step workflow
> 2. `snapshot-ticket-lifecycle.svg` — HubSpot pipeline stages + notification routing
>
> Also attach or link the backend solution approach doc (`BACKEND_SOLUTION_APPROACH.md`).

---

Hey @Cadel, @Gayathri, @Athul,

Ahead of tomorrow's 3pm session, wanted to share what I'm thinking as an interim approach for the snapshot automation.

Rather than building out the full Figma designs (which carry a heavy frontend build), I've been working on a lightweight engine that takes the existing model output files and generates the snapshot directly — same Canva template, fully automated calculations, AI-generated narratives. It works today as a standalone tool with manual file uploads.

The proposal for Phase 0.5 is to wire this engine into Frontier so it pulls data from the platform instead of manual uploads. That means:

**What I'm building (frontend):**

- Review tool UI inside Frontier (prototyping with Claude, building in Claude Code)
- Pixel-faithful replication of the Canva template, no new design work needed
- 3-step workflow: Upload ZIP (historical backlog) or with automation skip this step → Review data → Edit narratives → Export PDF

**What we'd need from the backend (~1 day):**

- Pre-signed S3 URLs for model output files on SOCModelRun (resolver fields)
- Confirmation that property name/address/area are queryable for a given property
- Trigger a fresh model run via the existing `socModelRunTrigger` mutation when the Growth user clicks "Request HORIZON Snapshot" in Frontier's Actions menu, plus a query for the latest completed SOCModelRun per project so the snapshot tool can load the results

No changes to Temporal workflows or the socruns poller. The model outputs are already in S3, we just need the frontend to be able to fetch them via pre-signed URLs through GraphQL. The model run trigger already exists as a mutation, we're just wiring it to a new UI action.

I've also mapped out the ticket lifecycle using the existing HORIZON Snapshot Requests pipeline in HubSpot. The proposal adds one new stage ("Ready for Review") that triggers a Teams notification to the Growth member when the model run completes, with a direct link to the snapshot tool. See the attached diagrams and the backend solution approach doc in the thread.

This is a starting point for tomorrow's discussion, keen to hear thoughts.
