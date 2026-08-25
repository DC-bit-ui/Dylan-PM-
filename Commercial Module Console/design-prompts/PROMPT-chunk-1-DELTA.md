# Additions to the console shell

This is an add-on to the shell you have already built. **Do not rebuild it.** Everything below is either a new element, a change to one element, or a rule that applies across what exists. Where something already works, leave it alone.

---

## 1 · The marketplace becomes persistent, and it sells in context

Right now the add-on catalogue is a setup step. It needs to be reachable at any time, because a customer who has already bought should always be able to see what else is available.

**Two changes.**

**The catalogue is always reachable**, from a distinct affordance rather than as another peer in the section navigation. It is not one of the sections; it is where sections come from.

**More importantly, capabilities sell themselves in place.** Wherever a capability the customer has not bought would apply, it appears there, visibly switched off, and leads to the catalogue at that item. A ground cover layer sits in the map's layer list, greyed, marked as not enabled. A land condition column sits in the property list, empty, marked as available. **The reader does not read a description of a capability, they see the shape of it on their own land with the switch off.**

This is the strongest reason for the map's permanence, so make it good. A not-enabled layer should be legible enough to want and clearly enough disabled that nobody mistakes it for data.

**Catalogue contents** are services, data products, reports and assessments. Land condition and remediation monitoring, acquisition intelligence on land not yet owned, water accounting, additional soil analytes, denser sampling, higher resolution imagery, disclosure and evidence packs, and eligibility assessments for other credit types such as reef credits and environmental plantings.

**On the credit types specifically:** the catalogue item is the **eligibility assessment**, which is a service, and it leads to a request rather than a checkout. Carbon credits are financial products and this business is not licensed to transact them, so nothing in the catalogue may be priced or purchased as a credit. Assessments may be priced.

---

## 2 · A notification feed, and it changes with the module's stage

The console needs to tell the reader what has happened since they last looked. This is the difference between a report and a live instrument, and it is the main reason someone opens it on an ordinary Tuesday.

Events are spatial wherever possible: when something happens to a piece of land, the map should register it rather than merely reflect it afterwards.

**The event types depend on which time state is being viewed.** This is important, because the same feed carries a completely different story early and late.

| Stage | Events |
|---|---|
| **Pre-launch and recruitment** | Hectares contracted and to which region. A property registered with the regulator. A new region opened for assessment. A cohort becoming formable because enough neighbouring land has been contracted |
| **Calibration** | Baseline sampling completed on a property. Model retrained. Movement against the calibration threshold |
| **Crediting** | **Carbon detected by the model on a named property or cohort.** A cohort crossing the threshold to become harvestable. Sampling scheduled. Credits issued into the registry |
| **Any stage** | A data layer refreshed. A climate flag raised or cleared |

The recruitment events are the ones to get right for this pass, since that is the populated section. *"5,000 hectares added to your module, Monaro region"* with the map showing where.

---

## 3 · Cohorts have three states, and each carries a scheduled delivery quarter

A cohort is a regional group of properties large enough that sampling a tenth of it validates the whole. **Cohorts are the unit of delivery and they are harvested one at a time across the year, not all at once.** That makes the delivery programme schedulable rather than reactive, which is the single most important property of the whole commercial model: a schedulable programme is one a financier can plan around.

Three states, and they need to be distinguishable at a glance on the map:

- **In development** — the land is accumulating but the cohort cannot yet be validated
- **Live** — validated and generating credits
- **Harvestable** — has crossed its threshold, and a harvest can be requested now

Each cohort carries its **estimated yield** and its **scheduled delivery quarter**. Selecting one gives an aggregated view of that cohort.

Whether a property can join a cohort, and when that cohort can be harvested, depends on where the property sits in the registration and declaration sequence. **So the ladder in the recruitment section is not year-one bookkeeping. It is the input to the delivery schedule**, and the connection between the two should be visible.

---

## 4 · Disclosure is the worked example of the catalogue

In the current section set, treat **Disclosure as not yet purchased.** It should appear in the catalogue rather than in the navigation.

The demonstration to build: open the catalogue, select the disclosure pack, and **a Disclosure section appears in the navigation and becomes usable.** That is the clearest possible statement of how the product configures, and it is worth showing rather than describing.

One boundary to hold. Basic provenance for credits the customer already owns — where each credit came from and what evidence sits behind it — stays inside Delivery and is never a paid extra. The purchasable thing is the **framework-mapped evidence pack**: their reporting obligations, what is in hand against each, and what is still needed.

---

## 5 · Design rules, replacing "as little copy as possible"

I gave you an instruction to minimise copy. **That instruction was wrong and I am replacing it**, because the evidence points somewhere more specific. These five rules produce a similar screen for better reasons, and each is testable.

**One dominant focal point per view.** Not two. When every element carries equal visual weight the reader has nowhere to land, and a screen with a single clear focus is between two and three times better at conveying its intended conclusion than a merely tidy one.

**Cut explanation, keep labels.** Explanatory prose telling this reader what a chart means is redundant to them and costs them effort to cross-reference against what they already know. Labels, units, thresholds, provenance and annotations are not explanation and do not carry that cost. **Removing a paragraph is usually right. Removing a unit is always wrong.**

**Put every label, unit and threshold inside or immediately beside the thing it describes.** Not in a legend, not in a tooltip, not in a caption underneath. Integration beats separation substantially, and on real dashboards axis labels attract more attention than the data marks they annotate.

**Every uncertain number gets a numeric range and never a verbal hedge.** *"Forecast 1,958,000, range 1,837,000 to 2,079,000"* is close to free in credibility terms. *"Approximately 1.96 million, though a shortfall remains possible"* costs measurably more, and costs it twice: once on the number and again on the source. And **any interval must be labelled in words for what it is**, because intervals are routinely misread as high and low forecasts even by expert readers.

**Precision follows provenance.** Measured figures are exact because they are facts on a public register. Modelled and forecast figures are rounded, because false precision becomes a liability the moment the number is revised, and these numbers are revised constantly.

**And one that applies across the whole build: never move things.** A reader who uses this weekly builds a spatial map of where information lives, and after a few visits that learned map does more work than any visual emphasis. **An element must sit in the same place in every time state and in every focus state.** If a panel is empty at pre-launch it holds its position and says why it is empty. It does not disappear and let the layout reflow.

---

## 6 · Two smaller things

**Colour carries state, not identity.** Reserve the strongest colour signal for direction and status — ahead or behind, enabled or not, live or in development. If the accent colour appears on everything then it means nothing, and the fastest channel available is spent on livery. Hue and orientation are both read almost instantly and independently of each other, so there are two such channels to use.

**Favour what the reader can do.** Among professional users of comparable instruments, the thing that measurably improved outcomes was not visual richness but the ability to act directly on what was displayed. Requesting a harvest, entering a property, enabling a capability. Where an action is possible, make it possible from the object rather than from a menu.
