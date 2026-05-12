---
name: meeting-prep
description: Build a prep doc for an upcoming meeting — who's attending, what's the goal, what does Dylan need to know going in, what does he need to drive out. Use when Dylan says "prep me for the X meeting" or before a 1:1, review, or external.
---

# Meeting Prep Skill

## Workflow

1. **Get the meeting facts:** title, attendees, time, length, intended outcome. Ask if not stated.
2. **Pull attendee context** from `memory/people/roster.md` for each non-Dylan attendee — what they care about, history with Dylan, last interaction.
3. **Pull topic context:**
   - If meeting is initiative-related → `memory/initiatives/<slug>.md`
   - If meeting is decision-related → relevant `memory/decisions/`
   - Past meetings with similar attendees → `memory/deliverables/meetings/`
4. **Produce the prep doc:**

```
## Prep: <meeting title> — <date> @ <time>
**Length:** <n> min  |  **Attendees:** <names>
**Outcome we want:** <one sentence — what changes after this meeting>

### Quick context (30 sec read)
<the situation in 2-3 lines>

### What each attendee likely cares about
- <name>: <…>

### Dylan's three points to make
1. <…>
2. <…>
3. <…>

### Likely pushback & how to respond
- <objection> → <response>

### Open questions to drive out
- <question>

### Materials to have ready
- <link / file / number>

### Decision to leave with (if any)
<…>
```

5. **Save to** `memory/deliverables/meetings/prep-YYYY-MM-DD-<slug>.md`.
6. **Post-meeting:** route the actual transcript/notes through `meeting-synthesizer`.

## Anti-patterns

- Don't pad with full meeting goals from a year ago.
- Don't list 10 points to make — pick 3 max.
