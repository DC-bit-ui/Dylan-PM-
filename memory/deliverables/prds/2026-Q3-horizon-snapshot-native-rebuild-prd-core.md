# HORIZON Snapshot — Native Rebuild (Phase 1) — PRD Core

> Draft for Confluence (SCRUM space, under the HORIZON Snapshot Epic Hub). Paste target: the canonical PRD template in Confluence (AgriProve Platform → Product Requirements → Create new PRD, folder 367656961). Companion design docs: `horizon-snapshot-rebuild/01–04` (block model, Magic Patterns prompt, output blocks, ACWIS set).

#### Document Header

| Field | Value |
|---|---|
| **Feature Owner** | [Placeholder — CPO / Kieren] |
| **Delivery Owner** | Dylan Cronje |
| **Epic Hub** | [Link — Confluence Epic Hub 466452481] |
| **Jira Epic** | [Link — AP-XXXX, HORIZON Snapshot opportunity] |
| **Status** | Draft |
| **Last Updated** | 2026-07-03 |

---

#### 1. Problem (+ Evidence)

**Current State:** The HORIZON Snapshot generator works and ships 12-page soil carbon assessments to prospects, but it was vibe-coded as a standalone app on a different foundation from our platform (Node/Express + vanilla JS + client-side html2canvas + Leaflet). It is very hard to debug and effectively impossible to change, update or reorder. The team cannot add or edit pages or insights without breaking the layout, and we cannot extend to new opportunity types (water/erosion, environmental plantings) without a rebuild.

**Evidence:** Live prod walkthrough ("Eungella", 1 Jul 2026) confirmed the architecture: a static client with the session token in the URL query string, zones rendered by canvas pixel-walking `map.png` with a CSS overflow crop to hide the model's baked-in legend, map bounds approximated from `input.geojson` + 10% padding, and the commercially critical Economics page numbers baked into a template PNG rather than computed (source: `src/engine/calculator.js`, `public/js/app.js:1056-1226`; `BACKEND_SOLUTION_APPROACH.md`). Every one of these is a fragility and change-cost source.

**Impact:** The Growth team's core need, tailoring the pitch per prospect, is unmet. Any change is a developer job with layout risk. The Verterra partnership (ACWIS water/erosion) and Environmental Plantings cannot be productised on the current base. PII (`contactName`, `contactEmail`) flows through parse → UI → HubSpot → feedback logs with no controls.

---

#### 2. Job Stories

**Primary Jobs (must solve)**

| # | When... | I want to... | So I can... |
|---|---|---|---|
| 1 | When a snapshot arrives pre-populated from the pipeline for a prospect | review the property data, generated copy and maps in one place | trust it is right before it goes out under Ben's name |
| 2 | When the generated copy does not fit a specific prospect | edit any narrative and regenerate a single block with feedback | tailor the pitch without waiting on a developer |
| 3 | When a prospect does not need every page | add, remove or hide blocks for this snapshot | send a document that fits the opportunity |
| 4 | When the snapshot is ready | export a pixel-faithful PDF and send it via HubSpot to the contact | deliver it the way we deliver today, without regression |
| 5 | When I am handing a prospect to sales | read the internal Growth Summary (Opportunity / Profile / Watch-outs / Next step) | brief the rep and flag commercial risk before investing time |
| 6 | When marketing designs or changes a snapshot page in Canva | import it or adjust any area myself | update the document without a developer and without breaking layout |

**Secondary Jobs**

| # | When... | I want to... | So I can... |
|---|---|---|---|
| 1 | When I generate copy | choose Haiku for speed/cost or Sonnet for quality, and see the per-snapshot cost | control spend without losing quality where it matters |
| 2 | When I want consistent copy across all snapshots | set a standing Narrative Guide once | avoid repeating the same corrections every time |

---

#### 3. Success Metrics

| Indicator | Baseline | Target | Timeline | Tracking | Setup Required? |
|---|---|---|---|---|---|
| Snapshot generated → sent without dev involvement | Effectively 0 (dev needed for any change) | 100% of routine sends | 30 days post-launch | Frontier event | Yes — instrument |
| Time from data-ready to sent | [Placeholder — measure current] | ≤ current, ideally lower | 30 days | Frontier event | Yes |
| Edit/regenerate used per snapshot | n/a (not possible today) | ≥ 1 edit on ≥ 50% of snapshots | 30 days | Frontier event | Yes |
| Output fidelity (marketing-grade) | Current tool = reference | No visible regression vs Canva reference; designer sign-off + pixel-diff | Launch gate | Design-QA + CI pixel-diff | Yes — set up pixel-diff on reference properties |
| LLM cost per snapshot | ~$0.026 (Haiku, Eungella) | Maintain or reduce | Ongoing | Cost tracker (reuse) | No — reuse |

