# External Skill Packs (live in Cowork)

> Dylan has skill packs already implemented in **Cowork** that capture operating procedures and product context. This Claude Code repo **references** them rather than copying — single source of truth.

**Last updated:** 2026-04-28 (corrected from cowork handoff)

---

## Active skills

| Skill | Purpose | Where it lives |
|---|---|---|
| `agriprove-pm` | PM workflow, PRD templates, Jira epic conventions | Cowork |
| `agriprove-backend` | Domain model, system architecture, technical feasibility | Cowork |
| `agriprove-design` | Design system tokens, Magic Patterns prompting, Chakra UI | Cowork |
| `soil-carbon-audit` | ERF project audit automation | Cowork |
| `soil-carbon-batch-audit` | Batch audit across portfolio | Cowork |
| `internal-comms` | Status reports, leadership updates | Cowork |

> **Correction note:** earlier scaffold used `agriprove-design-system` — actual name is `agriprove-design`.

---

## How agents in this Claude Code repo should reference them

Cowork's skills don't load automatically into this Claude Code session. When relevant, agents in this repo should:

1. **Acknowledge precedence.** "Agriprove-specific procedures live in `agriprove-pm` (Cowork). Dylan should run this in Cowork if he wants the procedure-bound version." 
2. **Default to general best practice with a flag.** "Drafting using general PM best practice; in Cowork, `agriprove-pm` would supply Agriprove-specific PRD template and epic conventions."
3. **Don't fabricate Agriprove-specific procedures** that aren't documented in this repo's `memory/`.

---

## When to invoke each (within Cowork)

- **`agriprove-pm`** — any time Dylan is making PM decisions for Agriprove products: PRD writing, prioritisation, exec materials, sprint planning. The `prd` and `decision-log` skills in this repo would benefit from Agriprove-specific template — that template lives in `agriprove-pm`.
- **`agriprove-backend`** — sizing engineering scope, understanding HORIZON / Frontier / system constraints, briefing backend changes.
- **`agriprove-design`** — UI/UX decisions, component reuse via Chakra, Magic Patterns prompting, design consistency questions.
- **`soil-carbon-audit`** — ERF project-level audit automation. Domain: regulatory.
- **`soil-carbon-batch-audit`** — portfolio-wide batch audit. Domain: regulatory.
- **`internal-comms`** — status reports, leadership updates. The `stakeholder-update` skill in this repo aligns with this; in Cowork, `internal-comms` likely supplies the Agriprove-specific tone / template.

---

## Open architectural question (push-back point)

There's overlap between Cowork skills and this Claude Code repo's skills:
- Cowork `internal-comms` ↔ this repo's `stakeholder-update` skill
- Cowork `agriprove-pm` (PRD templates, Jira conventions) ↔ this repo's `prd`, `decision-log`
- Cowork `soil-carbon-audit` is domain-specific (no analog here)

**Recommendation:** Cowork is for *live workflow execution* (writes to Notion, runs scheduled tasks, has the connectors). This Claude Code repo is for *strategic memory and reasoning* (durable artifacts, decisions, retros, business intelligence).

Where they overlap, Cowork wins for execution; this repo wins for memory. The **Agriprove-specific templates** (PRD, status update tones) probably belong in *both* — referenced from Cowork, with copies / links in `templates/` here for offline drafting.

> **Action item for Dylan:** decide whether to extract the Agriprove PRD template into `templates/prd.md` here, or keep `agriprove-pm` as the only source.

---

## Open questions
- Are skills in `~/.claude/skills/` (user-level) or somewhere else within Cowork?
- Are there Cowork skills we're not aware of?
- Is there an authoritative index of Cowork skills somewhere?
