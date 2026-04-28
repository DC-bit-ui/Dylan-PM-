# Working Style — Dylan

**Last updated:** 2026-04-28 (populated from Cowork handoff)

---

## Defaults Claude should assume
- **Response length:** depth over brevity — see `communication.md`
- **Format:** structured (bullets, tables, code/diff blocks where useful) over prose-only
- **Tone:** direct, curious, collaborative; no flattery
- **Hedging tolerance:** low — make a call, then state confidence

---

## How Dylan thinks
- Frameworks Dylan reaches for: **JTBD** (Job Stories), **Shape Up** (appetite), **P0–P3** (prioritisation; see `decision-frameworks.md`)
- PRD format: Lean Core + Design Appendix
- Bias: action where the path is clear; rigorous discovery where it isn't

---

## Daily / weekly rhythm

### Apex schedule (automated)
| Time (SAST) | Time (AEST) | What runs |
|---|---|---|
| 04:45 weekdays | 06:45 | **Apex Morning Briefing** — pulls from Notion / Jira / Granola (7-day window) / Teams / HubSpot / Confluence; creates Proposed tasks in Notion |
| 12:00 weekdays | 14:00 | **Apex EOD Reconciliation** — categorises today's tasks, syncs Notion ↔ Jira, sets up tomorrow |

### Dylan's working window
- SAST hours overlap with **end of Australian workday** — morning catches the day's late updates
- Async-first by necessity (8-hour gap)
- Key sync points: standups, process alignment sessions, 1:1s with Kieren / Cadel / Will

---

## Tools I use (connected systems)

| System | Used for | Authoritative for | Integration contract |
|---|---|---|---|
| **Notion** | Personal workstack ("Work Priorities" DB) | Dylan's tasks (canonical) | `memory/integrations/notion.md` |
| **Jira** | Team workstack — AgriProve cloud | Team delivery (canonical) | `memory/integrations/jira.md` |
| **Granola** | Meeting transcripts | Meeting source-of-truth | `memory/integrations/granola.md` |
| **Microsoft Teams** | Chat & channel updates | Async team comms | `memory/integrations/teams.md` |
| **Outlook** | Email + calendar | Stakeholder threads | `memory/integrations/outlook.md` |
| **HubSpot** | CRM, customer signals | Sales / customer state | `memory/integrations/hubspot.md` |
| **Confluence** | Documentation | Long-form docs (AgriProve) | `memory/integrations/confluence.md` |
| **Cowork (Apex)** | Orchestration — runs Morning Briefing, EOD Reconciliation, Command Center | Cross-system summary | `memory/integrations/cowork.md` |

External skill packs in active use (live in Cowork, **not** this repo): `agriprove-pm`, `agriprove-backend`, `agriprove-design`, `soil-carbon-audit`, `soil-carbon-batch-audit`, `internal-comms`. See `memory/integrations/external-skills.md`.

---

## How I want Claude to behave (this Claude Code repo specifically)

1. **Read context first.** Profile + relevant business + relevant initiative file before drafting.
2. **Default to drafting.** Don't interview before producing v1; use `[ASSUMPTION]` markers.
3. **Cite memory files** when grounding a claim (path + line).
4. **Distinguish live vs cached.** When using Notion/Jira/Granola data, say whether it came live (via MCP this session) or from a `memory/` snapshot.
5. **Don't duplicate Notion.** Tasks live in Notion; this repo holds strategic memory, decisions, deliverables, retros, and reasoning.

---

## Anti-patterns to avoid with me
- Treating `workspace/current/actions.md` as authoritative when Notion exists (Notion wins; the file is a fallback for Notion-unavailable sessions)
- Copying long content into memory when a link suffices
- Producing flat option matrices without a recommendation
- Hedging instead of stating confidence
- "Great question" / flattery / preamble
