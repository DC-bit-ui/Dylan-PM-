# inbox/

> Drop zone for raw inputs — meeting transcripts, voice memos pasted as text, customer emails, screenshots-as-text, anything Dylan wants Claude to process.

## How it flows

1. **Drop the raw content** here — namespaced by source if you know it: `inbox/granola/...`, `inbox/notion/...`, `inbox/cowork/...`. Generic drops go in the root.
2. **Ask Claude to process it** — typically by invoking the `meeting-synthesizer` for meetings, or asking Claude what to do with it.
3. **The agent extracts** decisions, actions, learnings, stakeholder notes — files them into the right `memory/` location.
4. **The raw input gets moved** to `inbox/processed/YYYY-MM/` once ingested. Don't delete — it's your audit trail.

## Standard subdirectories

| Path | What goes here | Contract |
|---|---|---|
| `inbox/granola/` | Granola exports (manual or fallback) | `memory/integrations/granola.md` |
| `inbox/notion/` | Notion content (manual or fallback) | `memory/integrations/notion.md` |
| `inbox/jira/` | Jira exports / ticket dumps | `memory/integrations/jira.md` |
| `inbox/outlook/` | Forwarded / pasted emails | `memory/integrations/outlook.md` |
| `inbox/teams/` | Teams thread copies | `memory/integrations/teams.md` |
| `inbox/cowork/` | cowork-generated summaries | `memory/integrations/cowork.md` |
| `inbox/processed/YYYY-MM/` | Auto-moved after ingest | (audit trail) |

## Don't drop here
- Anything containing secrets / credentials / PII you wouldn't commit
- Final artifacts (those go straight to `memory/deliverables/`)
