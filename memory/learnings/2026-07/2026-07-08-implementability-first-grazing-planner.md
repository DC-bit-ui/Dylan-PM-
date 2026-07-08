# Implementability is the gate — grazing planner design rule

**Date:** 2026-07-08
**Source:** Dylan (Cowork session, evening) + Hobbs transcript "Grazing management insights via Snapshots" 2026-07-08 ("I had it take a stab at subdividing — horrible failure... we don't want to do that"; "it's up to them to decide where they want to put the water points and how they want to do the fencing")
**Confidence:** [high] — explicit Dylan directive

## The rule
For the grazing infrastructure planner (and any farmer-facing spatial recommendation): **every generated suggestion must be something a farmer could physically implement, and must pass a logic review before farmer exposure.** Auto-generation is acceptable only when constrained to buildable geometry; unbuildable options are omitted, not styled.

## How it's encoded (from the beginning, per Dylan)
- L1 generator constraints: contiguous cells, >=120 m width, aspect <=6:1, >=6 ha, 8-orientation search for a buildable cut; sparse-N sliders rather than fake options. `specs/grazing-planner-demo-kit/prep_demo_data.py` (validate_cells, split_buildable)
- L2 practicality: fence-km surfaced per scenario; existing water/fence marking is the next lever
- L3 human gate: named review (Hobbs) before any farmer sees a plan

## Why it matters beyond this tool
The credibility of "management as the product" rests on the first fenceline a farmer scrutinises. One unbuildable line costs the whole insight layer its authority. Generalises to: recommendation surfaces must fail closed (omit) rather than fail open (render and hope).
