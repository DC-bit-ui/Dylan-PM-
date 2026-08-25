# Revision 03: what Frontier changes, and the catchment idea

**13 August 2026.** Read against the Frontier screenshots. Three things change direction, two numbers need reconciling, and the catchment question opens something larger than it looks.

---

## 1 · The Hectares section is Frontier, re-pointed

This is the biggest finding and it changes the effort, the credibility and the demo story.

**Frontier already is the map-centric recruitment console.** Map at the centre, summary panel left, funnel and analytics right, region selector across the top, a **Recruitment / Portfolio mode toggle**, and a hectares / property-count switch. The architecture Hobbs sketched on the whiteboard exists internally and is in daily use by the field team.

So the module console's Hectares section is not a new product. **It is Frontier scoped to one module and one buyer**, with landholder identities removed. Three consequences:

**Build effort collapses.** The data model, the funnel stages, the region model and the map layers all exist.

**The demo gets a better line.** Not "here is a dashboard we designed for you" but *"this is the system our field team runs on, pointed at your module"*. An instrument borrowed from operations reads completely differently to one built for a pitch, and this audience can tell the difference.

**And the "one machine" claim gets easier.** The console stops being a separate artefact and becomes a lens on the same system, which is exactly what Matthew has been arguing the platform is.

**What must not cross the boundary:** landholder names and contact details, lead source names, and anything that identifies an unconverted property. Contracted projects may be named; the rest is density. That constraint is already in the spec and Frontier makes it concrete.

---

## 2 · The funnel is two chained systems and I had it wrong

Frontier's recruitment funnel and HubSpot's sales pipeline are different funnels that join at a named handover.

| | Frontier · finding and qualifying | HubSpot · commercial process |
|---|---|---|
| | Identified | Qualified account · HORIZON report |
| | Not eligible | Discovery call · EoI and proposal |
| | In conversation | Strategy call · carbon project and LMS |
| | Not interested | SLA · mapping, soil carbon plan and KCT |
| | Farm visits | KCT issued |
| **Handover** | **Proceed to sales pipeline** → | |
| | | **Closed won** → hectares enter the module |

Then a third chain in the project pipeline: registration, baseline sampling, implementation, crediting.

**So the buyer-facing pipeline spans three systems**, and the console is the only place they are ever seen as one journey. That is worth showing rather than hiding, because it is the honest picture of an operation rather than a tidy invented funnel.

The stage labels I proposed earlier collapsed the two into one and need rebuilding on this structure.

---

## 3 · Catchment cohorts. This is the idea worth taking further.

Your instinct is right and Frontier has already half-built it: **the regions are catchments.** Upper Murray is a Murray-Darling catchment, not an arbitrary sales territory.

Now put that next to how the two instrument families are scoped:

- **Schedule 2 cohorts** need geographic density, 10,000 to 15,000 hectares of neighbouring project land, so the sampled tenth can validate the rest. The boundary is otherwise arbitrary.
- **Water instruments** — ACWIS, Reef Credits, volumetric water benefit — are scoped by **catchment**, because that is the unit sediment, runoff and water quality are accounted in.

**If cohorts are formed on catchment boundaries rather than convenient ones, a single cohort satisfies both.** The carbon crediting group and the water accounting unit become the same object.

That is a bigger idea than a map grouping, for three reasons.

**It makes the stack structural rather than additive.** The current pitch for stacked instruments is that the same hectares can carry more than one thing, which is true but sounds like a bolt-on. Catchment-aligned cohorts make it architectural: the unit you already own is already the unit the second instrument needs. Nothing has to be re-assembled.

**It changes what the marketplace is selling.** Water accounting stops being a new dataset and becomes a re-read of a cohort that already exists. That is a much easier thing to price and a much easier thing to believe.

**And it makes cohort formation a strategic choice rather than an operational one.** Two candidate cohorts of equal carbon yield are not equal if one sits inside a reef catchment with a published sediment target and the other does not. **That is a decision a module holder would want visibility of**, and it is the kind of thing no competitor is in a position to offer.

### What it implies for the build

- **Catchment as a first-class map layer**, not a filter. Cohort boundaries snap to it where the density allows.
- Each cohort carries **which instrument families its catchment makes it eligible for**, alongside its carbon yield and delivery quarter.
- The Marketplace item for water accounting can then say *which of your existing cohorts it applies to* rather than describing a capability in the abstract.
- Where a catchment is covered by a published scheme or target, that is a fact worth surfacing on the cohort.

