# Independent-research prompts must carry zero prior hypothesis; + Esri free-tier tracing correction

**Date:** 2026-06-15
**Type:** process rule + factual correction — process [high], Esri facts [high]/[moderate]
**Trigger:** Dylan ran the map-engine Deep Research prompt and flagged it as "not independent". The output literally opened with "The prior internal hypothesis is broadly CONFIRMED".

## Process rule (durable)

When asking for **independent / objective research**, the prompt must contain **no prior hypothesis, recommendation, shortlist favourite, or expected answer** — not even softened as "treat this as a hypothesis to verify or challenge". Naming the prior lean reframes the entire report around confirming/correcting it, which is not independence. Strip it entirely and add an explicit instruction: "independent, first-principles evaluation; no preferred option; let the evidence decide." See [[feedback-independent-research]] (lead with external authoritative sources; use internal systems to confirm/discredit, not as the primary frame). Fixed the saved prompt: `memory/deliverables/research/2026-06-15-deep-research-prompt-mapping-solution.md`.

## Factual correction (supersedes earlier research claim)

Our earlier internal research and the Confluence Engine Research page state that "Esri World Imagery explicitly permits tracing" and is "near-free". The deep run (citing verbatim terms) corrects this:

- **Esri World Imagery's FREE / developer tier does NOT license commercial boundary tracing** — the free tracing grant is limited to non-revenue applications "entirely centered around editing OpenStreetMap". Commercial digitise-and-store requires a **paid ArcGIS subscription under the Esri Master Agreement**, and underlying Maxar terms may apply. [high] on the free-tier exclusion; [moderate] on exact paid-tier reuse terms (confirm with Esri/Maxar in writing).
- **Rural Australian Esri imagery is ~1 m and "typically within 3-5 years of currency"** — fine for a rough boundary, but materially behind Nearmap (5.5-7.5 cm, up to 6x/year, but population-weighted ~95% of population, not landmass) and state-government aerial WMTS (NSW SIX Maps, Vicmap, QLD). [high]
- **Implication:** the tracing-permission question attaches to the **imagery layer, not the map engine**. Architect imagery as a **swappable raster layer** (AU aerial where covered, global satellite fallback) and confirm tracing + derived-data storage rights in writing for whatever ships. MapLibre + Terra Draw + Turf.js engine choice is unaffected.

## Confirmed by the independent run (2026-06-15)

A clean, independent Deep Research run (no prior hypothesis) confirmed the Esri free-tier correction and added the key strategic finding:

- **The four layers are separable decisions** (engine / imagery / draw lib / area calc), and tracing permission attaches to the **imagery**, not the engine.
- **Recommended trace surface: free CC-BY state-government aerial (e.g. NSW SIX Maps, CC-BY 4.0, 50cm rural / 10cm towns).** This is free at any volume and explicitly licensed for commercial adaptation with attribution — it removes the tracing-licence risk entirely. Esri World Imagery becomes a fallback (under a paid plan); Nearmap for premium regions under contract; Google + Mapbox satellite are not usable as a trace surface.
- Engine recommendation unchanged: **MapLibre GL JS + Terra Draw + Turf.js**, ArcGIS SDK runner-up.

**Action — DONE 2026-06-15:** saved the independent report (`Farm Map Drawing Tool/research/engine-research-independent.md`), superseded the earlier research file, replaced the Confluence Engine Research page (615710752) with the corrected version, left correction comments on the PRD (615448578), Epic Hub (615120907) and Jira epic AP-2514, and corrected the Claude-design prompt's production-engine line.
