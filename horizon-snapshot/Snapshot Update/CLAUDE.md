# CLAUDE.md — HORIZON Snapshot Generator

## What this is

A Node.js tool that automates the creation of AgriProve HORIZON Snapshot documents — 12-page sales/recruitment PDFs for Australian landholders considering soil carbon projects.

**Phase 0** (current): Standalone local web app. Upload a model output .zip, enter a Claude API key, generate narratives, review inline, export PDF.
**Phase 0.5** (next): Wire into Frontier (internal tool) via backend APIs. Cadel owns backend; see `../HORIZON_Snapshot_Backend_Handoff.md`.
**Phase 1**: Full platform integration.

## Architecture

```
horizon-snapshot/
├── server.js              # Express server — all API endpoints
├── src/
│   ├── engine/
│   │   ├── parser.js      # Parses metadata.txt + GeoJSON from model output
│   │   ├── calculator.js  # ACCU rates, pricing bands, soil characteristics
│   │   └── prompts.js     # Claude prompt templates (Page 2, Page 4, email)
│   └── api/
│       └── claude.js      # Anthropic SDK wrapper (server-side, no CORS)
└── public/
    ├── index.html          # UI shell — sidebar panels + 12-page preview
    └── js/
        └── app.js          # Frontend logic — upload, render, export
```

## Key domain concepts

- **HORIZON model output**: A .zip containing `metadata.txt`, map images (`map.png`, `map_depth.png`, `map_ph.png`), and GeoJSON files (`horizon_landscape.geojson`, `input.geojson`, `classified.geojson`).
- **Zones**: Strength (high SOC), Stable/Reference (baseline), Opportunity (upside potential). Colors at 80% opacity: Strength=#008000CC, Reference=#67B876CC, Opportunity=#FF8300CC.
- **ACCU**: Australian Carbon Credit Unit. Rate determined by rainfall band x land use (pasture/cropping). See `calculator.js` lookup tables.
- **CEA**: Carbon Estimation Area. 24 cores per CEA (NOT 16 — the old PDF is stale).
- **Eligible area**: Total property minus forests, infrastructure, waterways (excluded via satellite).
- **Two communication registers**: Standard (partnership tone) and Stormboy (high-energy, value-driven).

## Confirmed numbers (2026-05-05)

- CORES_PER_CEA = 24
- Deferred ACCU price = $12.50
- Max deferred baseline = $50,000
- Pricing bands: see `calculator.js` PRICING_BANDS array
- ACCU rainfall rates: see `calculator.js` ACCU_RATES object

## Running

```bash
npm install                  # First time only
npm start                    # http://localhost:3000
npm run dev                  # Auto-reload on changes
```

Puppeteer (PDF export) downloads Chromium on first install. If you don't need PDF export during dev, set `PUPPETEER_SKIP_DOWNLOAD=true` before `npm install`.

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/upload | Upload .zip or metadata.txt, parse + calculate |
| POST | /api/config | Set Claude API key |
| POST | /api/generate | Generate narratives (all or single page) |
| POST | /api/prompt | Get raw prompt text (for manual copy-paste) |
| POST | /api/export-pdf | Render HTML to PDF via Puppeteer |
| POST | /api/calculate | Recalculate with overrides (e.g. land use) |

## Testing with real data

Two model output zips are available in the parent directory's uploads:
- `dawlish.zip` — Dawlish Road, 39 ha, 1542mm rainfall, Sodosol, 1 project
- `castle_hill.zip` — Castle Hill, 8336 ha, 640mm rainfall, Chromosol/Rudosol/Vertosol, 11 projects

Expected calculation results are documented in the test output from 2026-05-05.

## Rules for generated copy

- NO em dashes (use commas or full stops)
- Use ONLY defensible language: "estimated", "potential", "could support"
- Include geospatial disclaimer
- Page 2 (HORIZON Summary): ~150 words, zone-location-specific
- Page 4 (Property Summary): ~145 words, soil + rainfall + depth + regional context
- Email: ~150 words, reference property by name, CTA for 30-min call, sign off as Ben

## What NOT to change without checking

- `CORES_PER_CEA` — confirmed at 24 by Dylan on 2026-05-05
- `PRICING_BANDS` — confirmed from pricing image on 2026-05-05
- `ACCU_RATES` — confirmed from ACCU rainfall assumptions PDF
- `SOIL_CHARACTERISTICS` — confirmed from soil type characteristics PDF
- Prompt templates — designed to match the manual process doc; changes affect output quality

