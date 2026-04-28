# Session Retro: Bootstrap of Claude Operating System — 2026-04-28

**Scope:** session
**Duration:** single working session
**Outcome:** system shipped on branch `claude/setup-claude-system-9cDDB`

## What happened
Built the full Dylan-PM Claude operating system from an empty repo. 72 files: master `CLAUDE.md`, 10 subagents, 13 skills, 10 slash commands, 3 lifecycle hooks, structured `memory/`, playbooks, templates, README. Committed and pushed; PR couldn't be opened because branches were identical (initial commit).

Dylan then asked whether external systems — specifically a "cowork" environment with a worktask-prioritisation workflow — can reference and write into this system. Answered yes; proposed three integration patterns (inbound drop / direct memory write / bidirectional contract). Open question on what "cowork" precisely is.

## What worked
- **Plain-markdown-in-git architecture** — paid off immediately when Dylan asked about external integration. The answer was "yes, anything that can git clone can use it" without retrofitting.
- **Hooks fired as designed** — SessionStart surfaced context, Stop nudged for capture (this retro is proof).
- **Opinionated structure** — having defined places for each kind of artifact made the integration question concrete: "inbound goes to `inbox/`, structured updates go to `workspace/current/actions.md`, contracts go to `memory/integrations/`."

## What didn't
- **PR couldn't be opened** — created `main` from same SHA as feature branch, so no diff. Should have created `main` first as an empty seed, *then* pushed the bootstrap. Cost: minor (Dylan can fast-forward), but a real first-time-setup gotcha.
- **Did not anticipate the "external integration" use case** in the initial design — no `memory/integrations/` directory was scaffolded. Adding it on demand is fine, but a quick "what other systems will this talk to?" question at the start would have surfaced it.

## Decisions made
- Memory format = plain markdown, indexed via `INDEX.md` (vs. SQLite, JSON, or a graph DB). Trade-off: no programmatic querying, but full portability and zero-setup cost. Bet was correct given external-integration question landed cleanly.
- Hooks use `decision: "block"` on Stop (with a guard to avoid loops) — assertive capture beats forgotten capture.

## Durable learnings
- → `memory/learnings/2026-04/2026-04-28-external-integration-need.md` — Dylan operates with external workflows that need to read/write this system; a `memory/integrations/` pattern is needed.

## Changes to the system (proposed)
1. Add `memory/integrations/` directory with INDEX, populated as integrations are wired
2. Add `inbox/<source>/` convention for namespaced inbound drops
3. Consider a `worktask-ingest` skill once Dylan defines the prioritisation output format
4. Update `CLAUDE.md` §3 to mention `memory/integrations/` once it exists

## Next concrete actions
- [ ] Dylan: confirm what "cowork" is and the format of his prioritisation workflow output
- [ ] Dylan: decide whether to fast-forward `main` or keep `claude/setup-claude-system-9cDDB` as the working line
- [ ] Once #1 is answered, scaffold `memory/integrations/worktask-prioritiser.md` and the ingest skill
- [ ] Once `memory/integrations/` exists, update `CLAUDE.md` §3 table

## Linked
- Branch: `claude/setup-claude-system-9cDDB`
- Learning: `memory/learnings/2026-04/2026-04-28-external-integration-need.md`
