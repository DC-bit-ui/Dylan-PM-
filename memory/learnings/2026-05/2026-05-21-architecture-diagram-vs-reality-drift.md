---
date: 2026-05-21
source: 2026-05-21 data architecture audit (researcher subagent)
tags: [architecture, documentation, drift, system-schema]
severity: process-issue
---

# Architecture diagrams must cite the code that implements them

## The trap

`shared-growth-memory/architecture/system-schema.md` contains the line `FB -.-> ENG` in its mermaid diagram — showing a feedback loop from the `feedback/` directory back to the coaching engines. The 2026-05-21 data audit traced the actual code:

- `feedback/` files are **written** to (by dashboard error reports + manual additions)
- `feedback/` files are **counted** by the HEALTH tab and weekly retro
- **No coaching engine reads `feedback/` before generating recommendations.** Pattern confidence is set at write time; nothing adjusts it from outcomes.

The arrow on the diagram is aspirational, not real. A reader of `system-schema.md` would reasonably conclude the system learns from feedback. It doesn't.

## Why this matters

Architecture diagrams establish *expectations* — about what the system does, what to trust, where to add features, what to debug when something breaks. When the diagram diverges from the code, three things go wrong:

1. **Investment misdirection.** A future engineer treating the diagram as truth would build features that depend on the feedback loop — and those features would silently no-op.
2. **Trust degradation when discovered.** Once you find one fictional arrow, you stop trusting any of them. You re-derive from code every time. The diagram's value goes negative.
3. **Repeated rediscovery cost.** The audit cost ~4 hours of researcher work to surface this. If the diagram had cited code, the gap would have been visible at write time.

This isn't unique to system-schema.md. Any diagram, schema doc, or design spec in `memory/` can drift from reality. The mechanism that catches it is whatever lets a reader instantly verify the claim against code.

## Standing rule (now in CLAUDE.md)

> Any architecture-diagram claim, schema declaration, or pipeline description in `memory/`, `.claude/skills/`, or `shared-growth-memory/architecture/` MUST cite the file (and line range where reasonable) that implements it. Claims without citations are flagged as `[ASPIRATIONAL]` or `[TODO]` so readers know not to depend on them.

Example reformulation of the FB -.-> ENG arrow:

```
FB -.->[ASPIRATIONAL — no consumer reads feedback/ today; see audit 2026-05-21] ENG
```

Or, once the loop is wired (audit item #4):

```
FB --> ENG  // implements: coaching/engine/pattern-curator.js#adjustConfidenceFromProbeOutcomes
```

## How to apply going forward

When writing or reviewing an architecture document:

1. **Every box** = a real directory or service. If not, mark `[FUTURE]`.
2. **Every arrow** = a function call, file read, or message send. Cite it.
3. **Every metric** = a real query or calculation. Cite the file.
4. **`[ASPIRATIONAL]` / `[TODO]` / `[BLOCKED]`** are the three sanctioned ways to keep aspirational content in a diagram without lying.

When reading an architecture document:
- Don't trust any uncited claim. Verify against code or treat as `[ASPIRATIONAL]` until proven.

## Related

- `memory/decisions/2026-05-21-supplement-provenance-schema.md` — companion decision that operationalises traceability in the data layer
- Audit punch list item #4 (feedback loop wiring) — what would *actually* close the FB -.-> ENG arrow
- `CLAUDE.md` §17 (new) — the standing rule
