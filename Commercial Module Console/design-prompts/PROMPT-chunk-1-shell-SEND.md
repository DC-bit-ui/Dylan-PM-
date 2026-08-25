# Build a console shell

I need the frame for a product, not its contents. One section is populated properly so the frame can be judged against real material. Two are stubs. If the frame is wrong then everything built on it is wrong, so this pass is deliberately isolated.

---

## The business, briefly, because the domain is unfamiliar

An Australian company measures soil carbon on grazing land and converts it into **ACCUs**, which are carbon credits issued by a federal regulator and tradeable on a market.

The measurement runs on a machine learning model called **HORIZON**, trained on more than thirty thousand physical soil samples, which estimates soil carbon from satellite imagery and environmental data. **Credits are only ever issued against physical soil samples, never against the model.** The model estimates; the samples decide. That distinction runs through everything and the product must never blur it.

A **commercial module** is the thing being sold. It is a block of farmland, 125,000 hectares in this case, assembled from individual farms and contracted to deliver credits to a single buyer over a seven year term. Assembling it takes time: each farm has to be found, assessed, persuaded, contracted, registered with the regulator and physically soil-sampled before it can earn anything. Year one recruits and samples the land. Year two calibrates the model against those samples. Years three to seven are the five years in which credits are actually issued.

Farms are grouped into regional **cohorts**. Sampling ten per cent of a cohort validates the whole of it, which is why the land has to be geographically concentrated rather than scattered. Cohorts are also the unit of delivery: they are harvested one at a time across the year, not all at once, so each cohort has its own scheduled delivery quarter.

---

## Who opens this

A carbon desk professional at an energy major, miner or commodity trader who has bought, or is considering buying, one of these modules.

They are commodity people, not sustainability managers. They are measured on positions that clear. They are technically literate, commercially sophisticated, and allergic to marketing. Anything that reads as a claim without evidence behind it costs more than it gains with this reader.

They read in a fixed order: **am I on track, what do I do, what could hurt me.**

Their own working instruments are dense, information-first and unglamorous. Trust in their world comes from provenance and detail, not from atmosphere.

---

## The state of the module they are looking at

**The module opens on 1 December 2026. Today is 12 August 2026, so it has not started yet.** The console is being shown to someone deciding whether to sign.

That is unusual and it is important: most of this product is legitimately empty right now, and the empty parts have to read as honest rather than broken.

The buyer has exactly two questions, and which one leads depends on where the module is in its life.

- **Year one: are we recruiting to target?**
- **Year three onward: are we delivering credits?**

Everything else in the product layers underneath those two. Treat that as a hard constraint on hierarchy.

---

## Architecture

Three sections, plus a configuration stage that precedes them.

| Section | The question it answers |
|---|---|
| **Recruitment** | Are we recruiting to target? |
| **Delivery** | Are we delivering credits? |
| **Disclosure** | Can I use this in my own reporting? |

**The configuration stage.** Before a customer reaches the console, they choose which capabilities they want from a catalogue of add-ons: land condition monitoring, acquisition intelligence, water accounting, additional soil analytes, denser sampling, higher resolution imagery. **What they choose determines which sections exist and what they pay.** So the section set is a statement of what this particular customer has bought, the product configures per customer without being forked, and there is never a section with nothing in it.

**This configuration stage is not part of the persistent navigation.** It runs at setup, not permanently. For this pass, assume the configuration has already happened and the three sections above are the result.

Each section label carries its own current state, so the navigation reads as a summary rather than a set of destinations.

---

## The map

**A map is persistent and primary.** The asset being sold is land, every question this product answers has a spatial form, and the map is the substrate that every future capability attaches to.

The map is **not** a locator that shows where properties are. **The map is the current section's question, drawn spatially.** If the map is not doing the work that a chart would otherwise do, the frame has failed.

| Section | What the map is showing |
|---|---|
| **Recruitment** | The recruitment region. All land assessed and found eligible, then the land in conversation, under terms, and contracted, each visibly at a different stage. Density indicators where enough neighbouring land exists to form a cohort |
| **Delivery** | Cohorts, each carrying its estimated yield and its **scheduled delivery quarter**. Selecting one gives an aggregated view of that cohort |
| **Disclosure** | Which land carries which evidence, and where the gaps are |

