# Grazing Infrastructure Planner — Claude Design Build Guide (v2)

> **SUPERSEDED 2026-07-08 (same day) by [v3](2026-07-08-grazing-scenario-tool-claude-design-guide-v3.md).** v3 wraps this in the two-surface architecture Dylan asked for (static Snapshot insight section + live link to this interactive tool) and renames the play-forward phases to Hobbs's Establishment/Expansion/Maturity. **This file's master prompt (§5) is still the canonical interactive-tool spec — v3 carries it forward with one phase-naming amendment (v3 §4).**

**Date:** 2026-07-08
**Author:** Cowork (for Dylan)
**Supersedes:** [v1](2026-07-08-grazing-scenario-tool-claude-design-guide.md) — same day. v1's "never draw fence lines" constraint is retired; v1's fixed year-band phasing (Y1–3/4–6/7–10) is corrected to stage-based sequencing per Hobbs's logic guide.
**Sources:** Hobbs — `infrastructure_planning_principles.docx` (the rule engine); HORIZON Analysis screenshot (Carbon Zones + Carbon Gradient layers); Granola meeting 2026-07-08 (e29d2cb6); Dylan's scope decisions this session (fencelines = propose + adjust; rest maths = live simple model)
**Status:** Ready to run in Claude Design

---

## 1. What changed from v1

| v1 said | v2 says | Why |
|---|---|---|
| Zones only, never draw fence lines | **Tool proposes indicative fencelines; user adjusts every line** | Dylan's decision. The earlier failure was freehand drawing over an image; rule-based generation from paddock + zone geometry is tractable. Hobbs's "surface don't prescribe" is satisfied by the adjust loop |
| Fixed phases: Years 1–3 / 4–6 / 7–10 | **Stages 1–3 in fixed ORDER; pace is a user slider** | Hobbs: "the sequence is fixed in order, not in time… treat order as the invariant and let the user vary the pace" |
| Zones derived by tracing heat map colours | **Zones already exist as product layers**: Strength / Reference / Opportunity + Carbon Gradient, with paddock boundaries (per HORIZON Analysis screenshot) | Removes the zone-derivation problem entirely for the prototype |
| Passive presentation, team drives | **Choose-your-own-adventure**: farmer/team pulls the cell-count lever, sees rest-days respond live, picks their own pace | Dylan's brief: model on the farm map draw tool — "a 10-year-old should be able to use it" |
| Static principles cards | **Rule engine encoded in the tool** (Hobbs Part 1 + Part 2), with the justification layer attached to every recommendation | Hobbs: "show the return, or the spend looks arbitrary" |

Tooling chain unchanged from v1 [high]: Claude Design (prototype + field presentation) → handoff to Claude Code → production home Snapshot v2 / HORIZON Profile. Landscape differentiation unchanged (see v1 §Part 1).

---

## 2. The rule engine (what the tool must encode)

This is the distilled logic from Hobbs's guide. It goes into the Claude Design project as an attached document AND is summarised in the master prompt so behaviour, not just copy, follows it.

**Sequencing (Part 1):**
- S1. Capital follows the productivity gradient hottest → coldest. Subdivide the hottest paddocks first. This is deliberately counterintuitive; the tool must defend it on-screen, not just assert it.
- S2. Each paddock goes to maximum practical cell count before capital moves on. Partial subdivision ≈ half the benefit.
- S3. Cell count is THE lever. Rest-days per cell = f(cell count, stocking rate). Steering target: 60–120+ day rest as the structural default.
- S4. In the coldest paddocks, proposed fencelines follow internal gradient boundaries, isolating the weakest cores into dedicated recovery cells.
- S5. Subdividing strong country intensifies the whole rotation, which pre-conditions the cold country before any fence is built there (the "free work" mechanism — a great on-screen moment).

