# HORIZON Snapshot Automation — Backend Handoff (Phase 0.5)

**For:** Cadel Watson (Engineering)
**From:** Dylan Cronje (PM)
**Date:** 2026-05-05
**Priority:** High — parallel to Phase 0 (front-end engine), target 1-day wire-up

---

## What this is

Phase 0 is a standalone HTML-based snapshot generator that accepts model output files (metadata.txt, map images, GeoJSON) and produces a 12-page HORIZON Snapshot document. It works today with manual file uploads.

Phase 0.5 wires this engine into Frontier so that:
1. Property data auto-populates from the platform database
2. Model outputs (maps, metadata, GeoJSON) auto-load from S3
3. The snapshot is generated entirely within Frontier — no file downloads, no Canva, no manual data entry

---

## What the engine needs from the backend

### 1. Property Data Query

The engine needs these fields for a given property:

| Field | Current source | Notes |
|---|---|---|
| Property/business name | `Property.name` | Display name for cover + headings |
| Address | `Property.address` or computed from parcels | Full address string |
| Total area (ha) | `TotalArea` record on the project | Must exist — properties without TotalArea are invisible to the socruns poller |
| Production system | Parcel-level `pastureState` / `cropType` from `input.geojson` | Grazing vs Cropping determines ACCU rate |
| Contact name | User who initiated the request | For delivery email |
| Contact email | User email | For delivery email |

**Suggestion:** A single GraphQL query that returns all property data needed for snapshot generation, keyed by property ID. This avoids multiple round-trips.

### 2. Model Output File Access

The model output package currently lives in S3 after a `RunModelUnifiedWorkflow` completes. The engine needs these files:

| File | Used for | Format |
|---|---|---|
| `metadata.txt` | All calculations — eligible area, rainfall, soil types, pH, depth | Structured text (see format below) |
| `map.png` | Page 2 — HORIZON zone classification map | PNG image |
| `map_depth.png` | Page 3 — Soil depth map | PNG image |
| `map_ph.png` | Page 3 — pH map | PNG image |
| `horizon_landscape.geojson` | Zone statistics (Opportunity/Stable/Strength class data) | GeoJSON FeatureCollection |
| `input.geojson` | Property boundary centroid for portfolio map, paddock data | GeoJSON FeatureCollection |
| `classified.geojson` | Eligible area boundary polygon | GeoJSON FeatureCollection |

**What's needed:** Pre-signed S3 URLs for each file, returned as part of the SOCModelRun query response. The frontend engine fetches them client-side.

**Key question for Cadel:** What is the S3 key pattern for these files? Are they stored under the SOCModelRun UUID? The Temporal workflow ID = SOCModelRun PK, so the correlation should be direct.

### 3. SOCModelRun Status + Trigger

The engine should be able to:
1. **Check if a completed SOCModelRun exists** for a property (query by project ID, status = COMPLETED)
2. **If no run exists**, trigger one via the existing `socModelRunTrigger` GraphQL mutation
3. **Display run progress** using the `SOCModelRunStatus` enum values (NOT_STARTED → REFRESHING_OPTICAL_IMAGERY → ... → COMPLETED)

These capabilities already exist:
- `socModelRunTrigger` mutation — manual trigger path
- `SOCModelRunStatus` enum — status polling
- SOCModelRun ↔ Temporal UUID correlation — status via DB lookup

**What's needed:** Confirmation that the existing GraphQL queries expose the latest completed SOCModelRun for a given project, including the S3 output paths.

### 4. Portfolio Map Data (stretch goal)

Page 4 of the snapshot shows a regional map with the property location and nearby AgriProve projects. Currently this is a manual HubSpot GeoMapper screenshot.

To automate this, the engine needs:
- **Property centroid coordinates** (extractable from `input.geojson`, already handled in Phase 0)
- **Nearby project locations** — a query returning lat/lng + status (Credited, Measured SOC Increase, New Project) for projects within a reasonable radius

**If this isn't available quickly:** The Phase 0 engine already renders a Leaflet satellite map with the property boundary. We can add project markers when the data is available.

---

## Metadata.txt format (confirmed from real outputs)

```
Classified Area Extraction Metadata
========================================

Project name: [name]

Total input area:    [X,XXX.XX] ha
Eligible area:       [X,XXX.XX] ha
Eligible percentage: [XX.X]%

Address: [full address string]
Production systems: [grazing/cropping]
Rainfall: [XXXX] mm

Additional Metadata
========================================

Soil classes in eligible area: [Type1, Type2, Type3]
pH range in eligible area: [X.XX] - [X.XX]
Soil depth range in eligible area: [X.XX] - [X.XX] m
```

The engine parses this format exactly. If the format changes, the parser needs updating.

---

## horizon_landscape.geojson structure (confirmed)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "properties": {
        "class": "Opportunity",  // or "Stable" or "Strength"
        "class_value": 1,
        "median": 1.4444,
        "mad": 0.1306,
        "delta": 0.0775,
        "k": 0.4
      },
      "geometry": { "type": "MultiPolygon", "coordinates": [...] }
    }
  ]
}
```

Three features: Opportunity (value=1), Stable (value=2), Strength (value=3). Each with full polygon geometry.

---

## input.geojson structure (confirmed)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "properties": {
        "area_hectares": 14.15,
        "cropType": "Multi - Winter",
        "pastureState": "Grazing",
        "title": "20-25",
        "type": "paddock"
      },
      "geometry": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```

Individual paddock features with area, crop type, and pasture state.

---

## Proposed GraphQL query shape

```graphql
query SnapshotData($propertyId: ID!) {
  property(id: $propertyId) {
    name
    address
    totalArea {
      area_hectares
    }
    latestCompletedSOCModelRun {
      id
      status
      completedAt
      outputFiles {
        metadataUrl    # pre-signed S3
        mapUrl         # pre-signed S3
        mapDepthUrl    # pre-signed S3
        mapPhUrl       # pre-signed S3
        landscapeUrl   # pre-signed S3
        inputUrl       # pre-signed S3
        classifiedUrl  # pre-signed S3
      }
    }
  }
}
```

This is a suggestion — the actual implementation should align with the existing GraphQL schema patterns. The key requirement is: **one query that returns everything the engine needs to generate a snapshot.**

---

## What does NOT need to change

- The Temporal workflows — no changes needed
- The socruns poller — no changes needed
- The SOCModelRunStatus enum — already has the granularity we need
- The model output files — the engine consumes them as-is
- The HorizonSnapshotRequest table — Phase 0.5 doesn't touch this; the new flow bypasses it

---

## Summary of backend work

| Item | Scope | Priority |
|---|---|---|
| Pre-signed S3 URLs for model outputs | Add resolver fields to SOCModelRun type | P0 — blocks Phase 0.5 |
| Property data query (name, address, area) | Likely already exists — confirm coverage | P0 |
| Latest completed SOCModelRun per project | Query filter (project + COMPLETED status, order by date) | P0 |
| Nearby project locations for portfolio map | New query — projects within radius of lat/lng | P1 — can defer to Phase 1 |

Estimated effort: ~1 day for the P0 items if the S3 key pattern is known.
