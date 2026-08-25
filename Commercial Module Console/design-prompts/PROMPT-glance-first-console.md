# The console has to be understood at a glance

An adjustment pass on what you have built. The structure is right. What is missing is that a reader has to work to extract meaning from it, and this console is read by someone who will give it a few seconds before deciding whether it is credible.

**The governing requirement: every element on screen delivers its meaning on sight, not on reading.**

This pass replaces forms that cannot carry meaning with forms that can, and deletes the copy that was compensating for them. Net, there is less on screen, not more.

---

## 0 · Two rules about words

### Where a sentence appears, a form has failed

Explanatory copy is a symptom. When a chart, a track or a figure cannot say what it needs to say, prose gets written to say it instead. The correct response is not to shorten the sentence. It is to change the form until the sentence is unnecessary, then delete it.

Apply this test to every line of text currently on screen: **if this line explains what something means, the form beside it is wrong.** Fix the form.

Values, units, thresholds, dates, names and provenance stay. Those are labels, not explanations, and they are load-bearing.

### The reasoning behind a design is not copy for the design

A brief explains why a thing should work a certain way. That reasoning is for whoever builds it. It is not text for the screen.

Lines that state the intent of a component, the logic of a sort order, or the definition of a domain object are all reasoning. **Remove them.** A reader who needs to be told why the rows are ordered the way they are is being handed the designer's homework.

The sort order should be self-evident from the data. The definition of a catchment is known to this reader. The relationship between a total and its parts should be visible in the arrangement, not asserted in a caption.

---

## 1 · The interaction model, settled

There are currently several control surfaces competing: the map, the panel, an overlaid card, a focus control. **A map that is also a control panel competes with the panel that is also a control panel.** One is the instrument and the other is the display.

**The panel is the instrument. The map is the display.**

The map has exactly two interactions and no others:

- **Hover a region or a project** to identify it.
- **Click a region or a project** to select it.

Selecting scopes the panel to that region, or opens that property. That is the entire interaction budget for the map.

**Everything that changes what the map draws is a control in the panel.** Lens selection, stage filtering, layer switching. None of it sits on the map.

**Nothing is layered over the map.** No summary card, no lens card, no legend card. The map is a map, edge to edge, and it gets the space back.

Identity is carried by hover, not by a persistent key. A reader who hovers a point learns what it is. A reader on their second visit does not need a legend occupying permanent space.

---

## 2 · The map shows what is legible at the zoom it is at

At national extent, drawing every assessed property as a point produces several hundred marks that cannot be counted, cannot be distinguished, and collide. **That is texture, not information.**

**Detail arrives with zoom.**

| Zoom | What the map draws |
|---|---|
| **National** | Region boundaries, with a perceptible indicator of which regions carry the module and roughly how far each has filled. **Plus every project in the module, individually**, because those are what the buyer owns |
| **Region** | Prospect properties appear as points in their pipeline states. Cohort groupings appear once they exist |
| **Property** | The property's own detailed view |

**The rule underneath it: the buyer's own land is visible at every zoom.** Prospect land is third-party land that has not been contracted. It is aggregate at national scale and only becomes individually meaningful when a reader is close enough to act on one of them. That also means unconverted landholders are never individually identifiable at a zoom where a reader could pick one out.

**On the map, a region carries its name and nothing else.** Region detail lives in the panel. Mixed label grammar, where some regions carry a figure and some carry a sentence and some carry nothing, forces a reader to work out which kind of label they are looking at before they can read any of them.

---

## 3 · The region monitor

Replace the region information currently carried in map labels and in prose rows with a monitor in the panel. Its job is **one glance: which regions carry the module, and how is each doing.**

### The row is a mark, not a sentence

Each region has three quantities that belong on **one track**:

- **Contracted** - land signed into the module
- **Pipeline** - assessed, eligible land behind it, live from the sales system
- **Target** - the region's contribution to the module

**A reader must answer two questions from the shape alone, without reading a number:**

- **Is this region on track?** How much of its target is contracted.
- **Can it finish?** Whether there is enough eligible land behind it to cover what remains.

