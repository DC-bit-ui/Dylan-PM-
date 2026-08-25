# Please edit the map in the commercial module console

Three changes to the map you have already built. The hexagons, the project markers, the interaction model and the panel around it all stay. What changes is the frame, the default colour treatment, and the addition of one new lens.

Two of these reverse guidance you were given earlier. That is deliberate and the reason is set out below, because you should know when an instruction has changed rather than assume the earlier one was misread.

---

## What the map is for

The reader is a carbon desk professional at a large emitter, looking at a 125,000 hectare soil carbon module assembled property by property across Australian grazing country. The map is the only part of the console that is a place rather than arithmetic.

It carries two arguments at once, and the whole difficulty of the surface is that they are different geographies:

- **Where the work happens.** Four hexagons, each a two to three hour drive radius around a field agent's base town. This is deployable capacity, and it is the honest answer to "can you actually reach this land".
- **What the land can earn.** Catchments. Grazing country with a measurable carbon opportunity, and separately, grazing country where a water quality instrument exists. Two lenses, asked one at a time.

Hexagons are operational. Catchments are commercial. They overlap but they are not the same shape and they should never look like they are.

---

## What is weak in the current build

**The frame is cropped to the eastern seaboard.** Western Australia and most of South Australia are outside it. The reader is being shown four zones on the east coast with no visible sense of the country they sit in, which quietly makes the operation look either bigger than it is or arbitrarily placed. The continent is the denominator. Four hexagons against the whole of Australia is a far stronger and more honest statement than four hexagons filling a frame drawn around them.

**The recession is on by default.** Land outside the zones arrives already dimmed, so the reader's first sight of the map is a country mostly switched off. Darkening is a good instrument and it is being spent before there is anything to spend it on. At rest there is no comparison being made, so there is nothing for the dimming to answer.

**Where I got it wrong.** Earlier guidance argued against dashed catchment borders and for a tighter frame. Both were wrong, for a reason worth carrying forward: an outline's visual weight scales with its perimeter, not its area, so as a **permanent background layer** trying to say something about extent, an outline is the wrong instrument. But that is not the job any more. As a **dedicated reference lens** answering "where are the lines", dashed and unfilled is exactly the right convention and has been in cartography for a century. Same mark, different job, opposite answer.

---

## The default state

**Whole country, full colour, undarkened.**

The continent is entirely visible and reads as itself. Australia's land colour runs from red interior to green coastal margin and that range is an asset here, not noise to be suppressed. The four hexagons sit on it, and the project markers sit inside and outside them.

Nothing is dimmed at rest. The reader should be able to look at this for ten seconds and take away: here is a continent, here is where we have people, here is where the land is.

---

## The lenses

A lens is a question the reader asks of the same map. Selecting one is what earns the recession, because a lens is by definition a claim that some of this country matters more than the rest for one purpose.

| Lens | The question | Roughly what it does |
|---|---|---|
| **Default / no lens** | Where are we working | Full colour, nothing dimmed, hexagons and projects only |
| **Boots on the ground** | Where can we reach | Recession returns and the frame closes in on the zones. See below |
| **Soil carbon** | Which country can earn ACCUs | 31 catchments, filled |
| **Reef Credits** | Where a water credit market already exists | 8 catchments, solid blue |
| **ACWIS** | Where a water credit method exists but no market yet | 12 catchments, striped blue |
| **Catchments** *(new)* | Where are the lines | Reference boundaries, no recession at all |

Naming and grouping are yours. What matters is that the reader can get back to full-colour undarkened country in one move, and that the recession belongs to the lenses rather than to the map.

The catchment lens is the odd one out and should behave differently from the others: it is a reference layer rather than an argument, so it adds lines without taking colour away.

Six entries is a long list for a control that should be glanceable, and they are not all the same kind of thing. Three of them answer "what can this land earn" and are directly comparable to each other; boots on the ground answers an operational question; catchments is reference. Grouping them that way rather than presenting a flat list of six is probably the difference between a control that reads instantly and one that has to be worked through. How is yours.

---

## The catchment lens

**Dashed, unfilled boundaries across the whole country.** All 219 river regions, so the lens can name any catchment the reader points at rather than only the ones we have opinions about. The file is attached.

