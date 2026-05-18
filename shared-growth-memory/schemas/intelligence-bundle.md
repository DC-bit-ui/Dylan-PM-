# Schema — `intelligence-bundles/` + `intelligence-results/`

The subscription-LLM compute substrate. Replaces direct Anthropic API calls from the dashboard with a queue that Cowork (scheduled, under Dylan's subscription) or Claude Code (interactive, under Dylan's subscription) processes. Zero metered-API cost.

## Why

AgriProve's shared `ANTHROPIC_API_KEY` is rate-limited across products (Snapshots, Frontier, this dashboard, etc.). Cadel's directive 2026-05-18: avoid API-keyed calls for this dashboard's intelligence layer; use the flat-fee Claude subscriptions (Cowork + Claude Code Pro/Max) instead. Cadence flexibility — every two-day intelligence run is fine, on-demand is not required.

## File layout

```
intelligence-bundles/
  <id>.md         ← human-readable prompt + inputs (what Claude Code sees)
  <id>.json       ← machine-readable metadata + state
intelligence-results/
  <id>.json       ← processed output (when complete)
```

`id` = `<timestamp36>-<random6>` — generated at creation.

## Bundle JSON shape

```json
{
  "id": "mpz4abcd-x7q3rs",
  "created_at": "2026-05-18T08:30:00Z",
  "created_by": "dashboard:/api/intelligence-bundles | manual",
  "purpose": "persona-refresh | deal-diagnosis | customer-themes-cluster | brain-ask | objection-cards | win-pattern-extraction | other",
  "target_file": "shared-growth-memory/team-brain/profiles/hobbs.md",
  "target_kind": "profile | diagnosis | cluster | answer | pattern | analysis",
  "input_summary": "≤200 chars summary of what this is about",
  "output_schema": "json | markdown | text",
  "model_hint": "haiku | sonnet | opus",
  "status": "queued | claimed | completed | failed",
  "claimed_at": null,
  "claimed_by": "cowork:apex-process-intelligence | claude_code:dylan | manual_paste",
  "completed_at": null,
  "error": null,
  "result_file": null
}
```

## Bundle markdown shape (the .md file)

The `.md` is what Claude reads. Structure:

```markdown
# Intelligence bundle <id>

**Purpose:** <one of the enum values>
**Target:** <target_file + target_kind>
**Output schema:** <json | markdown | text>
**Model hint:** <haiku | sonnet | opus> — guidance only; Claude Code/Cowork run under whatever subscription model is active

---

## System prompt

<verbatim system prompt — what Claude should be>

---

## Input data

<verbatim input data — corpus, transcripts, metrics, whatever needs analysis>

---

## Expected output

<the schema or shape Claude should produce>

---

## Where to write the result

Save the final output as JSON to `shared-growth-memory/intelligence-results/<id>.json`
with shape:

```json
{
  "id": "<id>",
  "completed_at": "<ISO timestamp>",
  "completed_by": "claude_code:<your-session-id> | cowork:apex",
  "result": <the actual output, matching output_schema>
}
```

Then update the bundle's metadata JSON status to `completed`.
```

## How a Claude Code session processes a bundle

When Dylan opens a Claude Code session and wants to process pending bundles, he can prompt:

> "Process the next queued intelligence bundle in `C:\Users\<me>\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory\intelligence-bundles\`. Read the bundle .md, do the analysis, write the result, mark the bundle completed."

Claude Code reads the bundle, runs the analysis using its own (subscription) reasoning, writes the result file, updates the metadata. Done. No API key, no cost beyond the subscription.

## How a Cowork scheduled task processes a bundle

The Apex commission `2026-05-18-apex-intelligence-bundles-commission.md` defines a scheduled task running every 2 hours that:
1. Lists `intelligence-bundles/*.json` with `status: queued`
2. For each (up to N per run): claims it, reads the `.md`, runs the analysis, writes result + marks completed
3. Logs to `apex-runs.log`

Cowork runs this under Dylan's subscription — no metered cost.

## Dashboard's role

Dashboard writes bundles when synthesis is needed; reads `intelligence-results/<id>.json` when results are ready. Never calls Anthropic API directly for these flows.

For UI: a "Run via Claude Code" affordance shows the markdown prompt with a copy button. Dylan can paste into Claude Code (or claude.ai web on mobile) and paste the result back into a textarea that POSTs to `/api/intelligence/results/:id`.

## Atomic writes

Same as the rest of the bus — `.tmp` then rename. Critical here because Cowork OneDrive sync can expose half-written files mid-process.

## Conflict handling

Status field acts as a soft lock. `claimed_at` + `claimed_by` give visibility into who's working on it. If a bundle has been claimed for more than its expected processing time (default 30 min) without becoming `completed`, it's eligible for re-claim — write a new claim with current timestamp.

## Sensitivity

Bundle prompts may include verbatim customer quotes for analysis. Both the bundle and the result file live in the shared bus, so PII-generalisation rules apply same as patterns/customer-positions. When writing into a bundle's input data, follow the §8 PII rules from `INTEGRATION-FOR-CLAUDIA.md`.
