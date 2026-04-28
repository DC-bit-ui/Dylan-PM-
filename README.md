# Dylan-PM — Personalised Claude Operating System

Dylan's ever-learning Claude Code workspace. The repo *is* the system: every directory is part of the brain.

## What this is

A living, structured environment where Claude Code:
- **Knows you** — your role, voice, frameworks, preferences (`memory/profile/`)
- **Knows the business** — strategy, customers, products, metrics, glossary (`memory/business/`)
- **Knows the work** — initiatives, decisions, deliverables, retros (`memory/initiatives/`, `decisions/`, `deliverables/`, `retros/`)
- **Has a team** — specialised subagents you delegate to (`.claude/agents/`)
- **Has skills** — invokable, reusable workflows (`.claude/skills/`)
- **Learns automatically** — hooks nudge Claude to capture decisions, preferences, and learnings every session (`.claude/hooks/`)

The aim: 50× leverage by making Claude a true second brain that compounds over time.

---

## Quickstart

### 1. Open a Claude Code session in this repo
`CLAUDE.md` loads automatically and tells Claude how to operate.

### 2. Bootstrap the personalisation (once)
The `memory/profile/` and `memory/business/` files are scaffolded but empty. The fastest way to fill them is to ask Claude:

> *"Run the cold-start interview from CLAUDE.md section 11."*

Claude will ask 5-7 questions and populate the right files.

### 3. Use slash commands as shortcuts
- `/learn <thing>` — capture a learning
- `/recall <topic>` — search memory
- `/brief <topic>` — assemble a context briefing
- `/focus` — surface today's top 3
- `/standup` — generate today's standup
- `/decision` — log a decision
- `/retro-day`, `/retro-week` — retrospectives
- `/sweep` — run the memory curator
- `/delegate <task>` — route to subagents

### 4. Drop raw inputs into `inbox/`
Meeting transcripts, emails, voice memos — Claude processes them via `meeting-synthesizer`.

### 5. Keep `workspace/current/` honest
This is what Claude assumes you're working on this week. Update it; the system reads from it.

---

## Directory map

```
Dylan-PM-/
├── CLAUDE.md                      # Master prompt — always loaded
├── README.md                      # This file
├── .claude/
│   ├── settings.json              # Permissions + hooks
│   ├── agents/                    # 10 subagents — your delegation team
│   ├── skills/                    # Invokable workflows (PRD, retro, etc.)
│   ├── commands/                  # Slash-command shortcuts
│   └── hooks/                     # Session lifecycle — auto-learning
├── memory/                        # The brain (grows over time)
│   ├── profile/                   # Who Dylan is
│   ├── business/                  # Company / strategy / metrics / glossary
│   ├── people/                    # Stakeholder roster
│   ├── initiatives/               # Active work
│   ├── deliverables/              # PM artifacts (PRDs, briefs, meetings)
│   ├── decisions/                 # Decision log (ADR-style)
│   ├── learnings/                 # Captured learnings, by month
│   └── retros/                    # Retrospectives
├── playbooks/                     # Reusable processes
├── templates/                     # Artifact skeletons (PRD, one-pager, etc.)
├── inbox/                         # Drop zone for raw input
└── workspace/
    ├── current/                   # This week's active work
    └── archive/                   # Aged-out scratch
```

---

## The subagents

| Agent | Use when |
|---|---|
| `pm-strategist` | Framing, prioritisation, roadmap, RICE, strategy |
| `data-analyst` | Numbers, metrics, anomalies, sizing |
| `stakeholder-comms` | Drafting messages, updates, exec-ready writing |
| `meeting-synthesizer` | Transcript / notes → decisions + actions |
| `deliverable-builder` | PRDs, one-pagers, briefs, kickoffs |
| `initiative-tracker` | Cross-initiative status, blockers, dependencies |
| `researcher` | Deep multi-source research |
| `critic` | Red team / devil's advocate |
| `retrospector` | Extract durable learnings from a session/week/initiative |
| `memory-curator` | Maintain memory/ — dedupe, link, index |

Delegate aggressively. For independent strands, spawn agents in parallel. See `.claude/skills/delegate/SKILL.md`.

---

## How it learns

1. **In-session** — Claude reads `CLAUDE.md` section 8 and captures triggers (corrections, preferences, decisions, new entities) into the right `memory/` files.
2. **End-of-session** — the Stop hook nudges Claude to file a learning if nothing has been captured.
3. **Pre-compaction** — the PreCompact hook reminds Claude to distil context into memory before compression.
4. **Weekly** — `/sweep` runs `memory-curator` to dedupe, index, and promote durable learnings into standing rules.

The system is designed so that **no useful artifact leaves a session uncaptured.**

---

## Working agreements (with yourself)

- **Capture beats remember.** If it took a thought, write it down (or have Claude write it).
- **Append, don't overwrite.** History is leverage. Supersede instead of delete.
- **Index everything.** Each `memory/<dir>/INDEX.md` is the navigation layer.
- **Promote what works.** A learning that fires twice belongs in `profile/` or `business/` or as a new skill.
- **Trust the team.** Use subagents. The point is leverage.

---

## Customising further

- New skill? Add a folder in `.claude/skills/` with a `SKILL.md`.
- New agent? Add a `.md` file in `.claude/agents/` with frontmatter.
- New playbook? Add a `.md` file in `playbooks/` and link from `INDEX.md`.
- New template? Add to `templates/` and update the deliverable-builder.

The system is meant to evolve. When something doesn't fit, change the system.

---

## Branch & PR conventions

- Develop on the assigned branch (`claude/setup-claude-system-9cDDB` for the bootstrap).
- Push the branch, then open a draft PR.
- Don't force-push, don't push to main.

---

## License / privacy

This is Dylan's personal workspace. **Do not commit:**
- Real customer names without consent
- Credentials, API keys, tokens
- Strategy detail you wouldn't share with a colleague over coffee

If in doubt, paraphrase. The system works on patterns, not on every literal fact.