The behaviour that makes it worth building:

- **Hover names it.** Any catchment, focus or not. A reader who wants to know what they are looking at over central Queensland should be able to find out by pointing at it.
- **Click focuses it.** The catchment becomes the subject: named, its area available, and the projects and hexagon coverage inside it legible. A second click or an escape returns to the whole country.
- **The four recruitment zones are already flagged** in the data, so they can be drawn differently from the other 215 without any lookup on your side.

At 219 features the dashed lines read as a low-weight graticule rather than a jigsaw, which is the right outcome. The risk to watch is the opposite of clutter: too faint and the lens does nothing. Worth testing at the zoom levels the console actually uses.

A dashed line is doing two jobs here and both are useful. It reads as "reference, not thing" so it does not compete with the hexagons. And it survives crossing from red interior to green coast in a way a fill never could.

---

## The soil carbon and water lenses have lost their subject

This is the change most worth getting right, and it is a bug rather than a preference.

When the catchments were demoted to muted background furniture, the two thematic lenses lost the thing they exist to show. Selecting **Soil carbon** or **Water quality** now dims a map whose catchments were already dim, so the lens changes the mood without changing the subject. The reader selects a lens, something gets darker, and they learn nothing.

**The principle: a lens selects a subject, and the subject should be the brightest thing on the screen.** Not the least dimmed. The brightest.

That means each lens moves what is in the foreground:

| Lens | Subject, foregrounded | Recedes to reference |
|---|---|---|
| Boots on the ground | The four hexagons, frame closed in | Everything outside the zones |
| Soil carbon | The 31 carbon catchments | Hexagons, everything else |
| Reef Credits | The 8 reef catchments, solid | Hexagons, everything else |
| ACWIS | The 12 Murray Darling catchments, striped | Hexagons, everything else |
| Catchments | All 219 boundaries, unfilled | Nothing, no recession |

Under a thematic lens the hexagons should step back to outline. They are the answer to a different question and they will otherwise keep winning attention they have not earned in that state.

### What each lens should light up

Both are national, and the shapes they make are the argument.

**Soil carbon: 31 catchments, 112 million hectares.** An almost continuous arc from the Queensland central highlands down through the northern NSW slopes, the inland Murray Darling, western Victoria into the south east of South Australia, with Tasmania and two south west WA catchments detached from it. This is the shape of Australian grazing country with a measurable soil carbon opportunity, and it is a much bigger statement than four hexagons.

**Water quality is two separate lenses, not one lens with two tiers.**

There were previously eight water catchments, all Great Barrier Reef, because Reef Credits only exist there. That is no longer the whole market. Eco-Markets Australia has launched **ACWIS, the Australasian Catchment Water Improvement Standard**, with a Grazing Land Management methodology at v1.0, issuing water improvement credits against verified reductions in sediment, nutrients and other catchment specific pollutants. It is not reef restricted, and it opens inland grazing country including the Murray Darling.

An earlier version of this brief handled that as one water lens at two levels of confidence. Separating them is better, and the reason is that they are not one thing at two maturities, they are **two different markets**: different scheme, different geography, different buyers, different registry, different liquidity. A reader weighing up co-benefits needs to know which market they would be transacting in, and a confidence gradient does not tell them that. It encoded how established each was while hiding what each one is.

Splitting them also means every lens obeys one treatment with no exceptions.

**Both stay blue.** They are two markets but one domain, and the colour should say so. The distinction is carried by fill state rather than hue: **Reef Credits solid, ACWIS striped and mostly unfilled.** Solid reads as established and striped reads as provisional without anything having to explain it, and because the two lenses share one grammar the marks stay self describing whether the reader sees them separately or together. If a single combined water lens turns out to read better than two, that grammar holds there too.

**Reef Credits: 8 catchments, 36 million hectares.** A tight Queensland coastal run from Cape York to Baffle Creek. Methods active, credits issued and retired, prices observable. Small, concentrated, and it should look concentrated. This is the one water market where a price can be pointed at.

