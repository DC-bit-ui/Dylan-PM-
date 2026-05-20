---
date: 2026-05-21
source: Cowork response to Prompt A (verify + deploy daily-enrichment-pipeline patches), 2026-05-20
tags: [cowork, scheduled-tasks, inventory, observability]
---

# Cowork `uploads/` enumeration is INCOMPLETE — not an inventory

## The trap

When discovering which scheduled tasks Cowork runs for Dylan's account, I enumerated `uploads/SKILL.md` files under `C:\Users\DylanCronje\AppData\Roaming\Claude\local-agent-mode-sessions\…\uploads\`. This returned **8 distinct task names**. I treated this as the complete inventory.

Cowork's live `mcp__scheduled-tasks__list_scheduled_tasks` call on 2026-05-20 returned **14 active tasks** — 6 more than the uploads/ scrape.

## Why

`uploads/SKILL.md` is materialised lazily — it appears on disk only when:
1. The task has fired in a Cowork session **that materialised to this filesystem**, AND
2. A subsequent invocation hasn't overwritten it (path is per-session-instance)

A task that:
- Was created via the Cowork UI but never edited, OR
- Was edited but hasn't fired since, OR
- Fires but materialises into a session whose `uploads/` was garbage-collected, OR
- Runs in a different account context

...won't appear in the uploads/ scrape at all.

## The 7 missed tasks (Cowork's report)

- `daily-briefing` — enabled, ran today; the 2026-04-23 stub snapshot was stale
- `career-monthly-meta` — monthly portfolio meta-pass, enabled
- `career-canary-reaudit` — manual-only canary re-audit, enabled
- `persona-supplements-refresh` — DISABLED, marked SUPERSEDED by daily-enrichment-pipeline
- `weekly-pattern-curation` — Friday 16:30, enabled
- `weekly-system-retro` — Friday 16:45, enabled
- `process-intelligence-bundles-afternoon` — 06:00 SAST daily, enabled

## How to enumerate scheduled tasks correctly

**Authoritative:** `mcp__scheduled-tasks__list_scheduled_tasks` from a Cowork session — returns every task in the account, regardless of last-fire or materialisation state.

**Useful but incomplete:**
- `uploads/SKILL.md` files (only firing-recent tasks)
- The user's memory of which tasks exist (recall is lossy)

**Rule going forward:** any "pull all Cowork scheduled tasks" workflow MUST start with `list_scheduled_tasks` to enumerate, then pull each by ID. Never rely on uploads/ as the source-of-existence.

## Update to the Tier 0 standing convention

Reflect this in `.claude/skills/cowork-scheduled/README.md`:
- Add an "Inventory" section that documents the `list_scheduled_tasks`-based enumeration as the canonical mechanism
- When pulling a new task into the repo, the bootstrap step is `list_scheduled_tasks` → find by name → read `task_prompt` → write to `<task-name>/SKILL.md` (frontmatter-or-not per repo convention)
- Periodic sweep: cross-check repo `.claude/skills/cowork-scheduled/*/` directories against live `list_scheduled_tasks` and flag any mismatch (extra repo dirs, missing repo dirs)

## Related

- `memory/learnings/2026-05/2026-05-20-cowork-uploads-snapshot-semantics.md` — companion learning that uploads/ mtime ≠ last fire
- `memory/learnings/2026-05/2026-05-20-cowork-deploy-no-frontmatter.md` — companion learning on frontmatter handling during deploys
- `.claude/skills/cowork-scheduled/README.md` "Pending pull" section — 7 tasks awaiting Tier 0e pull
