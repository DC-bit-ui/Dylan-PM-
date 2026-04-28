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

---

## 2. How to access it

`[ASSUMPTION]` Cowork accesses this repo via the **GitHub MCP server** scoped to `DC-bit-ui/Dylan-PM-`. Two patterns:

- **Read:** `mcp__github__get_file_contents` for specific files; `mcp__github__search_code` for keyword scans across the repo
- **Write:** `mcp__github__create_or_update_file` for direct commits; `mcp__github__create_pull_request` for PR-gated changes

If a clone-and-work-locally pattern is available in Cowork (filesystem access), use that for multi-file changes — fewer round-trips.

If the GitHub MCP isn't enabled, this contract is inert. Dylan to enable.

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

**Direction:** this repo is the source of truth. Cowork's writes land here; this is where the diff lives.

**Cadence:**
- **Read at every Apex run** (Morning Briefing 04:45 SAST, EOD Reconciliation 12:00 SAST). Cache in-session; refresh next run.
- **Write on capture moments** — Granola synthesis, decision logged, learning captured, retro written. Don't batch (loses context).

**Conflicts:**
- If Cowork's write would conflict with a recent Claude Code edit, **open a PR** rather than force-push. Manual resolution by Dylan.
- If the working branch has diverged, fetch and rebase onto the latest `main` before committing.

**Branch strategy:**
- `[ASSUMPTION]` Cowork commits to the active feature branch (currently `claude/setup-claude-system-9cDDB`) until that's merged. Then Cowork commits to `main` directly for Tier 1, branches `cowork/<slug>` for Tier 2.

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

- [ ] GitHub MCP enabled, scoped to `DC-bit-ui/Dylan-PM-`
- [ ] Apex Morning Briefing's prompt includes "READ CLAUDE.md and memory/profile/* at start"
- [ ] Apex EOD Reconciliation's prompt includes "WRITE end-of-day retro to `memory/retros/session/` per Tier 1 rules"
- [ ] External skill packs each include a "READ memory/profile/communication.md before drafting" step
- [ ] First write probe: Apex commits a placeholder learning (`memory/learnings/<month>/<date>-cowork-bootstrap-probe.md`) to verify write path works
- [ ] First read probe: Apex Morning Briefing logs which `memory/` files it loaded and the byte counts — confirms the GitHub MCP returned content

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
