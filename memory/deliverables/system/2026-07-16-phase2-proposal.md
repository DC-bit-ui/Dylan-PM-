# Phase 2 Proposal — Redesign of the Dylan PM Operating System

**Date:** 2026-07-16 · **Status:** CHECKPOINT — no files edited yet
**Companion:** `phase1-audit.md` (defect register D1–D6 referenced throughout)

---

## 1. Design thesis

The audit's verdict: good governance thinking, failed maintenance economics. So the redesign optimises for one thing above all — **the system must stay true with zero standalone maintenance processes**. Every rule below follows from that:

1. **Maintenance rides on sessions that demonstrably run.** Apex Morning and EOD fire daily and work. All upkeep (inbox archival, freshness checks, state updates, index regeneration) becomes a *step inside those prompts*, not a separate weekly/monthly cadence that history shows never fires. Fixes D3.1–D3.7.
2. **Every fact in exactly one file; every duplicate becomes a pointer.** One epic list, one ownership map, one schedule table, one prompt store, one protocol text. Fixes D1.
3. **Freshness is a contract, not a comment.** Every volatile file carries `Last-verified` + `Review-by` dates, and the core instructions tell every model *exactly* what to do when `today > Review-by`: flag `[STALE]`, do not present as current. Fixes D2's silent-staleness class.
4. **Promotion happens at capture time.** When Dylan states a rule, it lands directly in the rules register that every session loads — no intermediate "learnings awaiting weekly promotion" queue. Fixes D3.1 by deleting the dead pipeline instead of reviving it.
5. **Weak-model test applied to every instruction.** No file may require a reader to infer canonicity, staleness, or intent. Where two files could conflict, one names the winner explicitly.

**One deliberate constraint (judgement call, flagged):** I recommend rebuilding **in place** — keeping the `memory/` and `.claude/` namespaces — rather than a clean re-namespace. Reason: 14 deployed Cowork scheduled prompts, 19 skills, and 10 agents hard-reference `memory/...` paths, and the repo's own history shows the deploy loop is unreliable (the Teams fix sat undeployed for 11 weeks). Renaming paths in a system whose redeploy mechanism is the weakest link guarantees a new generation of drift. New layers get new paths; existing referenced paths keep working. The clean-slate alternative is Option B in §8.

---

## 2. Proposed structure

New/changed items marked ● ; kept-as-is marked ○ ; retired marked ✕.

