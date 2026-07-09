# Snapshot Generator — HORIZON Grazing Insights page (Surface A)

**Date:** 2026-07-08 · **Owner:** Dylan · **Status:** requirements for the Snapshot v2 build in flight
**Context:** two-surface architecture per `../2026-07-08-grazing-scenario-tool-claude-design-guide-v3.md` — this page is the static doorway inside the generated profile; it links out to the interactive planner.

## Requirements

**R1 — Gate by farm type.** Page renders ONLY when the intake qualifier is Grazing or Mixed cropping & grazing. Cropping-only profiles must not include it. (Qualifier is already a planned v2 intake addition — this consumes it.)

**R2 — Page title:** "Where to start" (fallback: "Management insights"). It reads as part of the profile, not an ad.

**R3 — Content blocks, in order:**
1. Header + one line: "Your HORIZON map doesn't just measure your soil carbon — it shows you where to build."
2. **Hero image:** suggested-plan render — the property's units with suggested cell splits and a rest block shaded. v1 = one generic example property render (supplied from the demo-kit renderer); v1.1 = per-property render once the planner's renderer is wired into generation. Caption: "An example plan — your country, your call."
3. **Three principle cards** (exact copy in v3 guide §2): start with your best country / rest your most run-down country first / let the rotation do the work.
4. **"Why carbon?" panel** — the two-bank-accounts and solar-panel metaphor cards (copy in v3 §2). ⚠ Pending Hobbs's explicit clearance of these metaphors for farmer-facing use (source doc is Confidential).
5. **CTA button:** "See this on your own country → Open your interactive plan."

**R4 — CTA link carries property identity.** `?p=<signed_property_token>` per v3 §3. Until the planner is platform-hosted, the CTA is a **concierge door**: it captures interest (event + contact flag) and routes to a "your planning session is being prepared — [Hobbs/field team] will walk you through it" state. Never a dead link.

**R5 — Analytics (the demand signal that buys the build):** fire events for page-viewed, CTA-clicked, tagged with farm type + property token. CTA click-through by segment is THE metric for the build decision.

**R6 — Compliance guardrails:** no soil-carbon-eligibility claims on this page (wording not yet verified against the method); no acronyms (SOC/MAOC); "principles, not prescriptions — every fencing and grazing decision is yours" small print under the CTA.

**R7 — Renders clean in both profile outputs** (web + PDF/print). Static only; the single interactive element is the CTA.

## Acceptance criteria
- [ ] Cropping-only profile contains no trace of the page
- [ ] CTA click recorded with farm type + property token; no dead end when planner unavailable
- [ ] Copy passes the jargon test; metaphors present only after Hobbs clearance
- [ ] Hero renders legibly at print resolution
- [ ] Page removable by config flag (kill switch) without regenerating the profile pipeline

## Paste-ready build prompt (for the generator tool / Claude Code)

```
Add a "Where to start" page to the HORIZON profile generator, rendered only
for grazing or mixed operations (farm-type qualifier from intake).

Layout (light theme, exact hex: #F4F6F8 page, #FFFFFF cards, #1A2B3C text,
#6B7C8D muted, #2D6A4F accent, #E2E8F0 borders, Inter):
1. Header "Where to start" + sub "Your HORIZON map doesn't just measure
   your soil carbon — it shows you where to build."
2. Hero image slot (16:10, supplied asset: suggested-plan render), caption
   "An example plan — your country, your call."
3. Three principle cards (heading + 2 lines each):
   • Start with your best country. Subdividing your most productive
     paddocks first lifts carrying capacity across the whole farm — and
     that gain funds the next fence.
   • Rest your most run-down country first, and hardest. It has the most
     to gain. A full season, no grazing, let it seed.
   • Let the rotation do the work. At enough cells, 60–120+ days of rest
     happens by design — about 20–30% of the farm resting at any time.
4. "Why carbon?" panel, two cards side by side [FLAG: copy pending
   internal clearance — build the slots, ship with placeholder toggle]:
   two-bank-accounts metaphor; solar-panel metaphor.
5. Primary CTA "See this on your own country → Open your interactive
   plan" linking to PLANNER_URL?p={property_token}; if PLANNER_URL unset,
   CTA posts an interest event and shows "Your planning session is being
   prepared — we'll walk you through it." Small print: "Principles, not
   prescriptions — every fencing and grazing decision is yours."
Analytics: emit page_viewed and cta_clicked with farm_type +
property_token. Config: page behind a feature flag; hero asset path,
PLANNER_URL, and metaphor-copy toggle configurable. Must render in both
web and PDF outputs; no other interactivity.
```