**ACWIS: 12 catchments, 57 million hectares.** The Murray Darling: Condamine-Culgoa, Macquarie-Bogan, Border Rivers, Namoi, Gwydir, Castlereagh, Murray Riverina, Goulburn, Loddon, Upper Murray, and both southern recruitment zones. The grazing method is live at v1.0 and there is no issuance or price history behind it yet. Bigger ground, earlier market.

The maturity difference has to survive, because 57 million hectares of unpriced eligibility must never read as equivalent to a transacting market. It now lives in two places that reinforce each other: the fill state on the map, and what each lens can say about itself. One can point at credits issued and retired. The other can point at a published method and nothing else.

**Open question I cannot answer.** Eco-Markets lists Reef Credits and ACWIS as separate schemes, which suggests they run in parallel, but whether reef catchments eventually migrate under the national standard is not something the public material says. Worth not building anything that would break if they merged.

### One lens, one treatment

Everything a lens lights up gets the same style. No second category inside a lens, and no catchment picked out as special because it also appears in a different lens.

An earlier version of this brief asked for the carbon and water overlap to be marked, and that was a mistake worth being explicit about. A lens asks one question and should give one answer. "Which country can earn carbon" is answered by 31 catchments, full stop. Marking 16 of them differently answers a second question the reader did not ask, and it turns a clean statement into a puzzle that needs a legend. Two visual categories inside one lens is exactly what this console has been working to get rid of.

The overlap is a real and valuable fact. It is just not a fact this map should carry.

**Where the stacking argument belongs instead.** It is a portfolio construction insight, which makes it ours rather than the reader's: it tells us where to place field agents and which catchments to prioritise. The reader does not allocate our field capacity. What they want from the water lens is whether this land can carry a second instrument, and if they are standing in the water lens the answer is yes for everything lit.

The version of stacking that does matter to them is specific rather than national: **this property of yours can generate a water improvement credit as well as an ACCU**. That is a marketplace and property level conversation and it already has a home, in the ecological co-benefits capability and in the property view. Taking it off the national map relocates the argument to where it converts rather than losing it.

### Boots on the ground: bring back the recession and the close crop

This lens should behave the way the map did before, and that is the right home for the treatment I earlier argued should be the default.

Selecting it darkens the country outside the four zones and **closes the frame in on them**, so the reader goes from continental context to operational detail in one move. Within the crop the four zone catchments sit in a mid tone under the hexagons, which gives the hexagons something to be on rather than floating on dimmed ground.

This resolves the disagreement rather than splitting it. The close crop and the darkening were never wrong, they were wrong **as a default**. As the answer to "where can we reach" they are exactly right, because that question is genuinely about four places rather than a continent. The default frame carries the context; this lens spends it.

One thing to get right: the crop wants to be a composition rather than a bounding box around the zones. In the attached render the two Queensland zones and the two NSW zones sit at opposite ends of the frame with a large empty gap between them, and it reads as two maps rather than one operation. The gap is real and it is honest, but it needs deliberate handling.

### Findings from testing this

**Darkening may not be needed at all.** The attached render puts saturated lens fills over completely undarkened land, and the lens still reads immediately. A saturated fill against neutral land already produces the figure and ground separation, which means the recession was solving a problem the fill had already solved. Worth trying the thematic lenses with no dimming whatsoever before adding any, because it keeps the country intact and spends less.

**A stripe needs a wash behind it or it loses its colour.** This is the one finding that decides whether the striped treatment works at all. Stripes drawn straight onto the basemap read dark rather than blue, because the perceived colour of a hatched area is a mix of the lines and the gaps, and at national scale the gaps dominate. Thin blue lines over dark brown land average to dark brown. The catchment ends up reading as textured land rather than as a blue region, which loses the very thing the mark is for.

The fix is a low opacity blue wash under the stripes so the gaps are tinted too. Around 0.22 to 0.28 was enough in testing. It stays clearly lighter than the solid reef fill, so the established against provisional reading survives, but the hue becomes unmistakable. `stripe-test.png` shows the naive version alongside two working ones.

A coarser stripe pitch also holds up better on the smaller catchments. Goulburn, Loddon and Castlereagh are the size test, not Condamine-Culgoa.

