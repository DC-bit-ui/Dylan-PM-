# Integration: Granola

**Purpose:** primary source for meeting notes and transcripts.
**Direction:** read-only (this system reads from Granola; doesn't write back).
**Access:** via Claude connector / MCP — must be enabled in the active session.
**Status:** aspirational — connector setup TBD.

## When agents consult Granola
- Any time `meeting-synthesizer` is invoked without an explicit transcript drop in `inbox/`
- When `/recall` or `/brief` references a meeting Dylan had recently
- When `initiative-tracker` needs to verify a status change happened in a meeting
- When `stakeholder-comms` is drafting a follow-up after a meeting

## Where Granola data lands in this system
| Granola content | Lands at |
|---|---|
| Synthesized meeting note | `memory/deliverables/meetings/YYYY-MM-DD-<slug>.md` |
| Decisions surfaced in meeting | `memory/decisions/YYYY-MM-DD-<slug>.md` |
| New stakeholder mentions | `memory/people/roster.md` |
| Action items where Dylan owns | `workspace/current/actions.md` |
| Durable learnings | `memory/learnings/YYYY-MM/...` |

## Default behaviour for `meeting-synthesizer`
1. Try Granola first via the connector — query by date, attendees, or title
2. If unavailable, fall back to drops in `inbox/granola/`
3. If neither, fall back to general `inbox/` drops
4. If nothing, ask Dylan rather than fabricate

## Failure mode
- State explicitly: "Granola connector unavailable — falling back to inbox/."
- Do NOT generate plausible meeting content from memory of past meetings.

## Setup checklist (Dylan)
- [ ] Confirm Granola MCP/connector is configured in your Claude environment
- [ ] Confirm the connector exposes: list meetings, fetch transcript, fetch summary
- [ ] Test: ask Claude to "list my meetings from yesterday" — should hit Granola

## Privacy notes
- Transcripts can contain confidential customer / personal info — treat with care
- Don't commit raw transcripts to git; only synthesized notes
- Add `inbox/granola/` to `.gitignore` if raw drops accumulate
