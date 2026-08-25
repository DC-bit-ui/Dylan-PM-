# Time states and the catchment map

An addition to the console shell you have built. **Do not rebuild it.** This adds two things: a working control that moves the console through four points in the module's life, and a geographic model for the map that holds at every one of them.

---

## The domain, because it drives the geography

An Australian company measures soil carbon on grazing land and converts it into carbon credits issued by a federal regulator. The measurement runs on a machine learning model called HORIZON, trained on physical soil samples. **Credits are issued against physical soil samples, never against the model.** The model estimates; the samples decide.

The product being sold is a **commercial module**: 125,000 hectares of farmland, assembled one property at a time from individual landholders, contracted to deliver credits to one buyer over a seven year term. **The module opens on 1 December 2026. Today is 13 August 2026, so it has not started.**

Two facts about the land make the map work the way it does.

**Properties are grouped into cohorts, and cohorts need density.** Sampling a tenth of a cohort validates the whole of it, but only if the properties are close enough together to be sampled in one mobilisation. A cohort needs roughly 10,000 to 15,000 hectares of neighbouring project land. Scattered land cannot form a cohort, so **recruitment is deliberately concentrated rather than dispersed**.

**Catchments are the organising geography, and this is the important part.** A catchment is a water drainage basin. It is already how this company divides the country for recruitment, because it maps closely onto climate, soil and farming system. But it matters for a second reason: **water instruments are scoped by catchment.** Schemes that credit reduced sediment export, improved water quality, or volumetric water benefit are all accounted at catchment level, because that is the unit water moves through.

**So a cohort formed on a catchment boundary can carry both carbon and water instruments, from the same land, with no additional assembly.** A cohort formed on an arbitrary boundary carries carbon only. That makes catchment alignment a commercial decision rather than a cartographic one, and the map is where that decision becomes visible.

---

## Who is reading this

A carbon desk professional at an energy major, miner or commodity trader who has bought, or is considering buying, one of these modules. Commodity people, not sustainability managers. Technically literate, commercially sophisticated, allergic to marketing. They read in a fixed order: am I on track, what do I do, what could hurt me.

---

## The geographic model

**The base division of the map is the catchment, not the state and not an arbitrary sales region.** Catchment boundaries are drawn. Everything aggregates to them.

Each catchment carries these attributes:

| Attribute | What it is |
|---|---|
| **Assessed area** | Hectares the model has screened in this catchment |
| **Eligible area** | The subset that clears the method, which is assessed minus ineligible |
| **Pipeline depth** | Hectares currently moving through the recruitment stages here |
| **Contracted area** | Hectares signed into the module |
| **Cohort status** | Whether enough contracted land exists here to form a validation cohort |
| **Water instrument eligibility** | Whether this catchment sits inside a scheme that credits water outcomes, and which |
| **Recruitment activity** | Whether a field team and a campaign are currently working here |

**A focus catchment** is one the module is actively recruiting into. There will be a small number of these against a large national field of assessed catchments.

**Individual properties sit inside catchments** and appear at closer zoom. Contracted properties may be named. **Everything not yet contracted must be unnamed density**, because those are third-party landholders who have not consented to appear in a buyer's console.

---

## The lens model

One geography cannot be coloured by four things at once, so the map carries **lenses**. The catchments stay put; what they are coloured by changes.

| Lens | The catchment is coloured by | The question it answers |
|---|---|---|
| **Recruitment** | Pipeline depth and activity | Where are we working and how is it going |
| **Carbon** | Modelled yield and whether a cohort can form | Where is the module's delivery coming from |
| **Water** | Which water instruments this catchment makes possible | What else can this land carry |
| **Delivery** | Cohort state and scheduled delivery quarter | When does each part of my module land |

**Two things about the lens set matter.**

The **Water lens is the argument made visible.** Switching to it should show the reader that some of the catchments they are already recruiting into carry a second instrument, and some do not. **The overlap between "we have depth here" and "this catchment carries water" is the most valuable geography on the map**, and a reader should be able to see that overlap rather than be told about it.

And **the lens set grows as capabilities are added.** A buyer who has not purchased water accounting sees the Water lens present but not enabled, showing the shape of what it would reveal without the data. Buying it turns the lens on. That is how the add-on catalogue becomes concrete rather than a list of descriptions.

