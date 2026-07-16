---
date: 2026-05-26
type: jira-ticket-draft
status: draft-not-filed
created_for: Dylan
target_project: stormboy-tracker (not AP — confirm correct project/epic)
related_decisions:
  - memory/decisions/2026-05-21-feedback-loop-design.md
  - memory/decisions/2026-05-26-stormboy-tracker-frontend-rewrite.md
source_brief: inbox/cowork/2026-05-26-ben-work-insights-handoff.md (§ "What this teases up for Apex", item 2)
source_spec: shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md §2b ("the dashboard's coaching engines will eventually read open type=error feedback...")
---

# Jira ticket draft — Coaching engine: suppress-or-annotate work-cards with open type=error feedback

> **Epic / project routing TBD by Dylan.** stormboy-tracker isn't in `memory/initiatives/INDEX.md` so the right epic isn't obvious from the bus. Candidates: (a) an existing stormboy-tracker coaching-engine epic in a non-AP Jira project, (b) a new epic under AP for "team-bus feedback loop" alongside AP-1963 / AP-2009, (c) standalone story if there's no parent epic yet. The decision `2026-05-21-feedback-loop-design.md` implies an existing coaching-engine track — this ticket may belong there as a sibling of `adjustConfidenceFromProbeOutcomes()`.

## Summary

When a rep (Ben, Kieren, anyone else) writes a `type=error` or `type=correction` feedback against a deal or contact, the next coaching-engine run that produces work-cards for that rep should consume the feedback **before** generating the new card — suppressing the card if the feedback invalidates the recommendation, or annotating it if the feedback adds correction context the rep needs to see.

Today the feedback round-trips through the dashboard widget but does not change what the engine produces. The architecture-diagram arrow `FB -.-> ENG` is fiction for this branch ([see learning](../../../memory/learnings/2026-05/2026-05-21-architecture-diagram-vs-reality-drift.md)). This ticket makes it real.

## Why now

Ben's plug-and-play kit shipped 2026-05-26 ([handoff](./2026-05-26-ben-work-insights-handoff.md)). Ben's Claude is set up to log corrections directly to `feedback/feedback-<id>.json` per `INSTRUCTIONS-FOR-BEN.md` §3. Without the engine-side consumer, Ben's corrections accumulate in the widget but never close the loop. The faster this lands, the faster Ben's friction-as-signal compounds into a sharper next-night queue.

Parallel work `2026-05-21-feedback-loop-design.md` handles the `probe-outcomes → pattern confidence` branch of the FB → ENG arrow. This ticket handles the `feedback → card generation` branch. The two are complementary.

## Scope

