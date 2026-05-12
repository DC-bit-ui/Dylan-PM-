# Coaching system memory

This is the **dashboard's own memory layer** — separate from Dylan's personal PM memory at `C:\Dylan PM\memory\` and from Claudia's Storm Boy Claude Tool memory.

Growth-domain insights live here. They don't flow into Dylan's PM memory (which would convolute the cross-product strategy/decisions layer) and they don't write into Claudia's tool (governance: only Claudia changes files there).

## Layout

```
coaching/learnings/
  README.md                 — this file
  INDEX.md                  — chronological index, kept current
  2026-05/                  — dated folders; one entry per learning
    YYYY-MM-DD-<slug>.md    — single learning, append-only
    ...
  2026-06/
  ...
```

## Conventions (mirrors Claudia's tool + Dylan's CLAUDE.md §10 routing patterns)

1. **Auto-write on emergence.** When the coaching pipeline identifies a high-confidence pattern, it writes a learning file immediately. No approval gate. Dylan's role is to read what the system has surfaced, not to gate-keep it.

2. **Append, don't overwrite.** If a later run produces a contradicting learning, write a new file with `supersedes: <old-slug>` in the front-matter, and add `superseded_by: <new-slug>` to the old file. Never delete.

3. **Cite sources every time.** Every learning records where it came from — Pass 0 distillate IDs, standup transcripts, MCP inspections, farm-visit transcript IDs. Trust attaches to the source, not the derivation.

4. **PII-generalised.** Never write customer names, exact figures, or property names into a learning file. Use the same generalisation rules as Pass 0.

5. **Three categories:**
   - `tactical_play` — a rep can do this next week (e.g., nurture re-engagement with HORIZON Snapshot)
   - `tactical_framing` — a verbatim turn of phrase that converts (e.g., Hobbs's "25% is what stops you carrying methodology liability")
   - `strategic_finding` — a structural insight about the funnel/pipeline (e.g., LawrieCo channel performance)

## Front-matter schema

```yaml
---
title: <short title>
category: tactical_play | tactical_framing | strategic_finding
confidence: high | moderate | low
written_at: ISO8601
sources:
  - <source slug, e.g. claudia_storm_boy_tool/farm-visits>
  - <e.g. standup_transcript_2026-04-24>
evidence:
  - <specific reference; deal IDs, transcript IDs, distillate IDs>
applicability: <where in the funnel / which deal pattern this applies to>
supersedes: <previous-slug>     # only if this revises an earlier learning
superseded_by: <newer-slug>     # appended later if this is itself revised
---
```

Body: 3–6 paragraphs. What the pattern is, the evidence, how to apply, what we don't yet know.

## How prompts consume these

A1 / A2 / B1 prompts load recent learnings (last 90 days, [high]/[moderate] confidence) at job time as additional input context. The model is instructed to weight learnings as authoritative even if structured data is thin — the team's first-hand evidence + repeated pattern observation outranks coarse enum signals.

This creates the learning loop: distillates → patterns → learnings → next run's prompts. Each run gets smarter.

## Compatibility with Claudia's tool

The format here intentionally mirrors patterns observed in Claudia's `cross-project-shared/self-improvement/` flow (Friday weekly logs, Monday `/improve` reviews). If we ever consolidate the two systems, conversion is mechanical. Until then: separate ownership, shared conventions.