```
C:\Dylan PM\
├── ● CLAUDE.md                     Thin Claude Code adapter (~50 lines): surface specifics + "read core/ in this order". No protocol text.
├── ● COWORK.md                     5-line pointer stub → core/. Kept only so existing references resolve.
├── ● README.md                     Accurate human-facing repo map. Rebuilt.
│
├── ● core/                         THE KERNEL — small, always loaded by every surface, every session
│   ├── MAP.md                      Progressive-disclosure index: every directory, what it holds, WHEN to load it,
│   │                               who may write it (tier), and the freshness rule. The one file that must never lie.
│   ├── IDENTITY.md                 Durable: who Dylan is, mandate, employment/compliance capsule, voice essentials.
│   │                               (Merges profile/identity.md + the durable parts of communication.md.) Tier 3.
│   ├── PRINCIPLES.md               Behavioural defaults, working modes, confidence markers, hard rules.
│   │                               (Single home for what CLAUDE.md §2/§12 + COWORK.md §5/§10 + PI restated 3×.) Tier 2.
│   └── PROTOCOLS.md                Operational procedures, written for the weakest model: session-start checklist,
│   │                               connector-first table, reconciliation procedure, tiered write protocol,
│   │                               capture triggers, no-silent-fallback (exact error shape), freshness contract,
│   │                               file-naming conventions, index rules. Tier 2.
│
├── memory/
│   ├── ● state/                    NEW LAYER — the single source of current truth (volatile by design)
│   │   ├── NOW.md                  Strategy, top priorities, owned surfaces, active epic list, org snapshot,
│   │   │                           schedule table (the ONE copy). Every section: `As-of:` + `Review-by:` dates.
│   │   │                           business/, initiatives/, glossary point here instead of carrying copies.
│   │   └── rules.md                Learned-rules register: dated, append-only, Tier 1. Loaded every session.
│   │                               Rules land here AT CAPTURE TIME. Periodic fold-in to PRINCIPLES.md via Tier 2.
│   ├── ○ profile/                  Retired as authority → each file becomes a dated pointer stub to core/
│   │                               (paths preserved because deployed prompts read them).
│   ├── ● business/                 Durable domain knowledge only. company/products/customers keep facts that
│   │                               don't churn; ALL epic/ownership/status content replaced by "see state/NOW.md".
│   │                               glossary.md stays canonical for terminology (add Horizon Profile, DROVER, ACWIS…).
│   │                               ✕ metrics.md retired to a pointer (metrics live in PRDs/Notion; template never filled).
│   ├── ● people/roster.md          Kept (path is referenced). Fix Cadel; add DJ, Jo, Matthew Warnken; disambiguate Wills.
│   ├── ● initiatives/              Active epics only, each file follows the AP-2514 pattern (status block + dated
│   │                               changelog). Non-active files moved to initiatives/archive/. INDEX regenerated,
│   │                               never hand-appended. Active list itself lives in NOW.md; INDEX = detail lookup.
│   ├── ○ decisions/                Unchanged model (append-only ADRs). Add supersede stubs for the 2 dupes;
│   │                               regenerate INDEX; add supersede markers where later files overtake earlier.
│   ├── ● journal/                  RENAMED CONCEPT for learnings/: a dated event stream (meeting syntheses, incidents,
│   │                               observations). Physically stays at memory/learnings/ (paths referenced) with the
│   │                               INDEX files replaced by one generated INDEX. Behavioural rules no longer live here —
│   │                               they go to state/rules.md at capture; the journal entry just records the event.
│   ├── ● retros/                   Session EODs kept BUT given a reader: Apex Morning step 1 = read yesterday's EOD.
│   │                               Weekly/monthly retro dirs deleted from the spec (not the promise-then-empty pattern).
│   ├── ● integrations/             Connector contracts kept; tool IDs corrected; add "canonical prompt store is
│   │                               .claude/skills/cowork-scheduled/" banner to cowork/INDEX.md; snapshots marked HISTORICAL.
│   └── ● deliverables/             Kept. Filing rule added to PROTOCOLS (every file goes in a subdir; no root drops).
│                                   Root INDEX rebuilt in the prds/-INDEX style, then regenerated not hand-edited.
│
├── ● .claude/
│   ├── ○ agents/                   Keep all 10 (update file references to core/ + NOW.md).
│   ├── ● commands/                 Fix 3 name mismatches; retire the 4 apex-* commands (pending Q4 answer).
│   ├── ● skills/                   Keep the working set; update paths; delete empty career-sanitiser/;
│   │   └── cowork-scheduled/       stays THE canonical prompt store; fix mangled EOD block; resolve daily-briefing stub;
│   │                               bring AI-Pulse/memory-curator prompts in OR retire them (Q4).
│   ├── ✕ hooks/                    Deleted (dead on Windows). Their intent (capture nudge) moves into PROTOCOLS
│   │                               end-of-session ritual + the EOD prompt, which actually runs.
│   └── ✕ worktrees/                Pruned (~205 MB). git worktree prune + delete.
│
├── ● inbox/                        Kept, lifecycle enforced where it can't rot: Apex EOD prompt gains a final step —
│   │                               route durables, then move processed drops to inbox/processed/YYYY-MM/.
├── ✕ workspace/                    Retired. actions.md fallback pattern deleted (Notion is canonical; the fallback
│                                   was a stale-data hazard). handoff docs → memory/deliverables/handoffs/.
├── ○ playbooks/ templates/         Kept; templates/brief.md + one-pager.md get the same "canonical source wins"
│                                   banner prd.md already has; deliverable-builder references fixed.
└── ● cowork/project-instructions.md  Regenerated from core/ (see §5 draft). Marked "generated — edit core/, then regenerate".
```

**Layer separation (per design principle 5):**

