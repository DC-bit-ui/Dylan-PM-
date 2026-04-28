# LawrieCo Referrer View

**Jira key:** [AP-1965](https://agriprove.atlassian.net/browse/AP-1965)
**Status:** development [from Jira snapshot 2026-04-28]
**Stage:** build
**DRI:** Steve Le Moenic (assignee)
**Last updated:** 2026-04-28

## Why it exists
LawrieCo is an AgriProve referrer / partner. They need a dedicated **referrer view** — partner-facing UI for tracking referred properties / progress in the AgriProve onboarding pipeline.

## Success metric
_(to fill — proposed: referrer-self-serve task volume; LawrieCo NPS; reduction in inbound "where's my referral" queries)_

## Current state
- Steve Le Moenic owns implementation
- Development phase

## Recent changes (newest first)
- 2026-04-28 — Initiative file created from Cowork handoff snapshot

## Risks
- Partner-facing — UX failures damage referrer relationship

## Dependencies
- Frontier (likely consumes property data)
- Auth scoping (Supabase) — LawrieCo users see only their referrals
- HubSpot — referrer / deal data

## Open questions
- Is this a one-off for LawrieCo or the start of a generic "partner referrer view" pattern?
- What's LawrieCo's commitment / urgency?

## Linked artifacts
- Jira epic: AP-1965
- _(Partner agreement / scope doc — to confirm)_
