# Grazing & Infrastructure Scenario Tool — Claude Design Build Guide

**Date:** 2026-07-08
**Author:** Cowork (for Dylan)
**Source:** Granola meeting "Grazing management insights via snapshots" (2026-07-08, meeting ID e29d2cb6-84f0-4ec7-b460-e551f5716a92)
**Status:** Draft v1 — ready for Dylan to run in Claude Design
**Related:** Snapshot v2 action item (build grazing management + infrastructure plan section); HORIZON Profile rename candidate

---

## Part 1 — Tooling recommendation

### The chain

| Stage | Tool | Why |
|---|---|---|
| Prototype + field presentation (now) | **Claude Design** (claude.ai/design) | Interactive prototype from conversation; heat map images attach as context; share link for team; **standalone HTML export** for offline/iPad field use; PPTX export for decks; design-system import keeps it on-brand |
| Validated → production | **Handoff to Claude Code** (built into Claude Design export) | Bundles design files + chat + intent; lands in the Frontier/Snapshot codebase (React + Chakra) with components understood, not reinterpreted from screenshots |
| Production home | **Snapshot v2 / HORIZON Profile** | This is already your action item from the 08 Jul meeting. The prototype becomes the grazing section spec, not a parallel product |

### Why Claude Design fits this job [high]

- Chat + canvas iteration; refine via inline comments and direct canvas edits — fast enough to generate 2–3 scenario layouts and compare
- Accepts screenshots/images as project context → real HORIZON heat maps go straight in
- Exports: share link (view/comment/edit), standalone HTML, PDF, PPTX, handoff to Claude Code
- Web + desktop only, beta. For in-paddock use with no signal: export standalone HTML and open locally on the iPad/laptop. Test this before a farm visit — it is the deployment lesson from today's field test (wrong link + VPN killed all submissions; the tool itself held up)

### The real-heat-map question (per-property data) — three tiers

You chose real heat maps per property. A Claude Design prototype is frontend-only, so:

1. **v1 — per-farm context attach [high, recommended start]:** before a visit, attach that farm's heat map export (PNG/screenshot from Frontier GeoMapper) to the Claude Design project and ask it to re-skin the planner around it. 5 minutes of prep per farm. Zones are traced by Claude from the image as translucent bands — matching the finding from your colleague's prototype thread: **boundary zones around productivity bands work; drawn fence lines were a "horrible failure"**. Never ask it to draw fences.
2. **v1.5 — in-tool image upload with auto-banding [moderate — needs a spike]:** the HORIZON colour ramp is known, so client-side pixel classification (canvas API) can band an uploaded heat map into high/mid/low automatically. Feasible in a prototype; ask Claude Design for it as a stretch iteration, keep manual zone adjustment as fallback.
3. **Production — server-side raster → vector zoning [this is the Snapshot v2 work]:** proper banding of the HORIZON raster into zone polygons (GDAL/turf-style classification) rendered on the platform map stack. That's a backend ticket, not a prototype feature. Scope it with the agriprove-backend context when you write the Snapshot v2 PRD.

**[ASSUMPTION]** Heat map exports exist as images only; no zone-polygon (GeoJSON) export from HORIZON today. If a raster/GeoJSON export already exists, tier 3 gets cheaper — confirm with Cadel.

### Landscape check (why this is differentiated) [high]

