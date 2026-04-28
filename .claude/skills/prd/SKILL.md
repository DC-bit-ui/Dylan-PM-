---
name: prd
description: Draft a product requirements document (PRD) using Dylan's preferred structure. Use when Dylan says "draft a PRD", "PRD for X", or needs a build-ready spec. Pulls voice from memory/profile/communication.md and grounds in memory/business/strategy.md.
---

# PRD Skill

Produce a PRD using `templates/prd.md` as the structure.

## Workflow

1. **Confirm the scope** in one short question if it's ambiguous. Otherwise, draft.
2. **Read context:**
   - `templates/prd.md` — the structure
   - `memory/profile/communication.md` — voice
   - `memory/business/strategy.md` and `memory/business/customers.md` — grounding
   - The relevant `memory/initiatives/<initiative>.md` if any
3. **Draft v1 in full.** Do not interview Dylan section-by-section. Use `[ASSUMPTION]` markers liberally — that's what they're for.
4. **Quality bar:**
   - One-sentence TL;DR
   - Named target user with citation to `memory/business/customers.md`
   - Success metric is a number with a target value
   - Out-of-scope section is non-empty
   - Open questions named, with who needs to answer
5. **Save to** `memory/deliverables/prds/YYYY-MM-DD-<slug>.md` and update `memory/deliverables/INDEX.md`.
6. **After drafting**, hand off to `critic` for a pressure test (in parallel with showing Dylan the draft).

## Common moves

- For numbers in the PRD, dispatch `data-analyst` to validate.
- If this PRD requires a new metric, also update `memory/business/metrics.md`.
- Once approved, propose a kickoff doc using the `kickoff` template.
