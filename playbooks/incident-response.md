# Playbook: Something went wrong

> When a metric tanks, a customer escalates, a launch regrets, or production breaks.

## Triage (first 30 min)

1. **Confirm the signal is real.** `data-analyst` on the metric — is this a definition glitch, a known seasonality, or a real move?
2. **Bound the impact.** Who's affected, how many, since when, how bad.
3. **Decide IC.** Who is the incident commander for the response? (Often Dylan, sometimes engineering.)
4. **Open a thread.** A single Slack channel or doc, named with the date and a slug.

## Response

5. **Communicate up early.** Even a short heads-up to leadership beats them finding out from someone else. Use `stakeholder-comms`.
6. **Stabilise.** What's the smallest action that stops further harm? Take it.
7. **Investigate.** Layered: data first, code/config second, customer reports third. Document hypotheses.
8. **Fix.** Once root cause is reasonably known, ship the fix or the workaround.

## After

9. **Customer comms** if customer-facing.
10. **Incident retro** within 48 hours — `retrospector`, scope = incident.
11. **Capture decisions** — the call to roll back, to communicate, to wait — all `/decision` material.
12. **Update affected memory** — if the metric was misdefined, update `metrics.md`. If a stakeholder was surprising, update `roster.md`. If a process gap caused the issue, update the relevant playbook.

## Anti-patterns

- Don't communicate before bounding. Premature comms cause panic.
- Don't skip the retro because "we already know what happened".
- Don't blame people. Blame mechanisms.
