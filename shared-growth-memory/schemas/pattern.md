# Schema — `patterns/`

Durable learnings about what works (or doesn't) in the growth motion. Markdown file with YAML front-matter.

Format mirrors `stormboy-tracker/coaching/learnings/` so files are portable between local memory and the shared bus.

## File location
```
patterns/YYYY-MM-DD-<slug>.md
```

## Front-matter

```yaml
---
title: <short title — describe the pattern in one sentence>
category: tactical_play | tactical_framing | strategic_finding
confidence: high | moderate | low
written_at: <ISO8601>
sources:
  - <source identifier — e.g. "claudia_storm_boy_tool/standup_transcript_2026-04-24">
  - <one entry per source — anything that contributed evidence>
evidence:
  - <specific reference — deal IDs, transcript IDs, distillate IDs>
applicability:
  - <where in the funnel / which deal pattern this applies to>
surfaced_in_systems:
  - dashboard_coaching          # the dashboard's pipeline wrote this
  - claudia_storm_boy_tool      # Claudia's tool also confirmed
also_observed_by:               # optional — if another system also produced a similar pattern
  - <slug of related pattern file>
supersedes: <previous-slug>     # only if this revises an earlier pattern
superseded_by: <newer-slug>     # appended later if this is itself revised
last_validated: <ISO8601>       # bumped when something explicitly re-confirms it
---
```

## Body

3–6 paragraphs of markdown. Structure:
1. **Pattern** — what the recurring thing is
2. **Evidence** — sources, deal IDs, transcript IDs
3. **How to apply** — when to use this pattern
4. **What we don't yet know** — gaps + open questions

## When to write

- Cross-system confirmation: same pattern observed by both systems independently → confidence: high
- Single-system observation, ≥3 supporting cases → confidence: moderate
- Hypothesis: single observation, awaits confirmation → confidence: low

## When to update

- When a new system confirms the pattern → append to `surfaced_in_systems`, bump `last_validated`
- When evidence accumulates → append to `evidence`, bump `last_validated`
- When the pattern is invalidated → write a new pattern file with `supersedes: <this-slug>`, then update this file with `superseded_by`

## Reading rules

- A pattern with `superseded_by` set should be treated as historical context, not active guidance
- A pattern with `confidence: low` should be presented as hypothesis, not authoritative
- Patterns older than 90 days without a `last_validated` bump should be flagged for review
