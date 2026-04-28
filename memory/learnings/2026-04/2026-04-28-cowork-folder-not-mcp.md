# Learning: Cowork uses connected folders, not GitHub MCP — corrected COWORK.md §2

**Date:** 2026-04-28
**Source:** Dylan in session — "I cannot find a GitHub MCP connector in the Cowork chats as an option"

---

## What Dylan corrected

I baked an `[ASSUMPTION]` into `COWORK.md` §2 that Cowork would access this repo via a GitHub MCP server. Wrong. The actual mechanism is **direct filesystem access via Cowork Projects connecting to a local folder**.

## What Cowork actually is (verified via Anthropic docs)

Per [Anthropic's Cowork getting-started](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork) and [Projects feature](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork) docs (retrieved via web search 2026-04-28):

- **Cowork = Anthropic's agentic desktop product.** Runs in a sandboxed VM on Dylan's machine.
- **Projects = workspaces.** Each Project can be pointed at an existing folder; Cowork has read + write access to that folder within the VM.
- **Project Instructions** = per-project prompt loaded with every message in the project.
- **Global Instructions** = always-on prompt across all Cowork sessions.
- **Connectors** are added per-project via Customize → Connectors. They are MCP-based but configured through Cowork's UI, not necessarily 1:1 with the public MCP-server ecosystem.
- **Skills** = uploaded as ZIP or referenced in folders; Cowork loads them dynamically.
- **GitHub MCP is NOT a default Cowork connector.** Could potentially be added as a custom connector, but the simpler pattern is folder-direct.

## Why the correction matters

The bidirectional contract still works — but the mechanism is different and **simpler**:

| Aspect | Before (GitHub MCP) | After (folder direct) |
|---|---|---|
| Latency | One API call per file | Whole-tree filesystem access |
| Whole-repo context | Hard — request files one-by-one | Easy — Cowork can scan the whole tree |
| Setup | Enable GitHub MCP, scope it, test | Click "Use existing folder" in Cowork |
| Git workflow | Cowork commits via API | Cowork runs `git` in its sandboxed VM |
| Auth | GitHub PAT scoped to repo | Git auth in the VM (PAT or SSH) |

## Mental model shift

Cowork isn't a remote agent talking to a remote repo. **It's a local agent operating on a local folder.** The Git layer is for durability and sync between Dylan's machine and GitHub — Cowork interacts with the folder; the folder interacts with Git.

This means the right local-setup pattern (per `playbooks/local-setup-windows.md`) is:
1. Clone repo to `C:\Dylan PM`
2. Use Claude Code in `C:\Dylan PM` for code/memory edits
3. **Point Cowork at `C:\Dylan PM`** as a connected Project
4. Both environments touch the same folder; Git is the durability layer

## Files updated

- `COWORK.md` §2 — replaced GitHub MCP assumption with folder-direct setup
- `COWORK.md` §6 — updated sync mechanics for the local-folder model
- `COWORK.md` §11 — replaced bootstrap checklist with folder-based steps
- `COWORK.md` §13 — added paste-ready Project Instructions appendix
- `memory/decisions/2026-04-28-cowork-bidirectional-contract.md` — open-question on access mechanism resolved (folder direct, not GitHub MCP)

## What I should have done differently

When I marked something `[ASSUMPTION]`, I should have **checked the docs before relying on it for downstream design**. Marking an assumption isn't a license to design as if the assumption were true. The §2 access mechanism shaped the rest of the contract; getting it wrong meant a §6 rewrite plus an §11 rewrite.

Lesson: when an `[ASSUMPTION]` is load-bearing, validate before building on it. WebSearch is a 30-second cost; rewriting the dependent design is a 30-minute cost.

## Related
- Decision: `memory/decisions/2026-04-28-cowork-bidirectional-contract.md`
- Contract: `/COWORK.md`
- Local setup: `playbooks/local-setup-windows.md`

## Sources
- [Get started with Claude Cowork](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)
- [Organize your tasks with projects in Claude Cowork](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork)
- [Use plugins in Claude Cowork](https://support.claude.com/en/articles/13837440-use-plugins-in-claude-cowork)
- [Use Skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude)
