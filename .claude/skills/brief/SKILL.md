---
name: brief
description: Assemble a context briefing on a topic — what Dylan knows, what's open, what's recent, what's at stake. Use when Dylan is about to switch contexts ("brief me on initiative X before my 1:1") or when ramping back up after time away.
---

# Brief Skill

A focused, time-stamped context dump. Different from `recall` — a brief is forward-looking and prepares Dylan to act.

## Workflow

1. **Identify the topic** — initiative, customer, decision, person, theme.
2. **Assemble** from:
   - The relevant `memory/initiatives/<slug>.md` if any
   - Recent `memory/decisions/` touching the topic
   - Recent `memory/deliverables/meetings/` involving the topic
   - Open actions in `workspace/current/actions.md`
   - Latest retro mentions
3. **Produce**:

```
## Brief: <topic> — <YYYY-MM-DD>

### Current state (what's true today)
<3-5 lines>

### Recent activity (last 14 days)
- <YYYY-MM-DD> — <event> — <link>

### Open items needing Dylan
- [ ] <action>

### Risks / watch
- <risk>

### Who to talk to
- <name> — <reason>

### What I'd ask if I were you
- <pointed question>
```

4. **Don't save** unless Dylan asks — briefs are usually disposable. If saved, route to `workspace/current/`.
