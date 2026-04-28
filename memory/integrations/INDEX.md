# Integrations Index

> One file per external system this Claude OS reads from or writes to. Each file documents the contract: what flows in, what flows out, where it lands, and what to do if the connector is unavailable.

> **Rule:** if it's not in this index, agents shouldn't claim live data from it.

## Live (or aspirational) connectors

| System | Purpose | Direction | Status | File |
|---|---|---|---|---|
| Granola | Meeting notes & transcripts | read | aspirational | `granola.md` |
| Notion | Work items, docs | read/write | aspirational | `notion.md` |
| Jira | Tickets, roadmap items | read/write | aspirational | `jira.md` |
| Outlook | Emails | read | aspirational | `outlook.md` |
| Microsoft Teams | Channel updates | read | aspirational | `teams.md` |
| cowork | Cross-system summarisation | read (drops to inbox) | aspirational | `cowork.md` |

## External skill packs (referenced, not copied)

| Skill | Where it lives | Used for |
|---|---|---|
| `agriprove-pm` | _(TBD — confirm path with Dylan)_ | Agriprove PM operating procedures |
| `agriprove-backend` | _(TBD)_ | Backend system context |
| `agriprove-design-system` | _(TBD)_ | Design system context |

## Default integration shape (every new system follows this)

1. **Inbound:** writes to `inbox/<source>/` (raw) or directly to `workspace/current/actions.md` / `memory/initiatives/<slug>.md` (structured, with frontmatter)
2. **Outbound:** reads from named, stable paths under `memory/`
3. **Contract:** documented in this directory, one file per system
4. **Failure mode:** agent states explicitly when connector is unavailable; falls back to inbox drops; never fabricates
