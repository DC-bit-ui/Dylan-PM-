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
