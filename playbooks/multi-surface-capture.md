# Playbook: Multi-surface capture — getting insights from claude.ai / mobile back into `memory/`

**Purpose:** Practical guide for the three-mode Claude usage pattern, and the seam that bridges ad-hoc surfaces into the engineered memory system.
**Anchor decision:** [`memory/decisions/2026-04-28-multi-surface-strategy.md`](../memory/decisions/2026-04-28-multi-surface-strategy.md)
**When to use:** any time Dylan has a useful conversation outside Cowork or Claude Code that produced something durable.

---

## The three-mode pattern (one-line summary)

| Surface | Treat as | Capture |
|---|---|---|
| Cowork (desktop) | Engineered memory | Direct write to `memory/` |
| Claude Code (CLI) | Engineered memory | Direct write to `memory/` |
| claude.ai web | Whiteboard | Capture template → `inbox/cowork/` |
| Claude mobile | Whiteboard + Dispatch when needed | Capture template → `inbox/cowork/` OR Dispatch → Cowork |

**Rule of thumb:** if you'd want a new version of Claude to know it on day one, it belongs in `memory/`. If it's a one-off lookup or shower-thought, let it go.

---

## The capture template

Use this at the end of a claude.ai or mobile session when something durable surfaced. **Paste this prompt into the chat:**

```
Summarise the durable insight from this conversation in the format below.
Only include what I'd want a new version of Claude to know on day one — not
recap of the conversation itself. If nothing durable surfaced, say so and
stop.

# Insight from claude.ai chat — <today's date YYYY-MM-DD>
**Source:** claude.ai web | Claude mobile
**Topic:** <one-line what this was about>

## Durable insights (3 bullets max)
- <fact, preference, decision, or learning>
- <…>
- <…>

## Suggested routing (check one or more)
- [ ] Decision → memory/decisions/
- [ ] Learning → memory/learnings/
- [ ] Person fact → memory/people/roster.md
- [ ] Profile/preference → memory/profile/
- [ ] Business fact → memory/business/
- [ ] Initiative state → memory/initiatives/
- [ ] None — ephemeral, can discard

## Source context
- Date/time: <when>
- Why it came up: <one line>
```

Copy the response. When back at the desk, save to `inbox/cowork/<YYYY-MM-DD>-<topic-slug>.md`.

The next Apex Morning Briefing (or a manual `/inbox-process` invocation) will read it, route it per the checked boxes, commit the routed entry, and either delete the inbox file or archive it to `inbox/processed/`.

---

## When to use Dispatch instead

If Dylan is on mobile and the work is **known durable** (drafting a brief, working through a decision, processing a meeting), use Dispatch (Pro/Max) rather than the capture template. Dispatch fires a Cowork session on the Windows machine — that session has filesystem access and can write to `memory/` directly via Tier 1 / Tier 2.

Dispatch use cases:
- "Draft a stakeholder update on Frontier progress"
- "Add a learning that <X>"
- "Process this Granola transcript"

Capture-template use cases:
- "Quick question — how do I think about X?"
- "Help me reason through Y" (where Y might or might not be durable)
- Exploratory chat that turns out to have surfaced something

When in doubt, capture template — it's lower commitment.

---

## Setting up `inbox/cowork/`

Already exists in the repo. Check:

```
ls inbox/cowork/
```

If empty, that's correct — it's the landing zone, not a populated directory. The `INDEX.md` (if present) tracks namespaces (`granola/`, `cowork/`, `adhoc/`).

For ad-hoc claude.ai/mobile drops, use the namespace `inbox/cowork/` (not a separate `inbox/adhoc/` — keep one bridging surface, not many).

---

## What `/inbox-process` does

(Skill at `.claude/skills/inbox-process/SKILL.md`.)

1. Scans `inbox/cowork/` for unprocessed `.md` files
2. For each file, parses the routing checkboxes + content
3. Routes per the rules in CLAUDE.md §10:
   - Decisions → `memory/decisions/<date>-<slug>.md` + INDEX update
   - Learnings → `memory/learnings/<month>/<date>-<slug>.md` + INDEX update
   - Person facts → append to `memory/people/roster.md` under the person's section
   - Profile/preferences → propose Tier 2 PR to `memory/profile/working-style.md` (never auto-edit `communication.md` or `identity.md` — those are Tier 3)
   - Business facts → append to relevant `memory/business/<file>.md`
   - Initiative state → update `memory/initiatives/<file>.md`
4. Commits the routed entry (Tier 1) or opens a PR (Tier 2)
5. Moves the inbox file to `inbox/processed/<YYYY-MM-DD>/`
6. Outputs a summary of what was routed where

`/inbox-process` runs:
- **As part of Apex Morning Briefing** (auto, weekdays 04:45 SAST)
- **On demand** when Dylan says "process inbox" or `/inbox-process`

---

## Claude chat memory — the lightweight sibling

claude.ai web/Desktop/mobile have their own auto-summarising chat memory (since March 2026). It accumulates context about Dylan as a person — preferences, recurring topics, writing style. **This is separate from `memory/`** and not accessible to Cowork or Claude Code, but it does give low-friction continuity across claude.ai/mobile sessions.

One-time setup:
1. Visit **claude.ai → Settings → Capabilities → Memory**
2. Confirm it's enabled
3. Skim what it's already remembered
4. Seed if useful: "Remember that I'm a PM at AgriProve, I prefer direct push-back, no flattery, and short answers unless depth is needed"

This is NOT a substitute for `memory/`. Use it for casual continuity in claude.ai/mobile; use `memory/` for the engineered system.

---

## Three things to verify when Cowork is live

From the research underlying the anchor decision — these are under-documented points worth confirming directly:

1. **Does Cowork inherit claude.ai chat memory?**
   In a Cowork session: "what do you remember about me from previous Claude conversations?" Expected: only repo content. If it pulls chat memory, useful surprise.

2. **Does Cowork Project memory persist independently of `memory/` files?**
   Session 1: "remember that I prefer X". Session 2 in same Project: "what's my preference on X?". Documents what Cowork's own memory adds.

3. **Are claude.ai Projects and Cowork Projects the same data store?**
   Create a test Project in Cowork; check claude.ai web. Likely no — confirm.

Results → learning entry. If anything is different from assumed, this playbook + the anchor decision get Tier 2 updates.

---

## Anti-patterns

- **Building a sync mechanism between claude.ai and `memory/`.** No API exists; would be fragile.
- **Treating chat memory as durable.** It's not — auto-summarises every ~24h, reachable only from claude.ai/Desktop/mobile.
- **Capturing every chat.** Most don't need to compound. The discipline is filtering, not exhaustive capture.
- **Dropping into `inbox/cowork/` without the routing checkboxes.** `/inbox-process` will still try to route it but accuracy drops.
- **Using Dispatch for exploratory chat.** Dispatch costs more (full Cowork session) and writes to `memory/` — wrong tool for "I'm not sure if this matters yet".

---

## Sources behind this playbook

Synthesised from research conducted 2026-04-28; full citations in `memory/learnings/2026-04/2026-04-28-multi-surface-research.md`. Key references:

- [Claude chat memory help article](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- [Claude Code Remote Control / Dispatch docs](https://code.claude.com/docs/en/remote-control)
- [Memory import/export](https://support.claude.com/en/articles/12123587-import-and-export-your-memory-from-claude)
- [Anthropic Cowork product page](https://www.anthropic.com/product/claude-cowork)