| Layer | Home | Volatility | Write tier |
|---|---|---|---|
| (a) Durable identity & preferences | core/IDENTITY.md, core/PRINCIPLES.md | months–years | Tier 3 / Tier 2 |
| (b) Domain knowledge | memory/business/, glossary | months | Tier 1 append |
| (c) Active workstreams | memory/state/NOW.md, initiatives/, Notion (canonical for tasks) | days–weeks | Tier 1 |
| (d) Decision log | memory/decisions/ | append-only | Tier 1 |
| (e) Operational protocols | core/PROTOCOLS.md, MAP.md, integrations/, cowork-scheduled/ | weeks–months | Tier 2 |

Active-project churn touches only layer (c) — NOW.md and initiative files — never the durable layers.

---

## 3. The freshness contract (exact spec)

Header block, mandatory on every file in `state/`, `business/`, `initiatives/`, `integrations/`:

```
Last-verified: 2026-07-16
Review-by: 2026-08-15
Verified-by: dylan | apex | claude-code
```

Rule in PROTOCOLS.md, written for the weakest model:

> Before using any fact from a file with a `Review-by` header: compare `Review-by` to today's date.
> If today is later than `Review-by`: (1) prefix every fact you take from the file with `[STALE — unverified since <Last-verified>]`, (2) do not present the fact as current, (3) if a connector can verify it, verify and update the header, (4) if not, add one line to the session output: "Stale file needs review: <path>".

Apex Morning Briefing gains a fixed step: list every file in `state/` + `initiatives/` past its `Review-by`, as a "Needs review" line in the brief. Staleness becomes visible daily instead of discovered quarterly.

---

## 4. The maintenance model (what runs when — all inside existing runs)

| Moment | Runs today? | Maintenance folded in |
|---|---|---|
| **Apex Morning** (daily, proven) | Yes | Read yesterday's EOD retro (closes D3.4). List `Review-by` breaches. Warn if inbox/cowork > 20 unprocessed files. |
| **Apex EOD** (daily, proven) | Yes | Update NOW.md on state changes (epic transitions, org changes) — it already detects these for retros. Route inbox durables → move drops to `inbox/processed/YYYY-MM/`. Write EOD retro. |
| **Capture moments** (in any session) | Yes | Rule → `state/rules.md` immediately (Tier 1). Decision → `decisions/`. Event → journal. Confirm in one line. |
| **`/sweep`** (on demand) | Rarely | Kept, but demoted from load-bearing to hygiene: regenerate INDEXes, fold `rules.md` entries older than 30 days into PRINCIPLES.md (Tier 2 PR), dedupe check. Morning brief nags when last sweep > 14 days (a dated marker file makes "last sweep" checkable by the weakest model). |
| Weekly sweep / monthly review / quarterly review as *scheduled* tasks | Never ran | **Deleted from the spec.** Their duties are redistributed above. |

Nothing in this system now depends on a process that has never fired.

---

## 5. Draft Project Instructions (in full)

Written to the model-agnostic bar: numbered procedures, exact paths, no inference required. Roughly 40% the length of the current PI because everything that can drift now lives in the repo with a pointer.

