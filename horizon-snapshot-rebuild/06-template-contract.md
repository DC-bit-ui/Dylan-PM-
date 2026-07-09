# Template Contract + current-tool production facts

**Author:** Dylan Cronje (with Claude) · 3 July 2026
**Purpose:** Define what an uploaded template (Canva link preferred, PDF fallback) must provide so Claude and the pipeline can fill it reliably, and ground it in how the current Claude-code snapshot creator actually works. Feeds the Claude Design "template contract" + a marketing-facing Template Authoring Guide.

---

## 0. The key point up front

The current tool has **no slot recognition**. It is hardcoded: Canva pages are exported to PNGs used as full-page backgrounds, and dynamic content is HTML overlaid at fixed CSS coordinates per page. So "upload any template and it recognises where to edit" is **entirely net-new**. The core design decision is the **slot-declaration mechanism** (§2). Everything else follows from it.

Set expectation with marketing: reliable auto-fill comes from templates that *declare* their variable areas. The Canva-link path is preferred precisely because Canva can carry those declarations natively (named data fields). A raw PDF cannot, so it needs tokens or a one-time manual mapping.

---

## 1. Current creator — production ground truth (answers to Claude Design's 5 questions)

All `[high]`, read from `C:\Dylan PM\horizon-snapshot` source.

**1. How it locates copy/maps today:** hardcoded, not declared. Static pages are exported Canva PNGs (`template_page_01..12.png`) used as page backgrounds (`app.js:926-927`). Dynamic content is HTML overlaid at fixed CSS coordinates per page (e.g. the page-2 narrative frame at `top:70.7%; left:7.41%; width:85.2%; height:23%`, `index.html:725-732`). Placement is per-template hardcoded in the client. No named layers, no placement sidecar.

**2. Field-key namespace (line these up 1:1 in the dictionary):** the runtime state object.
- `parsed.*`: `name, address, totalArea, eligibleArea, eligiblePct, contactName, contactEmail` (PII — never bindable to landholder-facing copy), `productionSystem, rainfall, soilClasses[], phMin, phMax, depthMin, depthMax` (`parser.js:7-40`)
- `calcs.*`: `landUse, accuRate, eligibleArea, eligiblePct, totalAccu` (25-yr), `numProjects, totalCores, costPerCore, baselineCost, deferredAccus, rainfall, phMin/phMax, depthMin/depthMax, soil.dominant, soil.all[], soil.allChars[]` (name/water/productivity/stability), `agriproveShare` (new = 25% of `totalAccu`) (`calculator.js:107-139`)
- `images/maps.*`: `map` (zone), `map_ph`, `map_depth`, plus `portfolio` (`server.js:161-167`, `app.js:1443-1516`)
- `geoContext.*`: `within50km/within100km/within200km` (accusIssued/measured/existing), `closest`, `namedNeighbour` (`app.js:1393-1440`)
- `zoneStats.*`: per-zone median/MAD/delta (`parser.js:46-59`)
New fields require a dictionary addition first.

**3. Maps + legends today:** each map is a Leaflet `imageOverlay` of the model PNG over Esri World_Imagery satellite, placed in a hardcoded page region; bounds approximated from `input.geojson` + 10% padding (`app.js:1230-1288`). The model PNG bakes in a legend strip which the tool **crops out** via CSS overflow (`index.html:740-742`). Legends are then drawn separately: page 2 = HTML legend in code with colour-spec hexes (`app.js:934-942`); page 3 = static legend images `legend_ph.png` / `legend_depth.png` (`app.js:969-970`); page 4 = Leaflet control legend. For PDF the Leaflet maps are rasterised via html2canvas and swapped as `<img>` (`app.js:710-773`).

**4. Manifest:** a **data** manifest exists (`metadata.txt` in the ZIP), no **template/placement** manifest. `metadata.txt` schema (line-based `key: value`, `parser.js:13-31`): `Project name`; `Total input area: N ha`; `Eligible area: N ha`; `Eligible percentage: N%`; `Address`; `Contact/Landholder/Customer name`; `Contact email`; `Production systems`; rainfall; `Soil classes in eligible area` (comma list); `pH range in eligible area: A - B`; `Soil depth range in eligible area: A - B m`. ZIP files: `map.png, map_depth.png, map_ph.png, horizon_landscape.geojson, input.geojson, classified.geojson`. A placement manifest is net-new for this feature.

**5. Page keying:** a fixed array of 12 (index 1..12), dynamic = `{1,2,3,4,6}` (`app.js:35-40`), each backed by `template_page_NN.png`. No opportunity/interest keying — multi-opportunity include/exclude is net-new (interest tags per block/page, doc 01 §4C).

