# HORIZON Snapshot — Block / Template / Data-Source Model

**Author:** Dylan Cronje (drafted with Claude) · 2 July 2026
**Status:** Design proposal for the platform-native rebuild
**Source of truth:** `HORIZON Snapshot - Functional Design Brief.md` (v2). Engine facts cited to `C:\Dylan PM\horizon-snapshot` source unless tagged `[ASSUMPTION]`.

---

## 0. Reconciliation note — read this first

The source repo at `C:\Dylan PM\horizon-snapshot` **lags live prod**. Two features you verified live are not in the repo the design is built from:

- **Data load.** The repo has no `/load` HTTP endpoint; it loads via `POST /api/upload` (a ZIP) and a client-side `snapshotApp.load()` function (`public/js/app.js:1657-1661`, `server.js:93-119`). Live prod uses `GET /horizon-snapshot-prep/load/{runId}` returning one consolidated JSON (brief v2). Both are documented; the model below abstracts over the difference via the data-source registry.
- **Model selector.** The repo hardcodes `claude-sonnet-4-6` (`src/api/claude.js:16`) with **no Haiku option**. Live prod has Haiku 4.5 default / Sonnet 4.6 (brief v2). Treat the selector as a confirmed requirement to preserve; it is cheap to build.

Everything about engine constants and calculation logic below is read from the repo and is `[high]` confidence. Everything about the live UI feature set is from your v2 walkthrough.

---

## 1. The model in one paragraph

A **Snapshot** is an ordered list of **Block instances** produced from a **Template**. Each **Block Type** declares three things: (a) a **data contract** — what it needs and from which source, resolved through a **Data-Source Registry**; (b) an optional **copy prompt** — the Claude template that turns block data into narrative, with register and narrative-guide applied; and (c) a **render partial** — an HTML fragment with **named slots**. The Registry lets one block ("opportunity-zone map") be fed by HORIZON today and Verterra ACWIS tomorrow via different **adapters**, with no change to the block's render or copy. A Template is a named ordered Block-Type set per snapshot type. The **Editor** lets Growth/Ops add, remove, reorder and edit blocks and copy per instance before publish.

```
Template (Soil Carbon)
   └─ ordered [BlockTypeRef]
        └─ instantiate → Snapshot
             └─ ordered [Block instance]
                  ├─ dataSource binding ──▶ Registry ──▶ raw payload ──▶ Adapter ──▶ blockData
                  ├─ copyPrompt(blockData, ctx, register, guide) ──▶ narrative (cached, cost-tracked)
                  └─ renderPartial + slotMap(blockData + narrative) ──▶ HTML fragment
```

---

## 2. Pushback on the concept (before the schema)

You asked me to pressure-test. Six points, ordered by how much they should change the design.

**2.1 — 7 of 12 pages are static. Do not pay the block tax on them.** `[high]`
Pages 5, 7, 8, 9, 10, 11, 12 are static educational/brand pages rendered as template PNG backgrounds (`app.js:926-927`, `DYNAMIC_PAGES = {1,2,3,4,6}` at `app.js:40`). A block that declares data contract + copy prompt + slot map is the right abstraction for the 5 dynamic pages and pure overhead for the 7 static ones. **Model static pages as a degenerate `StaticBlock`** — render partial only, no source, no prompt. This keeps the machinery honest: ceremony is paid only where content actually varies. It also means the parity rebuild is really "5 dynamic blocks + 7 static blocks + editor", which is a much smaller appetite than "12 fully dynamic pages."

**2.2 — Decide block granularity explicitly: block ≈ page, with named sub-blocks only where editing demands it.** `[moderate]`
The current output is page-shaped. The cleanest parity model is **1 block ≈ 1 page**. But two pages contain independently-editable artifacts that Growth will want to touch alone: page 3 (pH map + depth map + carbon-indicators table) and the internal Growth Summary (not a page at all). Recommendation: keep block = page for parity, but allow a block to be *composite* (own sub-slots) rather than forcing every artifact into its own block. Introduce standalone sub-page blocks only when a real edit/reuse need appears. Over-decomposing now is the classic "boil the ocean" trap.