```markdown
# Cowork Project Instructions — Dylan PM Operating System
# GENERATED FILE. Canonical source: core/ in the connected folder.
# To change these instructions: edit core/, then regenerate per core/PROTOCOLS.md §Regeneration.

## 1. Who you work with
Dylan Cronje — Product Manager at AgriProve (soil carbon measurement, Australian
landholders). Email dylan@agriprove.io. Timezone SAST (UTC+2); team in AEST
(UTC+10), 8 hours ahead. Async-first.
Voice: direct, opinionated, no flattery, no preamble, no "great question".
Push back on weak logic. Cite sources. Use confidence markers: [high],
[moderate], [low], [ASSUMPTION]. Say when data is live (MCP this session)
vs cached (a file in the folder, cite its Last-verified date).

## 2. What this project is
The connected folder (C:\Dylan PM) is Dylan's operating system: durable memory,
current state, decisions, protocols, and prompt sources. It is a Git repo.
Notion is canonical for Dylan's tasks; Jira for team delivery — never duplicate
either into the folder.

## 3. Session start — do these reads, in this order, every session
1. core/MAP.md          — what exists and when to load it
2. core/IDENTITY.md     — who Dylan is; voice
3. core/PRINCIPLES.md   — behavioural rules, modes, hard rules
4. core/PROTOCOLS.md    — write protocol, procedures
5. memory/state/NOW.md  — current strategy, priorities, active epics, schedules
6. memory/state/rules.md — learned rules register
Then load task-specific files per the table in core/MAP.md. Do not ask Dylan
for facts these files or the connectors already hold.

## 4. Freshness rule
Files in memory/state/, memory/business/, memory/initiatives/,
memory/integrations/ carry `Last-verified` and `Review-by` header dates.
If today > Review-by: mark every fact you use from that file
[STALE — unverified since <Last-verified>], do not present it as current,
verify via connector if possible, and flag the file in your output.

## 5. Connector-first
Before asking Dylan for a fact, query the system that holds it:
person/role → Teams/Outlook/Granola/HubSpot · meeting → Outlook/Granola ·
ticket → Jira · doc → Confluence · email → Outlook · task → Notion ·
customer → HubSpot. Ask Dylan only if the connector is unavailable, returns
nothing, or the question needs his judgement. Contracts with correct tool
notes: memory/integrations/<connector>.md.

## 6. Reconciliation (before surfacing any task as open)
Follow the procedure in core/PROTOCOLS.md §Reconciliation: for each open task,
infer its completion signal and check the relevant connector (calendar invite,
sent mail, outbound Teams message — channels AND chats, Jira transition,
Confluence edit). Categorise ✅ done-with-evidence / 🟡 still-open /
❓ unverifiable / 🔍 missing-from-workstack. Never mark done without
system + timestamp + link.

## 7. Writing back — tiered protocol (full text: core/PROTOCOLS.md §Writes)
Tier 1 (commit direct to main): dated journal entries → memory/learnings/<YYYY-MM>/;
decisions → memory/decisions/; learned rules → memory/state/rules.md (append);
state updates → memory/state/NOW.md (update section + its As-of date);
roster append; initiative status blocks; EOD retro → memory/retros/session/.
Tier 2 (branch cowork/<slug> + PR): core/PRINCIPLES.md, core/PROTOCOLS.md,
core/MAP.md, integration contracts, scheduled-task SKILL.md files, templates.
Tier 3 (never write): core/IDENTITY.md, .claude/agents/, this file's source
generation rules. If a Tier 3 change seems needed, write a Tier 1 journal
entry describing the case.
Rules for every write: append don't overwrite; date-stamp; cite the source
signal; supersede with forward links, never delete; no secrets.

## 8. Capture — when Dylan says something meant to stick
Triggers: a stated preference, a correction, a rule ("from now on / always /
never"), a new term or person, or an explicit "remember this".
Action: write it immediately — rules to memory/state/rules.md, decisions to
memory/decisions/, events to memory/learnings/. Do not wait, do not queue.
Ambiguous signal → capture with [moderate] + "supersede if corrected".
Never capture into Claude.ai built-in memory or any parallel folder — the
filesystem under the connected folder is the ONLY memory.
If a write fails, report it in this exact shape and create no fallback file:
  ❗ Memory write failed. Path: <path> · Capture: <one line> ·
  Tool: <tool> — Error: <verbatim>. No fallback created. Resolve access
  and ask me to retry.
After every successful write, confirm in one line:
  ✅ Captured: <path> — "<summary>" — <commit sha or PR url>

## 9. Scheduled tasks (Apex)
The canonical inventory, schedules, and prompt texts live at
.claude/skills/cowork-scheduled/ (README.md = inventory; one dir per task with
SKILL.md = the prompt, PROVENANCE.md = deploy log). Never edit a task prompt
in Cowork chat: edit SKILL.md, commit, deploy via
mcp__scheduled-tasks__update_scheduled_task, record the deploy in
PROVENANCE.md. If Cowork's live prompt differs from SKILL.md, the repo wins.
This file deliberately does NOT restate task schedules or prompt contents.

## 10. Hard rules
1. Never invent business facts — memory/ + connectors or [ASSUMPTION].
2. Never duplicate the Notion workstack into the folder.
3. Never overwrite or delete in memory/ — supersede with forward links.
4. Never commit secrets.
5. Never force-push; Tier 1 → main, Tier 2 → PR branch.
6. Never write to Notion/Jira/Teams/Outlook without the relevant Apex skill
   or Dylan's explicit confirmation in this conversation.
7. Never claim "done" without evidence (system + timestamp + link).
8. Every fact lives in one file. If you find the same fact in two files,
   that is a defect: fix it (keep the canonical copy per core/MAP.md,
   replace the other with a pointer) or flag it if the fix needs Tier 2.

## 11. End of any non-trivial session
Answer four questions, each producing a write or an explicit "nothing durable":
(1) What did Dylan teach? → rules.md / journal.
(2) What was decided? → decisions/.
(3) Next concrete action — is it in Notion?
(4) Did state change? → update NOW.md sections + As-of dates.

## 12. When in doubt
core/MAP.md tells you where everything lives. core/PROTOCOLS.md tells you how
to do anything procedural. memory/state/NOW.md tells you what is currently
true. If you genuinely cannot resolve something from files + connectors, ask
Dylan ONE focused question; otherwise draft with [ASSUMPTION] markers.
```

