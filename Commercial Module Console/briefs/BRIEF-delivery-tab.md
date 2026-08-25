# Please rework the Delivery tab

An edit to the Delivery tab in the commercial module console. The tab has the right raw material and the wrong centre of gravity. This brief covers what we think is weak, what we worked out between us, and the directions worth exploring.

---

## Who is reading this

A carbon desk professional at a large emitter with an annual, date-stamped compliance obligation. Their organisation must surrender credits each compliance year against a facility-level liability.

This module is one line in a large book. It will never be the whole answer to their obligation and it does not need to be. **What they need from this line is not scale, it is predictability.** A small, reliably delivered, well-evidenced position is valuable precisely because they do not have to manage it.

That sets the tab's job: **show what was committed, what has landed, what the model says about the rest, and how accurate that model has proven to be.**

Two consequences worth holding onto:

- **Do not frame anything against their total obligation.** The denominator is what this module committed to deliver. Their wider book is not this console's business, and putting our volume beside their liability makes a good line look like a rounding error.
- **A surplus is not waste.** Credits can be held and surrendered in a later year. Where delivery runs ahead of schedule, that reads as banked, not stranded.

---

## What is weak in the current tab

Direct feedback, because it is more useful than a polite version.

**About half the tab answers a question that belongs on another tab.** The pipeline, the fill projection, the recruitment engine and where the land came from are all recruitment content. Delivery is a different question with a different time base. The recruitment story belongs on the Hectares tab at full depth.

**It leads backwards.** The first substantial thing on the tab is a result for one cohort out of ten. That result is good proof, but the reader's live question is about the other nine, and the answer to that is forward-looking.

**Nothing on the tab answers "will I get what I contracted".** There is no position, no schedule against commitment, no forward view. That is the single largest gap.

**The cohorts are buried.** They sit below climate content, near the bottom. They are the most important object on the tab and the only thing the reader can act on.

**"Request a harvest" is a bare button.** Timing a harvest is a real decision with consequences, and the interface currently treats it as a form submission.

**The validation ladder wants to be a figure.** Modelled, validated, issued as three stacked text rows is a table pretending to be a chart. The relationship between the three numbers is the content.

**Modelled yields are static.** Each cohort carries a modelled ACCU figure with no indication of whether it is rising or falling, or why. The model re-reads this land continuously and the interface does not show that it is alive.

**The properties list runs 24 rows deep** with a name, a status and a size. No ranking logic, and not enough per row to be worth the length.

**Climate appears twice**, as "Climate and land condition" and again as "What could hurt this", with overlapping content and two different treatments.

**Hectares by stage is a spent element** at this state, showing three of five categories as "All moved on".

**No price anywhere**, on a surface built for someone who thinks in price.

**The map organises by region boundary**, which is a recruitment construct rather than a delivery one.

---

## What we worked through, and where we landed

### The module is not necessarily full when crediting starts

A module can be 85 per cent contracted with its first cohort already crediting, because early-signed projects reach their crediting year while recruitment continues. The two questions genuinely overlap in time.

The resolution: **recruitment insight lives on the Hectares tab at full depth. Delivery carries only two things about recruitment.** A single finished-state summary when the module completes, being the fulfilment date and how it compared to the original proposal. And, while filling continues, **what the remaining recruitment does to the delivery schedule**, because land signed later credits later. That second one is a delivery question, not a duplicate.

### Volume or schedule

Both. It is a volume commitment delivered against a schedule, and for this reader the schedule binds harder, because credits arriving after a compliance date miss that year entirely.

So the delivery schedule is the spine. Ten cohorts, each with a scheduled quarter, each with a modelled volume, each with a state. That is not a list, it is a **calendar of discrete delivery events**, and progress, targets and predictions all hang off it.

Worth building in: **schedule risk against their compliance year, not just against our plan.** A cohort scheduled close to a compliance boundary carries a different risk from one scheduled mid-year, because one quarter of slippage crosses the line.

### Regions are a recruitment construct

Projects will be recruited nationwide through organic enquiry, partner referral and campaigns, not only inside worked catchments. The map should carry projects wherever they are, across the country. Region boundaries become an overlay showing where field teams work rather than the organising geography.

This has a good consequence. Cohorts cannot be assumed to follow regions, so cohort formation becomes a real optimisation: members close enough to sample in one mobilisation, and similar enough for the model to calibrate across. **Show that as something the model solves.** These projects grouped because they are statistically similar and physically samplable together is a far better story than an administrative grouping, and it explains why a cohort can be restructured while a catchment cannot.

### The leading element

The tab leads with the AI-derived insight line, as elsewhere in the console. One finding, computed, changing with the data, selecting it scopes the view to whatever it concerns.

---

## Directions worth exploring

These are proposals. If you find better, take it.

### Position over time, and it anchors the tab

For each period: what was committed, what has been delivered, what is modelled for the periods ahead, and where that leaves them. Delivered volume accumulates. Modelled volume revises. The gap between the two curves is the reader's actual answer.

