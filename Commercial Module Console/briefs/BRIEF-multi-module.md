# Please design the level above a single module

The console today shows one module. A large buyer will hold several. BHP is expected to take ten. There is currently no level above the single module, and the reader has no way to see or move between them.

This brief is mostly the problem. The form is yours.

---

## The reader and what changes for them

A carbon desk professional at a large emitter, managing a compliance obligation with a board behind them. At one module their job is **monitoring**: watch a thing, understand it.

At ten modules their job becomes **triage**. Nobody opens ten dashboards. They want to know which one needs them today, and whether the whole book is going to deliver. That shift is the single most important thing about this level, and it is not the same as showing ten copies of the existing view.

Ten modules is 1.25 million hectares of grazing land and roughly 340 individual projects, so nothing that works by listing things will scale.

---

## The thing that makes this hard

**A module is a contract wrapper, not a place.**

Ten modules draw from the same catchments, the same field teams and in some cases the same production cohorts. They are spatially interleaved, not separate territories. You cannot give each one a region, a colour on a map, or a boundary, because they overlap almost completely.

So the map, which is the organising element of the single module view, is close to useless as the organising element here. Ten overlapping national footprints is one national footprint.

What actually distinguishes one module from another is **contract terms and delivery position**: how much volume, in which compliance years, and where each one stands against that. That is the axis the level should be built on.

---

## What the level has to answer

Three things, and probably only three. Everything else belongs inside a module.

**Am I covered, year by year.** The aggregate position across the book against the aggregate obligation, per compliance year. This is the board question.

**Which module needs me.** Exception surfacing. The default state should show what is off track rather than requiring the reader to inspect ten things to find out that nine are fine.

**Where is my concentration.** If every module draws from the same few catchments, one drought hits all of them at once. A book that looks diversified at the contract level can be entirely undiversified at the land level.

Anything that is true of one module and not of the book belongs in the module view, not here.

---

## One distinction worth building around

The most valuable property of a cross-module view, and the reason the level exists rather than being a switcher:

**A gap down a column is a portfolio problem. A gap across a row is one module.**

If modules are one axis and compliance years the other, a thin FY33 across the whole book is a completely different problem from one module running late, and they demand different responses. That difference is invisible when you look at ten dashboards one at a time, and it is the thing the reader cannot get any other way.

The attached sketch shows this as a matrix, which is the most direct way to get it. It is one option rather than a recommendation, and the shape is yours.

---

## Carry the single module's spine upward

The Delivery tab is being built on three states of one quantity, and the same spine should hold at the parent level so the reader learns one structure:

| State | What it is |
|---|---|
| **Committed** | What the contracts owe, and in which years |
| **Forecast** | What the model says will be produced, given the pipeline as it stands |
| **Actualised** | What the regulator has issued |

The same unit discipline applies. Hectares are a recruitment quantity, ACCUs are a delivery quantity, and a measure appears once in whichever place its unit belongs.

**One constraint that compounds at this level.** Forecast moves continuously as land registers and seasons turn, but harvest and credit application happen once a year per cohort. At a single module that makes actualised volume a coarse staircase. Across ten modules on different cohort cycles the aggregate steps more often in smaller increments, so the book's actualised line is smoother than any individual module's. That is a genuine and useful property of holding several, and it is worth the reader being able to see it.

---

## Moving between the levels

The reader has to get into a module and back out without losing their place, and it should be obvious which module they are in once inside. The existing single module console becomes the child view essentially unchanged.

Worth deciding whether the parent is the landing surface or whether a reader with one module never sees it. A buyer with a single module should probably not be made to traverse a portfolio level to reach it.

---

## One idea I would not build yet

Shared cohorts create correlated risk that a single module view cannot show by construction. If cohort LAC-01 delivers into modules three, five and seven, one delay hits three modules at once, and nobody looking at any single module would know.

The argument is sound. When sketched against illustrative exposures it demonstrated almost nothing, because the spread was even. Whether a correlated exposure view earns its place depends on what the real numbers look like, so it is worth leaving room for rather than building on the argument alone.

---

## Naming

The level needs a name and it does not have one. A carbon desk would call it a book or a position. Portfolio, Programme and Book are all candidates and each implies something slightly different about what the reader is looking at. Worth a view.

---

## Attached

**`parent-level-concept.png`** - two sketches. A modules by compliance year matrix, and a correlated exposure heatmap. Illustrative data, drawn to make the column-versus-row point legible rather than to propose a visual style. Ignore the styling.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Forecast and modelled figures described as such, never as measured, validated or issued.
- Harvest and credit application are annual per cohort. Nothing should imply volume can be pulled forward at will.
- Visual led, with as little copy as possible. A sentence needed to explain what a mark means is a sign the mark wants changing rather than annotating.
- Volumes are the purchaser's share.
- No price commentary.
- Project and module references rather than property or landholder names.
- Dark surface, consistent with the rest of the console. `#7f9c18` olive and `#3987e5` blue are the validated area fills; `#cdfd29` lime is stroke, marker and low opacity fill only.

## Yours to decide

Proportion, grid, type, colour, motion, chart forms, whether the level is a matrix or something else entirely, how exceptions surface, how a reader enters and leaves a module, what the level does at two modules rather than ten, and what it is called.

Where something already in the build does one of these jobs better than what is described here, keep yours and say so.
