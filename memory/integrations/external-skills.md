# External Skill Packs

> Dylan has skill packs already implemented elsewhere that capture operating procedures and product context. This system **references** them rather than copying them — single source of truth.

**Last updated:** 2026-04-28 (initial — needs Dylan to confirm paths)

## Known external skills

### `agriprove-pm`
- **Purpose:** Agriprove PM operating procedures
- **Location:** _(TBD — Dylan to confirm: user-level `~/.claude/skills/`, project-level elsewhere, Claude.ai user skills, or other)_
- **When to invoke:** any time this system is making PM decisions for Agriprove products
- **Read-this-first:** when drafting PRDs, prioritising work, or preparing exec materials

### `agriprove-backend`
- **Purpose:** backend system context for Agriprove
- **Location:** _(TBD)_
- **When to invoke:** sizing engineering scope, understanding system constraints, briefing backend changes

### `agriprove-design-system`
- **Purpose:** design system context
- **Location:** _(TBD)_
- **When to invoke:** UI / UX decisions, component reuse, design consistency questions

## How agents in this repo should use them

1. **Default:** if a session has these skills available (e.g. user-level skills loaded), agents should invoke them when relevant — they take precedence over generic guidance for Agriprove-specific questions.
2. **Detection:** Claude Code surfaces available skills in the session — agents can check before acting.
3. **Fallback:** if an agriprove-* skill is *not* available in the session, the agent should say so and proceed with general best practices, flagging that Agriprove-specific procedures may differ.

## What we don't do
- Don't copy these skills into this repo — they live where they live
- Don't fabricate Agriprove-specific procedures from memory of generic PM practice

## Open questions
- Where exactly are these skills installed?
- Are there other skill packs (e.g. agriprove-data, agriprove-customer-success) that should be referenced here?
- Is there an authoritative index of Agriprove skills somewhere Dylan maintains?
