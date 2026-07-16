# Apex commission — Weekly system retro

**Date:** 2026-05-17
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Awaiting Apex pickup
**Cadence:** Weekly · Friday 16:45 SAST (00:45 Saturday AEST) · cron `45 16 * * 5`
**Related:** [2026-05-17 pattern curation commission](2026-05-17-apex-weekly-pattern-curation-commission.md) — runs 15 minutes earlier; the retro reads the post-curation state.

## Why

A weekly system retro answers "is the system itself learning?". Five signals — Apex enrichment volume, patterns added/promoted, probe loop activity, heuristic drift, notable observations. It surfaces in Friday standup so the team sees the system's growth alongside their own.

Without this, the system grows silently and nobody notices when it stops growing.

## What to run

Apex hits the dashboard's endpoint (POST with write enabled):

```
POST http://localhost:3401/api/system/retro?write=1
```

The endpoint synthesises the last 7 days, writes markdown to:
```
<bus>/system-retros/<YYYY-Wnn>.md
```

Idempotent — re-running on the same ISO week overwrites the file with the latest snapshot, so a mid-week trigger followed by an end-of-week trigger results in just one final summary, not two.

## What it includes

Five sections in the output markdown:

1. **Apex enrichment volume** — supplement files written this week, by source (aircall, outlook, teams, granola, farmvisit, hubspot_snapshot) and by entity type (contact, deal, persona)
2. **Patterns added or promoted** — new patterns this week, plus existing patterns whose confidence changed
3. **Probe loop** — created, closed, still-open, outcome mix
4. **Notable** — heuristic observations (hot weeks, dormant weeks, backlog warnings)
5. **Generation metadata** — bus path, timestamp

Each section includes a `> ⚠` warning line when a signal stalls, so the dormant pattern is obvious in standup.

## What to log

Append to `<bus>/apex-runs.log`:
```
2026-05-17T16:45:00Z · system-retro · period=2026-W20 supplements=1663 patterns_new=0 probes_created=0 file=system-retros/2026-W20.md
```

## What to surface in standup

The Friday EOD reconciliation morning briefing (next business day) should call out the retro file's path and lift the headline numbers into Dylan's brief:
- Supplement volume vs. last week (trending up / flat / down)
- New patterns count
- Probe loop activity (created vs. closed)
- Any `⚠` warnings the retro included

## Failure modes

- **Bus unreachable** — halt, log to `inbox/cowork/<date>-apex-retro-bus-missing.md`, skip this week. Same convention as other commissions.
- **Dashboard endpoint unreachable** — fall back to calling the node module directly: `node -e "console.log(JSON.stringify(require('./stormboy-tracker/coaching/engine/system-retro').generate({write:true}), null, 2))"`
- **Empty week** — still write the file. A "this week the system did nothing" retro is the most important one to surface, because it means investigation is needed.

## Acceptance criteria

After the first Friday run:
- [ ] `<bus>/system-retros/2026-W20.md` exists (or whatever ISO week the run lands in)
- [ ] `apex-runs.log` has a `system-retro` line for today
- [ ] The retro file's markdown is well-formed (renders cleanly when previewed in Confluence or VS Code)
- [ ] Dashboard endpoint `GET /api/system/retro` returns the same content (sanity check that the file matches what was generated)
- [ ] The next morning briefing references the retro path

## Reply with

Confirmation the weekly cron is scheduled + the first retro file's path so Dylan can review the format. If the markdown structure needs adjustment, edit `coaching/engine/system-retro.js`'s `renderMarkdown()` function rather than diverging in Apex.
