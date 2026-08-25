# The map, the geography, and four states of the module's life

An addition to the console shell you have built. **Do not rebuild the shell.** This specifies the geographic model the map runs on, the two land objects it contains, how properties change state over time, and a control that moves the whole console through four points in the module's life.

---

## 1 · Scope note

The module is 125,000 hectares of grazing land, assembled one property at a time, contracted to deliver credits to one buyer over a seven year term. **It opens 1 December 2026. Today is 13 August 2026, so it has not started.** Year one recruits, registers and baselines the land. Year two calibrates the model. Years three to seven are the five crediting years.

**The buyer has two questions and which one leads depends on where the module is in its life.** Year one: are we recruiting to target. Year three onward: are we delivering credits. Everything else layers underneath those two.

**One correction on how crediting works, because it drives the cohort behaviour below.** Under Schedule 2 the model generates the estimate for the full cohort, a randomised physical sampling round of ten per cent of the cohort validates that estimate, and **credits are then issued against the validated model output across the whole cohort, annually.** The model does the crediting. Sampling validates it rather than replacing it. That is what makes annual crediting possible without full physical re-measurement, and it is why the cohort, not the property, is the unit of delivery.

---

## 2 · The object model

Three land objects. **Two are frequently confused and must not be.**

### Property

A single landholding. Owner, boundary, area, and a position in the pipeline. Becomes a **project** once contracted and registered.

### Region — a territory the company works

A **catchment**, a water drainage basin. Chosen because it groups land with similar climate, soil and farming system, and because it is an area a field team can physically cover.

- **It is fixed geography.** Its boundary exists whether or not a single property inside it has been signed.
- **It exists before the module and outlives it.** Land has been assessed here for years and will keep being assessed after this module is full.
- **It is operational.** A field team works it. Campaigns target it. A pipeline runs through it.
- **It is large.** A single region may hold three million hectares of assessed land and several thousand properties, of which a module might take forty thousand.
- **A module is built from a small number of regions**, two being the working assumption, each with one field agent and one person running calls, bookings and scheduling behind them.

### Cohort — a set of projects grouped for validation and crediting

Sampling a tenth of a cohort validates the model estimate for all of it. That works only if the members are close enough together to sample in one mobilisation and similar enough for the model to calibrate across them.

- **It is derived from its members.** Its extent is a consequence of which projects are in it, not a boundary drawn on the land.
- **It cannot exist until there are registered projects.** Before that it is a possibility.
- **It is roughly 10,000 to 15,000 hectares**, so a 125,000 hectare module resolves into eight to ten of them.
- **It can be restructured.** Cohorts are reformed and recalibrated as the portfolio changes.
- **It is the crediting unit**, with an annual cycle: estimate, sample a tenth, credit the whole, repeat. Each cohort carries its own **scheduled delivery quarter**, because cohorts are harvested one at a time across the year. That is what makes the programme schedulable rather than reactive, and a schedulable programme is one a financier can plan around.

### How they relate

**Cohorts sit inside regions.** A region contains several cohorts once it has filled. A cohort belongs to one region.

### Why the distinction is commercial

**Region choice determines what the land can be worth.** Water instruments, which credit reduced sediment export, improved water quality or volumetric water benefit, are accounted **by catchment**. A region either sits inside such a scheme or it does not. So **where to recruit determines which instruments the module can ever access**, and that is decided before a single property is signed.

**Cohort composition determines how and when credits are delivered.** Sampling cost, statistical confidence, delivery quarter. It has no bearing on instrument access.

Two decisions, two levels, two timescales. Region choice is strategic and visible at the very start, when the buyer is deciding whether to sign. Cohort formation is operational and becomes visible two years later.

**Water instrument eligibility is an attribute of the region, inherited by every cohort inside it.** No cohort has to be bent to a catchment boundary.

---

## 3 · Visual language for regions and cohorts

Both are areas on the map. What separates them is what their edges mean.

**A region's edge is geography.** A catchment boundary, fixed, present whether or not anything has happened inside it, part of the base map. Remove every property and the region is still there.

