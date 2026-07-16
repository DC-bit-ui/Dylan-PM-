---
date: 2026-05-26
type: design-proposal
status: draft-for-review
audience: dylan, claudia, ben (eventually)
relates-to:
  - inbox/cowork/2026-05-26-ben-work-insights-handoff.md (Phase 1)
  - inbox/cowork/2026-05-26-jira-correction-stream-surveillance.md (Phase 1.5)
  - shared-growth-memory/INSTRUCTIONS-FOR-BEN.md (Phase 1 + 2 home)
  - memory/decisions/2026-05-21-feedback-loop-design.md (parallel branch — pattern confidence)
---

# Phase 2 — closed-loop coaching: proactive action proposal + outcome capture

> **Critical architecture note (2026-05-26):** the kit must **propose the action automatically** whenever it surfaces a card. Ben should never have to ask for the draft — it comes attached. He reviews, edits, sends, or skips. The kit captures whichever and writes the outcome back.

## The vision in one paragraph

Today the kit *describes* what Ben should do ("call Rodger with a fresh HORIZON snapshot framed around what's changed in 7 months"). Phase 2 makes the kit *do half of it automatically* — when Ben asks "what's stuck in my pipeline", every card surfaced comes with the recommended action **already drafted** (email body, SMS text, call talking points, snapshot framing) attached underneath. Ben reviews, hits send (or edits first), and the kit captures the dispatch. When the customer responds — or doesn't — Ben tells the kit and that closes the loop. The kit doesn't wait for Ben to walk down the action chain step by step; it proposes the chain from the start and Ben drives the yes/no/edit at the top of it. The dashboard's coaching engine reads those outcome records and dynamically adjusts which methods to recommend, for which deal shapes, with how much confidence. The architecture diagram's `FB → ENG` arrow finally becomes real.

## The four new flows

### Flow 1 — Proactive action proposal (the kit drafts BEFORE Ben asks)

**This is the default behaviour of every card surface.** When the kit returns a pipeline-diagnosis card, a reengagement candidate, or a deep-read, the recommended action comes **already drafted underneath the card**. Ben never types "draft an email" — he types nothing extra. The draft is there.

**Triggers (these surface BOTH the card AND the drafted action):**
- *"what's stuck in my pipeline"* → §3a render now includes drafts inline
- *"show me the diagnosis on Rodger"* → §3c deep-read now includes draft inline
- *"reengagement candidates"* → §3b reengagement render now includes drafts inline

**Optional explicit triggers (rare — for re-drafting or alternative angles):**
- *"redraft that"* / *"give me a different angle"* / *"more casual version"* / *"shorter"* — kit re-runs draft generation with the modifier
- *"draft the call script instead"* — kit switches channel from email to call talking points

**Token economics:**
- For the top card surfaced, the draft renders inline (~3-5k tokens)
- For the next 2-4 cards in a top-5 list, only the draft *summary* renders (1 line). Full draft expands when Ben opens that card or hits "draft all"
- Token cost per "what's stuck" query: ~10-15k tokens on Ben's subscription. Acceptable for the value
- V2 optimisation (Phase 2b): Apex pre-generates drafts overnight and persists them to `drafts/`. Ben's session reads them — zero token cost on his side. Bigger Apex overnight job but more scalable

**What the kit reads:**
- The deal card (method, rationale, last contact, indicators)
- `deal-supplements/<deal_id>/*` — recent transcripts, emails, Teams mentions for tone and context
- `contact-supplements/<contact_id>/*` — same, broader
- `customer-positions/contact-<id>.json` — verbatim customer voice (sparse today, builds over time)
- `team-brain/profiles/ben.md` — Ben's signature moves, voice patterns, the "things have changed" reengagement frame, the "take it to the team" defer
- Relevant patterns from `patterns/` — e.g. `2026-05-09-nurture-back-horizon-snapshot.md` for the HORIZON framing
- Existing `personas/ben/active-preferences.json` — `stop_recommending` entries, tone overrides

**What the kit produces — for the top card in a list, full draft inline:**