## Priority work for demo (2026-05-06)

### 1. PDF template fidelity — match Canva exactly (CRITICAL)

**Quality bar: this document goes directly to landholders as a sales tool. It must match or exceed the Canva template quality. The current rendering is unacceptable — floating maps, visible "[Insert here]" placeholders, misaligned text, and broken layout. This is the #1 priority.**

All 12 template page images are in the project root (`template_page_01.png` through `template_page_12.png`) and the full PDF is at `HORIZON_Snapshot_Template_0505.pdf`. Use these as the ground truth — open each template image, study the exact layout, then reproduce it in HTML/CSS.

Known issues in current rendering (from screenshots 2026-05-06):
- **Cover page (Page 1):** "[INSERT PROPERTY NAME]" placeholder still visible — should be replaced with parsed property name
- **Maps pages (Pages 3, 5, 6):** SOC zone map, depth map, and pH map are floating/overlapping with no proper positioning. They need to sit in the exact frames the Canva template defines
- **Carbon Indicators (Page 5):** Table layout is approximate, not matching the Canva structure
- **ACCU calculations (Page 4):** "[Insert here]" placeholders visible where calculated values should be injected
- **Economics (Pages 7-8):** Baseline sampling price shows "[Insert here]" — should show calculated value; Option 2 table layout doesn't match Canva
- **General:** Typography, spacing, and colour application are off throughout. Every page needs to be compared side-by-side with its template_page_NN.png and corrected

Approach: study each template_page_NN.png image carefully. Build the HTML/CSS page-by-page to match. Calculated values and generated narratives overlay onto the template structure — every placeholder gets replaced with real data. Maps get positioned into their exact template frames.

### 2. Settings page — persistent API key

Currently the user must enter their Claude API key each time they generate narratives (Step 2: Edit). This is poor UX for repeat use. Add a settings page or panel where:
- The API key is saved to `localStorage` (or a server-side config file)
- The key persists across sessions
- The Generate panel auto-uses the saved key
- There's a way to update/clear the key from settings
- Visual indicator showing whether a key is configured

This could be a gear icon in the header that opens a settings modal/panel, or a dedicated Settings tab.

### 3. Map preview and positioning

The model output ZIP contains three map images (`map.png` — SOC zones, `map_depth.png` — soil depth, `map_ph.png` — pH) which are already extracted as base64 during upload. These maps are critical to the snapshot — they're what the Ops/Growth team references when talking a landholder through their property.

Requirements:
- Users need to **see the maps in the Review step** so they can inspect zones before generating narratives
- Users need to **position/fit each map** to its specific placement on the template page (e.g. map.png goes on Page 3, depth/pH maps on Page 5/6) — cropping, scaling, or dragging to align with the template layout
- The map placement should persist into the PDF export
- Consider a simple drag-to-position or bounding-box approach rather than a full image editor — this is about fitting the map to the property's AOI within the template frame, not pixel-perfect editing

The maps are available in `state.images` after upload (keys: `map`, `map_depth`, `map_ph`). GeoJSON data is also available in `state.geojson` (landscape, input, classified) if interactive map rendering is worth exploring later — but for Phase 0 demo, the static PNGs positioned onto the template pages are sufficient.

## Template assets

All in project root:
- `template_page_01.png` through `template_page_12.png` — individual page renders from Canva
- `HORIZON_Snapshot_Template_0505.pdf` — full 12-page PDF
- `test-data/dawlish.zip`, `test-data/castle_hill.zip` — real model output for testing

## VM build notes (from Cowork)

The current `app.js` (813 lines) and `index.html` (634 lines) were built in a Cowork VM environment that had mount-sync issues with template literals and arrow functions. These were replaced with string concatenation and `function(){}` syntax as workarounds. **Claude Code should modernise back to idiomatic ES6+** — template literals, arrow functions, `const`/`let` are all fine in a real Node/browser environment.

## Dependencies

- `express` — HTTP server
- `multer` — file upload handling
- `jszip` — .zip extraction
- `@anthropic-ai/sdk` — Claude API (server-side)
- `puppeteer` — PDF generation via headless Chrome
