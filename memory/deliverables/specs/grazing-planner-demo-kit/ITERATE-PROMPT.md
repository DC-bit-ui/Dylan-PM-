# Iterating the existing Claude Design project onto Glenlogie

**Decision: iterate, don't rebuild** — with one discipline. Iterating is right
because the concept is unchanged and Claude Design keeps version history
(nothing is lost if it goes sideways). The discipline: apply the delta as ONE
consolidated restructure prompt (below), not twenty small nudges — piecemeal
edits on a stale foundation accumulate contradictions (old zone blobs
coexisting with new parcels, year-pinned phases surviving in a corner card).

**Before pasting:** attach to the EXISTING project: `glenlogie/demo_bundle.json`,
`glenlogie/heat_overlay.png` + `heat_overlay.bounds.json`, both Hobbs docs.

## Restructure prompt (paste as one message)

```
We are restructuring this design onto a real property. Before changing
anything, list every screen and interactive element you currently have.
Then apply ALL of the following as one coherent pass — remove anything
that contradicts it:

1. DATA: replace all property data with the attached demo_bundle.json
   (Glenlogie, real cadastral units, zone bands hot/mid/cold, precomputed
   splits with buildable-N options per unit, recommended_n, logic metrics
   incl. fence_m). NEVER compute geometry — render only what the bundle
   contains. The cell slider offers ONLY the N values present per unit.

2. ENTRY STATE: the first screen shows the SUGGESTED PLAN already
   rendered — every unit at its recommended_n, fences dashed, bands
   tinted. "Here's what your country suggests. Make it yours."
   Never a blank canvas.

3. MAP: Mapbox satellite (hybrid) base layer (placeholder MAPBOX_TOKEN);
   heat_overlay.png at its bounds (~55% opacity); layer toggle
   Satellite / Heat map / Both.

4. ADD if missing: paddock NAMING pass (tap each unit, "What do you call
   this one?", names flow through all downstream copy); the INSTINCT TEST
   ("Where would you start?" — cold-tap shows honest consequence, then
   the gradient order with WHY); phases named Establishment (yrs 1-3) /
   Expansion (4-6) / Maturity (7-10) with a pace slider stretching the
   indicative year labels, order never reordering; "graze it once"
   consequence on the rest block; two-line carrying-capacity chart
   (fast lifts early, durable overtakes by Maturity).

5. REMOVE: any auto-drawn freehand subdivisions, any zone-blob planning
   units, any fixed calendar years pinned to phases, any stocking-rate
   prescriptions, any soil-carbon-eligibility claims on screen.

6. RULES that govern everything: proposed fences always dashed +
   draggable, never locked; every recommendation carries its one-line
   WHY; show "new fence: ~X km" per scenario from the bundle's logic
   metrics; plain language, no acronyms; "every decision is yours" on
   the closing screen.
```

After it applies: run the sceptic pass ("review as a 60-year-old grazier
told his whole life to fix the worst paddocks first") and the edge-case
pass from MASTER-PROMPT's iteration list. If the restructure comes back
incoherent after two attempts, THEN start fresh with MASTER-PROMPT.md —
one clean rebuild beats three archaeology sessions.
