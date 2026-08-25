# Commercial Module Console

**Jira epic:** not yet assigned · **DRI:** Dylan · **Stage:** Prototyping · **Created:** 2026-08-25 (file created; work running since 2026-07)
**Source:** Running Cowork prototyping thread; product walkthrough and UI review with Kieren 2026-08-24 (Granola, "Horizon module dashboard - map interface, delivery tracking, and marketplace features").

**Workspace:** all deliverables live in the top-level folder **`/Commercial Module Console/`**. See its `README.md`. This file is the `memory/initiatives/` index entry.

## What it is
Buyer-facing console for a commercial module holder. Demo configuration is a large emitter, BHP, holding a 125,000 ha soil carbon module: seven year term, five crediting years, 220,000 ACCUs committed at the purchaser's share. Four time states (pre-launch, month 6, first crediting, at capacity) and a tab structure of Module Fill, Delivery, and a HORIZON marketplace of additional capabilities and credit lines.

## Two build paths, and they are never mixed
- **Console** goes to **Claude Design**, via briefs and prompts from the workspace.
- **Frontier** map layers go to the **dev team, who pass them to Claude Code**. The `frontier-handoff/` folder is written as a Claude Code task and is self-contained.

## Tab ownership, settled 2026-08
Module Fill covers recruitment of projects into the module and nothing else. Delivery covers ACCU delivery only: committed, forecast, actualised. Management asked for a single key focus per tab and placement is enforced strictly.

## Standing constraints
Report outcomes never process · modelled and forecast described as such · no price commentary anywhere (AFSL) · cohorts are dots never shapes · harvest and credit application are annual per cohort · volumes are the purchaser's share · Australian English and no em dashes · visual led with three type sizes as the ceiling · project references never landholder names · HORIZON is a tree ensemble, never call it a neural net.

Full list and the validated palette are in the workspace `README.md`.

## Open / next
- FY32 is labelled Delivered and runs short while both headlines read above target. Highest priority defect.
- Project state encoding on the map is posed and unresolved after four attempts; the constraint set (CVD, satellite basemap, 5px marks, two hues already spent) has defeated every colour-only answer.
- The parent level above a single module is specified but unnamed and unbuilt. BHP is expected to take ten modules.
- Demo holder still named **Corporate Carbon**, which is AgriProve's own AFS licensee and a real counterparty. Rename before anything goes to BHP.
- Assign a Jira epic key and add to `INDEX.md` on the next regeneration.

## Changelog
- **2026-08-25** — Workspace created and back-filled with the full prototyping history: 27 briefs, 18 design prompts, 27 renders, the Frontier handoff package, research and review rounds, and four source transcripts. BHP FY2026 refresh absorbed (see `../learnings/2026-08/2026-08-25-bhp-fy2026-refresh-nature-gap.md`).
- **2026-08-24** — UI review with Kieren. Verdict "a lot cleaner and simpler". Four fixes called: remove the approximate symbol from all numbers, drop the "First round is yours" block title, fix the dot chart trend line, make the map legend for the project state ramp more prominent. Direction: get the first two tabs right before building further. SLT showcase 2026-08-25.
- **2026-08** — Marketplace and Credits reworked. Four framework tags found to name retired, superseded or closing standards (see `../learnings/2026-08/2026-08-24-retired-frameworks-on-buyer-surface.md`).
