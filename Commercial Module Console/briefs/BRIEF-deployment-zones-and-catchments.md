# Deployment zones on real bases, and how catchments should read

A geometry file accompanies this brief: `deployment-zones.geojson`, four hexagons, 2 KB.

---

## Part one: the zones

A deployment zone is the ground a field agent can cover on a two hour drive from the town they live in. So each hexagon is centred on a real service town, not on a catchment's geometric centre.

| Zone | Field base | Why this town |
|---|---|---|
| **Lachlan** | **Forbes, NSW** | Central slopes, on the Lachlan River and the Newell Highway. Sits in the mixed grazing country where property density is highest, rather than in the semi-arid west or the tablelands |
| **Murrumbidgee** | **Wagga Wagga, NSW** | Largest inland city in New South Wales, with an airport. Central to the eastern Riverina, which carries far more grazing enterprises than the irrigated west |
| **Fitzroy** | **Emerald, Qld** | Central Highlands, inland and central to the basin. Rockhampton is larger but coastal, so half a drive-time radius from there falls in the ocean |
| **Burdekin** | **Charters Towers, Qld** | The historic and current centre of Burdekin beef, inland on the Flinders Highway. Townsville is far larger but sits in the Ross River catchment, not the Burdekin |

All four were point-tested against the hydrological boundaries and each falls inside its intended catchment.

### How to build each hexagon

**Pointy-top hexagon, 134 kilometres from centre to vertex, centred on the base town.**

Vertices at bearings 0, 60, 120, 180, 240 and 300 degrees from the centre, each 134 kilometres out. **Compute them geodesically rather than by adding degrees**, or the hexagons will skew - a degree of longitude at Charters Towers is materially wider than at Wagga Wagga.

That gives a zone 232 kilometres flat-to-flat, 268 kilometres vertex-to-vertex, and **4.67 million hectares** in area. Allowing for road distance against straight line on a rural network, that is **about two hours' drive**.

The four are already computed in the file, so this is for reference rather than work.

**Why 134 kilometres specifically.** Forbes and Wagga Wagga are 201 kilometres apart. For pointy-top hexagons stacked vertically, touching requires centre spacing of one and a half times the radius, which puts the radius at exactly 134 kilometres. So the size is set by the two closest bases, and the result is a **standard hexagon that tiles**, which is the point of using hexagons at all. The southern pair share a boundary with a small overlap where both agents can genuinely reach; the northern pair sit clear of each other.

### What one zone covers, and why that is the growth story

| Zone | Catchment | Covered by one zone | Room for |
|---|---|---|---|
| Murrumbidgee | 4.74m ha | **98%** | nothing more |
| Lachlan | 7.71m ha | 61% | one more zone |
| Fitzroy | 14.26m ha | **33%** | two more zones |
| Burdekin | 13.11m ha | **36%** | two more zones |

**Four zones now, five more positions available inside the same four catchments, at two headcount each.**

That is the answer to whether this runs once or ten times, and it comes out of geometry rather than assertion. The unfilled part of each catchment is visible on the map, so nobody has to be told - **the northern catchments have room for three zones each and the southern ones do not.** That also says where growth comes from without a roadmap slide.

---

## Part two: making catchments read

Muted fills with dashed borders are not working, and the reason is structural rather than a matter of degree.

**An outline's visual weight scales with its perimeter, not its area.** So a 14 million hectare catchment reads no stronger than a 1 million hectare one. The message being carried is about *extent* - there is far more opportunity than the four zones - and the form being used encodes *edge*. Wrong instrument.

Two further problems. A thin dashed line has nothing to contrast against on a photographic basemap, which is already full of terrain and colour variation. And dashed is the cartographic convention for a **provisional or uncertain** boundary, which is not what is meant here. These boundaries are precise; the land is simply not being worked yet.

### The approach: do not draw the catchments, draw everything else down

Instead of adding marks for the catchments, **recede the basemap outside them.**

The catchments become the only parts of the continent at full clarity. Everything else - the arid interior, the cropping belts, the country that is not grazing opportunity - is darkened or desaturated. No borders, no dashes, no new elements at all.

That works because it is a figure-and-ground relationship rather than a set of outlines, and figure-ground reads instantly at any size. Area now carries weight in proportion to area, which is what the message needs.

Three tiers then emerge without inventing any new visual language:

1. **Hexagons** - bright, foreground. Where the work is.
2. **Catchments** - basemap at full clarity. What the land can earn.
3. **Everything else** - receded. Not opportunity.

And they become hoverable, because they now have areal presence rather than a hairline that a cursor has to find.

### Show them only when they are the subject

On the default lens, showing where the boots are, **there is no catchment layer at all.** A clean map, four hexagons, nothing else. That is the narrow v1 focus: hectares recruited and where.

Switch to soil carbon or water and the recession appears, revealing the catchments relevant to that instrument. **The lens toggle then does real work** rather than changing a colour.

This is also the honest home for the ten-module question. Four hexagons answer *what is happening now*. The catchment layer answers *how much more of this there is*. Those are different questions and they should not be on screen at the same time by default.

### Hover

Hover any catchment for its name, state, whether it is a soil carbon or water opportunity, and its area. Four values, no sentence.

**Hover identifies. Click still selects only a zone or a project**, because those are the only things with anything behind them. A catchment that responds to hover but not to click is correct rather than broken.

---

## One thing to keep straight

A hexagon is an operating radius. A catchment is an accounting boundary for water instruments.

**A zone carries the instruments of whichever catchments it overlaps** - it does not own one, and it should never be labelled with a catchment name as though it were the same thing. Emerald's zone sits inside the Fitzroy catchment and therefore reaches reef-creditable country; the zone itself is not the catchment.

Zone names in the file currently match their catchments for readability. If that turns out to blur the distinction, name them after their base towns instead.

---

## Constraints

- Australian English, no em dashes anywhere including titles, spaced hyphens instead.
- No legend or key. Hover replaces a key.
- Three type sizes at most, one shared colour and weight set.
- Hexagons stay the brightest thing on the surface under every lens.
- Landholders who have not consented are never individually identifiable.

## Yours to decide

How far the basemap recedes and by what means, whether a hexagon shows its base town as a mark, how a hovered catchment acknowledges the cursor without competing with the hexagons, and how the lens transition animates.

The requirement is that the size of the opportunity is felt rather than read, and that the default view stays quiet.
