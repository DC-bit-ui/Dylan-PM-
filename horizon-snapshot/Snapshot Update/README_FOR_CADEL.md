# HORIZON Snapshot — Update bundle (2026-05-08)

Delta on top of yesterday's full zip. Extract this folder over the existing
project root, preserving paths. No `npm install` required, no rebuild — just
restart the Node server and hard-refresh the browser.

## How to apply

1. Extract this archive into your local copy of the project root, overwriting
   files with the same paths. (`Snapshot Update/server.js` → `<project>/server.js`,
   `Snapshot Update/public/templates/template_page_05.png` →
   `<project>/public/templates/template_page_05.png`, etc.)
2. Restart the Node server: `npm run dev`.
3. Hard-refresh the browser tab (`Ctrl+Shift+R`).

## What changed

| Area | Files | Notes |
|---|---|---|
| **Zone overlay opacity** | `public/js/app.js`, `public/index.html`, `CLAUDE.md`, `COLOUR_SPEC_FOR_HORIZON_OUTPUT.md`, `horizon_zones.qml`, `eligible_area.qml`, `farm_boundary.qml` | Spec bumped 40% → 80%. Page 2 frontend dims your zone fills to **60%** alpha at runtime — please ship `map.png` with zone fills at **100% opacity** (Strength `#008000`, Reference `#67B876`, Opportunity `#FF8300`); frontend handles the dimming. Outlines (farm boundary `#E74C3C` solid, eligible area `#1F3A2D` dashed) stay at 100%. Full spec in `COLOUR_SPEC_FOR_HORIZON_OUTPUT.md`. |
| **Page 5 + 12 templates** | `public/templates/template_page_05.png`, `template_page_12.png` | Re-imported from the updated Canva file. |
| **Page 4 layout** | `public/templates/template_page_04_clean.png` | Stripped Canva exemplar — used as the page 4 background. |
| **Narrative prompt** | `src/engine/prompts.js` | Approved page 2 + page 4 exemplars baked in. Defensible-language block hardened (forbidden words list expanded, "stoke enthusiasm" reconciled with no-overclaim). Page 4 close softened to a partnership invitation + lighter disclaimer. |
| **Editorial memory** | `server.js`, `public/js/app.js` | Per-snapshot guidance log + sibling-narrative state are sent with every regen so the model stays consistent across sections. Persistent Narrative Guide in Settings (localStorage) layers over the top. |
| **Credentialled neighbour data** | `public/data/accu_issued_companies.json`, `data/accu_companies_raw.json`, `scripts/build_accu_data.js` | 24 HubSpot companies with ACCUs issued, geocoded via Nominatim. Used to cite the closest credentialled project + ACCU count in narratives. Settings panel has a "Resync ACCU projects" button that re-runs the geocoder. |
| **Growth Summary** | `server.js`, `public/index.html`, `public/js/app.js`, `src/engine/prompts.js` | Internal-only narrative for the Growth team — not in the PDF. Generated alongside the snapshot. Standalone panel in the sidebar with copy-to-clipboard + regenerate. |

## What's in this bundle

```
CLAUDE.md
COLOUR_SPEC_FOR_HORIZON_OUTPUT.md
horizon_zones.qml
farm_boundary.qml
eligible_area.qml
server.js
src/engine/prompts.js
public/index.html
public/js/app.js
public/data/accu_issued_companies.json
public/templates/template_page_04_clean.png
public/templates/template_page_05.png
public/templates/template_page_12.png
data/accu_companies_raw.json
scripts/build_accu_data.js
```

Total: 15 files, ~2.7MB.

## Anything broken?

Drop me a note (Dylan) and we can iterate.