**Two unfilled conventions now exist and they should not be confusable.** The catchment reference lens is dashed neutral boundaries with nothing inside. ACWIS is a blue wash with blue interior stripes. Different mark, different colour, different place - boundary versus interior - so they should separate cleanly, but it is worth a look with both visible since neither existed when the other was designed.

**Reef Credits will look small and that is correct.** Eight coastal catchments on a continent is a sparse map next to ACWIS covering 57 million hectares inland. The instinct will be to compensate. Worth resisting: the reef market is small, concentrated and real, and the ACWIS ground is large and not yet priced. A map that made them look comparable in weight would be flattering the wrong one. Separating them into two lenses removes the pressure, since they are no longer competing for attention in the same frame.

**A lime hexagon outline disappears under the soil carbon lens.** The hexagons sit inside the catchments the carbon lens is lighting up, so a same hue outline over a same hue fill vanishes. Visible in the left panel of the render. The hexagon needs a treatment that survives sitting on top of its own theme colour, probably a light neutral rather than the accent.

### One thing to guard against

The carbon lens lights 112 million hectares, Reef Credits 36 million and ACWIS 57 million. Recruitable land inside the four zones is 21.7 million hectares, and the current pipeline is 355,200 hectares. Those are different claims and the gap between the largest and smallest is roughly 300 fold.

A buyer's analyst will do that division. The lens is showing where the opportunity is, not what can be delivered, and the map should not let the larger number be mistaken for the smaller one. This does not need a paragraph of caveat, it needs the distinction to be structurally obvious.

The same caution applies to ACWIS twice over. The scheme is launched and the grazing method is live, but it has no issuance or price history we can point to, and the twelve catchments are **our assessment against the scheme's criteria rather than a boundary the scheme has published**. Anything on screen should be able to survive the question "who says these twelve".

---

## Composition

The frame can no longer change, so composition has to do the work the crop was doing.

The continent whole, but not necessarily centred. Everything in this product happens on the eastern third, and a frame that gives the west its full share of the canvas spends most of the canvas on nothing. Weighting the composition east while keeping the whole coastline visible is the balance to find. Something like the country sitting off-centre with the panel taking the western space is one way; there will be others.

---

## Colour note

The bright lime accent has to hold against both red desert and green coastal country, which is a harder test than it sounds. Checked against the palette validator: it passes contrast comfortably at over 3:1, and it fails the lightness band for area fills at 0.928 against a 0.48 to 0.67 target. That is the correct result rather than a problem. It is a stroke and marker colour, not a fill colour. Hexagon outlines, dashed boundaries, project markers, the focused catchment: all fine. Filled regions: use something inside the band.

**Two fills, not three.** `#7f9c18` olive for soil carbon, `#3987e5` blue for both water lenses. Validated against the dark surface with all pairs checked: every check passes, worst pair at protanopia delta E 27.9 against a target of 8.0.

That margin is worth noticing, because keeping both water schemes in one blue did not just simplify the palette, it removed a real accessibility problem rather than working around it. A third fill was hard to find: orange `#d95926` collapses against the olive carbon fill to delta E 1.7 under deuteranopia, which is effectively the same colour for roughly one man in twelve; every violet tested collided with the blue; teal failed on tritan. Encoding the second water scheme as a fill state instead of a hue sidesteps all of it and lands three and a half times clear of the threshold.

`#cdfd29` lime stays a stroke and marker colour only. It fails the 0.48 to 0.67 lightness band for fills at 0.928 and passes contrast, which is the correct result for an accent rather than a problem.

---

## Attached

**`catchments-all-reference.geojson`** - all 219 Geofabric river regions, simplified for web rendering, 247 KB. Properties on each feature:

- `label` - display name, cleaned
- `division` - drainage division, useful if you want a coarser grouping
- `area_ha` - catchment area
- `is_zone` - true on the four recruitment catchments: Fitzroy (Qld), Burdekin, Lachlan, Murrumbidgee

Source is the Bureau of Meteorology's Australian Hydrological Geospatial Fabric, River Regions v3.3. Coastline-clipped, so the boundaries meet the sea correctly.

**`catchments-lenses.geojson`** - the 35 curated high value catchments, 89 KB, restructured for this change. The old compound `lens` string is gone and replaced with three independent flags, because a catchment can be more than one thing at once and the old single field could not say so:

