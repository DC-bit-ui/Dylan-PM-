# Phase 1 Audit — Dylan PM Operating System

**Date:** 2026-07-16 · **Auditor:** Claude (Fable 5), Cowork session · **Mode:** read-only
**Coverage:** full inventory of `C:\Dylan PM`; direct read of all core/governance files; four parallel audit agents covering (1) decisions/learnings/retros, (2) integrations/scheduled-tasks/inbox, (3) .claude machinery/playbooks/templates/hygiene, (4) business/people/initiatives/deliverables. All 22 decisions, all INDEXes, ~50 learnings, ~20 retros, all 14 scheduled-task dirs, all agents/commands/skills read. Confidence markers used throughout; findings sourced from agent reads are [high] unless noted.

---

## 1. System map — what exists

| Area | Contents | Verdict |
|---|---|---|
| **Root instruction files** | `CLAUDE.md` (master prompt, ~340 lines), `COWORK.md` (Cowork contract, ~380 lines), `cowork/project-instructions.md` (paste-ready PI), `README.md` | Heavy 3-way overlap; README 2.5 months stale; COWORK.md has §12 duplicated twice in the same file |
| **memory/profile/** | identity, communication, working-style, decision-frameworks | Identity strong (updated 2026-05-11). Communication/working-style/decision-frameworks frozen at **2026-04-28** — zero promotions ever landed |
| **memory/business/** | company, products, customers, strategy, metrics, glossary | strategy last touched 2026-05-12 (period "May–July" ends this month); glossary freshest (2026-07-10); metrics is a never-filled template; company/products/customers frozen pre-pivot |
| **memory/people/** | roster.md | July restructure captured, but **Cadel still listed active** despite departing ~2026-07-06; DJ, Jo, Matthew Warnken, Will Donovan missing |
| **memory/initiatives/** | INDEX + 7 epic files | 6 of 7 frozen at 2026-04-28 bootstrap; none reflect the 2026-05-12 pause; July-active epics (AP-2301, AP-2278, AP-2566, consents, Horizon Profile rebuild) have no files. AP-2514 is the lone well-maintained exemplar |
| **memory/decisions/** | 22 ADRs + INDEX | **Crown jewel.** Genuine ADR discipline. But 4 files missing from INDEX, 0 supersede markers despite real supersessions, 2 near-duplicate files (9 Portfolio Rules ×2) |
| **memory/learnings/** | 93 files across 4 months + 5 INDEXes | High-value content; **all 4 monthly INDEXes wrong or missing**; root INDEX mislabelled + "Promoted" table empty; ~20 behavioural rules flagged for promotion that never happened |
| **memory/retros/** | ~50 session EODs + INDEXes | Consistent format, but **write-only** — nothing reads them back. Weekly/monthly/initiative retros: promised, zero exist. Both INDEXes mismatch reality; one truncated |
| **memory/integrations/** | 9 connector contracts + cowork/ prompt snapshots + apex-data-sources.md | Good template, but wrong MCP tool IDs (3 naming variants for the same tools), stale snapshots marked "Current", INDEX 2.5 months stale |
| **.claude/skills/cowork-scheduled/** | 14 task dirs, SKILL+PROVENANCE each | **Best governance pattern in the system** (version-controlled prompts, deploy logs, SHA verification). But: Teams `read_resource` fix applied-in-repo, **never deployed — production Teams-blind for ~11 weeks**; `daily-briefing` is a live-firing `TBD` stub; EOD SKILL has a mangled copy-paste block with fake URLs; 3 live prompts (AI-Pulse ×2, memory-curator) exist only as stale snapshots elsewhere |
| **.claude/agents/** | 10 agents | Uniformly good frontmatter and house style. Keep |
| **.claude/commands/ + skills/** | 14 commands, 19 skill dirs | Thin-wrapper pattern is correct; 3 command→skill name mismatches (`/decision`→`decision-log`, `/standup`→`daily-standup`, `/learn`→`log-learning`); `career-sanitiser/` is an empty dead dir; 4 apex-* commands depend on a local server that isn't running |
| **.claude/hooks/** | 3 bash scripts | Dead on Dylan's Windows machine (need bash+jq+/tmp). The CAPTURE nudge they were meant to enforce silently never fires |
| **.claude/worktrees/** | 2 full stale repo copies | **~205 MB of duplicate corpus** (git marks one prunable); pollutes every search/recall with stale duplicates |
| **inbox/** | ~77 files | Lifecycle never ran: `inbox/processed/` doesn't exist, 31 apex-morning briefs accumulated since 2026-05-21, two contradictory consumption models documented for the same directory |
| **workspace/** | current/ + archive/ | Violates its own 2-week rule; actions.md is an empty 2026-04-28 snapshot a literal model would read as "Dylan has no work" |
| **playbooks/ templates/** | 8 + 6 files | Mostly sound. `templates/prd.md` is a pointer, but deliverable-builder agent + prd/one-pager skills still instruct "use templates/prd.md" as a skeleton |
| **memory/deliverables/** | ~45 files, 9 subdirs | **The freshest, highest-value content in the system** (July PRDs, Verterra JV strategy, bank/reef strategy pack) — but root INDEX is truncated mid-word and indexes ~3 of ~45 files |
| **Root legacy** | apex-pm/ (untracked, un-ignored), EIH Automation/ (venv, ignored), shared-growth-memory/ (5,200+ files, "never write here"), horizon-snapshot-rebuild/, Farm Map Drawing Tool/, Grazing management tool/, stray `C:\Dylan PM\C:\Dylan PM\...` nested dir, ~10 junk files (.tmp, .lock, broken symlink) | The "PM OS" repo has become a general dumping ground for code projects and artifacts |

---

## 2. What's working — preserve

1. **The decisions corpus.** 22 ADRs with context/alternatives/consequences/revisit-triggers. The single best-maintained layer.
2. **The tiered write protocol + no-silent-fallback rule + connector-first + reconciliation concepts.** The governance *thinking* is excellent — the failures are in execution machinery, not design intent.
3. **cowork-scheduled PROVENANCE discipline** — version-controlled prompts with deploy logs. Rare and valuable. It's also what made this audit possible: the system documents its own defects.
4. **apex-data-sources.md** — canonical Teams channel inventory + T0–T3 source tiers. Most load-bearing operational doc.
5. **identity.md, dylans-voice skill, glossary (July parts), roster structure, the 10 agents, thin-wrapper command pattern, daily-enrichment-pipeline SKILL** (reference implementation quality).
6. **AP-2514 initiative file and prds/ + meetings/ sub-INDEXes** — the patterns that actually work, ready to be generalised.
7. **July deliverables** — bank strategy, Verterra JV, Horizon Profile PRDs. This is where the *real current state* of Dylan's world lives.
8. **Career-portfolio compliance architecture** — 9 rules → sanitiser → canary → gated promotion, bound to real employment clauses.

---

## 3. Defect register

### D1 — Duplication (single-source-of-truth violations)

| # | Defect | Evidence |
|---|---|---|
| D1.1 | Epic/ownership facts maintained in **4 places**, all disagreeing | `initiatives/INDEX.md`, `glossary.md` lines 74–80, `products.md`, `strategy.md` — only strategy reflects the pivot |
| D1.2 | Ownership map duplicated | `strategy.md` §"Where Dylan owns" vs `identity.md` §"Surfaces & ownership" — both pre-pivot |
| D1.3 | Apex prompts in **two trees**, stale one flagged "Current" | `memory/integrations/cowork/apex-morning-briefing-prompt-2026-05-20.md` (DM-only Teams, INDEX says "Current") vs `.claude/skills/cowork-scheduled/apex-morning-briefing/SKILL.md` (fresher, self-declared canonical) |
| D1.4 | Two near-identical "9 Portfolio Rules" decisions; two near-identical Letter-of-Offer learnings | `2026-05-11-portfolio-rules.md` / `2026-05-12-career-portfolio-9-rules.md`; `2026-05-11` / `2026-05-12` letter-of-offer files |
| D1.5 | CLAUDE.md ↔ COWORK.md ↔ project-instructions restate the same protocols at length; they have already diverged (see D4.1) | Three ~350-line files each carrying write protocol, connector-first, reconciliation, hard rules |
| D1.6 | ~205 MB stale worktree copies of the entire corpus | `.claude/worktrees/tier-0-cowork-skills-pull` (119 MB, git-prunable), `cowork-dylans-voice-greeting` (86 MB, locked by another machine) |
| D1.7 | COWORK.md contains its own §12 twice | lines 337–339 and 366–368 |

### D2 — Staleness (facts overtaken by events, no flag raised)

| # | Defect | Evidence |
|---|---|---|
| D2.1 | **Strategy period expires this month**; no July refresh despite major new themes (bank/water-quality credits, natural-capital positioning, Horizon Profile) sitting in learnings/deliverables | `strategy.md` last-updated 2026-05-12; July files `2026-07-14-bank-water-quality-credit-strategy.md` etc. |
| D2.2 | Cadel departed ~2026-07-06; still active in roster, company.md, products.md, AP-2116 DRI; decision `2026-05-05-notion-default-jira` rests on his complaint with no annotation | roster.md lines 25–31 vs Steve/Gayathri entries referencing "post-Cadel departure" |
| D2.3 | EOD schedule recorded as 12:00 SAST in working-style.md + cowork.md; reality is 17:30 (deployed cron, retros, PI) | Three-way contradiction; working-style also contains an impossible SAST→AEST conversion |
| D2.4 | Wrong MCP tool IDs in integration contracts (3 naming variants); a literal model calling documented IDs fails | `jira.md`/`confluence.md` cite `mcp__b19a3849…` (live is `mcp__52e82941…`); `apex-data-sources.md` cites `mcp__claude_ai_Microsoft_365__read_resource` (live is `mcp__8ec8f3ea…`) |
| D2.5 | README, local-setup playbook, .git config still reference retired bootstrap branch `claude/setup-claude-system-9cDDB` | Retired 2026-04-28 per CLAUDE.md §12 |
| D2.6 | "Snapshot"→"Horizon Profile" rename (2026-07-11) not propagated: no glossary term, business files still say snapshot | decision `2026-07-11-snapshot-renamed-horizon-profile.md` |
| D2.7 | settings.json permission allowlist targets `//home/user/Dylan-PM-/**` — a path that exists on no current machine | `.claude/settings.json` |

### D3 — Dead feedback loops (the systemic failure)

| # | Defect | Evidence |
|---|---|---|
| D3.1 | **Promotion pipeline never ran once.** 93 learnings, ~20 explicitly flagged "promote to working-style"; profile files frozen at 2026-04-28; root INDEX "Promoted" table empty | grep of memory/profile/ for promoted terms → zero hits |
| D3.2 | **Weekly sweep / weekly retro / monthly review never executed.** Zero weekly retros exist; curation-cadence decision (2026-04-28) unexecuted for 11 weeks | `retros/` weekly = "(none yet)"; no sweep outputs anywhere |
| D3.3 | **Inbox lifecycle never ran.** `inbox/processed/` doesn't exist; 72 files accumulated; README says "empty is healthy" | inbox/cowork/ listing |
| D3.4 | **EOD retros are write-only.** ~44 files, one downstream read ever found; morning briefing doesn't read yesterday's EOD | agent cross-reference sweep |
| D3.5 | **INDEX maintenance failed universally.** 4/4 learning INDEXes wrong; deliverables INDEX truncated mid-word ("~75-100k token savin"); 2 retro INDEXes mismatch; decisions INDEX missing 4 files; 2 INDEXes physically truncated | per-directory checks |
| D3.6 | Hooks (the CAPTURE enforcement) silently dead on Windows | bash+jq+/tmp dependencies |
| D3.7 | Retro self-signal ignored: EODs report "0 completions" near-daily, including "second consecutive day of zero progress" (2026-07-16) — no mechanism consumes this | session EOD corpus |

### D4 — Spec-vs-reality drift (instructions describe a system that doesn't exist)

| # | Defect | Evidence |
|---|---|---|
| D4.1 | **Project Instructions §10 describes dual-stack Apex + Weekly Sweep + Monthly Review; none exist as scheduled tasks.** Deployed morning prompt uses a flat P0–P3 4-bucket model. Production output oscillates between the two formats | `2026-07-06-apex-morning.md` (Stack A/B format) vs `2026-07-13/15/16` (4-bucket format) |
| D4.2 | **Teams `read_resource` patch applied in repo 2026-05-22, never deployed.** Every scheduled run since has been blind to Teams channels — the source apex-data-sources.md calls "the richest live source of task ground-truth". July briefs self-report the blindness | PROVENANCE files: "pending Prompt G deploy"; brief footer "v2026-05-20" |
| D4.3 | `daily-briefing` scheduled task: enabled, fires weekdays, prompt is literally `TBD` | its SKILL.md |
| D4.4 | AI-Pulse subsystem orphaned: 3 prompts depend on `apex-pm/ai-pulse/source_trust.json` which doesn't exist; prompts absent from canonical inventory | memory/integrations/cowork/ snapshots |
| D4.5 | `apex-eod-reconciliation/SKILL.md` observability block mangled — commit messages say "[apex-morning]", filenames embed fake URLs (`http://apex-morning-no-op.md`) | SKILL.md lines ~133–160 |
| D4.6 | Git-sync story contradictory: PI §9 says commit/push/PR from VM; cowork.md says "GitHub MCP superseded — filesystem mount only"; PROVENANCE shows most tasks never had a verified deploy | cross-file comparison |
| D4.7 | Dual-stack decision's own revisit-trigger fired (owned surfaces changed at the pivot) and was never actioned | `2026-04-28-dual-stack-prioritisation.md` |

### D5 — Literal-model hazards (structure relying on inference)

- INDEX table headed "Recent (last 30 days)" contains 3 months of entries — a literal reader misses July items.
- Empty "Promoted → standing rules" table implies promotions exist.
- `workspace/current/actions.md` reads as "Dylan has no tasks" unless the model infers "fallback file, stale".
- `templates/prd.md` is a pointer; three other files instruct models to use it as a fillable skeleton.
- Command names ≠ skill names (3 cases) — literal resolution fails.
- A meeting synthesis carries `type: retro` frontmatter; a morning briefing is filed under retros/session/.
- `2026-05-21-onedrive-git-contention.md` contains three contradictory root-cause conclusions with strikethroughs; a literal reader can act on the retracted recommendation.
- Mangled EOD observability block (D4.5) would make a weak model write wrong commit messages or fetch fake URLs.
- Timezone conversions wrong in multiple files (14:00 AEST for 12:00 SAST; "18:32 AEST" for a claimed 16:30 SAST cron).

### D6 — Repo hygiene

- apex-pm/ (~80 files) untracked but not gitignored → pollutes every `git status`.
- Stray nested `C:\Dylan PM\C:\Dylan PM\shared-growth-memory\...` directory from a literal-path write bug.
- Root junk: 2× .tmp PDF copies, 4× LibreOffice lock files, an Office owner file, `add_err.log`, a broken symlink `shared-growth-memory-bus`, `zib53jwN`, `retros/session/test_write`.
- Repo contains at least 5 non-OS project trees (apex-pm, EIH Automation, shared-growth-memory, horizon-snapshot-rebuild, Farm Map Drawing Tool, Grazing management tool) with no declared boundary. [moderate — surfaced by agents; contents not deep-read]

---

## 4. Honest assessment — root causes

**The design thinking is genuinely good. The system failed on maintenance economics.** Three root causes explain nearly every defect above:

1. **Maintenance was assigned to processes that never ran.** Promotion → weekly sweep (never fired). INDEX updates → hand-append discipline (abandoned within weeks). Inbox archival → `/inbox-process` (never completed a cycle). CAPTURE enforcement → hooks (dead on Windows). Anything whose upkeep depended on a *separate* process from daily work decayed within a month. The only layers that stayed healthy are the ones maintained *as a side effect of real work*: decisions (written at decision time), deliverables (written at delivery time), glossary (updated when terms came up).

2. **Truth was duplicated, so drift was guaranteed.** The same fact (epic list, ownership, schedules, prompts, protocols) lives in 2–4 places. Every duplicate is a future contradiction; the system now contains dozens, and a model loading it gets whichever version it happens to read first. The three instruction files are the worst case: ~1,000 lines of overlapping governance that have already forked (dual-stack vs 4-bucket).

3. **No freshness contract.** Files carry "Last updated" headers but nothing *consumes* them. There is no rule telling a model what to do with a 10-week-old strategy file, so stale files are silently treated as current. The system can't tell a reader which of two contradictory files wins.

**Net effect:** the durable layers (April world) and the actual current state (July world — pivot execution, bank strategy, Horizon Profile, restructure) have fully diverged. The current state lives in deliverables/, learnings/, and connector systems; the files claiming to *be* the current state are the stale ones. A weak model following instructions literally would today: brief Dylan on paused epics as active, treat Cadel as the AP-2116 DRI, call the tool by a dead MCP ID, miss all Teams channel signal, and file its outputs into INDEXes that lie.

The redesign (Phase 2 proposal, separate document) targets these three causes directly rather than patching the ~40 individual defects.
