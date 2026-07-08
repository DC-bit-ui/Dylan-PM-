# Consents: property ↔ project level model (Jo call)

**Date:** 2026-06-24
**Type:** domain process + design IA (durable)
**Source:** Granola — Call with Joanne Curran, 2026-06-24 (prototype review), doc id `209df1e7-8e31-47ed-b560-a905890a0941`
**Confidence:** [high] for the level map (direct from Jo); [moderate] on Native Title tool name

## The level map (which Consents work is property- vs project-level)

| Stage | Level |
|---|---|
| Convert | Property |
| Land titles (purchase · confirm · exclude · DBYD · Native Title) | **Property** — all titles for the property |
| KCT mapping | **Project** — mapping is what SPLITS the property into carbon projects |
| Title → project allocation | bridge — during/at end of mapping, after draft sample plans |
| EIH identification | **Project** (title-tied) — different titles have different EIHs |
| Carbon Project Plan (CPP) | **Project** — one per project, after draft sample plans |
| KCT | **Property** — ONE KCT for all projects; bundles every CPP + sample plan |
| EIH-C packs | **Project** (entity, title-tied) |
| Registration (CSV) | **Project** — each project registered separately |

**Structural consequence:** the prospective-project page is a *property workspace containing one or more carbon projects*. Model as two zones with mapping as the fan-out divider: Zone 1 property-level (Land titles, KCT, summary, singular); Zone 2 per-project (mapping, EIH, CPP, EIH-C, registration, repeats). The earlier flat 4-tile home under-models this; the "KCT + EIH-C" tile in particular conflated a property-level doc (KCT) with project-level docs (EIH-C). Supersedes the IA in `EIH Automation/docs/2026-06-12-claude-code-v3-prospect-tiles-fix.md` (build/reuse rules in the V3 brief still stand).

## New requirements/gaps Jo surfaced
- **Native Title check** in the Land titles stage (alongside DBYD); DB = "Native Title Vision"; in SOP002 (Dylan authored) — confirm exact name.
- **Map view on Land titles** — see where each title sits, for exclusion decisions.
- **View purchased titles in-app** (not only SharePoint folder).
- **EIH list shows which project(s)** each holder relates to.
- **CPP bundled into the consents/documents area** (CPP + KCT + EIH-C together) — Jo agreed.
- **EIH-C sent before registration** even if not returned — don't block crediting on consent.
- **List naming**: property names inconsistent (landholder name vs farm name) → standardise on farm name; multi-tag search (property / project / landholder name) — current single-tag search fails.
- **Exclude button** also handles sold / wrong-name titles, not just easements.

## Process facts (current state)
- Jo today mostly does NOT collect EIH consents (most titles have a mortgage; KCT urgency); Imogen + Dylan have handled EIH. One done: single person on title, emailed pre-filled form, signed back in ~1 day.
- CPP done ~75% of the time AFTER draft sample plans (needs mapping pictures/paddock maps).
- One KCT per property bundles all projects' draft sample plans + CPPs.
- Land-title purchase confirms against LMS-call info (catches EIHs the landholder overlooked).

