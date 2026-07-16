# Playbook — Regenerating context packs (`packs/`)

Last-verified: 2026-07-16 · Review-by: 2026-10-14 · Verified-by: claude-code

Packs are **derivatives** of the core system for surfaces with no file access (claude.ai Projects, mobile). They are never edited directly — an edit belongs in `core/` or `memory/state/`, then the pack is regenerated. This prevents the pack drifting into a second source of truth.

## When to regenerate

- `memory/state/NOW.md` changed materially (strategy thread added/killed, epic set changed, org change), OR
- `core/IDENTITY.md` or `core/PRINCIPLES.md` changed, OR
- a pack's generation stamp is older than 14 days (the Apex Morning Briefing warns on this), OR
- Dylan asks.

## Procedure (any Claude with folder access — Cowork or Claude Code)

1. Read, in order: `core/IDENTITY.md`, `core/PRINCIPLES.md`, `memory/state/NOW.md`, `memory/state/rules.md`, `memory/business/glossary.md`.
2. Rebuild `packs/chat-core.md` with exactly these sections: Who you're working with · How to behave · Drafting as Dylan · Current state (dated, with an explicit stale-after date = generation date + 14 days) · Terms (one-line each, most-used only) · Hard rules (chat surface) · End-of-session capture block (keep the template verbatim).
3. Size discipline: chat-core stays under ~1,200 words of body. It is a briefing, not a mirror — compress, don't enumerate. Rules digest: include only rules that change how a chat session behaves (voice, positioning, drafting formats); omit connector/tooling rules (no connectors in chat).
4. Stamp the header: `Generated YYYY-MM-DD from core/ + memory/state/ — stale after YYYY-MM-DD`.
5. Commit (Tier 1, `[cowork] regenerate chat-core pack` or `[claude-code] …`).
6. Tell Dylan to replace the pack in his claude.ai Project(s) — the pack cannot update itself on the chat side.

## Optional second pack

`packs/chat-domain.md` (deep domain: full glossary + product capsules + customer personas) may be generated on demand for domain-heavy chat work, same procedure sourcing `memory/business/*`. Not maintained by default — generate when needed, same stamp rule.

## Weak-model check before committing

The pack must be executable with zero file access: no instruction may reference reading a repo path (the capture block names a path for DYLAN to paste into — that's the one exception). Every fact carries its as-of framing. If the pack tells the model to do something it can't do in chat, delete that instruction.
