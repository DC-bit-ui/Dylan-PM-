# Instructions for Ben's Claude — reading work insights from the shared bus

**Audience:** the Claude Code session Ben opens on his laptop.
**Purpose:** turn the dashboard's nightly work intelligence into a conversation. Ben asks *"who should I follow up?"* or *"who's worth revisiting from the old prospect database?"* — Claude reads the bus, surfaces the answer with rationale, and (when Ben corrects it) writes the correction back so the system gets sharper.

**Cost model:** filesystem reads only. The dashboard's coaching pipeline (Apex) does the expensive synthesis under Dylan's subscription overnight and lands the result in `queues/ben/work-cards.json`. Ben's Claude just walks the bus — no metered API spend.

---

## 1. Where the bus lives

The bus is on SharePoint and OneDrive-syncs to every team member's machine at:

```
<OneDrive root>\Claude Code Projects\shared-growth-memory\
```

Discover dynamically — don't hard-code Ben's Windows username:

```js
const path = require('path');
const os = require('os');
function busRoot() {
  if (process.env.BUS_PATH) return process.env.BUS_PATH;
  const od = process.env.OneDriveCommercial || process.env.OneDrive
          || path.join(os.homedir(), 'OneDrive - AgriProve');
  return path.join(od, 'Claude Code Projects', 'shared-growth-memory');
}
```

If the resolved path doesn't exist on Ben's machine, **halt and tell Ben**. Don't auto-create — the structure is owned by the dashboard side. Usual cause: OneDrive hasn't finished initial sync, or the folder hasn't been shared with Ben yet. Ping Dylan.

---

## 2. The three things Ben asks for

### 2a. "Who should I follow up with this week?"

The dashboard's coaching pipeline writes a ranked queue every night at 05:00 SAST. Read it:

```
queues/ben/work-cards.json
```

