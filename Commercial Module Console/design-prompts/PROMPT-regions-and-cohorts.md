# Regions and cohorts are two different objects

A correction and an addition to what you have built. Earlier instructions used one word for two things and that has to be undone before anything else is built on top of it.

**A recruitment region and a sampling cohort are not the same object.** They have different purposes, different lifecycles, different owners inside the business, and they must not share a visual language.

---

## The two objects

### Recruitment region

**A territory the company works.** It is a **catchment**, a water drainage basin, chosen because it groups land with similar climate, soil and farming system, and because it is the unit a field team can physically cover.

- **It is an area.** It has a boundary that exists whether or not a single property has been signed inside it.
- **It exists before the module and outlives it.** Land has been assessed here for years and will keep being assessed after this module is full.
- **It is operational.** A field team works it. Recruitment campaigns target it. A pipeline runs through it.
- **It is large.** A single region may hold three million hectares of assessed land and several thousand properties, of which a module might take forty thousand hectares.
- **It never completes.** It fills toward a target contribution and then keeps producing.
- **Its owner is the field operation.**

A module is built from a small number of regions. Two is the working assumption, each staffed with one field agent and one person running calls, bookings and scheduling behind them.

### Sampling cohort

**A set of specific projects grouped for one purpose: statistical validation.** Under the crediting method, physically sampling a tenth of a cohort validates the estimate for the whole of it. That only works if the members are close enough together to sample in one mobilisation and similar enough for the model to be calibrated across them.

- **It is a membership, not a territory.** It has members, not edges. Two cohorts inside one region are different sets of the same kind of thing.
- **It cannot exist until there are registered projects.** It forms only once enough contracted, registered land has accumulated. Before that it is a possibility, not an object.
- **It is roughly 10,000 to 15,000 hectares.** So a 125,000 hectare module resolves into something like eight to ten of them.
- **It can be restructured.** Cohorts may be reformed and recalibrated as the portfolio changes. A region cannot be reformed; it is geography.
- **It has a crediting cycle.** Form, estimate, sample a tenth, credit the whole, repeat annually. Each cohort carries its own scheduled delivery quarter, because they are harvested one at a time across the year rather than all at once.
- **Its owner is the technical and operations team.**

### The relationship

**Cohorts sit inside regions.** A region contains several cohorts once it has filled. A cohort belongs to one region.

They are not two views of the same thing and they must never be drawn as though they are.

---

## Why the distinction is commercial, not just technical

This is the part that matters for what the reader takes away, so it should be legible without being explained in prose.

**Choosing regions determines what the land can be worth.** Water instruments — schemes that credit reduced sediment export, improved water quality, volumetric water benefit — are accounted **by catchment**. A region either sits inside such a scheme or it does not. So **the decision about where to recruit determines which instruments the module can ever access**, and that decision is made before a single property is signed.

**Choosing cohorts determines how and when credits are delivered.** Cohort composition drives sampling cost, statistical confidence and the delivery quarter. It has nothing to do with instrument access.

**Two decisions, two levels, both worth seeing.** Region choice is a strategic decision visible at the very start, when the buyer is deciding whether to sign. Cohort formation is an operational one that becomes visible two years later. Collapsing them into one word hides the first decision entirely, which is the more interesting of the two.

A consequence worth building in: **water instrument eligibility is an attribute of the region, inherited by every cohort inside it.** Nothing has to be reassembled and no cohort has to be bent to a catchment boundary.

---

## Visual language

The distinction is carried by form, not by labels.

**A region is an area.** A drawn boundary, a filled or shaded territory, persistent, present on the map whether or not anything has happened inside it. It is part of the base geography.

**A cohort is a membership.** A set of specific properties shown as belonging together — by a connective treatment across its members rather than by a boundary drawn around empty land. **A cohort must not be drawn as a polygon**, because that implies it owns territory it does not own, and it implies edges where the real constraint is statistical similarity between members.

**Different lifecycles, different visual states.**

| | Region | Cohort |
|---|---|---|
| Before anything happens | Present, empty | Does not exist |
| Accumulating | Filling toward its target | Forming, once enough members exist |
| Working | Active recruitment, campaign running | Estimated, sampled, credited, repeating annually |
| After | Still there, still producing | May be restructured or retired |

**They should be distinguishable at a glance with the labels covered.** If a reader has to read a name to know which one they are looking at, the treatment has failed.

---

## Naming

- **Region** — always with its catchment name.
- **Cohort** — never a bare region name. A region will hold several cohorts, so "the Monaro cohort" stops being meaningful the moment Monaro has three. Cohorts need their own identifier alongside the region they sit in.
- Never use one word for both. Never abbreviate either into the other.

---

## The region panel

Add a panel showing **the regions the module is being built from, and how each is filling.** This is the recruitment story at the level it is actually managed, and it is more useful than one aggregate figure because it shows which regions are ahead and which need attention.

**Each region carries:**

- Its **catchment name**
- Its **target contribution** to the module, in hectares
- **Contracted so far**, as a fill against that target
- **Pipeline depth behind it**, being the eligible land still available to draw on
- Whether **a field team is working it now**, and whether a campaign is running
- **Which water instruments the catchment makes possible**
- **Cohorts formed inside it**, once any exist

**Ordering should follow attention rather than alphabet.** Early in the module's life the interesting region is the one furthest behind its curve.

**Selecting a region filters everything.** The map moves to it, the funnel scopes to it, the event feed scopes to it. Selecting it again returns to the module view.

**The module total is the sum of the regions and should be visibly so.** A reader should be able to see that the module fills because its regions fill, rather than being given a single number and a separate list.

---

## How each object appears at each time state

**Before the module opens.** Regions are shown as **candidates**, each with its target contribution, its eligible depth, and the instruments its catchment carries. All fills are at zero. This is a strong screen: here are the catchments your module will be built from, here is why each was chosen, here is what each can carry. **No cohorts exist and none should be implied.**

**During recruitment.** Region fills move. A region that has accumulated enough registered land shows that a cohort **can now form** there, which is a real event and the first sign the delivery machine is assembling. Cohorts begin to appear as memberships inside regions.

**At first crediting.** Regions are full and static. **Cohorts become the active object**: formed, sampled, credited, each with its own delivery quarter. The region persists underneath as the container and as the thing that determines instrument access.

**At steady state.** Cohorts cycle through their annual rounds inside regions that have stopped growing. Region-level content shifts from fill to **replacement depth**: how much eligible land remains behind each region, in case a project has to be swapped out.

---

## Constraints

- **Visual-led.** The reader's eye must know where to go on load. Cut explanation, keep labels: units, thresholds, provenance and annotations are not explanation and stay.
- **One dominant element per view.**
- **Nothing modelled is presented as measured.**
- **Empty states carry their reason and the date they resolve.** A region with no cohorts yet says when one can form. Never a blank, never a bare zero.
- **Only contracted properties may be named.** Everything else is unnamed density, because unconverted landholders have not consented to appear.
- **Nothing moves between time states.** A region sits in the same place at every point in the module's life.
- **Colour carries state, not identity.**
- Australian English. No em dashes anywhere including titles, spaced hyphens instead. No marketing verbs.

---

## Scope

**Build:** the separated visual language for regions and cohorts, the region panel with fill against target, region selection filtering the whole view, and the correct behaviour of both objects across the four time states.

**Do not build:** the add-on catalogue, disclosure content, or a styling system.

## What I am not specifying

How a region is shaded, how a cohort's membership is drawn, proportion, grid, component structure, type, colour, motion or chart forms. Those are the work. The only visual requirement is that an area and a membership must not look like the same kind of thing.
