# Visual fluency and information density: what the evidence actually supports

**13 August 2026.** Run against the design ethos agreed with Kieren: *visual-led, as little copy as possible, the eye should know where to go immediately.*

Roughly 45 primary and meta-analytic sources verified. Citations given so this survives being argued with.

**Short version: half the ethos is well supported and half of it is not, and the unsupported half is the "as little copy as possible" part.** The reframe at §1 keeps the same visual result on a defensible basis.

---

## 1 · The reframe

The evidence does not support minimising copy. It supports a different rule that produces a similar-looking screen for better reasons:

> **Remove the irrelevant, the decorative and the redundant. Keep and integrate every label, unit, delta, source and quantified uncertainty. One dominant focal point per view. Never move things.**

**Copy volume is the wrong variable.** Relevance and redundancy are the right ones, and they are what the literature actually measures.

The distinction that does the work: **guidance reverses with expertise, signalling does not.**

- Explanatory prose telling a carbon trader what a chart means is **guidance**. Strip it.
- Labels, units, thresholds, provenance and annotations are **signalling**. Keep them, and put them inside the graphic.

---

## 2 · Five findings that change the console

### 2.1 Quantified uncertainty is nearly free. Vague hedging is what costs you. `[strong, and it is field evidence]`

The most useful result in the whole sweep, and it lands directly on the honesty architecture.

**van der Bles, van der Linden, Freeman & Spiegelhalter (2020), PNAS 117(14).** Five surveys, n = 5,780, including a **1,700-person field experiment on BBC News**. Replicated across 12 countries, n = 10,519.

| Format | Trust in the number | Trust in the source |
|---|---|---|
| **Numeric range** | small decrease, d = .10 | **no significant effect** |
| **Verbal hedge** | larger decrease, d = .18 | small decrease |

**What this means for the forecast panel.** The current build says *"+83,000 against contract"* and then *"the band on those cohorts is ±121,000, so a shortfall remains possible."* The second clause is the expensive form: a verbal hedge, which costs trust in both the number and in AgriProve.

The cheap form is to state the range numerically and drop the hedge entirely. *"Forecast 1,958,000, range 1,837,000 to 2,079,000, against 1,875,000 contracted."* Same honesty, measurably lower cost, and it removes the headline-versus-subtext contradiction at the same time.

**Designers believe the opposite and it is unfounded.** Hullman (2020, IEEE TVCG) surveyed 90 visualisation creators: 62% avoid showing uncertainty for fear of overwhelming the audience, 17% because they fear it makes data look questionable. Only ~3% of studied data-journalism visualisations show uncertainty at all. Hullman found no empirical basis for the belief.

**One warning attached.** The **deterministic construal error**: people read confidence intervals as high and low forecasts, and Padilla, Kay & Hullman report that *"researchers misunderstand confidence intervals as frequently as lay audiences."* **Expertise does not protect against this.** Any interval on this console has to be labelled in words for what it is, not left as an error bar to be interpreted.

### 2.2 False precision becomes a liability the moment the number moves `[moderate]`

**Pena-Marin & Bhargave (2019), Journal of Consumer Psychology 28(1).** When an estimate turns out to be wrong, an **imprecise** estimate preserves source trustworthiness better than a precise one did.

Precise numbers do read as more confident up front (Jerez-Fernandez, Angulo & Oppenheimer 2014, Psychological Science). But carbon numbers get revised constantly. **761,856 delivered** is a measured registry fact and should stay exact. A *forecast* rendered to six significant figures is buying confidence now and paying for it at every revision.

Rule: exact for measured, rounded for modelled. That also makes the measured/modelled distinction legible without a badge.

### 2.3 Organisation beats density, and consolidating beats fragmenting `[strong, field-representative, expert participants]`

This is the answer to whether a dense professional console is a problem. It is not. Disorganisation is.

**Moacdieh & Sarter (2017), IEEE THMS 47(6).** Density alone raised response time 4.7 s → 9.9 s. But **poor organisation added 6.0 s to dense displays where good organisation added only 4.2 s**, and under stress **65% of participants made errors in dense-disorganised displays versus 0% in dense-organised ones.**

**Moacdieh & Sarter (2015), Human Factors 57(4).** 15 emergency physicians. Their operational definition of clutter is the useful bit: not density, but *"high density of **irrelevant** data plus poor display organisation."*

**Al Ghalayini, Antoun & Moacdieh (2018), Health Informatics Journal.** Consolidating records split across tabs into **one denser, well-organised tab**: mean fixation duration fell 126.6 ms → 96.7 ms, mental workload fell 3.3 → 2.46, 11 of 13 clinicians preferred it, zero errors either way. **More data on one screen made expert performance easier because it removed navigation.**

Direct consequence: **the marketplace-adds-a-section model is better than tabs-for-everything**, and any instinct to split a busy panel across two screens should be resisted. Group and label instead.

### 2.4 For expert daily users, positional stability beats visual salience `[strong]`

**Tatler, Hayhoe, Land & Ballard (2011), Journal of Vision 11(5).** Low-level salience predicts fixations at AUC 0.55–0.65, barely above chance, and **under task demands its predictive power "can disappear."** What actually drives expert gaze is learned knowledge of where information lives.