**Three requirements on it.**

**Additions register as events, not as state changes.** When new land is contracted, a pin appears and the system says what just happened: five thousand more hectares added, and to which cohort. The map is a feed, not a static picture. This is the single most engaging thing the product can do and it is the reason the map is worth its permanence.

**A property can be entered from the map.** Selecting a contracted property opens that property's own detailed view. There is a second route to the same place from a ranked list of properties elsewhere in the product. Both routes exist; only one property is selectable in this build.

**Contracted properties may be named. Everything not yet contracted must be unnamed density.** Those are third-party landowners who have not consented to appear in a buyer's console, so identifying them is not permitted. It also reads better: a field of anonymous assessed land with a handful of named projects inside it is what capability looks like.

---

## The focus model, which is the point of this pass

There are two environments on screen: the map, and a panel. **The reader can promote either one to become the focal environment.** Three states: balanced, map focal, panel focal.

This exists because different questions have different native homes. Recruitment geography and cohort scheduling belong on a map. A funnel and a delivery schedule belong in a panel. A fixed split cramps both.

Two requirements, and they are the difficult part:

**Selection is shared, in both directions, always.** Selecting a region on the map filters the panel to it. Selecting a pipeline stage in the panel lights that land on the map. This is what makes promotion safe: whichever environment is focal, the other is showing the same subject, so promoting one never loses the reader's place. Without shared selection this is two widgets side by side and promoting one simply hides half the screen.

**Nothing fully disappears.** A minimised map keeps the current selection visible. A minimised panel keeps the headline answer visible.

How promotion is triggered, how it transitions, and what the minimised forms look like are yours to solve.

---

## Time states

The console can be viewed at four points in the module's life. Same frame, same sections, different content, and a different leading question. A viewer steps between them, and stepping through them in sequence is how the product explains itself.

| State | When | Leading question |
|---|---|---|
| **Pre-launch** | today, August 2026 | Can you actually fill this? |
| **Month 6** | June 2027 | Are we recruiting to target? |
| **First crediting** | December 2028 | Did the machine turn on? |
| **At nameplate** | 2031 | Are we delivering to schedule? |

**One stated as-at date lives in the chrome and every figure on screen belongs to it.** No figure may imply a different date to the one stated.

For this pass, build **pre-launch** properly and make the state control real. The other three states can hold placeholder content.

---

## The Recruitment section, at pre-launch

### Position leads

One statement, then the numbers that support it, and nothing competing with it. A reader arriving must know within seconds what they are looking at and whether it is going well.

At pre-launch the module has not started, so the honest position is:

> **The module opens 1 December. 12,000 hectares are already signed to it, and 1.23 million assessed hectares sit behind them.**

Two numbers carry it, and they answer two different worries:

- **Are we on track** — 12,000 hectares signed, ready to assign on the day the module opens
- **Can you finish** — **1,228,800 hectares assessed and found eligible in the target region, which is 9.8 times the 125,000 hectare target**

The second number is the one that closes the room, because only a business that has already pre-screened an entire region can state it. From month six onward the first number becomes position against the recruitment curve instead.

**A warning about percentages.** At month six the module will hold roughly 20,000 hectares. That is 16% of the target and 100% of the curve to date. Both are true and they read completely differently. **Position against the curve is the primary reading, and percent of target is context beneath it.** If the raw percentage leads, every module in its first year looks like it is failing, in exactly the year the buyer cares about most.

### The pipeline, in hectares

These stages come live from the company's own sales system. The labels below are what the buyer reads. The unit is hectares throughout, because hectares are what they bought.

| Stage | What it means | Hectares |
|---|---|---|
| Assessed and eligible | HORIZON has read this land and it clears the method | 1,228,800 |
| Landholder engaged | a real conversation is running | 355,200 |
| Plan agreed | the management change is designed and signed off | 220,800 |
| Boundaries mapped, terms out | spatial work done, commercial terms with the landholder | 146,400 |
| Contract issued | awaiting signature | 64,800 |
| **Under contract** | **hectares enter the module here** | **12,000** |

