# ACWIS / RC Block Set — Water + Erosion (Verterra)

**Author:** Dylan Cronje (drafted with Claude) · 2 July 2026
**Depends on:** the block model in `01-block-template-datasource-model.md`
**Blocking dependency:** the Verterra ACWIS API contract (being defined with Ben). Everything marked `[DEP: Verterra]` is a placeholder until that contract lands. Do not build against these shapes until confirmed.

---

## 1. What this is and why it reuses the HORIZON structure

ACWIS/RC (water and erosion opportunity, from the Verterra partnership) is a **second opportunity type** that renders through the *same* block machinery as soil carbon. The insight from the block model: HORIZON and Verterra both produce the same *shape* of story — an area of interest, a capacity-for-change signal, and a set of ranked opportunity zones with a narrative. Only the **data source and adapter** differ; the render partials and copy scaffolding mirror HORIZON.

This is the payoff of the registry: the "opportunity-zone map + summary" block already exists for soil carbon (`horizon-analysis`). ACWIS is a new `DataSource` + `Adapter` + a small number of ACWIS-specific block types, assembled into a `stacked-opportunity` template — **not** a render rebuild.

Phasing per your constraint: **this is Phase 2. It ships after the parity rebuild and is gated on the Verterra contract.** Nothing here should hold up Phase 1.

---

## 2. The AOI → capacity → zones flow

```
Farm Map draw tool (Frontier)          Verterra ACWIS API [DEP]           ACWIS blocks
   user draws AOI polygon   ──POST──▶   capacity-for-change +    ──adapter──▶  acwis-analysis
   (GeoJSON, EPSG:4326)                 highest-impact zones                   acwis-impact-zones
                                        (water + erosion)                      acwis-opportunity-potential
```

- **AOI in.** The Farm Map draw tool (Frontier) emits a GeoJSON polygon (the area of interest). This is the ACWIS analog of HORIZON's `input.geojson` eligible-area boundary. `[ASSUMPTION]` the draw tool already exists in Frontier and can emit a polygon; confirm with the platform team.
- **Verterra out.** The API returns a capacity-for-change score and ranked highest-impact zones for water retention and erosion mitigation, as vector features. `[DEP: Verterra]`
- **Adapter.** Maps the Verterra payload into the same typed `blockData` the opportunity-zone render partial consumes (zone geojson + ranked zones + headline metrics), so the map and summary partials are reused, restyled with an ACWIS legend.

---

## 3. New DataSource registry entry

```jsonc
DataSource {
  "id": "verterra-acwis",
  "kind": "external-api",
  "label": "Verterra ACWIS (water + erosion)",
  "fetch": {
    "op": "POST /acwis/analyse",          // [DEP: Verterra] — path TBD
    "params": ["aoiGeojson", "opportunityTypes"],  // e.g. ["water","erosion"]
    "returns": "AcwisPayload"
  },
  "piiFields": [],                          // AOI carries no landholder PII by design
  "cacheTtl": 3600,
  "status": "blocked-on-contract"
}
```

### Proposed `AcwisPayload` shape `[DEP: Verterra — propose to Ben]`

This is the contract to pin down. Structured to mirror `HorizonPayload` so the adapter is thin.

```jsonc
AcwisPayload {
  "aoi": { "geojson": {...}, "areaHa": 128.4 },
  "capacityForChange": {                    // the ACWIS analog of "ACCU rate"
    "water":   { "score": 0.72, "band": "high",   "unit": "index 0-1" },
    "erosion": { "score": 0.55, "band": "medium", "unit": "index 0-1" }
  },
  "impactZones": {                          // the analog of HORIZON zones
    "geojson": {...},                       // vector features, one per zone
    "features": [
      { "id":"z1", "type":"water",   "rank":1, "impact":"high",   "areaHa":22.1, "metric":{ "name":"retention uplift", "value":..., "unit":"..." } },
      { "id":"z2", "type":"erosion", "rank":1, "impact":"high",   "areaHa":8.7,  "metric":{ "name":"erosion reduction", "value":..., "unit":"..." } }
    ]
  },
  "headline": {                             // for the potential card
    "waterRetentionPotential":  { "value":..., "unit":"..." },
    "erosionReductionPotential":{ "value":..., "unit":"..." }
  },
  "modelVersion": "acwis-x.y",
  "disclaimer": "estimates from spatial modelling"
}
```

