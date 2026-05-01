# Decision: Multi-surface Claude strategy — Cowork + this repo as system of record; claude.ai/mobile as capture-only

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Related:** [`2026-04-28-cowork-bidirectional-contract.md`](2026-04-28-cowork-bidirectional-contract.md), [`2026-04-28-cowork-folder-not-mcp.md`](../learnings/2026-04/2026-04-28-cowork-folder-not-mcp.md)
**Origin:** Dylan's question — "what is your suggestion for insights gathered from chat that could relate to this personalisation? Or should we start operating only out of cowork?"

---

## Context

Dylan uses Claude across multiple surfaces — Cowork (desktop, with Apex + the connected `C:\Dylan PM` folder), claude.ai (web), Claude mobile, Claude Code (CLI). The question: how do insights from non-Cowork surfaces feed back into the personalised memory system, and should we just consolidate to Cowork-only?

Deep research (per `memory/learnings/2026-04/2026-04-28-multi-surface-research.md`) confirmed three load-bearing facts about Anthropic's 2026 product architecture:

1. **There is no unified cross-surface memory.** Three separate memory systems with no bridge:
   - Chat memory (claude.ai web / Desktop / mobile) — global pool + per-project pool, scoped to those surfaces
   - Cowork Project memory — per-Project, local to the Cowork environment
   - Claude Code local memory — per-machine, per-repo, in `~/.claude/`
2. **claude.ai cannot write to local filesystem.** Confirmed by design — web is cloud-only.
3. **There is no API to read claude.ai conversation history programmatically.** No automated harvest path from claude.ai → repo.

Sophisticated practitioners' guides in 2026 explicitly recommend "context files as a substitute for cross-surface memory" — which is exactly what `memory/` is. The architecture Dylan has built is the documented industry workaround.

## Decision

**Anchor on Cowork + this repo (`C:\Dylan PM`) as the system of record. Do not consolidate to Cowork-only — keep all surfaces, but treat them differently.**

### Three-mode pattern by surface

| Surface | Use for | Capture mechanism |
|---|---|---|
| **Cowork (desktop)** | Daily PM work, deep drafting, anything that should compound | Direct write to `memory/` via Tier 1 / Tier 2 protocol (per `COWORK.md`) |
| **Claude Code (CLI)** | System edits, code-shaped work, when at the machine | Direct write to `memory/` |
| **claude.ai (web)** | Quick lookups, exploratory thinking, "whiteboard" sessions where durability isn't yet known | At end of valuable session: ask Claude to summarise into the capture template (see `playbooks/multi-surface-capture.md`) → paste into `inbox/cowork/<YYYY-MM-DD>-<topic>.md` |
| **Claude mobile** | Same as web, plus quick capture while travelling | Same. For known-durable mobile work, use **Dispatch** — fires a Cowork session on the Windows machine that writes to `memory/` directly |

### The seam — `inbox/cowork/`

Existing pattern from `memory/integrations/cowork.md`. Extended for ad-hoc capture:
- Anything pasted into `inbox/cowork/<YYYY-MM-DD>-<topic>.md` becomes input to the next Apex Morning Briefing (or `/inbox-process` on demand)
- `/inbox-process` (new, this PR) parses the drop, suggests routing, and either commits the routed entry directly (Tier 1) or proposes a PR (Tier 2)
- Apex Morning Briefing's prompt now includes: "scan `inbox/cowork/` for unprocessed drops; route per CLAUDE.md §10 routing rules"

### What we're explicitly NOT doing

- **Not engineering programmatic sync** between claude.ai chat memory and `memory/`. No API exists. Fragile and high-effort relative to benefit.
- **Not consolidating to Cowork-only.** claude.ai mobile has real utility for low-friction quick capture — losing that to enforce single-surface discipline would be net-negative.
- **Not duplicating claude.ai chat memory** in `memory/`. They serve different purposes — one accumulates lightweight cross-session context for casual chats, the other holds engineered, durable, cited memory for the operating system.

## Consequences

**Positive**
- Clean separation of concerns: claude.ai/mobile = whiteboard, Cowork + repo = engineered memory
- Mobile capture path exists (Dispatch + inbox drop) for things that surface away from the desk
- Lightweight discipline at the seam — 30-second capture template at end of valuable claude.ai session
- `inbox/cowork/` is now the single bridging surface — one path to know about, not many

**Negative / risk**
- Manual capture means some insight will leak. Mitigation: that's acceptable — most chats genuinely don't need to compound; the 1-in-5 that do are caught at the seam
- Two memory systems running in parallel (chat memory in claude.ai, engineered memory here) — risk of contradicting facts. Mitigation: when Dylan notices a conflict, the repo wins; update chat memory if needed via "actually, X is now Y"
- Three open verification questions about Cowork's actual behaviour (see below) — if any are different from assumed, the contract may need adjusting

## Verification tests Dylan should run when Cowork is set up

These came from the research as under-documented points worth confirming directly:

1. **Does Cowork inherit claude.ai chat memory?** In a Cowork session, ask "what do you remember about me from previous Claude conversations?" — see if it pulls in chat memory or only repo content. Expected: only repo. If it does pull chat memory, that's a useful surprise.
2. **Does Cowork Project memory persist across sessions independent of `memory/` files?** Have one Cowork session set a fact via "remember…", start a fresh session in same Project, ask it back. Documents what Cowork's own memory layer adds beyond `memory/`.
3. **Are claude.ai Projects and Cowork Projects synced?** Create a test Project in Cowork; check if it appears in claude.ai web. Likely no — UI conventions shared, data stores separate. Confirms expected behaviour.

Results land in a learning entry once tested. If any answer differs from assumption, this decision (and `COWORK.md`) get a Tier 2 update.

## Alternatives considered

1. **Cowork-only consolidation** — rejected; loses real-world mobile capture utility and offers no offsetting benefit (Anthropic's architecture doesn't penalise multi-surface use)
2. **Engineered sync via API** — rejected; no API exists for claude.ai chat history; building one would be fragile
3. **Claude.ai chat memory as primary** — rejected; not accessible to Cowork or Claude Code, so doesn't reach the engineered memory layer where Apex operates
4. **Periodic export of claude.ai conversation history → manual review** — rejected as primary path; too high friction relative to in-conversation capture template; reserved as a fallback if something important slipped through
5. **Single memory system via Managed Agents API** — possible long-term, but requires custom development; deferred until there's a clear pain point

## Validation

- **Daily** — does the inbox drop pattern actually get used? Track by counting `inbox/cowork/` files per week.
- **Weekly sweep** — `/inbox-process` runs as part of Apex Morning Briefing; review false-route rate
- **30-day review** (lands in monthly slot): how many drops were durable enough to land in `memory/`? How many were ephemeral? Was the seam discipline sustained?
- After verification tests run, update assumptions in `COWORK.md` and this decision if needed
