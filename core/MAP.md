# MAP — What exists, when to load it, who may write it

**This is the master index of the Dylan PM Operating System.**
Last-verified: 2026-07-16 · Review-by: 2026-10-16 · Verified-by: claude-code (Fable 5 rebuild, Dylan-approved)

Read this file first, every session. It tells you what to load and where every kind of fact lives. If this file disagrees with any other file, THIS FILE WINS for routing questions (where things live); the target file wins for content.

---

## 1. Load order — every session

| Order | File | Why |
|---|---|---|
| 1 | `core/MAP.md` | This file — routing |
| 2 | `core/IDENTITY.md` | Who Dylan is, voice |
| 3 | `core/PRINCIPLES.md` | Behavioural rules, modes, hard rules |
| 4 | `memory/state/NOW.md` | What is currently true (strategy, epics, org) |
| 5 | `memory/state/rules.md` | Learned rules register |
| 6 | `core/PROTOCOLS.md` | Load before any write, capture, reconciliation, or scheduled run |

Then load task-specific files per §3 below. Total always-on load is deliberately small; everything else is on demand.

---

## 2. Canonical source per fact type — the single-source table

Every fact lives in exactly ONE file. If you find the same fact in two places, that is a defect: keep the canonical copy (below), replace the other with a pointer, or flag it if the fix needs Tier 2.

| Fact type | Canonical source | Never trust instead |
|---|---|---|
| Current strategy, priorities, owned surfaces | `memory/state/NOW.md` | strategy.md history section, old briefs |
| Active epic list + status | `memory/state/NOW.md` (live check: Jira) | glossary, products.md, initiative INDEX |
| Epic detail/history | `memory/initiatives/<key>.md` | — |
| Dylan's tasks | **Notion** ("Work Priorities" DB `fd5f23d7e071496dae6df273cbd901be`) | any file in this folder |
| Team delivery state | **Jira** (live) | initiative snapshots |
| Behavioural rules (canonical) | `core/PRINCIPLES.md` | old CLAUDE.md copies |
| Behavioural rules (recent, provisional) | `memory/state/rules.md` | learnings files |
| Voice & identity | `core/IDENTITY.md`; drafting detail: `.claude/skills/dylans-voice/SKILL.md` | communication.md (superseded stub) |
| Procedures (writes, capture, reconcile, deploy) | `core/PROTOCOLS.md` | COWORK.md (superseded stub) |
| Terminology | `memory/business/glossary.md` | — |
| Company/product durables | `memory/business/company.md`, `products.md`, `customers.md` | — |
| People | `memory/people/roster.md` | — |
| Decisions | `memory/decisions/` (one file per decision) | — |
| Event history (meetings, incidents, observations) | `memory/learnings/<YYYY-MM>/` | — |
| Daily run records | `memory/retros/session/` | — |
| Connector contracts (tools, gotchas) | `memory/integrations/<connector>.md` | — |
| Scheduled-task inventory + prompts | `.claude/skills/cowork-scheduled/` (README = inventory; SKILL.md = prompt) | `memory/integrations/cowork/` snapshots (HISTORICAL only) |
| Deliverables (PRDs, research, comms) | `memory/deliverables/<subdir>/` — PRDs are working copies; **Confluence is canonical** for published PRDs | — |
| Chat context packs | `packs/` (generated — never edit directly) | — |

---

## 3. When to load what (beyond the always-on set)

| Task | Load |
|---|---|
| Drafting anything in Dylan's voice | `.claude/skills/dylans-voice/SKILL.md` |
| PRD / epic / feature spec | `memory/business/products.md`, `glossary.md`, relevant `initiatives/` file, PRD skill + agriprove-pm/agriprove-backend skill packs |
| Prioritisation / focus / standup | `core/PROTOCOLS.md` §Reconciliation, then Notion + Jira live |
| Querying a connector | `memory/integrations/<connector>.md` (tool names + gotchas) |
| Touching a scheduled task | `.claude/skills/cowork-scheduled/README.md` + that task's SKILL.md + PROVENANCE.md; deploy per PROTOCOLS §Deploys |
| Career/portfolio anything | `memory/decisions/2026-05-12-career-portfolio-9-rules.md` + IDENTITY §Employment |
| Meeting synthesis | `memory/people/roster.md` + granola integration contract |
| Anything involving money/customers | HubSpot live + `memory/business/customers.md` |