**2.3 — Free reorder can produce incoherent decks. Constrain it.** `[moderate]`
The snapshot has a deliberate arc: cover → analysis → indicators → potential → how-it-works → economics → process → contact. Letting anyone drag any block anywhere will produce off-brand, illogical documents that still go to prospects under Ben's name. **Editing copy is high-value / low-risk; reordering is lower-value / higher-risk.** Prioritise per-instance *edit* and *add/remove* in Phase 1; ship reorder with **template guardrails** (cover pinned first, contact pinned last, "locked" static brand blocks) rather than a free canvas. This directly serves the real job (Growth tailoring the pitch) without the failure mode.

**2.4 — The Economics page numbers are baked into PNGs, not computed. "Editable" is a lie until they are live.** `[high]`
The `+25%` figures and the Option 1 / Option 2 layout live in `template_page_06.png`; the engine emits only `baselineCost` and `deferredAccus` and the app overlays those plus an overflow figure (`app.js:1056-1064`; agent extract §3). Page 6 is the most commercially loaded page in the document. If the rebuild is genuinely modular and editable, these must become **live calc fields rendered into slots**, not pixels. This is net-new calc/render work and belongs in the parity scope, not deferred.

**2.5 — Zones are rendered from a raster PNG via pixel-colour heuristics. This is the fragility you are trying to kill.** `[high]`
`classified.geojson` / the landscape GeoJSON is loaded but zones are drawn by canvas-walking `map.png` pixels (`preprocessMapImage`, `app.js:1190-1226`), then cropped with a CSS overflow hack to hide the model's baked-in legend (`index.html:740-742`), with bounds approximated from `input.geojson` + 10% padding (`aspectAwareBounds`, `app.js:1230-1256`). Every one of those is a fragility source. The platform-native win is to **render zones as vector GeoJSON layers** (Leaflet/MapLibre) styled with the colour spec, dropping raster pre-processing, the crop, and bounds-guessing entirely. This depends on the model emitting clean `classified.geojson` — flag as a data-contract ask on Cadel/model team. It is the single highest-leverage improvement and I would put it in Phase 1 if the geojson is trustworthy, Phase 2 if it needs model-side work.

**2.6 — PII has zero controls today. The registry is the natural gate.** `[high]`
`contactName` / `contactEmail` flow through parse → sidebar → HubSpot deep-link → feedback logs unmodified, with no masking or consent gate (agent extract §8). They are correctly *excluded* from Claude prompts (`prompts.js:81-94`) — keep that. The rebuild should make PII a **first-class field class in the data model** with an explicit scope: allowed in the delivery/HubSpot path, forbidden in copy-generation and in any cached narrative or feedback payload. Cheapest place to enforce is the adapter layer. Details in §8.

---

## 3. Entities and schema

Five persistent entities plus two runtime concepts (Registry, Adapter).

### 3.1 DataSource (registry entry)

Abstracts *where block data comes from*. One registry, N sources.

```jsonc
DataSource {
  "id": "horizon",                      // stable key
  "kind": "graphql" | "rest" | "static" | "external-api",
  "label": "HORIZON model run",
  "fetch": {                            // how to resolve a payload for one snapshot
    "op": "latestCompletedSOCModelRun", // GraphQL op / REST path / file
    "params": ["propertyId" | "runId"],
    "returns": "HorizonPayload"         // named payload schema
  },
  "piiFields": ["contactName", "contactEmail"],  // declared, not just present
  "cacheTtl": 3600
}
```

Seed registry:

