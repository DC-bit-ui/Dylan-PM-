# PR base-branch routing bug — the legacy `claude/setup-claude-system-9cDDB` branch is a recurring trap

**Date:** 2026-05-04
**Type:** correction + operational hazard
**Status:** Three instances in 24 hours. Cause identified. Fix is branch deletion + harness directive override.

---

## The pattern

When a Claude Code session opens a PR via the GitHub MCP, the base branch defaults to the harness-supplied `claude/setup-claude-system-9cDDB` rather than `main`. This happens even though [`CLAUDE.md` §12](../../../CLAUDE.md) is explicit:

> **Main is the canonical working branch. Push to `main` directly.** The feature-branch / "assigned branch" pattern was retired on 2026-04-28 — if the harness surfaces a `claude/...` branch name in environment context, that's a legacy artifact, not a directive.

The harness keeps surfacing the legacy branch in session-start environment context. Sessions that don't read CLAUDE.md carefully — or that defer to environment context out of habit — route PRs through the legacy branch.

## Three instances, 24 hours

1. **PR #6 (2026-05-01)** — `head=claude/proactive-memory-capture-2026-05-01`, `base=claude/setup-claude-system-9cDDB`. Merged. Memory-capture protocol landed on the legacy branch, not `main`.
2. **PR #7 (2026-05-01)** — corrective. `head=claude/memory-capture-onto-main-2026-05-01`, `base=main`. Merged. Re-applied PR #6's content onto `main`.
3. **PR #8 (2026-05-04)** — same content, **wrong direction**. `head=main`, `base=claude/setup-claude-system-9cDDB`. Would merge `main` INTO the legacy branch. Duplicate of content already on `main` via PR #7. Likely opened by a stale Claude Code session that didn't see the PR #7 merge and re-tried with head/base swapped.

## Root cause

Two compounding factors:

1. **The legacy branch still exists on the remote.** It was the bootstrap branch for the harness-assigned-branch pattern. That pattern was retired 2026-04-28 but the branch wasn't deleted. As long as it exists, the GitHub MCP / web UI / harness all surface it as a valid PR target.
2. **The harness session-start environment surfaces the branch as a directive-shaped string.** The session prompt contains `Develop on branch claude/setup-claude-system-9cDDB`. Models that scan environment context for branch hints latch onto it. CLAUDE.md §12 explicitly overrides this, but that override is only effective if the session reads CLAUDE.md before opening a PR.

## Fix

**Primary fix — delete the legacy branch.** Once `claude/setup-claude-system-9cDDB` doesn't exist on the remote:
- The GitHub UI default base flips to `main`
- The harness directive becomes a dead reference
- Sessions opening PRs against the missing branch fail loudly (correct behaviour) instead of merging into a phantom

**Secondary fix — verification gate before any `mcp__github__create_pull_request` call:**
- Read `base` and `head` aloud in chat before invoking
- If `base` is anything other than `main`, stop and check with Dylan
- If the head/base look swapped (head=main, base=feature-looking-name), stop

**Tertiary — when PR #8-shape PRs appear (head=main, base=anything):** never merge. They merge upstream INTO a feature branch, which is almost always wrong.

## Why the "merged" status is not enough verification

Webhooks fired `merged` for both PR #6 and PR #7. From the chat surface they looked indistinguishable. But PR #6 merged into the legacy branch (no consumer reads it), PR #7 merged into `main` (canonical). **Verification requires checking both `merged: true` AND `base.ref == "main"`.** Operator skipped this for PR #6 because the surface signal looked correct — same anti-pattern as ["looks-like-work"](2026-05-01-looks-like-work-anti-pattern.md): legible output, no durable side effect.

## Cross-link

This is the third instance this week of the broader pattern that `2026-05-01-looks-like-work-anti-pattern.md` describes — surface success without state change in the consuming system. The diagnostic question applies directly:

> *Did this PR change `main`?*

If no → the merge is noise regardless of webhook signal.

## Operational consequences

- Treat `claude/setup-claude-system-9cDDB` as a deprecated branch pending deletion. Do not target PRs at it. Do not merge PRs that target it.
- After branch deletion: the CLAUDE.md §12 override still stands (harness may continue surfacing the directive), but the practical attack surface is closed.
- For any new PR: state `head` and `base` in chat before invoking the create tool. One sentence is enough.

## Candidate for promotion

If the bug recurs after the legacy branch is deleted, this gets promoted to a standing rule in [`memory/profile/decision-frameworks.md`](../../profile/decision-frameworks.md) under a new "Git operations safety" section. Until then, leave it as a learning — branch deletion should resolve the practical problem.
