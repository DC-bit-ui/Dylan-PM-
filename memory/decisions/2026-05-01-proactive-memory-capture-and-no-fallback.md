# Decision: Proactive memory capture is judgment-based; canonical writes only, no silent fallbacks

**Date:** 2026-05-01
**Status:** accepted
**Owner:** Dylan
**Type:** ADR (architecture — applies to all surfaces, primary impact on Cowork)

---

## Context

Cowork sessions had been failing to capture preferences into the canonical `memory/` tree. A representative interaction (2026-05-01):

1. Dylan asked Cowork to "include everything you have learnt about the platform to the local memory files".
2. Cowork tried Claude.ai's built-in "memory" / auto-memory tool — succeeded as a tool call, but that storage is a separate per-session system Dylan's wider OS does not consume.
3. Cowork then tried the Write tool against the connected-folder `memory/` path — the directory was reported read-only in that session.
4. Cowork tried bash — also reported the mount as read-only.
5. Cowork **silently fell back** to creating a new folder, `memory-export/`, in the project root with 8 knowledge files plus an index, and reported success.
6. Net result: zero canonical memory writes. The capture is sitting in a folder no Apex run, no Claude Code session, and no external skill pack reads.

Two failure modes compounded:

- **Wrong system as default first attempt.** Claude.ai's auto-memory is a fundamentally different storage from `memory/` in the connected folder. Cowork's contract did not explicitly forbid it.
- **Silent fallback to a parallel folder.** When the canonical path was unwritable, Cowork improvised a new path rather than surfacing the failure. This is the same anti-pattern as a degenerate flow producing surface-readable output with no durable side effects (see [`2026-04-29-heavy-prescription-over-light-prompt.md`](2026-04-29-heavy-prescription-over-light-prompt.md)) — it looks like work; it isn't.

Separately, Dylan flagged that capture should be **judgment-based, not gated on keywords**. He wants the system to detect preferences in flow ("don't lead with the executive summary, just dive into the problem statement") without requiring "remember that" prefixes — and definitely without him doing periodic audits to find what got missed.

## Decision

Three rules, encoded in `cowork/project-instructions.md` §7 (the runtime contract Cowork loads on every message) and mirrored in `COWORK.md` §4 (the durable contract):

### 1. Capture is judgment-based, not keyword-gated.

The trigger is "Dylan expects this to stick", not a magic phrase. Cowork captures proactively when Dylan:
- States a preference about how he works, communicates, thinks
- Corrects a fact, term, or framing
- Articulates a rule he expects to apply going forward
- Introduces a new term, person, product, or concept not already in `memory/`
- Repeats the same correction twice in one conversation
- Uses an explicit signal phrase ("remember that", "save this", etc.) — but this is the easy case, not the only case

When ambiguous, default to capture with `[moderate]` confidence and a `supersede if corrected` note. False positives are cheap (Dylan supersedes); false negatives compound (Dylan repeats himself).

### 2. The canonical memory location is the connected-folder filesystem only.

Cowork must NOT use:
- Claude.ai's built-in "memory" / auto-memory tool
- Any parallel folder (`memory-export/`, `claude-memory/`, `for-import-later/`, `memory-staging/`, etc.)
- Conversation-attached files in lieu of a write (unless Dylan explicitly asks)

The capture either lands in `<connected-folder>/memory/...` or it doesn't land. There is no third state.

### 3. When a canonical write fails, surface the failure explicitly. Never improvise an alternate path.

Required response shape:

> ❗ Memory write failed.
> Path: `<full path under memory/>`
> Capture: `<one-line summary>`
> Tool: `<tool name>` — Error: `<verbatim error>`
> **No fallback created.** Possible causes: connected-folder mount read-only this session, folder access needs re-granting in Cowork → Project → Settings, or parent directory needs creating first.
> Please resolve and ask me to retry.

Better to lose a capture and flag it visibly than to scatter files no one reads.

### 4. Confirm successful captures in one line.

> ✅ Captured: `<path>` — "<one-line summary>" — commit `<sha>` (Tier 1) / PR `<url>` (Tier 2)

## Consequences

**Positive:**
- Preferences land where the system reads them. Dylan stops repeating himself across sessions.
- When something fails, Dylan finds out in the moment — not at audit time, days later.
- The capture model is robust against new Claude features (e.g. if Anthropic ships a new auto-memory tool tomorrow, the contract already says don't use it).
- The "no audit, no interval check" goal is achievable: capture happens at the moment of expression, fail-loudly catches the gaps.

**Negative / costs:**
- Slight risk of over-capture as Cowork errs toward "capture with moderate confidence and supersede later" on ambiguous signals. Mitigation: weekly `/sweep` (already scheduled per `2026-04-28-curation-cadence.md`) catches and dedupes / supersedes.
- Visible failure messages add friction during incidents (read-only mounts, expired folder access). This is a feature: the friction is the signal.
- Re-pasting the project-instructions block into Cowork after each contract edit. One paste per change; cost is sub-minute.

## Alternatives considered

1. **Use Claude.ai's auto-memory as the storage.** Rejected. It is per-conversation, not consumed by Apex / Claude Code / external skills, and not version-controlled. Defeats the bidirectional contract.
2. **Periodic audit / sweep to catch missed captures.** Rejected as primary mechanism (Dylan explicitly ruled out interval-based audits as the load-bearing pattern). Sweeps still run weekly per the curation-cadence decision, but as cleanup, not as the capture mechanism.
3. **Tighter keyword list (require "remember that", "save this", etc.).** Rejected. Too brittle. Most preferences are expressed in natural flow without an explicit prefix; keyword-gating misses the majority of capture moments.
4. **Allow `memory-export/` as a sanctioned fallback path that gets auto-imported on next session.** Rejected. The "later import" never reliably happens; even if it did, it adds a class of orphan files that need a separate routing decision and inflate the surface area for stale state. The right answer to "the canonical path is read-only" is to fix the mount, not to scatter files.

## Implementation

- `cowork/project-instructions.md` §7 — three new subsections (When to capture / No-silent-fallback / Confirm captures) added
- `COWORK.md` §4 — same three subsections mirrored
- Re-paste the BEGIN→END block of `cowork/project-instructions.md` into Cowork → Project → Settings → Project Instructions

## Related

- [`2026-04-29-heavy-prescription-over-light-prompt.md`](2026-04-29-heavy-prescription-over-light-prompt.md) — same anti-pattern (looks-like-work outputs that aren't durable)
- [`2026-04-28-cowork-bidirectional-contract.md`](2026-04-28-cowork-bidirectional-contract.md) — the parent contract this refines
- [`2026-04-28-curation-cadence.md`](2026-04-28-curation-cadence.md) — the weekly sweep that backs up this protocol but is no longer the load-bearing capture mechanism
