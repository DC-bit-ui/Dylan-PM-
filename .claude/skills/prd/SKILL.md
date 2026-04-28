---
name: prd
description: Draft a product requirements document (PRD) using Dylan's preferred structure. Use when Dylan says "draft a PRD", "PRD for X", or needs a build-ready spec. Pulls voice from memory/profile/communication.md and grounds in memory/business/strategy.md.
---

# PRD Skill

Draft PRDs aligned to **AgriProve's canonical Confluence template**, not a local copy.

## Where the canonical template lives
- Confluence: **AgriProve Platform** → **Product Requirements** → **Create new PRD**
- Direct: <https://agriprove.atlassian.net/wiki/spaces/SCRUM/folder/367656961>
- In Cowork: the `agriprove-pm` skill has live access — prefer that when in Cowork.

This skill drafts the **content** that will then be pasted into a fresh Confluence PRD page (or that Cowork's `agriprove-pm` will render against the live template).

## Workflow

1. **Pull the live template structure first** — via the Confluence MCP if available (`mcp__confluence__*`, search the SCRUM space for the template page). If not available, ask Dylan to paste the current section list, or fall back to a generic PM PRD shape and flag staleness.
2. **Confirm scope** in one short question only if ambiguous. Otherwise, draft.
3. **Read context:**
   - `memory/profile/communication.md` — voice
   - `memory/business/strategy.md` and `memory/business/customers.md` — grounding
   - The relevant `memory/initiatives/<initiative>.md` if any
4. **Draft v1 in full.** Do not interview Dylan section-by-section. Use `[ASSUMPTION]` markers liberally.
5. **Quality bar:**
   - One-sentence TL;DR
   - Named target user with citation to `memory/business/customers.md`
   - Success metric is a number with a target value
   - Out-of-scope section is non-empty
   - Open questions named, with who needs to answer
6. **Save the working draft to** `memory/deliverables/prds/YYYY-MM-DD-<slug>.md` and update `memory/deliverables/INDEX.md`. State explicitly that this is a working draft — the canonical version goes into Confluence.
7. **After drafting**, hand off to `critic` for a pressure test (in parallel with showing Dylan the draft).
8. **When Dylan approves**, remind him to paste into a Confluence PRD page so the canonical template wraps it.

## Common moves

- For numbers in the PRD, dispatch `data-analyst` to validate.
- If this PRD requires a new metric, also update `memory/business/metrics.md`.
- Once approved, propose a kickoff doc using the `kickoff` template.
