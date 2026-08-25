# Please redraw the module delivery schedule

One panel, the four row schedule on the Delivery tab. Everything else on the tab stays as it is.

It was called out in the product walkthrough as **too complex and hard to make sense of**, and that is fair. What follows is the question it needs to answer, the specific things making it hard to read, and the one constraint that shapes the form. The form itself is yours.

---

## The one question

A carbon desk professional at a large emitter, managing a compliance obligation with a board behind them, wants to know: **will I get the credits I paid for, and when.**

Three quantities answer that, and they are three states of one number rather than three different things:

| | |
|---|---|
| **Committed** | What the contract owes, and in which years |
| **Forecast** | What the model says will be produced, given the pipeline as it stands |
| **Actualised** | What the regulator has issued |

If the panel makes that structure legible, it is doing its job.

---

## What makes the current version hard to read

Five specific things, offered as evidence rather than as a list of fixes.

**Three encodings per row.** A number on the right, a bar fill length, and a white tick position. A grammar has to be learned before a single row can be read.

**An annotation repeated four times, identically.** *110,000 ACCUs land in the final quarter* appears on every row with the same value. If it is the same every year it is not row information, and four identical notes send the reader hunting for a difference that is not there.

**The bars cannot show the thing they exist for.** Four values of 40, 50, 60 and 70 thousand on a fixed 0 to 80,000 scale all look nearly the same length. A schedule whose point is variation between years is showing near-identical bars.

**A legend key for an absent thing.** *Issued* sits in the legend in a state where nothing has been issued, so a third of the legend explains an absence.

**Copy explaining a mark.** *modelled against the delivery year* is a sentence doing work the mark should be doing.

---

## The constraint that shapes it

**Forecast moves continuously. Actualised moves in annual steps.**

The model revises whenever land registers or a season turns, so forecast is live and can change any day. But a harvest and a credit application happen once a year per cohort, fixed by the crediting method. Actualised volume is therefore a staircase, and it can only step at those annual boundaries.

The consequence worth designing for rather than discovering: **a wide gap between forecast and actualised is normal for most of any year**, and it closes at issuance. If the panel lets that read as underperformance it is misleading the reader. Between annual boundaries they are comparing a live projection against a fixed commitment, which is a forecasting question rather than a performance question.

**Forecast should not be hedged.** This is a commercial counterparty. They want everything the model says the pipeline will produce, including revisions and including years not yet started. What earns trust is not caution, it is that the basis is visible.

---

## It has to work at four states

The console has four time states and this panel appears in all of them. At pre-launch nothing has been delivered and the honest content is close to a single sentence. At capacity there is a full history. The panel currently carries the same density at every state, which is part of why it looks over-built at pre-launch.

A panel that scaled its own detail to what actually exists would be a real improvement, and empty states with a reason and a date attached read better than a bare zero.

---

## Directions worth exploring

Not a specification. Take a different route if you find a better one.

**Cumulative rather than per year**, since the commitment is cumulative and one shape showing forecast against committed over time carries the whole argument without a legend.

**Variance rather than level.** The reader wrote the commitment and knows FY30 is 40,000. The new information is the gap, and it may be the only thing that needs to be prominent.

**Four identical objects rather than four rows of three encodings**, so one grammar is learned once.

**Their unit rather than ours.** Their obligation is per compliance year, so expressing delivery as coverage of a surrender year is closer to the question they answer to their regulator. It carries a real risk of overclaiming on a modelled figure and would need to weaken visibly as confidence drops.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Modelled and forecast figures described as such, never as measured, validated or issued.
- Harvest and credit application are annual per cohort. Nothing should imply volume can be pulled forward at will.
- Volumes are the purchaser's share.
- A sentence needed to explain what a mark means is a sign the mark wants changing rather than annotating. Values, units and dates are labels, not explanation, and they stay.
- Dark surface, consistent with the rest of the console.

## Yours to decide

Proportion, type, colour, motion, chart form, whether the three quantities share one shape or sit apart, how the panel changes across the four time states, and whether the by year, by quarter and cumulative toggles all still earn their place.

Where what is already there does this job better than what is described here, keep yours and say so.
