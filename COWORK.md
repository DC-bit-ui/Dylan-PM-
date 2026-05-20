# COWORK.md — Instructions for Cowork (Apex + external skill packs)

> **What this is.** The mirror of `CLAUDE.md`, written for the Cowork environment (Apex orchestration + external skill packs `agriprove-pm`, `agriprove-backend`, `agriprove-design`, `soil-carbon-audit`, `soil-carbon-batch-audit`, `internal-comms`).
>
> **Why it exists.** Without explicit instructions, Cowork operates in isolation — it pulls from connected systems but doesn't read Dylan's strategic memory or write back to it. This file closes the loop so the system compounds across both environments.
>
> **How to use this file.** Paste relevant sections into Cowork's project instructions, Apex's system prompt, and each external skill's prompt. The file is the contract; Dylan owns it. Cowork follows it.

**Last reviewed:** 2026-04-28.

---

## 1. What this repo is

The Git repository **`DC-bit-ui/Dylan-PM-`** is Dylan's Claude Code memory + skills + agents. It is the **source of truth for**:

| Domain | Location | What's there |
|---|---|---|
| Master prompt | `CLAUDE.md` | Always-loaded session prompt for Claude Code |
| Profile | `memory/profile/` | Identity, communication style, working rhythm, decision frameworks |
| Business | `memory/business/` | AgriProve company, products, customers, strategy, glossary, metrics |
| People | `memory/people/roster.md` | Internal team + external contacts |
| Initiatives | `memory/initiatives/` | Active AP-project epics, current state |
| Decisions | `memory/decisions/` | ADR-style decision log, append-only |
| Learnings | `memory/learnings/<month>/` | Captured insights, behavioural rules, mental models |
| Retros | `memory/retros/` | Session / daily / weekly / initiative / incident |
| Integration contracts | `memory/integrations/` | How each connector works (Notion, Jira, Granola, Teams, Outlook, HubSpot, Confluence, Cowork itself) |
| Deliverables | `memory/deliverables/` | PRDs, briefs, meeting notes, research |

It is **not** the workstack. Notion is canonical for tasks (per `memory/decisions/2026-04-28-notion-canonical-workstack.md`).

It IS **the source of truth for every Cowork scheduled-task prompt** (as of 2026-05-20). See §1a below.

### 1a. Scheduled-task prompts live here — repo is canonical

Every Cowork scheduled task has its `task_prompt` version-controlled in this repo at `.claude/skills/cowork-scheduled/<task-name>/SKILL.md`. The convention:

```
.claude/skills/cowork-scheduled/
├── README.md                              ← active task inventory
├── apex-morning-briefing/
│   ├── SKILL.md                          ← the task_prompt verbatim
│   └── PROVENANCE.md                     ← pull source, verification, patches, deploy log
├── apex-eod-reconciliation/{SKILL,PROVENANCE}.md
├── daily-enrichment-pipeline/{SKILL,PROVENANCE,VERIFY}.md
├── process-intelligence-bundles/{SKILL,PROVENANCE}.md
├── career-signal-capture/{SKILL,PROVENANCE}.md
├── career-weekly-promote/{SKILL,PROVENANCE}.md
└── career-audit-digest/{SKILL,PROVENANCE}.md
```

