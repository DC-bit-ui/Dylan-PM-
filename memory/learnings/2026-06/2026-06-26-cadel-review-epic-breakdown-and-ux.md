# Cadel review — flow approved, epic breakdown, metrics framework, UX consistency

**Date:** 2026-06-26
**Source:** Granola "Cadel and Dylan 1:1" (`54ed13ce-663d-42bf-82a9-1cd6fe168866`) + a 10-meeting context pull. Cadel approved the Consents/Prospects flow end-to-end ("when we can go all the way from Frontier through this to registered, that's it"); it's seen as sellable + removes the SME dependency. Now: slice, stage, and metric it.

## Metrics framework (NEW — org-wide, applies to every epic)
- **3 metrics per epic:** (1) **Target** — a *business outcome*, PM-owned; (2) **Timeline** — joint PM+dev; (3) **Quality** — technical, dev-owned.
- Set the 3 when an epic **starts**; evaluate them when it **closes**. Plugs into the existing PRD process with minimal overhead.
- **Target must be a business/functional outcome**, not "we built X screens / shipped Y features." PM logic: "if our features/requirements/UX are right, this outcome should happen" (not dependent on growth/sales).
- **Cadence:** weekly prioritisation **Tuesday** — set metrics at start, review at close. **New accountability layer: report to Kieren/leadership** (team wasn't doing this before).
- **If a work item can carry one specific target, it should be its own epic.** The challenge = make each epic small enough for one target.
- **Worked example (KCT automation):** Target = reduce map-prep time **75%**; Quality = manual DB fixes needed on **<25%** of projects.

## Epic breakdown (5 slices, ship 1-by-1, each one target)
1. Dashboard + Project Hub shell (weakest as a metric'd epic — maybe a one-off enabling task).
2. Land titles (most valuable → first real build).
3. KCT mapping (largely ready).
4. Consents (KCT + CPP + EIH-C packs).
5. Registration (CSV + CER + split-screen script).
Plus a cross-cutting **UX consistency spec** applied to all.

## UX consistency cleanup (Cadel's points → one spec)
- **Mistake recovery / undo** at completed stages (go back and fix).
- **Save vs mutation clarity:** pick ONE model — auto-save-on-click *with a visible "saved ✓"*, OR explicit save with "unsaved changes." Make it obvious what mutates the DB. (Native-title 3-box selector + build-pack confirm read as ambiguous info panels.)
- **Reset / deselect** (native-title misclick → "not yet decided"). Joe will misclick.
- **ONE per-project navigation pattern** across mapping/consents/registration (currently sidebar vs tabs — unify).
- **Breadcrumbs with the project name** in a unique hierarchy (Project Hub › [Project] › Stage).

## "Less is more" rollout (Steve's KCT-automation lesson)
Ops needed more hand-holding than expected; not "a duck to water." → drip-by-drip; guided step-by-step; consistent UI patterns; clear save/mutation state; avoid mixed manual+automated handoffs; don't roll out multiple new concepts at once. Walk ops through each release in detail.

## Prior scope (consistent — don't contradict)
Registration consent flow already scoped (titles → DBYD → auto-identify EIH → confirm/add → build packs → PandaDoc/EIHC → KCT mapping → CSV). Registration vs crediting consents = separate phases; ownership-transfer/withdrawal out of phase 1. Don't make EIH/consent dependent on the larger app restructure — get the workflow live first. Goal: conditional → **unconditional** declarations. Title transfer file = source of truth (stop re-purchase loops). CSV for CER bulk upload. Entity-type-specific packs. DJ's mapping split: automated-enough-to-send-KCT vs confirm-mapping-before-sampling.

## Unresolved (decide before/at enact)
- **CPP placement:** under Consents (current build) vs Steve's "elevate near mapping." 
- **EIH ownership** DJ vs Joe in the new flow.
- **Legacy portfolio entry** for DJ — historical projects must not break the new-project flow (the SharePoint-sync/backfill path).

## Sequence (Dylan, 2026-06-26)
**Dashboard/Project Hub shell → KCT mapping (already delivered — quick to slot into the new structure) → Land titles (the value build) → Consents → Registration.** Each with an ops walkthrough on release.