**A cohort's edge is a consequence.** It hugs its member projects and changes shape when membership changes. Remove the projects and the cohort vanishes. **It should visibly wrap its members rather than read as an administrative boundary**, and its members should stay visible inside it.

That is the test, and it should hold without reading a label: **one is a container that exists on its own, the other is a grouping that exists because of what is in it.**

**Different lifecycle states.**

| | Region | Cohort |
|---|---|---|
| Before anything happens | Present, empty | Does not exist |
| Accumulating | Filling toward its target | Forming, once enough members exist |
| Working | Active recruitment, campaign running | Estimated, sampled, credited, repeating annually |
| After | Still present, still producing | May be restructured or retired |

**A cohort should show what it is worth and when it lands.** Modelled volume for the round, hectares, member count, sampling status, and its scheduled delivery quarter. This is where the buyer sees the harvest coming.

**Naming.** A region always carries its catchment name. **A cohort is never named after a region alone**, because a region will hold several and "the Monaro cohort" stops meaning anything the moment Monaro has three. Cohorts need their own identifier alongside the region they sit in.

---

## 4 · Properties on the map, and how they change

Every property is a point on the map, **coloured by its current state.** The conversion of prospects into projects is the central animation of the whole product: as the time control moves, points change state, and the reader watches the module assemble out of a national field.

Two families of state, and they must read as two families.

**Prospect states**, for properties not yet in the module:

- Identified
- Not eligible
- In conversation
- Not interested
- Farm visit booked or completed
- Proceeded to commercial process
- Contracted

**Project states**, for properties in the module:

- Registered with the regulator
- Baselined, physically sampled
- In a cohort, crediting
- Measured increase confirmed
- Credits issued

**Contracted properties may be named. Everything not yet contracted must be unnamed density**, because those are third-party landholders who have not consented to appear in a buyer's console. A prospect point shows its state and its rough area, never its owner or address.

**State changes are events.** When a property moves from one state to another the map should register that something happened and say what and where, rather than quietly showing a different colour than last time.

---

## 5 · Entering a property

**A property in the module can be opened to reveal its own detailed view**, a digital twin of that land with its own layers and history.

**Two routes in, and both must work.** Selecting the property on the map, and selecting it from a list of the module's properties in the panel. The list is the reliable route; the map is the discoverable one.

**At the first time state exactly one property is commissioned to the module: Mulloon, in the Southern Tablelands of New South Wales, 5,990 eligible hectares.** It is the only property with a twin behind it, and it is the demonstration. Everything else on the map at that state is prospect.

---

## 6 · The map

**The map is persistent and primary.** The asset being sold is land, every question this product answers has a spatial form, and the map is the substrate every future capability attaches to. It is **not** a locator showing where things are. **It is the current question, drawn spatially.** If it is not doing the work a chart would otherwise do, it has failed.

### Base geography

**The base division is the catchment region.** Not states, not arbitrary sales territories. Everything aggregates to regions.

Each region carries: assessed area, eligible area, pipeline depth, contracted area, target contribution to the module, water instrument eligibility, whether a field team and campaign are active, and the cohorts formed inside it.

### Lenses

One geography cannot be coloured by four things at once, so the map carries **lenses**. Regions stay in place; what they are coloured by changes. **Only one lens is active at a time.**

| Lens | Regions coloured by | The question |
|---|---|---|
| **Recruitment** | Pipeline depth and activity | Where are we working and how is it going |
| **Carbon** | Modelled yield and cohort formability | Where is delivery coming from |
| **Water** | Which instruments the catchment makes possible | What else can this land carry |
| **Delivery** | Cohort states and scheduled quarters | When does each part of my module land |

**The Water lens is the argument made visible.** Switching to it should show that some regions already being recruited into carry a second instrument and some do not. **The overlap between "we have depth here" and "this catchment carries water" is the most valuable geography on the map**, and a reader should find it rather than be told.

**The lens set grows as capabilities are added.** A buyer who has not purchased water accounting sees the Water lens present but not enabled, showing the shape of what it would reveal without the data. Buying it turns the lens on.

