# Project marks on the map

One item. Everything else on the console stays as it is.

Two halves, and they are deliberately written differently. The **size** half is mechanics, so it is specified. The **state** half is a real design problem with a constraint set that has defeated four attempts, so it is posed rather than answered.

---

## Why this matters more than it looks

Stepping through the four time states, the map is **identical at First crediting and at At capacity.** Same dots, same positions, same everything.

Between those two states eleven cohorts have cycled and 152,400 ACCUs have been delivered. Every project on that map has moved out of establishment, through measured increase, into credited. The map records none of it.

So this is not a legibility nicety. The time stepper is one of the best things in the console and on the map it currently does nothing, which means half the screen goes inert at exactly the moment the story gets good. Get project state onto the marks and stepping through time shows the portfolio coming alive across four clicks.

That is the outcome to design for.

---

## Size: specified

Radius carries how big the project is. Which quantity depends on the tab, following the unit rule already in place: **hectares on Module Fill, ACCUs on Delivery.**

Every project is currently the same circle, so a 772 hectare project and a 24,030 hectare project are the identical mark.

**Square root, not linear.** Perceived quantity in a circle tracks area, so a linear radius overstates large projects by the square. The portfolio spans about 31 times smallest to largest.

**Clamped, 5 px to 16 px at national zoom:**

```
t = (sqrt(v) - sqrt(min)) / (sqrt(max) - sqrt(min))
r = 5 + t * 11
```

Roughly: 800 ha → 5 px, 2,000 → 6.5, 5,000 → 8.7, 10,000 → 11.2, 24,000 → 16. The clamp matters more than the curve: uncapped, a future 60,000 hectare project produces a dot the size of Tasmania.

**Radius grows with zoom.** Interpolate the range so dots roughly double between national and catchment zoom. A fixed pixel radius reads as a pin at close range.

**Two mechanics that stop sizing making things worse.** The eastern seaboard dots already touch, and sizing them makes that worse.

- A thin stroke in the panel background colour on every dot, so touching dots keep their own edge.
- **Draw largest first, smallest last.** Without this a 24,000 hectare dot lands on a 900 hectare dot and the small one disappears. Small dots on top is counterintuitive, and they are the ones at risk.

---

## State: the problem

**The principle.** A map's primary task is scanning. A reader should be able to find every credited project without consulting a legend and without comparing dots to each other. Differences in hue are detected in parallel; differences in lightness have to be compared, one mark against another. So the channel matters, not just the values.

**Three states, and they are a progression rather than three unrelated things:** established, then measured increase, then credited.

### The constraint set

1. **Red-green colour blindness.** Roughly one man in twelve. These are scattered dots with no fixed order, so there is no position cue to fall back on.
2. **The basemap is satellite imagery.** It runs dark green coastal country to red desert to pale saltpan. Apparent lightness shifts with whatever sits behind a mark, so lightness is a fragile channel on this specific background.
3. **Small marks.** Five pixels at minimum radius.
4. **The palette is already spending two hues elsewhere.** Lime belongs to the deployment hexagons. Blue belongs to the water lenses. Project marks have to stay separable from both.
5. **Three type sizes is the ceiling** and the standing note about over-explanation applies, so a legend the reader has to keep returning to is a failure even if the colours are technically distinct.

### What has been tried, and exactly how each failed

Worth having so the same ground is not covered again.

**The house convention, dark green / light green / orange.** The light green and the orange separate by delta E 0.1 under deuteranopia. Not a near miss, the same colour.

**A single hue olive ramp,** three lightness steps. Clears every accessibility check. Fails the principle above: shades demand comparison rather than being scanned, and constraint 2 attacks exactly that channel.

**Reusing the delivery schedule's own vocabulary** - olive for forecast, orange for measured in pipeline, teal for delivered. Semantically ideal, because the reader has already learned that language on the other half of the screen. The olive and orange separate by delta E 1.5 under protanopia.

That last failure is instructive rather than just unlucky. **The same three colours are legal in the delivery bar and illegal on the map**, because in the bar the segments sit in a fixed order and position disambiguates them. Scattered dots have nothing to fall back on. A palette is only accessible in the form it is used in.

**Two olive steps plus teal for credited.** Clears colour blindness at delta E 13.8, but the darkest olive falls to 2.48:1 contrast against land and vanishes at 5 pixels.

**Three unrelated hues, violet / amber / teal.** Clears everything at delta E 13.1. Completely arbitrary: nothing makes violet mean established.

### The strongest lead available: the console has already taught a colour vocabulary

The delivery schedule on the right of the same screen already uses colour to mean something, and the reader learns it there:

| | Means | In the schedule |
|---|---|---|
| **Teal** | delivered, issued by the regulator | the Delivered segment |
| **Orange** | measured, in the pipeline, not yet issued | Measured in pipeline |
| **Olive** | forecast, modelled, not yet measured | Forecast |

Those are the same three ideas the map needs. A credited project is delivered. A project in measured increase is measured and in the pipeline. An established project is forecast only.

**So the suggestion is to borrow that vocabulary rather than invent a second one**, starting with the one that matters most: **a credited project takes the same teal the schedule uses for delivered.** The reader then learns one language for both halves of the screen, and the map stops needing a legend of its own, which is the over-explanation note satisfied rather than worked around.

There is a real limit on how far the borrow goes, and it is worth knowing before trying. **Olive against orange separates by delta E 1.5 under protanopia.** In the schedule that is survivable because the segments sit in a fixed order and position tells the reader which is which. On scattered dots there is no position cue, so the same pair fails.

Which gives a structural hint rather than a dead end: **borrow where the borrow works, solve fresh where it does not.** Teal for credited is free and strongly motivated. Established and measured increase are the pair that needs new thinking, and they happen to be the less important distinction commercially.

### Three openings, offered rather than prescribed

**The boundary that matters commercially is credited versus not credited.** Has this land paid out. Established versus measured increase is a process distinction and a much smaller one for this reader. Spending the genuine hue difference evenly across three states may be spending it in the wrong place.

**Colour is not the only channel available, and the others are unspent.** Nothing requires state to be hue. Fill against outline, a ring, a notch, opacity, even a small mark inside the dot are all free right now, and none of them are degraded by the basemap or by colour blindness. The dot is a filled circle today because nobody chose otherwise.

Redundant encoding is legitimate here and probably desirable: two channels agreeing means scanning works one way and ranking works the other.

**And the two remaining states may not need a hue difference at all.** If teal carries credited, then established and measured increase only have to separate from each other and from teal. That is a much smaller problem than three-way hue separation, and it is where the unspent channels above are most likely to earn their place.

---

## Acceptance

- [ ] Stepping from First crediting to At capacity visibly changes the map
- [ ] A reader can find every credited project without consulting a legend
- [ ] A reader can rank the three largest projects by eye
- [ ] Both hold under simulated deuteranopia
- [ ] Both hold over pale desert and over dark coastal country
- [ ] Both hold at minimum radius
- [ ] Project marks are never confused with the lime hexagons or the blue water fills
- [ ] A colour that appears on both the map and the delivery schedule means the same thing in both places
- [ ] Nothing else on the console changes

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- No mark spanning between marks, per the cohort ruling.
- Project references rather than property or landholder names.
- Dark console surface. Lime is reserved for the deployment hexagons, blue for the water lenses.

## Yours to decide

The whole of the state encoding: which channel or channels carry it, the values, and how the legend is presented if one is needed at all. The radius scale, the draw order and the zoom behaviour are the spec.

If the answer turns out not to be colour, that is a better outcome than a colour that technically passes.