The second question is the more useful of the two and the current design cannot answer it at all.

### The track must handle pipeline several times larger than target

This is the constraint that decides the form. Pipeline depth in these regions runs at roughly three times the target contribution. A track that ends at target physically cannot express that, which is why pipeline has ended up as a small grey figure sitting outside the track.

**Pipeline is not an annotation. It is the answer to "can you deliver 125,000 hectares", and before the module opens it is the most important quantity in the row.**

Use a **common absolute hectare scale across every region row**, with each region's target marked on its own track. Bar length is then comparable between regions, coverage reads as bar against marker, and the module total is literally the sum of the row lengths. Normalising each row to its own target would make coverage easier to compare but would destroy the sum, which is the more valuable property.

### The leading figure changes with what is true

Before the module opens, contracted is near zero in every region. A fill percentage there reads as failure while the actual position is strong. **At that state the row's headline quantity is coverage: eligible land as a multiple of target.** At module level this currently resolves to something close to three times over. Once contracting is underway, the headline becomes position against target, and coverage recedes to the track.

### One figure, one precision rule

A quantity uses the same precision in every row. A percentage that appears as `0.0%` in one row and `13%` in another makes a reader check whether the difference means something. Decimals on a zero are false precision.

### Everything else is on selection

Region name, the track, and at most one figure. **No sentences in the row.** Whether a field team is present, whether a campaign is running, which water instruments the catchment makes possible, and the cohorts inside it are all detail that appears when the region is selected.

**Selecting a region scopes the whole view**: the map moves to it, the pipeline scopes to it, the event feed scopes to it. Selecting it again returns to the module view. Selection is the only route to region detail. Nothing about a region is permanently expanded in the list.

### Ordering

**By attention, not alphabet.** Early in the module's life that is the region furthest behind its curve. Once the module is full it shifts to contribution. The ordering is not explained on screen.

### It degrades correctly

Before the module opens every contracted figure is zero, and the row still works, because pipeline depth is the meaningful quantity at that point. The row does not disappear or collapse. It shows what is true.

---

## 4 · The insight line

There is currently a block reporting changes since the reader's last visit. **Rebuild it as a single derived insight.**

Its job is to tell this reader the one thing that is materially interesting to them right now, given where the module is in its life and what has actually happened in the data. It is not a fixed set of metrics with a template around them. It is computed, it changes, and it is different at every state.

### What it is

**One finding. One line. The claim and its evidence in the same breath.**

- A quantity, a period, and what it is about. Nothing else.
- **No characterisation.** Not "strong", not "encouraging", not "a concern". The number carries the judgement. A reader at a carbon desk resents being told how to feel about a figure they can read.
- **It states when it was computed.**
- **It never presents a modelled quantity as a validated one.**

### It is also a navigation act

**Selecting the insight scopes the view to whatever it is about** - the region, the cohort, the property. That is what earns it the top of the panel: it is the fastest route into the thing that currently matters.

### It changes with the state

The material question is different at each point in the module's life, so the insight is drawn from a different place:

| State | What is materially interesting |
|---|---|
| **Before the module opens** | Depth and movement in the eligible land behind the module, and material events in the field, including negative ones |
| **During recruitment** | Position against the curve, change in rate, and which region is moving the position |
| **First crediting** | The first issuance, and modelled against validated against issued |
| **At nameplate** | Delivery against the contracted schedule, and replacement depth behind each region |

### When nothing has changed, it says so

If nothing material has moved since the reader was last here, the line says that plainly. **It does not manufacture a finding.** An insight surface that always has something to say is quickly understood to be saying nothing, and that costs more trust than an occasional quiet week.

### It does not duplicate the event feed

The event feed is the complete, dated, chronological record. The insight is the reading of it. One is evidence, the other is a conclusion. The insight never restates a feed entry verbatim.

### On copy

This line is the exception to everything in section 0. An insight is a claim, and a claim takes a sentence. **Because every other explanatory line on the screen is being removed, this becomes the only sentence in the panel** - which is precisely what gives it weight without needing size, colour or a container to announce it.