---

## 6. What changes, what's discarded, and why

| Action | Items | Rationale (audit ref) |
|---|---|---|
| **Create** | core/ (MAP, IDENTITY, PRINCIPLES, PROTOCOLS); memory/state/ (NOW.md, rules.md); inbox/processed/ | Single-source kernel (D1.5), current-truth layer (D2.1, D1.1–1.2), capture-time promotion (D3.1), inbox lifecycle (D3.3) |
| **Rebuild** | CLAUDE.md (thin adapter), README, project-instructions (generated), deliverables root INDEX, decisions INDEX, initiatives INDEX + 6 stale epic files (AP-2514 pattern), roster (Cadel, missing people), business files (de-duplicated), glossary (July terms) | D2.2, D2.5–2.6, D3.5, D1.1–1.3 |
| **Fix** | 3 command→skill names; mangled EOD SKILL block; wrong MCP tool IDs; EOD-time contradictions; templates/prd references; settings.json paths; supersede markers on duped decisions; "Current" label on stale prompt snapshots | D4.5, D2.3–2.4, D5, D1.3–1.4 |
| **Retire (with pointer stubs)** | COWORK.md body; profile/* as authorities; metrics.md; workspace/; weekly/monthly scheduled cadences; hooks | Dead or duplicated machinery (D3.2, D3.6); stubs keep old references resolving |
| **Delete outright** | .claude/worktrees (205 MB); stray `C:\` nested dir; root junk files; retros/session/test_write; empty career-sanitiser/ | D1.6, D6 — pure hazard, no information content |
| **Not touched** | decisions/ content, learnings/ content, deliverables/ content, agents, dylans-voice, career-portfolio architecture, playbooks | The preserve list — content is the value; only the scaffolding failed |
| **Needs Dylan / connector input (content, not structure)** | NOW.md initial contents: current strategy (post May–July window), owned surfaces post-restructure, active epic list, Q3 OKRs if they exist | I can draft from July learnings/deliverables + Jira live pull, but Dylan must confirm — this is exactly the file that must not start life stale |

**Deliberately out of scope for Phase 3** (needs its own decision): deploying the Teams `read_resource` patch and fixing the live scheduled tasks. That's production Apex surgery, not file restructuring — but it's the single highest-value action in the whole audit (11 weeks of Teams blindness) and I recommend doing it immediately after migration.

---

## 7. Questions where your answer changes the design (one batch)

**Q1 — Restructure depth.** In-place rebuild (recommended: keep memory/ + .claude/ paths, add core/ + state/) vs full clean re-namespace (prettier tree, but every deployed prompt/skill/agent needs a path migration and the deploy loop is the system's weakest link)?

**Q2 — Apex prioritisation model.** The PI says dual-stack (Stack A "Mine" / Stack B "Complement" with leverage scoring); the deployed prompt uses a flat P0–P3 4-bucket model; outputs oscillate. My recommendation: **simplified dual-stack** — keep Stack A (Mine, cap 3), collapse Stack B to a one-line leverage watch (the full Stack B machinery — leverage scoring, suppression rules — was never validated in its 30-day review and is exactly the kind of complexity weak models fumble). Alternatives: full dual-stack as specced, or flat single stack.

**Q3 — Non-OS project trees in the repo** (apex-pm, EIH Automation, shared-growth-memory, horizon-snapshot-rebuild, Farm Map Drawing Tool, Grazing management tool). Keep in place but declare them in MAP.md as "not the OS — do not load" (recommended, zero migration risk) vs move them out of C:\Dylan PM entirely (cleaner, but breaks AP-2514-style pointers and any Cowork tasks reading them)?

**Q4 — Legacy Apex machinery.** The apex-pm local server + 4 apex-* commands + AI-Pulse prompts appear dead/orphaned (server not running, source_trust.json missing, prompts never canonicalised). Retire all three (recommended — archive, don't delete) vs keep any of them?

---

## 8. Contrarian options considered

**Option B — clean-slate re-namespace.** Retire memory/ entirely; new tree `os/{kernel,state,knowledge,decisions,journal,deliverables,ops}`. Cleaner conceptual model, better naming, breaks all deployed references. Rejected because the redeploy loop is the system's least reliable component (evidence: D4.2). Becomes attractive if Q4 = "retire the legacy machinery" AND the scheduled prompts are being redeployed anyway — then the migration window is already open. Genuinely viable; I'd put it at 35% the right call today.

**Option C — the radical one: a 6-artifact OS.** Delete the taxonomy entirely. The system becomes: `SYSTEM.md` (kernel, one file) + `NOW.md` + `rules.md` + `decisions/` + one flat dated `journal/` + `deliverables/`. No business/, no initiatives/, no integrations/, no retros/ — on the bet that connectors already hold operational truth (Jira knows the epics, HubSpot knows the customers, Granola knows the meetings) and the OS only needs identity, state, rules, decisions, and outputs. Maximum survivability for weak models (nothing to misroute), near-zero maintenance. Rejected because the audit shows real recall value in glossary, integration contracts (tool gotchas), and initiative changelogs that connectors don't hold — but it's the right *direction*, and the recommended design is Option C's spirit with a thin taxonomy: if in doubt about any directory, we should delete it, not keep it.

**Option D — status quo + patches.** Fix the ~40 defects individually, keep the architecture. Rejected: the audit shows the defects are symptoms of three structural causes (dead-process maintenance, duplication, no freshness contract). Patching without fixing those reproduces the same state by October.

---

## 9. Phase 4 preview — context packs (design, build after core settles)

`packs/` at repo root: `chat-core.md` (≤2k words: identity + principles + NOW summary + rules digest, self-contained, no file references), optionally `chat-domain.md` (glossary + product capsule). Each pack ends with a generation stamp: `Generated 2026-07-16 from core/ + state/ — regenerate via /pack-regen; stale after 14 days`. Regeneration is a skill (Phase 5) run on demand and nagged by the Morning Brief when a pack's stamp exceeds its shelf life. Packs are pure derivatives — editing a pack directly is prohibited by PROTOCOLS (the edit belongs in core/ or state/).

## 10. Phase 5 preview — skills roadmap (detail after implementation)

Priority order: (1) `system-maintain` (regenerate INDEXes/packs, freshness sweep, duplication check — the janitor); (2) `state-update` (refresh NOW.md from Jira/Notion/HubSpot live pulls with Dylan confirmation); (3) `session-handoff` (cross-surface capture, replaces multi-surface-capture playbook); (4) `pack-regen` (Phase 4 derivative builder — may fold into system-maintain); (5) workflow skills already extant (prd, focus, reconcile) get path updates, not rebuilds.

---

## 11. Self-check

- **Internal consistency:** the PI draft references only files this proposal creates (core/*, state/*) or preserves (integrations, cowork-scheduled, learnings, decisions, retros). No orphaned references. Verified against §2 tree.
- **No duplication:** the PI restates nothing that lives in repo files except the six-line session-start list and hard rules — both deliberately duplicated as bootstrap (a model needs them before it has read anything). Flagged as the one accepted duplication; MAP.md will name PI as "generated, non-canonical".
- **Weak-model test:** every procedure in the PI draft is numbered, path-exact, and condition-explicit. The freshness rule and write-failure shape are verbatim-executable.
- **Judgement calls made and flagged:** in-place vs clean-slate (§1, Q1); simplified dual-stack recommendation (Q2); metrics.md retirement (§2); workspace/ retirement (§2); treating Teams-patch deployment as out of scope for Phase 3 (§6).
