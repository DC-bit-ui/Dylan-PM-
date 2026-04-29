# Decision: Delete the `daily-briefing` Cowork flow; keep Morning + EOD as the canonical pair

**Date:** 2026-04-29
**Status:** accepted
**Owner:** Dylan
**Type:** ADR (operational)

---

## Context

Three scheduled flows existed in Cowork:

1. `apex-morning-briefing` — heavy prescriptive prompt, runs at 04:45 SAST (intended).
2. `apex-eod-reconciliation` — heavy prescriptive prompt, runs at 17:30 SAST (intended).
3. `daily-briefing` — instructions field set to "TBD", schedule at 12:53.

The 2026-04-29 handoff working hypothesis was: *deprecate Morning + EOD, lean into Daily Briefing as primary*. Investigation falsified that hypothesis (see [`2026-04-29-heavy-prescription-over-light-prompt.md`](2026-04-29-heavy-prescription-over-light-prompt.md)). Daily Briefing produces zero durable writes and misses every Apex-specific behaviour.

Keeping all three flows would mean:
- A scheduled run (Daily Briefing) that produces a markdown digest no one durably consumes.
- Three timezone-sensitive crons to maintain instead of two.
- Ambient cognitive cost: every "should I check the briefing?" decision now ambiguates which one.

## Decision

**Delete the `daily-briefing` flow from Cowork.** Morning Briefing (04:45 SAST) + EOD Reconciliation (17:30 SAST) is the canonical pair.

Execution: Dylan deletes the task in the Cowork UI directly. No further trace required — the falsified-hypothesis learning and this ADR are sufficient record.

## Consequences

**Positive:**
- One fewer ambient flow to mentally reconcile with.
- Removes a degenerate sample (the "TBD" output) that will otherwise keep being used as evidence for spurious "light prompt" arguments in future sessions.
- Simplifies the cron-timezone fix: only Morning + EOD need correction.

**Negative / costs:**
- If a future use-case warrants a midday flow (e.g. lunch-time triage of overnight team output, or a pre-meeting prep snapshot), it'll need to be re-created — but with a real prescription, not a TBD.

## Alternatives considered

1. **Keep `daily-briefing`, write proper instructions for it** — rejected. We'd be designing a flow we don't currently have a use for, just because the slot exists. Better to delete now and add back if real demand surfaces.
2. **Repurpose `daily-briefing` as a midday `/focus` runner** — rejected for now. `/focus` is on-demand by design (skill in this repo). Auto-running it at a fixed midday slot conflicts with the on-demand model and risks polluting Notion with redundant Proposed entries.

## Related

- [`2026-04-29-heavy-prescription-over-light-prompt.md`](2026-04-29-heavy-prescription-over-light-prompt.md)
- [`../learnings/2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md`](../learnings/2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md)
- Degenerate sample preserved at: [`../../inbox/cowork/2026-04-29-daily-briefing-sample.md`](../../inbox/cowork/2026-04-29-daily-briefing-sample.md) (do not delete — evidence trail)