**This anchors the tab, and the reason is structural rather than a matter of taste.** It is the only element that is meaningful at every point in the module's life, because the commitment and the schedule both exist before a single hectare does. Everything else on the tab is either empty or partial for at least half the term. An anchor that never has to apologise for being empty is the only kind worth having.

Everything else is evidence for it, or action on it.

### The delivery calendar

Ten cohorts across roughly ten quarters, each an event with a date, a modelled volume and a state. In development, forming, ready, harvestable, sampled, credited, and back to in development for the following year. Ten cohorts across five crediting years is around fifty harvest events over the term. That cadence is the rhythm of the product and the interface should feel like it has one.

### The cohort as the hero

Cohorts move to the top of the tab. A harvestable cohort is the most important thing that can happen and should be visible from everywhere, including the tab summary and the insight line.

### Harvest as a decision, not a request

A harvest can be triggered ahead of schedule at the reader's discretion. That makes harvest timing a genuine lever on realised volume, which is unusual for a financial position and is the most engaging thing on the tab.

Give the decision its inputs rather than a bare button:

- How long the cohort has been ready
- Seasonal model trend for that region, where carbon historically reads higher or lower by month
- Whether ground conditions will allow clean sampling
- Whether it falls in a window the landholders can accommodate, avoiding harvest or seeding
- The modelled yield now against the modelled yield if held to the scheduled quarter
- What the sampling round costs and covers

The landholder-calendar input matters beyond its utility. It tells the reader these are working farms rather than portfolio abstractions.

### Two statistical figures, doing two different jobs

**Per cohort, a waterfall.** Modelled at estimation, the adjustment the sampled tenth made, the reversal buffer, and what the regulator issued. Left to right, each step visible as a movement rather than as a row of numbers.

**Across the portfolio, a calibration plot.** Every sampled cohort as one point, modelled on one axis, validated on the other, the identity line through it. Points clustering on that line is the most persuasive image this product can produce, and because it is a standard scientific figure a technical reader takes it in without a legend.

It should degrade honestly. At one cohort it is a single point and obviously so, which is what the existing note about one quarter not being a trend already says in words. Build it to accumulate from the first sample, and let the earlier time states show it filling in.

### Yield attribution

When the modelled portfolio yield moves, say what moved it. Portfolio yield up four per cent this quarter, of which three points from above-median autumn rainfall in one region and one point from ground cover recovery in another.

No other carbon product can tell a buyer why their forecast changed. This turns a number into an explanation and it is the clearest demonstration on the tab that the model is reading the land continuously rather than producing an annual estimate.

Each cohort's modelled figure should carry its trajectory alongside its value for the same reason.

### Spot against locked

Their locked price against the market price for the same credit, over time, from a named and dated public source.

Frame the axis as **the cost of certainty** rather than as a win. The line will cross in both directions over seven years, and for a compliance buyer a position locked below market is still risk transferred. A chart that only reads well in one direction gets discounted the first time it turns.

This tab now carries dollar values. Apply that consistently across the tab rather than to this chart alone.

### The properties list

Five rows visible, the rest on scroll. Ranked by ACCUs produced, then by nameplate.

The reader's interest is in which land performs and why, partly because several of them manage land themselves. Each row carries: ACCUs to date, area, nameplate, predicted ACCUs per hectare per year, and the instruments the property carries - soil carbon, Reef Credits, water, biodiversity, environmental plantings.

Predicted ACCUs per hectare per year is the only field that makes a 7,950 hectare property comparable with a 2,000 hectare one, so it is worth offering as a sort.

The instrument tags are more than a label. A property carrying three instruments is worth materially more than one carrying soil carbon alone, and the portfolio-level version of that - how many properties carry a second or third instrument - is a statement about asset quality that is currently invisible.

Entering a property opens its own view. That is the only part of this tab that is a place rather than arithmetic, and it is what an ESG team would actually put in front of a board.

### Prompting the additional purchase

The module holder pre-purchased soil carbon. The land they hold it on generates more, and that is worth offering them.

Three kinds, in rising order of interest: soil carbon above their entitlement from their own projects, **other instruments from those same projects**, and credits from adjacent projects worked by the same field teams.

The middle one is the prize. It turns a carbon purchase into a nature story on land they already monitor, with named properties and measured outcomes. It also reaches a second buyer inside the same building: soil carbon is a compliance line item, while water and biodiversity outcomes belong to the sustainability and disclosure function, which has its own reporting pressure and its own budget. Giving the carbon desk something to hand across the corridor is the commercial point.

**The offer arrives as an event, not as furniture.** Nothing about it sits permanently on screen. When a new instrument becomes available across land the reader already holds, that is a finding, and it is delivered the way every other finding on this console is delivered - as the derived insight, in the reader's own voice of record, selecting through to where the purchase happens.

That framing matters more than it looks. A notice from the analytics engine saying *Reef Credits have come online across 13,600 hectares of your Fitzroy projects* is information about their asset. A banner saying *buy Reef Credits* is an advertisement. Same fact, opposite reception, and this reader will not forgive the second one.

Two kinds of trigger, and they are not equal.

**Something became available on land they already hold.** Lead with these. They are about the reader's own asset and they are unarguable.