**Reingold, Charness, Pomplun & Stampe (2001), Psychological Science 12(1).** Chess masters had far larger visual spans for structured positions, made **fewer fixations**, and fixated *between* pieces rather than on them. A learned encoding advantage, not better eyes.

**So "the eye should know where to go immediately" is a first-run and occasional-user optimisation.** A holder who opens this weekly will learn the layout in days. After that, **moving things to chase visual drama actively destroys the spatial map they have built.** Positional stability across the four time states matters more than any single striking screen.

### 2.5 The closest study in your actual domain says the visual advantage belongs to novices `[moderate]`

**Friedman, Williams & Zheng (2026), Experimental Economics, "Market visualizations."** Continuous double auction, four trading interfaces from text-based to a heatmap-and-orderbook "VideoGame" GUI.

- The visual interface raised payoff efficiency **16 to 28 percentage points for inexperienced traders**
- **"Experienced traders achieved high efficiency across all interfaces"**, including the text-based one
- What experienced traders actually valued was **point-and-click order entry**, an interaction affordance, not visual richness

**Read that against the console.** If the audience is genuinely expert, visual richness buys less than assumed, and **actionability buys more.** The harvest request, entering a property twin, adding a capability — the things a holder can *do* — are worth more than the things they can look at. That is an argument for the interaction model, not against the map.

---

## 3 · What in the ethos is supported

**One dominant focal element. Strongest single finding in favour.**
Ajani, Lee, Xiong, Knaflic, Kemper & Franconeri (2022), IEEE TVCG 28(10). Three versions of six charts: cluttered, decluttered, then decluttered-plus-focused. **Focused designs made participants 2.5 to 3× more likely to recall the intended conclusion** (focused vs decluttered, p = .007). Decluttering alone improved rated professionalism but produced **no memory benefit**.

Note carefully what the winning condition actually was: **they added a headline and annotations.** The intervention that removed things was cosmetic. The intervention that added text worked.

**Removing decorative content.** Sundararajan & Adesope (2020), Educational Psychology Review 32 — the seductive details effect. Interesting-but-irrelevant content hinders comprehension.

**Removing explanatory guidance for experts.** Tetzlaff, Simonsmeier, Peters & Brod (2025), Learning and Instruction 98, a meta-analysis of the expertise reversal effect: 176 effect sizes, 60 studies, N = 5,924. Novices learn better with high assistance (**d = 0.505**); **experts learn better with low assistance (d = −0.428)**.

**Removing text that duplicates a self-explanatory graphic — but only under three conditions.** Adesope & Nesbit (2012), Journal of Educational Psychology 104(1). Benefits of removal appeared for high-prior-knowledge users, with genuinely self-explanatory visuals, where the text **duplicates**. Partial redundancy — key terms alongside — beat full duplication. Text that adds a value, a threshold, a unit or a reason is not redundant and this literature says nothing against it.

**Encoding state in hue and orientation.** Healey, Booth & Enns (1996), ACM TOCHI 3(2). Both channels are preattentive, reliable from **105 ms**, and **do not interfere with each other**. Two independent channels available for free. This is the evidence for using colour to carry direction and state rather than brand identity.

---

## 4 · What in the ethos is not supported

Stated plainly, because Matthew will push and this needs to hold.

**The most direct test found the opposite.** Stokes, Setlur, Cogley, Satyanarayan & Hearst (2022), IEEE VIS. 302 participants ranking line charts varying in text quantity. *"Contrary to minimalist design conventions, heavily annotated charts were not penalised."* **Charts with the most annotations ranked highest.** 14% preferred text-only over the chart. Readers wanted both.

**On real dashboards, text is where the eye goes.** Yang, Hou, Li, Chang & Zeng (2025), IEEE TVCG. 60 participants, 1,216 dashboards, 2,133 eye-movement instances. **Text objects took 42.96% of attention intensity.** Numbers had the highest saliency coverage of any element. **Axis labels drew more fixation than the highlighted bars and lines themselves.** Stratified layouts guided attention best. Strong upper-left bias.

**Clear labels are the single largest trust driver.** McKinley, Pandey & Ottley (2025), CHI 2025. Clarity mentioned by **84% of participants**; source citation by 30%. What *reduced* trust: infographic styling, read as promotional rather than informational, and visual complexity. Aesthetics ranked below clarity and integrity.

**Integrating labels into the graphic has g = 0.63.** Schroeder & Cenkci (2018), Educational Psychology Review 30(3), 58 comparisons, n = 2,426. Label inside or adjacent beats legend, tooltip or caption below.

**Signalling does not reverse with expertise.** Schneider, Beege, Nebel & Rey (2018), Educational Research Review, 103 studies, 12,201 participants: g+ = 0.53 retention, and **prior knowledge was not a moderator.** This is a genuine tension with the expertise reversal literature and it is exactly the line between guidance and signalling.