## Resolved in asset-set review (2026-06-24)
- **IA = stage model, not two-zone.** The detail page keeps the validated **4-stage** structure (Land Titles → KCT Mapping → Consents → Registration) that Jo liked; the property↔project level is handled *within* stages (sub-project switchers + level labels + a "mapping splits the property" divider at the Mapping stage). The two-zone remix is a comparison only — its level-signalling ideas are harvested into the stage model. [Dylan, 2026-06-24]
- **No "blocked" states anywhere.** Every stage/action always accessible; state shown via status + recommended next action, never a lock. **Registration is never gated on EIH-C completion** — packs are built + sent, outstanding consents are flags; encourage unconditional declaration as the goal but never require it (bank turnaround). The EIH-C pack gives the entity what they need to sign confidently; the signed return is async. [Dylan, 2026-06-24]
- **Sample data = Crown J (prospect)**, not Hodges (active project) — unify all briefs onto Crown J / Jason Waugh / NSW-DP.
- **List interaction:** single-click row → RH preview/summary panel (+ quick stage links + "Open project"); double-click → full open. (Single-click always does something useful.)
- **6-step mapping order = EAAs → CEAs** (live ops-app order; build brief had it reversed).
- **Land-titles map = titles only (no project assignment).** At Land titles the property isn't split into carbon projects yet, so the include/exclude map shows titles only (model: ops-app "Manage parcels" — parcels outlined + labelled + trash-to-exclude). Project-coloured assignment lives at the KCT mapping **Configuration** step (model: ops-app Configuration — satellite map + Land Title Parcels list + "Assign to CPx" + Project Summary table + 400 ha threshold warning). Showing project colours at Land titles would be misleading. Reference shots: save the two ops-app screenshots to `EIH Automation/docs/reference/ops-app-maps/` (`manage-parcels-map.png`, `kct-mapping-configuration.png`). [Dylan, 2026-06-24]
- **Native Title check (grounded — OPS002 §5.1 + CER).** Required BEFORE lodging registration. Process: search the project area in **Native Title Vision** (NNTT), enable Native Title Determinations + ILUA layers, check overlap, open the Register Extract; store NNTR extract + ILUA export + Schedule 2 (written description) + Schedule 3 (map). Three outcomes: (1) **none** → clear; (2) **extinguished** (freehold / pre-23-Dec-1996 exclusive possession, s23B NTA + State validation act) → record an extinguishment statement + evidence for the CER form's Native Title/ILUA sections; (3) **not extinguished** → a **Native Title EIH** (registered claimant / native title body) whose consent is required (free/prior/informed; two-stage for native-title/claimed land). Consent **gates ACCU issuance (crediting), not registration** — conditional declaration at registration, unconditional needed before end of first reporting period, no ACCUs until all consents in. This regulator rule is the external basis for the whole "don't block registration on consents" design decision. SME: Dylan Jones. Real example: UL Toweran Park (QLD, QCD2017). Sources: OPS002 §5.1; CER legal-right/EIH/native-title guidance; CFI Act 2011 s43–45A; NTA 1993 s23B. [2026-06-24]

## Prompting Claude Design — one gap per prompt for novel components
- Chunk 2 bundled 5 gaps; the design **dropped the most complex/novel one** (the map view — which also needed a new component + the reference image). Lesson: when enhancing an existing design, run novel/component-heavy additions as their **own focused single-purpose prompt** (with its reference image attached); only bundle small tweaks. Confirmed live 2026-06-24 (map view absent after the bundled Chunk 2). [Dylan, 2026-06-24]

## KCT mapping is in-app automation now (correction) + Project KCT Phase 3B overlap
- **KCT mapping happens in-app via automations (the "Project KCT" tool), NOT in GIS/QGIS.** [high — Confluence] Steps: Configuration → Exclusion zones → EAAs → CEAs → Stratification → Sample points. EZ auto-detection (raster DEM-H/NDVI); **CEA auto-generation via PostGIS GraphQL mutation** (`kctCeaCreate`: net area = TotalArea − EZ; ≤400 ha → 1 CEA; >400 ha → split by cadastral parcels; then confirm / exclude / import-shapefile). 200–400 ha = `needs_manual_review` **warning, never a block** (corroborates the no-blockers rule). **QGIS is only a shapefile-import escape hatch.** Corrects the earlier "launch into GIS" framing in the prompts + kct-mapping-requirements doc. Refs: Project KCT Phase 3 (Confluence p.624295945), KCT CEA Creation (p.547160067). [Dylan, 2026-06-24]
- **Overlap to coordinate (PM seam):** Project KCT **Phase 3 Workstream B** (Steve) proposes a **Status & Audit Matrix** — child projects × Mapping / CPP / Registration-EIH, with an EIH rollup + per-title drill + audit log — explicitly surfacing the EIH/registration process with the same "flag, don't block" + "title as source of truth" principles as the Consents/EIH workspace. This **overlaps** the Consents Phase 1 child-project status surface. Don't build a second one; settle the seam with Steve (the "projects restructure — Dylan with Steve's input" item). Phase 3B prototype: project-passionate-graham-829.magicpatterns.app. [Dylan, 2026-06-24]

