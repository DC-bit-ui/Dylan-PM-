# Claude Design prompt · chunk 1, the shell

**Paste from the line below. Everything above it is scaffolding, not part of the prompt.**

Written non-prescriptively per AP-2721. Settled decisions travel with their reason attached. Layout below the frame, grid, component structure, colour, type, motion and chart choice are deliberately withheld and are yours to solve.

---

## Build a shell

I need the frame for a console, not its contents. One tab is populated so the frame can be judged against real material. The other three are stubs. Get the frame right and everything after it is a delta.

## Who opens it

A carbon desk professional at an energy major, miner or commodity trader who has bought, or is considering, a commercial soil carbon module. Commodity people, not sustainability managers. Measured on positions that clear. Technical, commercially sophisticated, and allergic to marketing. Anything that looks like a claim without evidence costs more than it gains.

They read in a fixed order: am I on track, what do I do, what could hurt me.

## What they bought

A production asset. **125,000 hectares of Australian grazing land, recruited into a module, contracted to deliver ACCUs.** Seven year term from 1 April 2026. Year 1 is recruitment, registration and baselining. Year 2 is model calibration. Years 3 to 7 are the five crediting years.

**Today is 12 August 2026, which is month 4 of 12 of the recruitment year. About 11,100 hectares are contracted and zero ACCUs exist.**

They have exactly two questions and which one matters depends on where the module is in its life:

- **Year 1: are we recruiting to target?**
- **Year 3 onward: are we delivering ACCUs?**

Everything else layers underneath those two. That is a ruling from the business, not a preference.

## The frame, and why it is fixed

These are settled. Each carries its reason, because the reason is what you need in order to solve the rest.

**A map is persistent and primary.** The asset is land, and every question this console answers has a spatial form. The map is not a locator showing where properties are. **The map is the answer to the current tab's question, drawn spatially.** Prior versions of this product used a static pin map as furniture and it was the weakest element on the screen. If the map is not doing the work of a chart, the frame has failed.

**Tabs select which question is being asked.** The tab set is configurable per customer, because different buyers care about different things and we do not want to fork the product. Four tabs for this customer, below.

**An assistant sits across the bottom, not floating over the content.** It surfaces one insight per panel, at the object that insight concerns, each pullable into fuller reasoning. It is connective tissue, not a chat box in the corner. A floating pill was tried and it read as bolted on.

**A single as-at date, stated in the chrome and honoured everywhere.** An earlier build carried four different implied dates on one screen. Every figure on the surface belongs to the stated date.

## The focus model, which is the point of this chunk

There are two environments: the map, and a panel. **The reader can promote either one to become the focal environment.** Three states: balanced, map focal, panel focal.

This exists because different questions have different native homes. Recruitment geography and land condition want the map. A delivery schedule and a funnel want the panel. A fixed split cramps both.

Two requirements on it, and they are the hard part:

**Selection is shared, in both directions, always.** Select a cohort on the map and the panel filters to it. Select a pipeline stage in the panel and those properties light on the map. This is what makes promotion safe: whichever environment is focal, the other is showing the same subject. Without it, this is two widgets side by side and promoting one just hides half the screen.

**Nothing fully disappears.** A minimised map keeps the current selection visible. A minimised panel keeps the headline answer visible. Losing the thread on promotion is the failure mode.

How promotion is triggered, how the transition behaves, and what the minimised forms look like are yours.

## The tabs

Each tab label carries its own current state, so the nav reads as a summary and an empty tab is legible rather than disappointing.

| Tab | The question | The map answers it by showing | The panel answers it with |
|---|---|---|---|
| **Fill** | Are we recruiting to target? | The recruitment region, every screened property coloured by pipeline stage, and where cohort density is sufficient to form a validation group | Position against the recruitment curve, the funnel, the hectare ladder, dated milestones |
| **Delivery** | Are we delivering ACCUs? | Cohorts by crediting state | Contracted schedule, issuance against it, and our record of predicted versus cored versus issued on other projects |
| **Evidence** | Can I use this in my disclosures? | Which properties carry which evidence layers, and where the gaps are | Framework readiness against a legal assurance timetable |
| **Scale** | Can they keep filling it? | The bench of re-screened properties not yet contracted | Pipeline velocity, replacement depth |

**Populate Fill only.** Stub the other three with their state label and nothing else.

## The Fill tab content

**Position leads.** One statement, one number, one state. Nothing competes with it. The prior build opened with an alert card, three tiles and a chart before it said anything, and a reader had nowhere to look first.

Position today is **on curve**: 11,124 hectares contracted against a plan figure of 11,125 for month 4.

**A warning about the percentage, because it will be got wrong.** 11,124 hectares is 8.9% of the 125,000 target and 100% of the curve to date. Both are true. **Position against the curve is the primary reading and percent of target is context beneath it.** Lead with 8.9% and every module in its first year looks like it is failing.

**The funnel is live from the customer's own CRM.** These are the real stage names, in order. Counts are indicative.

```
Qualified account · soil carbon eligible / HORIZON report     512
Discovery call · EoI and project proposal                     148
Strategy call · carbon project and land management strategy    92
SLA · mapping, soil carbon plan and KCT                        61
KCT issued                                                     27
Closed won                                                      5   ← hectares only count here
```

Two things about that list matter. **The first stage is a HORIZON output.** Every property in the funnel entered it because the model screened it as eligible, so the funnel and the measurement capability are the same story from stage one. And **hectares only enter the module at Closed Won**, not when a KCT is issued. The gap between those two stages is real and worth being able to see.

**On the map at this point in the module's life**: 512 screened properties, 148 responsive, 61 visited, 5 signed, concentrated in one region because cohort crediting requires density rather than dispersal. Not five pins on a map of Australia. Default the extent to the recruitment region.

**Also in the Fill panel**: the hectare ladder, showing contracted, registered, baselined and crediting, most of which are legitimately zero today. And a dated milestone track running from agreement execution to first crediting in April 2028.

## Constraints that are absolute

- **Nothing modelled is presented as measured.** Every figure carries which it is.
- **Every present-tense figure is real and traceable.**
- **Empty states carry their reason and the date they resolve.** Never a blank, never a dash, never a zero on its own. Most of this console is legitimately empty today and that has to read as honest rather than broken.
- **No dollar value is ever applied to a credit volume.** ACCUs are financial products and the business is an authorised representative of an AFS licensee. Counts, hectares and capacities only.
- Australian English. No em dashes anywhere, including in titles. Spaced hyphens instead. No marketing verbs.

## What is out of scope for this chunk

Delivery charts, evidence packs, scale content, any styling system, any content in the three stubbed tabs. If the frame is wrong everything built on it is wrong, so this pass is only the frame.

## What I am not telling you

Proportions, grid, component structure, type, colour, motion, chart forms, and how the focus transition behaves. Those are the work. The one thing I will say is that the reader's own instruments are dense and information-first, and that trust in their world comes from provenance and detail rather than atmosphere.