**Pivot Criteria:** If, 30 days after launch, routine sends still require dev involvement or the team reverts to the old tool for real prospects, stop and re-scope the editor before building Phase 2.

---

#### 4. Scope

Explicitly split PARITY (must match the current tool) from IMPROVEMENT (net-new value). Some improvements are parity-enabling and ride in Phase 1; the rest are deferred.

**In Scope — Phase 1 (Parity rebuild on platform, block-rendered)**

- [PARITY] Native React/Chakra tool in Frontier; data loaded from the platform (GraphQL/S3).
- [IMPROVEMENT] **Two first-class create entry points** on a "New Snapshot" screen: (1) from the pipeline (pick a ready property, pre-filled), and (2) manual upload of a property ZIP (drag-drop, parse, detected-contents checklist). Manual upload is promoted from the brief's dev-only path to a supported, aesthetic entry point. Both converge on the same editor.
- [PARITY] All 12 pages: 5 dynamic blocks + 7 static blocks, pixel-faithful to the Canva template.
- [PARITY] Calc engine ported exactly, constants frozen: `CORES_PER_CEA=24`, deferred ACCU $12.50, max deferred baseline $50k, `PRICING_BANDS`, `ACCU_RATES` (rainfall band × land use), `SOIL_CHARACTERISTICS`. Land-use override path.
- [PARITY] Copy generation (Page 2, Page 4, email) with Standard/Stormboy registers; copy rules enforced (no em dashes, defensible language, geospatial disclaimer, signs off as Ben, thanks Hobbs).
- [PARITY] Preserve-list: Growth Summary (four-part, internal, not in PDF), Persistent Narrative Guide, model selector (Haiku default / Sonnet), per-snapshot cost tracker, guided regeneration, Page 4 portfolio-proximity social proof + map, Send via HubSpot.
- [PARITY] Review → Edit → Send workflow; PDF export via HTML template + Puppeteer + tokenised URL.
- [PARITY + IMPROVEMENT] **Full pre-publish output editing:** edit and regenerate summaries (register + freeform feedback); font-size control per summary with autofit; **manipulate each map in its own frame-accurate interactive window** (drag to pan, scroll/zoom, adjust overlay opacity, reset-to-auto), sized to the exact template frame that map occupies, matching current prod (Leaflet-style map over satellite) so what the user frames is what renders. Maps are separate (zone, pH, depth, portfolio), not stacked layers on one canvas. The framing window shows each map's **legend in its rendered position** (pinned to the frame, repositionable to a clear corner) so legend/map overlap is visible and resolvable before confirming; control the **portfolio-proximity** placement (radius, featured comparator). Quick-navigation to amendable pages only (maps and generated-copy pages), a "preview as the landholder" view, map reset-to-auto / lock-framing, and a pre-send quality check. (Edited-vs-original compare is explicitly out for v1.)
- [IMPROVEMENT, parity-enabling] Economics page numbers as **live calc fields** (moved out of the PNG) — required for a genuinely editable/extensible system.
- [IMPROVEMENT, parity-enabling] Block/template/data-source model + adapter layer — the foundation everything else rests on.
- [IMPROVEMENT] PII as a first-class field class, scoped to delivery only; never in prompts, narrative cache, feedback logs, or preview URLs.
- [IMPROVEMENT, non-negotiable] **Marketing-grade output.** The landholder PDF is rendered by Canva (Brand Templates + Autofill), not re-implemented in CSS, so it is pixel-faithful to the designer's work by construction. Multi-kind renderer (`image` / `overlay` / `canva-autofill` / `native`); per-page export merged in block order. Native HTML is reserved for the internal tool and any interactive web version. Enforced by a design-QA gate (designer sign-off + pixel-diff), owned by design.
- [IMPROVEMENT] **Marketing self-serve authoring.** A new or changed Canva page flows into the snapshot via a Brand Template + field mapping and a publish gate, with no developer involved.

**Out of Scope (Phase 1)**

- Full block editor (add/remove/reorder/edit UI) — **Phase 2**. Phase 1 ships the block *architecture* and render; the editing UI comes next.
- ACWIS/RC (water/erosion) blocks and the Stacked Opportunity template — **Phase 3**, gated on the Verterra API contract.
- Environmental Plantings template — later.
- Vector zone rendering (replacing raster pixel-walking) — **candidate for Phase 1 if the model emits clean `classified.geojson`, else Phase 2.** This is the biggest fragility fix; decision below.

