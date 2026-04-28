# PRD Template — Reference Only

**Important:** AgriProve's canonical PRD template lives in **Confluence**, not here. This file is intentionally a pointer to keep this repo aligned with live documentation — if the team edits the template, we don't drift.

---

## How to start a new PRD

**In Confluence (preferred):**
1. Navigate: **AgriProve Platform** → **Product Requirements** → **Create new PRD**
2. Confluence applies the canonical template from the SCRUM space
3. Direct template folder: <https://agriprove.atlassian.net/wiki/spaces/SCRUM/folder/367656961>

**In Cowork:**
- The `agriprove-pm` skill drafts PRDs against the same canonical template. Use that skill when working in Cowork — it has live access and the latest template version.

**In this Claude Code repo (offline drafting):**
- Run the `/prd` skill — it will draft the structure and content based on `memory/profile/communication.md` (voice) and `memory/business/strategy.md` (grounding)
- Then **paste the draft into a fresh Confluence PRD page** so the canonical template wraps it
- Do **not** treat any local file in `templates/` or `memory/deliverables/` as the source of truth — Confluence wins

## Why reference-only

If we copy the template here, it forks. Edits in Confluence won't propagate. The system has to align to live documentation, not a snapshot.

## What this repo *does* hold for PRDs

- **Drafts in flight:** `memory/deliverables/prds/<initiative>-<slug>.md` — working drafts before they go to Confluence
- **Voice guide:** `memory/profile/communication.md` — how Dylan writes
- **Grounding:** `memory/business/strategy.md`, `memory/business/customers.md`, `memory/initiatives/<file>.md`
- **Decision references:** linked PRDs cite `memory/decisions/...`

## Logged: 2026-04-28
Decision to use reference-only mode rather than copying the template into this repo.