**The active lens persists across time states**, because it is a statement about how the reader wants to read.

---

## 7 · The region panel

**The regions the module is being built from, and how each is filling.** More useful than one aggregate figure because it shows which regions are ahead and which need attention.

Each region shows its catchment name, target contribution, contracted fill against it, pipeline depth behind it, whether a field team and campaign are active, which water instruments the catchment carries, and the cohorts inside it once any exist.

**Order by attention, not alphabet.** Early on, the interesting region is the one furthest behind its curve.

**The module total is the sum of the regions and should be visibly so.** A reader must see that the module fills because its regions fill, rather than being handed one number and a separate list.

**Selecting a region filters everything.** Map, funnel, event feed. Selecting again returns to the module view.

---

## 8 · The four time states

A control moves the console between four points. **Same frame, same sections, same regions in the same places.** What changes is the leading question, the data, the property states, and which lens opens by default.

**One stated as-at date sits in the chrome and every figure belongs to it. Nothing moves between states.** A panel that is empty in one state holds its position and says why.

### State one · Pre-launch · August 2026

**Can you actually do this?** They have not signed, or have signed and nothing has started. They are being sold to and every claim is discounted. There is no performance to report. **They are asking whether the machine exists.**

**Map: Recruitment lens, national extent.** Every region where land has been assessed, shaded by eligible area — this is the reach exhibit and should be seen first. The module's regions distinguished, with a visible reason: depth, density, existing sampling data, instrument access. Property points across the country in their prospect states.

**One property is contracted and named: Mulloon.** It is the only point in a project state and the only one that can be entered. **No cohorts exist and none should be implied.**

**Region panel:** regions as candidates. Target contribution, eligible depth, instruments carried, all fills at zero.

**Main panel:** the module opens 1 December, one property commissioned. A **coverage figure** — eligible hectares across the module's regions against the 125,000 target, as a multiple — which answers "can you finish" and only a business that has pre-screened whole catchments can state. The pipeline in hectares, reading as one journey across finding and qualifying then a commercial process, with the handover visible. The recruitment curve ahead, month by month. Eight dated milestones to first credit.

**Legitimately empty:** every stage past contracted. Each holds position, shows zero, carries the month it opens.

### State two · Month 6 · June 2027

**Are we recruiting to target?** Money is committed. They are monitoring a position rather than evaluating a claim. **This is the only state where they check regularly**, so it carries the whole burden of being worth opening on an ordinary Tuesday.

**Map: Recruitment lens.** The national field persists and has grown, because screening does not stop when the module starts and showing it still growing is what proves the depth is real. Property points visibly converting: more in conversation, more farm visits, a growing set contracted. **A region that has accumulated enough registered land shows a cohort can now form there** — a real event and the first sign the delivery machine is assembling. First cohorts appear as groupings around their members. Active campaigns visible per region, each with its hypothesis and what it produced.

**Region panel** is the most useful object on the screen: fills moving at different rates, some regions ahead of curve and some behind.

**Main panel:** position on curve or off it, with **percent of target beneath, never above**, because a raw percentage in month six makes every module look like it is failing. The event feed leads at this state. The funnel, grown, with movement visible. **Velocity** — time to contract, time to decision, hectares added this quarter, hectares per field team per week, each against last quarter. That is the return on what the buyer funded: their capital pays for field capacity, capacity converts hectares, hectares fill their module. And where the pipeline comes from, because heavy dependence on one source is a concentration they should see.

### State three · First crediting · December 2028

**Did it deliver, and was the model right?** The land is contracted and declared, the model has cleared its calibration gate, the first cohort has been sampled and credited. **This is the moment the proposition is tested**, because for the first time there is a prediction and a physical validation on their own land. Recruitment stops being interesting almost overnight.

**The console opens on the Delivery section at this state.** Sections stay in the same order, nothing moves, only the default landing changes.

