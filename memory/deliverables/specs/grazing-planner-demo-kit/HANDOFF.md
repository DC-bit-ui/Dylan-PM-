# Claude Design Handoff — Glenlogie Grazing Infrastructure Planner

**Run sheet, 2026-07-08.** Everything Claude Design needs, in order.

## 1. Create project
claude.ai/design → New project → name: `HORIZON Profile — Grazing Infrastructure Planner (Glenlogie)`

## 2. Attach these files (from `glenlogie/` in this kit + specs folder)
| File | Why |
|---|---|
| `glenlogie/demo_bundle.json` | THE data: 18 real cadastral units, zone bands, buildable splits N per unit, recommended_n, logic metrics |
| `glenlogie/heat_overlay.png` + `glenlogie/heat_overlay.bounds.json` | Platform's own gradient render, georeferenced — the heat layer |
| `../2026-07-08-hobbs-infrastructure-planning-principles.docx` | The rule engine (farmer-facing language) |
| `../2026-07-08-hobbs-paddock-planning-principles-CONFIDENTIAL.docx` | Deep science — for the model's understanding, NOT for on-screen copy |
| HORIZON Analysis screenshot (Dylan attaches from platform) | Visual continuity target |
| 2–3 farm map draw tool screenshots (Dylan attaches) | Interaction style reference |

## 3. Paste the prompt
The fenced block in `MASTER-PROMPT.md`. One paste. Wait for full generation (2–10 min).

## 4. Iterate
Run MASTER-PROMPT's numbered iteration prompts one at a time. Then the
"second design pass" (no-paddock-map journey) once the core flow works.

## 5. Before anyone demos it
`README.md` → Demo-day checklist. Non-negotiables: logic review by Hobbs;
no eligibility claims on screen; offline/link dry-run same day.

## Known data caveats (say these out loud in the demo if asked)
- Two Glenlogie exports disagree: eligible 327 vs 274 ha, rainfall 1236 vs
  808 mm. Resolve with HORIZON side before farmer sees numbers.
- Units are cadastral parcels until the farmer names/adjusts them (naming
  step is in the flow). l1_soc raster scale differs from t/ha — relative
  ranking only, no absolute SOC on screen.