---

## 4. Freshness rule (applies to every file with a header)

Files in `memory/state/`, `memory/business/`, `memory/initiatives/`, `memory/integrations/` carry:

```
Last-verified: YYYY-MM-DD
Review-by: YYYY-MM-DD
Verified-by: dylan | apex | claude-code
```

If today > `Review-by`: (1) prefix facts you take from the file with `[STALE — unverified since <Last-verified>]`; (2) do not present them as current; (3) verify via connector and update the header if you can; (4) otherwise add to your output: "Stale file needs review: `<path>`". Full spec: `core/PROTOCOLS.md` §Freshness.

---

## 5. Directory map

| Path | What | Write tier |
|---|---|---|
| `core/` | Kernel: MAP, IDENTITY, PRINCIPLES, PROTOCOLS | IDENTITY = Tier 3 (Dylan only); others Tier 2 (PR) |
| `memory/state/` | NOW.md (current truth), rules.md (rules register) | Tier 1 |
| `memory/business/` | Durable domain knowledge + glossary | Tier 1 append |
| `memory/people/` | roster.md | Tier 1 append |
| `memory/initiatives/` | Epic detail files + `archive/` | Tier 1 |
| `memory/decisions/` | ADR log, append-only, supersede-with-forward-link | Tier 1 |
| `memory/learnings/` | Dated event journal by month | Tier 1 |
| `memory/retros/session/` | Apex EOD run records | Tier 1 (Apex) |
| `memory/integrations/` | Connector contracts; `cowork/` subdir = HISTORICAL prompt snapshots | Tier 2 |
| `memory/deliverables/` | Work products, filed by subdir (meetings, prds, research, comms, prompts, career, skills, education, updates, handoffs, system) — **never drop files at deliverables/ root** | Tier 1 |
| `inbox/` | Transient drops (`cowork/`, `granola/`) → routed then archived to `inbox/processed/YYYY-MM/` by Apex EOD | Tier 1 |
| `packs/` | Generated context packs for chat surfaces | Generated only (via /pack-regen) |
| `playbooks/`, `templates/` | Process docs + fillable skeletons (PRD/brief canonical source = Confluence/agriprove-pm — see banner in each template) | Tier 2 |
| `.claude/agents/` | 10 subagent definitions | Tier 3 |
| `.claude/skills/` | Claude Code skills + `cowork-scheduled/` (canonical prompt store) | Tier 2 |
| `.claude/commands/` | Thin wrappers → skills. Aliases: `/decision`→`decision-log`, `/standup`→`daily-standup`, `/learn`→`log-learning` | Tier 2 |

## 6. NOT the operating system — do not load, do not treat as memory

These live in the same folder for practical reasons but are separate projects/artifacts. Never read them for OS context; never write OS content into them:

`apex-pm/` (retired local Apex server + its commands), `EIH Automation/`, `shared-growth-memory/` (team bus — has its own CLAUDE.md contract), `horizon-snapshot/`, `horizon-snapshot-rebuild/`, `Farm Map Drawing Tool/`, `Grazing management tool/`, `stormboy-tracker/`, `hubspot-backfill/`, `sample-titles/`, `shareable/`, `Verterra Collaboration/`, plus loose artifact files at repo root (xlsx/pdf/docx/png/html). Initiative and deliverable files may POINT into these trees; that is the only sanctioned relationship.

## 7. Superseded stubs (kept so old references resolve)

`COWORK.md`, `memory/profile/*.md`, `memory/business/metrics.md`, `workspace/` → each contains only a forward pointer. Content relocated 2026-07-16; originals preserved in git history. Full migration record: `memory/deliverables/system/2026-07-16-os-rebuild-changelog.md`.
