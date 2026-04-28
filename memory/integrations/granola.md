# Integration: Granola — Meeting Transcripts

**Purpose:** Granola captures **all** of Dylan's meetings (standups, 1:1s, process alignment sessions, stakeholder meetings). Primary source for `meeting-synthesizer`.
**Direction:** read-only.
**Access:** via Granola MCP tool — must be enabled in active session.
**Status:** **operational**.

---

## MCP tools

All tools share prefix `mcp__6822ab7d-9ca1-41e0-b837-6faca8873afe__`:

| Tool | Input | Output |
|---|---|---|
| `list_meetings` | `{ time_range: "this_week" \| "last_week" \| "last_30_days" \| "custom" }` | XML-like text with `<meeting id="..." title="..." date="...">` |
| `query_granola_meetings` | `{ query: "natural language" }` | AI-synthesised answer with citation links |
| `get_meeting_transcript` | `{ meeting_id: "uuid" }` | Verbatim transcript |

⚠️ **Parsing gotcha:** `list_meetings` returns XML-like text. Regex parse: `/<meeting\s+id="([^"]+)"\s+title="([^"]+)"\s+date="([^"]+)">/g`

---

## Typical meetings to scan
- **Standups** — daily, with dev team (Cadel, Steve, Will)
- **Process alignment sessions** — Stormboy, Frontier
- **1:1s** — Kieren, Cadel, Will
- **PM check-ins** — with Steve Le Moenic
- **Stakeholder meetings** — ad-hoc

---

## When agents consult Granola

| Trigger | Approach |
|---|---|
| `meeting-synthesizer` invoked | Try Granola first via connector; fall back to inbox/granola/ then generic inbox/ |
| `/recall` references a meeting | `query_granola_meetings` with natural-language question |
| `initiative-tracker` checking for status changes | `query_granola_meetings` filtered to last 7 days |
| `stakeholder-comms` drafting follow-up | Pull transcript via `get_meeting_transcript` for direct quotes / commitments |

**Apex Morning Briefing** runs a 7-day Granola scan covering: open commitments, decisions needing follow-up, unresolved blockers, explicit Dylan commitments. Cross-references against Notion to catch slipping items (>3 days = priority bump).

---

## Where Granola data lands in this system

| Granola content | Lands at |
|---|---|
| Synthesized meeting note | `memory/deliverables/meetings/YYYY-MM-DD-<slug>.md` |
| Decisions surfaced | `memory/decisions/YYYY-MM-DD-<slug>.md` |
| New stakeholder mentions | `memory/people/roster.md` |
| Action items where Dylan owns | Notion (via Apex) or directly via `meeting-synthesizer` |
| Durable learnings | `memory/learnings/YYYY-MM/...` |

Don't copy verbatim transcripts to git — synthesize.

---

## Failure mode
- Granola unavailable → state explicitly. Fall back to:
  1. `inbox/granola/` drops
  2. Generic `inbox/` drops
  3. Pasted transcript in conversation
- **Never fabricate meeting content from memory.**

---

## Privacy notes
- Transcripts can contain confidential customer / personal info — handle with care.
- Don't commit raw transcripts to git; only synthesised notes.
- `inbox/granola/` should be in `.gitignore` if raw drops accumulate (already handled by current `.gitignore`).
