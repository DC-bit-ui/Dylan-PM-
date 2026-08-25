# Claude Design prompt · chunk 1, the shell · v2

**Paste from the line below. Everything above it is scaffolding.**

Revised against workshop feedback. Changes from v1: December start, four time states, three tabs instead of four, the marketplace as the extension mechanism, hectares as the unit throughout, velocity replaces risk in the lead panel, obligation sizing removed.

Written per AP-2721. Settled decisions travel with the reason attached. Proportion, grid, component structure, colour, type, motion and chart form are withheld and are yours.

---

## Build a shell

I need the frame for a console, not its contents. One tab is populated so the frame can be judged against real material. The other two are stubs. If the frame is wrong, everything built on it is wrong, which is why this pass is isolated.

## Who opens it

A carbon desk professional at an energy major, miner or commodity trader who has bought, or is considering, a commercial soil carbon module. Commodity people, not sustainability managers. Measured on positions that clear. Technical, commercially sophisticated, allergic to marketing. Anything that reads as a claim without evidence costs more than it gains.

They read in a fixed order: am I on track, what do I do, what could hurt me.

## What they bought, and the two questions

**125,000 hectares of Australian grazing land, recruited into a module, contracted to deliver ACCUs.** A production asset with a rated capacity of 375,000 ACCUs a year at full ramp. Seven year term. Year 1 recruits, registers and baselines the land. Year 2 calibrates the model. Years 3 to 7 are the five crediting years.

**The module opens 1 December 2026. Today is 12 August 2026, so it has not started.**

Two questions, and which one leads depends on where the module is in its life:

- **Year 1: are we recruiting to target?**
- **Year 3 onward: are we delivering ACCUs?**

Everything else layers underneath those two. That is a ruling from the business, not a preference.

## The architecture

**Two tabs are the product. One is a catalogue.** The two nouns in the sentence above become the two tabs.

| Tab | The question |
|---|---|
| **Hectares** | Are we recruiting to target? |
| **Delivery** | Are we delivering ACCUs? |
| **Marketplace** | What else can this land carry? |

**The marketplace is the extension mechanism, and this is the part to get right.** Everything that is not hectares in and credits out lives there as an add-on: land condition monitoring, water accounting, disclosure and evidence packs, denser sampling, additional analytes, higher resolution imagery. **Buying an item adds a tab.** So the tab set is a statement of what this customer has bought, it configures per customer without forking the product, and there is never such a thing as a tab with nothing in it.

Each tab label carries its own current state, so the nav reads as a summary rather than a set of destinations.

## The map, and why it is fixed

**A map is persistent and primary.** The asset is land and every question this console answers has a spatial form. The map is not a locator showing where properties are. **The map is the answer to the current tab's question, drawn spatially.** Earlier versions of this product used a static pin map as furniture and it was the weakest element on screen. If the map is not doing the work of a chart, the frame has failed.

| Tab | The map is showing |
|---|---|
| **Hectares** | The recruitment region. All assessed and eligible land, then the land in conversation, under terms, and contracted, each visibly at a different stage. Density rings where enough neighbouring land exists to form a validation group |
| **Delivery** | Cohorts by crediting state |
| **Marketplace** | **A preview of the selected item, drawn on this customer's own land**, in an explicitly not-yet-enabled treatment. You do not read about ground cover monitoring, you see it on your own hectares |

**One hard constraint on the map.** Contracted projects are named. **Everything not yet contracted is unnamed density**, because those are third-party landholders who have not consented to appear in a buyer's console. This is a privacy requirement, not a styling preference. It also happens to read better: a field of anonymous assessed land with named projects inside it is what capability looks like.

## The focus model, which is the point of this chunk

Two environments: the map, and a panel. **The reader can promote either to become the focal environment.** Three states: balanced, map focal, panel focal.

This exists because different questions have different native homes. Recruitment geography and land condition want the map. A funnel and a delivery schedule want the panel. A fixed split cramps both.

Two requirements, and they are the hard part:

**Selection is shared, in both directions, always.** Select a region on the map and the panel filters to it. Select a pipeline stage in the panel and that land lights on the map. This is what makes promotion safe: whichever environment is focal, the other is showing the same subject, so promoting one never loses the thread. Without it this is two widgets side by side and promoting one just hides half the screen.

**Nothing fully disappears.** A minimised map keeps the current selection visible. A minimised panel keeps the headline answer visible.

How promotion is triggered, how it transitions, and what the minimised forms look like are yours.

## Time states

The console can be viewed at four points in the module's life. Same frame, same tabs, different content and a different leading question. A viewer steps through them.

| State | When | Leading question |
|---|---|---|
| **Pre-launch** | today, Aug 2026 | Can you actually fill this? |
| **Month 6** | Jun 2027 | Are we recruiting to target? |
| **First crediting** | Dec 2028 | Did the machine turn on? |
| **At nameplate** | 2031 | Are we delivering to schedule? |