| id | kind | resolves | payload | status |
|---|---|---|---|---|
| `horizon` | graphql (target) / rest (`/load/{runId}`, prod) / rest (`/api/upload`, repo) | model outputs | `HorizonPayload` | REUSE — repo shape known |
| `agriprove-portfolio` | static | `portfolio.geojson` + `accu_issued_companies.json` | `PortfolioPayload` | REUSE (`app.js:1393-1440`) |
| `platform-property` | graphql | property record (name, address, area) | `PropertyPayload` | net-new (platform) |
| `verterra-acwis` | external-api | AOI in → capacity/zones out | `AcwisPayload` | **dependency** (contract TBD with Ben) |

### 3.2 BlockType (definition)

The reusable schema for a kind of block. Static blocks omit `source` and `copy`.

```jsonc
BlockType {
  "id": "horizon-analysis",
  "label": "HORIZON Analysis (zone map + summary)",
  "category": "dynamic" | "static" | "internal",   // internal = not in PDF
  "interests": ["soil-carbon"],                     // opportunity types this block serves; ["shared"] = always shown (§4C)
  "pageAffinity": 2,                                 // parity page number, nullable
  "locked": false,                                   // brand blocks = true (no delete/reorder)

  "source": {                                        // omitted for StaticBlock
    "dataSourceId": "horizon",
    "requires": ["images.map", "zoneStats", "geojson.classified", "parsed.eligibleArea"]
  },

  "copy": {                                          // omitted if no narrative
    "promptId": "page2",                             // → prompts.js builder (REUSE)
    "wordTarget": 150,
    "registerAware": true,                           // Standard / Stormboy
    "usesNarrativeGuide": true,
    "regenerable": true
  },

  "render": {
    "renderKind": "canva-autofill",                   // image | overlay | canva-autofill | native (see §4A)
    "canvaTemplateId": "BAF...",                       // Brand Template id when kind = canva-autofill
    "partialId": "partial.horizon-analysis",          // used when kind = overlay | native
    "slots": [                                        // named slots the partial / autofill fields expose
      { "name": "mapLayer",   "type": "map",   "fromData": "images.map + geojson.classified" },
      { "name": "legend",     "type": "legend","static": "horizon-zones" },
      { "name": "summaryText","type": "prose", "fromCopy": "page2" }
    ]
  }
}
```

### 3.3 Block instance (per snapshot)

```jsonc
BlockInstance {
  "instanceId": "blk_7f3",
  "blockTypeId": "horizon-analysis",
  "order": 2,
  "visible": true,
  "sourceBinding": { "dataSourceId": "horizon", "runId": "run_123" },  // can override default
  "generated": {                                    // copy cache
    "summaryText": "…152 words…",
    "register": "standard",
    "model": "claude-haiku-4-5",
    "costUSD": 0.026,
    "editState": "generated" | "edited" | "regenerated",
    "editHistory": [ { "ts": "...", "guidance": "make it warmer" } ]
  },
  "overrides": { "landUse": "cropping" }            // e.g. calc override (app /api/calculate)
}
```

### 3.4 Template

```jsonc
Template {
  "id": "soil-carbon",
  "label": "Soil Carbon Snapshot",
  "snapshotType": "soil-carbon",
  "blocks": [                                        // ordered BlockType refs + defaults
    { "blockTypeId": "cover",              "locked": true },
    { "blockTypeId": "horizon-analysis" },
    { "blockTypeId": "soil-carbon-indicators" },
    { "blockTypeId": "portfolio-accu-potential" },
    { "blockTypeId": "background",          "locked": true },
    { "blockTypeId": "agriprove-economics" },
    { "blockTypeId": "difference",          "locked": true },
    { "blockTypeId": "advantage",           "locked": true },
    { "blockTypeId": "process",             "locked": true },
    { "blockTypeId": "your-accus",          "locked": true },
    { "blockTypeId": "assessment",          "locked": true },
    { "blockTypeId": "contact",             "locked": true },
    { "blockTypeId": "growth-summary",      "category": "internal" }  // not in PDF
  ]
}
```

