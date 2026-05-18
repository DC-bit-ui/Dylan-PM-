# Shared growth memory — Claude session primer

You are reading this because a Claude session has been opened in or pointed at the **AgriProve shared-growth-memory bus**. This is the team's collective intelligence store — multiple Claude surfaces (Dylan's dashboard, Claudia's tool, Kieren's analyses, Apex on Cowork) read and write here.

## Always do, regardless of who you're running for

1. **Read the relevant instruction file before writing anything:**
   - `INTEGRATION-FOR-CLAUDIA.md` — if you're inside Claudia's Storm Boy Tool
   - `INSTRUCTIONS-FOR-KIEREN.md` — if you're running strategic / analysis work for Kieren
   - `README.md` — bus contract overview, applies to everyone
2. **Atomic writes only.** Always `<file>.tmp` then `rename`. Never write directly to the final filename — OneDrive sync exposes half-written files.
3. **PII-generalise** customer names, absolute revenue/ACCU/hectare figures, methodology code names. Ratios and category-level descriptors over absolutes. When unsure, over-strip.
4. **No new top-level folders without checking with Dylan.** The schema evolves through discussion, not silent expansion.
5. **No metered API calls for synthesis on behalf of the team.** Subscription compute only (Cowork-scheduled, Claude Code interactive, or claude.ai web). The `intelligence-bundles/` queue exists for offloading heavier work.

## When the user shares analysis output

If the user says something like "I've just analysed X" or shares a finding from a Claude conversation, default to asking:

> *"Want me to save the durable parts of this to the bus? If yes, I'll write a pattern file at `patterns/<date>-<slug>.md` per the instruction file."*

Don't auto-write without consent — but DO offer.

## Standard write targets

| Output kind | Path | Schema |
|---|---|---|
| Durable strategic / tactical finding | `patterns/<YYYY-MM-DD>-<slug>.md` | `schemas/pattern.md` |
| System error / preference / correction | `feedback/feedback-<id>.json` | `schemas/feedback.md` |
| Customer-specific intel (verbatim or distilled voice) | `customer-positions/contact-<id>.json` | `schemas/customer-position.md` |
| Deal-level signal | `deal-signals/deal-<id>.json` | `schemas/deal-signal.md` |
| Probe-outcome record | `probe-outcomes/probe-<id>.json` | `schemas/probe-outcome.md` |
| Heavy synthesis to queue for later | `intelligence-bundles/<id>.{md,json}` | `schemas/intelligence-bundle.md` |

## What to NOT write here

- HubSpot data (the dashboard reads it live — don't duplicate)
- Raw Granola transcripts (Apex handles those automatically)
- Drafts / private working notes (only outputs the team should benefit from)

## Contact

Bus is owned by Dylan (`dylan@agriprove.io`). Pull this file fresh before any major write — schema evolves.