```
─────────────────────────────────────────────────────────────────────
[HOT · Strategy Call · 246d in stage · risk 100]
Brigalow and Mostowie — Rodger Jefferis

→ Method: Fresh HORIZON snapshot framed as "what's changed in 7 months"

Last contact: 2025-10-15 · call · "Very busy, wants to revisit November"
(208 days ago)

Why he's still in your queue:
  1. Explicit deferral, not ghosted
  2. Unsolicited PDF resets the clock
  3. Re-permission check before any asset

──── ACTION READY: Email draft ────

Subject: Quick update — your numbers have shifted since October

Hi Rodger,

Hope you're well. When we last spoke in October you mentioned you wanted
to revisit in November — we let that slip past, my fault, but I want to
loop back because a lot has changed on our side in the seven months since.

The platform's had material upgrades — refined methodology rigour, faster
report turnaround, and updated ACCU projections that I expect will look
materially better on your Brigalow/Mostowie footprint than the version
you saw last time. I've attached a fresh HORIZON snapshot generated this
week so you can see the delta directly.

No ask attached to this — just wanted you to have the updated picture.
If anything in there shifts your view, I'm around for a 20-minute call
whenever suits.

Cheers,
Ben

──── DRAFT SOURCES ────
Voice lifted from your Raynolds 2026-04-23 call (your strongest reengagement example)
Frame from pattern 2026-05-09 — HORIZON snapshot for closed-lost timing deferrals
Soft re-permission opener — honours his October deferral without guilt
"No ask attached" — Hobbs-discipline, the snapshot IS the asset

──── WHAT TO DO ────
[ Send as drafted ]  [ Edit it ]  [ Skip Rodger today ]  [ Different angle ]

─────────────────────────────────────────────────────────────────────
```

For cards 2-5 in a top-5 list, the draft summary is one line; full draft expands when Ben asks:

```
2.  Bulgoo Pastoral — Jeremy Pockley [HOT · Strategy Call · 272d · risk 100]
    Method: Call with binary frame. Draft ready (8-min call script).
    Last contact: 2025-12-17 · call · brief, no commitment captured (146 days ago)
    [ Open draft ]  [ Skip ]

3.  JA - John Atherton [HOT · Strategy Call · 250d · risk 100]
    Method: Call with binary frame — no engagement record at all.
    Draft ready (3-min discovery script).
    [ Open draft ]  [ Skip ]

4.  ... (cards 4 + 5 similar)

Want me to open all five drafts at once? Or work them one at a time?
```

**Logged immediately on surface:** `drafts/draft-<id>.json` for each draft, status="awaiting_review", per the schema below.

### Flow 2 — Action capture (Ben hits send, edits, or skips)

Because the draft is presented proactively, Ben's response is always a yes/no/edit on something specific — not "draft me an email". The kit listens for these signals immediately after surfacing a card:

**Approval signals (status=sent):**
- *"send it"* / *"sending"* / *"send as drafted"* / *"yes"* / *"go"* → status=sent
- *"sent"* (past tense, Ben already dispatched) → status=sent_already

**Edit signals (status=sent_with_edits):**
- *"change [X] to [Y]"* / *"shorten the second paragraph"* / *"swap the opener"* → kit applies the edit, shows the revised draft, awaits confirm-then-send
- Ben pastes a fully modified version → kit diffs and records both
- *"more casual"* / *"shorter"* / *"more direct"* / *"add [Y]"* → tone/content adjustment, re-render

**Skip signals (status=declined):**
- *"skip"* / *"not now"* / *"not this one"* / *"actually I don't want to"* → status=declined, with optional reason capture: *"why?"* → records reason
- *"already done this"* — flips to status=already_actioned and writes evidence (channel, date) to the linked card's action-outcome record

**Channel-switch signals (recurses through Flow 1):**
- *"do the call script instead"* / *"SMS version"* / *"farm visit confirmation instead"* → kit re-runs Flow 1 with new method, presents new draft

**What the kit captures (every time):**
- Final dispatched text (or declined status + reason)
- Diff between original kit draft and Ben's final version
- Timestamp of dispatch
- Channel (email / SMS / call / Teams / farm-visit)
- Linked draft_id + card_id + deal_id

**Logged immediately:** updates `drafts/draft-<id>.json` with `dispatched: {...}`. Also writes a structured `action-outcomes/<id>.json` linking the draft to the eventual response.

**Critical UX detail:** if Ben says nothing after a draft surfaces and just moves to the next card or asks a different question, the kit treats that as "deferred, not declined" — leaves the draft in `status=awaiting_review`, and surfaces it again on Ben's next session if the card is still in the queue. Better than guessing.

### Flow 3 — Response capture (the customer reacts)

**Triggers (Ben types days later):**
- *"Rodger replied — wants the call"* → outcome=positive
- *"Rodger said no thanks"* → outcome=negative
- *"Rodger hasn't replied"* (after >7 days from dispatch) → outcome=no_response_at_window
- *"Rodger replied but pushed back on [X]"* → outcome=positive_with_objection + capture the objection text
- Or passive — the dashboard detects via HubSpot engagement post-dispatch (later phase)