**Only one lens is active at a time.** Combining them produces a map nobody can read.

---

## The four time states

A control moves the console between four points in the module's life. Same frame, same sections, same catchments in the same places. What changes is the leading question, the data, and which lens opens by default.

**One stated as-at date sits in the chrome and every figure on screen belongs to it.**

**Nothing moves between states.** A reader builds a mental map of where information lives, and that map is worth more than any single striking screen. A panel that is empty in one state holds its position and says why.

---

### State one · Pre-launch · today, August 2026

**Leading question: can you actually do this?**

They have not signed, or have signed and nothing has started. They are being sold to and they know it, so every claim is discounted. They are not asking about performance because there is none. They are asking whether the machine exists.

**The map opens on the Recruitment lens, at national extent.**

- **Every catchment where land has been assessed**, shaded by eligible area. This is the reach exhibit and it should be the first thing seen. It is a national field, not a single region.
- **Focus catchments distinguished**, being the small set the module will be built from, with a visible reason: depth, density, existing sampling data.
- **Already-contracted properties** named, few in number, inside those focus catchments.
- **Switching to the Water lens** re-colours the same catchments by which water instruments they carry, and the reader sees which of the focus catchments sit in both.

**The panel carries:**

- **Position.** The module opens 1 December. Hectares already signed to it. And a coverage figure: **eligible hectares in the focus catchments against the 125,000 hectare target**, expressed as a multiple. This is the number that answers "can you finish" and only a business that has pre-screened whole catchments can state it.
- **The pipeline in hectares.** Note this spans two systems and should read as one journey: land is found and qualified first, then it enters a commercial process that ends in a signed contract. The handover between them is a real stage and should be visible, not hidden.
- **Capability.** What has been assessed nationally, what the screen tests for, and the fact that the first stage of the pipeline is itself a model output. Every hectare in the funnel is there because the model put it there.
- **The recruitment curve ahead**, month by month to 125,000.
- **Milestones to first credit.** Eight dated steps from December 2026 to December 2028.

**Legitimately empty:** every stage past "contracted" is zero. Each holds its position, shows zero, and carries the month it opens.

---

### State two · Month 6 · June 2027

**Leading question: are we recruiting to target?**

They have signed and the money is committed. They are no longer evaluating a claim, they are monitoring a position. **This is the only state where they check regularly**, so it carries the whole burden of being worth opening on an ordinary Tuesday.

**The map stays on the Recruitment lens.**

- **The national field persists and has grown.** Screening does not stop when the module starts, and showing it still growing is what proves there is depth behind the pipeline.
- **Contracted land now reads as a distinct class**, accumulating visibly inside the focus catchments.
- **Catchments approaching cohort formability are marked.** A catchment that has just crossed the density threshold is a genuine event.
- **Active campaigns are visible per catchment.** A campaign is a targeted recruitment push with a stated hypothesis, for example properties with high seasonal rainfall, and it reports what it produced. Showing the hypothesis and the result is proof the machine is being actively worked this week rather than merely running.

**The panel carries:**

- **Position: on curve or off it.** Hectares contracted against the plan figure for this month. Percent of target sits beneath, never above it, because in month six a raw percentage of target makes every module look like it is failing.
- **What has changed since the last visit.** An event feed, and at this state it leads. New land contracted and in which catchment. A catchment becoming cohort-capable. A campaign result.
- **The funnel**, grown, with movement between stages visible.
- **Velocity.** Time from first contact to signed contract, time from farm visit to decision, hectares added this quarter, hectares contracted per field team per week, each against the previous quarter. **This is the return on what the buyer funded**: their capital pays for field capacity, field capacity converts hectares, hectares fill their module. A faster process fills it sooner and it compounds.
- **Where the pipeline comes from.** The mix of sources feeding recruitment. A pipeline heavily dependent on one source is a concentration the buyer should be able to see.

---

### State three · First crediting · December 2028

**Leading question: did it deliver, and was the model right?**

Two years in. The land is all contracted and declared, the model has cleared its calibration gate, and the first cohort has been sampled and credited. **This is the moment the whole proposition is tested**, because for the first time there is a prediction and a physical result on their own land to compare. Recruitment stops being interesting almost overnight.

