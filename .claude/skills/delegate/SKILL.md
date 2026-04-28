---
name: delegate
description: Route a task to the right subagent (or set of subagents in parallel). Use when Dylan describes a task and you're unsure which agent to use — or when a task obviously fans out.
---

# Delegate Skill

## Workflow

1. **Decompose the task** into independent strands. Strands are independent if one's output isn't needed as input to another.
2. **Map each strand** to an agent using this table:

| Strand looks like | Agent |
|---|---|
| Should we do X? / how to frame? / prioritise? | `pm-strategist` |
| What does the number say? / size this | `data-analyst` |
| Draft a message to <person/group> | `stakeholder-comms` |
| Process these meeting notes | `meeting-synthesizer` |
| Draft a PRD / one-pager / brief | `deliverable-builder` |
| Status across initiatives / blocker scan | `initiative-tracker` |
| Find me everything on… | `researcher` |
| Pressure-test this thinking | `critic` |
| End-of-X retro | `retrospector` |
| Tidy memory/ | `memory-curator` |

3. **Dispatch in parallel** — multiple Agent calls in one message — for independent strands.
4. **Sequential only when needed** — e.g., draft (deliverable-builder) → critique (critic) → revise → comms wrapper (stakeholder-comms).
5. **After agents return**, synthesize their outputs into a single response for Dylan. Don't make him read three reports.

## Example dispatches

**"Give me a status pack for Friday's exec review."**
- Parallel: `initiative-tracker` (cross-status), `data-analyst` (key numbers), `stakeholder-comms` (drafting wrapper)
- Sequential: combine outputs → `critic` for honesty pass → finalise

**"What should we do about the churn spike?"**
- Sequential: `data-analyst` (decompose the spike) → `pm-strategist` (frame the response options) → `critic` (pressure-test the recommendation)
