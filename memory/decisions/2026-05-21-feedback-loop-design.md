---
date: 2026-05-21
status: PROPOSED — design draft, awaiting Dylan review on 4 open questions
tags: [data-architecture, feedback-loop, pattern-confidence, refinement]
authors: [Dylan + Claude Code Tier 1 data audit]
depends-on: [memory/decisions/2026-05-21-supplement-provenance-schema.md]
---

# Wire feedback loop: probe-outcomes → pattern confidence

## Context

The 2026-05-21 data architecture audit found that `shared-growth-memory/architecture/system-schema.md` shows an `FB -.-> ENG` arrow (feedback flows to engines), but no coaching engine reads `feedback/` or `probe-outcomes/` before generating recommendations. Pattern confidence is set at write time and never adjusted from observed outcomes.

This is the highest-leverage structural fix in the system — closing it means every future improvement compounds, because the system starts correcting itself.

## The current state

**Pattern files** (`shared-growth-memory/patterns/<date>-<slug>.md`) have YAML front-matter:
```yaml
confidence: high | moderate | low
written_at: <ISO>
sources: [...]
evidence: [...]
surfaced_in_systems: [...]
last_validated: <ISO>
```

`confidence` is set manually at write time. There is no mechanism that adjusts it.

**Probe outcomes** (`shared-growth-memory/probe-outcomes/<id>.json`) currently record:
- `probe_id`
- `predicted_outcome`
- `actual_outcome`
- `as_of`

There is no field citing which pattern(s) produced the probe.

**`probeStats().populated_rate`** counts probes with resolved outcomes. Nothing consumes it.

## Proposed mechanism

Three changes:

### 1. probe-outcome schema — add `cited_patterns`

```yaml
{
  "probe_id": "<id>",
  "predicted_outcome": "...",
  "actual_outcome": "...",
  "as_of": "<ISO>",
  "cited_patterns": ["<pattern-slug>", ...],      // NEW — required for new writes
  "cited_supplement_ids": ["<source_id>", ...]    // NEW — optional; uses provenance schema's source_id format
}
```

`cited_patterns` is required for new probe-outcomes. Existing outcomes without it are counted as "unattributed" and excluded from the feedback engine.

`cited_supplement_ids` is optional but valuable: traces which specific signals informed a prediction. Compounds with the provenance schema (depends-on above).

### 2. pattern schema — add outcome tracking

```yaml
---
confidence: high | moderate | low | preliminary | contradicted   # 'preliminary' and 'contradicted' are NEW
written_at: <ISO>
sources: [...]
evidence: [...]
surfaced_in_systems: [...]
last_validated: <ISO>
# NEW fields:
confirmations: <int>
contradictions: <int>
partials: <int>
confidence_score: <float | null>       # 0.0-1.0, derived
confidence_last_updated: <ISO>
outcome_window_start: <ISO>            # outcomes older than this excluded
---
```

Existing patterns migrate with `confirmations: 0`, `contradictions: 0`, `partials: 0`, `confidence_score: null` until the first feedback pass runs.

### 3. New feedback pass — `pattern-curator.adjustConfidenceFromProbeOutcomes()`

Runs in the same Friday window as `weekly-pattern-curation` (16:30 SAST), BEFORE the existing archive step.

```
For each closed probe-outcome with cited_patterns:
  If outcome.as_of < pattern.outcome_window_start: skip (out of window)
  For each cited_pattern:
    Compare actual_outcome vs predicted_outcome:
      Match → pattern.confirmations += 1
      Contradict → pattern.contradictions += 1
      Partial/ambiguous → pattern.partials += 1

For each pattern:
  Recompute confidence_score:
    denom = confirmations + contradictions + (0.5 * partials)
    If denom < 5: confidence_score = null, confidence_label = "preliminary"
    Else: confidence_score = confirmations / denom
  Map score → confidence label:
    score >= 0.75 → high
    0.40 <= score < 0.75 → moderate
    0.20 <= score < 0.40 → low
    score < 0.20 AND denom >= 10 → contradicted   (only if Q2 lands on "introduce contradicted label")

  Update confidence_last_updated
```

Existing curation logic then applies (archive low-confidence single-system patterns, etc.).

## Open design questions for Dylan

