# Integration: cowork

**Purpose:** cowork is Dylan's separate work environment that has visibility across his connected systems and can produce summaries.
**Direction:** primarily inbound — cowork generates outputs that this system consumes.
**Access:** out-of-process; cowork does its own thing and drops results here.
**Status:** aspirational — exact contract TBD with Dylan.

## What cowork is (Dylan to confirm)
> _Open question: is cowork (a) Claude Code on the web with connectors, (b) a separate internal tool, (c) something else? Definition matters because it determines whether cowork can read/write this repo directly or only via drops._

## What cowork produces (per Dylan, 2026-04-28)
- **Summary of his connected systems** — likely a cross-cut of Granola / Notion / Jira / Outlook / Teams in one place
- **Worktask prioritisation** output (from earlier in this session)

## How cowork outputs reach this system
**Default pattern:** cowork writes to `inbox/cowork/YYYY-MM-DD-<topic>.md`. This Claude session ingests and routes:
| cowork output | Routed to |
|---|---|
| System-wide summary | `workspace/current/cowork-summary-<date>.md` (referenced by `/focus`) |
| Prioritised tasks | `workspace/current/actions.md` (with `source: cowork` frontmatter) |
| Initiative status changes | `memory/initiatives/<slug>.md` `Recent changes` |
| Cross-system patterns | `memory/learnings/...` if durable |

## Output schema cowork should emit (proposed)
```yaml
---
source: cowork
generated: <YYYY-MM-DDTHH:MM>
covers: [granola, notion, jira, outlook, teams]
period: <window>
---

# <Title>

## Summary
<3-5 lines>

## By system
### Granola
- <bullets>
### Notion
- <bullets>
... etc

## Prioritised actions
- [ ] <action> — source: <system> — link: <url>

## Status changes
- <initiative-slug>: <change>

## Decisions surfaced
- <decision> — source: <system>
```

## What cowork should read from this system
- `memory/business/strategy.md` — to weight tasks against OKRs
- `memory/initiatives/INDEX.md` — to know what initiatives exist
- `memory/profile/decision-frameworks.md` — to understand Dylan's prioritisation lens

## Failure mode
- If cowork hasn't dropped recently, this system doesn't pretend to have a summary
- Stale cowork drops (>7 days) flagged by `memory-curator` during sweeps

## Setup checklist (Dylan)
- [ ] Confirm what cowork actually is
- [ ] Have cowork produce its first systems summary, drop in `inbox/cowork/`
- [ ] Confirm output schema (above is a proposal — Dylan to adjust)
- [ ] Set drop cadence (daily? weekly? on-demand?)