**The first stage is a HORIZON output.** Every hectare in that funnel is there because the model screened it and found it eligible. The recruitment story and the measurement story are therefore the same story from stage one, and that is the most useful thing about this panel.

### How fast we fill

A panel of velocity, not of risk. At this point in the module's life the buyer is not asking what could go wrong, they are asking whether this company is any good at this. All of it derives from timestamps in the sales system, so it is measured rather than asserted.

- Days from first contact to signed contract, this quarter against last
- Days from farm visit to landholder decision, this quarter against last
- Hectares added to the pipeline this quarter
- Conversion rate by stage, trending
- Hectares contracted per field week

**This panel is closing a loop, and the loop is the point.** The buyer's money funds field capacity, field capacity converts hectares, and hectares fill their module. So these are not process-hygiene metrics, they are the return on the thing the buyer has just funded. A faster process fills their module sooner and it compounds. It also means a bad quarter is visible to them, which is deliberate.

### The ladder and the milestones

Hectares by state — under contract, registered with the regulator, physically sampled, declared, crediting — most of which are legitimately zero before the module opens.

This ladder is not only year-one bookkeeping. **Where a property sits in the registration and declaration cycle determines which cohort it can join and when that cohort can be harvested**, so this panel is the input to the delivery schedule.

And a dated track:

```
Dec 2026   module opens
Jun 2027   recruitment checkpoint
Dec 2027   all hectares recruited, applications lodged
Feb 2028   all land physically sampled
Mar 2028   all projects declared with the regulator
Oct 2028   model calibration gate
Dec 2028   first crediting year opens
Dec 2033   term ends
```

### Risks and flags

Separately, and further down: **climate and land condition only.** Fire season outlook, drought exposure, flood recovery, ground cover below local reference.

The company's own performance belongs in the velocity panel. The land's condition belongs here. Two panels, not two categories inside one list, because a reader processes them differently.

---

## The other two sections

Stubbed for this pass, but three notes that affect how they should feel.

**Delivery is not empty at pre-launch.** It carries the contracted delivery schedule the customer has bought, and alongside it the company's record on earlier projects of what the model predicted at baseline, what the physical samples measured, and what the regulator ultimately issued. A module with no history of its own is evidenced by delivery that has already happened elsewhere.

**Delivery's organising idea is that the programme is schedulable.** Because a cohort can be validated by sampling a tenth of it, the sampling programme stops being reactive: how much has to be sampled, and when, is known in advance and locked once the land is. That predictability is what makes the delivery financeable, and it is why cohorts carry scheduled delivery quarters rather than estimates.

**Disclosure** holds evidence the buyer's own reporting obligations require, mapped to the frameworks they report under, with what is in hand and what is still needed.

---

## Constraints that are absolute

- **Visual-led. As little copy as possible.** The reader's eye must know where to go the moment the screen loads, and the meaning should arrive through the visual before it arrives through the words. Explanatory paragraphs under every panel are a symptom of objects that are not self-evident.
- **Nothing modelled may be presented as measured.** Every figure carries which it is.
- **Every present-tense figure is real and traceable.**
- **Empty states carry their reason and the date they resolve.** Never a blank, never a dash, never a bare zero. Most of this console is legitimately empty before the module opens, and that has to read as honest rather than broken. This is the single most important detail in the whole product.
- **No dollar value is ever applied to a credit volume**, and no credit count is placed next to a price such that a reader performs the multiplication. Counts, hectares and capacities only.
- **Landowners who have not contracted are never identifiable.**
- Australian English. **No em dashes anywhere, including in titles** — use spaced hyphens instead. No marketing verbs.

---

## Scope

**Build:** the frame, the three-section navigation with state in each label, the map, the panel, the three focus states with shared selection, the time state control, the persistent assistant entry point, the as-at stamp, and the Recruitment section at pre-launch in full.

**Do not build:** the configuration stage, delivery content, disclosure content, any of the three non-current time states beyond making the control work, or a styling system.

---

## What I am deliberately not telling you

Proportions, grid, component structure, type, colour, motion, chart forms, and how the focus transition behaves. Those are the work, and I would rather see what you arrive at than have you render what I already thought of.