**The console opens on the Delivery section rather than the recruitment section at this state.** The sections stay in the same order and nothing moves. Only the default landing changes, because the leading question has changed.

**The map opens on the Delivery lens.**

- **Cohorts, named by catchment**, each in one of three states: in development, live, or harvestable.
- Each carrying its **estimated yield** and its **scheduled delivery quarter**. Cohorts are harvested one at a time across the year, not all at once, which is what makes the delivery programme schedulable rather than reactive. A schedulable programme is one a financier can plan around.
- Selecting a cohort gives an aggregated view of it.
- **Switching to the Water lens now shows which of the live cohorts carry a second instrument.** At this state that stops being a prospect and becomes an asset the buyer already holds. Cohorts that sit inside a water scheme should be distinguishable from those that do not.
- The national assessed field recedes visually. It is now the bench, not the story.

**The panel carries:**

- First issuance against the contracted schedule. One quarter is not a trend and the panel should say so.
- **Predicted at baseline, measured by the cores, issued by the regulator — and the first row is theirs.** Everything below it is the company's record on earlier projects. This transition, where the table changes ownership, is the most persuasive moment in the product.
- The next cohort and its scheduled quarter.
- The ability to request a harvest where a cohort is harvestable, with the consequence stated before it is confirmed.

---

### State four · At nameplate · 2031

**Leading question: am I on schedule, and what could hurt me?**

Steady state. The module is a position they hold rather than a project they are watching, and it is read the way any position is read.

**The map stays on Delivery.** All cohorts cycling through their states on schedule. The bench behind them is replacement capacity rather than pipeline.

**The panel carries:**

- Cumulative delivery against the contracted schedule, **with the forecast expressed as a numeric range and never as a verbal hedge**. A range costs almost nothing in credibility; a hedge costs measurably more, and costs it twice.
- Quarterly cadence.
- The full record of predicted against measured against issued, now entirely theirs.
- **Portfolio optimisation.** Projects added or removed to hold the portfolio average, which is contractual and which a financier wants sight of.
- **What could hurt this.** Climate and land condition only, kept separate from anything about the company's own performance. Two panels, not two categories in one list.

---

## Interaction

**The lens control sits with the map**, and the active lens persists as the reader moves between time states, because it is a statement about how they want to read rather than about one screen.

**Selection is shared in both directions.** Selecting a catchment on the map filters the panel to it. Selecting a pipeline stage or a cohort in the panel highlights that land on the map. Whichever environment is focal, the other is showing the same subject.

**Additions arrive as events, not as state changes.** When land is contracted, the map registers that something happened and says what and where, rather than quietly showing a larger number than last time.

**A contracted property can be entered from the map** to open its own detailed view.

---

## Constraints

- **Visual-led.** The reader's eye must know where to go the moment the screen loads. Cut explanation, keep labels: prose telling this reader what a chart means is redundant to them, but units, thresholds, provenance and annotations are not. Removing a paragraph is usually right. Removing a unit is always wrong.
- **One dominant element per view.**
- **Nothing modelled is presented as measured.** Every figure carries which it is.
- **Empty states carry their reason and the date they resolve.** Never a blank, never a dash, never a bare zero. Most of this console is legitimately empty at the first two states and that must read as honest rather than broken. **This is the single most important detail in the product.**
- **Uncertain numbers get a numeric range, never a verbal hedge**, and any interval is labelled in words for what it is.
- **Precision follows provenance.** Measured figures exact, modelled and forecast figures rounded.
- **No dollar value is ever applied to a credit volume.** Counts, hectares and capacities only.
- **Unconsented landholders are never identifiable.**
- **Colour carries state, not identity.** If the accent appears on everything it signals nothing.
- Australian English. No em dashes anywhere including titles, spaced hyphens instead. No marketing verbs.

---

## Scope

**Build:** the time state control and all four states, the catchment geography, the lens model with one lens active at a time, shared selection, and the event feed. Populate the recruitment section fully at states one and two. Delivery may be indicative at states three and four provided the map and the lens behaviour are real.

**Do not build:** the add-on catalogue, disclosure content, or a styling system.

## What I am not specifying

Proportion, grid, component structure, type, colour, motion, chart forms, how catchments are shaded, how the lens transition behaves, or how an event is presented. Those are the work.
