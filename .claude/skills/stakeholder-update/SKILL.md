---
name: stakeholder-update
description: Generate a status update for a specific stakeholder or audience. Pulls active state from memory/initiatives/, recent decisions, and adapts tone via memory/people/roster.md. Use for weekly emails, monthly reviews, exec updates, or any "give me an update on…" request.
---

# Stakeholder Update Skill

## Workflow

1. **Identify audience.** Ask if not stated. Pull their entry from `memory/people/roster.md` — note role, format, length, and what they actually care about.
2. **Define scope.** All initiatives? One? A specific outcome? Confirm.
3. **Assemble the facts:**
   - Current state from `memory/initiatives/INDEX.md`
   - Recent decisions from `memory/decisions/` (last update window)
   - Risks from each active initiative file
   - Numbers from `memory/business/metrics.md` (and validate via `data-analyst` if any are non-trivial)
4. **Draft using the audience archetype** from `.claude/agents/stakeholder-comms.md` — exec / cross-functional / team / external.
5. **Three-pass cut:** facts → trim 30% → reorder so headline is first.
6. **Save to** `memory/deliverables/updates/YYYY-MM-DD-<audience>.md`.

## Default exec template

```
**TL;DR:** <one sentence>

**Highlights**
- <wins, ranked by impact>

**Watch list**
- <yellow / red items, what's being done>

**Decisions made this period**
- <decision> — <one-line rationale>

**Asks**
- <specific request, or "none">
```
