# Rebuild the process improvement panel

One panel, inside the recruitment section of a console for a professional buyer. It exists to answer a single question and it currently answers it in words only.

**The question: is this company getting faster at filling my module, and by how much?**

---

## What the panel has to carry

Three measured results, five process changes behind them, and one reconciliation between the two.

**The results**

| | Was | Now | Basis |
|---|---|---|---|
| Module projected to reach its 125,000 hectare target | Apr 2028 | **Dec 2027** | projected at the current pace |
| Time from first contact to a signed contract | 103 days | **84 days** | measured, this quarter against last |
| Hectares contracted per field team per week | 470 ha | **640 ha** | measured, this quarter against last |

**The five changes, and what each removed**

| Change | Days removed | Status |
|---|---|---|
| Boundary mapping automated from title data | 30 | shipped |
| HORIZON pre-screen before first contact | 14 | shipped |
| Digital execution replacing posted documents | 9 | shipped |
| Land management plan templates by soil class | 7 | shipped |
| Same-day assessment at the kitchen table | 12 expected | in flight, October |

**The reconciliation, which is the most important thing on the panel.** The four shipped changes remove 60 days between them, but the stages they sit in run partly in parallel, so the measured end-to-end saving is **19 days, not 60**. That gap is currently a grey footnote. It is the most credible content here, because a supplier who shows why their own claimed saving is smaller than it sounds is doing something a marketing surface never does. **Draw it.**

---

## What must be perceptible

These are the requirements. Which forms satisfy them is yours to decide, and I would rather see what you arrive at than have you render what I already pictured.

**Magnitude must be readable without reading the numbers.** A 36% improvement and an 18% improvement must look different sizes. Any mark whose length is the same regardless of the value has failed this.

**Direction of good must be readable without knowing the metric.** Days falling and hectares rising are both improvements. A reader must not have to work out, per row, which way is good.

**Time must appear as a real axis somewhere on the panel.** This panel is about change over time and there is currently no time on screen. That single absence is most of why it does not read as progress.

**The payoff is a duration, so it must be visible as a distance.** "4.3 months sooner" is a length. A reader should be able to see that length, not compute it from two dates.

**The chain from a change to its effect must be traceable by eye.** A reader must not have to hold five items in their head and add them up. The changes and the results they produced are one argument and should be one visual structure.

**The superseded state stays on screen.** Improvement is only visible against what it replaced. Where the old value is removed there is nothing left to perceive.

**One element dominates.** The module reaching its target sooner is the payoff. Everything else is evidence for it and must be visibly subordinate.

**Every headline carries a short trend, not only a single delta.** One quarter against one quarter is indistinguishable from noise. The claim being made is that the process compounds, and four or six periods of movement in one direction is what supports that claim. A single comparison does not.

**Colour carries state, not identity.** There are exactly three states here: improved, superseded, and in flight. If the accent colour appears on every element it stops meaning anything, and the fastest perceptual channel available has been spent on decoration.

**Once stage durations are visible, so is the remaining time.** That is a feature. It makes the in-flight change legible as attacking the current bottleneck rather than as something we merely assert we are doing.

---

## Constraints

- **Never two vertical scales on one plot.** Days and hectares cannot share an axis. Two charts, small multiples, or index both to a common base.
- **Measured and projected are different claims and must be visually distinguishable.** Two of the three results are measured from timestamps. The module fill date is a projection.
- **Marks stay thin, grids and axes stay recessive hairlines**, and nothing is dashed unless dashing means something specific such as a projection.
- **Label selectively.** The endpoint, the extreme, the one that matters. Not a number on every mark.
- **Every value must be reachable without hovering.** A tooltip may enhance, never gate.
- Australian English, no em dashes, spaced hyphens instead, no marketing verbs.

---

## Colour note

The current panel renders almost every element in the same bright accent, including status badges, values, fills and rules. Two consequences: nothing recedes, so nothing leads; and the accent no longer signals anything because it is everywhere.

The production accent also sits near the top of the lightness range, which makes it unusable as a data fill on a dark surface — every mark glows at the same intensity and depth collapses. **Data marks need steps drawn from the middle of the lightness range, with the brightest step reserved for the single thing that should be looked at first.** Verify any set you choose against the surface it sits on rather than judging by eye.

---

## What I am not specifying

Chart types, layout, proportion, grid, type, motion, and how the panel is composed. Those are the work.
