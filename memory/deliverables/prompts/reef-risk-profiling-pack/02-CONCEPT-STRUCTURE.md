# Concept Structure — Agricultural Risk-Profiling Demo (locked)

**Date:** 2026-07-15 · This is the conceptual spec Fable turns into a Claude Design prompt.

## One line
A natural-capital risk-profiling layer that shows a bank, in credit terms, which agricultural businesses in its book are building or eroding their productive capacity — and therefore their creditworthiness — years before it appears in the financials, using data the bank is now required to disclose.

## Object model
- **Unit:** an agricultural business / property in the bank's book.
- **Risk Profile** = { headline verdict · trajectory · benchmark position · forward projection · disclosure mapping · recommended action }.
- **Portfolio** = a book of profiles, triaged.
- **Under the hood (later):** the natural-capital signals + models that generate the verdict. Not shown as headline claims in this concept.

## The three questions it answers (mapped to the room)
1. *How risky is this business, in credit terms, and which way is it heading?* → CRO: the verdict + trajectory.
2. *Can I disclose this defensibly?* → compliance: the disclosure mapping/export.
3. *What do I do about it without losing the relationship?* → RM: the action + financing.

## The spine / the "aha"
Financial statements are a **lagging** indicator; natural-capital trajectory is a **leading** one. The profile surfaces the warning years the bank is currently blind to. Everything serves that one realisation.

## Locked demo decisions (Dylan, 2026-07-15)
1. **Headline verdict = a composite risk rating (e.g. a grade or 0–100) + a red/amber/green direction-of-travel arrow.** Reads like a rating product.
2. **Flow = portfolio triage first, then drill into one business profile.** Lead with the book-wide "hidden exposure" reveal, then prove the depth.
3. **Fidelity = a guided, clickable walkthrough** — robust for a live room; mostly-scripted screen states with a few live micro-interactions, not a free-explore prototype.
4. **Diagnosis-led, action visible** — lead with seeing the risk; show corrective action + financing as a clear secondary beat.

## The walkthrough (screen by screen)
**Screen 1 — Portfolio triage: "The exposure you can't see."**
The bank's ag book (illustrative tranche) triaged R/A/G: each business shows a composite rating + direction arrow. Headline stat: *"X% of your ag exposure ($Y bn) sits in businesses on a declining trajectory your financial data can't see yet."* Live micro-interaction: a risk-threshold control — slide it and businesses flag. CTA: click a flagged (declining) business to drill in.

**Screen 2 — Business risk profile: "What the land tells you before the accounts do." (THE HERO)**
Header: business (illustrative), composite rating (e.g. "C · 46/100") + R/A/G direction ("declining"), one-line credit implication ("watchlist; PD contribution rising"). Centre-piece (hero interaction): a trajectory chart over ~8–10 years — this business vs modelled do-nothing vs neighbour vs region — with a **time-slider that reveals the "blind zone,"** the years the decline shows in the natural-capital signal but not yet in EBITDA (shade it). Then: resilience/stress (behaviour in the worst drought years) and a forward projection with bands. The biological signals live behind an optional "how this is derived" drawer — under the hood.

**Screen 3 — Disclosure mapping: "The number you're now required to report."**
The same output mapped visually to the bank's mandates: rating / vulnerable-asset % → AASB S2 §29(c); the scenario view → S2 scenario analysis; the portfolio roll-up → ICAAP positioning; the nature signals → TNFD-ready. One-click **disclosure-ready export** (mock preview).

**Screen 4 — Recommended action + financing: "From flag to fix." (SECONDARY BEAT)**
For the declining business: recommended corrective actions + the financing the bank can offer (finance to fund the change that lifts the trajectory; a rate that improves as the risk profile improves; early support), with the projected trajectory improvement if actioned. Framed farmer-positive: protect and grow the asset and the relationship — never a foreclosure tool.

**Screen 5 — Close: "At book scale."**
Back to the portfolio: applied across the book, the exposure caught early, the disclosure covered, the relationships protected. The "why this matters" close.

## Hero interaction
The Screen 2 counterfactual/blind-zone time-slider is the lead candidate. Fable may finalise/beat it, but it must deliver the spine ("see it before the accounts do").

## Live micro-interactions to keep (robust for a live demo)
Portfolio threshold filter (S1); counterfactual slider (S2); disclosure export click (S3); "apply action → projection shifts" (S4). Everything else scripted with clear next/back.

## Credibility + honesty
Independently verified; profiled **remotely, no farmer sign-up required**; mapped to their mandates; only AgriProve's coverage + analytics can produce it. Headline = the deliverable result (composite rating + direction); the **ecological signals are shown as the risk drivers beneath it** (SON velocity, soil carbon,