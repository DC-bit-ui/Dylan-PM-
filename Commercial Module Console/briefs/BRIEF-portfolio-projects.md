# Please rework how projects are shown in the module console

Two variations to compare, described at the end. The map, the panel, the tabs and the lens set all stay. What changes is how the individual projects inside the module are represented.

---

## The reader and the question

A carbon desk professional at a large emitter who has bought a 125,000 hectare soil carbon module, assembled property by property across Australian grazing country. Their question about the project list is plain: **what do I actually own, and is any of it worth my attention.**

---

## What is weak now

Projects are drawn as identical dots on the national map. A 638 hectare project and a 21,055 hectare project are the same mark. Roughly 33 times the size, no visual difference.

The deeper problem is worth stating because it decides the fix. **A project is not a point, it is an area of land, and at national zoom that area is smaller than a pixel.** A 5,000 hectare property is about 7 kilometres across; on a continental frame that is under one pixel. The dot exists because the truth is invisible at that scale. It reports that something is there and nothing else.

So the thing the reader came to look at sits below the resolution of the frame. Every good answer starts by accepting that rather than trying to make a dot work harder.

There is also a straight bug: project dots and the catchment shapes inside the deployment hexagons are currently the same green. Two different things, one colour.

---

## The direction

**Split the two jobs the map is being asked to do at once.**

Geography matters to this reader for one reason, and it is not identification. It is **spread**: a portfolio concentrated in one catchment fails together in a drought. They are not asking where their land is, they are asking whether it is in enough places.

So the map answers *am I spread*, at whatever size that job needs, which is smaller than it currently occupies. A dense non-geographic view answers *what do I have*, where every project is a legible object carrying its own numbers. The map becomes a filter on that view rather than the display itself.

Two approaches that were tested and are not the direction, with the reasons, since both look attractive:

**Aggregating projects into their catchments** answers concentration well and overstates badly. 187,000 hectares of projects paints roughly 50 million hectares of catchment. It is honest about where the weight sits and dishonest about extent, and this console already has a 300 fold gap between opportunity and delivery that it is working hard not to blur.

**Proportional symbols**, area scaled to ACCUs, are a real improvement on uniform dots and worth keeping on the map itself. They do not solve the identification problem, because the clusters overlap exactly where the projects are densest.

---

## What each project object should carry

Enough to judge it without opening it:

- **ACCUs modelled** - the figure the reader is buying, and the ranking key
- **Area in hectares**
- **Yield, ACCUs per hectare per year** - the comparable rate, and the one that separates a good project from a big one
- **Stage** - in development, validation open, or crediting
- **Where it is** - catchment name, or national for projects outside the worked catchments

Ranked by ACCUs modelled, then by area. Selecting one should locate it on the map, and selecting a region on the map should filter the view.

---

## The constraint that decides the form

**This has to work at four projects and at several hundred.**

Early in a module's life there is one property. At nameplate there are perhaps 30 to 40. If a buyer holds ten modules there are several hundred, and a parent level above this is coming. A form that reads beautifully at 34 and breaks at 340 is the wrong form, so whatever is chosen wants a sensible answer to density: grouping, virtualised scrolling, an area encoding that stays legible as things shrink, or aggregation that the reader can open.

Worth deciding early rather than discovering later.

---

## The two variations

Both share the direction above. What differs is the form of the object view.

**Variation one: the card grid.** Each project a card, ranked, carrying its five figures. Direct, scannable, and every number is readable without interaction. The obvious answer, and it should be built well so it is a fair comparison rather than a straw man. Its weakness is density: work out what it does at 340.

**Variation two: an area or distribution encoding.** Rather than equal cards, let the object's size or position carry a quantity. A treemap where area is ACCUs makes the shape of the portfolio visible at a glance, including how much of it rides on the top three projects. A dot strip or beeswarm arranged by yield per hectare reveals the distribution and puts outliers where they can be seen, which the grid cannot do at all. Either is a legitimate reading of the same brief and both scale to hundreds far better than cards.

Pick whichever of those you find stronger, or a third thing in the same spirit.

**A third direction, only if you can render real polygons.** Extruded property footprints: the actual boundary on the map with a column above it, height as ACCUs. At national zoom the columns read as volume; zoomed in, the column gives way to the real paddock. This dissolves the sub-pixel problem rather than working around it, and it is the answer that would look current. It depends on real property boundaries, which are not in the attached data, and a faked footprint makes it a worse version of proportional symbols. Attempt it only if you can do it honestly.

---

## Attached

**`portfolio-illustrative.json`** - 34 projects with `lon`, `lat`, `ha`, `accu`, `state`, `zone`.

**Illustrative, not the real portfolio.** Locations, sizes and stages are synthetic. One thing about it is deliberate and worth preserving: sizes are drawn from a log normal, which is how grazing enterprise size actually distributes. The range runs 638 to 21,055 hectares, a factor of 33, and most projects sit well below the mean. Any form that only works on an even spread will fail on the real data.

---

## Colour

`#7f9c18` olive and `#3987e5` blue are the validated area fills on the dark surface. `#cdfd29` lime is stroke, marker and low opacity fill only, never a saturated area fill.

For project stage, which is ordinal rather than categorical, a single hue ramp reads the progression without a legend. This one passes every ordinal check on the console surface:

`#556815` → `#6f8c17` → `#8aab1c` → `#a8cd22` → `#cdfd29`

Three stages need three of those steps, spaced apart rather than adjacent.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Modelled figures described as modelled, never as measured or validated.
- Visual led, with as little copy as possible. If a sentence is needed to explain what a mark means, the mark wants changing rather than annotating. Values, units and labels are not explanation and they stay.
- Project dots and catchment shapes must not share a colour.
- Landholders who have not consented are never individually identifiable, so a project is identified by its reference and catchment rather than a property or owner name.

## Yours to decide

Proportion, grid, type, motion, how the map and the object view are laid out relative to each other, how selection moves between them, what happens at high project counts, and which of the two variations deserves the more interesting treatment.

Where something already in the build does one of these jobs better than what is described here, keep yours and say so.
