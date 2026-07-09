# Grazing Planner — Technical Implementation Plan (lightweight by design)

**Date:** 2026-07-08 · **Owner:** Dylan · **Principle (Dylan directive):** technically lightweight — no month-long delivery; design as close to product as possible; scripts + this plan hand straight to devs.
**Effort figures are PM estimates [ASSUMPTION] — pending eng review (Steve/Gayathri/Athul).**

## The core architectural claim

**The pilot needs ZERO new backend services.** Everything heavy is precomputed
by a tested Python script; the tool is a static client-side page reading one
JSON file. The only platform touch is one page in the snapshot generator and
one link.

```
HORIZON export (exists)                    Snapshot profile (in build)
      │                                          │
      ▼                                          ▼
adapt_horizon_export.py ──► demo_bundle.json    "Where to start" page
(tested: selftest + 2 real   + heat_overlay.png  (R1–R7, static, CTA)
properties; runs anywhere)          │                 │
                                    ▼                 │ ?p=<token>
                            S3 object per property ◄──┘
                                    │
                                    ▼
                     Static React page (planner) — client-only,
                     reads bundle by token, Mapbox satellite base
```

## Phases

### P0 — Demo (now, 0 dev-days)
Claude Design prototype on the Glenlogie bundle. Prep script run manually
(Dylan/Claude Code) per property. Share link / HTML export. Outcome: team
"aha" + pilot approval. **Already in hand.**

### P1 — Pilot (est. 3–5 dev-days total [ASSUMPTION])
1. **Bundle generation as a pipeline step (~1 day):** run
   `adapt_horizon_export.py` at the end of snapshot generation (it's Python —
   fits the existing Temporal worker context or a simple post-hook). Output
   bundle + overlay to S3 under a random-UUID key = the unguessable token.
   No schema changes; S3 objects only (files→S3 is the platform's existing
   pattern).
2. **Planner as a static page (~1–2 days):** Claude Design → "Hand off to
   Claude Code" → React page served from existing static hosting. Reads
   `?p=<token>` → fetches bundle from S3. Client-only; Mapbox GL with the
   existing platform token (reuse decision 2026-06-16). No login, no writes.
3. **Snapshot page + CTA (~1 day):** implement SNAPSHOT-GENERATOR-
   REQUIREMENTS.md (R1–R7). Concierge fallback until planner URL is live.
4. **Analytics (~0.5 day):** page_viewed / cta_clicked / planner_opened /
   plan_saved(local) events into the existing analytics path; farm-type tag.

What P1 deliberately does NOT do: save farmer edits server-side (edits live
in localStorage + a "email me my plan" render), no paddock entity, no new
API, no auth.

### P2 — Product (est. 2–3 weeks [ASSUMPTION] — only after pilot evidence)
- Paddock/cell entity (NEW domain entity → schema migration — the one
  genuinely costly item; flagged early per backend cost heuristics)
- Persisted farmer edits + return sessions; per-farm hero render at snapshot
  generation (same renderer, personalised Surface A)
- Vectors via GraphQL instead of S3 bundles; capacity-weighted splits
  (heat-map-native maths) in the generation step

## Handoff package for devs
- `adapt_horizon_export.py` + `prep_demo_data.py` — tested (synthetic selftest,
  Farm 217, Glenlogie); deps: shapely/pyproj/pillow/numpy/rasterio; no GDAL
- `glenlogie/demo_bundle.json` — the data contract, by example (units,
  splits[N].{cells,fences,cell_areas_ha,logic}, recommended_n, rules block)
- Claude Design handoff bundle (design intent + chat) → Claude Code
- `SNAPSHOT-GENERATOR-REQUIREMENTS.md` — the snapshot page spec
- Open technical questions for eng: which S3 bucket/prefix; where the
  farm-type qualifier lands in intake data; existing analytics event schema;
  confirm l1_soc scale semantics with HORIZON side

## Risks
- **Export inconsistency** (two Glenlogie runs disagree on eligible ha +
  rainfall) — resolve source-of-truth with HORIZON side before farmer-facing
  numbers ship
- **Post-Cadel review capacity** — this plan assumes Steve/Gayathri can
  review in days, not weeks; P1 scope is sized so one dev owns it end-to-end
- **Scope creep guard:** anything requiring a schema migration or a new
  service belongs in P2, behind pilot evidence. Say no by default.