### Two things to check before it goes in front of anyone

**Do carbon density and catchment boundaries actually agree in the target regions?** A catchment that cannot assemble 10,000 to 15,000 hectares of project land does not make a cohort, however good the water story is. If they conflict, carbon density wins and the water eligibility is opportunistic rather than designed. Worth testing on Upper Murray with real data before the claim is made.

**Confirm ACWIS and Reef Credit scoping precisely.** I am treating both as catchment-scoped, which is right in principle, but the eligibility rules and the covered catchments need checking against the schemes rather than asserted from the design.

---

## 4 · Two numbers that need reconciling

### Average property size, and it is a 3.8× difference in field effort

| Source | Average | KCTs to fill 125,000 ha | Farm visits at 35% |
|---|---|---|---|
| **Frontier**, avg area per identified property, Upper Murray | **633 ha** | **197** | **564** |
| **Development plan**, funnel assumption | **2,400 ha** | **52** | **149** |

Every hectare figure in the scaffold scales from this, and so does the field resourcing Kieren described: two regions, one field agent and one back-of-house each, per module. **At 633 hectares a module needs nearly four times the contracts and nearly four times the visits.**

Both can be true if contracted properties skew far larger than the identified pool, which they should, since the method has a 500 hectare minimum carbon estimation area. But it needs the actual number: **average size of contracted projects, not of identified properties.** That is a one-query answer and it is load-bearing.

### The conversion rates, which are much steeper than the plan assumes

Reading Upper Murray's own funnel in hectares:

| Step | Conversion |
|---|---|
| In conversation → contracted | **5.2%** |
| Farm visit → contracted | **7.7%** |
| Proceed to sales pipeline → contracted | **44.8%** |

The development plan's benchmark is roughly 35% from farm visit to executed KCT. Frontier's live Upper Murray figure is **7.7%**. The 44.8% at the sales-pipeline stage suggests the plan's 35% was measured at the *later* handover point, not at the visit. **Two different denominators, one benchmark**, and the recruitment curve depends on which one is right.

Worth settling before the velocity panel publishes a conversion rate to a buyer, because a rate against the wrong denominator is the sort of thing that gets found.

---

## 5 · Five things to inherit from Frontier rather than invent

**The coverage pattern already exists.** *"281% of 40K Ha target reached"* is exactly the framing we landed on independently. Adopt the pattern rather than a new one. On the module basis, Upper Murray's recruitable 2.9 million hectares is **23× a 125,000 hectare target**, which is a far stronger number than the 9.8× I had.

**Identified versus recruitable is a real and useful distinction.** Frontier separates 3,023.8K identified from 2,905.2K recruitable, the difference being the ineligible. Carry both. The gap is itself evidence that the screen is doing work.

**Campaigns are already a live concept** and should surface to the buyer. *"Winter Grazing — targeting properties with high seasonal rainfall. Twelve new leads generated this week."* That is proof the machine is being actively worked, this week, on a stated hypothesis. It is the single most Tuesday-worthy object in the whole system and it already exists.

**Lead source mix is a risk metric, not just an analytic.** Storm Boy scrape 94%, platform 5%, referral under 1%. **A pipeline that depends 94% on one source is a concentration risk a module buyer would want to see**, and diversifying it is a process improvement worth showing alongside the cycle-time ones. It is also where channel partnerships would appear if they worked.

**The regional portfolio summary is already the track record, by region.** 59 projects, 4 with measured increases, 4 with ACCUs issued, 8,104 issued. That is the predicted-cored-issued exhibit in embryo, already computed. It needs the predicted column adding, not building from scratch.

---

## 6 · What this changes in the plan

| | Was | Now |
|---|---|---|
| **Hectares section** | New build against a specified scaffold | Frontier scoped to one module and one buyer, identities removed |
| **Pipeline stages** | One merged funnel | Two chained funnels with a named handover, plus the project pipeline |
| **Regions** | To be defined | Catchments, already modelled in Frontier |
| **Cohorts** | Geographic density only | Catchment-aligned where density allows, carrying multi-instrument eligibility |
| **Coverage figure** | 9.8× on a candidate-region basis | 23× on Upper Murray's recruitable area, using Frontier's own framing |
| **Avg property size** | 2,400 ha assumed | Unresolved. 633 ha identified average against 2,400 planned. Needs contracted-project average |
| **Conversion benchmark** | 35% visit to KCT | Unresolved. 7.7% live at that step, 44.8% at the later handover |