**Rest (Part 2 — the justification layer):**
- R1. Coldest paddocks rest first and longest — highest marginal return off the lowest base.
- R2. Full-season rest is absolute. One growing-season graze resets the paddock's year.
- R3. Full life cycle: grow, seed, hay off. "Rank" is the objective.
- R4. Clear the rest block only in the non-growing season (protein supplement makes it commercial).
- R5. Rolling rest block: 20–30% of property resting at any time; every paddock rests every 3–4 years. Carrying capacity compounds; fast signal years 1–3, durable signal years 5–10.

**Hard constraints (Hobbs's "lines the tool must not cross"):**
- Order hard-coded; pace user-controlled. Never the reverse.
- Heat map is the input, not decoration — every recommendation is a function of gradient position.
- Every WHERE is paired with a WHY.
- Recommend-and-reveal, decided deliberately: tool proposes, grazier adjusts, nothing locks.
- Timelines and rest parameters are environment-keyed indicative ranges, not constants; be honest where evidence is contextual (arid country shifts everything).

---

## 3. Data + vocabulary for the prototype

From the HORIZON Analysis output (screenshot attached to session):
- Layers that already exist: **Farm Boundary, Eligible Area, Strength Zones, Reference Zones, Opportunity Zones, Carbon Gradient** (legend "less ↔ more", e.g. "Soil organic carbon · avg 36 t/ha"), with visible paddock boundaries.
- Prototype uses this vocabulary. Gradient language for farmers: **hottest / coldest country** (Hobbs's terms — farmer-legible). Zone names can surface as Strength / Reference / Opportunity since they're already product language.
- **[ASSUMPTION]** zones + paddock boundaries exist as vectors in the platform (they render as crisp polygons). If true, production fenceline generation operates on real geometry. Confirm with Cadel — this is now the single most important data question.
- Prototype approach: bake in ONE property traced from a real HORIZON Analysis export (PII-generalise the name), with paddock polygons and per-paddock gradient rank hand-encoded. Per-visit re-skin stays possible by attaching that farm's export.

---

## 4. Claude Design setup

1. claude.ai/design → new project: `HORIZON Profile — Grazing Infrastructure Planner`.
2. Attach: (a) Hobbs's `infrastructure_planning_principles.docx` verbatim; (b) the HORIZON Analysis screenshot(s) — zones + gradient; (c) 2–3 screenshots of the existing **farm map draw tool** for interaction style ("build the drawing/adjusting interaction to feel like this"); (d) optionally `/design-sync` the Farmer Platform Chakra components from Claude Code.
3. Paste the master prompt. Iterate incrementally.

---

## 5. Master prompt (paste-ready)

```
Build an interactive web tool called "HORIZON Profile — Grazing
Infrastructure Planner" for AgriProve, an Australian soil carbon company.
Read the attached document "infrastructure_planning_principles" carefully
first — it is the rule engine this tool encodes. The attached HORIZON
Analysis screenshot shows the real map layers this tool builds on.

WHO USES IT: An AgriProve team member or the farmer themselves, on a laptop
or tablet, often sitting together. Interaction bar: a 10-year-old could
drive it. Big targets, obvious controls, one idea per screen. Tone: warm,
plain-spoken, confident. Say "hottest country / coldest country" and
"productivity" — never acronyms. It should feel like a choose-your-own-
adventure for the farm, not a report.

WHAT IT DOES: Shows the farmer their HORIZON productivity heat map, then
lets them subdivide their property their way — the tool proposes indicative
fencelines from the rules, computes the rest-period payoff live, and plays
the build-out forward over time at a pace the farmer chooses. It recommends
where and in what order; the farmer adjusts everything; nothing locks.

THEME — LIGHT, exact hex values, no substitutions:
- Page background #F4F6F8 · Card surface #FFFFFF · Card hover #F0F4F0
- Primary text #1A2B3C · Muted text #6B7C8D
- Primary accent #2D6A4F (buttons, active states, key numbers)
- Success #34D399 · Warning #F59E0B · Error #EF4444 · Border #E2E8F0
- Font: Inter, system-ui, sans-serif
- Cards radius 8px, 1px #E2E8F0 border · Header 56px white
Map layer colours (match the attached HORIZON Analysis screenshot):
- Carbon Gradient: red→green ramp, legend "less ↔ more"
- Strength Zones #2D6A4F at 55% · Reference Zones #7BC496 at 45% ·
  Opportunity Zones #E8833A at 55% · Farm boundary red outline ·
  Paddock boundaries thin dark lines
- Proposed fencelines: dashed #1A2B3C, drag handles at vertices;
  user-confirmed fencelines: solid #2D6A4F

DEMO PROPERTY: Build one realistic Australian grazing property (~4,800 ha,
name it "Yarranlea Station") with 9 paddocks based on the attached
screenshot's shapes: 3 hot paddocks (high productivity), 4 mid, 2 cold.
Encode a per-paddock productivity rank 1–9.

FLOW — 6 steps, persistent step indicator, back always available:

1. MEET YOUR COUNTRY. Full-bleed map: Carbon Gradient heat map inside the
   farm boundary, paddock boundaries on top. Layer toggle: Gradient ↔
   Zones (Strength / Reference / Opportunity). One line of copy: "This is
   your property's productivity, measured — not guessed. The hottest
   country grows the most; the coldest has the most to gain."

2. TWO DIALS. (a) Rough stocking rate — a coarse slider pre-set to a
   sensible default for the property size, labelled "close enough is
   fine"; (b) Country type: Temperate / Semi-arid / Arid — shifts rest
   parameters (rest every 3–4 yrs temperate, longer in arid; defoliation
   every 1 yr vs 2). Both adjustable any time from a persistent corner
   chip.

3. THE ORDER (the counterintuitive reveal). Paddocks rank themselves
   hottest → coldest with an animation. Three stage cards: STAGE 1 —
   your hottest paddocks. STAGE 2 — your middle country. STAGE 3 — your
   coldest paddocks, last. Then a "Why start with my BEST country?" card
   that answers it: more cells on strong country → longer rest everywhere
   → more feed → the gain funds the next stage. And: the intensified
   rotation puts more even impact and manure on your coldest paddocks
   before you spend a dollar there — "your best country does free work on
   your worst." Order is fixed; everything else is yours.

4. SUBDIVIDE — the hero screen. The Stage 1 hot paddock is pre-selected
   (user can pick any paddock; picking out of order shows a gentle "the
   order matters — here's why" note, never a block). A CELL COUNT slider
   (2 → 12) is the main control. As it moves, the tool draws indicative
   fencelines splitting the paddock into that many cells — perpendicular
   to the long axis by default, and where the paddock contains a gradient
   boundary (esp. cold paddocks), lines follow the zone edge so the
   weakest cores become their own recovery cells. Every line is dashed
   with drag handles: drag to move, tap to delete, draw your own. Copy:
   "These lines are a starting point. You know your country — move them."
   LIVE READOUT panel (right): "Rest per cell: ~N days" computed as
   (cells − 1) × graze days per cell from the stocking dial, clearly
   badged "indicative". A gauge sweeps toward the 60–120+ day target
   band and goes green inside it: "At 60–120+ days of rest, recovery is
   built into your fences — not your willpower." Repeat for as many
   paddocks as the user wants; a property-wide cell count and rest figure
   accumulates in the header.

5. THE REST BLOCK (the payoff). The map shows 20–30% of the property
   shaded as the rolling rest block, starting with the coldest paddocks.
   Copy: "Your most run-down country rests first — it has the most to
   gain. Full growing season, no grazing, not once. Let it go rank and
   seed — that's the point, not a problem. Clear it after it browns off."
   Add a "What if I graze it just once?" button: tapping it shows the
   consequence — the paddock's season resets, the gauge drops. Fun, and
   it teaches R2 better than a paragraph. A small rotation diagram shows
   every paddock passing through a full-season rest every 3–4 years.

6. PLAY IT FORWARD. A timeline with a PLAY button animates the build-out
   stage by stage: fences appear, the rest block rolls, and a carrying-
   capacity curve climbs — quick lift early (years 1–3), the durable
   climb behind it (years 5–10), both labelled indicative. A PACE slider
   (Steady / Solid / Flat out) stretches or compresses the timeline —
   the order never changes, only the speed. Closing card: "The order is
   the science. The pace is your capital. The lines are your call."
   Actions: "Save my plan" (summary view of their choices: sequence,
   cell counts per paddock, rest rotation, indicative rest-days) and
   "Talk to us about your baseline". Small print: "Indicative planning
   guide. Every fencing, water and stocking decision is yours."

CONSTRAINTS:
- Order hard-coded (hottest → mid → coldest); pace is the only time
  variable. Never render fixed calendar years against stages.
- Cell count is the central lever; rest-days is its visible consequence.
- Every recommendation carries its one-line WHY next to it.
- Fencelines: always indicative, always adjustable, never locked. No
  terrain/water routing claims — straight indicative splits + gradient-
  boundary follows only.
- No stocking prescriptions: the stocking dial is the user's estimate,
  used only for the rest arithmetic.
- 1440×900 desktop and tablet landscape first-class; hero content above
  the fold on every step; touch-friendly drag handles.
- Realistic Australian pastoral data throughout; no lorem ipsum.
```

---

## 6. Iteration prompts

1. **Fenceline feel:** "Make the proposed fencelines feel like suggestions, not commitments — slightly hand-drawn dash style, and when the user drags one, snap candidates to paddock edges and zone boundaries with a soft magnet."
2. **The free-work moment:** "On Stage 1 completion, animate the cold paddocks subtly improving (colour warming a touch) with the caption 'your best country is already doing free work down here' — make the S5 mechanism visible."
3. **Out-of-order exploration:** "If the user subdivides a cold paddock first, show the consequence honestly: the rest gauge underperforms and a card explains the forage base can't carry the density yet. Choose-your-own-adventure includes the wrong turn — never block, always show."
4. **Arid variant:** "Switch the demo to a semi-arid property: longer rest cycle, defoliation every two years, adjusted copy. Show me both side by side."
5. **Value density:** "Add one 'even if you never work with us' takeaway per step — something the farmer can act on regardless." (Meeting goal: impress non-converters.)
6. **Farm-type gate (from v1, still required):** "Add the intake question — Grazing / Mixed / Cropping only — with a graceful cropping-only exit."
7. **Sceptic pass:** "Review as a sceptical 60-year-old grazier who's been told to fix his worst paddocks first his whole life. Where does he stop trusting the tool? Strengthen those moments."
8. **Edge cases before handoff:** "Show: property with uniform productivity (weak gradient), a 2-paddock small property, and the empty state before a heat map loads."

---

## 7. Quality checklist

- [ ] Light theme, #2D6A4F accent, Inter throughout; map layers match HORIZON Analysis palette
- [ ] Order invariant / pace variable respected — no calendar years pinned to stages anywhere
- [ ] Cell-count slider drives a live, visibly-indicative rest-days readout steering to 60–120+
- [ ] Every recommendation shows its WHY (justification layer present on steps 3–6)
- [ ] All fencelines dashed/adjustable until user confirms; nothing locks; no terrain/water claims
- [ ] R2 is protected: the "graze it once" interaction shows the season reset
- [ ] Copy: no acronyms; hottest/coldest country language; "indicative" on all numbers; "every decision is yours" on close
- [ ] Environment toggle shifts rest parameters (temperate vs arid)
- [ ] Works on tablet touch; drag handles ≥44px targets
- [ ] Demo property PII-generalised; real farm exports only in per-visit sessions
- [ ] Standalone HTML export runs offline — field-test before any farm visit (the 08 Jul rollout lesson)

---

## 8. Handoff + open items

**Handoff:** Export → Handoff to Claude Code → Snapshot v2 codebase. The rule engine (§2) travels as the spec; production fenceline generation moves onto real zone/paddock vectors.

**Open items for Dylan:**
1. **Vector confirmation with Cadel** — do Strength/Reference/Opportunity zones + paddock boundaries exist as polygons? Determines whether production fenceline proposal is geometry ops (cheap) or requires raster work first. **[ASSUMPTION: vectors exist]**
2. Stocking-rate default