In:
- Read `feedback/feedback-*.json` with `status: open` filtered by `target_kind in ["deal", "contact", "suggestion"]` and matched on `target_id`
- Apply to the next card-generation pass: suppress card OR annotate card body
- Mark the feedback `resolution.action_taken` when consumed (without changing `status` — that's a human decision)
- Idempotency — re-running the engine against unchanged feedback produces the same outcome

Out (per the handoff brief explicitly):
- Frontend changes to `stormboy-tracker/frontend/` — separate React 18 / Vite / Chakra rewrite in flight per [2026-05-26 decision](../../../memory/decisions/2026-05-26-stormboy-tracker-frontend-rewrite.md)
- Pattern-confidence feedback (`probe-outcomes`) — covered by [2026-05-21 decision](../../../memory/decisions/2026-05-21-feedback-loop-design.md)
- Auto-resolving feedback (setting `status: resolved`) — humans decide when an error is fixed; engine only records the consumption

## Behaviour spec

For each work-card the engine is about to write to `queues/<rep>/work-cards.json`:

1. Resolve the card's `lookup_type` + `lookup_id` to a `target_kind` + `target_id` (e.g. `deal` + `141507724737`)
2. Query open feedback: `feedback/feedback-*.json` where `status === "open"` AND `target_kind === <card kind>` AND `target_id === <card id>` AND `created_at <= now`
3. For each match, classify by `type`:
   - **`error`** — the diagnosis or next-step assumption is factually wrong. The card is misleading. → **Suppress the card entirely** OR re-run the diagnosis pass with the feedback body injected as constraint context (which-of: see § "Open design question" below)
   - **`correction`** — the next-step suggestion is wrong but the diagnosis is OK. → **Annotate** the card: prepend a "Correction noted" block at the top of `next_step_qualifier` with the feedback body verbatim (PII-generalised if the source was Kieren or a non-rep capturer, raw if the source was the deal-owning rep themselves), and downgrade `heat` by one tier (HOT → WARM, WARM → COLD)
   - **`preference`** — system-level preference, not about this card's content. → Ignore here (other passes consume preferences)
   - **`comment`** — informational. → Annotate `diagnosis` with a footnote pointing to the feedback id; do not change card content
4. For each consumed feedback, write back to `feedback/feedback-<id>.json` setting `resolution.action_taken = "<suppressed|annotated|footnoted>:<rep-slug>:<run-timestamp>"`. Do NOT set `resolution.status = "resolved"` — that's a human action. Atomic write via existing `shared-bus.js` tmp+rename.
5. Append a line to `<BUS_ROOT>/apex-runs.log` for each pass: `<ISO> · coaching-feedback-pass · cards-considered=<N> suppressed=<N> annotated=<N> footnoted=<N>`

## Open design question for Dylan

**`type=error` — suppress or re-run with constraint?**

- **Suppress** is simpler and safer. If Ben says "the diagnosis assumed no engagement but I called this guy last week", the engine drops the card. Ben sees one fewer card; the system errs toward less noise. Cost: useful guidance on the same deal may now be missing.
- **Re-run with constraint** is more useful but more expensive. The engine re-runs the diagnosis pass with the feedback body as an additional constraint ("assume engagement on 2026-05-23 happened"), producing a corrected card. Cost: extra LLM tokens; harder to test idempotency.

Recommend **suppress for v1**, with the feedback body surfaced in a "Suppressed cards" sidebar on the dashboard so Ben sees that his correction landed. **Re-run with constraint** is a v2 if Ben actively asks for it after a month of v1 usage.

## File-level implementation outline

(Based on the file structure from `2026-05-21-feedback-loop-design.md` — verify on the actual repo)

- New module: `stormboy-tracker/coaching/engine/feedback-consumer.js`
  - `consumeOpenFeedbackForTarget(targetKind, targetId, asOf)` — returns array of matched feedback records
  - `applyFeedbackToCard(card, feedback[])` — returns `{ card | null, mutations: [...] }`
- Modify: `stormboy-tracker/coaching/engine/<work-cards-generator>.js` (whichever file produces `queues/<rep>/work-cards.json`) — call `consumeOpenFeedbackForTarget` before final card emit
- Modify: `stormboy-tracker/coaching/engine/shared-bus.js` — add `writeFeedbackResolution(feedbackId, actionTaken)` helper (atomic update of `resolution.action_taken` only)

## Acceptance criteria

- [ ] An open `type=error` feedback against a deal_id results in that deal's card being suppressed from the next overnight `queues/<rep>/work-cards.json` run
- [ ] The suppressed feedback is updated with `resolution.action_taken = "suppressed:<rep-slug>:<ISO>"` after consumption
- [ ] An open `type=correction` feedback against a deal_id results in the card being annotated (correction body in `next_step_qualifier`, heat downgraded one tier) but NOT suppressed
- [ ] Idempotency: re-running the engine against unchanged feedback produces the same `queues/<rep>/work-cards.json` content (no churn)
- [ ] `apex-runs.log` records one line per pass with counts
- [ ] Existing pattern-confidence feedback (probe-outcomes) flow is unaffected (the two passes are independent)
- [ ] One e2e test: Ben writes a fake error-feedback for an active card, runs the engine, verifies the card disappears from his next queue; the feedback shows `resolution.action_taken` set; `apex-runs.log` shows the pass

## Estimate

~4 hours focused: feedback-consumer module (1.5h) + work-cards integration (1h) + atomic resolution writeback (30m) + e2e test (1h). Less than the pattern-confidence work because the loop is simpler (no rolling window, no confidence math, just boolean match + mutation).

## Priority

**Medium.** Not blocking — Ben's kit works without it; corrections still land in the widget. But the value compounds quickly once Ben starts logging corrections (which the kit makes frictionless), so the ROI on shipping inside the next 2 weeks is high.

## Links

- Decision: [`memory/decisions/2026-05-21-feedback-loop-design.md`](../../../memory/decisions/2026-05-21-feedback-loop-design.md) — parallel branch for pattern confidence
- Decision: [`memory/decisions/2026-05-26-stormboy-tracker-frontend-rewrite.md`](../../../memory/decisions/2026-05-26-stormboy-tracker-frontend-rewrite.md) — frontend out of scope
- Learning: [`memory/learnings/2026-05/2026-05-21-architecture-diagram-vs-reality-drift.md`](../../../memory/learnings/2026-05/2026-05-21-architecture-diagram-vs-reality-drift.md) — the FB → ENG arrow this closes
- Spec source: `shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md` §2b (line referencing the eventual flow)
- Spec consumer: `shared-growth-memory/INSTRUCTIONS-FOR-BEN.md` §3 (where corrections originate)
- Schema: `shared-growth-memory/schemas/feedback.md`
