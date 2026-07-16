---
name: recall
description: Search memory/ for what Claude knows about a topic, person, decision, or initiative. Returns a synthesis, not a file dump. Use when Dylan asks "what do we know about…", "remind me about…", or "have we discussed…".
---

# Recall Skill

## Workflow

1. **Restate the query** — what is Dylan actually asking for?
2. **Search** in this order:
   - `grep -ri "<term>" memory/` (case-insensitive)
   - File-name match in `memory/initiatives/`, `memory/decisions/`, `memory/people/`
   - Cross-references — once you find a hit, follow its links
3. **Synthesize**, don't dump:

```
## Recall: <query>

### Headline
<the one or two sentences that answer the question>

### Sources
- <file:line> — <one-line summary of what's there>

### Related but tangential
- <file>: <why it might matter>

### Gaps
<what's not in memory that Dylan might want to fill>
```

4. **Don't quote long passages.** Cite path + line. Dylan can open the file.
5. **If nothing found**, say so — and suggest where to start (e.g., "no entry for this customer; want me to start one?").

## Anti-patterns

- Don't paste five whole files.
- Don't fabricate cross-references.
- Don't claim a fact without a citation.

---
**UPDATE 2026-07-16:** search order for recall is now: `memory/state/` → `core/` → `memory/decisions/` → `memory/learnings/` → `memory/business/` → `memory/deliverables/`. Ignore `.claude/worktrees/` (deleted), `memory/profile/` and `COWORK.md` (stubs). Canonical-source table: `core/MAP.md` §2.
