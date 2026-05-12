# Notion is the canonical workstack; this Claude Code repo is the strategic memory layer

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Stakeholders:** Dylan
**Supersedes:** _(none — extends `2026-04-28-integration-architecture.md`)_

## Context
Cowork handoff (2026-04-28) revealed that Apex — Dylan's automated daily workflow system — already runs in Cowork. It maintains a Notion database ("Work Priorities", id `fd5f23d7e071496dae6df273cbd901be`) as the canonical personal workstack, and writes to Jira for team-visible work.

Earlier scaffolding in this repo treated `workspace/current/actions.md` as the authoritative action list. That conflicts with the existing system.

## Decision
**Notion is canonical for Dylan's personal tasks. Jira is canonical for team delivery.** This Claude Code repo is the **strategic memory + reasoning + artifact layer** — PRDs, decisions, retros, learnings, business intelligence, briefs, initiative snapshots.

This repo:
- **Reads** from Notion / Jira / Granola / Teams / Outlook / HubSpot / Confluence via MCP when connectors are enabled in the active session
- **Writes** to durable memory artifacts (`memory/`)
- **Does NOT** duplicate the Notion workstack
- **`workspace/current/actions.md`** is a fallback only, used when Notion is unreachable

Skills `/focus` and `/standup` query Notion directly via the MCP tool `mcp__47501ce1-32b1-4956-a3cf-3a370bc547c9__notion-query-database-view`.

## Alternatives considered

- **Mirror Notion in `actions.md`** — rejected. Sync drift kills usefulness; two sources of truth means neither is truthful.
- **Replace Notion with files in this repo** — rejected. Apex already writes to Notion; tearing it out is high effort, zero gain, and breaks Dylan's existing daily flow.
- **Don't use Notion at all from this repo** — rejected. `/focus` and `/standup` need live state; falling back to a stale snapshot would give wrong answers.

## Consequences

**Positive:**
- Single source of truth for tasks; no sync logic.
- This repo's value sharpens — strategic memory, not task duplication.
- `/focus` and `/standup` reflect Apex's actual state, not a stale local file.

**Negative:**
- This repo is useful only when Notion connector is enabled in-session. Without it, fallback is degraded.
- Two-system mental model — Cowork (execution) + this repo (memory) — has overhead until habituated.

**What we accept and won't revisit:**
- Two-system architecture (Cowork + this repo) is correct given existing Apex investment.
- Plain markdown + git as the substrate for the memory layer (decision 2026-04-28 bootstrap).

## Revisit triggers
- If Apex stops running for >2 weeks (Cowork outage / cost) → reconsider whether this repo should absorb the workstack
- If Cowork retires or changes connector model → revisit
- If team adopts the same system → may need shared instance, not personal

## Links
- Earlier decision: `memory/decisions/2026-04-28-integration-architecture.md`
- Notion contract: `memory/integrations/notion.md`
- Cowork (Apex) contract: `memory/integrations/cowork.md`
- `/focus` skill: `.claude/skills/focus/SKILL.md`
- `/standup` skill: `.claude/skills/daily-standup/SKILL.md`
