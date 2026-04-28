# Dylan operates with external workflows that need to read/write this system

**Date:** 2026-04-28
**Type:** mechanism
**Trigger:** Dylan asked whether "cowork" — and specifically his existing worktask-prioritisation workflow — can reference and feed this system.

## The learning
This system is not the only place Dylan does work. He has at least one external workflow (worktask prioritisation) whose outputs should *inform* `workspace/current/actions.md` and `memory/initiatives/`, and whose decisions should be *informed by* `memory/business/strategy.md` and `memory/initiatives/INDEX.md`.

Implication: the system needs first-class integration patterns, not just session-internal use. Plain-markdown-in-git already supports this technically; what's missing is a documented contract and a place for it.

## What changes because of this

1. **Add `memory/integrations/` directory** — one file per external system Dylan integrates, documenting:
   - What the integration is
   - What it writes (paths, schema, frequency)
   - What it reads (paths it consumes)
   - Failure mode if absent

2. **Add `inbox/<source>/` namespacing** — when external systems drop input, they get a subdirectory so it's clear what came from where.

3. **Default integration shape** Claude should propose for any new external system:
   - Inbound: writes structured markdown to `inbox/<source>/` or directly to `workspace/current/actions.md` with frontmatter
   - Outbound: reads from named, stable paths in `memory/`
   - Contract: documented in `memory/integrations/<source>.md`

4. **CLAUDE.md should reference `memory/integrations/`** in §3 once the directory exists.

5. **Bidirectional > one-way** — when proposing an integration, default to bidirectional. The leverage is the loop: priorities are made richer by memory, and memory gets sharper as priorities are executed.

## Open questions to resolve
- What is "cowork" specifically (separate Claude env, internal tool, third-party product)?
- What format does the prioritisation workflow produce (markdown, JSON, Linear/Jira sync)?
- What does it currently read from to make decisions?

## Related
- Session retro: `memory/retros/session/2026-04-28-bootstrap.md`
- Inbox README: `inbox/README.md` (currently doesn't mention namespacing — update when integrations land)
- CLAUDE.md §3 — add `memory/integrations/` to the directory table
