# Claude Design Master Prompt — Grazing Infrastructure Planner (demo build)

**Use:** claude.ai/design → new project `HORIZON Profile — Grazing Infrastructure Planner`.
**Attach before pasting:** `demo_bundle.json` (from prep_demo_data.py on the chosen property), both Hobbs docs, the HORIZON Analysis screenshot, 2–3 farm map draw tool screenshots (interaction style).
**Consolidates:** v2 §5 master prompt + v3 §4 phasing + v3 §9/§10 demo staging. This file is the one to paste.

---

```
Build an interactive web tool: "HORIZON Profile — Grazing Infrastructure
Planner" for AgriProve, an Australian soil carbon company. Read the attached
"infrastructure_planning_principles" document first — it is the rule engine.
The attached demo_bundle.json contains a REAL property: parcels ranked
hottest→coldest with precomputed equal-area cell splits for every cell count
N=2..12. NEVER compute geometry — always render the precomputed cells and
fences for the selected parcel and N. The slider swaps geometries instantly.

CONTEXT OF USE: This runs post-snapshot — the farmer has already received
their HORIZON Profile. An AgriProve team member (usually Hobbs) drives it
beside the farmer in a follow-up conversation, laptop or tablet. Positioning:
this is the next evolution of our farm map draw tool. Interaction bar: a
10-year-old could drive it. Big targets, one idea per screen. Tone: warm,
plain-spoken, confident. Say "hottest country / coldest country" and
"productivity" — never acronyms, never "SOC". It should feel like a
choose-your-own-adventure for the farm, not a report.

THEME — LIGHT, exact hex values, no substitutions:
- Page background #F4F6F8 · Card surface #FFFFFF · Card hover #F0F4F0
- Primary text #1A2B3C · Muted text #6B7C8D
- Primary accent #2D6A4F (buttons, active states, key numbers)
- Success #34D399 · Warning #F59E0B · Error #EF4444 · Border #E2E8F0
- Font: Inter, system-ui, sans-serif · Cards radius 8px, 1px #E2E8F0 border
Map layers (match HORIZON Analysis):
- Heat map base: red→green gradient render (use bundle parcel scores to tint
  parcels as a stand-in if no raster image is attached)
- Band overlays: hot #2D6A4F, mid #F59E0B, cold #C2703D (translucent 40%)
- Proposed fencelines: dashed #1A2B3C with drag handles; confirmed: solid #2D6A4F
- Recovery cell (recovery_cell_index in bundle): hatched overlay + label
  "recovery cell — weakest core, rests first"

FLOW — 6 steps, persistent progress dots, back always available:

1. MEET YOUR COUNTRY. Full-bleed map of the bundle property (name + total ha
   in header). Parcels tinted by score; toggle "Show my bands" (hot/mid/cold).
   Copy: "This is your country, measured — not guessed. The hottest country
   grows the most. The coldest has the most to gain."

2. WHERE WOULD YOU START? — the instinct test. Prompt: "If you were building
   fences tomorrow, which paddock would you start with? Tap it." If they tap
   a COLD parcel (most will): don't block — show it honestly. A card slides
   in: "That's everyone's instinct — fix the worst first. Watch what happens."
   Brief animation: rest gauge underperforming, caption "the forage base
   can't carry the load yet." Then: "Here's the order your country asks for"
   → parcels re-rank hottest first with the WHY card: more cells on strong
   country → longer rest everywhere → more feed → the gain funds the next
   fence — and your best country does free work on your worst before you
   spend a dollar there. If they tap a HOT parcel first: celebrate it —
   "You're ahead of most. Here's why that's right."

3. SUBDIVIDE — the hero screen. Stage-1 hot parcel pre-selected (any parcel
   selectable). CELL COUNT slider 2→12 renders that parcel's precomputed
   cells + fences from the bundle. Every fence dashed with drag handles
   (drag-to-adjust enabled on this hero parcel; other parcels view-only).
   Copy: "These lines are a starting point. You know your country — move
   them." LIVE READOUT (right panel): "Rest per cell: ~N days" = (total
   cells in rotation − 1 mob) × graze days (default 3, adjustable chip),
   badged "indicative". Gauge sweeps toward the 60–120+ day GREEN ZONE and
   clicks green inside it: "At 60–120+ days, recovery is built into your
   fences — not your willpower." Property-wide cell count + rest figure
   accumulate in the header as more parcels are subdivided.

4. THE REST BLOCK. Map shades 20–30% of the property — coldest parcels
   first (recovery cells highlighted). Copy: "Your most run-down country
   rests first — it has the most to gain. Full growing season. No grazing.
   Not once. Let it go rank and seed — that's the point. Clear it after it
   browns off." Include the "What if I graze it just once?" button →
   consequence animation: the paddock's season resets, gauge drops, caption
   "one pass costs the season." Small rotation diagram: every paddock rests
   fully every 3–4 years.

5. PLAY IT FORWARD. Timeline with PLAY: three phases in fixed order —
   ESTABLISHMENT (yrs 1–3, indicative): hot parcels subdivide to max cells,
   30–50% of coldest country designated rest block. EXPANSION (yrs 4–6):
   mid parcels join, rest block becomes rolling 20–30%. MATURITY (yrs 7–10):
   rest is structural; coldest cores may double-rest; the flywheel cycles.
   PACE slider (Steady / Solid / Flat out) stretches or compresses the year
   labels — order NEVER reorders; years are badged "indicative — your
   capital, your seasons". Below: two-line carrying-capacity chart — fast
   line lifts early and plateaus; durable line climbs slowly and overtakes
   by Maturity. At Maturity, a wry beat: the property beside next door's —
   "the neighbours will say it was the rain."

6. YOUR PLAN. Summary card: their sequence, cell counts per parcel, rest
   rotation, indicative rest-days — titled with the property name and "built
   by you". Actions: "Save my plan" (clean printable one-pager view) and
   "Talk to us about your baseline". Closing line: "The order is the
   science. The pace is your capital. The lines are your call." Small print:
   "Indicative planning guide. Every fencing, water and stocking decision
   is yours." [NOTE TO BUILDER: no soil-carbon-eligibility claims on screen
   — that beat is delivered verbally until method wording is verified.]

CONSTRAINTS:
- Precomputed geometry only — read cells/fences/areas from demo_bundle.json.
- THE LOGIC RULE (foundational): every line shown has already passed
  buildability checks (contiguous cells, >=120 m working width, aspect
  <=6:1, >=6 ha). The cell slider must offer ONLY the N values present in
  that unit's splits — they may be sparse (e.g. 2,3,5) and that is
  deliberate: missing N values were unbuildable. Show each scenario's
  "new fence: ~X km" from splits[n].logic.fence_m. Units with no splits
  render view-only with the note "subdivision here needs local knowledge
  — sketch it with your agent".
- Order hard-coded hottest→mid→coldest; pace is the only time variable; no
  fixed calendar years pinned to phases.
- Every recommendation carries its one-line WHY beside it.
- Fencelines always indicative + adjustable, never locked. No terrain or
  water routing claims. Water points: indicative icons at fence junctions only.
- No stock prescriptions; graze-days chip is the user's estimate for the
  arithmetic only.
- 1440×900 and tablet landscape first-class; hero content above the fold.
- Realistic Australian pastoral voice; no lorem ipsum anywhere.
```

## Iteration prompts (run one at a time after first generation)

1. "Make proposed fencelines feel like suggestions — hand-drawn dash style; dragging snaps softly to parcel edges."
2. "On completing Stage 1, animate the cold parcels warming slightly: 'your best country is already doing free work down here.'"
3. "Add one 'even if you never work with us' takeaway per step."
4. "Review as a sceptical 60-year-old grazier told his whole life to fix the worst paddocks first. Strengthen the moments where he'd stop trusting it."
5. "Show the empty state (no bundle loaded) and a uniform-productivity property (weak gradient)."
