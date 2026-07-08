# Grazing Planner Demo Kit

**Created:** 2026-07-08 · **Owner:** Dylan · **Spec:** [`../2026-07-08-grazing-scenario-tool-claude-design-guide-v3.md`](../2026-07-08-grazing-scenario-tool-claude-design-guide-v3.md)

Everything needed to build the functional demo on a REAL property: data prep script (tested), consolidated Claude Design master prompt, verification render.

## Contents

| File | What |
|---|---|
| `prep_demo_data.py` | Precomputes the demo bundle: parcel ranking (hot→cold) + equal-area cell splits N=2..12 + fencelines + recovery-cell carving. **Selftest passed 2026-07-08** (equal-area <2% spread, area conserved, L-shaped parcels handled). |
| `MASTER-PROMPT.md` | The one prompt to paste into Claude Design. Consolidates v2 §5 + all v3 amendments + demo staging. |
| `split_check.png` | Visual verification of the split algorithm on the synthetic selftest property. |

## To produce the real bundle (needs the property picked first)

1. **Pick the demo property:** Stormboy pipeline, completed HORIZON run, country Ben + Hobbs recognise.
2. **Export three inputs** (Gayathri/Athul, or Dylan via Claude Code against `ava-approved-front-end-customer` + PostGIS):
   - `parcels.geojson` — the property's parcel polygons (PostGIS `Parcel.boundary`, EPSG:4326)
   - `heatmap.png` + `bounds.json` — the Carbon Gradient render + its bbox (S3 model output)
   - `zones.geojson` (optional, better) — stratification zone polygons with a numeric `score` property
3. **Run:** `python3 prep_demo_data.py --indir ./property_data --name "<Property Name>" --out demo_bundle.json`
   (deps: `pip install shapely pyproj pillow numpy`)
   Sanity-check first with: `python3 prep_demo_data.py --selftest`
4. **Build in Claude Design:** attach `demo_bundle.json` + both Hobbs docs + screenshots, paste `MASTER-PROMPT.md`'s prompt block, iterate.


## Farm 217 — REAL bundle built 2026-07-08 (READY)

`farm217/demo_bundle.json` is the real thing: Farm 217, Coleambally NSW (789.7 ha total, 648.9 ha eligible, 390 mm rainfall). 16 planning units — Strength 150 ha (5 units, hot) / Stable 241 ha (5, mid) / Opportunity 212 ha (6, cold), 93% of eligible area planned, splits precomputed to each unit's area-capped max N. `farm217/units_check.png` is the verification render; `farm217/map.png` + `map.bounds.json` are the heat map base layer for the prototype.

**What the export taught us (folds back into the spec):**
- Zones ARE vectors in the export (`horizon_landscape.geojson`, class + class_value + median SOC t/ha). Cadel question half-answered; remaining half is whether the raw raster (`l1_soc.tif`) or the vectors are canonical platform-side.
- Zone classes are **Strength / Stable / Opportunity** — "Stable", not "Reference" as the earlier screenshot legend suggested.
- **No internal paddock fences in the export** — planning units are derived from zone geometry via 120 m majority-vote grid + heal + simplify (`adapt_horizon_export.py`). Units may overlap ~60 m at heal seams: render z-order cold under mid under hot; treat area sums as approximate.
- Real zone country is interleaved lace, not tidy bands — the derived-unit approach IS the product answer, not a demo hack.

**To build in Claude Design now:** attach `farm217/demo_bundle.json` + `farm217/map.png` + `map.bounds.json` + both Hobbs docs → paste MASTER-PROMPT.md's prompt block.

**Rebuild for any other property:** `python3 adapt_horizon_export.py --indir <export_dir> --name "<Name>" --out demo_bundle.json --render check.png`

## The logic layer (Dylan's foundational rule, 2026-07-08)

"It has to be logical — fencelines and suggestions must be what a farmer could actually implement, reviewed with an eye of logic." Encoded at three levels:

**L1 — buildable by construction (in the generator, shipped).** Every candidate split is validated before it enters the bundle: cells contiguous (no fragments stranded across concavities), >=120 m working width, aspect <=6:1, >=6 ha floor. The generator searches 8 cut orientations per (unit, N) and emits the first buildable one; N values with no buildable orientation are omitted — the slider goes sparse rather than showing a line a contractor couldn't build. Each shipped split carries logic metrics (fence_m, min_cell_width_m, worst_aspect). This also matches Hobbs in the source meeting: auto-drawn subdivision was rejected ("horrible failure... we don't want to do that") — generation is only acceptable when constrained to buildable geometry with the farmer adjusting.

**L2 — practicality flags (prototype + next iteration).** Fence-km per scenario displayed (cost intuition); water access is the farmer's call — v2 lets Hobbs mark existing water points and fences on screen, and proposals then reuse existing fences as free edges (the single biggest real-world implementability lever we can't see from the export).

**L3 — human logic review (process, non-negotiable).** No generated plan reaches a farmer without a named review — Hobbs, demo-day minus one: every line buildable? every cell reachable for stock and machinery? mustering makes sense? would you put your name on it? The tool's logic metrics make this a 10-minute pass, not an audit.

## Demo-day checklist

- [ ] Bundle built from the real property; splits eyeballed (render or in-tool)
- [ ] Instinct test rehearsed — Hobbs drives, taps the cold paddock deliberately
- [ ] Play-forward + pace slider rehearsed
- [ ] No eligibility claims on screen (verbal only, pending method verification)
- [ ] Closing ask ready: approve doorway section in snapshot generator + pilot on next N post-snapshot follow-ups
- [ ] Link/offline dry run same-day (lesson from the 08 Jul field test failure)

## Open dependencies

- **Cadel (this week):** "What format are RunModelUnifiedWorkflow outputs in S3 — and is the zone classification vector (stratification output) or raster?"
- Property picked → bundle → prototype. Everything else is ready.
