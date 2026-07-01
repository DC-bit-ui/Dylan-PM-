# Standup — KCT stratification workflow + HORIZON run visibility (2026-07-01)

**Source:** Granola "Standup - KCT stratification workflow and HORIZON run visibility" (2026-07-01) — meeting `4a217a36-94db-4e7a-87e1-bc9c745adcf3`. Notes only (transcript gated). Refines the 2026-06-30 Steve review (B1).
**Confidence:** [high] from the AI notes.

## Refinements to the stratification / HORIZON design (→ KCT mapping spec §4.E + Claude Design Brief 1)
- **Embed a per-CP HORIZON run-status tile IN the KCT mapping screen** — request a run for CP1, watch status ("submitted / running / complete") there, switch to CP2 and work in parallel. **No navigating to the separate HORIZON runs page mid-flow.** Steve well received.
- **Always show run status.** Current bug: the run link only appears when *no* valid run exists; a completed run is **invisible** on the stratification page. Edge case: project "MENU" had a snapshot but no HORIZON run and no property — run and snapshot/property can fall out of sync.
- **Placement (Steve):** inline, **BCR-style, between the step-progress indicator and the mapping-outputs section** (fills the page's empty space; avoids an extra click layer). Run inputs in one **compact row**: Run now + inference-date calendar + runs table/file row + Export CSV + the sampling-config ("1–7") options.
- **Plan-progress pill** on the main KCT screen after "Create Plan" — ops can see if the plan finished without navigating deeper, and know **not to proceed into stratification until it's done**.
- **NDRE placement confirmed:** a **"Based on Condition" section just below the step**; press **Calculate** → graph + outputs appear inline. Keep **NDRE and BCR close together** (BCR sits within the Consents/CPP stage).
- Ops behaviour: after triggering a run they wait ~2 hrs; during the wait they don't want to re-enter the KCT mapping page just to check status → the embedded tile / go-straight-to-status is the point.

## Context (not design)
- Mixed project flow: always starts in the automation tool; parcels auto-generated; larger parcels exported to QGIS for edits then re-imported; **persistence across the round-trip matters** (renumbering ticket). Steve: three related tickets — think holistically re scope.
- Gayathri: KCT config script processing ~2,070 NSW properties (running hours); Cadel confirmed DB can be queried to verify increments. Baseline experiment + new temperature-data column being tested.
- Steve: built an account-respawn method (24–48h create→reset gap) via Athul's referral tool; starting Lorico Farm.
- Cadel to nail the Verterra first-pass goal with Kieren and send to Dylan.

## Preference (reinforced) — don't prescribe layout
Dylan: a **stakeholder's suggested UI solution (e.g. Steve's inline/BCR-style placement) is a design *reference*, not a requirement.** Keep **behaviour + content** as the rails (what must be true: in-screen always-visible per-CP run status + inputs, plan progress, notification); leave **layout / placement / treatment** as open canvas so Claude Design can find the most effective solution. Applies generally: capture the intent, not the pixels. (Reinforces the remix-not-patch strategy.)
