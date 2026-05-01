# Decision: Apex flows run on heavy, prescriptive prompts — not light defaults

**Date:** 2026-04-29
**Status:** accepted
**Owner:** Dylan
**Type:** ADR (architecture)

---

## Context

The 2026-04-29 handoff hypothesised that heavy prescription in Apex Morning + EOD prompts might be over-constraining the model. A `daily-briefing` flow with a "TBD" instructions field had produced apparently-decent output in surface form, suggesting "light prompt > heavy prompt" might be a viable simplification.

Inspection (captured in [`../learnings/2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md`](../learnings/2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md)) falsified that hypothesis:

- The `daily-briefing` produced **zero durable writes** — no Notion creates, no memory writes — because the wrapper enforces "only write if the task asks", and TBD doesn't ask.
- It missed every Apex-specific behaviour: dual-stack prioritisation, 7-day Granola scan, origin tags (`Apex · Morning` / `Apex · Reconciliation`), stale-cancellation policy, Tier 1 memory writes.
- Its surface-readable Notion writes during testing happened only because Dylan was in-session steering the model — they were not automated outputs.
- The actual Morning + EOD prompts (snapshotted at [`../integrations/cowork/`](../integrations/cowork/)) are ~80–100 lines each and explicitly prescribe each connector pull, the priority framework, focus-area mapping, dedup, Notion property writes, Jira write-back rules, and output-summary structure. That prescription is what makes the runs valuable.

## Decision

**Apex Morning Briefing and EOD Reconciliation run on heavy, fully-prescriptive prompts. We do not lighten them in pursuit of "letting the model be the model".**

The prompt is the contract. It encodes the design Dylan needs (dual-stack, 7-day window, escalation rules, origin tagging, write-back discretion). Without the prompt, the runtime defaults to a generic markdown digest with no durable side-effects.

## Consequences

**Positive:**
- Apex flows produce durable, repeatable outputs aligned to Dylan's design.
- Behaviour is inspectable via the snapshotted prompts — anyone can read what the flow is supposed to do without running it.
- Future flow design starts from the heavy-prescription prior; the bar for adding a flow is articulating the prescription, not just the intent.

**Negative / costs:**
- Prompt edits in the Cowork UI are lossy with no native version control. Mitigation: capture a fresh dated snapshot at `memory/integrations/cowork/<flow>-prompt-YYYY-MM-DD.md` whenever the prompt is materially edited; never overwrite an old snapshot.
- Maintenance cost when underlying systems change (new connector, renamed Notion view, new focus area). Treat the prompt as a living artefact, not a set-and-forget config.
- Risk of prompt drift between the runtime (Cowork UI) and the snapshot (this repo). Mitigation: pair every prompt edit with a snapshot commit in the same session.

## Alternatives considered

1. **Light prompt + trust the model** — falsified by evidence above. The runtime defaults are competent at surface output, useless at durable behaviour.
2. **Mirror prompts to `.claude/skills/<flow>/SKILL.md` as the runtime source** — rejected. Cowork's scheduled tasks load from the per-task Instructions field, not from `.claude/skills/`. Mirroring would create two sources of truth with no automatic sync. Repo remains the version-control mirror; Cowork UI is the runtime source.
3. **Hybrid (light prompt + skill packs)** — rejected for now. The complexity of partitioning behaviour between a light task prompt and an external skill pack outweighs the maintenance benefit, and we'd still need the heavy prescription somewhere.

## Related

- Falsifying evidence: [`../learnings/2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md`](../learnings/2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md)
- Morning prompt snapshot: [`../integrations/cowork/apex-morning-briefing-prompt-2026-04-29.md`](../integrations/cowork/apex-morning-briefing-prompt-2026-04-29.md)
- EOD prompt snapshot: [`../integrations/cowork/apex-eod-reconciliation-prompt-2026-04-29.md`](../integrations/cowork/apex-eod-reconciliation-prompt-2026-04-29.md)
- Companion decision: [`2026-04-29-delete-daily-briefing.md`](2026-04-29-delete-daily-briefing.md)
- Superseded hypothesis: handoff §"Decisions made this session" item 5 in [`../../workspace/current/handoff-2026-04-29.md`](../../workspace/current/handoff-2026-04-29.md)
