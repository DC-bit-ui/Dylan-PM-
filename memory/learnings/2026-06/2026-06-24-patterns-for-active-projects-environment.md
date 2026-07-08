# Patterns from the Consents/Prospects build → apply to the Active Projects environment

**Date:** 2026-06-24
**Type:** design IA + process patterns (forward-looking)
**Source:** the EIH/Consents prospective-projects workspace build (June 2026). See `EIH Automation/docs/2026-06-24-property-project-level-and-claude-design-prompts.md`, the `2026-06-23-*-requirements.md` per-stage docs, and `2026-06-24-claude-code-handoff-brief.md`.
**Why this exists:** Dylan + Steve agreed the prospect property-status home is the **template/foundation for the active-projects restructure** ("the projects area feels like a mess"). The active work runs in a separate chat thread that starts without this context — this note carries the transfer.

## Design / IA principles that transfer
1. **Singular-vs-repeating is the IA backbone.** A property contains one or more carbon (sub)projects. Property-level work is singular/shared; per-carbon-project work repeats. The active home should be a **property overview + per-CP drill**, not a flat project list. Ask "what's singular vs what repeats?" first; the layout follows.
2. **JTBD-clean home; lifecycle stages as primary nav.** Organise around the jobs/stages, not data objects. Clean property summary + tiles + drill-in. Don't elevate child-project granularity to the top — keep it behind the relevant stage tile.
3. **No "blocked" / "locked" anywhere.** Uniform done / current / to-do / up-next; flags not blocks; everything accessible; recommended next action over locks.
4. **Mirror, don't rebuild; respect tool seams.** Where work lives in another tool (HORIZON runs, the sampling pipeline, CER reporting, Project KCT), mirror status + deep-link — don't reproduce the tool. Coordinate seams early to avoid duplicate surfaces (cf. the Project KCT overlap with Steve).
5. **Single-click preview + deep-linked status.** List → RH preview (summary + quick-links + open); status indicators jump straight into the stage (saves clicks).
6. **Multi-tag search + farm-name naming.** Searchable by farm / property / project / landholder; standardise the farm name. Same operator pain in both environments.
7. **Audit log / event instrumentation as the system-of-record layer.** Even more central for active/crediting projects (CER reporting, offsets reports, audits, ACCU issuance). Capture consequential state changes (actor + timestamp + evidence link), append-only, quiet drawer, one shared trail.
8. **Evidence-based "done" + reconciliation.** Status derived from real signals; never claim done without evidence (system + timestamp + link).

## Process / build principles that transfer
- **Enhance, don't rebuild:** functional substrate + validated structure; wire real functions behind the validated skin.
- **Chunk into discrete workflows; one gap per prompt for novel components** (bundling makes the design drop the most complex one).
- **Match the reference asset to the intent:** a status screenshot for a mirror, NOT the editor screenshot (attaching the editor shot made the design reproduce the editor).
- **Ground in current state before designing:** SOPs (OPSxxx) + the regulator (CER) + the actual in-app tools/automations. Validate current-state (e.g. the "mapping is in-app now, not GIS" correction); don't assume.
- **JTBD-led prompts that set direction** and let the design solve creatively — not greenfield spec-dumps.
- **Coordinate cross-team seams early** (Steve / Gayathri / Cadel) to clarify ownership and avoid duplicated surfaces.

## The one big ADAPTATION — don't copy blindly
The prospect flow is a **linear, one-way pre-registration funnel** (Land titles → mapping → consents → registration → done). The **active/crediting lifecycle is CYCLICAL and long-running** (~25-yr permanence): recurring annual reviews, repeating sampling/measurement rounds, crediting periods, offsets reports, audits, and standing permanence/maintenance obligations (carbon-maintenance / relinquishment risk).

So: reuse the shell + the 8 principles, but **rework the stage model from "stages to completion" into "recurring cycles + due dates + standing obligations."** The status vocabulary needs time/recurrence (e.g. "Measurement round 3", "2026 offsets report due", "next sampling in 18 months", "permanence: yr 7 of 25"), not just done/to-do. Surface deadlines and obligations as first-class. Audience/JTBD also broaden (active adds compliance + landholder reporting), and permanence/maintenance has no pre-registration analogue — design it in.
