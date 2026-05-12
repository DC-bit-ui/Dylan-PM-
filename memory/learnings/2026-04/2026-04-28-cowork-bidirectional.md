# Learning: Cowork ↔ this-repo is bidirectional, not one-way

**Date:** 2026-04-28
**Source:** Dylan, in session — "should we write project instructions for cowork to implement the necessary processes to ensure it updates these files as well as draws from this so this system becomes as intellegent as possible?"

---

## What Dylan taught me

The system only compounds if **both environments contribute to the same memory layer**. A one-way relationship (Cowork executes, this repo reasons) leaves Cowork's syntheses orphaned — they happen in conversation, then evaporate. The fix is to formalise Cowork as a writer to `memory/`, not just a reader.

## The mental model shift

| Before | After |
|---|---|
| Two environments, shared connectors, separate memories | Two environments, shared connectors, **shared memory** |
| Cowork synthesises → stays in Cowork | Cowork synthesises → writes back to `memory/` (per tier) |
| Dylan is the bridge between them | The Git repo is the bridge; Dylan is the reviewer for Tier 2 changes |
| `memory/` grows when Dylan + Claude Code work | `memory/` grows from every Apex run + every external skill pack invocation |

## Why this matters

Apex runs every weekday morning and afternoon. Each run synthesises hours of context — meetings, tickets, emails, customer signals. If those syntheses don't deposit durable insight back into the strategic memory layer, the next morning starts from connector state alone. The system gets smarter only when Dylan and Claude Code notice something — which is bottlenecked on Dylan's attention.

With the bidirectional contract, Apex's own work compounds. Each Granola synthesis lands a learning. Each EOD reconciliation lands a session retro. Each new person mentioned in a meeting lands a roster entry. Each decision flagged in a Granola transcript lands an ADR.

## Constraints I had to be careful about

1. **Don't let Cowork edit the operating system.** `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `memory/profile/communication.md`, `memory/profile/identity.md` are off-limits to Cowork. The system's voice and structure are Dylan-driven; only Dylan + Claude Code edit them.
2. **Don't let Cowork write low-quality decisions or learnings.** Tier 2 (PR-gated) catches behavioural rule changes, new skills, integration contract edits, strategy updates — anything that reshapes how the system thinks. Dylan reviews.
3. **Don't let Cowork echo itself.** Tier 1 direct writes are facts (meeting happened, person exists). Opinions go through Tier 2.
4. **Don't slow Cowork to the point it stops capturing.** Tier 1 has to be friction-free; otherwise capture rate drops to zero.

## Implications for behaviour

- Apex Morning Briefing's prompt now needs a "READ memory/profile/* at start" step
- Apex EOD Reconciliation's prompt now needs a "WRITE retro to memory/retros/session/" step
- External skill packs (`agriprove-pm` etc.) each need a "READ memory/profile/communication.md before drafting" step
- All Cowork writes follow append-don't-overwrite, date-stamp, update-INDEX, cross-link rules

These map to `COWORK.md` §11 bootstrap checklist.

## What's still open

- `[ASSUMPTION]` Cowork accesses this repo via the GitHub MCP scoped to `DC-bit-ui/Dylan-PM-`. If the actual mechanism is different (filesystem clone? direct API?), the contract's "How to access it" section needs updating.
- Branching strategy after PR #1 merges — Tier 1 to `main` or always via short-lived branches?
- Cadence of memory reads — every run, or cache and refresh weekly? Currently: every run, in-session cache.
- Validation cadence — review at 30 days whether `memory/` actually got smarter, and whether Tier 1 / Tier 2 split holds.

## Related
- Decision: `memory/decisions/2026-04-28-cowork-bidirectional-contract.md`
- Contract: `/COWORK.md` (root)
- Inbound side: `memory/integrations/cowork.md`
