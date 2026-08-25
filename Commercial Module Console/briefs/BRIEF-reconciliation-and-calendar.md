# Two panels on the Delivery tab

The reconciliation panel, and whatever occupies the delivery calendar's slot. Everything else on the tab stays.

---

## 1 · Reconciliation

### What it is for

One question: **does the model tell the truth?** Every round is modelled first, then a randomised tenth of the cohort is physically sampled, and credits issue against the validated figure. So the gap between model and validation is the single number that decides whether anything else on this tab can be believed.

### What is wrong now

**The instrument was lost and the container kept.** The plot of model against validation across rounds is one of the things leadership specifically asked not to lose. At one sampled round a scatter is a dot, so it has collapsed to a single tick on an empty line. Honest, and carrying nothing.

**The variance is rendered as the least important thing on the panel, and it is the most important.** Model 5,900 as a full width bar, Actual 5,870 as a full width bar, Variance as a sliver. Three bars, two of them visually identical, and every bit of the information sits in the third.

**The number that variance represents is remarkable and invisible.** Thirty ACCUs on 5,900 is **0.51%**. A model that lands within half a per cent of physical validation is the strongest claim this console can make, and it is currently the smallest mark on screen.

### Bring the scatter back, and give it the claim it was missing

The plot of modelled against validated was one of the things leadership liked most, so it goes back. What would make it better is not a different chart but a **statistical layer on top of the one they already liked.** As drawn before it was a display of what happened. Four additions turn it into a claim.

- **The identity line**, which is the null hypothesis made visible: perfect agreement. Points on it mean the model is unbiased.
- **The mean bias, stated as a number.** At eleven rounds it is around half a per cent. Small enough that it cannot be read off the geometry, which is exactly why it needs saying.
- **Limits of agreement.** A band inside which 95 per cent of rounds fall. This is the part that changes the panel's nature, because a scatter reports the past and a band **predicts the next round.** For a reader deciding whether to trust the forecast, that is the more useful sentence.
- **The worst round named rather than buried.** Showing the outlier is what makes the other ten credible. A plot that hides its worst point invites the question of what else is missing.

**At one round it still works if the empty slots are drawn with their dates.** One filled, nine dashed, each labelled with the quarter it resolves. Honest about the sample size, and it converts an absence into a promise with dates attached.

**Also fix the variance rendering.** Half a per cent only reads as impressive against some sense of what would have mattered, so the variance wants a tolerance scale rather than a sliver next to two identical bars.

### The more effective instrument, if you want one

There is a recognised chart built for precisely this question, and the question is worth naming: **does one method of measurement agree with another?** The model estimates, physical sampling validates, and the whole panel exists to show whether the two agree.

The standard instrument is a **difference plot** - the gap between the two measurements against their average, with the mean bias drawn and limits of agreement at plus and minus 1.96 standard deviations. Three things it does that the scatter cannot:

**Bias becomes visible instead of merely stated.** On a scatter, a half per cent offset is geometrically invisible because the points sit on a diagonal spanning thousands of ACCUs. On a difference plot it is a line offset from zero, readable at a glance.

**The limits of agreement become the axis** rather than a narrow band squeezed against a diagonal, so the predictive claim is the main thing on the chart.

**It reveals whether error scales with round size, and the scatter cannot show this at all.** In the illustrative data the widest miss sits on the smallest round and the larger rounds cluster tighter. If that pattern holds in the real data it is a genuinely useful finding, because it argues for larger cohorts, and nothing else in the console would surface it.

The honest caution: a difference plot is a technical instrument. A carbon desk professional will read it without difficulty; a board member glancing over their shoulder may not. So the scatter may be the better public face with the difference plot available behind it, or the two may simply serve different readers. Worth deciding rather than defaulting.

### The claim strengthens as rounds accumulate

Worth building for, because it gives this panel something to do across the time stepper and it is a rare property.

At one round there is a measurement. At eleven there are limits of agreement. And the **precision of the bias estimate improves with the square root of the number of rounds** - at eleven it is known to roughly half a per cent, and every further round tightens it.

So the panel does not merely fill up. Its claim gets stronger, and it can say so.

### The part that needs thought: it has a different job at each time state

This is the interesting problem and the current design has one form for all four states.

- **First crediting, one round sampled.** There is no distribution. The honest content is how close the single round was, and where the remaining nine will land.
- **At capacity, eleven rounds sampled.** Now there is a distribution. The delivery schedule header is already carrying *3.2% widest gap, 1.4% mean across 11 rounds* as summary figures, which means the calibration plot finally has enough points to earn its axes.

So the panel should grow from a single measurement into a distribution as rounds accumulate. Whether that is one form that fills up or two forms that hand over is the design question.

---

## 2 · The delivery calendar's slot

### Why the calendar was called unnecessary

It is the **third decomposition of one number.** The schedule cuts ACCUs by year, the calendar cuts them by quarter, the cohorts cut them by production batch. The reader is asked to hold three slicings of the same total and reconcile them.

And quarterly sits below the reader's decision resolution. Their obligation is per compliance year, so a quarter is detail they cannot act on.

### What is actually missing from the tab

The tab now covers committed, forecast and actualised well. What it does not answer is **why the forecast is what it is.**

Committed is fixed by contract. Actualised is history. **Forecast is the only live quantity on the tab**, and it revises continuously as land registers and seasons turn. A number that moves without a reason attached erodes trust rather than building it, and nothing on the console currently explains a movement.

### The suggestion

**What moved the forecast.** From forecast at signing to forecast now, decomposed by driver: land registered, season, validation coming in above or below model, model revision.

Three reasons to back it. It is the only content that makes the forecast credible rather than asserted. Nothing else in the console answers it. And it is outcome attribution rather than method, so it stays clear of the ruling that the console reports outcomes and not process: rainfall and validation results are conditions and results, not how we work.

**Showing the decreases is the point.** Leadership specifically praised the model monitoring panel *with its increases and decreases*. A movement panel that only ever goes up is marketing, and the reader will know.

One mechanical caution: on a truncated axis the small drivers nearly vanish. Either the scale accommodates them or they group into a single remaining step, but a driver worth naming should not be a sliver.

### Two weaker candidates, so they can be ruled out deliberately

**A downside case.** A compliance buyer's real fear is a shortfall and the tab shows the central case with an interval, never a scenario. Worth considering, but it answers an occasional question.

**Concentration.** How much of delivery rides on the top few cohorts. Also occasional.

Movement is continuous, which is why it earns a permanent slot and these two do not.

---

## If the calendar has already gone

Then the question is what belongs in the space rather than what replaces the calendar. The reasoning above stands either way.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Modelled and forecast figures described as such, never as measured, validated or issued.
- Credits are generated on the model and validated by physically sampling a tenth of each cohort. Sampling validates the estimate rather than replacing it.
- Harvest and credit application are annual per cohort.
- No cost figures on the sampling round.
- Volumes are the purchaser's share.
- Three type sizes is the ceiling, and where the title and the mark are clear the explanatory sentence comes out.

## Yours to decide

Proportion, type, colour, motion, chart forms, whether the reconciliation is one form that fills up or two that hand over across the time states, and how a movement is decomposed on screen.

Where what is already there does one of these jobs better than what is described here, keep yours and say so.