AgriWebb (~25% of Australia's grazing animals managed; Cibo Labs PastureKey satellite feed integration), MaiaGrazing (now legacy under Atlas Ag), Cattlytics, P2PAgri, EverGraze, FARMap — all plan rotations from farmer-drawn paddocks and feed-on-offer estimates. **None start from a proprietary soil-carbon productivity map and derive the infrastructure plan from it.** Leading with "where to build, in what order, and why — evidenced by your soil" is unoccupied ground. It also reinforces the strategic reframe from today's meeting: management as the product, soil carbon as the evidence base.

---

## Part 2 — Claude Design build guide

### Setup (before the first prompt)

1. Go to **claude.ai/design** → new project. Name: `HORIZON Profile — Grazing & Infrastructure Planner`.
2. **Attach context:**
   - 2–3 HORIZON heat map exports (use a PII-generalised property for the default build; real farm maps attach per visit)
   - The zone-banding screenshots from your colleague's Claude prototype thread (the one being shared with you) — "zones like this, never fence lines like that"
   - Optional: link the Farmer Platform component directory via `/design-sync` from Claude Code so it builds with real Chakra components. **[ASSUMPTION]** org design system not yet set up in Claude Design — the token block below covers you either way.
3. Paste the **master prompt** below. Then iterate incrementally — Claude Design responds best to "core layout first, then layer interactions" (per Anthropic's own guidance).

### Master prompt (paste-ready)

```
Build an interactive, presentation-ready web tool called "HORIZON Profile —
Grazing & Infrastructure Planner" for AgriProve, an Australian soil carbon
company.

WHO USES IT: An AgriProve team member drives it on a laptop or tablet sitting
beside a livestock farmer. The farmer watches the screen. Every element must
be readable at arm's length and self-explanatory. Tone: confident, warm,
plain-spoken, farmer-first. No agronomy jargon, no acronyms, no corporate
language. Where a term is needed, say "productivity" and "soil carbon" —
never "SOC" or model names.

WHAT IT DOES: Takes this farm's productivity heat map (image provided as
context) and shows the farmer how a 10-year fencing and water infrastructure
plan falls out of their productivity zones. It recommends WHERE to act and in
WHAT ORDER — never how to farm. The farmer decides fence lines, water point
placement, stock numbers and timing. We show the structural logic. This
distinction must be visible in the copy on every screen.

THEME — LIGHT, exact hex values, no substitutions:
- Page background:      #F4F6F8
- Panel/card surface:   #FFFFFF
- Card hover:           #F0F4F0
- Primary text:         #1A2B3C
- Muted/label text:     #6B7C8D
- Primary accent:       #2D6A4F (dark green — buttons, active states, key numbers)
- Success green:        #34D399
- Warning amber:        #F59E0B
- Error red:            #EF4444
- Border:               #E2E8F0
- Font:                 Inter, system-ui, sans-serif
- Cards: radius 8px, 1px #E2E8F0 border, 16px/20px padding
- Header bar: white, 56px, 1px bottom border
Zone overlay colours (translucent, 40% opacity over the map):
- High productivity:    #2D6A4F
- Moderate:             #F59E0B
- Building (lowest):    #C2703D

FLOW — 5 screens, linear with a persistent step indicator:

1. WELCOME + FARM TYPE. One question, three large tappable cards:
   "What best describes your operation?" → Grazing / Mixed cropping &
   grazing / Cropping only. Grazing or Mixed continues. Cropping only gets a
   friendly card explaining grazing insights don't apply to their operation,
   with a "keep me posted" action — no dead end.

2. YOUR FARM'S PRODUCTIVITY MAP. Map panel left (~65% width) showing the
   provided heat map image with the property boundary. A "Show my zones"
   toggle overlays three translucent productivity bands (high / moderate /
   building) traced around the heat map's colour bands — organic zone
   shapes, NOT straight lines, NOT fence lines. Right panel: three short
   plain-language sentences on what the map shows and one key stat card
   ("Your most productive country: ~X% of the property"). Legend pinned
   bottom-left of the map.

3. YOUR 10-YEAR PLAN — the hero screen. A large phase slider across the
   top: Years 1–3 / Years 4–6 / Years 7–10. Sliding animates the map:
   - Years 1–3: highest-productivity zones pulse with a "subdivide" hatch
     pattern; lowest zones show a "resting" pattern. Caption: "Subdivide
     your best country. Rest your most tired country — a full season."
   - Years 4–6: the middle band lights up. Caption: "Move down the ranks:
     next tier of subdivision, next tier of rest."
   - Years 7–10: rotation arrows cycle across all zones. Caption: "The
     whole property cycling. The flywheel is running."
   Under the map, each phase shows four short columns: WHAT TO DO /
   WHY IT WORKS / WHAT YOU DECIDE (fence lines, water points, timing,
   stock) / WHAT YOU GET.

4. THE PRINCIPLES. Four cards, one line of heading + two lines of body each:
   1) Rest your least productive country first — a full growing season.
      That's where each dollar of rest works hardest.
   2) Subdivide your best country — cycle it fast, grow more feed, and
      build carbon at the same time.
   3) Rotate the rest across the property year on year.
   4) One move, two payoffs: more feed off your best country, durable
      carbon in your resting country.

5. WHAT HAPPENS NEXT. Summary card of their phase-1 zones, a note that
   their AgriProve contact will leave this profile with them, and a single
   primary action: "Talk to us about your baseline". Include a small print
   line: "This plan shows where to start. Every fencing, water and stocking
   decision on this property is yours."

INTERACTIONS: phase slider animates zones; zone toggle on/off; farm-type
gate switches variants; hovering any zone shows its share of the property.
Keep every interaction obvious enough that a farmer could drive it
unaided — big targets, no hidden gestures.

CONSTRAINTS:
- 1440×900 desktop and tablet landscape both first-class; above-the-fold
  hero content on every screen without scrolling
- NEVER draw fence lines, paddock boundaries within zones, or suggest
  stock numbers, grazing durations or animal placement anywhere
- Zones are organic translucent bands around productivity areas only
- No login, no data entry beyond the farm-type question
- Realistic Australian pastoral data (e.g. "Howson Station", 4,800 ha) —
  no lorem ipsum
```

### Iteration prompts (after first generation)

Run these one at a time; review between each.

1. **Zone fidelity:** "Trace the zone bands more tightly around the heat map's actual colour regions — the shapes should visibly derive from the map, not look like abstract blobs placed on top."
2. **The flywheel:** "On the Years 7–10 phase, add a slow rotation animation cycling the rest pattern across zones year by year, with a small year counter. It should feel like the property breathing."
3. **Farm-type variants:** "Show me the Mixed cropping & grazing variant — same flow, but screen 2 lets the presenter mark cropped country as excluded from the grazing plan (greyed out, not deleted)."
4. **Value density (the non-converter test):** "Add one 'even if you never work with us' insight per screen — something the farmer can act on regardless. This tool should impress farmers who don't convert." (Direct from today's meeting goal.)
5. **Per-farm re-skin (repeat per visit):** "Replace the property heat map with the attached image for [property name], re-trace the three zones, and update the property stats."
6. **Edge cases before handoff:** "Show the empty state (no heat map yet), a low-contrast heat map (uniform property), and a very small property (<500 ha) where subdivision advice may not hold."
7. **Ask for critique:** "Review this as a sceptical 60-year-old grazier seeing it cold. Where would he stop trusting it?"

### Quality checklist (before any farmer sees it)

- [ ] All light theme; accent is #2D6A4F throughout; Inter font
- [ ] Zero prescriptive content: no fence lines drawn, no stocking rates, no grazing durations, no animal numbers
- [ ] Zones read as derived-from-the-map, not decoration
- [ ] Copy passes the jargon test: no SOC, no ACCU on-screen without plain-language framing, no internal product names except HORIZON Profile
- [ ] "You decide / we show where to start" framing present on screens 2, 3 and 5
- [ ] Farm-type gate works; cropping-only exit is graceful
- [ ] Phase slider works on tablet touch
- [ ] Standalone HTML export opens and runs offline (field-test this — today's rollout failure mode)
- [ ] Demo property is PII-generalised; real farm maps only in per-visit sessions

### Handoff (when validated)

Export → **Handoff to Claude Code** → point it at the Snapshot v2 codebase. The bundle carries design files + chat reasoning, so the "zones not fences" and "principles not prescriptions" decisions travel with it. The prototype then becomes the working spec for the Snapshot v2 grazing section (your existing action item), where zone extraction moves server-side.

---

## Open items for Dylan

1. Confirm heat map export format (image only vs raster/GeoJSON) with Cadel — determines tier-2/3 effort. **[ASSUMPTION: image-only today]**
2. Review the colleague's Claude prototype thread before the first Claude Design session; attach its zone screenshots as context.
3. Name check: guide uses "HORIZON Profile" per today's meeting (Kieren + Matthew aligned) — not yet a formal decision. Supersede here if the rename lands differently.
4. Is the org design system set up in Claude Design? If yes, skip the token block and attach the system instead.

## Sources

- Granola: "Grazing management insights via snapshots", 2026-07-08 (meeting e29d2cb6-84f0-4ec7-b460-e551f5716a92) — principles, 3-phase plan, zones-not-fences finding, farm-type qualifier, value-density goal
- [Get started with Claude Design — Claude Help Center](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) — capabilities, exports, limitations (fetched live 2026-07-08)
- [Using Claude Design for prototypes and UX — claude.com](https://claude.com/resources/tutorials/using-claude-design-for-prototypes-and-ux) — prompting patterns, codebase linking, Claude Code handoff (fetched live 2026-07-08)
- agriprove-design skill `references/tokens.md` — light theme token set (farmer-facing surface rule)
- Landscape: [AgriWebb](https://www.agriwebb.com/solutions/grazing-management/), [MaiaGrazing / Atlas Ag](https://atlasag.com/maiagrazing), [Cattlytics](https://www.cattlytics.com/au/farm-mapping-software/), [P2PAgri](https://p2pagri.com.au/features/farm-mapping), [FARMap](https://farmap.com.au/) (searched 2026-07-08)
