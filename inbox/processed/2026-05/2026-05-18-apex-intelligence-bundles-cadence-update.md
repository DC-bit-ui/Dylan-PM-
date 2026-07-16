# Apex commission — Intelligence-bundle cadence update (supersedence)

**Date:** 2026-05-18 (later same day)
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Awaiting Apex pickup
**Supersedes:** [2026-05-18 intelligence-bundles commission](2026-05-18-apex-intelligence-bundles-commission.md) — only the cron schedule + per-run budget are updated. The processing logic, failure handling, atomic-write rules, and bundle file conventions from the prior commission **all stand unchanged**.

## What's changing and why

Original cadence was every 2 hours on weekdays (`0 */2 * * 1-5`). Reflection: 12 runs/day is overkill for a system where the average bundle is batch-pipeline work (no genuine sub-2h latency requirement) and the worst-case (someone fires a persona-refresh-all = 5 × ~24K-token bundles, or a 20-deal batch diagnose) can chew through subscription budget faster than expected.

Two runs/day is enough for normal operations, with a manual user trigger from the dashboard for the rare "I need this now" case.

The two slots are also re-anchored to the **AEST team's workday** (since they're the operators), not Dylan's SAST timezone.

## New cadence

Replace the previous cron with **two** scheduled tasks:

| Slot | AEST | SAST | Cron (server-local) | Rationale |
|---|---|---|---|---|
| Morning drain | **08:30** | 00:30 | `30 0 * * 1-5` if server is SAST · or `30 8 * * 1-5` if server is AEST | Drains overnight + prior-day queue. Fresh results ready when reps start 9 AM call work and read their queue files |
| Afternoon drain | **14:00** | 06:00 | `0 6 * * 1-5` if server is SAST · or `0 14 * * 1-5` if server is AEST | Runs right after `daily-enrichment-pipeline` finishes (~13:30 AEST). Catches any bundles that enrichment triggered. Drains before Storm Boy standup at 15:30 AEST |

(If Cowork's scheduler runs in UTC, the cron is `30 22 * * SUN-THU` and `0 4 * * 1-5`. Adjust to whichever clock the scheduler uses; the AEST anchors are 08:30 and 14:00.)

## Per-run budget

Original: process up to 10 bundles per run, stop.
**New: process up to 20 bundles per run.** Fewer runs need a bigger drain so the queue doesn't accumulate across cycles.

If the queue is deeper than 20 at the end of a run, the next scheduled run picks up the rest. The manual UI trigger (below) is the user's "drain it now" override.

## Manual trigger from the dashboard

The dashboard's HEALTH tab Intelligence-Queue widget now has a "↻ Process queue now" button. Click → fires `claude://cowork/new` with a prompt asking Apex to drain the queue immediately (under whichever Cowork session the user opens it in). This serves the rare "I need fresh insights before this meeting / standup" case.

Apex's scheduled runs and the manual trigger use the **same processing logic** — same claim flow, same atomic writes, same `apex-runs.log` append. The only difference is when they fire.

## What stays the same (no action needed)

Re-confirming from the prior commission — no change to:

- Bundle file conventions (`<id>.md` + `<id>.json` in `intelligence-bundles/`; results in `intelligence-results/`)
- Claim-and-process state machine (`queued` → `claimed` → `completed` / `failed`)
- Stale-claim re-claim rule (>30 minutes since claim → eligible for re-claim)
- Failure logging (mark `status: failed`, append `failed=<id>` to apex-runs.log)
- `apex-runs.log` summary line shape

## Acceptance criteria

After the next scheduled run under the new config:

- [ ] `apex-runs.log` shows the run hit during the new time slots (08:30 AEST or 14:00 AEST), not the old 2h interval
- [ ] Each run line shows `processed=<N>` where N ≤ 20
- [ ] No new entries land in `apex-runs.log` outside the two daily slots (modulo manual-trigger entries, which the prompt makes clear)

## Reply with

Confirmation the schedule has been updated + the next two scheduled fire times in UTC so we can verify they land at 08:30 / 14:00 AEST.