**Future Considerations**

- A shared block library across other AgriProve documents (audit reports, referrer packs).
- Free-canvas layout editing beyond ordered blocks.

---

#### 5. Key Decisions

| Decision | Rationale | Decided By | Date |
|---|---|---|---|
| Static pages modelled as degenerate `StaticBlock` (no source/prompt) | Avoid paying the block-machinery cost on 7 of 12 pages that never change | Dylan (proposed) | 2026-07-03 |
| Reorder is constrained (cover pinned first, contact last, brand blocks locked) | Free reorder produces off-brand decks sent under Ben's name; edit is the high-value, low-risk job | Dylan (proposed) | 2026-07-03 |
| Economics numbers become live calc fields | "Editable/modular" is false while the most commercial page is a baked PNG | Dylan (proposed) | 2026-07-03 |
| Phase editor separately from parity render | Ship a real, de-risked native tool first; add editing on a working base | Dylan (proposed) | 2026-07-03 |
| Landholder PDF rendered by Canva (Autofill), not CSS; HTML only for the tool + web version | Guarantees marketing-grade output and lets marketing self-serve page changes; avoids the "vibe-coded graphics" failure mode | Dylan (proposed) | 2026-07-03 |
| Compose the PDF by per-page Canva export + server-side merge | Preserves per-page fidelity and the add/remove/reorder requirement without relying on an unvalidated Canva multi-page compose API | Dylan (proposed) | 2026-07-03 |
| Full page management (reorder, add, edit, hide, remove, duplicate) stays in the snapshot editor via a collapsible panel, not a separate mode | Keeps the valued flexibility close to the work while a collapse control keeps prep clean; supersedes the earlier separate-Template-Editor idea | Dylan | 2026-07-03 |
| Add a Guided express flow (confirm interests → generate summaries → step through maps → final review → send) alongside the manual editor; depth (Quick/Deep) maps to Haiku/Sonnet and is pre-selected by value tier | Gives users a fast, focused, complete-the-path route that surfaces only manipulatable areas and spends model cost by prospect value; manual editor remains for power/edge cases | Dylan | 2026-07-03 |
| Guided flow opens with an interest confirmation gate: interests auto-mapped from the submission and confirmed by the user; the confirmation scopes which pages, copy summaries and maps the journey produces (e.g. ACWIS/Reef Credit each add a summary and a map) | The flow cannot know which summaries to generate or maps to frame until opportunity scope is set; auto-map + confirm keeps it fast while correct | Dylan | 2026-07-03 |
| Two dynamic capabilities are must-have functional inclusions and sit on the content side of the render line: (a) Claude generates copy via API and injects it into named Canva text slots (fills fields, never lays out); (b) interactive map manipulation as in the current prototype, captured as framing parameters and re-rendered server-side to a 300 dpi image injected into the map slot (never browser-screenshot / html2canvas) | Preserves the flexibility both need while keeping Canva the sole deterministic renderer, so fidelity is guaranteed | Dylan | 2026-07-03 |
| Two viable Canva fill paths, both validated (see `horizon-snapshot-rebuild/09`): (a) editing API (fill named elements, no brand-template publish needed) or (b) autofill endpoint (needs the design published as a Brand Template). Text/number/economics/carbon-table fill proven end-to-end on real data (Rochester Farm) 2026-07-08 | Editing-API path removes the publishing dependency; keep both options open pending Daniel's Brand Template | Dylan (validated) | 2026-07-08 |

---

#### 6. Rabbit Holes & Dependencies

**Rabbit Holes**

- [ ] **Over-decomposing into micro-blocks:** modelling every artifact as its own block → **Mitigation:** block ≈ page for parity; composite sub-slots only where editing demands (page 3, Growth Summary).
- [ ] **Chasing pixel-perfect PDF across all edge cases:** → **Mitigation:** PM LGTM against the Canva template on a fixed set of reference properties; accept "no visible regression", not "identical to the pixel".
- [ ] **Building the editor and the parity rebuild at once:** → **Mitigation:** phase them; Phase 1 render + architecture, Phase 2 editor UI.
- [ ] **Boiling the vector-zone fix into the model team's backlog mid-build:** → **Mitigation:** decide upfront based on `classified.geojson` quality; if not ready, ship raster parity and defer.

