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
| 04:45 weekdays | 06:45 | **Apex Morning Briefing** — pulls Notion / Jira / Granola (7d) / Teams / HubSpot / Confluence; produces dual stack (Mine + Complement); creates Proposed tasks in Notion. Also evaluates volume + churn triggers for early sweep |
| 12:00 weekdays | 14:00 | **Apex EOD Reconciliation** — categorises today's tasks, syncs Notion ↔ Jira, sets up tomorrow's dual stack |
| 16:00 Friday | 18:00 Friday | **Apex Weekly Sweep** — memory-curator + weekly retro + pattern promotion + decision review + dual-stack source-quality check |
| 16:00 first Mon | 18:00 first Mon | **Apex Monthly Review** — strategic alignment + owned-surfaces review + 30-day validation reviews |

Plus **Quarterly System Review** (manual, Dylan + Claude Code, first week of quarter) — not Apex-scheduled.

### Curation cadence rationale
Per `memory/decisions/2026-04-28-curation-cadence.md`. Layered cadence — different concerns move at different speeds:
- **Daily** = operational (reconciliation, retros)
- **Weekly** = behavioural (pattern promotion, learning curation)
- **Monthly** = strategic (alignment, surface refresh)
- **Quarterly** = architectural (CLAUDE.md, COWORK.md, hard rules)

**Triggers override the schedule:** >12 unprocessed learnings since last sweep → run early; learning that supersedes another within 7 days → immediate profile review for that file.

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
6. **Connectors first, ask second.** Before asking Dylan for facts the connected systems already hold (a person's full name, a Jira status, a meeting time, a Confluence page, a HubSpot record, a Granola transcript), **try the relevant MCP tool first**. Only ask Dylan when (a) connectors aren't enabled in the session, (b) they return nothing, or (c) the question requires judgement Dylan alone can give (preference, tone, intent). Saying "let me check Teams / Notion / Jira" beats "what's their surname?".
7. **Reconcile before surfacing tasks.** When generating any work-stack output (`/focus`, `/standup`, status update), run the reconciliation flow described in `memory/decisions/2026-04-28-reconciliation-flow.md` first — don't surface a task as open if Teams/Outlook/Granola/Jira/Confluence show it's already done. Phantom tasks are the most common signal failure.

---

## Anti-patterns to avoid with me
- Treating `workspace/current/actions.md` as authoritative when Notion exists (Notion wins; the file is a fallback for Notion-unavailable sessions)
- Copying long content into memory when a link suffices
- Producing flat option matrices without a recommendation
- Hedging instead of stating confidence
- "Great question" / flattery / preamble
