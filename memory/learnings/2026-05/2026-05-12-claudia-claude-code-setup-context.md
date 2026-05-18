# 2026-05-12 — Claudia's Claude Code setup + parallel automations context

## Source
Granola: `b9d7103b-0481-4136-ae1c-502d034d8767` ("Claudia sync up on Claude Code automation", 2026-05-12 14:34 AEST). Quick chat before she had to run.

## What Claudia is already doing that we need to coordinate with

1. **ACORE transcript scraping pipeline is operational.** She is already pulling call transcripts from Confluence and analysing them in her tool. This is the same source the dashboard's `coaching/cache/hobbs-calls-distillates.json` came from. **Risk of duplication** — both systems analysing the same transcripts independently.

2. **Her analysis runs every 2 days (not daily).** Cadence choice driven by token economics. Worth aligning the dashboard's scheduler choice with this — currently daily, could potentially align without losing signal.

3. **She's pulling out "trends" from transcripts on her side.** Doesn't currently surface what format these land in. Could be a parallel `team-brain/`-style output that should consolidate with ours.

## Her stated #1 priority is token efficiency

> "Token efficiency is the absolute priority."

The shared Claude API subscription is **$20/month**. She's being strict with guardrails on her side. Three concrete implications for our integration:

- **The bus reads must be cheap.** They are — file-system reads, no API calls.
- **The `/ask-team` skill must use prompt caching.** Already specified in the skill template. The 30K-token brain in a `cache_control: ephemeral` block means 10% pricing on subsequent turns within 5 min.
- **The nightly batch cost on our side ($0.25/day) is something to disclose** in the briefing so she knows what the dashboard is consuming vs what her tool's budget covers.

## Long-term landing zone — the "vibe zone" (Dylan-raised, not Claudia)

**Correction (2026-05-13):** Dylan raised the "vibe zone" as a possible landing surface for the dashboard, not Claudia about her tool. The transcript fragments made attribution unclear in the first read. The vibe zone is somewhere inside the AgriProve platform that Dylan would target if the dashboard moves from standalone-tool toward in-product surface. Claudia's tool is a different shape (in-flow rep workflow) and would not necessarily go to the same place.

**Action:** treat as an internal Dylan question, not a Claudia ask.

## The "shared place" decision

She and Dylan didn't land on SharePoint vs Confluence in this call. Dylan tabled SharePoint; Claudia didn't object. The runbook now exists at `briefings/bus-sharepoint-move-runbook.md` proposing SharePoint specifically. Decision should be ratified Wednesday.

## The `/Agriproof backend` skill reference (Dylan → Claudia)

**Correction (2026-05-13):** Dylan pointed Claudia at the AgriProve backend skill `/Agriproof backend`, not the other way around. The dashboard hasn't yet consumed those schema definitions. Worth comparing what each system maps to avoid duplicate definitions of the same HubSpot fields.

**Action:** Read the skill source, see what schemas it defines, and reference them in the dashboard's code paths rather than defining ad-hoc.

## What Dylan said to her about the system's goals

Verbatim from the transcript (Dylan's side captured):

- *"Digitizing Hobbs's approach. And then hybridizing it with like, okay how do each of the growth members approach the conversation styles, what's resonating with people."*
- *"What I would like to set up is that we have essentially like a learning repository where both systems can write to that and draw on it."*
- *"The one with like your side being more the cold outreach and then this being like our entire sales process."*

This matches the two-motion framing we already have in `shared-growth-memory/sales-motion-separation.md` — Storm Boy (cold outreach) on her side, Engaged Pipeline (full funnel) on the dashboard. The shared substrate is the brain + bus.

## The explicit collaboration ask

> *"Let's sync up more because we're both working on automations. I want to make sure that we're not doubling up work."*

This is the most operationally important line. Claudia is explicitly worried about duplication. The briefing needs to address:

1. What does the dashboard write that Claudia's tool reads (✓ team-brain + queues + patterns)
2. What does Claudia's tool write that the dashboard reads (✓ patterns + customer-positions + probe-outcomes per the schemas)
3. What does each system NOT do, to make boundaries clear

Currently the briefing is heavy on (1), light on (2) and (3). The Wednesday catch-up should land specifically on dividing the work.

## What I'm doing about this in the briefing

Updating `to-claudia-system-context-2026-05-13-update.md` with:

- Acknowledgement of her ACORE pipeline + the duplication risk
- Explicit "what each system writes/reads, what neither does" table
- Token-economics disclosure (our daily $0.25 cost)
- Open question about the vibe zone
- Reference to the `/Agriproof backend` skill

## Cross-references

- `stormboy-tracker/briefings/to-claudia-system-context.md` (original briefing, 2026-05-11)
- `stormboy-tracker/briefings/to-claudia-system-context-2026-05-13-update.md` (current update)
- `stormboy-tracker/briefings/bus-sharepoint-move-runbook.md` (the move plan)
- Granola: `df155d74-936f-40c0-9ad9-38dde07de3a9` (Ben chat, 2026-05-13, same context thread)