## Seam resolved with Steve (1-on-1, 23 Jun 2026)
Source: Granola "SLM / DC 1-on-1 — PM alignment" (7d2df874-17f1-4f47-9335-cb0f30895354).
- **Consents-workspace ↔ Project KCT seam resolved in favour of the clean JTBD home.** [high] Go with Dylan's **property-level 4-tile home**; NO child-project status matrix at the top. Steve agreed his Phase-3B matrix "elevates the child-project view" and inverts the level order (EIH/consents above projects; only mapping is per-child). **Child-project status lives BEHIND the KCT mapping tile** — Steve/Gayathri build it inside Project KCT after the intra-land-title project config ships (current ops blocker). This property-status home is also the **template for the active-project restructure**.
- **Add a property-level audit log** (peer to the 4 tiles, quiet drawer): chronological events Completed · Signed off · Reverted · Exported, filterable + exportable. Build now, extend later — keep JTBD-clean, not Steve's busy matrix.
  - **Decision (2026-06-24):** build it into the prototype now as a lightweight, read-only **quiet drawer** (closed by default; filters by stage / sub-project / event type; export). Scope = **event instrumentation** (capture every consequential state change with actor + timestamp + evidence link) + the drawer; defer richer UI. **Append-only, derived from real state-change events** (never hand-maintained). **One shared trail with Project KCT Phase-3B** (coordinate with Steve) — not two. Prioritise **below the core spine**. Justification: CER record-keeping / audit evidence for legal right + EIH consents, and it's the natural home for the "never claim done without evidence" rule. Asymmetric bet — capture pays off even if the UI is rarely opened.
- **Deep-link status indicators**: clicking a stage's status jumps straight into that stage for the next batch (saves the open-project→open-stage double-click), like the current progress timeline.
- **CPP placement:** Dylan = in the Consents/documents bucket (it's document generation, PandaDoc); Steve sees it near-equal-level and notes it needs paddock maps and is often done around draft mapping — minor sequencing nuance, not blocking.
- **Build sequence/ownership:** Gayathri builds the mapping-status revamp after the intra-land-title config; EIH side functional on Claude Code pending Cadel's data-structure decision. Tooling: Steve = Magic Patterns (Claude→MP, branch-friendly); Dylan = Claude Design (higher fidelity + handoff to Cadel/Claude Code).

## Mapping mirror = per-project sequential; don't reproduce the in-app editor
- The KCT-mapping stage in the Consents workspace mirrors **per carbon project, sequentially**: Configuration creates CP1…CPn once (property-level), then Jo works each project through Exclusion zones → EAAs → CEAs → Stratification → Sample points to completion before the next. Mirror shows per-project step status + "Open in the KCT mapping tool"; it must NOT reproduce the parcel-assignment dropdowns or CEA-generation editor (those live in the tool). [Dylan, 2026-06-24]
- **Prompting lesson:** attaching the Configuration *editor* screenshot made Claude Design reproduce the editor inline. For a status-MIRROR, attach the status/steps screenshot (`kct-mapping-steps-nav`), not the editor screenshot — match the reference asset to the intent (mirror vs build). [Dylan, 2026-06-24]

## Artifacts
- `EIH Automation/docs/2026-06-24-property-project-level-and-claude-design-prompts.md` — analysis + 3 stage-model Claude Design prompts (list · workspace · level-legibility remix).
- Canonical specs: `2026-06-24-prospective-projects-claude-design-brief.md` (master), `2026-06-24-operationalisation-playbook.md`, `2026-06-23-{land-titles,kct-mapping,consents,registration}-requirements.md`, `2026-06-23-consents-claude-design-brief.md`.
