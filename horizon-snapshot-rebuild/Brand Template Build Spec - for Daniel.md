# HORIZON Snapshot — Brand Template build spec (for Daniel)

**Goal:** turn the HORIZON Snapshot Canva design into an **autofill Brand Template** so the pipeline can populate it via the Canva Connect API and export a filled, pixel-perfect PDF. You (Brand Designer / Admin) can publish brand templates; Dylan's account can't, which is why this is with you.

**Source design:** "HORZION Snapshot Template - Current 05/05" (`canva.link/4rw2rfonfxyr6h0`). Work on a copy so the live one is untouched.

---

## The one concept

A field is just a **named element**. Wherever content changes per property, the element (text box or image frame) must exist in the layout and its **layer name must be exactly the field name** in the table below. The pipeline fills by those names. Everything not named is static and never touched. Do not leave placeholder text like "[Insert here]" as the fill mechanism — the name is what matters.

## How to denote a field (per element)

1. Select the text box or image frame.
2. Open the Layers panel, double-click the layer, and rename it to the **exact** field name (lowercase, underscores, as written below).
3. For maps: use an image frame sized to the print area, and do **not** draw a legend inside it — the system composites the correct legend.
4. Leave text frames generously sized (frames are fixed; longer values must still fit).

## Publish

When all fields are named: **Publish as Brand Template** (menu bar → Publish as Brand Template, or Share → See all → Brand Template). Share it to the team. Send Dylan the Brand Template ID (starts with `BT...`) or the link.

---

## Field list — name every element exactly like this

### Page 1 — Cover
| Element | Field name | Type |
|---|---|---|
| Property name (currently "[Insert Property Name]") | `property_name` | text |
| Hero satellite image | `hero_image` | image |

### Page 2 — HORIZON Analysis
| Element | Field name | Type |
|---|---|---|
| HORIZON summary paragraph | `horizon_summary` | text |
| SOC zone map | `zone_map` | image |

### Page 3 — Soil & Carbon Indicators
| Element | Field name | Type |
|---|---|---|
| pH map | `ph_map` | image |
| Soil depth map | `depth_map` | image |
| Carbon table, data row — Soil Type cell | `carbon_soil_type` | text |
| Carbon table, data row — Rainfall (mm) cell | `carbon_rainfall` | text |
| Carbon table, data row — Water Holding cell | `carbon_water_holding` | text |
| Carbon table, data row — Productivity cell | `carbon_productivity` | text |
| Carbon table, data row — Carbon Stability cell | `carbon_stability` | text |
| Carbon table, data row — ACCU/ha/year cell | `carbon_accu` | text |

### Page 4 — Portfolio & ACCU Potential
| Element | Field name | Type |
|---|---|---|
| Portfolio proximity map | `portfolio_map` | image |
| Property summary paragraph | `property_summary` | text |
| Estimated ACCU Potential ("~[Insert here]") | `estimated_accu` | text |
| Eligible Area ("[Insert here] ha") | `eligible_area` | text |
| Estimated Rate ("[Insert here]") | `accu_rate` | text |
| Number of projects ("[Insert here]") | `num_projects` | text |
| Nearby project name ("TABLETOP ANGUS") | `named_neighbour` | text |

### Page 6 — The AgriProve Economics
| Element | Field name | Type |
|---|---|---|
| Option 1 baseline price cell | `baseline_cost` | text |
| Option 2 deferred ACCUs cell | `deferred_accus` | text |

### Static pages — no fields
Pages 5, 7, 8, 9, 10, 11, 12 are brand/educational. Leave entirely static.

---

## Notes

- **Naming must be exact.** `carbon_stability`, not `carbon stability` or `CarbonStability`. Exact-name matches auto-map with zero manual work.
- **Maps have no baked legend.** The system injects the map image and composites the colour-spec legend on top.
- **The carbon table already has an empty data row** (cells exist, just blank). Name those six cells; do not add a new row.
- A worked reference already exists: a duplicate with most of these fields named and filled with Eungella values. Ask Dylan for the link if useful.
- Partner-specific metrics (e.g. LawrieCo microbe tests) use a partner prefix like `lawrieco.microbe_test` and are approved by the PM before use.
