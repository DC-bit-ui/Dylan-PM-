# HORIZON Grazing Insight — Two-Surface Build Guide (v3)

**Date:** 2026-07-08
**Author:** Cowork (for Dylan)
**Supersedes:** [v2](2026-07-08-grazing-scenario-tool-claude-design-guide-v2.md) — same day. v2's interactive-tool spec is carried forward largely intact (§4 below notes the one change). v3 adds the surface Dylan actually asked for: a **static insight section inside the Snapshot** that teases the concept and links out to the **live interactive tool**.
**Sources:** Hobbs — `paddock_planning_principles.docx` (the deep science + the Establishment/Expansion/Maturity phasing) and `infrastructure_planning_principles.docx` (the abstracted rule engine); HORIZON Analysis screenshot; Granola 2026-07-08 (e29d2cb6); Dylan's scope this session.
**Status:** Ready to build

---

## 1. The architecture Dylan asked for

Two surfaces, one concept, a link between them:

```
  ┌─────────────────────────────────┐        ┌──────────────────────────────────┐
  │  SURFACE A — SNAPSHOT INSIGHT     │  link  │  SURFACE B — INTERACTIVE PLANNER  │
  │  (static, embedded in HORIZON     │  ───▶  │  (live tool, opens on THEIR farm) │
  │   Profile)                        │        │                                  │
  │  • one hero scenario image        │        │  • their heat map as base layer  │
  │  • the principles as education    │        │  • subdivide / propose fencelines│
  │  • "why carbon" framing           │        │  • live rest-days maths          │
  │  • CTA: "Plan this on your farm →"│        │  • play forward: Establishment → │
  │                                   │        │    Expansion → Maturity          │
  └─────────────────────────────────┘        └──────────────────────────────────┘
        teaches + intrigues                          lets them act on it
```

The Snapshot section does the **education** job the 08 Jul meeting flagged as missing ("farmers don't understand why carbon matters"). The live tool does the **utilisation** job. The link is the conversion moment between them.

---

## 2. Surface A — the Snapshot insight section

Goes into Snapshot v2 / HORIZON Profile as a self-contained section. Static (renders in an automated report), no interactivity beyond the outbound link.

### Layout (top to bottom)

1. **Section header:** "From measurement to management" (or similar). One line: "Your HORIZON map doesn't just measure your soil carbon — it shows you where to build."

2. **Hero scenario image.** A single rendered illustration: a heat map with an example infrastructure/grazing scenario laid over it — subdivided hot zone, a rest block on the cold zone, laneways/water points as icons. This is the "picture of the idea". See §5 for the generic-vs-personalised decision — **v1 = one beautifully-designed generic example; personalised-to-this-farm is a fast-follow once the tool logic exists** [recommended].

