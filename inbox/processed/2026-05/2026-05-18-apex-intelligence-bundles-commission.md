# Apex commission — Process intelligence bundles (subscription compute)

**Date:** 2026-05-18
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Awaiting Apex pickup — **highest priority** for this week.
**Cadence:** Every 2 hours on weekdays · cron `0 */2 * * 1-5`
**Driver:** Cadel directive in standup 2026-05-18 — Anthropic API key is shared across products, costs are unpredictable, AgriProve is cash-flow constrained. Move dashboard analytic synthesis from metered API to flat-fee Claude subscriptions.

## Why this commission matters

> *"Could we like get it to produce an output with all the information that we can paste into a Claude Code with a prompt so that it uses the subscription pricing for that? Like every two days intelligence run and then load the output back in or something? Like is there a way we can do it without using API?"*
> — Cadel, standup 2026-05-18

The dashboard's analytic flows (persona refresh, deal diagnosis, customer-themes clustering, brain Q&A) historically called `api.anthropic.com` directly. That spend is now unbudgeted and is hitting shared rate limits.

The new architecture: dashboard writes **intelligence bundles** to the bus instead of calling the API. Apex (running in Cowork under Dylan's subscription) processes them on schedule. Zero metered cost.

Schema and shape: `shared-growth-memory/schemas/intelligence-bundle.md`.

## What to run

Apex's processing logic, per scheduled run:

```
For each file in <bus>/intelligence-bundles/*.json:
  meta = read JSON
  if meta.status != 'queued' → skip
  if processing-budget exceeded for this run → stop, continue next run

  # Claim
  update meta to status='claimed', claimed_at=now, claimed_by='cowork:apex-process-intelligence-<run-id>'
  atomic write

  # Process
  read the corresponding <id>.md (the prompt + inputs)
  run analysis in Cowork (use whichever Claude model is appropriate for the
    purpose — small for cluster/diagnosis, larger for synthesis/ask)
  produce a result matching meta.output_schema

  # Write result
  write <bus>/intelligence-results/<id>.json with:
    { id, completed_at, completed_by: 'cowork:apex-process-intelligence', result }
  update meta to status='completed', completed_at=now, result_file=<path>
  atomic write both
```

Per-run budget: process up to **10 bundles** then stop. If the queue is deeper, the next 2-hour run picks up where this left off. Keeps any single run bounded.

## Failure handling

If a bundle's processing fails (parse error, model refusal, malformed inputs):
- Update meta to `status='failed', error='<short reason>', completed_at=now`
- Don't retry automatically — leave it for Dylan to inspect via the dashboard's HEALTH tab
- Log to `apex-runs.log` with `failed=<id>`

If a bundle has been `claimed` for > 30 minutes without becoming `completed`, treat as stale and re-claim. Avoids permanent zombie locks if a previous run crashed mid-process.

## Append to apex-runs.log

After each scheduled run:
```
2026-05-18T08:00:00Z · intelligence-bundles · scanned=N queued=M claimed=K completed=C failed=F
```

## Acceptance criteria

After the first scheduled run lands a bundle:
- [ ] At least one bundle has `status: completed` and its paired result file exists
- [ ] `apex-runs.log` has an `intelligence-bundles` entry
- [ ] Dashboard `GET /api/intelligence/bundles` shows the bundle in its new state
- [ ] No new `ANTHROPIC_API_KEY` usage from the dashboard (we keep the env var loaded as a fallback, but the dashboard's main flows shouldn't be calling out anymore once each migration lands)

## Out of scope (yet)

The dashboard's existing API call sites still exist; this commission just creates the substrate. Migrating each call site (persona-builder, customer-themes, ask, diagnose-active-deals, ai/analyze, win-patterns) is dashboard-side follow-up work. We'll migrate one or two per session.

## Bonus — interactive mode

When Dylan opens a Claude Code session (not Cowork) and wants to process the queue manually, the same file shape works. He can say:

> "Process the next queued intelligence bundle in `<bus path>/intelligence-bundles/`. Read the bundle .md, do the analysis, write the result, update meta to completed."

That runs under Dylan's Claude Code subscription — same cost (zero metered) — and immediately drains the queue without waiting for the next scheduled run. Useful when something is queued and the user is about to demo.

## Reply with

Confirmation the 2-hour cron is scheduled + a sample completion trace from the first run (the run-log line + a result file path) so Dylan can verify the loop end-to-end before migrating the first dashboard call site.