Open questions for the contract (route to Ben):
1. Units and bands for capacity-for-change — index, tonnes, ML, or category? Copy and legend design depend on this.
2. Are impact zones returned as vector GeoJSON (preferred — renders like the HORIZON vector path in `01`, §2.5) or raster PNGs (would reintroduce the pixel fragility)?
3. Is there a monetisable/RC-credit output (like ACCUs) or is the value framed non-financially (resilience, productivity)? This determines whether there is an "economics"-style block for ACWIS.
4. Auth model, rate limits, latency, and whether analysis is synchronous or async (poll/callback). Affects the editor UX (spinner vs "generating…" state).
5. Does Verterra need any property context we already hold (soil, rainfall) as input, or only the AOI polygon?

---

## 4. New Block Types

Mirror the HORIZON dynamic blocks. Each declares source `verterra-acwis`, a copy prompt, and a render partial reusing the opportunity-zone slot pattern.

| Block Type | Mirrors | Slots | Copy prompt |
|---|---|---|---|
| `acwis-analysis` | `horizon-analysis` (p2) | `mapLayer` (impact-zone geojson), `legend` (ACWIS water/erosion), `summaryText` (~150w) | `acwis-page2` — explains capacity-for-change + zone meaning; register-aware; narrative guide + disclaimer applied |
| `acwis-impact-zones` | `soil-carbon-indicators` table (p3) | `impactTable` (ranked zones: type, rank, area, metric) | none (data-only) or short caption |
| `acwis-opportunity-potential` | `portfolio-accu-potential` (p4) | `headlineMetric`, `capacityTiles` (water score, erosion score), `summaryText` | `acwis-page4` — potential framing, hedged language |

### `acwis-analysis` BlockType

```jsonc
BlockType {
  "id": "acwis-analysis",
  "label": "ACWIS Analysis (water + erosion opportunity)",
  "category": "dynamic",
  "pageAffinity": null,               // placed by template order, not a fixed HORIZON page
  "source": {
    "dataSourceId": "verterra-acwis",
    "requires": ["impactZones.geojson", "capacityForChange", "aoi.areaHa"]
  },
  "copy": {
    "promptId": "acwis-page2",
    "wordTarget": 150,
    "registerAware": true,
    "usesNarrativeGuide": true,
    "regenerable": true
  },
  "render": {
    "partialId": "partial.opportunity-analysis",   // REUSED partial, ACWIS legend variant
    "slots": [
      { "name":"mapLayer",   "type":"map",    "fromData":"impactZones.geojson" },
      { "name":"legend",     "type":"legend", "static":"acwis-zones" },
      { "name":"summaryText","type":"prose",  "fromCopy":"acwis-page2" }
    ]
  }
}
```

### Copy prompt `acwis-page2` (draft, honours the same copy rules)