---

## 2. Slot-declaration mechanism (the core decision) — per source

A template is a fixed visual frame + declared, addressable slots. The system only ever writes into named slots; static art is never touched. How slots are declared depends on the source:

**Canva link (preferred).** The template is a Canva **Brand Template**; its slots are its **named data fields**, read via the Connect brand-template dataset API. Canva **text fields** = copy/data slots; Canva **image fields** = map/image slots. Field names must equal a **dictionary key or a known alias**; unmatched fields are flagged, never auto-filled. Copy fields carry a declared **max-length budget** (the frame is fixed). This is why Canva-link is preferred: Canva natively carries the slot declarations, so "recognise where to edit" is a dataset read, not guesswork.

**PDF (fallback).** A raw PDF has no named slots, so one of:
- (a) **Placeholder tokens** in the PDF text — `{{property.name}}`, `{{calcs.totalAccu}}`, `{{maps.zone}}` — located by text + position; or
- (b) a **one-time manual slot-mapping** step on import (user draws boxes, assigns field keys).
Do not rely on AI auto-detection of arbitrary PDF regions; treat it as assistive only, always confirmed.

---

## 2A. Native fields, not overlays — the fix to "pasted-over" text

**Past failure mode:** the old tool overlaid HTML text boxes at fixed coordinates on top of a flattened page image. Two layers that do not know about each other, so the overlay text misaligns with the design, uses the wrong font, and boxes overlap other elements or the baked "[Insert here]" shows through. It reads as pasted-over because it is.

**The fix is structural:** personalised copy must be a **native text field inside the design, never an overlay on a flattened image**.
- **Canva-link path:** copy/data slots are native Canva Brand Template text fields. Autofill replaces the content and Canva re-renders; text lands in the designer's frame with the designer's font/alignment/wrapping, and cannot misalign or overlap other elements because Canva constrains it to its frame.
- **PDF path:** reliable only if the PDF carries real **form fields** (AcroForm), filled like Canva fields. A flat PDF with baked placeholder text is the worst case (the cause of the old mess) and is discouraged; if unavoidable it drops to a lower-fidelity manual overlay.

**Containment even with native fields:** every copy field declares a length budget; generation targets it; autofit shrinks to a minimum font floor then truncates. Frame-bounded, so copy never spills onto adjacent art.

**Placement vs intent — two different axes:**
- **Placement = named native fields** (structural, reliable). This is how the system knows where copy goes. Do not use a prose "guide" to position text; Claude cannot place text into pixel-accurate frames from a description.
- **Intent = an optional per-field authoring note** (tone, length, what to convey) that shapes the copy the generator writes for that field. This is where a marketing "guide" adds value: it shapes the words, not the position.

Canonical field naming uses the dictionary label ("Property name" = `property.name`); friendly aliases ("Farm name") are supported via the alias table.

## 3. Slot types and what each must declare

Slot types: **copy** (generated narrative), **data-value** (single dictionary value), **map/image** (framed rectangle), **static** (everything else, not addressable).

Every slot declares: **field key** (stable, maps to a dictionary value), **type** (text/number/currency/map/image), **opportunity scope** (`shared` or one interest: soil/acwis/reef/plantings).

