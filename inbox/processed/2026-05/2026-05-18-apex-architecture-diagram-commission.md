# Apex commission — Architecture diagram for the Stormboy Tracker system

**Date:** 2026-05-18
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex (one-shot, not scheduled)
**Status:** Awaiting Cowork pickup

## Goal

Produce a clear, refined schema diagram of the full Stormboy Tracker
system that will eventually live in the dashboard's HEALTH tab.

The point is **comprehension** — when Dylan, Kieren, Will, or anyone new
opens the HEALTH tab, they should be able to read this diagram and
understand:

1. Where data comes from (HubSpot, Confluence, Granola, Teams, Outlook)
2. How it gets processed (Apex daily-enrichment, dashboard server, bundles)
3. Where it lives (the shared bus on SharePoint)
4. Who reads it (dashboard UI, users' Claude apps, Cowork tasks)
5. How insights flow back into the bus (the learning loop)

## Starter draft

A Mermaid draft + narrative key is at:

```
shared-growth-memory/architecture/system-schema.md
```

Read that first. It's the seed — Cowork should refine, not start from
scratch.

## Source material to read for accuracy

Walk these in order. Each one is canonical for a slice of the architecture:

1. `CLAUDE.md` — the operating-system contract; behavioural defaults +
   directory map + integration list
2. `COWORK.md` — the symmetric Cowork-side contract
3. `shared-growth-memory/README.md` — bus contract
4. `shared-growth-memory/CLAUDE.md` — Claude session primer at bus root
5. `shared-growth-memory/schemas/*.md` — every schema (pattern, deal-signal,
   probe-outcome, customer-position, intelligence-bundle, feedback)
6. `shared-growth-memory/INTEGRATION-FOR-CLAUDIA.md` — Claudia's tool contract
7. `shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md` — Kieren's analysis contract
8. `stormboy-tracker/briefings/api-to-subscription-migration-plan.md` —
   the migration sequence from API → subscription bundles
9. `inbox/cowork/2026-05-15-system-enrichment-pipeline-commission.md` —
   what Apex's daily-enrichment writes
10. `inbox/cowork/2026-05-16-apex-bus-path-to-sharepoint-commission.md` —
    where Apex writes (SharePoint canonical)
11. `inbox/cowork/2026-05-17-apex-weekly-pattern-curation-commission.md`
12. `inbox/cowork/2026-05-17-apex-weekly-system-retro-commission.md`
13. `inbox/cowork/2026-05-18-apex-intelligence-bundles-commission.md`
14. `stormboy-tracker/server.js` — every `app.get/post(...)` is an API surface
15. `stormboy-tracker/coaching/engine/*.js` — file names indicate engine roles

## What to produce

Three artifacts, all landed in `shared-growth-memory/architecture/`:

### 1. Refined Mermaid source

Edit `shared-growth-memory/architecture/system-schema.md` in place. Keep
the file's narrative sections (description, refinement notes, key) but
replace the Mermaid block with a clean, accurate, comprehension-first
version. Constraints:

- **≤35 nodes** in the visible diagram (collapse subdetails if needed)
- **Clearly grouped** via subgraphs by concern (external / processing /
  bus / surfaces)
- **Arrows labelled** when the relationship isn't obvious from context
- **Subscription compute** clearly distinguished from API/HTTP calls
  (e.g. different arrow style or colour)
- **The feedback loop** visible — show how user-generated content
  (feedback, patterns from Kieren/Claudia) flows back into the bus
  and influences the next coaching run

### 2. Rendered SVG

Generate `shared-growth-memory/architecture/system-schema.svg`. Options:

- **Preferred:** use the Figma MCP `generate_diagram` tool. Layout
  optimised for an A4-aspect viewport in the HEALTH tab.
- **Fallback:** render the Mermaid via the Mermaid Live API or any
  equivalent SVG generator, then save.

The SVG should be ≤200KB (it'll be inlined into the dashboard page).

### 3. Narrative key (≤300 words)

Inside `shared-growth-memory/architecture/system-schema.md`, replace the
"What this diagram shows" section with a tightened version aimed at a
non-technical reader (think Steve from finance, or a new hire). Three
short paragraphs:

- **Data flow** in 2-3 sentences
- **Compute model** (subscription not API) in 2-3 sentences
- **Feedback loop** in 2-3 sentences

## Accuracy checks before publishing

Before saving the refined version, verify:

- [ ] The bus path is named "Shared Growth Memory" (not "shared-growth-memory")
      consistently in user-facing labels — the technical folder name is
      the lowercase form
- [ ] All five external systems shown (HubSpot, Confluence, Granola,
      Teams, Outlook)
- [ ] The `claude://cowork/new` deep-link launch from dashboard ASK +
      bundle modal is depicted (it's the user-facing new pattern)
- [ ] No `ANTHROPIC_API_KEY` direct-API path shown as a primary route —
      it's deprecated; if shown at all, mark as legacy/fallback
- [ ] The 4 producer surfaces (Apex, dashboard, Claudia's tool, users'
      Claude) all visible
- [ ] At least one arrow shows the "insights from users back into the bus"
      loop (e.g. Kieren writes pattern → next dashboard coaching run reads)

## What to NOT include

- File-level detail inside each bus subfolder (the schemas already
  describe per-file shape)
- Local git repository (it's an archive, not load-bearing for daily ops)
- Specific scheduled-task cron expressions (those live in Cowork config)
- The persona registry, deprecated paths, line numbers in source files

## Acceptance criteria

- [ ] `shared-growth-memory/architecture/system-schema.md` updated with
      refined Mermaid + tightened narrative
- [ ] `shared-growth-memory/architecture/system-schema.svg` exists,
      renders cleanly, ≤200KB
- [ ] All accuracy checks above pass
- [ ] Append a line to `apex-runs.log`:
      `2026-05-18Txx:xx:xxZ · architecture-diagram · refined=1 svg_bytes=N`

## Reply with

Confirmation of the refined diagram + a one-paragraph note on anything in
the system architecture you found that the starter draft missed or got
wrong. That feedback informs the next iteration.
