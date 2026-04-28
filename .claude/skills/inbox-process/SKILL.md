---
name: inbox-process
description: Process unprocessed drops in `inbox/cowork/` — parse the routing checkboxes from the multi-surface capture template, route durable insights to memory/ per CLAUDE.md §10 routing rules, commit Tier 1 entries directly or open Tier 2 PRs, archive processed files. Runs as part of Apex Morning Briefing or on demand.
---

# Inbox Process Skill

The bridge skill that closes the seam between ad-hoc claude.ai / mobile sessions and the engineered `memory/` system.

## Anchor
- Decision: `memory/decisions/2026-04-28-multi-surface-strategy.md`
- Playbook (capture template + when to use): `playbooks/multi-surface-capture.md`
- Routing rules: `CLAUDE.md` §10 ("Where it goes")

## Source of truth
- **`inbox/cowork/`** — unprocessed drops (capture-template format, optionally prefixed `granola/`, `cowork/`, etc. namespace subfolders)
- **`memory/`** — destination for routed entries
- **`inbox/processed/<YYYY-MM-DD>/`** — archive after routing

## Workflow

### Step 1 — Scan

List all `.md` files under `inbox/cowork/` (and namespace subfolders). For each, check:
- Is it in capture-template format (has the `## Suggested routing` block with checkboxes)?
- If not, can it still be parsed (Granola summary, Apex output, free-form note)?

If `inbox/cowork/` is empty: state so and stop. Don't fabricate processing.

### Step 2 — Parse each file

For each unprocessed drop:

1. **Read the file**
2. **Identify the routing target(s)** from the checkboxes:
   - `[x] Decision` → `memory/decisions/<YYYY-MM-DD>-<slug>.md`
   - `[x] Learning` → `memory/learnings/<YYYY-MM>/<YYYY-MM-DD>-<slug>.md`
   - `[x] Person fact` → append to `memory/people/roster.md` under named person
   - `[x] Profile/preference` → propose **Tier 2 PR** to `memory/profile/working-style.md` (NEVER auto-edit `communication.md` or `identity.md` — those are Tier 3 off-limits per `COWORK.md` §4)
   - `[x] Business fact` → append to relevant `memory/business/<file>.md`
   - `[x] Initiative state` → update `memory/initiatives/<file>.md` changelog
   - `[x] None` → archive without routing (mark as ephemeral)
3. **Read the durable insights** — these become the body of the routed entry
4. **Read the source context** — date/time, why it came up — these become the citation

### Step 3 — Override routing if content disagrees with checkboxes

The checkboxes are Dylan's intent; the content is the source of truth. If a drop is checked `[x] Learning` but the content describes an architectural decision (has alternatives, consequences, owner), route it as a decision instead. State the override in the output.

Conservative bias: when ambiguous, prefer `Learning` over `Decision`. Decisions are heavier; they should be deliberate.

### Step 4 — Route

For **Tier 1** routings (Decision, Learning, Person fact append, Business fact append, Initiative changelog):

- Write the new entry / append to existing file
- Update the relevant `INDEX.md`
- Cite the source: include "Source: claude.ai chat <date>" or "Source: mobile <date>" plus the topic line from the drop
- Use confidence markers as in the drop (preserve `[high]` / `[ASSUMPTION]` etc.)

For **Tier 2** routings (Profile/preference change):

- Don't auto-edit. Output a proposed PR with the change diff for Dylan to review
- The PR body cites the drop file path and quotes the relevant insight
- Branch name: `cowork/inbox-<YYYY-WW>` (groups all Tier 2 inbox proposals from a week)

### Step 5 — Archive

Move each processed file to `inbox/processed/<YYYY-MM-DD>/`. Preserve original filename. This is the audit trail — never delete from `inbox/`.

If there are open routing questions for Dylan, leave the file in `inbox/cowork/` and add a `## Routing question` block at the top with the specific ambiguity.

### Step 6 — Output

```
## Inbox Process — <YYYY-MM-DD HH:MM SAST>
[run via: Apex Morning Briefing | manual / on-demand]

### Processed (N drops)
| Drop | Routed to | Tier | Status |
|---|---|---|---|
| `inbox/cowork/2026-04-28-frontier-scope.md` | `memory/decisions/2026-04-28-frontier-scope-narrowed.md` | 1 | committed |
| `inbox/cowork/2026-04-28-kierens-quote.md` | `memory/learnings/2026-04/...` | 1 | committed |
| `inbox/cowork/2026-04-28-pref-shorter-meetings.md` | `memory/profile/working-style.md` | **2 — PR proposed** | branch `cowork/inbox-2026-W18` |

### Routing overrides
- `<file>` — checked Learning, content suggests Decision — routed as Decision (alternatives + consequences present)

### Held for Dylan (routing question)
- `<file>` — ambiguous between Person fact and Learning — see file's `## Routing question` block

### Archived
- N files moved to `inbox/processed/2026-04-28/`

### Empty / no action
[when applicable]
```

## Where this skill writes

- **Tier 1:** routed entries directly to `main` (or branch if PR #1 not yet merged) — same as Apex's existing Tier 1 protocol
- **Tier 2:** proposed PRs on branch `cowork/inbox-<YYYY-WW>`
- **Off-limits:** `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `memory/profile/identity.md`, `memory/profile/communication.md` — surface as recommendations only; never auto-edit

## Failure modes

- **Drop not in capture-template format** → parse best-effort; state explicitly "non-template drop, manual routing recommended" in output; leave in `inbox/cowork/` for Dylan
- **Multiple routing checkboxes selected** → route to all (a single drop can produce both a Learning entry and a Person fact append, for example)
- **Insufficient content for routing** (drop is too sparse to constitute a memory entry) → archive without routing; note "discarded as too sparse"
- **Conflict with existing memory** (drop says X, `memory/` says ¬X) → flag as **churn trigger** per `memory/decisions/2026-04-28-curation-cadence.md`; surface for immediate profile review; don't silently overwrite

## When to use this skill

- **Auto** — every Apex Morning Briefing as part of pre-work synthesis
- **Manual** — when Dylan says "process inbox", "/inbox-process", or after a deliberate batch of claude.ai/mobile captures
- **Triggered** — when `inbox/cowork/` accumulates >5 unprocessed drops (volume signal that the seam is being used)

## Heuristics

- **Be conservative on Decision routing.** Decisions are durable; misrouting noise as a decision pollutes the log. When in doubt → Learning.
- **Always cite the source.** Without a "from claude.ai chat <date>" line, the routed entry loses traceability — and that's the only thing that lets Dylan audit the seam.
- **Empty inbox is healthy.** If `inbox/cowork/` is consistently empty, the seam isn't being used. That might mean Dylan isn't capturing (gap) or genuinely isn't having durable claude.ai/mobile sessions (fine). Surface counts in the weekly sweep so it's visible.

## Validation

After 30 days, review with Dylan (lands in monthly review slot per cadence decision):
- How many drops were processed? Of those, how many were genuinely durable (still in `memory/` after a sweep) vs noise?
- Routing accuracy — did the checkboxes match what content suggested?
- Tier 2 PR rate — how often did profile/preference proposals land vs get rejected?
- Override frequency — how often did the skill route differently from the checkboxes?

Tune the conservative-bias heuristics based on findings.
