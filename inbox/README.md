# inbox/

> Drop zone for raw inputs — meeting transcripts, voice memos pasted as text, customer emails, screenshots-as-text, anything Dylan wants Claude to process.

## How it flows

1. **Drop the raw content** here — any filename, no rules.
2. **Ask Claude to process it** — typically by invoking the `meeting-synthesizer` for meetings, or asking Claude what to do with it.
3. **The agent extracts** decisions, actions, learnings, stakeholder notes — files them into the right `memory/` location.
4. **The raw input gets moved** to `inbox/processed/YYYY-MM/` once ingested. Don't delete — it's your audit trail.

## Don't drop here
- Anything containing secrets / credentials / PII you wouldn't commit
- Final artifacts (those go straight to `memory/deliverables/`)
