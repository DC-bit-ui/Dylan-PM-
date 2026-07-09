# Canva pipeline validation — Rochester Farm trial

**Date:** 8 July 2026 · **Run by:** Cowork via the Canva Connect connector · **Property:** Rochester Farm (Hart, SA), from an uploaded model-output zip.
**Purpose:** record what was proven end-to-end against the real Canva account, the exact calc trace (auditable), the outstanding maps step, and the findings that shape the build.

---

## 1. What was proven, end to end, via the API

The full fill-and-render chain ran through the Canva Connect connector, on real data, with no manual Canva work:

1. **Duplicate** the live HORIZON template (`DAHIyUSQDXc`) → working copy (`DAHOtfQwUo8`). `[verified]`
2. **Tag fields** — 11 elements tagged as autofill fields via `update_autofill_field` and committed (cover, summaries, ACCU figures, economics, rate, projects). `[verified — ops returned success]`
3. **Fill fields** from real model data — property name, both narratives, estimated ACCUs, eligible area, ACCU rate, number of projects, Option 1 baseline, Option 2 deferred, and the carbon indicators data row. `[verified — cover confirmed "Rochester Farm", committed]`
4. **Render + export** — Canva rendered and exported a print-grade A4 PDF via `export-design`. `[verified — PDF produced]`

Because Canva did the rendering, the output is marketing-grade by construction. This is the fidelity guarantee working in practice (doc 08): the connector only supplied values into named, designer-fixed frames.

**Persistent artifact:** the filled design `DAHOtfQwUo8` ([edit link](https://www.canva.com/d/cYmaIyLd4HyY9kE)). Exported PDF links are time-limited (~12 h) and regenerate on demand.

## 2. Two fill paths — and the role finding

There are two ways to fill via the API; we validated both the capability and the blocker:

- **Editing API (used here):** duplicate the design, then `find_and_replace_text` / `replace_text` / `update_fill` into elements, commit, export. **Works under Dylan's current Canva role (Member).** No brand-template publishing required.
- **Autofill endpoint (the "official" path):** requires the design **published as a Brand Template** (which exposes a dataset of named fields). Publishing failed with `User does not have permission to publish design as a brand template` — brand-template publishing needs a **Brand Designer / Admin** Canva role. `[finding]`

**Implication for the build:** the pipeline can either (a) use the editing-API path under a normal account (no publishing), or (b) run under a service account with Brand Designer rights and use the cleaner autofill endpoint. Daniel (Brand Designer) is building the proper autofill Brand Template per `Brand Template Build Spec - for Daniel.md`.

## 3. Exact calc trace (auditable) — Rochester Farm

Inputs parsed from `metadata.txt`:
`eligibleArea = 1,031.90 ha` (of 1,068.67, 96.6%) · `productionSystem = cropping` · `rainfall = 442 mm` · `soilClasses = [Chromosol]` · `pH 5.99–6.84` · `depth 0.48–2.09 m`.

Computed with the frozen engine constants (`calculator.js`):

| Output | Value | Derivation |
|---|---|---|
| Land use | cropping | contains "crop" |
| ACCU rate | **2.0** /ha/yr | `ACCU_RATES.cropping`, highest threshold ≤ 442 is 400 → 2.0 |
| Est. ACCU potential | **51,595** | round(1,031.90 × 2.0 × 25) |
| Number of projects | **3** | max(1, ceil(1,031.90 / 400)) = ceil(2.580) |
| Total cores | 72 | 3 × `CORES_PER_CEA` (24) |
| Cost per core | $315 | `getCostPerCore(72)`: 72 > 60, falls through to last band (315) |
| Baseline (Option 1) | **$22,680** | 72 × 315 |
| Deferred (Option 2) | **1,815** ACCUs | ceil(min(22,680, 50,000) / 12.50) = ceil(1,814.4) |
| Dominant soil | Chromosol | first soil class |
| Carbon row | Chromosol · 442 · Medium · Medium-High · Medium · 2.0 | `SOIL_CHARACTERISTICS.Chromosol` + rate |

This reproduced correctly for a property in a different rainfall band, soil order and scale from the earlier Eungella example, which is the real test of the fill logic.

## 4. Outstanding: maps injection (spec for engineering)

Text, numbers, economics and the carbon table are proven on real data. **Maps are the remaining build step** and are still the template's placeholder imagery in the trial PDF, because injecting a map is a render-and-upload operation, not a text fill.

The uploaded zip includes `map.png`, `map_ph.png`, `map_depth.png` **plus `*.bounds.json`** (`[[swLat, swLng], [neLat, neLng]]`) — the exact-alignment data the colour spec requested, so overlays align pixel-accurately with no 10% padding guess.

Per-map pipeline (zone / pH / depth / portfolio):
1. Read the model PNG and its `bounds.json`.
2. Fetch the Esri World_Imagery satellite basemap for those bounds at print DPI.
3. Composite the model overlay over satellite (zone fills at 80% opacity, transparency per colour spec).
4. Draw the colour-spec legend in the correct corner (tool-composed; not baked by marketing).
5. Output one high-resolution image sized for the frame (300 dpi).
6. Upload as a Canva asset (Connect API asset upload) → `asset_id`.
7. `update_fill` the map frame (`zone_map` / `ph_map` / `depth_map` / `portfolio_map`) with that `asset_id`.

Portfolio map additionally plots the property point and nearby project points from portfolio data at the chosen radius. This step needs a hosted/served image (asset upload), so it belongs in the platform pipeline, not an interactive session.

## 5. Findings that shape the build

- The **editing-API fill path removes the brand-template-publishing dependency** entirely — worth weighing against the autofill endpoint for the production design.
- **Brand-template publishing is role-gated** — if we use the autofill endpoint, the pipeline account needs Brand Designer rights.
- **`bounds.json` is now present** in model output — lock this in as a required model-output field; it makes map alignment exact.
- **Carbon table** works by filling the existing empty data-row cells — no table rebuild needed.
- Everything text/number is **real-pipeline-ready**; maps are the one defined remaining engineering task.
