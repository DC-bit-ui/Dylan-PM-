# Shared Growth Memory Bus

**Established:** 2026-05-11
**Owner:** No single owner. Read + write substrate shared across AgriProve growth-domain Claude Code systems.
**Principle:** Systems do not live in isolation. Patterns propagate.

## What is this?

A filesystem-backed shared memory layer that two (and potentially more) growth-domain Claude systems read from and write to:

1. **Stormboy Conversion Tracker dashboard** — observes pipeline, coaches deals, distills team intel. Lives at `C:\Dylan PM\stormboy-tracker\`.
2. **Claudia's Storm Boy Claude Tool** — handles call admin, lead research, sales rep workflow. Lives in SharePoint under `Claude Code Projects/Storm Boy Claude Tool/`.

Both systems read state from here before acting. Both write learnings + signals back. Same data, two execution surfaces. The rep gets coherent guidance whether they're looking at the dashboard or working in Claudia's tool.

For the architectural reasoning, see [`stormboy-tracker/coaching/shared-learning-bus.md`](../stormboy-tracker/coaching/shared-learning-bus.md).

## Critical principle — two sales motions, NOT merged

The bus serves TWO distinct sales motions. Anyone integrating with it MUST read [`sales-motion-separation.md`](sales-motion-separation.md) first.

- **Motion 1 — Storm Boy outreach** (Claudia's `get-leads/`, primary): cold-call to scraped leads, targeting Hobbs-on-farm visits. KPIs: call volume, farm visits booked.
- **Motion 2 — Engaged Pipeline Follow-up** (dashboard's Plays tab, secondary): targeted re-engagement of pipeline deals using accumulated learnings. KPIs: deals re-engaged, probes resolved, stuck deals cleared.

The bus is what makes the **handoff** between motions coherent — not what merges them. If you find yourself folding `deal-signals/` into a Storm Boy call list, stop. That's a category error.

## Layout

```
shared-growth-memory/
  README.md                    — this file
  INDEX.md                     — content index, updated on every write
  INTEGRATION-FOR-CLAUDIA.md   — how Claudia's tool plugs in
  schemas/                     — JSON shape contracts
    pattern.md
    probe-outcome.md
    deal-signal.md
    customer-position.md
  patterns/                    — durable, attributed learnings
    YYYY-MM-DD-<slug>.md       — same shape as stormboy-tracker/coaching/learnings/
  probe-outcomes/              — closed-loop outcomes from probes the system suggested
    probe-<probe_id>.json
  deal-signals/                — current multi-signal state per active deal
    deal-<deal_id>.json        — overwritten each pipeline run
  customer-positions/          — verbatim or distilled customer voice, indexed by contact
    contact-<contact_id>.json
```

## Read / write rules

- **Write atomicity:** writes go to `<file>.tmp` then rename. No partially-written files visible to readers.
- **Append-only for patterns:** never delete a pattern; supersede via front-matter (`supersedes: <old-slug>`, `superseded_by: <new-slug>`).
- **Overwrite for deal-signals + customer-positions:** these reflect current state. Each pipeline run overwrites the relevant file.
- **Probe-outcomes: append-only:** every probe sent gets its own file; outcome detection updates the file in place via JSON merge.
- **No deletes:** ever. Stale = mark stale, keep file.

## Who writes what

| Record type | Stormboy Conversion Tracker (dashboard) | Claudia's Storm Boy Claude Tool |
|---|---|---|
| `patterns/` | Auto-writes when coaching pipeline identifies a high-confidence pattern | Writes via `log-idea.md` + Monday `/improve` synthesis |
| `probe-outcomes/` | Creates record when probe is suggested + sent; updates outcome via HubSpot engagement polling | Updates outcome based on rep's call-admin notes (rep heard back during a call) |
| `deal-signals/` | Auto-writes on every live coaching run (one file per active deal) | Reads only |
| `customer-positions/` | Auto-writes from Pass 0 distillates of farm-visit transcripts | Auto-writes from call-admin distillation after each customer call |

## Conflict resolution

Last-write-wins for `deal-signals/` and `customer-positions/` (latest observation is the truth).

For `patterns/`: never collide because each pattern gets its own dated file. If two systems write what looks like the same pattern: both files coexist with cross-references via front-matter (`also_observed_by: <other-system-slug>`).

For `probe-outcomes/`: each probe has a unique `probe_id` assigned at creation; updates merge into the existing file by ID.

## State of seeding (2026-05-11)

- `patterns/` — 4 learnings copied from dashboard's `coaching/learnings/2026-05/`
- `deal-signals/` — written for the 1 deal with multi-signal data (Daisy Bank). Other active deals will land on the next live coaching run.
- `customer-positions/` — 1 derived from the Hobbs farm-visit distillate
- `probe-outcomes/` — empty (no probes sent yet; first one fires when the dashboard's enablement is used)