Named templates: `soil-carbon` (parity), `stacked-opportunity` (soil carbon + ACWIS blocks), `environmental-plantings` (later). A template is just an ordered set + defaults; new snapshot types are new templates, not new code — that is the extensibility payoff.

## 4C. Interest points (opportunity types) drive which pages show

The user selects one or more **interest points** for a snapshot and the tool assembles the pages relevant to that selection. This unifies "template", "theme" and "interest point" into one mechanism.

- **Interest points = opportunity types:** `soil-carbon` (HORIZON), `acwis` (Verterra water + erosion), `reef-credit` (Great Barrier Reef water-quality credits), `environmental-plantings` (later). Plus the reserved `shared` tag for brand/educational pages that appear regardless.
- **Every block is tagged** with the interests it serves (`interests` in §3.2). Cover, Background, Difference, Advantage, Process, Your ACCUs, Assessment, Contact and the Economics framing are `shared`. HORIZON Analysis / Indicators / Portfolio are `soil-carbon`. The ACWIS block set is `acwis`. Reef Credit blocks are `reef-credit`.
- **Assembly rule:** selected snapshot pages = all `shared` blocks + every block tagged with any selected interest, in template order. Change the selection and the page list updates live.
- **Named templates are saved selections.** "Soil Carbon" = `{soil-carbon}`; "Stacked Opportunity" = `{soil-carbon, acwis}`; a Reef property = `{soil-carbon, reef-credit}` or `{reef-credit}` alone. Curated presets stay the primary path (on-brand, sensible order); free multi-select is the advanced path.
- **Each non-soil interest is a data-source + block-set dependency.** `soil-carbon` works today; `acwis` is gated on the Verterra contract (doc 04); `reef-credit` needs its own data source/methodology contract (new dependency, structurally parallel to ACWIS). Selecting an interest whose data is not yet available previews the page structure but marks the data "coming soon".

Pushback worth holding: stacking many interests makes long documents. Keep curated presets primary, cap combinations sensibly, and let the collapsible page manager (per the editor) trim anything not relevant to this specific landholder.

### 3.5 Snapshot instance

```jsonc
Snapshot {
  "id": "snap_abc",
  "templateId": "soil-carbon",
  "propertyId": "prop_99",
  "runId": "run_123",
  "register": "standard",                 // Standard | Stormboy
  "model": "claude-haiku-4-5",            // Haiku | Sonnet
  "narrativeGuideId": "guide_default",    // Persistent Narrative Guide
  "status": "draft" | "ready-for-review" | "sent",
  "blocks": [ /* BlockInstance[] */ ],
  "pii": { "scope": "delivery-only", "contact": { "name": "...", "email": "..." } },
  "costUSD": 0.026,                        // rollup
  "createdBy": "growth-user-id"
}
```

---

## 4. Block → render-slot mapping (the mechanism)

Each render partial is an HTML fragment declaring slots as `data-slot="name"`. The block's `slotMap` binds each slot to either resolved data or generated copy. Pipeline per block, in order:

1. **Resolve** — Registry fetches the raw payload for `sourceBinding` (cached).
2. **Adapt** — the source's Adapter maps raw payload → typed `blockData` matching the block's `requires`. (This is where HORIZON vs Verterra differences are absorbed.)
3. **Generate** — if `copy` present: `prompt(blockData + context + register + narrativeGuide + editorialContext)` → narrative, cached in `generated`, cost logged, model per snapshot.
4. **Render** — `partial` + `slotMap(blockData + narrative)` → HTML fragment. PDF = concatenated fragments → Puppeteer; screen = tokenised URL of the same fragments.

Worked example — `horizon-analysis` (page 2):

| Slot | Bound to | Origin |
|---|---|---|
| `mapLayer` | `blockData.zoneGeojson` styled by colour spec | Adapter from `geojson.classified` (vector) or `images.map` (raster fallback) |
| `legend` | static `horizon-zones` legend component | colour spec |
| `summaryText` | `generated.summaryText` | `page2` prompt (`prompts.js:96-122`) |

