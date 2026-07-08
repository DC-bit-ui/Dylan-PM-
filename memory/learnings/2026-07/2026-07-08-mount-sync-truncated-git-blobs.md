# Connected-folder sync can feed git truncated files — verify blobs after commit

**Date:** 2026-07-08
**Source:** Cowork session (grazing tool guide) — commits 2a85ee5 (pre-amend) and 3ac6e79 both captured partial files
**Confidence:** [high] — observed twice in one session

## What happened
Files edited via Cowork's file tools (Windows side) sync to the VM mount with lag. Twice in one session, `git add` + `commit` ran while the mount held a **partial** version: strategy.md committed with 42 of 63 lines (dropping the pivots table — an effective delete from memory/), and the v3 spec with 189 of 216 lines. Git also hit stale `.lock` files and one "index file corrupt" from the same mount behaviour.

## Rule going forward (for any Cowork session committing from the connected folder)
1. After writing via file tools, **verify the mount copy before staging**: `wc -l` + `tail` must match intended content — grep for the NEWLY added text, not strings that pre-exist.
2. **After every commit, verify the blob**: `git show HEAD:<path> | wc -l` against the working file. A truncated blob in memory/ silently violates append-don't-overwrite.
3. When a mismatch appears, **write the file from the VM side** (bash heredoc/cat) — that path is authoritative for git — then commit.
4. Stale `.git/*.lock` files (crashed processes, sync artifacts) can be cleared after confirming no live git process.

## Fixes applied this session
- strategy.md: amended on `cowork/strategy-snapshot-acquisition` (2a85ee5 amended, full 63 lines)
- v3 spec: recommitted full on main (e5afe33, 216 lines)