Shape (one entry per card — same shape as the dashboard's WORK tab exemplars):

```json
{
  "version": "rep-queue-1.0",
  "generated_at": "ISO8601",
  "rep_slug": "ben",
  "owner_id": "76812243",
  "card_count": 28,
  "cards": [
    {
      "card_id": "deal-<id>",
      "kind": "stuck_deal | completed_visit | stalled_call",
      "lookup_type": "deal | contact",
      "lookup_id": "<HubSpot id>",
      "hubspot_url": "https://app.hubspot.com/contacts/24224559/record/0-3/<id>",
      "title": "<deal or contact name>",
      "subtitle": "<stage · days · attribution · risk>",
      "heat": "HOT | WARM | COLD",
      "next_step_short": "<one-line action>",
      "next_step_qualifier": "<why this action and not another>",
      "diagnosis": [
        { "step": 1, "header": "...", "body": "..." },
        { "step": 2, "header": "...", "body": "..." },
        { "step": 3, "header": "...", "body": "..." }
      ],
      "diagnosis_assessment": "ok | next_step_revised | heuristic_was_wrong",
      "diagnosis_generated_at": "ISO8601"
    }
  ]
}
```

**How to answer Ben's question:**

1. Read `queues/ben/work-cards.json`.
2. Check `generated_at` — if >36h old, warn Ben the queue is stale and check `apex-runs.log` (last line is the most recent run timestamp).
3. Default sort: `HOT` first, then `WARM`, then `COLD`. Inside each heat, sort by `card_id` (stable).
4. Default top N: 5. Ben can ask for more.
5. For each card, present:
   - **Title + heat + stage/days/risk** (one line)
   - **Next step** — `next_step_short` then `next_step_qualifier` underneath
   - **Why** — the 3-step diagnosis, compressed to 1-2 lines per step unless Ben asks for full depth
   - **HubSpot link** at the end

**Filter switches Ben might ask for:**
- `--heat HOT` — only HOT cards
- `--stage "KCT Issued"` — filter on subtitle stage
- `--kind stuck_deal` — only one card kind
- `--top 10` — surface more

### 2b. "Who's worth revisiting from the old prospect database?"

This is the reengagement question Ben raised in the 2026-05-26 HORIZON snapshot meeting. The pipeline cliff means he needs to mine old prospects who said *"come back later"* and never got circled back to.

The data lives in two places:

**Primary signal — `customer-positions/contact-<id>.json`** (per `schemas/customer-position.md`):
- Walk every file. For each, look at the most recent `positions[]` entry.
- A revival candidate has at least one position with:
  - `topic` in `["timing", "partner_alignment", "25_year_commitment"]` AND
  - `sentiment` in `["neutral_warm", "neutral", "positive"]` AND
  - `as_of` is ≥ 6 months ago AND ≤ 18 months ago AND
  - No newer position after it (i.e., the customer went quiet after the deferral)
- The deferral phrasing to look for in `verbatim_or_distilled`: *"revisit later"*, *"come back"*, *"after harvest"*, *"talk to my wife"*, *"once we've"*, *"end of season"*, *"next year"*

**Cross-reference — `deal-signals/deal-<id>.json`**:
- For each candidate contact, find associated deals via `associated_deal_ids[]` on the contact-position file.
- Read the deal-signal. If `coaching_mode in ["cooling", "cold_loss_imminent"]` or the deal is closed_lost — that confirms the deferral never closed and the prospect is in the "cliff" cohort.
- If `coaching_mode === "healthy_progression"` — Ben already re-engaged. Skip.

**Output shape per candidate:**

```
[N] Contact: <generalised description from contact_name_generalised>
    Last said (≈<X> months ago): "<verbatim or distilled quote, ≤200 chars>"
    Topic / sentiment: <topic> / <sentiment>
    Associated deal(s): <deal_name> (<current_stage>, <days_in_stage>d)
    Why now: <one-line rationale — what's changed since their deferral, or why their original objection has likely softened>
    Suggested move: <call | email | snapshot — depending on sentiment and original topic>
    HubSpot: <deal url or contact url>
```

Default top 10. Sort by recency-of-deferral (older = colder = revisit lower priority) UNLESS Ben asks for "coldest first" (most-stale revival opportunities he's leaving on the table).

If walking `customer-positions/` returns nothing matching (the folder may still be sparsely populated), fall back to walking `deal-signals/` for deals where:
- `current_stage` is between "Discovery Call" and "Strategy Call"
- `days_in_current_stage` > 120
- `coaching_mode === "cooling"` or `"cold_loss_imminent"`

And tell Ben honestly: *"customer-positions/ is sparse — these are heuristic revivals from deal-signals only, no captured customer voice yet."*

### 2c. "Why is [contact X] worth revisiting?" / "Tell me more about [deal Y]"

Targeted deep-read. Given a contact or deal name (or HubSpot ID):

1. Find the matching card in `queues/ben/work-cards.json` (if any).
2. Read its full 3-step diagnosis.
3. Pull supplements:
   - `deal-supplements/<deal_id>/*.md|json` — recent Aircall transcripts, Outlook emails, Teams messages, Granola meetings, HubSpot engagement snapshots written by Apex daily-enrichment
   - `contact-supplements/<contact_id>/*.md|json` — same kinds, contact-scoped
4. Read the related `customer-positions/contact-<id>.json`.
5. Read any `deal-signals/deal-<id>.json`.
6. Synthesise — show Ben the full context, weighted toward what's *changed* since his last contact: new emails, new Teams mentions, new positions, new Granola meetings where the customer's name came up.

The dashboard's WORK tab shows this as the expanded exemplar card. Ben's Claude can match it offline by walking the bus.

---

## 3. Feedback loop — when Claude got it wrong

If Ben says *"this is wrong because..."* or *"the system shouldn't have said X"*, capture the correction so the dashboard learns. Two routes:

### Easiest — point Ben at the dashboard

The dashboard has a 💬 Report button on every WORK card. One click, free-text, posts straight to `feedback/feedback-<id>.json` per `schemas/feedback.md`.

### Direct file write (when Ben asks Claude to log it)

```json
{
  "id": "<auto: timestamp36-rand6>",
  "created_at": "<ISO now>",
  "created_by": "ben@agriprove.io",
  "type": "error | preference | comment | correction",
  "target_kind": "deal | contact | pattern | suggestion | system",
  "target_id": "<HubSpot id or pattern slug or null>",
  "severity": "low | medium | high",
  "title": "≤200 chars",
  "body": "<Ben's correction, verbatim or distilled>",
  "status": "open",
  "resolution": { "resolved_at": null, "resolved_by": null, "resolution_note": null, "action_taken": null },
  "tags": []
}
```

Atomic write to `feedback/feedback-<id>.json`. The dashboard reads this on every page load — the correction appears as a banner above the deal/contact within ~1 minute.

**Common Ben-shaped feedback:**
- `type=error, target_kind=deal` — "the diagnosis assumed no engagement but I called this guy last week"
- `type=preference, target_kind=system` — "I want HOT cards sorted by stage-days, not card_id, after heat"
- `type=correction, target_kind=suggestion` — "next-step said email but I already emailed twice — should suggest call"

---

## 4. Atomic writes — non-negotiable

OneDrive sync exposes half-written files. Always tmp + rename:

```js
const tmp = filePath + '.tmp';
fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(tmp, content);
fs.renameSync(tmp, filePath);
```

JSON: `JSON.stringify(obj, null, 2)`. LF line endings only.

---

## 5. PII rules

If Ben asks Claude to write a customer-position or pattern (rare but possible), generalise:

| Strip | Replace with |
|---|---|
| Customer full names | First name + property/business surname; "the landholder" otherwise |
| Specific revenue / ACCU / hectare absolutes | Ratios, percentages, multipliers |
| Methodology IP code names | Category-level ("the 25-year baseline tooling") |
| Other reps' specific performance numbers | Role / category |

When unsure, over-strip and flag.

For READING the bus and answering Ben in his own session — no PII rule applies; Ben already has the live HubSpot context. The PII rule is only for *writes* back to the bus (which propagate to every team member's machine).

---

## 6. What to do when the bus is stale

Apex (Cowork-side scheduled task) writes `apex-runs.log` after every run. Format:

```
2026-05-26T03:00:00Z · daily-enrichment · deals=128 contacts=1523 supplements_written=87
2026-05-27T03:00:00Z · daily-enrichment · deals=130 contacts=1532 supplements_written=92
```

Before answering Ben's question, read the last line. If the timestamp is >36h old, prefix the answer with:

> ⚠ Apex enrichment last ran <X>h ago — work-cards may be stale. Ping Dylan if this persists.

Don't refuse to answer — just be honest about freshness.

---

## 7. What NOT to do

- **Don't generate Ben's own work cards.** The dashboard's coaching pipeline does that under Dylan's subscription overnight. Ben's Claude reads the queue — it doesn't re-derive.
- **Don't call any metered API on Ben's behalf.** All synthesis is filesystem + Ben's own Claude subscription.
- **Don't write to `queues/`, `deal-signals/`, or `team-brain/`.** Those are dashboard-authored. Ben's writes go to `feedback/`, `customer-positions/` (only if Ben explicitly distills a customer quote himself), and `patterns/` (if Ben articulates a durable learning — rare).
- **Don't fabricate a card if it's not in the queue.** If Ben asks about a deal that isn't in `queues/ben/work-cards.json`, say so honestly. The queue is the canonical list of what the system thinks Ben should work on; absence means the system has no reason to surface that deal right now.
- **Don't surface other reps' queues to Ben.** Read `queues/ben/work-cards.json` only. If Ben asks "what's Hobbs working on?" — politely defer to Dylan or the dashboard.

---

## 8. Suggested conversation openings

When Ben opens his Claude Code session with this file in context, suggest:

- *"Who should I follow up with today?"* → reads `queues/ben/work-cards.json`, surfaces top 5 HOT cards with full diagnosis
- *"Who's worth revisiting from the old database?"* → walks customer-positions for warm-then-cold deferrals 6-18 months back
- *"Why is [name] still in my queue?"* → deep-dive on one card with supplements
- *"What changed for [deal] this week?"* → walks deal-supplements/<id>/ for files written in the last 7 days
- *"That suggestion is wrong because..."* → routes to `feedback/` as a correction

Don't proactively surface cards on every turn — wait for Ben to ask. Default conversation mode: respond to question, end of turn, await next question.

---

## 9. Reading order for orientation (first time only)

1. This file
2. `README.md` — bus contract overview
3. `schemas/feedback.md` — for §3 writes
4. `schemas/customer-position.md` — for §2b filters and rare §3 writes
5. `schemas/deal-signal.md` — for §2c deep-reads
6. `team-brain/profiles/ben.md` — Ben's own auto-generated profile, useful for context-setting

After reading: ask Ben *"What do you want to look at first — today's follow-ups, reengagement candidates, or a specific deal?"* and proceed.

---

**Contact:** Dylan (`dylan@agriprove.io`). Bus structure evolves; pull this file fresh before any major session. Questions / disagreements → write them to `feedback/` so they don't get lost.

— Dylan + the dashboard
