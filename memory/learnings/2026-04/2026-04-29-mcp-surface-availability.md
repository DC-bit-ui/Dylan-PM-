# Learning: GitHub MCP is web-only — Cowork desktop is filesystem-only

**Date:** 2026-04-29
**Source:** Dylan in session — "GitHub MCP is only available via the web claude — I am using desktop"

---

## What Dylan corrected

In the previous turn I listed "Enable GitHub MCP scoped to `DC-bit-ui/Dylan-PM-` in Cowork" as a bootstrap step. Wrong. **GitHub MCP is not available on Cowork desktop.** It's available on claude.ai web. Dylan uses Cowork desktop as his primary surface.

I conflated two MCP contexts: this CLI session has a GitHub MCP scoped to the repo (per its system prompt) — that scope is local to the CLI, not transferable to Cowork.

## Surface → MCP availability map

| Surface | GitHub MCP | Filesystem (`C:\Dylan PM`) | Git layer |
|---|---|---|---|
| Cowork desktop (Dylan's primary) | No | Yes (sandboxed VM) | Runs `git` in the VM if auth configured |
| claude.ai web | Yes | No | Via GitHub MCP |
| Claude Code CLI (this) | Yes (scoped to repo) | Yes (working dir) | Via GitHub MCP + local git |
| Claude mobile | No | No | None |

## Architectural implication

The repo is the source of truth; **git is the sync layer between surfaces**. But not every surface can perform the sync:

- **Cowork desktop** edits files locally. Pushes happen only if (a) git auth is configured in the VM and Cowork is told to commit, or (b) something else commits + pushes (this CLI, or web).
- **Web** can read + write via git directly through GitHub MCP.
- **This CLI** is the most capable git surface — filesystem + GitHub MCP + scoped permissions.

So the practical loop for the multi-surface seam is:
1. Cowork desktop produces durable insights → writes to `memory/` via filesystem
2. Either Cowork desktop pushes (if git auth wired) **or** this CLI commits + pushes on the next session
3. Web reads the canonical state via GitHub MCP

This sharpens — but doesn't contradict — `memory/decisions/2026-04-28-multi-surface-strategy.md`.

## Why the correction matters

The bootstrap checklist I wrote in the prior turn implied Cowork desktop could be configured with GitHub MCP. It can't. The real bootstrap step is **verify git auth inside Cowork's VM** (or accept that this CLI is the git-push surface and Cowork is purely a filesystem editor).

Open question for Dylan to confirm next session: does Cowork desktop have working git auth in its VM, or should we treat it as filesystem-only and rely on this CLI for all pushes?

## What I should have done differently

When the system prompt of *this* session declared a GitHub MCP scope, I projected that capability onto Cowork without checking. Surface capabilities are not transferable — each surface's MCP set is independent. Don't assume; ask or check.

Lesson: **MCP availability is per-surface, not per-account.** Always state which surface a capability lives on when writing cross-surface architecture.

## Files to update (next session)

- `CLAUDE.md` §15 (multi-surface strategy) — add the surface→MCP table
- `COWORK.md` §2 / §6 — clarify that Cowork desktop is filesystem-only and git auth in the VM is the bootstrap variable
- `memory/decisions/2026-04-28-multi-surface-strategy.md` — append a clarification section

Not done now to keep this learning atomic; will batch when Dylan confirms the Cowork-VM-git-auth question.

## Related
- `memory/learnings/2026-04/2026-04-28-cowork-folder-not-mcp.md` — established Cowork uses folder, not GitHub MCP
- `memory/decisions/2026-04-28-multi-surface-strategy.md` — multi-surface architecture
- `COWORK.md` — bidirectional contract
