# Grazing Management Tool — project home

**HORIZON Grazing Insights → interactive infrastructure planner.** Everything for this project lives here. Started 2026-07-08 (Dylan + Hobbs).

## What this is (one paragraph)

A two-surface product that turns a farmer's HORIZON soil-carbon map into a management plan. A **static insight page** inside the HORIZON Snapshot ("Where to start") teaches the principles and links to a **live interactive planner** where the farmer subdivides their property, sees rest-period payoff, and plays a 10-year build-out forward. Strategic purpose: move farmers from *"should I do a soil carbon project?"* to *"how do I structure my business to enable one?"* — the Snapshot is the acquisition engine; management insight is the wedge. Demo-first: no sanctioned build path yet; the job now is a team "aha" and a build decision.

## Folder map

| Path | What |
|---|---|
| `demo-kit/` | **The working kit.** Tested scripts + paste-ready prompts + built Glenlogie bundle. Start at `demo-kit/HANDOFF.md`. |
| `demo-kit/MASTER-PROMPT.md` | The consolidated Claude Design prompt (full flow, static entry, no-map journey). |
| `demo-kit/ITERATE-PROMPT.md` | Single restructure prompt to point the EXISTING Claude Design project at a new property. |
| `demo-kit/HANDOFF.md` | Run sheet: create project → attach files → paste → iterate. |
| `demo-kit/TECH-IMPLEMENTATION-PLAN.md` | Dev handoff: P0 demo / P1 pilot (3–5 dev-days, zero new backend) / P2 product. |
| `demo-kit/SNAPSHOT-GENERATOR-REQUIREMENTS.md` | R1–R7 + build prompt for the "Where to start" page in the Snapshot v2 build. |
| `demo-kit/adapt_horizon_export.py` | Turns a raw HORIZON export into `demo_bundle.json` (parcel units, zone bands, buildable splits, heat overlay). Tested. |
| `demo-kit/prep_demo_data.py` | Core geometry engine (equal-area splits, buildability checks, recovery-cell carving). Selftest passes. |
| `demo-kit/glenlogie/` | **Built bundle for the demo property** (Glenlogie/Ardrossan) + heat overlay + verification render. |
| `demo-kit/farm217/` | First test property bundle (Farm 217 — Coleambally, likely cropping; superseded by Glenlogie). |
| `specs/` | The three design guides (v1→v3, v3 current) + Hobbs's two source docs (one CONFIDENTIAL). |
| `source-data/` | Raw HORIZON exports (Farm 217, Glenlogie full), Glenlogie cadastral parcels, Hobbs meeting transcript. |
| `glenlogie-claude-design-pack.zip` | Zipped attachment pack for Claude Design. |

## Where to start by goal

- **Run the demo:** `demo-kit/HANDOFF.md` → attach `demo-kit/glenlogie/*` + `specs/*.docx` → paste `demo-kit/MASTER-PROMPT.md`.
- **Hand to devs:** `demo-kit/TECH-IMPLEMENTATION-PLAN.md` + the two `.py` scripts + `demo-kit/glenlogie/demo_bundle.json` (data contract by example).
- **Build the Snapshot page:** `demo-kit/SNAPSHOT-GENERATOR-REQUIREMENTS.md`.
- **Understand the thinking:** `specs/2026-07-08-grazing-scenario-tool-claude-design-guide-v3.md` (current; v1/v2 are superseded, kept for history).

## Standing rules this project established (in `../memory/`)

- **Implementability is the gate** — generator omits unbuildable splits; human logic review before any farmer sees a plan. Fail closed, not open. (`memory/learnings/2026-07/2026-07-08-implementability-first-grazing-planner.md`)
- **Technically lightweight** — no month-long timelines; pilot = zero new backend services. (`memory/learnings/2026-07/2026-07-08-technically-lightweight-delivery-principle.md`)
- **Snapshot-as-acquisition + funnel reframe** — Tier 2, branch `cowork/strategy-snapshot-acquisition` (`memory/business/strategy.md`).

## Open items (as of 2026-07-08)

1. **Export discrepancy** — two Glenlogie exports disagree: eligible 327 vs 274 ha, rainfall 1236 vs 808 mm. Resolve source-of-truth with the HORIZON side before farmer-facing numbers ship.
2. **Named paddocks** — Glenlogie units are cadastral parcels; the tool's naming step lets Hobbs/farmer name them. Pre-naming needs the paddock map as an attached image FILE (not pasted inline).
3. **`l1_soc` scale** — Glenlogie raster (0.6–2.7) differs from Farm 217 (~33.6). Relative ranking only; confirm what `l1` denotes before any absolute SOC on screen.
4. **Metaphor clearance** — the two-bank-accounts + solar-panel "why carbon" metaphors derive from a Confidential doc; Hobbs to clear for farmer-facing use.
5. **Cadel vector question** — are zones + paddocks retrievable as vectors per property platform-side? (Export confirms zones ARE vectors; production path needs the platform answer.)
6. **Git push** — the repo is ~47 commits ahead of origin with no VM credentials; push from Claude Code / a git client.

## Source meetings & inputs
- Granola: "Grazing management insights via Snapshots" 2026-07-08 (e29d2cb6…) — transcript in `source-data/`
- Hobbs docs: `infrastructure_planning_principles` (abstracted rule engine) + `paddock_planning_principles` (deep science, CONFIDENTIAL) — in `specs/`
- Demo property: Glenlogie (Ardrossan Angus & Ultrablack Stud, Rob Bulle; Jingellic NSW; grazing; Hobbs-owned, farm visit + snapshot complete)
