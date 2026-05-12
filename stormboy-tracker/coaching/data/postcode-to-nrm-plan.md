# Postcode → NRM region lookup — implementation plan

**Status:** Plan only. Build deferred.
**Used by:** B2 twin matching (region similarity), A1 friction analysis (regional patterns), B1 coaching (region-grounded language).

## Why NRM regions, not states

AgriProve's HubSpot has no `region` field on deals. Contact has `state` (NSW, VIC, etc.) — too coarse for meaningful B2 matching (most NSW deals would match each other, drowning the signal).

NRM regions (Natural Resource Management — ~56 across Australia, managed by Catchment Management Authorities) cluster by:
- **Soil type** (heavy clay, sandy loam, podzolic, etc.)
- **Rainfall band** (annual mm, seasonal pattern)
- **Production system** (broadacre cropping, mixed grazing, dairy, horticulture)
- **Vegetation / land-use history**

These are exactly the variables a 25-year soil carbon project depends on. A Riverina mixed-grazing customer faces different soil-carbon dynamics than a Northern Tablelands grazier — even though both are NSW.

## Source options (ranked)

### Option A — ABARES farm-region concordance (Recommended)
- **Source:** `data.gov.au` — Australian Bureau of Agricultural and Resource Economics and Sciences publishes a postcode (POA) to ABARES farm-region concordance.
- **License:** Creative Commons Attribution.
- **Granularity:** ~17 ABARES farm regions (coarser than 56 NRM, but more stable boundaries and explicitly tied to agricultural production).
- **Format:** CSV, ~3000 postcode rows.
- **Recommendation:** start here. ABARES farm-regions are the most-used standard for ag analytics in Australia and align with how landholders self-identify.

### Option B — DCCEEW NRM region boundaries
- **Source:** Department of Climate Change, Energy, the Environment and Water — publishes the canonical 56 NRM region polygons.
- **License:** Creative Commons.
- **Granularity:** 56 regions, finer detail.
- **Format:** Spatial (shapefile/GeoJSON). Requires postcode centroid lookup → spatial intersect — extra processing step.
- **Recommendation:** v2 upgrade if ABARES concordance proves too coarse.

### Option C — State CMA / NRM body publications
- **Source:** Each state has its own CMA structure (Local Land Services NSW, Catchment Management Authorities VIC, etc.). Some publish postcode lookups.
- **Granularity:** varies.
- **Recommendation:** patchy coverage; not preferred.

## Output format

`coaching/data/postcode-to-nrm.json`:

```json
{
  "version": "1.0",
  "source": "ABARES farm-region concordance",
  "generated_at": "ISO",
  "lookup": {
    "2650": "Riverina",
    "2640": "Riverina",
    "2370": "Northern Tablelands",
    "3875": "East Gippsland",
    "...": "..."
  },
  "fallback_to_state": {
    "NSW": "NSW (unmapped postcode)",
    "VIC": "VIC (unmapped postcode)"
  }
}
```

Lookup is keyed by Australian 4-digit postcode. Some postcodes span multiple regions — pick the majority.

## Integration points

### In the live HubSpot adapter (Monday+)

```js
// Pseudo
function dealRegion(deal, contact) {
  if (!contact.zip) return contact.state ? `${contact.state} (no zip)` : 'unknown';
  const region = postcodeLookup[contact.zip];
  if (region) return region;
  return contact.state ? `${contact.state} (unmapped)` : 'unknown';
}
```

### In B2 twin similarity scoring

`region_match` resolves to 1 if both deals' computed region strings are identical, 0 otherwise. With NRM-level granularity, the 0.25 weight is meaningful.

## Build effort estimate

- **Option A (ABARES concordance):** ~1 hour. Download CSV, transform to JSON, validate against sample postcodes.
- **Option B (NRM polygons):** ~4-6 hours. Spatial library, postcode centroids, intersect logic.

## v1 fallback (no postcode → NRM lookup yet)

For the weekend mock and Monday's first run, B2 twin matching falls back to using contact `state` as the region surrogate. Region weight of 0.25 will largely match within-state, which is a weaker but not useless signal. Builds out fully when this lookup is ready.