**Map: Delivery lens.** **Cohorts are now the active object**, each visibly grouping its member projects, in one of three states: in development, live, or harvestable. Each shows its modelled volume, its hectares, and its **scheduled delivery quarter**. Selecting one gives the aggregated view. Regions persist underneath as containers, static now, still determining instrument access. The national prospect field recedes to become the bench. Switching to the **Water lens** shows which live cohorts sit in a region carrying a second instrument, which at this state stops being a prospect and becomes an asset they hold.

**Region panel** shifts from fill to composition: each region full, listing its cohorts.

**Main panel:** first issuance against the contracted schedule, with **one quarter is not a trend** said plainly. **Modelled at estimation, validated by the sampled tenth, issued by the regulator — and the first row is theirs**, with the company's record on earlier projects below it. That transition, where the table changes ownership, is the most persuasive moment in the product. The next cohort and its quarter. **Request a harvest** where a cohort is harvestable, with the consequence stated before confirmation.

### State four · At nameplate · 2031

**Am I on schedule, and what could hurt me?** Steady state. A position they hold rather than a project they watch.

**Map: Delivery lens.** All cohorts cycling their annual rounds inside regions that have stopped growing. The bench behind them is replacement capacity.

**Region panel** shifts to **replacement depth**: eligible land remaining behind each region, in case a project has to be swapped.

**Main panel:** cumulative delivery against the contracted schedule, **forecast as a numeric range and never a verbal hedge**, because a range costs almost nothing in credibility and a hedge costs measurably more, on the number and on the source. Quarterly cadence. The full modelled against validated against issued record, now entirely theirs. **Portfolio optimisation**, projects added or removed to hold the portfolio average, which is contractual and which a financier wants sight of. And **what could hurt this** — climate and land condition only, kept separate from anything about the company's own performance, because a reader processes those differently.

---

## 9 · Interaction

**Selection is shared in both directions.** A region or cohort selected on the map filters the panel; selected in the panel it highlights on the map. Whichever environment is focal, the other shows the same subject.

**Property state changes arrive as events**, not as silent state changes.

**A contracted property opens its own detailed view**, from the map or from the property list.

**The lens control sits with the map** and its state persists across time states.

---

## 10 · Constraints

- **Visual-led.** The eye must know where to go on load. **Cut explanation, keep labels.** Prose telling this reader what a chart means is redundant to them. Units, thresholds, provenance and annotations are not explanation. Removing a paragraph is usually right; removing a unit is always wrong.
- **One dominant element per view.**
- **Modelled and validated are different claims and must be distinguishable.** A cohort estimate before its sampling round is not the same object as one after it.
- **Empty states carry their reason and the date they resolve.** Never a blank, never a dash, never a bare zero. A region with no cohorts says when one can form. Most of this console is legitimately empty at the first two states and that must read as honest rather than broken. **This is the single most important detail in the product.**
- **Uncertain numbers get a numeric range, never a verbal hedge**, and any interval is labelled in words for what it is, because intervals are routinely misread as high and low forecasts even by expert readers.
- **Precision follows provenance.** Issued figures exact, modelled and forecast figures rounded.
- **No dollar value is ever applied to a credit volume**, and no credit count sits beside a price such that a reader performs the multiplication.
- **Unconsented landholders are never identifiable.**
- **Nothing moves between time states.**
- **Colour carries state, not identity.** If the accent appears on everything it signals nothing.
- Australian English. **No em dashes anywhere including titles** — spaced hyphens instead. No marketing verbs.

---

## 11 · Scope

**Build:** the catchment region geography, regions and cohorts as visually distinct areas, property points with both state families and their transitions across time, the lens model with one lens active, the region panel with fill against target, region selection filtering the view, the property list and both entry routes into a property's detailed view, the time state control and all four states, and the event feed.

Populate the recruitment section fully at states one and two. Delivery may be indicative at states three and four provided the cohort behaviour, the lens switching and the property state transitions are real.

**Do not build:** the add-on catalogue itself, disclosure content, the property's detailed view beyond an entry point, or a styling system.

## 12 · What I am not specifying

Proportion, grid, component structure, type, colour, motion, chart forms, how a region is shaded, how a cohort wraps its members, how the lens transition behaves, or how an event is presented. Those are the work.