**Standing rule for any Cowork operator (human or Claude):**
1. **Never edit `task_prompt` directly in Cowork chat.** Always edit `SKILL.md` in the repo, commit, then deploy via MCP.
2. **Deploy via `mcp__scheduled-tasks__update_scheduled_task`**, reading the new prompt from the repo file. Record the deploy in `PROVENANCE.md` (date, change summary, deployer).
3. **If you find drift** (Cowork's task_prompt differs from the repo file), **the repo wins** — overwrite Cowork's version, then investigate how the drift happened.
4. **For new tasks not yet in the repo**, create the task in Cowork as usual, then on next session bring its `SKILL.md` into the repo as canonical (one-time bootstrap).

This convention closes the "opaque production-prompt" loophole that allowed silent drift between intent and runtime behaviour.

---

## 2. How to access it

**Cowork connects local folders directly** (per Anthropic's [Cowork getting-started docs](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork) and the [Projects feature](https://support.claude.com/en/articles/14116274-organize-your-tasks-with-projects-in-claude-cowork)). The right mechanism is a **Cowork Project pointed at the local clone of this repo** — currently `C:\Dylan PM` on Dylan's machine. Cowork then has **direct filesystem read + write** to the entire repo within its sandboxed VM.

This is cleaner than GitHub MCP for two reasons:
1. **Lower latency** — no API round-trip per file read
2. **Whole-repo context** — Cowork can read all of `memory/` at once, not request files one-by-one
3. **Cowork's GitHub MCP isn't a default connector** — confirmed missing from the standard Cowork connector list (2026-04-28)

### Setup

1. **Clone the repo locally:** `C:\Dylan PM` (per `playbooks/local-setup-windows.md`)
2. **Create a Cowork Project** pointed at that folder:
   - Cowork app → Projects → New Project → "Use existing folder" → select `C:\Dylan PM`
   - Name: `Dylan PM Operating System`
3. **Set Project Instructions** (per Cowork's Project-level instructions): a short bootstrap pointing Cowork at `COWORK.md` — see §3 below
4. **Connect the same MCP set** Cowork already uses (Notion, Jira, Granola, Teams, Outlook, HubSpot, Confluence)
5. **Upload external skill packs** as Cowork skills (`agriprove-pm`, `soil-carbon-audit`, etc.) — these stay in Cowork's Skills layer; this repo's `.claude/skills/` are Claude-Code-side reference content, not Cowork skills

### Git workflow

Cowork modifies files in the connected folder. Two patterns for committing back:

**Pattern A — Cowork commits from the VM (preferred for autonomy):**
- Cowork runs `git add … && git commit -m "[cowork] …" && git push` in the sandboxed VM at the end of a write cycle
- Requires git auth in the VM (PAT or SSH key)

**Pattern B — Dylan commits manually:**
- Cowork writes to the folder; Dylan reviews + commits via Claude Code or a Git client
- Slower compounding, but no auth burden in the VM

Default to **Pattern A** for Tier 1 writes (low-risk, factual); **Pattern B** for Tier 2 writes (which become PRs anyway).

---

## 3. What Cowork should READ at session / job start

**Apex (Morning Briefing, EOD Reconciliation, Command Center) — read every run:**
1. `CLAUDE.md` — for the always-loaded behavioural rules (modes, hard rules, reconciliation rule)
2. `memory/profile/identity.md` — role + mandate
3. `memory/profile/communication.md` — voice + tone (critical for any output Cowork drafts on Dylan's behalf)
4. `memory/profile/decision-frameworks.md` — P0–P3 prioritisation
5. `memory/profile/working-style.md` — connector-first protocol, reconciliation rule
6. `memory/business/glossary.md` — domain terminology
7. `memory/people/roster.md` — when surfacing tasks involving named people
8. `memory/initiatives/INDEX.md` + relevant initiative file — when the work touches an active epic
9. `memory/decisions/INDEX.md` — to avoid contradicting standing decisions
10. `memory/integrations/cowork.md` — Apex's own contract (what it owes Dylan + this repo)

**External skill packs (`agriprove-pm`, etc.) — read when the skill is invoked:**
- All of the above, plus
- `memory/business/products.md`, `customers.md`, `strategy.md` for grounding
- `memory/integrations/<relevant connector>.md` for the systems the skill touches

**Heuristic:** when in doubt, read more. Each `memory/` file is short by design.

---

## 4. What Cowork should WRITE — and how

**Tiered write protocol** — categorises by reversibility and architectural impact.

### Tier 1 — Direct commit (low-risk additions)

Cowork commits straight to the working branch (or `main` if Dylan has merged the bootstrap). No PR needed. Always: date-stamp, append don't overwrite, update the relevant `INDEX.md`.

| Trigger | Where it lands | Notes |
|---|---|---|
| Granola synthesis identifies a new commitment | `memory/learnings/<YYYY-MM>/<YYYY-MM-DD>-<slug>.md` if durable; `memory/deliverables/meetings/<YYYY-MM-DD>-<meeting>.md` for the synthesis | Mark source meeting + timestamp |
| New person referenced in a meeting | append to `memory/people/roster.md` | Use the connector-first protocol — pull name/role from Teams/Outlook before writing |
| Meeting decision — small, scoped (e.g. "use blue not green") | `memory/decisions/<YYYY-MM-DD>-<slug>.md` + update `memory/decisions/INDEX.md` | If the decision contradicts a standing decision in the index, supersede the old one with a forward link — never delete |
| Initiative state change (Jira transition, scope change) | edit `memory/initiatives/<file>.md` — update the status block; add a dated note in the changelog section | Keep the file's history readable; don't truncate |
| EOD reconciliation result that's worth retaining | append to `memory/retros/session/<YYYY-MM-DD>-<slug>.md` | Per Apex EOD's existing summary format |
| Weekly retro | `memory/retros/weekly/<YYYY-WW>-<slug>.md` | Update `memory/retros/INDEX.md` |

### Tier 2 — PR required (architectural / cross-cutting)

Open a PR; Dylan reviews and merges. Use this when the change reshapes how the system thinks, not just what it knows.

| Trigger | Where it lands |
|---|---|
| New behavioural rule emerging from multiple corrections | `memory/profile/working-style.md` (proposed edit) |
| New skill or agent — Cowork detects a workflow worth promoting | `.claude/skills/<name>/SKILL.md` (proposed) |
| Integration contract change — a connector's behaviour shifts | `memory/integrations/<connector>.md` (proposed) |
| Strategy update — Dylan articulates an OKR or pivot | `memory/business/strategy.md` (proposed) |
| Routing rule changes (where what goes) | this `COWORK.md` (proposed) |

PR title: `[cowork] <short description>`. PR body: what triggered the change, evidence (Granola transcript line, decision ID, meeting reference), and proposed wording.

### Tier 3 — Off-limits to Cowork

Cowork must **never write** to:

- `CLAUDE.md` — the master prompt; only Dylan or Claude Code edits
- `.claude/agents/` — agent definitions; system structure
- `.claude/skills/` — skill definitions; system structure (proposing a new skill is Tier 2; editing an existing one is off-limits without explicit Dylan approval)
- `memory/profile/communication.md` — voice spec; never auto-edited
- `memory/profile/identity.md` — same; only Dylan edits

If Cowork detects something it thinks should change in a Tier 3 file, it logs a learning (Tier 1) describing the case and lets Dylan decide.

### Tier 1 — When to capture (judgment, not keywords)

Capture proactively. Default is "write the learning"; the absence of an explicit "remember that" prefix is not a reason to skip.

Cowork captures immediately when Dylan:
- States a preference about how he works, communicates, or thinks ("I prefer X to Y", "don't lead with X", "always Y first")
- Corrects a fact, term, or framing — the correction is the durable content, not the original
- Articulates a rule he expects to apply going forward ("from now on…", "we don't…", "always / never…")
- Introduces a new term, person, product, or concept not already in `memory/`
- Says any explicit signal: "remember that", "save this", "make a note", "include this in memory", "add to memory"
- Repeats the same correction twice in one conversation — that's the signal, regardless of phrasing

The trigger is **"Dylan expects this to stick"**, not "Dylan said the magic word".

When the signal is ambiguous, default to capture with `[moderate]` confidence and a note `supersede if corrected`. False positives are cheap (Dylan supersedes); false negatives compound (Dylan repeats himself).

Do not capture: speculation, brainstorming, opinions about external topics, in-the-moment frustration without an attached rule.

### The no-silent-fallback rule

The **canonical memory location is the filesystem at the connected folder root** (`<connected-folder>/memory/...`). That is the only place memory lives.

Cowork must NOT use:
- **Claude.ai's built-in "memory" / "auto-memory" tool.** It is a separate, per-session system that Dylan's wider OS does not consume. Captures saved there are invisible to Apex, Claude Code, and every external skill pack.
- **Any parallel folder** (`memory-export/`, `claude-memory/`, `for-import-later/`, `memory-staging/`, etc.). There is no "later import"; files outside `memory/` are not consumed.
- **Conversation-attached files** in lieu of a write, unless Dylan explicitly asks for an attachment.

If the canonical write FAILS (read-only mount, permission denied, path missing, tool returns error), surface it in chat in this exact shape:

> ❗ Memory write failed.
> Path: `<full path under memory/>`
> Capture: `<one-line summary>`
> Tool: `<tool name>` — Error: `<verbatim error>`
> **No fallback created.** Possible causes: connected-folder mount read-only this session, folder access needs re-granting in Cowork → Project → Settings, or parent directory needs creating first.
> Please resolve and ask me to retry.

The capture is now in the conversation only. Better to lose a capture and flag it visibly than to scatter files no one reads.

### Confirm captures in one line

After every successful memory write:

> ✅ Captured: `<path>` — "<one-line summary>" — commit `<sha>` (Tier 1) / PR `<url>` (Tier 2)

One line. One path. One reference.

---

## 5. Universal rules (apply to every write)

1. **Append, don't overwrite.** Never delete content from `memory/`. Supersede with a forward link if a fact has changed.
2. **Date-stamp everything.** Every entry gets a `YYYY-MM-DD` stamp.
3. **Update the INDEX.** When you add a file, the directory's `INDEX.md` must reflect it. Otherwise the system can't find it.
4. **Cross-link.** Use relative paths (`../decisions/2026-04-28-foo.md`) so links survive reorganisation.
5. **Cite sources.** When writing a learning or decision, link to the Granola meeting / Teams thread / Jira ticket / Outlook email that triggered it.
6. **Confidence markers.** Use `[high]`, `[moderate]`, `[low]`, `[ASSUMPTION]` per `memory/profile/communication.md`. Cowork's outputs that go into `memory/` must distinguish what it observed vs inferred.
7. **No flattery, no preamble.** Cowork's voice in this repo matches Dylan's voice — see `memory/profile/communication.md`.

---

## 6. Sync mechanics

**Direction:** this repo is the source of truth. Cowork's writes land in the connected folder; the Git repo is the durable diff log.

**Mechanism:** Cowork has direct filesystem access to `C:\Dylan PM` (the local clone) within its sandboxed VM. No GitHub MCP needed.

**Cadence:**
- **Read at every Apex run** (Morning Briefing 04:45 SAST, EOD Reconciliation 17:30 SAST). The connected-folder access means whole-tree reads are cheap — re-read each run rather than caching across runs (caching invites stale data; the Project Instructions trigger re-read every session).
- **Write on capture moments** — Granola synthesis, decision logged, learning captured, retro written. Don't batch (loses context).
- **Commit + push** at the end of each Apex run cycle (Pattern A) or batch nightly (Pattern B) — see §2.

**Conflicts:**
- If Cowork's write would conflict with a recent Claude Code edit (i.e. the local repo has diverged from origin), Cowork should `git fetch origin && git rebase origin/<branch>` before pushing. If the rebase fails, open a PR with the conflicting branch and let Dylan resolve.
- Never force-push.

**Branch strategy:**
- Until PR #1 (the bootstrap PR) merges: Cowork commits to the active feature branch (`claude/setup-claude-system-9cDDB`).
- After PR #1 merges:
  - **Tier 1 writes** → directly to `main` with `[cowork]` prefix in commit messages
  - **Tier 2 writes** → branch `cowork/<slug>`, push, open PR
- All commits include the source signal in the body (Granola meeting ID, Jira ticket, Teams thread link) per §5 rule 5.

---

## 7. Reading the operating loop

`CLAUDE.md` §7 describes the operating loop for Claude Code:

```
ORIENT → PLAN → DELEGATE → EXECUTE → CAPTURE → RETRO
```

**Cowork follows the same loop, but at scheduled cadence:**

| Step | Apex Morning | Apex EOD | External skill |
|---|---|---|---|
| ORIENT | Read CLAUDE.md + profile/business/people | Same | Same + skill-relevant initiative files |
| PLAN | Identify today's drivers | Reconcile + plan tomorrow | Skill goal in one sentence |
| DELEGATE | (Apex is the orchestrator) | Same | Subagents within the skill if applicable |
| EXECUTE | Pull connectors → synthesise → write Notion | Categorise → sync Jira → set tomorrow | Run the skill |
| **CAPTURE** | **Write back to `memory/`** per §4 | Same | Same — meeting synthesis lands in `memory/deliverables/meetings/` |
| RETRO | (weekly Apex retro) | (daily, into `memory/retros/`) | (per-skill, when notable) |

**CAPTURE is non-negotiable.** Cowork that doesn't write back doesn't compound. Apex skills that synthesise but don't deposit the synthesis into `memory/` are losing the durable insight.

---

## 8. The connector-first and reconciliation rules apply to Cowork too

Cowork already has the connectors (it's the orchestration layer). The behavioural rules from `CLAUDE.md` §6.1 and §6.2 still apply:

- **Connector-first** — when Cowork needs a person fact, ticket status, meeting time, doc edit, etc., it queries the relevant MCP. It does not ask Dylan to confirm what the systems already hold.
- **Reconciliation** — before Apex (or any Cowork skill) presents a task as open, run the reconciliation flow described in `.claude/skills/reconcile/SKILL.md` and `memory/decisions/2026-04-28-reconciliation-flow.md`.

Apex EOD already does part of this; the rule extends it to every output that surfaces work.

---

## 9. End-of-job ritual

When Apex finishes a scheduled run (or an external skill completes a non-trivial task):

1. **What did Dylan teach** — directly or indirectly? (correction, preference, clarification → `memory/learnings/`)
2. **What decisions were made** — explicit or implicit? (→ `memory/decisions/` if durable)
3. **What's the next concrete action** — and is it captured in Notion?
4. **Is a workflow worth promoting** — repeated thrice → propose a skill (Tier 2 PR)

Each of these should produce either a memory write or a deliberate "no — nothing durable today" note. Silence is the failure mode.

---

## 10. Hard rules (non-negotiable for Cowork)

- **Never invent business facts.** If `memory/` doesn't have it and connectors can't confirm it, mark `[ASSUMPTION]` or skip.
- **Never duplicate the Notion workstack** in `memory/`. Notion is canonical.
- **Never overwrite a `memory/decisions/` file.** Supersede with a new dated file + forward link.
- **Never commit secrets.** If a Granola transcript or Teams message contains credentials, redact before writing to git.
- **Never push to a branch other than the working branch (or `main` for Tier 1 once merged).**
- **Never edit Tier 3 files.** Log a learning instead.

---

## 11. Bootstrap checklist for Cowork

### Folder + project setup
- [ ] Repo cloned to `C:\Dylan PM` per `playbooks/local-setup-windows.md`
- [ ] Cowork app updated to latest desktop version
- [ ] **New Cowork Project created**, "Use existing folder" → `C:\Dylan PM`. Name: `Dylan PM Operating System`
- [ ] **Project Instructions** populated with the appendix in §13 below
- [ ] **Global Instructions** (Settings → Cowork → Edit) set the always-on voice rule — see §13

### Connectors + skills (existing Cowork setup, just verify)
- [ ] Notion, Jira, Granola, Teams, Outlook, HubSpot, Confluence connectors all present in this Project's connector list
- [ ] External skill packs uploaded as Cowork skills: `agriprove-pm`, `agriprove-backend`, `agriprove-design`, `soil-carbon-audit`, `soil-carbon-batch-audit`, `internal-comms`
- [ ] Apex skills (Morning Briefing, EOD Reconciliation, Command Center) present and scheduled

### Apex prompt updates
- [ ] Apex Morning Briefing prompt includes: "READ `CLAUDE.md`, `COWORK.md`, `memory/profile/*`, and `memory/integrations/cowork.md` at start"
- [ ] Apex EOD Reconciliation prompt includes: "WRITE end-of-day retro to `memory/retros/session/<YYYY-MM-DD>-eod.md` per Tier 1 rules in COWORK.md §4; commit + push at end"
- [ ] External skill packs each include: "READ `memory/profile/communication.md` before drafting"

### Git workflow in the VM (Pattern A)
- [ ] Git installed in the Cowork VM (verify with `git --version`)
- [ ] Git auth configured (PAT or SSH key) for `DC-bit-ui/Dylan-PM-`
- [ ] `git config user.name "Cowork (Apex)"` and `user.email` set so commits are attributable
- [ ] Test commit: a probe learning (see below) committed and pushed successfully

### Validation probes
- [ ] **Read probe** — Apex Morning Briefing logs which `memory/` files it loaded and their byte counts (confirms folder access works)
- [ ] **Write probe** — Apex commits `memory/learnings/<month>/<date>-cowork-bootstrap-probe.md` containing one sentence, then pushes. Verify on GitHub.
- [ ] **Tier 2 probe** — Apex opens a PR proposing a one-line edit to `working-style.md`. Dylan reviews and merges (or closes if no change needed). Validates the PR-gated path.

---

## 12. Meta — improving this contract

This file is editable. If Cowork notices a routing rule that's wrong (something keeps landing in the wrong tier, or a Tier 3 file that should be Tier 2), **propose the change via Tier 2 PR**. The contract evolves.

---

## 13. Project Instructions — paste-ready

The full Project Instructions live in **[`cowork/project-instructions.md`](cowork/project-instructions.md)** — that file is the canonical text Dylan pastes into **Cowork → Project → Settings → Project Instructions**. It's a separate file because:

1. It evolves on its own cadence — when the contract reshapes, edit one file
2. Source-controlled with the rest of the system
3. Cowork itself can read it via the connected folder if needed

The file is structured with explicit `=== BEGIN PROJECT INSTRUCTIONS ===` / `=== END ===` markers around the paste-ready block. Everything outside the markers is meta (how to update, companion file pointers).

### Recommended Global Instructions (Settings → Cowork → Edit)

Short and always-on across every Cowork session:

```
Default voice: direct, opinionated, no flattery. Cite sources.
Match the active project's COWORK.md or CLAUDE.md if one is present.
Use confidence markers ([high], [moderate], [low], [ASSUMPTION]).
Distinguish live data (this session via MCP) from cached/snapshot data.
```

---

## 12. Meta — improving this contract

This file is editable. If Cowork notices a routing rule that's wrong (something keeps landing in the wrong tier, or a Tier 3 file that should be Tier 2), **propose the change via Tier 2 PR**. The contract evolves.

---

**See also**
- `CLAUDE.md` — the symmetric contract for Claude Code
- `memory/integrations/cowork.md` — the inbound side (what Cowork writes to Notion / Jira and surfaces to this repo via `inbox/cowork/`)
- `memory/decisions/2026-04-28-integration-architecture.md` — the two-layer architecture (Cowork = execution; this repo = memory)
- `memory/decisions/2026-04-28-notion-canonical-workstack.md` — Notion as the workstack source of truth
- `memory/decisions/2026-04-28-cowork-bidirectional-contract.md` — the decision that produced this file
