# Claude Design — Follow-up Prompt: pipeline prioritisation (value + source)

> Additive prompt for the already-built tool. Makes the Review Queue prioritise by business value and clearly distinguish Stormboy vs organic lead source. Reuses the existing design system (no colours/tokens). Em-dash-free.
>
> Naming note: "Stormboy" is used two ways in this tool. On the queue it means the **lead source** (acquisition programme vs organic/inbound). It is distinct from the copy **register** (Standard/Stormboy tone), which lives in the editor. Do not conflate them.
>
> Value basis: AgriProve earns a **25% success fee** of ACCUs (confirmed business fact). Business value is expressed as AgriProve's 25% share of estimated ACCUs. A dollar figure is optional and only shown if an ACCU price is configured in Settings (no market-price fabrication).

---

Enhance the Review Queue so I can instantly see the most valuable prospects and their source. Reuse the existing design system. Do not restyle other screens.

1. **Value:**
   - Add a prominent **value tier badge** to each card (High / Medium / Low), derived from estimated ACCU potential (the revenue driver), colour-coded by tier.
   - Add an **"Est. business value"** line: AgriProve's 25% success-fee share of the estimated ACCUs, e.g. "AgriProve share ~48,050 ACCUs (25%)". If an ACCU price is set in Settings, also show a dollar estimate; otherwise omit the dollar figure. Mark it as an estimate.
   - **Default-sort** the "Ready for Review" list by value, highest first. Add a sort control: Value (default) / Newest / A to Z.

2. **Source (Stormboy vs organic):**
   - Add a distinct **source tag** to each card: "Stormboy" or "Organic". This is the lead source (from HubSpot) and is a different concept from the copy register. Style it so it reads clearly as source, not tone, and do not conflate it with the Standard/Stormboy register. Prefer showing **Source** on the queue and keeping the register in the editor.
   - Add a **source filter** alongside the status tabs: All / Stormboy / Organic.

3. Keep the existing **watch-out flags** (small eligible area, low rainfall, etc.) shown next to value as risk caveats, so a high-potential prospect with a viability flag is still visible at a glance.

Demo data (assign sources and tiers):
- Kialla Downs (192,200 ACCUs) — Organic, High value
- Mount Buffalo Run (76,800) — Stormboy, High value, has flags
- Warralong Station (62,900) — Stormboy, Medium value, low rainfall
- Eungella (5,026) — Stormboy, Low value, small area

Aesthetic: value and source should be readable in under a second. The value tier is the strongest visual signal on the card.

---

## Open option (not in the prompt above)

"Which to pursue harder" is value x conversion likelihood, not value alone (organic converts warmer; Stormboy is colder, higher-volume). Default ranking above is pure business value with source shown separately so the user applies judgement. If a single combined "pursue" score is wanted later, add it deliberately and keep it transparent, not a black box.