**What the kit captures:**
- Outcome label + verbatim customer response
- Time-to-response (days from dispatch)
- Whether the response moved the deal stage (HubSpot signal eventually)
- Updates `action-outcomes/<id>.json` with response details

### Flow 4 — Pattern learning (the system gets sharper)

**This runs in the overnight coaching engine, not in Ben's session.** Once per night Apex reads the last N days of `action-outcomes/` and computes:

- For each (method, deal_archetype, sentiment, deferral_age_bucket) tuple → success rate
- For each pattern in `patterns/` → confirmations, contradictions, partials (already designed in `2026-05-21-feedback-loop-design.md`)
- For Ben specifically → his personal success rates by method
- Adjusts the coaching engine's method routing thresholds

**Outputs:**
- `patterns/_outcomes/<pattern-slug>.jsonl` per the 2026-05-21 decision — audit log
- Updated `confidence_score` + `confidence_label` on each pattern
- Optionally: per-rep `personas/<rep>/method-track-record.json` — Ben's own batting average

Then the next overnight work-card generation uses the updated confidence to weight recommendations. Methods Ben has confirmed land at his bat 70%+ get strong endorsement; methods landing under 30% get downgraded to "consider also" or dropped entirely.

## The closed loop, end-to-end

```
NIGHT 0          Apex synthesises work-cards.json — Rodger card with
                 method=fresh_horizon_snapshot, confidence=high (pattern 2026-05-09)

MORNING N+1      Ben asks "what's stuck?"
                 Kit reads supplements + voice profile + pattern in same response
                 Surfaces top 5 cards. Card 1 (Rodger) includes the email
                 fully drafted underneath. Cards 2-5 include one-line draft
                 summaries with "Open draft" affordance.
                 Logs drafts/draft-abc123.json (status=awaiting_review) for all 5.

DAY N+1          Ben reads Rodger's draft, says "shorten the second paragraph,
                 then send"
                 Kit applies edit, shows revised version, awaits confirm
                 Ben says "yep send"
                 Kit captures the diff (kit's draft → Ben's final),
                 writes action-outcomes/action-abc123.json (status=sent_with_edits,
                 channel=email, dispatched_at=ISO)

DAY N+4          Rodger replies "let's do the call"
                 Ben tells kit "Rodger wants the call"
                 Kit updates action-outcomes/action-abc123.json
                 (outcome=positive, days_to_response=3,
                  customer_response_verbatim="let's do the call")
                 Kit immediately drafts the call-script for the next step:
                 proactive again — Ben never asks for it.

NIGHT N+5        Apex coaching synthesis reads recent action-outcomes
                 Pattern 2026-05-09 gets +1 confirmation
                 (method=horizon_snapshot worked for 7mo deferral, with edits
                  → "shortened second paragraph" recorded as voice signal)
                 personas/ben/method-track-record.json updated: fresh_horizon_snapshot
                 at 7-9mo deferral = N/M success rate (Ben's personal)

NIGHT N+30       Pattern 2026-05-09 confidence recomputed across all team outcomes
                 If >75% → stays "high"; if drift to <40% → demoted
                 Method routing in next overnight uses updated thresholds

NIGHT N+60       Coaching engine notices: Ben's edits consistently shorten paragraph 2
                 personas/ben/active-preferences.json updated:
                 render.draft_style = "shorter middle paragraphs"
                 Next morning's drafts are already pre-shortened — Ben doesn't have to edit
                 The system has self-tuned to Ben's actual practice.
```

That's the closed-loop coaching. Every recommendation is measured against an outcome. The kit doesn't just describe — it predicts, the world responds, the prediction gets graded, the next prediction is sharper.

## Distributed intelligence — making the bus multi-author

Today only Apex writes intelligence (it runs on your subscription). Ben's kit writes feedback + session observations but doesn't *create* coaching content. Claudia's Storm Boy Tool writes nothing to the bus — every observation it has stays inside the tool.

Phase 2 changes this — each Claude session contributes its specialty back to the shared bus, under its own subscription. The bus becomes a true team-intelligence layer.

### What each tool contributes