- `carbon` - true on 31, the soil carbon lens set
- `water` - true on 20, the water quality lens set
- `water_scheme` - `Reef Credits` on 8, `ACWIS` on 12. **This is the field each water lens selects on.**
- `water_tier` - `live` or `eligible`. Kept for reference, but the scheme name now carries the distinction so this is redundant for drawing
- `zone` - true on the four recruitment zones
- plus `label`, `state`, `area_ha`, `official_name`, `division`

Sixteen features carry both `carbon` and `water`. The flags are independent so a catchment can appear in more than one lens, but **nothing should be drawn from the combination on this map** - see the one treatment note above. The flags are there so each lens can select its own set, not so overlaps can be marked.

Four features carry `water` without `carbon`: Normanby, Herbert, Haughton and Baffle Creek, which were selected for the water instrument and are Cape York conservation tenure or cane dominated coastal floodplain rather than grazing carbon targets. That is a deliberate under claim rather than an omission.

**`deployment-zones.geojson`** stays in use unchanged.

Two renders are attached as legibility checks rather than designs. Ignore their composition and typography.

- **`catchment-lens-check.png`** - the 219 dashed boundaries over full colour land with the four hexagons on top.
- **`lens-states-check.png`** - the soil carbon and water lens states side by side over undarkened land. Superseded on the water side by the file below, still useful for the carbon lens.
- **`lens-three-states.png`** - default, boots on the ground, and the water lens. Still current for the first two panels; its water panel used two colours and is superseded.
- **`lens-one-treatment.png`** - superseded on the water side, still useful for the carbon lens and for what a flattened water lens loses.
- **`lens-three-schemes.png`** - superseded. It used a third hue for ACWIS.
- **`lens-blue-two-states.png`** - Reef solid, ACWIS striped, the two together, and a zoom. Shows the arrangement but its stripe treatment is the naive version that fails, see below.
- **`stripe-test.png`** - the fix. Three stripe treatments compared at Murray Darling zoom. **This is the current reference for the ACWIS mark.**

---

## Sourcing

ACWIS is the Australasian Catchment Water Improvement Standard, administered by Eco-Markets Australia, the same administrator as the Reef Credit Scheme. Launched, with Grazing Land Management methodology v1.0 published, issuing water improvement credits against verified reductions in sediment, nutrients and other catchment specific pollutants, aligned to the National Water Quality Management Strategy and regional water quality improvement plans. Scope is Australasia's catchments and is not reef restricted.

Worth knowing: the scheme publishes no priority catchment list, no pricing and no issuance record. The twelve catchments in the eligible tier are our assessment, made on grazing dominance, sediment and nutrient export, and overlap with our own recruitment footprint. One honest complication to hold: peer reviewed work published in 2025 found Murray Darling water quality **improving** over two decades while Great Barrier Reef catchments deteriorated. A recovering baseline makes additionality harder to demonstrate, not easier, so the inland opportunity is real but it is not the easier of the two.

Reef Credits for comparison: 14 projects, 65,547 credits issued, 42,055 retired.

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Visual led, with as little copy as possible. If a sentence is needed to explain what a mark means, the mark wants changing rather than annotating. Labels, values, units and dates are not explanation and they stay.
- Catchment names as given. They are official and they will be checked.
- ACWIS eligibility is our assessment, not a published scheme boundary. Nothing should imply the scheme has designated these catchments.
- Reef Credits and ACWIS are different schemes in different geographies at different maturity. Same colour, different fill state, never merged into one figure.
- One lens, one treatment. A catchment is never styled differently because it also appears in another lens.
- Hexagons are drive-time reach, not tenure, ownership or quota. Nothing should imply they are a boundary of any kind.
- Landholders who have not consented are never individually identifiable.

## Yours to decide

Proportion, projection, land colour, how the lens control is presented, how a focused catchment reads, dash weight and rhythm, motion between states, and where the recession lives inside each lens. Whether the catchment lens is a fifth lens or a modifier that can sit under the others is also yours, and there is a good argument either way.

Where something already in the build does one of these jobs better than what is described here, keep yours and say so.
