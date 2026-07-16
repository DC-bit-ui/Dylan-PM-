# Claude Design Prompt — AgriProve Risk-Intelligence Demo

**Use:** paste everything below the line straight into **Claude Design**. It builds the working clickable-walkthrough demo in one shot. (No Fable step — written directly, since Fable's bio classifiers kept tripping. The ecological signals ARE shown here as the named risk drivers, described at index / remote-sensing level.)
**Tip:** if Claude Design asks to narrow scope, tell it to build all five screens as one self-contained app.

---

Build an interactive, self-contained demo web app: a **natural-capital risk-intelligence terminal** for an agricultural bank's credit-risk team. It is a **guided, clickable walkthrough** — five steps with a persistent progress indicator and Next/Back — designed to be driven live in a pitch meeting. Build it as a single-page React app, all data inline and illustrative, no external calls, robust and fast.

## What it is (tone, don't over-explain on screen)
The provider is **AgriProve, a natural capital analytics service provider** — the measurement and risk-intelligence layer, not a carbon-project developer. The product (working name **"Horizon"**) profiles the physical-climate / natural-capital risk of the agricultural businesses in a bank's lending book: it shows which businesses are on a declining trajectory years before it appears in their financial statements, and produces the physical-climate-risk data the bank is now legally required to disclose. Audience: a bank credit-risk / CRO team (thinks in probability of default, watchlist, capital, LVR), plus compliance and relationship managers. Positioning: **a credit-risk terminal for farmland, not a sustainability brochure.**

## Design system
- Institutional, precise, confident. Data-dense but legible. Flat — no gradients or decorative clutter.
- Palette: ink/slate base `#0F172A`; surfaces `#F8FAFC` and white; primary accent deep teal `#0E7C86`; risk coding green `#15803D`, amber `#D97706`, red `#DC2626`. Clean sans typeface; strong numeric hierarchy for scores and dollars.
- Persistent top bar: left "AgriProve · Horizon" with a small subtitle "Natural Capital Risk Intelligence"; right a muted "Illustrative demo data" tag. Persistent step progress (1–5) with Next/Back.

## Illustrative data
Create realistic Australian agricultural businesses (grazing and cropping) across Great Barrier Reef catchments and the Murray-Darling. Each has: name, region, loan exposure ($m), composite risk grade (A–E) + score (0–100), 5-year direction (improving / stable / declining), and a watchlist flag. Make one hero business clearly declining, e.g. **"Woolshed Downs, Fitzroy Basin, $6.2m, D · 38, ↓ declining, watchlist."** Label data illustrative persistently.

## Screens

### 1 — Portfolio triage: "The exposure you can't see"
A triaged table of ~14 businesses (a tranche of "42"): columns Business · Region · Exposure ($m) · Rating (grade + score chip, colour-coded R/A/G) · 5-yr direction (arrow, colour) · Flag. Sorted worst-first. A hero banner stat above it: **"31% of your agricultural exposure ($1.3bn) sits in businesses on a declining natural-capital trajectory — invisible in their financial statements today."** Live control: a **risk-threshold slider**; dragging it highlights/flags businesses past the threshold and updates a counter ("18 of 42 flagged for review"). The declining hero row has a prominent "View profile →" that advances to screen 2.

### 2 — Business risk profile (the hero): "What the land tells you before the accounts do"
Header: business + region; large composite rating **"D · 38 / 100"** (red chip); direction "↓ Declining (5-yr)"; a one-line credit implication: "Recommend watchlist — modelled default probability rising, security value exposed."
Hero visual: a multi-line time-series (2016–2026) plotting this property's **Ecological Condition Index** (declining) against a modelled **no-change counterfactual**, a **neighbour**, and the **region average**; plus a faint secondary line **"Reported EBITDA (indexed)"** that stays flat/positive until ~2024 then falls. A **time-slider/scrubber** moves a vertical marker across the years; as it crosses the divergence point, a shaded **"blind zone"** band appears with a callout: *"Decline visible here — roughly 3–4 years before it reached the financials."*
Supporting panels:
- **Ecological risk drivers** — the signals beneath the score, each with a 5-year trend sparkline, a value vs ecoregion peers (percentile), and an R/A/G chip: **Soil Organic Nitrogen velocity** (the earliest leading signal), **Soil carbon trajectory**, **Photosynthetic efficiency** (actual vs ecoregion potential), **Effective rainfall capture**, and **Ground cover vs district**. Show most of them declining for the hero business.
- **Ecological default probability** — a headline risk number, e.g. *"3-year ecological default probability: 67% ↑"*, with a one-line note that ecological default typically precedes financial default by 3–5 years.
- **Drought resilience** — performance in the three worst rainfall years vs peers, season-normalised (this business underperforms = thin buffer).
- **3-year outlook** — projection continuing down, with a confidence band.
A collapsible **"How this is derived ▸"** drawer explains plainly that the composite score and probability are built from these remotely-sensed ecological signals, benchmarked to ecoregion peers and normalised for season, with 8–9 years of satellite history per property. Keep it at the level of indices, signals and benchmarking — not laboratory or molecular detail.

### 3 — Disclosure mapping: "The same signal, in the language your regulator requires"
Mapping rows/cards, each an output → the mandate it satisfies:
- Physical-climate-risk exposure → **"AASB S2 §29(c): the share of assets vulnerable to physical climate risk — asset-level and audit-credible"** (green "covered").
- Scenario resilience → "AASB S2 scenario analysis (incl. 1.5°C)."
- Portfolio risk view → "Supports your ICAAP climate-risk view — positions you ahead of APRA's 2026 capital-framework work" (amber "positions for").
- Nature signals → "TNFD-ready (voluntary, accelerating)."
A **"Generate disclosure-ready export"** button opens a modal preview: a formatted mock disclosure extract (e.g. "Share of agricultural lending book vulnerable to physical climate risk: 31% — asset-level, independently verified"), footer "Illustrative."

### 4 — Recommended action + financing: "From flag to fix"
For the declining business: a **recommended actions** list (kept generic, e.g. "management change to rebuild ground cover and productive capacity"), each tagged with its expected effect on the trajectory. A **financing the bank can offer** list: transition finance to fund the change; a rate that improves as the risk profile improves; early support / restructuring. A live **"Apply recommended pathway"** toggle: when on, the projection bends from declining to recovering, the rating improves (D · 38 → projected B · 64 over ~4 years), and a line reads "Outcome: lower default probability, protected security value, retained customer." Frame throughout as protecting and growing the asset and the relationship — never surveillance or foreclosure.

### 5 — Book-scale close: "At book scale"
A condensed portfolio summary with value tiles: "$210m exposure flagged years early," "100% of the tranche disclosure-ready," "9 businesses on a supported recovery path." Closing line: **"See the risk before the financials do. Report it before the regulator asks. Act on it while it's still cheap to fix."** with "AgriProve · Natural Capital Risk Intelligence." Offer Restart.

## Live interactions (must actually work)
Risk-threshold slider (screen 1); counterfactual time-slider with blind-zone reveal (screen 2); disclosure-export button → modal (screen 3); apply-pathway toggle → projection + rating shift (screen 4). Everything else is a guided Next/Back walkthrough with clean scripted states.

## Content rules (important)
- **Surface the ecological signals as the named risk drivers** beneath the composite score (Soil Organic Nitrogen velocity, soil carbon trajectory, photosynthetic efficiency vs ecoregion potential, effective rainfall capture, ground cover). Each with a trend and a peer benchmark. Lead with the composite result; the signals are the substance beneath it. Describe them at the level of indices, remote-sensed signals and benchmarking — not laboratory or molecular mechanisms.
- Lead with the **result** (rating, direction, disclosure, action). Diagnosis-led; action is the secondary beat.
- Regulatory copy must be exact and must not overclaim: AASB S2 §29(c) is a live disclosure obligation; APRA is "positions you ahead of," not "capital relief"; TNFD is "voluntary, accelerating," not mandatory. All figures illustrative.
- Farmer-positive: risk flags lead to support and financing, never a foreclosure/surveillance framing.
- Voice: institutional, precise, plain, confident. No clichés, no marketing fluff, no em dashes.
- This is a concept demo — make it feel like a credible, near-term product.

## Tech
Single self-contained React page. Prefer inline SVG or a lightweight charting approach over heavy libraries. No external/network calls. Sized for a laptop screen. Simple, smooth transitions between steps.
