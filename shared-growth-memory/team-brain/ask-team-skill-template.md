# `/ask-team` skill — template for Claudia's Storm Boy Claude Tool

Drop this into `cross-project-shared/skills/ask-team/SKILL.md` and adjust the path to the team-brain folder to wherever OneDrive syncs `shared-growth-memory/` on the rep's machine.

The skill should:

1. Take a question (free text) and optionally a context tag (e.g., "for contact X").
2. Load the four profile files + two distillate JSONs from `team-brain/`.
3. Maintain conversation history per session (so multi-turn works).
4. Call Anthropic Messages API with the brain as a `cache_control: ephemeral` system block.
5. Surface the answer in the rep's workspace with verbatim quote formatting + source citations.

## Reference implementation

The dashboard's `ask.js` is the authoritative reference for prompt structure. Mirror these specifics:

### System prompt structure

```
system: [
  { type: "text", text: <role definition - see ask.js ROLE_PROMPT> },
  { type: "text",
    text: <team-brain text built from the loaded files>,
    cache_control: { type: "ephemeral" } }
]
```

The `cache_control` on the brain block is essential — it means the 30K-token team brain is only billed at full price on the first turn of a conversation. Subsequent turns within ~5 minutes pay 10%. Without this, multi-turn becomes prohibitively expensive.

### Role prompt

Keep the rules tight:

- Quote verbatim where it lands harder than paraphrase
- Attribute every quote ("Hobbs's framing:", "Ben's pattern:")
- 200-400 words for most answers
- If grounding doesn't exist in the source material, say so honestly — don't invent
- Output strict JSON: `{answer, sources[], confidence}`

### Conversation history

Keep the last 10 turns per session. Thread them as alternating user/assistant messages. The assistant turns should be the full JSON the model emitted on that turn — keeps the contract consistent.

```
messages: [
  { role: "user", content: <prior question 1> },
  { role: "assistant", content: <JSON: {answer, sources, confidence}> },
  ...
  { role: "user", content: <current question> }
]
```

### Model choice

Default to Haiku (`claude-haiku-4-5-20251001`). The brain is well-structured enough that Haiku gives production-grade answers for most questions. Switch to Sonnet for subtle multi-call synthesis.

### Cost expectations

- First turn: ~30K input tokens × full rate + ~1.5K output = ~$0.005 (Haiku)
- Subsequent turns (within 5 min): ~30K cached + new tokens × 10% + new output = ~$0.001
- 50 questions/day across team ≈ $0.10/day

## Storm Boy use cases this should serve

- Pre-call prep: "What does Hobbs say in the first 60 seconds of a cold call to a NSW grazier?"
- Objection handling: "A prospect just said 25% is too high — what's the move?"
- Post-call reflection: "I just had this conversation [paste]. What would Hobbs have done differently?"
- Pattern lookup: "Across the 6 distilled farm visits, what landed and what didn't?"
- New-rep onboarding: "Walk me through Hobbs's on-farm sequence from arrival to close."

## What this skill is NOT for

- Real-time deal data — for that, the dashboard `/api/work/*` endpoints + HubSpot are the source. The skill answers from captured *patterns*, not live state.
- Writing back to the team brain — the brain is Dashboard-authored. If reps want to add a learning, they write to `shared-growth-memory/patterns/` per the existing pattern schema.

## When to escalate to the dashboard

If a rep is asking "what's happening with this specific deal" rather than "how should I handle this situation," route them to `http://localhost:3401/v2` (the WORK tab) instead.