> System: You are writing the water-and-erosion opportunity summary for an AgriProve landholder snapshot. ~150 words. No em dashes. Defensible language only ("estimated", "potential", "could support"). Apply the standing narrative guide. Include the geospatial disclaimer that figures are estimates from spatial modelling. Do not invent numbers not present in the data. Register: {{register}}.
>
> Data: AOI area {{aoi.areaHa}} ha. Capacity-for-change — water {{capacityForChange.water.band}}, erosion {{capacityForChange.erosion.band}}. Highest-impact zones: {{#each impactZones.features}} {{type}} rank {{rank}}, {{areaHa}} ha {{/each}}.
>
> Write the summary explaining what the highest-impact water and erosion zones mean for this property and where change could have the most effect.

Watch-out to bake into the prompt `[moderate]`: ACWIS/RC value is often non-financial (resilience, productivity) and the evidence base differs from soil carbon. Keep claims conservative and avoid implying a credit/payment unless the contract confirms an RC-credit output (open question 3 above). This matters for defensibility — do not let the ACWIS copy borrow soil-carbon's ACCU-dollar confidence.

---

## 5. New Template — `stacked-opportunity`

Soil carbon + ACWIS in one snapshot. Reuses all HORIZON blocks, inserts the ACWIS block set after the soil-carbon potential page, before the economics/brand pages.

```jsonc
Template {
  "id": "stacked-opportunity",
  "label": "Stacked Opportunity (Soil Carbon + Water/Erosion)",
  "blocks": [
    { "blockTypeId":"cover", "locked":true },
    { "blockTypeId":"horizon-analysis" },
    { "blockTypeId":"soil-carbon-indicators" },
    { "blockTypeId":"portfolio-accu-potential" },
    { "blockTypeId":"acwis-analysis" },              // ← new
    { "blockTypeId":"acwis-impact-zones" },          // ← new
    { "blockTypeId":"acwis-opportunity-potential" }, // ← new
    { "blockTypeId":"background", "locked":true },
    { "blockTypeId":"agriprove-economics" },
    { "blockTypeId":"difference", "locked":true },
    { "blockTypeId":"advantage", "locked":true },
    { "blockTypeId":"process", "locked":true },
    { "blockTypeId":"your-accus", "locked":true },
    { "blockTypeId":"assessment", "locked":true },
    { "blockTypeId":"contact", "locked":true },
    { "blockTypeId":"growth-summary", "category":"internal" }
  ]
}
```

The Growth Summary block's prompt gains an ACWIS-aware branch so the internal handoff covers both opportunity types (Opportunity / Profile / Watch-outs / Next step across soil carbon *and* water/erosion).

---

## 6. ACWIS legend (render)

New static legend component `acwis-zones` for the reused map partial. Colours `[ASSUMPTION]` pending Verterra brand/spec — propose:

| Layer | Proposed hex | Note |
|---|---|---|
| AOI boundary | `#E74C3C` 2px solid | reuse HORIZON boundary style for consistency |
| Water — high impact | `#1F78B4` | blue family for water |
| Water — medium | `#7FB8DE` | |
| Erosion — high impact | `#B15928` | earth/brown for erosion |
| Erosion — medium | `#D9A46B` | |

Confirm against Verterra brand before build. Same 80% opacity-over-satellite treatment as the HORIZON zone map (colour spec §1) so the two opportunity maps read as a set.

---

## 7. What is reused vs net-new (ACWIS only)

**Reused:** the opportunity-analysis render partial, the potential-card partial, the register system, narrative guide, editorial memory, cost tracking, the editor, the PDF/tokenised-URL render path, the Growth Summary structure.

**Net-new:** the `verterra-acwis` DataSource + adapter, three ACWIS block types, two ACWIS copy prompts, the ACWIS legend, the `stacked-opportunity` template, and Farm Map draw-tool → AOI wiring. All of it is additive — no change to the soil-carbon path.

**Hard dependency:** the Verterra API contract (§3). Until it is signed off with Ben, treat §3–§6 shapes as proposals, not build targets.

---

## 8. Reef Credit — a parallel opportunity type

Reef Credit (Great Barrier Reef catchment water-quality credits) is another **interest point** (see `01` §4C) and follows this exact pattern: a new `reef-credit` DataSource + adapter, a set of `reef-credit`-tagged blocks mirroring the opportunity-analysis / impact-zones / potential structure, and inclusion in stacked templates (e.g. `{soil-carbon, reef-credit}` for a cane property in a reef catchment). It reuses the same render partials, register, narrative guide and PDF path.

`[moderate]` Reef Credit has its own scheme, methodology and (likely) data provider, distinct from Verterra ACWIS. So it is a **separate data-source + methodology contract**, a new dependency, not a rename of ACWIS. Confirm the provider, the returned metrics (water-quality/pollutant-reduction units), and whether it yields a tradable credit (affects whether it gets an economics-style block). Until that contract exists, `reef-credit` blocks preview structure only and mark data "coming soon". Phase it after ACWIS unless a specific reef-catchment commercial push pulls it forward.
