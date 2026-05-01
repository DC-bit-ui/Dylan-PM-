# Integrations Index

> One file per external system this Claude OS reads from or writes to. Each file documents the contract: what flows in, what flows out, where it lands, and what to do if the connector is unavailable.

> **Rule:** if it's not in this index, agents shouldn't claim live data from it.

**Last updated:** 2026-04-29 — added `cowork/` subdirectory for Apex prompt snapshots; flagged stale fields in `cowork.md`

---

## Connectors

| System | Purpose | Direction | Status | File |
|---|---|---|---|---|
| **Cowork (Apex)** | Daily orchestration; runs Morning Briefing + EOD Reconciliation + Command Center | bidirectional (Apex writes to Notion/Jira; Cowork writes back to `memory/` per [`/COWORK.md`](../../COWORK.md)) | operational; bootstrap complete 2026-04-29 | `cowork.md` (contract) + [`cowork/`](cowork/) (artifacts: prompt snapshots, diagnostics) |
| **Notion** | Personal workstack ("Work Priorities" DB) | read primary; write rare | operational | `notion.md` |
| **Jira** | Team workstack — AgriProve cloud | read primary; write via Apex | operational | `jira.md` |
| **Granola** | Meeting notes & transcripts | read | operational | `granola.md` |
| **Microsoft Teams** | Chat (channel monitoring not yet wired) | read | operational | `teams.md` |
| **Outlook** | Email + calendar | read; draft | operational | `outlook.md` |
| **HubSpot** | CRM, customer signals | read | available, not validated | `hubspot.md` |
| **Confluence** | Long-form docs | read; write rare | available, not validated | `confluence.md` |

## External skill packs (live in Cowork — not copied here)
| Skill | Domain | File documenting |
|---|---|---|
| `agriprove-pm` | PM workflow, PRD, Jira conventions | `external-skills.md` |
| `agriprove-backend` | System architecture, feasibility | `external-skills.md` |
| `agriprove-design` | Design system, Chakra, Magic Patterns | `external-skills.md` |
| `soil-carbon-audit` | ERF project audit | `external-skills.md` |
| `soil-carbon-batch-audit` | Portfolio batch audit | `external-skills.md` |
| `internal-comms` | Status reports, leadership updates | `external-skills.md` |

---

## Default integration shape (every new system follows this)

1. **Inbound:** writes to `inbox/<source>/` (raw) or directly to Notion / `memory/initiatives/<slug>.md` (structured)
2. **Outbound:** reads from named, stable paths in `memory/`
3. **Contract:** documented in this directory, one file per system
4. **Failure mode:** agent states explicitly when connector is unavailable; falls back to inbox drops; never fabricates

---

## Authoritative source-of-truth map

| Domain | Source of truth | Confirmed |
|---|---|---|
| Dylan's personal tasks | Notion "Work Priorities" DB | ✅ |
| Team delivery / engineering | Jira AP project | ✅ |
| Meeting content | Granola | ✅ |
| Strategic memory (decisions, retros, learnings, briefs) | this repo `memory/` | ✅ |
| Long-form documentation | Confluence | ✅ |
| Customer / CRM | HubSpot | ✅ |
| Async team comms | Teams | ✅ |
| Email + calendar | Outlook | ✅ |

When a fact is sourced live, name the system. When sourced from a snapshot (`memory/...`), name the file + last-updated.
