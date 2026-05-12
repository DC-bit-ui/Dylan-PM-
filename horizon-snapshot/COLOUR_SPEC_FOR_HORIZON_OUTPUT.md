# HORIZON model output — colour specification

**Audience:** Cadel (Frontier / model team) and anyone exporting the HORIZON
zone map / pH map / depth map for use in the Snapshot tool.

**Goal:** the model PNGs (`map.png`, `map_ph.png`, `map_depth.png`) should use
exactly these hex values so the rendered Snapshot legend matches the map zones
without any further client-side colour substitution.

---

## 1. HORIZON Analysis (zone map — `map.png`)

| Layer | Hex | Notes |
|---|---|---|
| **Strength Zones** | `#008000` | Solid green fill at **80% opacity** (`#008000CC`) when overlaid on satellite imagery |
| **Reference Zones** (a.k.a. Stable) | `#67B876` | Lighter green at **80% opacity** (`#67B876CC`) |
| **Opportunity Zones** | `#FF8300` | Orange at **80% opacity** (`#FF8300CC`) |
| **Farm Boundary** | `#E74C3C` | 2px solid red outline, no fill |
| **Eligible Area** | `#1F3A2D` | 2px **dashed** dark teal outline, no fill |

The Snapshot tool composites these zones over a satellite basemap (Esri
World_Imagery). **Opacity bumped from 40% → 80% on 2026-05-08** — at 80% the
zones are still semi-transparent (basemap shading and texture remain visible
underneath) but read as much more saturated and confident in print/PDF.
If the model PNG bakes in opaque fills, the client's `mix-blend-mode: multiply`
will let the satellite show through — but **opaque fills at the hex values
above** are preferable for print/PDF fidelity.

## 2. pH map (`map_ph.png`)

Discrete bands aligned with the AgriProve pH legend:

| Range | Hex |
|---|---|
| pH 8 – 9 | `#1C9549` |
| pH 7 – 8 | `#659131` |
| pH 6 – 7 | `#88A201` |
| pH 5 – 6 | `#E8B40B` |
| pH 4 – 5 | `#ED7B30` |
| pH 3 – 4 | `#ED4343` |

(These were eyeballed from the original Canva legend; if you have authoritative
brand-spec hex values please use those instead and tell us the deltas.)

## 3. Depth map (`map_depth.png`)

| Range | Hex |
|---|---|
| > 1.0 m · Optimal | `#22C55E` |
| 60 – 100 cm | `#E8B45B` |
| 30 – 60 cm | `#4F5FA1` |
| < 30 cm | `#1A1A1A` |

## 4. Anything else

- **PNG transparency:** if the model can render the area outside the property
  zones with **alpha = 0** (genuinely transparent rather than white), the
  satellite basemap will show through pixel-perfectly without our client-side
  pre-processing pass. Either path works — transparent is cleaner.
- **Aspect ratio:** the Snapshot tool now derives image bounds from the image's
  natural aspect ratio (no longer assumes landscape). Whatever aspect the model
  outputs is fine, as long as the property zones fill most of the image with
  consistent padding around them.
- **Embedded legend strip:** as discussed, **please remove the right-edge
  vertical legend strip from each PNG**. The Snapshot tool overlays its own
  high-resolution legend (sourced from Canva), so the model's strip is
  redundant and we currently crop it via `clip-path: inset(0 7% 0 0)` on the
  client. Removing it upstream lets us drop that crop and avoid losing 7% of
  the actual map area.
- **Optional metadata:** if you can drop a `bounds.json` next to each PNG
  with `[[swLat, swLng], [neLat, neLng]]`, the Snapshot's image overlay will
  align pixel-perfectly with the satellite basemap. Without it, we currently
  approximate from `input.geojson` bounds + 10% padding, which is "close
  enough" for most properties but not exact.

## 5. How the Snapshot uses these

- `map.png` → page 2 zone map. Rendered as a Leaflet `imageOverlay` over the
  satellite basemap. Legend shown bottom-left of the map (HTML, our colours).
- `map_ph.png` → page 3 pH map. Same pattern, our pH legend bottom-left.
- `map_depth.png` → page 3 depth map. Same pattern, our depth legend
  bottom-left.

If the upstream PNGs match this spec, the legend swatches in the Snapshot will
exactly match the map fills — single source of truth, no manual reconciliation.

---

**Owner of this spec:** Dylan — bump the version date and update if the brand
or palette changes.

**Last updated:** 2026-05-08 (zone opacity bumped 40% → 80%)