The partial never knows whether the map came from HORIZON or Verterra — it only knows it has a `zoneGeojson` and a `summaryText`. That is what makes the ACWIS extension a *data + adapter* job, not a render rebuild.

---

## 4A. Render kinds, Canva authoring, and the marketing-grade guarantee

The design must not be prescriptive: marketing should be able to build or change a page in Canva and have it flow into the snapshot without a developer, and the output must be marketing-grade, not a CSS approximation of a designer's work. Both goals are served by one rule.

**The rule: we never re-implement a brand page in code. Fidelity comes from the design tool, not hand-written HTML.** The reason rebuilds like this end up looking vibe-coded is developers redraw the designer's layout in CSS. We don't. The renderer is chosen per block by `renderKind`; the brand document is rendered by Canva.

### Validated against the live Canva connector (2026-07-03)

- AgriProve brand kits exist in Canva: "AgriProve Branding" (`kAEhsYFCjew`), "AgriProve Platform" (`kAGVLzXXjdc`). `[high]`
- The Canva Connect API supports **autofill Brand Templates** (named data fields) and **PDF/PNG export**. `[high]`
- **Zero Brand Templates are published today** (autofill-capable or not). The HORIZON design is a plain Canva link, not a data-fielded Brand Template. So the setup — converting each snapshot page into a Brand Template with named fields — is a real prerequisite, and it is **marketing-owned Canva work, not dev work**. `[high]`

### Four render kinds

