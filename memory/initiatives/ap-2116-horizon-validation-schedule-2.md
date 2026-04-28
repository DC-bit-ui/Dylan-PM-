# HORIZON Model Validation Framework — first Schedule 2 run

**Jira key:** [AP-2116](https://agriprove.atlassian.net/browse/AP-2116)
**Status:** development [from Jira snapshot 2026-04-28]
**Stage:** build
**DRI:** Cadel Watson (assignee — engineering-led)
**PM:** Dylan Cronje (PRD support, requirements)
**Last updated:** 2026-04-28

## Why it exists
HORIZON's regulatory readiness depends on a validation framework that can stand up to **Schedule 2** scrutiny under the ACCU scheme. First Schedule 2 run is a regulatory milestone for AgriProve.

## Success metric
**Primary:** successful first Schedule 2 model validation run.
_(to fill — quantitative: e.g., validation suite pass rate, audit-ready outputs)_

## Current state
- Engineering-led (Cadel); Dylan in PRD / requirements support role
- HORIZON backend on Python Temporal; validation framework lives in that ecosystem

## Recent changes (newest first)
- 2026-04-28 — Initiative file created from Cowork handoff snapshot

## Risks
- Regulatory: any framework gap could delay or invalidate Schedule 2 run — high impact
- Dependency on Cadel's bandwidth (also dev lead across team)

## Dependencies
- HORIZON model (Cadel)
- ERF / Schedule 2 regulatory documentation
- _(possibly AP-2187 — T1 Offsets Report — for downstream output schemas)_

## Open questions
- What does "validation framework" cover — unit/integration tests for the model? Audit-ready output schemas? Regulator-facing reports?
- Target date for first Schedule 2 run?
- What's currently blocking?

## Linked artifacts
- Jira epic: AP-2116
- _(Validation framework spec — to confirm in Confluence)_
- Related: AP-2187 (Crediting Workflow Template — T1 Offsets Report)
