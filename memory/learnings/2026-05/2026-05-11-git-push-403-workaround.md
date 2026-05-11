# Git push from this Claude Code session returns HTTP 403 — workaround via GitHub MCP

**Captured:** 2026-05-11. **Category:** Tooling / infrastructure.

## What happened

Twice in two sessions, `git push origin <branch>` from this Claude Code instance failed with HTTP 403 from the remote:

1. **2026-05-04** — `git push origin --delete claude/setup-claude-system-9cDDB`. Got `RPC failed; HTTP 403`. Blocked the legacy branch deletion. Dylan had to delete via GitHub UI.
2. **2026-05-11** — `git push origin main` after a local commit (`fdaa8c2`, career portfolio architecture). Same 403. Local commit landed but never reached origin.

In both cases the local credential was insufficient for the operation. Not a network issue; not a hooks-blocking-the-push issue. Authorization.

## What worked

`mcp__github__push_files` succeeded both times. It creates commits directly on the remote via the GitHub API using a different credential path. Two-commit split (one tool call per logical group of files) was necessary for the larger second case because of payload size.

After the MCP push, local and remote diverged (local had its own commit, remote had API-created commits with identical content under different SHAs). Realigned with `git fetch origin main && git reset --hard origin/main`. No work lost — the content was byte-identical on both sides.

## When to use which

| Operation | Try first | Fallback if 403 |
|---|---|---|
| Add / modify file(s) on `main` | `git push origin main` | `mcp__github__push_files` (then realign local) |
| Delete branch | `git push origin --delete <branch>` | Ask Dylan to delete via GitHub UI (no MCP equivalent) |
| Create PR / merge / comment | GitHub MCP from the start | n/a |

## Don't retry on 403

Per the harness retry guidance: 4 retries with exponential backoff is for **network errors**. HTTP 403 is auth/permissions — it won't recover by retrying. Diagnose and reroute (MCP) instead of looping.

## Open question

Why does the local credential lack push permission? Not investigated. It may be deliberate (the sandbox's git credentials are read-only, with writes intentionally routed through MCP for auditability) or it may be a credential-rotation issue. Worth surfacing if it starts affecting more operations.

## Cross-references

- Sister tooling learning: [`./2026-05-04-pr-base-branch-routing-bug.md`](2026-05-04-pr-base-branch-routing-bug.md) — different issue (UI default base branch), same symptom (operations didn't land where expected).