| Tool | Whose subscription | What it writes to the bus | When |
|---|---|---|---|
| **Apex** (overnight coaching) | Dylan | `queues/<rep>/work-cards.json`, `deal-signals/`, `customer-positions/` (Pass 0), `patterns/_outcomes/`, refreshed pattern confidence | Nightly + weekly |
| **The kit** (this Phase 2) | Ben (during his sessions) | `drafts/`, `action-outcomes/`, `feedback/`, `personas/ben/session-observations/` | When Ben asks for a draft or reports an outcome |
| **Storm Boy Tool** (Claudia's tool) | Claudia / Ben during their sessions | `call-summaries/<contact_id>/<call_id>.json` (after call-admin), `research-notes/<contact_id>.md` (after research-leads), `reallocation-events/<event_id>.json` (after reallocation) | Whenever the corresponding workflow runs |
| **Frontier dashboard** | n/a (server-side) | Reads everything, writes nothing | On every UI render + the HEALTH tab aggregates |

The distributed write model means:
1. **Cost is shared** across team subscriptions, not concentrated on Dylan's
2. **Every Claude session enriches the team brain** — Claudia's call admin becomes coaching input for Ben; Ben's outcomes become pattern signal for everyone
3. **No tool is a bottleneck** — if Apex goes down for a week, the bus continues to accumulate intelligence from the other writers
4. **Read-side latency drops** — the dashboard reads pre-synthesised summaries instead of having to walk raw supplements

### What needs to happen for Storm Boy Tool to write to the bus

Claudia's Storm Boy Tool has the routing rule: "Only Claudia may request changes to any file in this project." So I can't extend Storm Boy Tool unilaterally. Phase 2 needs a discussion with Claudia about:

1. **Adding a "write to bus" step** to `sb-call-admin.md` — after Ben logs a call, also write a `call-summaries/<contact_id>-<call_id>.json` with the outcome
2. **Adding a "write to bus" step** to `research-leads/` skills — after assessing a contact, write a `research-notes/<contact_id>.md`
3. **Adding a "write to bus" step** to `call-manager/daily-sync/` — after the overnight Aircall sync, write a daily summary
4. **Schema agreement** — the bus's `schemas/` adds new files (call-summary.md, research-note.md, etc.) defining what Storm Boy Tool will write

These are coordination items, not unilateral changes. Worth a 30-min Claudia conversation.

### Voice — the kit needs to write IN Ben's voice

For draft generation to land, the output has to sound like Ben, not like Claude. Three sources of voice signal:

1. **`team-brain/profiles/ben.md`** — already populated. Has his signature moves, the "things have changed" frame, the take-it-back-to-the-team line, his rapport style, his stale-cohort patterns.
2. **`deal-supplements/<id>/` and `contact-supplements/<id>/`** — every Aircall transcript and Outlook email Ben has sent. The kit can lift phrasing patterns directly.
3. **Action-outcomes feedback** — over time, the kit learns which voice patterns produced positive outcomes vs which didn't (e.g., his "padded conversation" cold-open landing 80% of the time vs "AgriProve in Albury" landing 40%).

For V1 of draft mode, the kit reads (1) and (2). Over time, (3) refines it. A future "bens-voice" skill (parallel to the existing `dylans-voice`) could be packaged as a dedicated skill — but for Phase 2 V1, inline reading of profile + supplements is enough.

## New bus schemas

Phase 2 adds four new write surfaces. Each gets a `schemas/<name>.md` file documenting it.

### `drafts/draft-<id>.json`

```json
{
  "id": "<auto: ts36-rand6>",
  "created_at": "<ISO>",
  "created_by": "<rep_email>",
  "linked_card_id": "<card_id from queues/ben/work-cards.json>",
  "linked_deal_id": "<HubSpot deal id>",
  "linked_contact_id": "<HubSpot contact id>",
  "method": "fresh_horizon_snapshot | call | sms | email_general | farm_visit_confirmation | ...",
  "channel": "email | sms | call_script | snapshot_framing",
  "draft_body": "<the full draft text>",
  "draft_subject": "<for emails>",
  "voice_sources": [
    "team-brain/profiles/ben.md#reengagement-frame",
    "deal-supplements/<id>/confluence-aircall-2026-04-23-raynolds.md"
  ],
  "pattern_sources": ["patterns/2026-05-09-nurture-back-horizon-snapshot.md"],
  "method_rationale": "<one-paragraph why this method>",
  "status": "awaiting_review | reviewed_pending_send | sent | sent_with_edits | declined | superseded",
  "dispatched": {
    "dispatched_at": "<ISO when status flipped to sent>",
    "dispatched_channel": "<email|sms|teams|call>",
    "edits_applied": "<diff or null>",
    "final_text": "<what Ben actually sent — may equal draft_body or be edited>"
  },
  "_provenance": { ... per the supplement-provenance-schema decision }
}
```

### `action-outcomes/action-<id>.json`

```json
{
  "id": "<auto>",
  "created_at": "<ISO>",
  "linked_draft_id": "<draft-xxx or null if no draft was used>",
  "linked_card_id": "<card_id>",
  "linked_deal_id": "<HubSpot deal id>",
  "method_actioned": "<which method Ben used>",
  "channel_actioned": "<email|sms|call|farm_visit|none>",
  "outcome": "positive | negative | positive_with_objection | no_response_at_window | declined_to_action",
  "outcome_evidence": {
    "customer_response_verbatim": "<≤500 chars>",
    "occurred_at": "<ISO>",
    "channel": "<how the customer replied>",
    "days_from_dispatch": <int>
  },
  "deal_stage_movement": {
    "before": "<HubSpot stage at dispatch time>",
    "after": "<HubSpot stage at outcome capture time>",
    "moved_at": "<ISO if changed>"
  },
  "_provenance": { ... }
}
```

### `recommended-actions/recommended-<deal_id>-<date>.json`

A daily snapshot of what the coaching engine recommended for each deal Ben owns. Lets the dashboard compute coaching effectiveness as: `recommended actions / actioned / outcome_positive`.

```json
{
  "as_of_date": "2026-05-26",
  "deal_id": "141507724737",
  "rep_email": "ben@agriprove.io",
  "card_id_in_queue": "deal-141507724737",
  "recommended_method": "fresh_horizon_snapshot",
  "method_confidence": "high",
  "method_rationale_summary": "<one line>"
}
```

### `call-summaries/<contact_id>-<call_id>.json` (Storm Boy Tool writes)

Spec for what Storm Boy Tool would write after Ben does call-admin. Schema TBD with Claudia.

```json
{
  "id": "<call_id>",
  "contact_id": "<HubSpot contact id>",
  "rep_email": "ben@agriprove.io",
  "call_at": "<ISO>",
  "duration_seconds": <int>,
  "outcome_short": "<one-line>",
  "next_step_set_in_hubspot": "<what task got created>",
  "lead_stage_change": { "from": "<X>", "to": "<Y>" },
  "transcript_confluence_page_id": "<id>",
  "key_quotes": ["<verbatim, generalised per PII rule>"]
}
```

## Dashboard UI changes

Storm Boy Tracker dashboard needs Phase 2 reads. Per the WORK and HEALTH tabs:

**WORK tab — deal expand overlay:**
- New section: "Recent recommendations and outcomes"
  - Last 3 recommended actions for this deal
  - For each: method, dispatch status, customer response (if any), days-to-response
  - Shows the closed loop visually for each card

**HEALTH tab — new "Coaching Effectiveness" widget:**
- Total recommendations issued (last 30 days)
- Action rate: % of recommendations actioned vs ignored
- Success rate: % of actioned recommendations producing positive outcome
- Top-performing methods (sorted by success rate)
- Underperforming methods (flag for review)
- Per-rep breakdown when expanded

**REENGAGEMENT view (new, but separate epic):**
- Closed-lost candidates from HubSpot
- For each: last recommended action (if any), outcome history
- Lets Ben work the closed-lost cliff cohort properly

Each is a Jira ticket against `stormboy-tracker` separately. Worth splitting into 3 PRs.

## Phasing — what ships when

### Phase 2a — Draft + outcome capture (KIT ONLY)
**Cost:** ~3 hours of INSTRUCTIONS-FOR-BEN.md additions + schema docs.
**Dependencies:** None — entirely within my kit.
**Ships:** New §3e Draft mode + §3f Outcome capture in INSTRUCTIONS-FOR-BEN.md. New `drafts/`, `action-outcomes/`, `recommended-actions/` folders + schemas. Bus README updated.

### Phase 2b — Apex consumes outcomes
**Cost:** ~4 hours of edits to `daily-enrichment-pipeline` + new logic in coaching engine.
**Dependencies:** Phase 2a deployed, Ben has ~2 weeks of action-outcomes accumulated to learn from.
**Ships:** Pattern confidence updates from outcomes (extending the 2026-05-21 decision). Per-rep method track records. Updated method routing.

### Phase 2c — Storm Boy Tool writes to the bus
**Cost:** Coordination with Claudia. She implements the write-to-bus step in her existing skills.
**Dependencies:** Claudia conversation. Schema agreement.
**Ships:** Call summaries, research notes, reallocation events all landing in the bus.

### Phase 2d — Dashboard UI for coaching effectiveness
**Cost:** ~12 hours of stormboy-tracker frontend + backend.
**Dependencies:** Phase 2a + 2b shipped, real data accumulating.
**Ships:** WORK tab deal-overlay additions. HEALTH tab Coaching Effectiveness widget. New REENGAGEMENT view.

### Phase 2e — Voice skill (`bens-voice`)
**Cost:** Similar to building `dylans-voice` — ~6 hours after enough supplement data accumulates.
**Dependencies:** ~50+ recent Aircall transcripts + emails + Teams messages from Ben.
**Ships:** A dedicated voice skill the kit invokes during draft generation.

## What I propose to build today

**Phase 2a only.** That's:
1. Rewrite §3a / §3b / §3c in INSTRUCTIONS-FOR-BEN.md so that **every card surface includes the drafted action inline by default**. Drafts are no longer opt-in.
2. Add §3e (Action-capture flow) — listens for send / edit / skip / channel-switch signals.
3. Add §3f (Response-capture flow) — listens for customer-reply reports days later.
4. Add §4.1 (Voice + drafting source order) — what the kit reads to write IN Ben's voice.
5. Create `schemas/draft.md`, `schemas/action-outcome.md`, `schemas/recommended-action.md`.
6. Create placeholder folders `drafts/`, `action-outcomes/`, `recommended-actions/` in the OneDrive bus.
7. Update bus CLAUDE.md write-targets table.

Phases 2b, 2c, 2d need coordination:
- **2b** — your call when to extend Apex. I can stage the SKILL.md edits for review.
- **2c** — needs Claudia. I can prepare a one-pager + schemas for her to review.
- **2d** — Jira tickets I can draft after 2a ships, file against stormboy-tracker.

## Open design questions

1. **Where do customer responses get captured?** Ben tells the kit ("Rodger replied"), but ideally HubSpot would auto-detect new engagement post-dispatch and the kit just reads it. V1: Ben types it. V2: HubSpot engagement webhook → bus.

2. **Should drafts auto-send?** **NO.** Ben reviews every draft. The kit drafts; Ben dispatches. This is non-negotiable for trust early. Maybe in 12 months once track record is strong.

3. **What about cross-rep learning?** If Hobbs sends a HORIZON snapshot and it lands, should Ben's recommendations sharpen too? Yes — patterns are team-level, but the per-rep track records stay scoped. Hobbs's success becomes a confirmation on the pattern; Ben benefits via the pattern getting "high" confidence.

4. **Privacy in drafts.** Should drafts be visible cross-team? Probably no — Ben's drafts to his customers are his alone. Folder is per-rep: `drafts/<rep>/draft-<id>.json`.

5. **Storm Boy Tool's role in draft mode.** Storm Boy Tool's call-admin already captures the call outcome — should call-admin invoke draft mode for the next-step email? Maybe — a "draft the follow-up email" call inside call-admin. Worth flagging to Claudia.

6. **Cost of draft generation.** Each draft is a Claude reasoning task on Ben's subscription. ~3-5k tokens per draft. Not free but reasonable. If Ben drafts 10 emails a day = ~50k tokens = a few cents per day on his sub. Tractable.

## Concrete proposal for our next step

If you green-light, I'll:

1. Today, while you're testing Phase 1: build Phase 2a (kit-only additions). Ship to OneDrive + git mirror.
2. After your Phase 1 test passes and Phase 2a is in: we test Phase 2a end-to-end the same way — you act as Ben, ask "draft an email for Rodger", I observe what the kit produces, we iterate.
3. After Phase 2a is solid: I draft Phase 2c (Storm Boy Tool integration) as a one-pager for Claudia. You review, decide whether to take it to her.
4. After Phase 2a is producing real data (~2 weeks of action-outcomes): Phase 2b — Apex consumes outcomes for pattern confidence. Real closed loop.
5. Parallel track: Phase 2d Jira tickets for stormboy-tracker UI. Files when you're ready.

Phase 2e (dedicated voice skill) waits — the inline reading approach in Phase 2a is enough to start.

---

**Bottom line:** Phase 1 gives Ben coached cards he can react to. Phase 2 gives him drafted content he can dispatch, captures what happens after, and uses those outcomes to make the coaching sharper over time. The bus becomes the team intelligence layer instead of just Apex's output. Cost gets distributed across team subscriptions. The dashboard surfaces effectiveness, not just activity. The closed loop closes.

Worth doing. Want me to build 2a today?