**Dependencies**

| Dependency | Owner | Status | Blocks launch? |
|---|---|---|---|
| GraphQL/S3 data load on `SOCModelRun` (pre-signed URLs) | Backend (Gayathri) | Per `BACKEND_SOLUTION_APPROACH.md` | Yes (Phase 1) |
| Puppeteer render hosting on platform | Backend (Gayathri) | To confirm | Yes (Phase 1) |
| Clean `classified.geojson` for vector zones | Model team (Cadel) | To confirm | No (gates the improvement, not launch) |
| Canva Connect (Autofill + export) render path | Backend + Canva connector | Validated available 2026-07-03; brand kits exist | Yes (Phase 1 — brand-doc render) |
| Brand Templates + data fields built in Canva | Marketing (Daniel — Brand Designer role) | Build spec issued (`Brand Template Build Spec - for Daniel.md`); publishing is role-gated | Yes (Phase 1, if using autofill endpoint) |
| Map render + Canva asset-upload pipeline (composite model PNG over satellite at `bounds.json`, draw legend, upload, `update_fill`) | Backend | Specced (`horizon-snapshot-rebuild/09` §4); only remaining piece not proven | Yes (Phase 1) |
| `bounds.json` present in model output (exact map alignment) | Model team (Cadel) | Confirmed present in latest zip — lock in as required output | No (improves alignment) |
| Verterra ACWIS API contract | Ben | Being defined | Yes (Phase 3 only) |

---

#### 7. Open Questions + Links

**Open Questions**

| Question | Owner | Target Date | Resolution |
|---|---|---|---|
| Does "native/platform-compatible" mean React/Chakra + TS BFF/GraphQL, with calc + copy in platform services calling the Anthropic SDK server-side? | Gayathri | TBD | |
| Keep client-side html2canvas or move to HTML template + Puppeteer + tokenised URL? (Recommend the latter) | Gayathri | TBD | |
| Is `classified.geojson` reliable enough to render zones as vector in Phase 1? | Cadel | TBD | |
| Canva Autofill + export latency/throughput acceptable on the render path? Page-order via per-page export + merge, or a Canva compose API? | Backend | TBD | |
| Who in marketing owns building + maintaining the Brand Templates and data fields? | Marketing lead | TBD | |

**Related Documents**

- Functional Design Brief (v2): `HORIZON Snapshot - Functional Design Brief.md`
- Block / Template / Data-Source Model: `horizon-snapshot-rebuild/01-block-template-datasource-model.md`
- Magic Patterns prompt (tool chrome + editor): `horizon-snapshot-rebuild/02-magic-patterns-prompt.md`
- Output blocks (HTML): `horizon-snapshot-rebuild/03-snapshot-output-blocks.html`
- ACWIS/RC block set: `horizon-snapshot-rebuild/04-acwis-rc-block-set.md`
- Confluence: Epic Hub 466452481, PRD Core 466485249, Pipeline & Render 491159554, HTML vs Canva 491683841, Phase 0.5 Backend 561610757

---

#### Appetite (Shape Up, weeks)

| Phase | Scope | Appetite |
|---|---|---|
| **Phase 1 — Parity rebuild** | Block architecture + data-source registry + 5 dynamic + 7 static blocks + calc + copy + preserve-list + Review/Edit/Send + Puppeteer/HubSpot delivery + live economics fields + PII scoping | 6 weeks |
| **Phase 2 — Editor** | Add/remove/reorder (guarded)/edit UI + named templates; vector zones if deferred from P1 | 3 weeks |
| **Phase 3 — ACWIS** | Verterra data source + adapter + 3 ACWIS blocks + Stacked Opportunity template | 3 weeks, gated on Verterra contract |

#### Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-07-03 | 1.0 | Initial PRD Core drafted | Dylan Cronje (with Claude) |
| 2026-07-03 | 1.1 | Added marketing-grade render (Canva Autofill) + self-serve authoring requirement, design-QA gate, Canva dependencies, Canva render decisions | Dylan Cronje (with Claude) |
| 2026-07-03 | 1.2 | Output contract fixed to exportable PDF (never a Canva link); manual ZIP upload promoted to a first-class entry point alongside pipeline | Dylan Cronje (with Claude) |
| 2026-07-08 | 1.3 | Canva fill+render+export validated end-to-end on real data (Rochester Farm); two fill paths + role finding + maps-injection spec captured in `horizon-snapshot-rebuild/09`; dependencies updated | Dylan Cronje (with Claude) |
