# Spin this off as a clean build

Take the current working console and remix it into a fresh version. This brief covers the rebuild itself and the navigation between the module view and the individual property view. The content changes to each tab are specified separately.

---

## Why a remix rather than an edit

The console has grown by accretion. Sections have been added, replaced, moved between tabs and removed, and the structure now carries the residue of all of it: content that belongs to one tab rendering inside another, components left behind by features that were taken out, and state that outlived whatever set it.

**A remix that copies the current structure forward is not worth doing.** The value in forking is the opportunity to rebuild the frame properly and carry across only what earns its place.

So: same product, same direction, structure rebuilt from the ground.

---

## What clean means here

**One panel per tab.** Selecting a tab replaces the panel contents and returns to the top of it. No tab shares a scroll surface with another. Nothing renders inside a tab that does not belong to it.

**One place where state lives.** The current time state, the selected tab, the selected region or cohort, the focus setting, and which capabilities are enabled are held once and read everywhere. Changing the time state should not require any section to know about any other section.

**Nothing orphaned.** Anything removed is removed completely - its component, its data, its styles and any state it set. Removed content must not be recoverable by scrolling, by resizing, or by moving between time states.

**One visual system, applied once.** Three type sizes at most. A small fixed set of colours, weights and greys, defined in one place and used everywhere rather than chosen per section. This is the single change that will do the most for how the console reads, and it is far easier to do in a rebuild than to retrofit.

**Every section behaves at every time state.** A section either has something true to say at a given state, or it is absent and something says why and when it resolves. Nothing renders in a diminished or half-populated form.

---

## Carry these across intact

A rebuild is where good work gets lost. These were all specifically praised and should survive:

- The map as the persistent left surface, and the catchment framing
- The time stepper across the module's life
- The focus control that shifts weight between map and panel, including the most condensed option
- The fill projection chart
- The pipeline stage chart
- Hectares by stage
- The cohort cards
- The model monitoring panel, including the decreases as well as the increases
- The plot of modelled against validated accumulating over time
- The marketplace, and in particular the moment a capability is enabled and the console gains a section

Where the rebuild improves on any of these, keep the improvement. Where it would simplify one out of existence, keep the original.

---

## The property view, and getting back out

A property opens from two places: its point on the map, and its row in the property list. Inside, the reader is looking at an individual farm - its land, its baseline, its measurement history, its projected yield. It is the only part of this product that is a place rather than a portfolio, and it is worth the transition feeling like one.

**Returning must be obvious, permanent and predictable.**

Obvious: a visible control that is always on screen, not a browser back action. A presenter reaching for the browser toolbar mid-demonstration reads as a broken product.

Permanent: present from the moment the property opens, at every scroll position, on every part of the property view.

Predictable: **it returns the reader to exactly where they left.** The same tab, the same time state, the same scroll position, with the property they came from still identifiable in the list or on the map. Coming back to a generic module home and having to find your place again is the failure mode to avoid.

A named path works better than a bare back arrow, because it says both where you are and where you will land - the module name, then the property. It also keeps the module present while the reader is inside a single farm, which is the relationship being demonstrated: this is one property inside something much larger.

Entering from the map should return to the map; entering from the list should return to the list.

**Worth deciding rather than assuming:** the property view was built for the landholder who owns that land. A module holder looking at the same view may be seeing detail the landholder considers theirs. It may be that the module holder sees a reduced version. Flagging it rather than resolving it here.

---

## It has to work for other people

The property view currently opens locally but not for others opening a shared link. Whatever the cause, the rebuilt version needs to work end to end on someone else's machine, from a link, with no local state or setup.

The same goes for every route through the console. A demonstration is run by someone who is not the person who built it.

---

## No dead ends

Every tab, time state, card, cohort and property row either goes somewhere or is visibly inert. A click that does nothing costs more than an absent feature, because the reader concludes the whole surface is a mock.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Three type sizes at most, one shared colour and weight set.
- Modelled figures described as modelled.
- All credit volumes are the purchaser's share, net of discount, and labelled as such.
- Landholders who have not consented are never individually identifiable.

## Yours to decide

Component structure, state approach, how the transition into and out of a property is handled, and how the visual system is expressed. The requirement is a build that is clean enough to keep changing quickly, and a reader who never loses their place.
