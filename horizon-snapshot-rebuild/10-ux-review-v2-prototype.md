# HORIZON Snapshot Tool v2 — UX review

**Date:** 8 July 2026 · **Reviewed:** the Claude Design prototype (`HORIZON Snapshot Tool v2`).
**Method:** the Review Queue was examined live in the running prototype. The deeper states (Review, guided edit, maps, send, Template Hub) render on the design canvas, which can't be driven cleanly from here, so those are reviewed against the build history and earlier shared screenshots — verify against the current build where noted.
**Motto for this review:** simplicity above all.

---

## The job we are designing for (anchor)

> "When a batch of prospects lands, help me decide who is worth pursuing, tailor the few that matter, and send with confidence — in minutes, without a developer."

Every screen should be judged against that. Triage speed and confidence are the KPIs; anything that doesn't serve them is a candidate for removal.

---

## Step 1 — Review Queue (reviewed live)

**Works well:** value tiers (HIGH/MEDIUM/LOW), Stormboy/Organic source tags, honest flags (Clean, Map failed, Low rainfall, Small eligible area), value sort + source filter, batch checkboxes, and inline "Re-run snapshot" on the failed map. The bones are right.

**Friction:**
- **Two numbers fight for the top-right of every card** — the value tier and the LLM cost chip ($0.022). Cost is an ops/PM metric, not a triage signal; it pulls the eye away from value. **Cut it from the card.** Put spend in an aggregate/PM view.
- **Three value expressions per card** — tier badge, "AgriProve share ~48,050 ACCUs (25%)", and "Est. potential ~192,200 ACCUs". That is dense and redundant for scanning. Lead with the tier + one headline number; move the rest to the detail view.
- **The unlabeled name bottom-right** (Priya Nair, Tom Fenwick…) is ambiguous — assignee, rep, or landholder contact? Label it or use an avatar + role.
- **"Copy rule flag" is vague** — which rule tripped? Flags should be specific and clickable (jump straight to the issue).
- **Frontier ↗ and HubSpot ↗ on every card** add clutter. Fold into an overflow (⋯) menu; surface only when needed.
- **No single eye-anchor.** The card carries ~10 data points at similar weight. Establish a clear hierarchy: property name → value tier → flags → primary action. Everything else recedes.

**Improvements:**
- A single **"why this one" line** per card: "High value · clean · ready" or "High value · map failed". One glance replaces parsing five figures.
- Let ranking **factor flags**, not just raw value — a clean high-value should sit above a flagged high-value for "pursue now".
- Quiet the palette: fewer competing weights and accent colours. Simplicity is mostly subtraction here.

---

## Step 2 — Entry (pipeline vs manual)

Pipeline snapshots auto-populate the queue (good — no chooser page), manual is the header "Upload snapshot".

**Friction:** "Upload snapshot" reads slightly ambiguous (upload what, to where?). Consider "Add from files" or "Manual upload". Keep the Frontier instruction steps + detected-contents checklist — that is low-friction trust-building and should stay.

---

## Step 3 — Review step (opportunity + Growth Summary)

The decision moment: pursue or not, and what's the story.

**Watch for:** don't drown this step in editing controls. It should read as calm and read-only — Growth Summary + value + flags + one primary action ("Tailor & send"). Editing belongs in the next step.

**Improvement:** a one-line **recommendation** ("Pursue — high value, clean") so the decision takes seconds, not a read.

---

## Step 4 — Edit + guided flow

The guided flow (Interests → Generate summaries → Maps → Final review → Send) is the core simplicity win. Keep it the default path.

**Friction / watch:**
- "Generate summaries" quick/deep should be **pre-selected by value tier** — one confirm, not a fresh decision each time.
- The **amendable-pages-only jump list** is essential; never make the user scroll past the static brand pages.
- The full manual editor should be a **quiet "advanced" escape**, not a co-equal path competing for attention.

**Improvement:** let the user **stop and send at any step** — a clean snapshot shouldn't be forced through every stage. "Looks good, send" should be reachable early.

---

## Step 5 — Maps (verify against current build)

The per-map framing window now shows the legend in place (good — fixes the overlap blind spot).

**Correction (per Dylan, 8 Jul):** naive auto-fit does not produce good framing, and editing must never be gated behind a button. Two things together:

1. **Intelligent framing as the default.** Frame to the **property boundary geometry** (`input.geojson` + the `bounds.json` now in model output), not the image extent: fit the boundary with consistent padding at the frame's aspect ratio (no stretch) so the property fills the frame well. Then run a **legend-placement pass**: detect the emptiest corner (least overlap with the boundary polygon) and place the legend there; if the property fills the frame, dock the legend to a margin so it never covers zones. Hard guarantee: property boundaries fit inside the frame and the legend never overlaps them.
2. **The map is fully, directly editable at all times.** A live draggable / zoomable surface, no "Adjust" mode or toggle. Intelligent framing is only a strong starting default; the user can reframe by hand at any moment.

---

## Step 6 — Send

HubSpot deep-link + editable email + mark-as-sent + pre-send quality check.

**Friction:** HubSpot is still copy-paste; long-term this should be an API write (log the send, attach the PDF, move the stage).

**Improvement:** close the loop — on send, the card moves to Sent and engagement tracking begins. Keep the pre-send quality check as a hard gate (it is genuinely good).

---

## Step 7 — Template Hub (not reviewed live)

Keep it marketing-simple: auto-map first, surface only exceptions, and lead with the naming cheat-sheet. Progressive disclosure so a daily user never sees it.

---

## Simplicity above all — the cuts I'd make first

1. **Remove the LLM cost chip** from cards.
2. **One value expression** per card, not three.
3. **Auto-frame maps by default**; manipulation is opt-in.
4. **One-line "why this one / recommendation"** on the card and in Review.
5. **Guided flow is the default**; the manual editor is demoted to "advanced".

Every one of these is subtraction. That is the point.

---

## Innovative bets (enable the JTBD, set up for the long term)

1. **Engagement-driven queue.** Once sent, the queue re-sorts by prospect engagement ("opened the economics page 3 times"). This turns the tool from a document maker into a **conversion cockpit** — the single highest-leverage move, and it compounds over time.
2. **Next best action per prospect.** Combine value × engagement × flags into one recommended action: "call now", "resend", "not worth pursuing". Removes the thinking, not just the clicking.
3. **Confidence score, not just flags.** A single trust signal ("verified, ready") so the reviewer's confidence is instant.
4. **Batch auto-send for clean high-value** (with guardrails). The volume unlock for a prospecting motion.
5. **Learn from edits.** If reps keep rewriting the same phrase, feed it back into the narrative guide automatically — the copy gets better without anyone maintaining it.
6. **Living web snapshot**, not just a PDF — a tokenised page with the interactive maps and built-in engagement tracking that feeds bet #1.

---

## Top 3 to do now

1. **De-noise the card** — cut cost, one value line, clear hierarchy, labelled owner.
2. **Intelligent map framing** (fit property boundary, legend auto-placed clear of it) as the default, with the map always directly editable — no edit button.
3. **One-line recommendation per prospect** (queue + Review).

These three, done well, deliver most of the "minutes, not a developer, with confidence" job — and they are mostly removal, which is exactly the brief.