---

## 5 · The module owns one property from the start, and it is enterable

**Before the module opens there is exactly one commissioned property in it: Mulloon, in the Murrumbidgee, around 5,990 hectares.** Everything else on screen at that state is capability. This one point is what has actually been committed, and that contrast is the honest and the strong version of the pre-launch screen: a single named point on a map of Australia, inside one region, surrounded by depth.

**It must be enterable, by two routes:**

- **Clicking the property on the map.**
- **Clicking it in a list of the module's properties in the panel.**

Entering it opens the property's own view - the land, its baseline, its measurement history, its projected yield. This is the level at which a landholder sees their own operation, and the buyer being able to descend into it from the module view is the point: it demonstrates that the module is not an abstraction over a spreadsheet but an aggregation of real, individually measured properties.

**Only contracted properties are ever named.** Prospect land is unnamed density, because those landholders have not consented to appear.

---

## 6 · One dominant element per state

Several blocks currently compete at the top of the panel and nothing leads.

**One element dominates, the rest are visibly subordinate, and which one dominates changes with the state**, because the leading question changes.

| State | What leads |
|---|---|
| **Before the module opens** | The coverage answer: eligible land as a multiple of the module target. This is the answer to "can you actually do this" |
| **During recruitment** | Position against the curve |
| **First crediting** | The first issuance, and modelled against validated against issued |
| **At nameplate** | Delivery against the contracted schedule |

At every state the order beneath it is the same: **the insight line, then the dominant element, then the region monitor, then the event record.** A single sentence, a single figure, a set of marks, a list of facts.

**A block with nothing meaningful to say in a state is absent, not diminished.** A period-on-period improvement claim about a process that has not yet run for this module is one of these. Where a block is absent, something in the state says why and when it resolves.

---

## 7 · A lens appears when it has something to show

Four lenses present at every state means some are empty early, and an empty control is worse than an absent one because a reader spends a click finding out.

- **Before the module opens:** Recruitment. Water present but not enabled, because it is a purchasable capability and its presence is the point.
- **During recruitment:** Recruitment, and Carbon once there is modelled yield.
- **First crediting onward:** all four.

**Lens names alone. No subtitle under any of them.** Recruitment, Carbon, Water, Delivery. Pipeline stage names alone, for the same reason: they are already plain language.

A lens gaining options is not an element moving. The control stays in one place and its contents grow.

---

## 8 · Colour is doing too many jobs

The accent currently appears on a navigation item, the selected lens, the module's regions, the contracted property, a headline figure, every pipeline bar and the primary action. **When the accent is on everything it signals nothing**, and it is the fastest perceptual channel available.

**Reserve the strongest signal for one job per view.** Before the module opens that is the land the module is being built from. Pipeline stages are an ordered sequence and should read as a sequence rather than as several different things. Interface chrome does not take the accent at all.

---

## 9 · What stays exactly as it is

- The four time states and the control that moves between them.
- **Regions as fixed geography, cohorts as memberships derived from their members.** These remain two distinct objects with two distinct visual languages.
- Both property state families and their transitions across time.
- The pipeline in hectares, live from the sales system.
- The event record: dated, quantified, region-tagged, and including events that went the wrong way. This is the most credible element on the screen and it should not be softened.
- The section structure and the focus control.

---

## 10 · Constraints

- Australian English. **No em dashes anywhere, including titles.** Spaced hyphens instead.
- Empty states carry their reason and the date they resolve. Never a blank, never a bare zero.
- Nothing modelled is presented as measured or validated.
- No dollar value on any credit volume.
- Unconsented landholders are never identifiable.
- Nothing moves position between time states. A region sits in the same place at every point in the module's life.

## What I am not specifying

Proportion, grid, type, colour values, motion, component structure, or how a track, a region fill or a cohort membership is drawn. Those are the work. The requirements are that meaning arrives before reading does, that a pipeline three times the size of a target is expressible, and that an area and a membership never look like the same kind of thing.