| `renderKind` | What it is | Who authors it | Fidelity | Data-bound? |
|---|---|---|---|---|
| `image` | A Canva page exported flat (no live data) | Marketing, self-serve | Marketing-grade (Canva render) | No |
| `canva-autofill` | A Canva **Brand Template** with named data fields, populated via the Autofill API | Marketing (design + fields) + us (data) | Marketing-grade (Canva render) | Yes |
| `overlay` | Canva background art + a few HTML slots positioned on top (today's dynamic pages work this way) | Marketing (art) + us (slots) | High, but CSS text over image | Yes |
| `native` | Fully HTML/CSS | Us | Web-grade | Yes |

### Which kind for what

- **Brand document → the landholder PDF → Canva.** Cover, the 7 educational/brand pages, and the narrative pages are `canva-autofill` (or `image` where there is no data). Copy edits and calc numbers flow in as autofill **text** fields; the zone/pH/depth maps and the portfolio map are generated server-side at print DPI and injected as autofill **image** fields. Economics numbers are autofill text fields inside a Canva-designed table. The whole PDF is Canva-rendered, so it is marketing-grade by construction.
- **Interactive web snapshot + internal tool → `native` HTML.** These are web surfaces where web aesthetics are correct. Interactive maps, engagement tracking, live economics what-ifs live here.
- **`overlay`** is the pragmatic bridge for parity if a page is not yet a Brand Template: keep the current "HTML over template PNG" pattern until marketing converts it to `canva-autofill`. Migration path, not the destination.

### Output contract: an exportable PDF that AgriProve owns. Never a Canva link. `[high]`

Canva is a **server-side render engine only**. The artefact delivered to the landholder is a single, self-contained, downloadable **PDF** that AgriProve generates, stores, and attaches to HubSpot or email. A canva.com share link is **never** sent. Consequences that make this the right call:

- The exported PDF is stored, so a re-send does not depend on Canva being up. A Canva outage degrades *new* generation, not delivery of already-exported snapshots.
- No external dependency or login is ever exposed to the landholder.
- The optional interactive web version (engagement tracking) is an **AgriProve-hosted tokenised URL**, a separate product surface, not a Canva link and not the PDF.

### Composition (add / remove / reorder while staying marketing-grade)

Do **not** assume Canva can assemble N template pages in arbitrary order in one API call (unvalidated, likely limited). Instead: autofill + export **each block-page** through its Brand Template to a PDF, then **merge the exported page PDFs server-side in block order** (a PDF library) into the single deliverable PDF. This keeps per-page marketing-grade fidelity *and* satisfies the editor's add/remove/reorder. `[moderate — confirm export throughput/latency; see §7]`

### The authoring loop (marketing self-serve)

1. Marketing designs or edits a page in Canva using an AgriProve brand kit, and defines the data fields (e.g. `propertyName`, `accuTotal`, `zoneMapImage`).
2. Publish it as a Brand Template.
3. In the tool, register a BlockType pointing at the `canvaTemplateId`; map block slots → Canva field names (a short visual step, or read the template dataset via the API).
4. A **publish gate** (PM/brand review) makes the block available in the picker. New/edited blocks carrying claims inherit the hedge/disclaimer rules — self-serve without shipping off-brand or unhedged copy.

### The fidelity guarantee, operationalised

Marketing-grade is not a hope, it is a gate. `[high]`

- Brand fonts embedded (licensed), not web-safe substitutes — automatic for Canva-rendered pages, enforced for any `native`/`overlay` page.
- Maps rendered server-side at print DPI as vector/high-res tiles — never client-side html2canvas (a prime source of the rough look), never pixel-walked rasters (§2.5).
- **Design-QA gate:** a designer signs off rendered output against the Canva reference on a fixed set of reference properties before launch, and automated pixel-diff guards regressions in CI. "No visible regression" is a hard gate, owned by design, not just PM.

## 4B. Marketing-authored templates + data binding (the data dictionary)

**Key requirement (explicit):** any template page marketing creates can be pulled into a snapshot, and quantified data auto-fills into the clearly identified areas of material interest, with no developer change. This section defines the contract that guarantees it. `[high — mechanism validated; see dependency note]`

### The mechanism

1. **A canonical data dictionary.** The system publishes one registry of every quantified value a snapshot can expose, each with a stable key, type, unit and display formatting. This is the menu of "areas of material interest" a template author can drop into a design.
2. **Marketing authors the page and names the fields.** In Canva (Brand Template) or the design tool, marketing places a data field wherever a number/name/map should appear and names it using a dictionary key or a known human alias.
3. **Auto-bind on import.** When the template is registered, the system reads its declared fields (via the Canva brand-template dataset API) and **auto-binds every field whose name matches a dictionary key or alias**. "Clearly identified area of material interest" = a field whose name resolves to the dictionary. Unmatched fields are flagged for a one-time manual map, or left static.
4. **Fill on render.** Matched text fields autofill with the formatted value (units and thousands separators enforced by the dictionary, e.g. "5,026 ACCUs", "36.55 ha", "5.5 ACCUs/ha/yr"); image fields receive the server-generated maps.
5. **Uniform across render kinds.** The same field-name convention drives `overlay` and `native` slots, so a value binds identically whether the page is Canva-rendered or HTML.

This is what makes the system non-prescriptive: adding a page is *authoring a template and naming its fields*, both marketing-owned. No enum of known pages, no code change per page.

### Data dictionary (seed) — the quantified values available to any template

| Key | Value | Type · unit · format | Source |
|---|---|---|---|
| `property.name` | Property name | text | parser |
| `property.address` | Address | text | parser |
| `property.totalArea` | Total area | number · ha | parser |
| `property.eligibleArea` | Eligible area | number · ha (2 dp) | parser |
| `property.eligiblePct` | Eligible % | number · % | parser |
| `env.rainfall` | Rainfall | number · mm (thousands sep) | parser |
| `env.phRange` | pH range | text · "A to B" | parser |
| `env.depthRange` | Soil depth range | text · "A to B m" | parser |
| `soil.dominant` | Dominant soil order | text | calculator |
| `soil.characteristics` | Water/productivity/stability | table rows | calculator |
| `calcs.accuRate` | ACCU rate | number · ACCUs/ha/yr | calculator |
| `calcs.totalAccu` | Est. ACCU potential (25 yr) | number · ACCUs (thousands sep) | calculator |
| `calcs.numProjects` | Number of projects | number | calculator |
| `calcs.baselineCost` | Option 1 baseline cost | currency · AUD | calculator |
| `calcs.deferredAccus` | Option 2 deferred ACCUs | number · ACCUs | calculator |
| `calcs.agriproveShare` | AgriProve 25% share of ACCUs | number · ACCUs | calculator (new) |
| `geo.namedNeighbour` | Credentialled nearby project | text | geoContext |
| `geo.within50km` / `100` / `200` | Nearby projects / measured increases | counts | geoContext |
| `maps.zone` | HORIZON zone map | image | render |
| `maps.ph` / `maps.depth` | pH / depth maps | image | render |
| `maps.portfolio` | Portfolio proximity map | image | render |

Aliases: keep a human-friendly alias table so marketing can name a field "Estimated ACCUs" and have it resolve to `calcs.totalAccu`. Aliases are additive; the canonical key always resolves.

### Guardrails

- **Formatting is owned by the dictionary, not the template** — units, rounding and thousands separators are applied on bind, so a value looks identical everywhere.
- **Unbound money/number fields are flagged**, never silently blank, so a page never ships with an empty "$____".
- **Copy rules still apply** to any generated prose fields (no em dashes, defensible language, disclaimer).
- **PII is not in the dictionary's copy scope** — `contactName`/`contactEmail` are delivery-only fields, never bindable into a landholder-facing page.

### Dependency

Auto-bind reads the template's declared fields via the Canva **brand-template dataset** API. Validated available through the connector (2026-07-03); **zero brand templates exist today**, so the first task is marketing building templates with named fields against this dictionary. `[high]`

## 5. Reused vs net-new against the existing engine

### Reused (lift the logic, re-home it in platform services)

| Asset | Where in repo | How it maps into the model |
|---|---|---|
| Parser structured shape | `parser.js:7-98` | `HorizonPayload` adapter output (`parsed`, `zoneStats`, `centroid`, `paddocks`) |
| Calculator constants + formulas | `calculator.js:11-139` | calc service feeding `agriprove-economics` + `portfolio-accu-potential` blocks. **Constants frozen:** `CORES_PER_CEA=24` (`:11`), `$12.50` (`:12`), `$50k` (`:13`), `PRICING_BANDS` (`:49-53`), `ACCU_RATES` (`:18-27`), `SOIL_CHARACTERISTICS` (`:30-44`) |
| Prompt templates | `prompts.js` (page2 `:96`, page4 `:160`, email `:207`, growth in combined `:315-321`) | become per-block `copyPrompt`s, keyed by `promptId` |
| geoContext / social proof | `app.js:1393-1440`, `buildGeoBlock` `prompts.js:124-158` | `agriprove-portfolio` source + adapter → `portfolio-accu-potential` block |
| Register system | `app.js:1637-1646`, branches in prompts | `snapshot.register`, `copy.registerAware` |
| Persistent Narrative Guide + editorial memory | `server.js:34-74`, `app.js:215-252` | `narrativeGuideId` + per-instance `editHistory` |
| Cost tracking | `server.js:274-290, 409-452`, `app.js:588-601` | `generated.costUSD` + snapshot rollup |
| HubSpot deep-link delivery | `app.js:781-801` | delivery step; portal `24224559`, `app-ap1.hubspot.com` |
| PDF export | `exportPDF` `app.js:710-773` + Puppeteer `server.js:306-349` | render pipeline step 4 (already Puppeteer server-side — keep) |

### Net-new

| Thing | Why |
|---|---|
| Data-Source Registry + Adapter layer | the extensibility unlock (FR-X1) — does not exist today |
| BlockType / Template / BlockInstance model + persistence | editing is "not really possible" today (brief) |
| Editor (add / remove / reorder / edit, with guardrails per §2.3) | the core unlock (FR-E1) |
| Slot-based render partials | replaces monolithic `renderAllPages` innerHTML string (`app.js:913-1089`) |
| Multi-kind renderer (`image`/`overlay`/`canva-autofill`/`native`) + per-page PDF merge | the marketing-grade + non-prescriptive requirement (§4A) |
| Canva Connect integration (Autofill + export) + Brand Template setup | brand kits exist; templates + data fields do not — marketing builds them (§4A) |
| Design-QA gate (designer sign-off + pixel-diff CI) | makes "marketing-grade" a gate, not a hope (§4A) |
| Live Economics fields (§2.4) | move `+25%` + option tables out of the PNG |
| Vector zone rendering (§2.5) | kills raster pixel-walking + crop + bounds-guess |
| GraphQL/S3 data load | replaces `/api/upload` ZIP (dev-only path retained) |
| PII field class + scope enforcement (§2.6, §8) | no controls exist today |
| Model selector wiring | repo hardcodes Sonnet; prod wants Haiku/Sonnet |

---

## 6. Why this shape (mental model to carry forward)

The design is **"content as data, rendering as pure function."** Three orthogonal axes that today are tangled together in `app.js`:

- **What data** (source + adapter) — swappable without touching render.
- **What words** (copy prompt + register + guide) — regenerable without touching data or render.
- **What it looks like** (partial + slots) — restyleable without touching data or words.

The reusable principle: *an extension point is wherever two of those three axes must vary independently.* HORIZON→Verterra varies data while holding render constant → the seam is the adapter. Standard→Stormboy varies words while holding data + render constant → the seam is the register. That is why the registry and the register are the two abstractions that earn their keep, and why (per §2.1) you should resist inventing seams the static pages will never use.

---

## 7. Open decisions to route to Gayathri (backend feasibility)

1. **Target stack meaning.** Prod today is static REST + html2canvas + Leaflet (brief v2). "Native/compatible with our platform" = React/Chakra in Frontier + TS BFF/GraphQL. Confirm the calc + copy services live in platform services calling the Anthropic SDK server-side (as today), and that the model outputs land on `SOCModelRun` with pre-signed S3 URLs (`BACKEND_SOLUTION_APPROACH.md:42-53`).
2. **Render approach.** Repo already does Puppeteer server-side for PDF (`server.js:306-349`) while live prod does client-side html2canvas (brief v2). Recommend standardising on **HTML template + Puppeteer + tokenised URL** (FR-R1) — it removes the client rasterisation fragility and gives a shareable preview URL. Confirm Puppeteer hosting.
3. **Vector zones (§2.5).** Can the model reliably emit clean `classified.geojson` so we render zones as vector, or do we stay on raster PNGs for Phase 1? This gates the biggest fragility fix.
4. **Canva render path (§4A).** Confirm the Canva Connect Autofill + export throughput/latency is acceptable on the render path, and validate whether page-order composition is done by per-page export + server-side PDF merge (assumed) or a Canva multi-page compose API. Confirm who in marketing owns building the Brand Templates + data fields (no templates exist today).

## 8. PII handling (flag)

The `/load` payload carries `contactName` + `contactEmail`. Design rules:

- Declare PII fields on the DataSource (`piiFields`) and as a **field class** in the adapter output.
- **Never** pass PII into copy generation (repo already excludes it — preserve).
- **Never** persist PII in the narrative cache, editorial memory, feedback payloads, or the tokenised preview URL. (Repo currently leaks it into feedback logs — `app.js:838-855` — fix.)
- Scope PII to the **delivery step only** (HubSpot deep-link / email), gated by user permission.
- Tokenised preview URLs must be time-boxed (prod already time-boxes the session token — brief v2) and must not embed PII in the query string.