**One stated as-at date in the chrome, honoured by every figure on the surface.** An earlier build carried four different implied dates on one screen.

For this chunk, build **pre-launch** properly and make the state control real. The other three can hold placeholder content.

## The Hectares tab at pre-launch

**Position leads. One statement, then the numbers that support it, and nothing competing.** The prior build opened with an alert card, three tiles and a chart before it said anything, and a reader had nowhere to look first.

At pre-launch the module has not started, so the honest position is:

> **The module opens 1 December. 12,000 hectares are already signed to it, and 1.23 million assessed hectares sit behind them.**

Two numbers do the work, and they answer different worries:

- **Are we on track** — 12,000 ha signed, ready to assign on day one
- **Can you finish** — **1,228,800 ha assessed and eligible in the target region. 9.8 times the 125,000 ha target.**

The second is the one that closes the room, and only a business that has pre-screened an entire region can state it. From month 6 onward the first number becomes position against the recruitment curve.

**A warning about percentages, because this will be got wrong.** At month 6 the module will hold roughly 20,000 ha. That is 16% of the target and 100% of the curve. Both true. **Position against the curve is the primary reading and percent of target is context beneath it.** Lead with the raw percentage and every module in its first year looks like it is failing, in the exact year the buyer cares most.

**The pipeline, in hectares, in the buyer's language.** These stages are live from the customer's own CRM. The labels below are what the buyer reads; the internal stage names stay underneath as the source.

```
Assessed and eligible          HORIZON has read this land and it clears the method    1,228,800 ha
Landholder engaged             a real conversation is running                           355,200 ha
Plan agreed                    the management change is designed and signed off         220,800 ha
Boundaries mapped, terms out   spatial work done, commercial terms with the landholder  146,400 ha
Contract issued                awaiting signature                                        64,800 ha
Under contract                 hectares enter the module here                            12,000 ha
```

**The first stage is a HORIZON output.** Every hectare in that funnel is there because the model screened it as eligible. The recruitment story and the measurement story are the same story from stage one, and that is the single most useful thing about this panel.

**How fast we fill.** A panel of velocity, not of risk. At this point in the module's life the buyer is not asking what could go wrong, they are asking whether you are any good at this. All of it derives from CRM stage timestamps, so it is measured rather than asserted.

- Days from first contact to contract, this quarter against last
- Days from farm visit to decision, this quarter against last
- Hectares added to the pipeline this quarter
- Conversion by stage, trending
- Hectares contracted per field week

The argument is that the process is getting faster, and a faster process fills their module sooner. It compounds and it is verifiable. It also cuts both ways, which is accepted.

**The ladder and the milestones.** Hectares by state — under contract, registered, baselined, declared, crediting — most of which are legitimately zero before the module opens. And a dated track:

```
Dec 2026  module opens
Jun 2027  recruitment checkpoint
Dec 2027  all hectares recruited, applications lodged
Feb 2028  all baselined
Mar 2028  all declared with the regulator
Oct 2028  model calibration gate
Dec 2028  first crediting year opens
Dec 2033  term ends
```

**Risks and flags**, separately and further down: climate and land condition only. Fire outlook, drought exposure, flood recovery, ground cover below local reference. Our own performance belongs in the velocity panel; the land's condition belongs here. Two panels, not two labels in one list.

## The other two tabs

**Delivery** is stubbed for this chunk but note what it will hold, because it changes how the tab should feel at pre-launch. It is **not empty**. It carries the contracted schedule the customer has bought, and alongside it our record on other projects of what was predicted at baseline, what the cores measured, and what the regulator issued. A module with no history of its own is evidenced by delivery that already happened elsewhere.

**Marketplace** is stubbed. It lists services, data products and reports with honest availability states. **It never lists carbon credits.** ACCUs are financial products and this business is an authorised representative of an AFS licensee, so a priced catalogue cannot contain them. Where a credit type is relevant, the item is the assessment, not the credit.

## Constraints that are absolute

- **Nothing modelled is presented as measured.** Every figure carries which it is.
- **Every present-tense figure is real and traceable.**
- **Empty states carry their reason and the date they resolve.** Never a blank, never a dash, never a bare zero. Most of this console is legitimately empty before the module opens and that has to read as honest rather than broken.
- **No dollar value is ever applied to a credit volume.** Counts, hectares and capacities only. Services may carry a price; credits may not.
- **Unconsented third parties are never identifiable.**
- Australian English. No em dashes anywhere, including titles. Spaced hyphens instead. No marketing verbs.

## Out of scope for this chunk

Delivery content, marketplace content, any styling system, any of the three non-current time states beyond making the control work. Frame, focus model, shared selection, tab-state pattern, and the Hectares tab at pre-launch.

## What I am not telling you

Proportions, grid, component structure, type, colour, motion, chart forms, and how the focus transition behaves. Those are the work. The one thing worth knowing is that this reader's own instruments are dense and information-first, and that trust in their world comes from provenance and detail rather than atmosphere.
