# National catchment set, and the two lenses

A geometry file accompanies this brief: `catchments-national.geojson`, 35 catchments, 88 KB, from the Australian Hydrological Geospatial Fabric River Regions v3.3. Authoritative hydrological boundaries, already clipped to the coastline.

---

## The principle this sits under

**Visual-led, with as little copy as possible.** Meaning arrives through shape, weight, position and colour. Words appear only for a name, a value or a unit.

This is not an instruction to make the map plainer. A map carrying thirty-five confident shapes and four labels should be **more** beautiful than one carrying fifteen shapes and forty labels, because the space the words were taking goes back to the composition. Quiet in the sense that a well-designed instrument is quiet, not sparse and not grey.

---

## A proposal on the lenses

The map currently toggles between a carbon view and a water view. There is a cleaner way to think about it.

**The four recruitment zones are not a lens. They are always on.** They are where the field teams physically are, and that does not change depending on which market the reader is looking at.

**What the lens switches is which market's opportunity lights up behind them:**

- **Soil carbon** - catchments where the method performs: grazing country with enough rainfall to build carbon and enough landholders to recruit from.
- **Water quality** - catchments where water instruments apply, which today means the reef-draining catchments where sediment reduction is creditable.

That gives a constant foreground and a switching background, which is both simpler to build and truer to how the business works. Two zones sit in both sets, which is a genuinely interesting fact the map can now show without saying anything.

Take a different naming or structure if you find better. What matters is that the reader never loses sight of where the work is actually happening.

---

## Three tiers, and they must be unmistakable

| Tier | What it is | Count | How it should read |
|---|---|---|---|
| **Recruitment focus** | Zones with field teams on the ground now | **4** | The subject of the map. Immediately, from across a room |
| **Soil carbon opportunity** | Catchments where the method performs | 27 | Present, quiet, clearly secondary |
| **Water quality opportunity** | Reef-draining catchments where sediment is creditable | 8 | Same weight as carbon, different identity |

The `lens` property on each feature carries one of: `recruitment`, `recruitment+water`, `carbon`, `water`, `carbon+water`.

**The gap between tier one and the rest should be large.** Thirty-five shapes of similar weight is a jigsaw. Four bright shapes on a field of quiet ones is a statement: here is the whole opportunity, and here is where we are working it.

---

## Colour

Four identities are needed: recruitment, carbon, water, and the overlap of carbon and water.

Some guidance rather than prescription. The recruitment zones want the brightest thing on the surface and should be the only elements at that intensity anywhere on the map. Carbon and water want to be clearly distinct from each other but at similar, low intensity - neither should look more important than the other, because that is a commercial judgement the map should not be making. The overlap needs its own identity rather than a stripe or a hatch, since two catchments sitting in both markets is a fact worth reading instantly.

Fill carries the identity; strokes are for the recruitment tier only. **Adjacent catchments in the same tier will merge into one mass without a hairline separation** - the Murray-Darling regions sit against each other and will read as a single blob otherwise. That separation should be barely there.

---

## How the selection was made

Stating this so the choices can be argued with rather than guessed at.

**Soil carbon.** Included where grazing is a material land use, rainfall is sufficient for the method to build carbon, and there are enough landholdings to recruit from. That covers the Murray-Darling mixed grazing belt, Queensland's grazing catchments, the New South Wales coast and tablelands, western and Gippsland Victoria, the higher-rainfall south west of Western Australia, and northern Tasmania.

Excluded: arid rangelands, where uplift is marginal and sampling is expensive. That means Lake Eyre, the Western Plateau, Pilbara-Gascoyne, Tanami and most of Carpentaria are absent by design, not by oversight.

Also excluded on purpose: the Western Australian wheatbelt catchments. Large and agriculturally significant, but predominantly cropping, and cropping does not carry this method. Worth a mention if anyone asks why Western Australia looks thin.

**Water quality.** Reef-draining catchments above 400,000 hectares where grazing is the material sediment source. The small Wet Tropics catchments are excluded because they are sugar country rather than grazing country, so they are not an opportunity for this business even though they matter to the reef.

Both lists are a judgement rather than a computation. If the technical team disagrees with an inclusion or an omission, that is a conversation, not a bug.

---

## Every catchment carries its own area

The `area_ha` property is the true area of the geometry as drawn. Use it for anything shown on screen.

This matters because these boundaries do not always match commonly quoted figures. The Murrumbidgee is often cited at around 84,000 square kilometres but the hydrological region is **47,376**, because adjacent country is assigned to its own regions. Both are defensible and they measure different things, but **the number on the card has to be the area of the shape on the map**, or a reader who measures one against the other stops trusting both.

The four recruitment zones:

| Zone | Area |
|---|---|
| Fitzroy, Queensland | 14,258,462 ha |
| Burdekin | 13,105,890 ha |
| Lachlan | 7,705,123 ha |
| Murrumbidgee | 4,737,598 ha |

Note there is also a Fitzroy River in Western Australia, which is a different catchment. The one here is the Queensland Fitzroy.

---

## What the map should say without words

At national extent, before a single label is read, a reader should take three things:

**The opportunity is national.** Thirty-five catchments across every mainland state and Tasmania.

**The work is concentrated.** Four zones, brightly, and they are a small part of the whole.

**There are two markets, and some ground serves both.**

Everything else - names, areas, pipeline, progress - belongs in the panel and appears on selection. The map carries four labels at most.

---

## Constraints

- Australian English, no em dashes anywhere including titles, spaced hyphens instead.
- Three type sizes at most, one shared colour and weight set.
- No explanatory copy on the map.
- Landholders who have not consented are never individually identifiable.

## Yours to decide

Fill treatments, the exact colours, how the tiers separate, how the lens transition animates, and whether the recruitment zones read as constant foreground or something better.

The requirement is that the composition looks considered rather than busy, and that where the work is happening is unmistakable at a glance.
