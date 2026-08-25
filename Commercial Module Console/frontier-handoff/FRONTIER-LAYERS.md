# Frontier catchment layers

Three spatial layers for Frontier. Built for recruitment: the question they answer is *what can I tell the landholder in front of me*.

Rendering is Mapbox GL JS, so `frontier-map-style.json` carries paste ready source and layer definitions rather than a prose description of the styling.

---

## The two water schemes

Reef Credits covers 8 Great Barrier Reef catchments. ACWIS covers 12 in the Murray Darling, and those 12 are our own assessment rather than a published scheme boundary, so `water_status` carries that on every feature and belongs in the popup.

## The three layers

| File | Features | Coverage | What it is for |
|---|---|---|---|
| `frontier-catchments.geojson` | 219 | national | The identify layer. Every river region in Australia, each carrying the full attribute set |
| `frontier-acwis.geojson` | 12 | 56.7m ha | Highlight layer for the ACWIS catchments |
| `frontier-reef-credits.geojson` | 8 | 35.9m ha | Highlight layer for the Reef Credit catchments |

**The catchment layer is the one that does the work.** It carries `carbon`, `water_scheme` and `instruments` on all 219 features, so a single click anywhere in Australia returns everything we know about that catchment. The two scheme layers exist for display, so those catchments can be filled and outlined without the renderer having to filter the full set on every draw.

That means you do not need all three on to get the information. If Frontier's layer control is tight on space, the catchment layer alone is functional and the other two are presentation.

---

## Field dictionary

Present on all three files.

| Field | Type | Notes |
|---|---|---|
| `label` | text | Catchment name, cleaned. **This is the label field.** |
| `division` | text | Drainage division, useful as a coarser grouping or filter |
| `area_ha` | number | Catchment area in hectares |
| `carbon` | boolean | In the soil carbon focus set. True on 31 |
| `water_scheme` | text or null | `Reef Credits`, `ACWIS`, or null |
| `water_status` | text or null | The honest status sentence for that scheme. Put this in the popup |
| `instruments` | text | Popup ready summary, e.g. `Soil carbon + ACWIS` |
| `popup` | text | Single line fallback, `label · instruments` |

`label` is unique across all 219 features, so it works as a `promoteId` for feature state and hover styling.

---

## Two names that are ambiguous nationally

Worth knowing before anyone joins these to another dataset by name.

- **Fitzroy.** There are two, Queensland and Western Australia. Ours is `Fitzroy (Qld)`. A join on the bare string "Fitzroy" will either fail or silently pick the wrong one on the other side of the continent.
- **Mary.** Also two, Queensland and Northern Territory. Ours is `Mary (Qld)`.

The names in these files are already disambiguated. The risk is on the other side of any join.

---

## Styling

`frontier-map-style.json` has the layer definitions. The palette, validated against Frontier's dark surface `#0F1A24`:

| Colour | Use |
|---|---|
| `#7f9c18` olive | Soil carbon, if a carbon layer is added later |
| `#3987e5` blue | Both water schemes, fills and lines |
| `#e8e4d8` neutral | Reference catchment boundaries and labels |

Every check passes with the worst pair separating at delta E 27.9 under protanopia against a target of 8.0, so the layers stay distinguishable for colour blind readers.

**Blue does not clash with Frontier's teal UI accent.** `#3987e5` against `#2DD4A8` separates at delta E 25.1, so a data layer will not be mistaken for interface chrome.

### Fill opacity is deliberately low

An agent is reading property boundaries, land condition and imagery, and a solid catchment fill would hide exactly what they came for. So the identity sits in the stroke rather than the fill: Reef Credits fill at 0.18 with a solid line, ACWIS at 0.08 with a dashed line. The solid against dashed line is what separates the live market from the method only scheme.

If the fills still obscure too much at working zoom, drop them to zero and let the strokes carry it. Nothing breaks.

### Labels

- Catchment name from `label`, appearing from about zoom 5, halo in the surface colour so it survives crossing a boundary.
- Scheme name as a second smaller label offset below, from about zoom 6, in the blue. Optional, and the first thing to turn off if labels start colliding.
- `text-allow-overlap` off with padding, so dense areas thin themselves out rather than piling up.

219 labels is a lot at low zoom. If they crowd, filtering the label layer to `carbon` or `water_scheme` at low zoom and releasing the full set higher up is probably better than shrinking the type.

---

## Suggested popup

```
{label}
{instruments}
{water_status}
```

---

## Sources

Geometry is the Bureau of Meteorology's Australian Hydrological Geospatial Fabric, River Regions v3.3, coastline clipped so boundaries meet the sea correctly. Simplified for web rendering, so these are display boundaries and not a substitute for the authoritative dataset in any eligibility or contractual test.

Scheme detail from Eco-Markets Australia.