3. **The three principles, distilled as insight** (not instructions — Hobbs's constraint). Three compact cards:
   - *Start with your best country.* Subdividing your most productive paddocks first lifts carrying capacity across the whole farm — and that gain funds the next fence. (Counterintuitive; say so.)
   - *Rest your most run-down country first, and hardest.* It has the most to gain. A full season's rest, no grazing, let it seed.
   - *Let the rotation do the work.* At enough cells, 60–120+ days of rest happens by design, not discipline. ~20–30% of the farm resting at any time, every paddock rested every 3–4 years.

4. **The "why carbon" education panel** — this is where the original doc's science earns its place, in plain language. Two ready-made metaphors from Hobbs, both farmer-legible:
   - **Two bank accounts.** Fast carbon is your *checking account* — comes in a good year, goes out in a dry one. Durable carbon is your *savings account* — bonded to the soil, survives drought, doesn't reverse. Rotation fills the checking account fast (years 1–3). Rest is what builds the savings account (years 5–10). "That's the account we're helping you grow."
   - **The solar panel.** A plant grazed before it recovers is a panel just covering the house — nothing spare. A plant rested a full season is a panel exporting to the grid — surplus energy going down into the roots and out into the soil. Rest is what flips the plant from one to the other.

5. **CTA:** "See this on your own country → Open your interactive plan." Prominent, primary green, links to Surface B (see §3).

### Copy + confidentiality guardrails

- On-farmer-facing surfaces use the **abstracted productivity language** from `infrastructure_planning_principles.docx` — "hottest/coldest country", "productivity", "durable carbon". The original `paddock_planning_principles.docx` is marked **Confidential** and carries the raw MAOC/exudate/mycorrhizal detail; that stays internal. The two metaphors above are the sanctioned farmer-facing translation of it.
- Every recommendation is framed as principle, not prescription. No stock numbers, no "you should".

---

## 3. The link — how the static report opens the live tool on THEIR farm

This is the piece of real product architecture the two-surface idea introduces. The Snapshot is generated per property, so it already knows which farm it is. The CTA link must carry that identity so the tool opens on the farmer's own heat map, not a demo.

**Pattern [recommended]:** the link embeds a signed property token, e.g. `app.agriprove.io/plan?p=<property_token>`. The tool resolves the token → loads that property's boundary, paddocks, and productivity zones → farmer lands already looking at their own country.

Dependencies:
- Requires the property's zones + paddock boundaries to be retrievable as vectors (the same **Cadel vector question** flagged in v2 — it now gates the whole link, not just fenceline proposal).
- Token should be shareable but not guessable (farmers forward these); no login for v1 keeps friction near zero, matching the farm-map-draw-tool pattern.
- **[ASSUMPTION]** the link points at a platform-hosted route. If the interactive tool ships first as a standalone Claude Design export (HTML), the v1 link can instead open a generic demo and the farmer picks/loads context — acceptable stopgap, weaker "wow". Flag which we're doing before building the CTA.

---

## 4. Surface B — the interactive planner (carried from v2, one change)

Use the **v2 master prompt** (`...guide-v2.md` §5) as-is for the interactive tool — heat-map base layer, cell-count lever, live indicative rest-days, propose-and-adjust fencelines, choose-your-own-adventure flow. **One amendment:** rename the "Play it forward" phases to Hobbs's actual scenario names and anchor them to his indicative year bands, because Dylan explicitly wants those time intervals shown:

| Phase (was v2 "Stage") | Hobbs's name | Indicative band | What the map shows |
|---|---|---|---|
| 1 | **Establishment** | Yrs 1–3 | Hottest paddocks subdivided to max cells; 30–50% of the coldest country designated as the rest block; hot country carries the load |
| 2 | **Expansion** | Yrs 4–6 | Mid country subdivided; rest block transitions to a rolling 20–30% of the whole property; every paddock now rotating toward its first full rest |
| 3 | **Maturity** | Yrs 7–10 | Rest is structural, not disciplinary; coldest cores may get targeted double-rest; carrying-capacity curve measurably above Year 1 |

**Reconciling "order fixed, pace variable" with showing years:** the phase *names and order* are invariant; the *year bands are indicative labels* on each phase, and the **pace slider (Steady / Solid / Flat out) stretches or compresses those bands** without reordering. Show the years, badge them "indicative — depends on your capital and season", let the slider move them. This honours both Hobbs's "fixed in order, not in time" and Dylan's "show the intervals".

Add to the v2 "Play it forward" screen: the **two-account carrying-capacity read** — a fast-carbon line that lifts early then plateaus, and a durable-carbon line that climbs slowly and overtakes it by Maturity. It makes the 5–10 year payoff visible, which is the whole justification for the rest discipline.

---

## 5. Build sequencing — the non-obvious efficient order

Don't build the static image and the tool in parallel. Build the tool first; the static image falls out of it.

1. **Build Surface B (the interactive tool) first.** It contains all the logic — zone reading, subdivision proposal, phase rendering.
2. **Generate Surface A's hero image from the tool.** Once the tool can render a scenario, a headless/screenshot render of a chosen scenario *is* the static image. For v1 that's one generic example property; once per-farm context loading works, the same render runs per property at snapshot-generation time → the Snapshot image becomes personalised with no new logic.
3. **Wire the link last**, when both surfaces exist and the property-token route is decided.

This means the "personalised static image" (the expensive-sounding bit) is nearly free once the tool exists — it's the same renderer pointed at the farm's data. Sequencing it this way avoids building the scenario logic twice.

**Fork to decide now (v1 static image):** generic illustrative example [recommended — ships with the report immediately, teaches the principle cleanly] vs this-farm-personalised [more compelling, but waits on the tool + per-farm render]. Recommendation: generic in the report now, personalised as the fast-follow. **[ASSUMPTION]** unless you tell me otherwise, the guide assumes generic-for-v1.

---

## 6. Claude Design build order

1. Attach BOTH Hobbs docs to the project (`paddock_planning_principles.docx` for the science/metaphors + phasing; `infrastructure_planning_principles.docx` for the abstracted rule engine), the HORIZON Analysis screenshot, and farm-map-draw-tool screenshots for interaction style.
2. **Build the interactive planner** from the v2 master prompt + the §4 phase amendment. Iterate per v2's iteration prompts.
3. **Build the static Snapshot section** as a second design in the same project — prompt below.
4. Export the static section for the Snapshot v2 build; hand the interactive tool to Claude Code for the platform.

### Static section prompt (paste-ready, new in v3)

```
Build a static, report-embedded insight section for AgriProve's HORIZON
Profile (the farmer's soil-carbon snapshot). It is NOT interactive — it
renders inside an automated PDF/web report. Read the attached
"paddock_planning_principles" for the science and
"infrastructure_planning_principles" for the farmer-facing language.

GOAL: teach the farmer that their productivity heat map tells them where
and in what order to build fences and rest country — then send them to the
live tool to plan it on their own farm.

THEME — LIGHT, exact hex (no substitutions):
#F4F6F8 page · #FFFFFF card · #1A2B3C text · #6B7C8D muted ·
#2D6A4F accent · #34D399 success · #F59E0B warning · #E2E8F0 border ·
Inter font · cards radius 8px, 1px #E2E8F0 border.

LAYOUT top-to-bottom:
1. Header: "From measurement to management." Sub: "Your HORIZON map
   doesn't just measure your soil carbon — it shows you where to build."
2. HERO IMAGE: a productivity heat map of an example ~4,800 ha property
   ("Yarranlea Station") with an example scenario overlaid — the hottest
   zone subdivided into 6 cells (thin fence lines), the coldest zone
   shaded as a rest block, 2 water-point icons and a laneway. Caption:
   "An example plan — your country, your call."
3. THREE PRINCIPLE CARDS (heading + 2 lines each):
   • Start with your best country. Subdividing your most productive
     paddocks first lifts carrying capacity across the whole farm — and
     that gain funds the next fence.
   • Rest your most run-down country first, and hardest. It has the most
     to gain. A full season, no grazing, let it seed.
   • Let the rotation do the work. At enough cells, 60–120+ days of rest
     happens by design — about 20–30% of the farm resting at any time.
4. "WHY CARBON?" PANEL, two side-by-side metaphor cards:
   • Two bank accounts: fast carbon = checking (comes and goes with the
     season); durable carbon = savings (bonded to the soil, survives
     drought). Rest builds the savings account.
   • The solar panel: a grazed-too-early plant just covers its own needs;
     a rested plant exports surplus energy down into the soil. Rest flips
     the switch.
5. CTA BUTTON (primary green, large): "See this on your own country →
   Open your interactive plan". Under it, small: "Principles, not
   prescriptions — every fencing and grazing decision is yours."

CONSTRAINTS: no acronyms (no SOC/MAOC on screen), no stock-number advice,
static (no controls), print-legible, realistic Australian data, 1440-wide
and A4-portrait both clean.
```

---

## 7. Quality checklist (additions to v2's)

- [ ] Static section reads well in print AND web; CTA is unmissable
- [ ] "Why carbon" metaphors present and jargon-free (no MAOC/exudate/mycorrhizal on screen)
- [ ] Confidential source language stays internal; only the sanctioned metaphors surface
- [ ] Interactive tool's phases named Establishment / Expansion / Maturity with indicative year bands, badged pace-dependent
- [ ] Two-account carrying-capacity curve on the play-forward screen
- [ ] Link carries property context (or documented stopgap) — CTA not wired until the route is decided
- [ ] Hero image is generic-for-v1 unless Dylan chose personalised

---

## 8. Open items for Dylan

1. **Cadel vector question** (now gates both fenceline proposal AND the deep-link-loads-their-farm behaviour): are zones + paddock boundaries retrievable as vectors per property? Single most important dependency. **[ASSUMPTION: yes]**
2. **Static image v1:** generic example vs this-farm-personalised? Guide assumes generic + personalised fast-follow. **[ASSUMPTION]**
3. **Link target:** platform-hosted route (`app.agriprove.io/plan?p=<token>`) vs standalone-export stopgap? Determines whether the CTA ships in the next Snapshot or waits.
4. **Naming** — "HORIZON Profile" carried from 08 Jul; not formally decided.
5. The original `paddock_planning_principles.docx` is marked **Confidential** — confirm the two metaphors (two-accounts, solar-panel) are cleared for farmer-facing use before they ship. They're strong; worth an explicit OK.

---

## 9. Addendum (2026-07-08, later same session) — strategy confirmation, demo-first audience, eligibility layer

Dylan's answers to the two open strategy questions change three things:

### 9a. The v1 audience is the TEAM, not farmers

There is **no sanctioned build path** — the tool's current job is an innovation demo that makes the team think "aha" and produces a build decision. That changes what "v1 done" means:
- Optimise the Claude Design prototype for the **internal aha moment**, not field robustness. The demo script: Snapshot page → doorway section → unique URL → tool opens on a real (generalised) property → instinct test → green-zone click → play forward → eligibility close.
- The two demo moments most likely to land the "aha" with leadership: **the instinct test** (the tool earning trust by letting you be wrong) and **the eligibility close** (§9c — the funnel reframe made visible).
- Field-hardening items (offline HTML export, tablet touch targets) drop to post-decision backlog.

### 9b. Doorway naming + link

Snapshot section title candidates per Dylan: **"Where to start"** or **"Management insights"**. Link is a **unique URL per property** into the tool for situation modelling — consistent with the §3 signed-token pattern.

### 9c. The eligibility layer — the tool's ending

Dylan's strategic spine: move the farmer from *"should I do a soil carbon project?"* to *"how will I structure my business (literally) to enable the soil carbon project?"* The tool's closing act makes this explicit:

- As the farmer builds their scenario, the tool quietly tracks that the modelled changes — subdivision into rotational cells, changed grazing intensity/duration, full-season rest scheduling — **constitute the kind of new management activity a soil carbon project requires** [moderate — under the 2021 soil carbon method a project must adopt new/materially different eligible management activities, and changed grazing/pasture management is among them; **verify exact wording against the method documentation before any farmer-facing copy ships**].
- Closing screen addition: an "eligibility" beat after the play-forward — *"The plan you just built isn't only a productivity plan. Structuring your grazing this way is the management change a soil carbon project is built on. You've already done the hard thinking — the project is the next step, not a leap."* CTA unchanged ("Talk to us about your baseline").
- This inverts the sales motion: the farmer arrives at the conversation having already designed the business restructure; AgriProve's role is to credit it. Fellowship-not-sales, encoded in a product flow.

**Captured to strategy (Tier 2):** Snapshot-as-acquisition-model is explicit strategy + the funnel reframe — see `../../business/strategy.md` (2026-07-08 entry, PR pending).

---

## 10. Addendum 2 (2026-07-08, evening) — agreed delivery strategy + fenceline build path

### 10a. Delivery strategy (agreed Dylan + Cowork, this session)

- **Positioning:** "the next evolution of the farm map draw tool, with conversion focus." Rides the team's existing mental model and the tool's earned credibility.
- **Flow correction to §9a:** the planner is a **post-snapshot** touchpoint, not an in-visit aid — the HORIZON model run must exist to produce the heat map. Sequence: farm visit → snapshot request → model run → HORIZON Profile issued (with doorway section) → **Hobbs runs the planner in the follow-up conversation**. The planner is the key conversion mechanism and Hobbs's follow-up instrument.
- **Doorway:** ships inside the snapshot generator build currently in flight. CTA is a concierge door — captures interest, Hobbs follows up with a planner session. Demand measured before build path exists; clicks arrive pre-segmented via the farm-type qualifier.
- **Demo = decision meeting:** real Stormboy pipeline property (country the field team recognises), Hobbs co-presents the science, explicit closing ask: approve the doorway section + pilot the planner on the next N post-snapshot follow-ups.
- **Lane:** Stormboy/recruitment tooling under priority 1 — not paused platform dev.

### 10b. The vector question — largely answered from the backend domain model

Source: agriprove-backend skill (schema-confirmed 16 Apr 2026):

- **Parcels: true vectors.** PostGIS `boundary` MultiPolygon (SRID 7844); canonical source of all geospatial truth. Property boundary is derived from parcels at runtime (not stored).
- **Heat map (Carbon Gradient): HORIZON model output → S3 file.** Format unconfirmed in the skill — likely raster/gridded [ASSUMPTION].
- **Zones (Strength/Reference/Opportunity): plausibly `RunStratificationWorkflow` output** (stratification requires a completed SOC model run — matches the product flow) [moderate].
- **Paddocks are NOT a domain entity.** The crisp internal boundaries in HORIZON Analysis are almost certainly parcel boundaries. The planner introduces the paddock/cell concept: demo = client-side only (fine); production = new entity → schema migration, higher cost per the backend cost heuristics. Flag this early in any build ask.
- **Narrowed question for Cadel (this week, before departure):** "What format are `RunModelUnifiedWorkflow` outputs in S3, and is the zone classification stored as vector polygons (stratification output) or raster?" One question, 15 minutes, unblocks everything.

### 10c. Fenceline generation — demo build path (real property, functional)

**Principle: precompute offline, interact live.** Live computational geometry on stage is where demos die; precomputed geometry swapped at 60fps is indistinguishable from magic.

**Step 1 — data prep (one Claude Code session, Python + shapely):**
1. Pick the demo property (Stormboy pipeline, completed HORIZON run).
2. Export: parcel polygons (PostGIS → GeoJSON), heat map PNG + bounding box (S3), zones as vectors if stratification output has them — else polygonise from the raster / colour-threshold the PNG (ramp is known).
3. Zonal stats: mean gradient per parcel → hot→cold ranking.
4. **Split generator** — for each parcel and every cell count N=2..12, compute proposed cells: minimum rotated rectangle → cuts perpendicular to the long axis → iterative adjustment to equal areas → in cold parcels, snap the nearest cut to the internal zone boundary (weakest core becomes its own recovery cell, per Hobbs S4) → straighten to single segments, clip to parcel. Emit precomputed cell + fenceline GeoJSON per (parcel, N).

**Step 2 — prototype consumes precomputed geometry.** The cell-count slider swaps geometries instantly; rest-days maths runs live (it's arithmetic); drag-to-adjust enabled on the hero parcel only. Every geometry shown on demo day was validated the day before.

**Step 3 — nothing is built twice.** The prep script IS the seed of the production fenceline service: same rules, run per-property server-side (or client-side against a vectors API) once the build is sanctioned. Production additions: zones/gradient via GraphQL, paddock/cell entity (schema migration — cost flagged), signed property-token route for unique URLs.

**Owner note:** post-Cadel, the data-prep export needs Gayathri/Athul or Dylan-via-Claude-Code against `ava-approved-front-end-customer` + PostGIS. The split generator itself needs no platform access at all.

---

## Sources
- Hobbs, `paddock_planning_principles.docx` (Horizon Management Science Layer, Confidential) — two-carbon model, solar-panel analogy, Establishment/Expansion/Maturity phasing with indicative year bands
- Hobbs, `infrastructure_planning_principles.docx` — abstracted rule engine, farmer-facing language, surface-don't-prescribe constraint
- Granola 2026-07-08 "Grazing management insights via snapshots" (e29d2cb6-84f0-4ec7-b460-e551f5716a92) — "why carbon" education gap, Snapshot v2 grazing section action, value-density goal
- v2 guide (interactive tool master prompt) — `2026-07-08-grazing-scenario-tool-claude-design-guide-v2.md`
