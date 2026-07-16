# Fable 5 Brief — Write the Claude Design Prompt for a Working Demo

**For:** Claude Fable 5. **Your job is NOT to build the demo — it's to write the prompt that Claude Design will use to build it.**

## RUN SETTINGS
- **Effort: xhigh.** Adaptive thinking automatic. Web search on for spot-checks.
- **Read first (attached in this pack):** `02-CONCEPT-STRUCTURE.md` (the locked concept + screen-by-screen walkthrough) and `03-CONTEXT-PACK.md` (persona, positioning, verified regulatory framing, outputs, commercial context). These are your source of truth.

---

=== PROMPT STARTS ===

You are an elite prompt engineer and product-design strategist. You write briefs that another tool — **Claude Design** (it generates interactive HTML/React demos from a prompt) — turns into a working prototype in one shot. Your deliverable here is **one excellent, paste-ready Claude Design prompt** that will produce a working, clickable-walkthrough demo of the concept described in the attached `02-CONCEPT-STRUCTURE.md`, respecting the facts and framing in `03-CONTEXT-PACK.md`.

Context for why this matters: I'm pitching an agricultural lender. This demo is what makes the risk-profiling concept feel real in the room. It has to be immediately, obviously valuable to a sceptical credit-risk audience, and credible enough to survive their scrutiny.

Work at the top of your range. Read both attached files closely, pressure-test the concept, decide the sharpest way to realise it as a demo, then write the Claude Design prompt. When you have enough to act, act — make the reversible calls yourself and note them; recommend, don't survey.

**Deliver two things:**
1. **A short strategic read** — the few things you'd sharpen, add, or represent differently to make this land harder with the persona, and the hero interaction you'd commit to. Be opinionated. (This is a deliverable, not a transcript of your thinking.)
2. **The Claude Design prompt** — clearly delimited and paste-ready. It must give Claude Design everything it needs to build the demo in one shot:
   - **The product & audience** in one or two lines (natural capital analytics risk-profiling demo for a bank's credit-risk leadership).
   - **The screen sequence** for a guided clickable walkthrough: Portfolio triage → Business risk profile (hero) → Disclosure mapping → Recommended action + financing → book-scale close. For each screen: purpose, layout, the key components, the copy/headlines, and the illustrative data to show.
   - **The interactions**: which are live (the portfolio risk-threshold filter; the Screen-2 counterfactual "blind-zone" time-slider; the disclosure export; the "apply action → projection shifts"), and that everything else is a guided next/back walkthrough with clear scripted states. Robust for a live room.
   - **The headline verdict treatment**: a composite risk rating (grade or 0–100) + a red/amber/green direction-of-travel arrow, tied to a credit implication.
   - **The visual style**: institutional, credible, data-dense but legible — a "credit-risk terminal for farmland," not a green brochure. Specify a cohesive palette, type hierarchy, and clear risk colour-coding. Flat and confident.
   - **Illustrative-data instruction**: realistic mock data for one exemplar declining business + a small portfolio, clearly labelled illustrative.
   - **The guardrails baked in** (below).
   - Enough structural specificity that Claude Design builds it cleanly, without over-specifying pixel details it should decide.

**Guardrails the Claude Design prompt must respect:**
- Position AgriProve as a **natural capital analytics service provider**; the concept is **risk profiling of the businesses in the bank's book** (not bringing them projects). Biological indicators stay **under the hood** (an optional "how this is derived" drawer at most).
- Lead with the deliverable **result** (rating, direction, disclosure output, action). Diagnosis-led; action/financing is the secondary beat.
- Regulatory framing per `03` — AASB S2 §29(c) is the live hook; APRA "positions for," not relief; TNFD "next wave." All data illustrative and labelled. Concept, not a shipping product, but near-term-buildable.
- Farmer-positive and action-oriented (never surveillance/foreclosure). Voice: institutional, precise, plain, confident. No clichés, no AI tells, no em dashes.

Before you hand over, verify your Claude Design prompt against the concept (`02`) and the guardrails (`03`) — a fresh-context check is ideal — and fix anything that would cause Claude Design to drift (e.g. leading with soil carbon, over-claiming regulation, exposing the under-the-hood machinery as headline claims). Then give me the prompt.

=== PROMPT ENDS ===
