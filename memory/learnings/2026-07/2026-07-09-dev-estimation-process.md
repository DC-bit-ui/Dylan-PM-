# Dev estimation: PM provides order + JTBD, devs size the work

**Date:** 2026-07-09
**Source:** Team feedback on the HORIZON Snapshot epic split (Teams), plus Dylan's direction in the Cowork design session.
**Type:** working-style / process rule (applies going forward).

## Rule

Do **not** impose top-down PM time estimates on development work.

- With **Claude-Code-assisted development**, traditional PM week/appetite estimates over-state build time. Do not anchor plans on them.
- **PM provides:** (a) the ordered sequence of unblocking actions, and (b) the enablement / JTBD each slice delivers (framed by "what the user — e.g. Growth — can then do", not what is built under the bonnet).
- **The dev team estimates duration bottom-up**, per triaged task. Ask them; don't tell them.
- Keep the distinction: **appetite** (a business cap on how much a thing is worth — optional, a leadership call) is not the same as an **estimate** (how long it takes — the devs' call). Only set an appetite if the business wants a ceiling; never invent a duration.

## Corollaries (from the same feedback)

- Slice epics into **small increments, each delivering a user-visible outcome** (Growth sees value once they can send a snapshot end-to-end; every later slice adds something they can see and use).
- **Sequence the native/structural-blocker work first** — resolve native integration before feature polish, because it blocks everything and is the first chunk of work anyway.
- Get the **technical lead's view (Gayathri)** on sequencing and sizing, especially for the heaviest slice.

## Applies to

All PRDs, roadmap slicing, and Jira ticket creation from here on. Reflected in the HORIZON Snapshot Native Rebuild plan (Epic AP-2609; PRD Confluence 649592856).
