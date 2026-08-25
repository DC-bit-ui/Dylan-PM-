# Real catchment boundaries for the map

Two geometry files accompany this brief, plus one principle that governs how they are used.

---

## First, on restraint and how it should look

There is an instruction elsewhere to quieten this console. **That is not an instruction to make it plainer, and it must not produce a wireframe.**

The principle is **visual-led with as little copy as possible.** Meaning is carried by shape, weight, position and colour, and words appear only where a value, a unit, a date or a name is needed. A screen with four confident marks and eleven words on it should be more beautiful than the version with paragraphs, not less - because the space that copy was occupying goes to the marks.

So: generous space, deliberate hierarchy, strong shapes, restrained but confident colour. Quiet in the sense that a well-designed instrument is quiet. Not sparse, not unfinished, not grey.

Every time a sentence is removed, the design gets a chance to say the same thing better. Take it.

---

## The geometry

Two files, both from the Australian Hydrological Geospatial Fabric, Bureau of Meteorology River Regions v3.3. These are the authoritative hydrological catchment boundaries, already clipped to the coastline.

| File | Simplification | Size | Use |
|---|---|---|---|
| `zones-national.geojson` | 0.02 degrees | 20 KB | National extent |
| `zones-zoomed.geojson` | 0.005 degrees | 93 KB | Zone level and closer |

Each feature carries `zone`, `name`, `division` and `area_ha`. Coordinate system is GDA94, EPSG:4283, which is close enough to WGS84 for display without transformation.

The four working zones:

| Zone | Official name | Area |
|---|---|---|
| **Lachlan** | Lachlan River, Murray-Darling Basin | 7,705,123 ha |
| **Murrumbidgee** | Murrumbidgee River, Murray-Darling Basin | 4,737,598 ha |
| **Fitzroy** | Fitzroy River (QLD), North East Coast | 14,258,462 ha |
| **Burdekin** | Burdekin River, North East Coast | 13,105,890 ha |

Note there is also a Fitzroy River in Western Australia. The one here is the Queensland Fitzroy, which is the correct one.

---

## Only the working zones get a boundary

This is the part that decides whether the map looks considered or cluttered.

Australia has 219 river regions. **Drawing more than a handful turns the map into a jigsaw and the module into a rounding error.** The map's job is to show where this business is working, not to render national hydrology.

**Draw a boundary only for the zones the module is being built from.** Four shapes, no more.

Everything else is not a fainter boundary, a dotted outline or a lighter fill. **It is nothing at all.** Unworked country is the map: land, coastline, the shape of the continent. That absence is what gives the four zones their weight, and it is also the honest picture, because those four are where the field teams are.

If a future zone needs to be signalled as a candidate rather than active, that is a difference in treatment of a drawn shape, not a reason to draw the other 215.

---

## What a boundary is for

A catchment boundary is context for the projects inside it, not an object in its own right. So it should read as ground rather than as a diagram: a soft area treatment that sits behind everything, not a heavy stroke that competes with the project points on top of it.

At national extent a zone needs to convey two things without being read: **that it is one of the working zones**, and **roughly how far along it is**. Precision belongs in the panel. A name is enough on the map; anything more turns four shapes into four paragraphs.

Projects inside a zone are the figures. The zone is the ground. If the boundary is louder than the projects, the emphasis is inverted.

---

## The areas on the cards must match the shapes on the map

Worth checking carefully, because these boundaries do not always agree with commonly quoted catchment figures.

The Murrumbidgee is the clearest case. It is often cited at around 84,000 square kilometres, but the hydrological River Region is **47,376 square kilometres**, because the Geofabric assigns adjacent country such as Billabong and Yanco Creeks to their own regions. Both figures are defensible; they measure different things.

**Use the area of the polygon that is on screen.** A reader who measures the shape and gets a different number from the card stops trusting both. The `area_ha` property on each feature is the authoritative value for that geometry.

The same applies to anything derived from area. Grazing land shares and penetration percentages both need recomputing against these boundaries rather than carried over from a wider definition.

Revised penetration against these boundaries, on current pipeline:

| Zone | Assessed and eligible | Share of zone |
|---|---|---|
| Lachlan | 149,184 ha | 1.9% |
| Murrumbidgee | 120,768 ha | 2.6% |
| Fitzroy | 85,248 ha | 0.6% |

---

## One correction to carry through

Mulloon sits in the **Murrumbidgee** River Region. A point test against these boundaries at the property's location returns Murrumbidgee, and so does Bungendore. If anything in the build hedges on that, it can be stated plainly.

---

## Constraints

- Australian English, no em dashes anywhere including titles, spaced hyphens instead.
- Three type sizes at most, one shared colour and weight set.
- No explanatory copy on the map. Names, values and units only.
- Landholders who have not consented are never individually identifiable.

## Yours to decide

How a zone boundary is rendered, how progress is conveyed within it, how the treatment changes between national and zone extent, and how the four zones relate visually to the project points inside them.

The requirement is that the map looks composed rather than busy, and that a reader takes the shape of the operation before they read a single word.