**The data-ink ratio has never been validated and fails when tested.** Tufte (1983) presented no experiments. McGurgan (2015, RIT) found no comprehension benefit across low, medium and high data-ink. McGurgan et al. (2021, VISIGRAPP) tested **expert participants** and **most preferred medium data-ink**; all but one found the maximally minimal boxplot hard to read, because stripping the box destroyed the perceptual grouping. Bateman et al. (2010, CHI) found embellished charts equal on accuracy and **better on long-term recall**.

You can run minimalism as a house style. You cannot cite evidence that it improves expert performance.

**Processing fluency will not carry the argument.** The primary source designers cite, Reber & Schwarz (1999), found a difference of **0.27 endorsements out of 16, about 1.7 percentage points**, on trivia, at t = 1.65. Alter & Oppenheimer (2009) document that fluency effects are discounted the moment the reader can attribute them to an irrelevant source, ignored when diagnostic content is available, and reversible. **An expert reading a trading screen has diagnostic content by definition**, and may well have learned the opposite association: slick presentation means sales material. There is no study of domain experts assessing a professional interface in their own field. Do not build the case on fluency.

---

## 5 · Folklore to stop repeating

Each of these circulates in design writing and none survives its source.

| Claim | Status |
|---|---|
| **Three-click rule** | No supporting study exists. Traced to Zeldman (2001), asserted without research. Porter (2003) tested it: dropoff did not increase past three clicks |
| **"8-second attention span", goldfish comparison** | Fabricated. Traced to a 2015 Microsoft Canada report citing Statistic Brain citing NCBI and AP, **neither of which could locate any research**. Vogel (Chicago): attention has been *"remarkably stable across decades"* |
| **"You have 50ms"** (Lindgaard 2006) | The paper measured **reliability of visual appeal ratings**. It did not measure comprehension, task success or credibility. Every extension beyond appeal is unsupported |
| **Golden ratio in layout** | Green (1995), Perception 24(9): a century of studies, weak and equivocal. No evidence at all for interfaces |
| **F-pattern for all content** | Nielsen's 2006 finding came from unformatted text-heavy pages. Pernice (2017) documents five other patterns. **Your users run "spotted" scans hunting specific numbers.** Designing to an F-pattern is a category error |
| **Miller's 7±2 for interface elements** | Category error. Miller himself called the correspondence *"only a coincidence"*. Cowan (2001) puts the real limit near four. Neither phenomenon is about how many things may appear on a screen |
| **"Users don't scroll"** | False, but the gradient is real. NN/g: 80.3% of viewing time above the fold, 19.7% below |
| **"White space increases comprehension 20%" (Lin 2004)** | **Untraceable to any primary source.** Do not use |
| **Disfluency makes people think harder** | **Failed replication.** Meyer et al. (2015) pooled the original with 16 replication attempts: *"no effect on solution rates... under any conditions"* |

---

## 6 · Confidence ledger

| Claim | Strength | Basis |
|---|---|---|
| Expertise reversal is real | **Strong** | Meta-analysis, N = 5,924 |
| Numeric uncertainty barely dents trust, verbal hedging costs more | **Strong** | Lab **and field**, BBC n = 1,700, 12 countries n = 10,519 |
| Integrated labels help, g = 0.63 | **Strong** | 58 comparisons |
| Signalling helps and does not reverse with expertise | **Strong** | 103 studies, 12,201 participants |
| Organisation dominates density for experts | **Strong** | Eye-tracked, physician participants |
| Positional stability beats salience for expert users | **Strong** | Convergent, chess and natural task studies |
| One dominant focal point beats flat weighting | **Moderate** | Single study, N = 24, but a direct test |
| Annotated charts are not penalised | **Moderate** | N = 302 |
| Visual advantage concentrated in inexperienced traders | **Moderate** | Lab market, closest domain analogue |
| False precision costs trust when revised | **Moderate** | Consumer context, not professional |
| Data-ink ratio improves performance | **No support**, null or reversed where tested | |
| Fluency to truth for experts in their own domain | **Contested, no direct study** | |

**The genuine hole:** there is no published study of domain experts assessing the credibility of a professional data interface in their own field. That is precisely the question being asked, and nobody has answered it. Worth saying out loud rather than overclaiming from adjacent literature.

---

## 7 · What I would put in front of Kieren and Matthew

Five rules, each with a citation behind it, replacing "as little copy as possible":

1. **One dominant focal point per view.** 2.5 to 3× recall of the intended conclusion. `Ajani 2022`
2. **Cut explanation, keep labels.** Guidance reverses with expertise, signalling does not. `Tetzlaff 2025 · Schneider 2018`
3. **Put every label, unit and threshold inside the graphic**, not in a legend or a caption. `g = 0.63, Schroeder 2018`
4. **Give every uncertain number a numeric range and never a verbal hedge.** Ranges are nearly free; hedges cost trust in the number and in us. `van der Bles 2020, PNAS`
5. **Never move things between states.** Expert performance rests on a learned spatial map, not on salience. `Tatler 2011 · Reingold 2001`

And one line for the room: **the study that most directly tested "declutter" against "add a headline and annotations" found that decluttering improved how professional it looked and did nothing for whether anyone understood it.**