- **Copy slots:** max character/word budget; overflow behaviour = autofit-shrink to a min font floor then truncate, never spill onto art; one field per frame (no concatenating generated + static text in one run); register-agnostic (same slot takes Standard or Stormboy); one summary per opportunity, scoped to its page.
- **Data-value slots:** formatting inherited from the dictionary, overridable per slot (`ha` vs `hectares`, `~5,026` vs `5026`); never-blank — a mapped number/currency always resolves or shows a flagged state, never an empty frame.
- **Map/image slots:** own defined rectangle (position, aspect, crop) = exactly what prints; maps are **separate slots, not stacked layers** (zone, pH, depth, portfolio, and each opportunity's map). Sized for **300 dpi** at print.

---

## 4. Legend ownership (decision)

**Default for the rebuild:** the tool **composes each map image including its legend** (code-drawn, colour-spec accurate, position per the per-map framing window in prompt J) and injects **one image** into the template's map slot. Marketing therefore only reserves the map rectangle and does **not** bake a legend. (Per-map alternative — marketing bakes a static legend and we inject a legend-less map — is allowed but not the default.) This resolves today's split approach (HTML legend page 2, static images page 3, Leaflet control page 4) into one consistent, tool-controlled path, and matches the colour-spec ask to remove the model's baked legend strip.

---

## 5. The dictionary is the contract boundary

A template can only bind to values in the data dictionary (doc 01 §4B): property name, address, total/eligible area, eligible %, rainfall, pH range, soil depth range, dominant soil + characteristics, ACCU rate, estimated potential, number of projects, Option 1 baseline, Option 2 deferred, AgriProve 25% share, named neighbour, and the zone/pH/depth/portfolio maps. A field mapping to nothing must be marked static or the template is not send-ready. New data needs a dictionary addition first.

## 5A. Extending the dictionary — new and partner metrics (e.g. LawrieCo)

Partners and campaigns will want metrics not in the core HORIZON dictionary. The dictionary extends without destabilising the core.

**Three ways to populate a new field (binding):**
1. **Manual** — the user enters the value per snapshot. Fast path, no engineering. Best for partner one-offs like LawrieCo's bespoke metrics that have no data feed yet. Honours the never-blank rule (flagged, never silently empty).
2. **Computed** — derived from data we already hold; add to the calc layer.
3. **Source** — from a new or existing data source via the registry adapter (may carry a data contract / dependency, like ACWIS/Reef).

A field can be **upgraded from manual → computed → source later without changing the template**, because the field key is stable. So LawrieCo can ship a template today with manual fields, and we wire a real feed later with no template change.

**Namespacing keeps the core clean:**
- `core.*` (HORIZON) plus scoped namespaces, e.g. `lawrieco.*`, `custom.*`.
- Partner fields are scoped to their partner/interest so they appear only for relevant templates and never clutter the core picker.

**DictionaryField schema:**
```jsonc
DictionaryField {
  "key": "lawrieco.biologicalScore",
  "label": "Biological score",           // plain language shown in the Hub
  "namespace": "core" | "lawrieco" | "custom",
  "type": "text" | "number" | "currency" | "map" | "image",
  "unit": "index", "format": "0.0",
  "binding": "manual" | "computed" | "source",
  "sourceRef": "dataSourceId + path",     // when source
  "scope": ["lawrieco"],                  // partners/interests where visible
  "status": "proposed" | "approved" | "live"
}
```

**Governance (PM-owned, doc 07 §4.5):** request → PM approves → field added (key, type, unit, format, binding, scope) → available to bind. Reuse existing fields where possible, avoid duplicates, and run a periodic curation review to prevent sprawl. Send-ready still applies: a field bound to nothing is not Live-able; a **manual** binding counts as bound (the user must supply it).

**Worked example — LawrieCo "Soil Carbon Eligibility Report" (v6):** a partner template that embeds the AgriProve HORIZON pages inside LawrieCo's own branded report. It exercises all three bindings at once.

| LawrieCo content | Binding | Field |
|---|---|---|
| Farm name, location, property size, rainfall, farming activity | reuse core | `property.*`, `env.rainfall`, `productionSystem` |
| HORIZON zone / pH / depth maps + carbon indicators | reuse core | `maps.*`, soil characteristics |
| Farm management + fertiliser history, agronomic challenges | manual (copy) | `lawrieco.farmMgmtHistory`, `lawrieco.fertiliserHistory`, `lawrieco.agronomicChallenges` |
| Historic testing reports / photos | manual (image) | `lawrieco.historicTestPhotos` |
| New soil & microbe test outputs | source (LawrieCo lab feed; manual to start) | `lawrieco.soilTestOutputs`, `lawrieco.microbeTestOutputs` |
| Agronomic analysis, prescription program, prescription summary | manual (copy) | `lawrieco.agronomicAnalysis`, `lawrieco.prescriptionProgram`, `lawrieco.prescriptionSummary` |

## 6. Send-ready gate (Template Hub enforces before Live)

Every declared slot is mapped to a dictionary value **or** explicitly static; every map slot has a defined frame + legend decision; every copy slot has a length budget; page order/roles set (cover + contact locked); brand fonts embedded; bleed/margins/safe-zones set for print-grade PDF.

## 7. PM notes / risks

- **Steer marketing to the Canva-link path.** PDF auto-recognition is the fragile part; make Canva Brand Templates with named fields the sanctioned way, PDF-with-tokens the exception.
- **Real dependency = the naming convention + Template Hub.** The feature only works if field names line up with the dictionary and a send-ready gate enforces it. That is the build, more than the upload UI.
- **Dictionary-addition process** is a governance need: new insights (ACWIS/Reef metrics) require adding dictionary keys before templates can bind them.
