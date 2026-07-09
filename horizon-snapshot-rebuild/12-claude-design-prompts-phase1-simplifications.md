# Claude Design prompts — Phase 1 simplifications

> Ready-to-paste follow-up prompts for the running Claude Design prototype, from the UX review (`10-ux-review-v2-prototype.md`). Reuse the existing design system; don't restyle unrelated screens. Em-dash-free.

## Prompt P1 — De-noise the queue card

Simplify the Review Queue cards. Reuse the existing design system. Do not restyle other screens.
- Remove the per-card LLM cost chip (cost belongs in an aggregate/PM view, not per-card triage).
- Reduce to one value expression: keep the value tier badge and a single headline figure (AgriProve share in ACCUs). Remove the redundant "Est. potential" line from the card (keep it in the detail view).
- Add a one-line "why this one" summary per card, e.g. "High value · clean · ready" or "High value · map failed". Make it the most scannable line after the property name.
- Label the person shown bottom-right with a role ("Owner: Priya Nair", or avatar + role) so it is unambiguous.
- Move the Frontier and HubSpot links into an overflow (three-dot) menu to reduce clutter.
- Make flags specific and clickable ("Copy rule flag" should name the rule and jump to it).
- Establish a clear hierarchy: property name, then value tier, then the "why this one" line, then flags, then the primary action. Everything else recedes.

## Prompt P2 — Intelligent, always-editable map framing

Improve map framing in the editor and guided flow. Reuse the existing design system.
- Default each map to intelligent framing: fit the property boundary geometry (input geojson / bounds) within the frame with consistent padding at the frame's aspect ratio, so the property fills the frame and is never cut off.
- Auto-place the legend in the emptiest corner (least overlap with the property boundary); if the property fills the frame, dock the legend to a margin so it never covers the boundary or zones.
- The map is fully, directly editable at all times: pan by drag, zoom by scroll or pinch, live, with no "Adjust" button or edit mode. Intelligent framing is only the starting default; the user can reframe by hand at any moment.
- Show the legend in its rendered position while editing so overlap is always visible; allow moving it to another corner. Confirming locks the current map and legend into the export.

## Prompt P3 — One-line recommendation in Review

In the Review step, add a single recommendation line at the top, derived from the value tier plus flags, for example "Pursue — high value, clean" or "Review carefully — map failed to render". Keep the step calm and read-only (opportunity plus Growth Summary plus value plus flags) with one primary action ("Tailor & send"), so the user can decide in seconds.