### Q1. Rolling window — how long?

Patterns from 2 years ago shouldn't dominate current confidence.
- **Proposed default: last 12 months.** Outcomes older than this are excluded. Pattern keeps the older counts as historical record but they don't influence the current label.
- **Alternative — 6 months:** more responsive, more volatile
- **Alternative — lifetime cumulative:** most stable, but stale signals can mask current drift
- **Alternative — weighted decay** (linear or exponential by age): more sophisticated, harder to explain

### Q2. What happens to a pattern with `confidence_score < 0.20` and `denom >= 10`?

The pattern is empirically wrong.
- **Auto-archive** when this state is reached (most aggressive)
- **Demote to `contradicted` confidence label** (new label; signal but don't delete) — *recommended*
- **Just mark `low`** and let existing pattern-curation decide (least change)

Introducing `contradicted` gives readers (humans + engines) a clear signal without losing the artefact for audit.

### Q3. Should patterns track WHICH probes contributed?

Adding `probe_outcomes_referenced: [<probe_id>, ...]` to the pattern gives full audit, but this list grows unbounded.
- **Yes, full list** (max audit, max storage cost)
- **Yes, but cap at last N (e.g. 50)** (audit + bounded)
- **No, just counts** (cheapest, no audit)
- **Separate audit log** at `patterns/_outcomes/<pattern-slug>.jsonl` (decouples storage from pattern file) — *recommended*

Separate audit log keeps the pattern file clean while preserving full traceability.

### Q4. Probes without `cited_patterns` — drop, or attempt heuristic matching?

- **Drop** — count as "unattributed", exclude from feedback. Cleanest. *recommended*
- **Heuristic match** — search patterns by `sources[]`, `surfaced_in_systems[]`, or keyword overlap. Risky — guess wrong and you contaminate confidence scores.
- **Manual review queue** — write unattributed probes to a queue for Dylan to triage. Reliable, but adds manual work.

Drop is safest. Migration cost is bounded (one-time pool of unattributed legacy probes); going forward all probes should include `cited_patterns`.

## Implementation outline

Once Q1–Q4 are settled:

1. **Schema updates** to probe-outcome + pattern (markdown / JSON files — write-side change only, no DB migration)
2. **New code** in `coaching/engine/pattern-curator.js`:
   - `adjustConfidenceFromProbeOutcomes()` — the function above
   - `getActiveOutcomeWindow(pattern)` — returns `outcome_window_start`
3. **Call site:** existing `weekly-pattern-curation` calls this BEFORE the existing archive step (chained, not parallel — confidence must update before archive decisions)
4. **Migration script:** one-time pass that adds default fields to all existing patterns + probe-outcomes
5. **Tests:** at minimum:
   - Happy path: pattern goes from preliminary → high after 5 confirms
   - Contradiction path: pattern goes from high → low → contradicted after contradictions accumulate
   - Out-of-window exclusion: old outcomes don't influence current label
   - Unattributed probe: probe without `cited_patterns` is counted but doesn't influence any pattern

Estimate: 1–2 days code + 2 hours migration + tests.

## Compounds with other foundations

- **Provenance schema (Tier A.2):** `cited_supplement_ids` uses the schema's `source_id` format. Probe → pattern → supplement → source becomes traceable end-to-end.
- **Schema-drift detection (Tier A.3):** if a pattern relies on a HubSpot field that gets renamed, contradictions will spike. The system effectively self-detects drift as a side effect of feedback wiring.

## What this changes about the system

Before:
- Pattern confidence is a manual assertion at write time
- No mechanism corrects it when reality diverges
- Architecture diagram's FB → ENG arrow is fiction

After:
- Pattern confidence is empirically derived from outcomes
- Patterns that go wrong fade automatically; patterns that go right strengthen
- Architecture diagram's FB → ENG arrow becomes real (citation: `coaching/engine/pattern-curator.js#adjustConfidenceFromProbeOutcomes`)

## Related

- `memory/decisions/2026-05-21-supplement-provenance-schema.md` — prerequisite for `cited_supplement_ids`
- `memory/learnings/2026-05/2026-05-21-architecture-diagram-vs-reality-drift.md` — the finding that motivated this
- Data audit punch list item #4 — this design proposal implements it