**A market or a reporting expectation has emerged that their portfolio could address.** Useful, but handle carefully. A compliance professional knows their own obligations better than we do, and being told what they should want reads badly. Keep it factual: what exists, what their land could generate against it, no advice.

**It should already know their position.** If the reader is short in a given compliance year and an instrument becomes available on their own land, say so in the same breath. That is not a sales pitch, it is the position view and the offer being the same object seen twice.

Frequency is the whole risk. Genuinely new instrument availability is a rare event, so this should fire rarely, and it must be dismissible without the same thing returning a week later. An offer that recurs teaches the reader to ignore the insight line, which costs far more than the sale.

On wording: these are distinct tradeable instruments with their own methods and registries rather than co-benefits in the loose sense. Naming them precisely is worth more with this reader than a softer collective noun.

The full marketplace is a later piece of work. What this tab needs is the moment the offer becomes true.

---

## The four time states, and which one to design first

The console moves between four points in the module's life. Delivery behaves very differently at each, and most of the difficulty in this tab is in the early states rather than the late ones.

The module's own dated track sets the timeline: opens December 2026, all hectares recruited February 2028, all land physically sampled April 2028, all projects declared with the regulator June 2028, model calibration gate October 2028, first crediting year opens December 2028, term ends December 2033.

| | Pre-launch | Month 6 | First crediting | At nameplate |
|---|---|---|---|---|
| **Insight line** | what is about to be built and when | recruitment converting into future delivery | the first issuance | schedule adherence and replacement depth |
| **Position over time** | committed volume and its schedule, nothing delivered | unchanged, with the schedule firming as land registers | first delivered point, modelled curve ahead of it | full curve, banked surplus visible |
| **Delivery calendar** | the scheduled slots, dated, empty | cohorts becoming possible as land registers | one credited, one harvestable, the rest in development | all cycling annually |
| **Cohorts** | none exist, and the tab says when the first can form | forming | live, harvestable, in development | annual rounds |
| **Harvest action** | absent | absent | available on any harvestable cohort | routine |
| **Waterfall** | absent, with the quarter it first appears | absent | the first round | the latest round |
| **Calibration plot** | empty axes, dated | empty axes, dated | one point, visibly one | ten points and a line |
| **Yield attribution** | none, the land is not in the model yet | first reads on baselined land | quarterly revisions | continuous |
| **Spot against locked** | locked price and market history, no position yet | same | same, with realised volume | same, full position |
| **Properties** | one commissioned property | growing, no yield yet, ranked by nameplate | ranked by ACCUs produced | ranked by ACCUs produced |
| **Additional purchase** | not yet relevant | not yet relevant | first becomes relevant | most relevant |
| **Recruitment summary** | not applicable | not applicable | fulfilment date and how it compared to the proposal | same, unchanged |

**Design the pre-launch state first.** It is the hardest and it is the one that sells. Every element has to justify itself with no data in it, which is a strong filter: an element that cannot say something useful when empty probably should not exist. Get that right and the later states are the same structures filling up.

At pre-launch the honest position is that no credits have been issued and the first issuance is more than two years away. The tab's job is to make that wait read as a plan rather than a void. Every element that will hold a figure later is present, carrying **what will appear here, when, and what will produce it.** Never a zero, never an empty container.

An empty calibration plot with its axes drawn and the quarter of the first sampling round on it is a promise with a date attached, and that is more persuasive than a filled mock and more honest than an absence. The dated track does this well already and deserves prominence at the earliest state.

Two structural notes that fall out of the table.

**Position over time is the only element meaningful at all four states**, because the commitment exists from the first day and the schedule exists before any land does. That argues for it anchoring the tab rather than sitting among equals.

**The harvest action exists at only two of the four states**, so the one thing the reader can act on is absent for half the module's life. The early states need an action of their own, and the natural one is the reader setting their own expectations for delivery: what volume they want in which compliance year, and how they would like the schedule shaped. That is something they can do on the first day, it makes the position view theirs rather than ours, and it gives the two waiting states a purpose beyond reading.

Treat this as a placeholder for now rather than a build. The surface that captures those expectations properly is a later piece of work. What matters here is that the early states leave room for it and are not designed as read-only.

One naming observation, raised rather than resolved. "At nameplate" is a recruitment idea, and on the recruitment side the module reaches nameplate in February 2028, well before first crediting in December 2028. As a global time marker positioned after first crediting it has to mean full delivery run rate instead. The states still order correctly as a module lifecycle, but the label carries a recruitment meaning on a delivery tab. Flagging it in case a more neutral name for that fourth state reads better across both.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Modelled figures are described as modelled, and never presented as measured or validated.
- Credits are generated on the model and validated by physical sampling of a tenth of each cohort. Sampling validates the estimate rather than replacing it.
- Any market price carries its source and its date.
- Landholders who have not consented are never individually identifiable.
- Dark surface, consistent with the rest of the console.

## Yours to decide

Proportion, grid, type, colour, motion, chart forms, how the sections order and nest, and how the additional-purchase prompt appears without crowding the surface.

The brief is the reader and the argument. The form is the work, and where something already in the tab does one of these jobs better than what is described here, keep yours and tell us why.
