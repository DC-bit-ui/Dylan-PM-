# Teams Post — Snapshot Notification Routing Gap

**Channel:** Product > Epics (or Platform Notifications — Dylan to decide)
**Date drafted:** 2026-05-19
**Jira:** AP-2392

---

Hey team — flagging a gap in the snapshot automation that we need to close before Growth can properly own this workflow.

**The problem:** when a HORIZON model run completes and a snapshot is ready for review, there's no automated notification to the Growth member who requested it. No Teams ping, no HubSpot task, no pipeline stage change. The only way to know a snapshot is ready is to manually check the tool or have someone mention it in a channel. That doesn't scale — we've got 90+ tickets in the backlog and we're about to hand this process to the Growth team to run day-to-day.

**What was specced but not built:** the [Phase 0.5 Backend Solution Approach](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/561610757) (section: "Ticket lifecycle and notification routing") outlined a 4-stage HubSpot pipeline with automated transitions and a Teams notification on model completion. The core automation tool works well — this notification layer was classified as "stretch" in the original scope and never got ticketed as separate work.

**What we need (three things):**

1. Add a "Ready for Review" stage to the HORIZON Snapshot Requests HubSpot pipeline — config only, no code
2. Two backend webhooks: one on model run start (moves ticket to "In Progress"), one on model completion (moves ticket to "Ready for Review") — these are small BFF/Temporal additions
3. A HubSpot workflow that fires on "Ready for Review" entry — posts to Platform Notifications tagging the ticket owner with a direct link to the snapshot tool, and optionally creates a HubSpot task

Without this, Growth can't stay on top of what's outstanding, what's ready, or what's been sent. They'd be relying on memory and channel scanning, which is exactly the manual overhead the automation was meant to eliminate.

I've created [AP-2392](https://agriprove.atlassian.net/browse/AP-2392) with the full spec, acceptance criteria, and references to the original architecture docs. Keen to hear thoughts on timing — this is blocking the Growth handover.
