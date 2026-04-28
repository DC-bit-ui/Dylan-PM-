# Learning: Claude's multi-surface architecture in 2026 — and the seam pattern that addresses it

**Date:** 2026-04-28
**Source:** Researcher subagent commissioned this session in response to Dylan's question; full synthesis in transcript. Decision logged: `memory/decisions/2026-04-28-multi-surface-strategy.md`.

---

## What Dylan asked

"What is your suggestion for insights gathered from chat that could relate to this personalisation? Or should we start operating only out of cowork? Please do deep research into how to most effectively utilise the system as that is the very motivation of this initiative."

## The headline finding

**There is no unified Anthropic memory across surfaces.** Three separate memory systems with no bridge:

| System | Surfaces | Reachable from |
|---|---|---|
| Chat memory (March 2026 feature) | claude.ai web, Claude Desktop, Claude mobile | Each other only |
| Cowork Project memory | Cowork sessions in a Project | That Project only |
| Claude Code local memory | `~/.claude/projects/<>/memory/` | That machine only |

claude.ai cannot write to local filesystem. There is no API to read claude.ai conversation history programmatically. Dispatch and Remote Control bridge **execution** between mobile and Cowork, not memory.

The architecture Dylan has built (`memory/` repo + Cowork filesystem connection) is the **industry-documented workaround** for the lack of cross-surface memory in 2026. Multiple practitioner guides explicitly recommend "context files as a substitute for cross-surface memory."

## Surface map (April 2026 state)

- **Cowork (desktop)** — sandboxed VM with filesystem access, connectors, skills, scheduled tasks. Where Apex runs.
- **claude.ai (web)** — chat with Projects, chat memory (auto-summarising every ~24h since March 2026), no filesystem
- **Claude mobile** — same chat memory as web; serves as remote control terminal for Dispatch
- **Claude Code (CLI)** — local memory (CLAUDE.md + Auto Memory at `~/.claude/projects/<project>/memory/`); per-machine
- **Claude Code on the web** (claude.ai/code) — cloud-hosted Claude Code execution; no local file access
- **Remote Control** (research preview, Feb 2026) — runs Claude Code on local machine, accessible from claude.ai/code or Claude mobile; chat + tool results via TLS, files stay local
- **API / Managed Agents** (beta, April 23 2026) — workspace-scoped file-based memory stores, fully API-accessible; developer primitive only

## Three load-bearing facts that drove the recommendation

1. **No automated sync path between claude.ai chat history and any local file system.** No API. No webhook. No export-to-folder. Any sync would be fragile and high-effort.
2. **Cowork and claude.ai are "separate environments"** per third-party documentation (Anthropic docs are silent on this directly).
3. **Sophisticated practitioners use the exact pattern Dylan has built.** Context files in a Git repo, connected to Cowork as the engineered memory layer; chat memory and Project memory left as their default lightweight selves.

## The decision

Don't consolidate to Cowork-only. Three-mode pattern:

| Surface | Treat as | Capture |
|---|---|---|
| Cowork (desktop) | Engineered memory | Direct write to `memory/` |
| Claude Code (CLI) | Engineered memory | Direct write to `memory/` |
| claude.ai web | Whiteboard | Capture template → `inbox/cowork/` |
| Claude mobile | Whiteboard + Dispatch when durable | Capture template OR Dispatch |

Bridged by `inbox/cowork/` and a new skill, `/inbox-process`.

## Three open verification tests

These are under-documented points where Anthropic docs are silent and third-party sources conflict. Worth a 5-minute test once Cowork is live:

1. **Does Cowork inherit claude.ai global chat memory?**
   - Test: in a Cowork session, ask "what do you remember about me from previous Claude conversations?"
   - Expected: only repo content (chat memory not accessible)
   - If different: useful surprise — chat memory becomes a low-friction onboarding signal for Cowork

2. **Does Cowork Project memory persist across sessions independent of `memory/` files?**
   - Test: Session 1 — "remember that I prefer X". Session 2 in same Project — "what's my preference on X?"
   - Expected: yes, Cowork has its own per-Project memory layer
   - Documents what Cowork's native memory adds beyond the engineered `memory/`

3. **Are claude.ai Projects and Cowork Projects the same data store?**
   - Test: create a test Project in Cowork; check claude.ai web Projects list
   - Expected: no — UI conventions shared, data stores separate
   - Confirms the architectural assumption that Cowork Projects are local-only

Results land in a follow-up learning entry. If any answer differs from assumption, the decision and `COWORK.md` get Tier 2 updates.

## What Dylan probably didn't know about Claude in 2026

- **Chat memory is on by default** for all paid plans since March 2026 — accumulates context about Dylan as a person across claude.ai and mobile sessions. Does NOT replace `memory/`, but worth checking at claude.ai → Settings → Capabilities → Memory and seeding once.
- **Memory import/export** is a feature — JSON/markdown export from Settings → Capabilities, importable elsewhere. Cross-provider migration was the design intent; could be repurposed for occasional batch review of accumulated chat memory.
- **Dispatch** (Pro/Max) — mobile → Cowork session on the Windows machine. Direct write to `memory/` from mobile-initiated work, no manual paste needed.
- **Managed Agents memory store API** (beta) — for any future custom-built integration that needs cross-session memory accessible programmatically.

## Implementation in this PR

- **Decision:** `memory/decisions/2026-04-28-multi-surface-strategy.md` — anchor
- **Playbook:** `playbooks/multi-surface-capture.md` — three-mode pattern + capture template + Dispatch usage + verification tests
- **Skill:** `.claude/skills/inbox-process/SKILL.md` — routes `inbox/cowork/` drops to `memory/` per CLAUDE.md §10 routing rules; runs as part of Apex Morning Briefing or on demand
- **Inbox setup:** `inbox/cowork/README.md` — describes the landing zone and its expected lifecycle
- **CLAUDE.md §15** — short callout pointing at the decision + playbook

## What I'd watch

- **Inbox volume per week** — is the seam being used? Empty for weeks could mean either no durable claude.ai sessions (fine) or capture discipline isn't sticking (gap).
- **Routing accuracy** — checkbox-driven routing is only as good as the checkboxes; track override rate
- **30-day review** (lands in monthly slot per cadence decision): are routed entries actually useful in `memory/` after a sweep? If they're consistently noise, raise the durability bar in the capture template prompt

## Sources (full list)

- [Claude chat memory (March 2026)](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- [Memory import/export](https://support.claude.com/en/articles/12123587-import-and-export-your-memory-from-claude)
- [Claude Code memory docs](https://code.claude.com/docs/en/memory)
- [Claude Code Remote Control / Dispatch](https://code.claude.com/docs/en/remote-control)
- [Managed Agents memory API](https://platform.claude.com/docs/en/managed-agents/memory)
- [Anthropic Cowork product page](https://www.anthropic.com/product/claude-cowork)
- [Cowork vs claude.ai comparison](https://www.jamout.ai/blog/claude-cowork-vs-claude-chat-which-one-to-use-for-what-and-do-they-talk-to-each-other)
- [Cowork power-user guide 2026](https://karozieminski.substack.com/p/claude-cowork-guide-plugins-memory-sub-agents-tips)
- [Claude data export](https://support.claude.com/en/articles/9450526-how-can-i-export-my-claude-data)

## Related
- Decision: `memory/decisions/2026-04-28-multi-surface-strategy.md`
- Playbook: `playbooks/multi-surface-capture.md`
- Skill: `.claude/skills/inbox-process/SKILL.md`
