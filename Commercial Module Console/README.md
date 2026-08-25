# Commercial Module Console

Buyer-facing console for a commercial module holder. The demo configuration is a large emitter, BHP, holding a 125,000 ha soil carbon module over a seven year term with five crediting years and 220,000 ACCUs committed at the purchaser's share.

**Workspace convention follows `/Farm Map Drawing Tool/`.** The `memory/initiatives/` entry for this initiative is `commercial-module-console.md`; this folder holds the deliverables.

**Last updated:** 2026-08-25.

---

## Two build paths, never mixed

| Surface | Built by | Route |
|---|---|---|
| **Commercial module console** | **Claude Design** | Briefs and prompts from this folder go straight to Claude Design |
| **Frontier** map layers | **Dev team, who pass to Claude Code** | `frontier-handoff/` is written as a Claude Code task |

This separation is a standing instruction and has been enforced since 2026-08. Do not put console work in a dev handoff or Frontier work in a Claude Design brief.

---

## Folders

| Folder | What is in it |
|---|---|
| `briefs/` | Claude Design briefs, one per surface or panel. The current set is `BRIEF-marketplace-substance.md`, `BRIEF-credits-sell.md`, `BRIEF-project-marks.md`, `BRIEF-reconciliation-and-calendar.md`, `BRIEF-multi-module.md`, `BRIEF-map-lenses.md` |
| `design-prompts/` | Paste-ready prompts. **`PROMPTS-claude-design.md` is the current live set**, five sequenced prompts written problem-first with no solutions in them |
| `renders/` | Concept renders referenced by the briefs. These are illustrative, drawn to carry an idea, and the styling is explicitly not the proposal |
| `data/` | Geofabric River Regions v3.3 catchment boundaries, deployment zone hexagons, illustrative portfolio and calibration data |
| `frontier-handoff/` | The Frontier map layer package. Self-contained, written so the dev team can pass the folder to Claude Code unchanged |
| `research/` | Diagnosis passes, the buyer persona built from call transcripts, and `REFRESH-implications.md`, which is the current read on BHP's FY2026 disclosures |
| `reviews/` | Feedback rounds from Kieren, Hobbs and the product workshop, plus the SLT showcase triage |
| `transcripts/` | Source call recordings the persona and positioning were built from |

---

## Standing constraints on the console

These have each been corrected at least once and are settled.

- **Report outcomes, never process.** Nothing about how we source, organise or schedule work appears on a buyer surface. Recruitment source and deployment zones were both removed under this rule.
- **Modelled and forecast figures described as such**, never as measured, validated or issued.
- **No price commentary anywhere.** AgriProve is an authorised representative of an AFS licensee and ACCUs are financial products. Counts, capacities and volumes only.
- **Cohorts are dots, never shapes.** No polygon, connecting line, or any mark spanning between cohort members. A cohort holds no territory.
- **Harvest and credit application are annual per cohort.** Nothing may imply volume can be pulled forward at will.
- **Volumes are the purchaser's share.**
- **Australian English, no em dashes anywhere including titles.** Spaced hyphens instead.
- **Visual led, with as little copy as possible.** Three type sizes is the ceiling. A sentence needed to explain a mark means the mark wants changing.
- **Project references, never property or landholder names.**
- **Do not call HORIZON a neural net.** It is a tree ensemble and the audience contains people who will ask.

## Validated palette

Dark console surface. Validated with the dataviz palette checker against protanopia and deuteranopia.

```
Area fills:      #7f9c18 olive (carbon)  ·  #3987e5 blue (water)   ΔE 27.9 protan
Stroke/marker:   #cdfd29 lime  (low opacity fill only, never an area fill)
Project ramp:    #6f8c17 → #a3c721 → #cdfd29   3.99:1 on satellite land
```

Known failures, do not reintroduce: the house green/green/orange convention collapses to ΔE 0.1 under deuteranopia; olive against orange is ΔE 1.5 under protanopia, which is legal in a fixed-order bar and illegal on scattered map dots.

---

## Open items

- The FY32 delivery year is labelled Delivered and runs short while both headlines read above target.
- Project state encoding on the map is posed and unresolved.
- The parent level above a single module is specified but unnamed and unbuilt.
- The demo holder is still named **Corporate Carbon**, which is AgriProve's own AFS licensee and a real counterparty. Rename before anything goes to BHP.
- Jira epic key for this initiative is not yet assigned.
