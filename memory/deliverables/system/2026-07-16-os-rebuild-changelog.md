# OS Rebuild — Migration Changelog

**Date:** 2026-07-16 · **Executor:** Claude (Fable 5), Cowork session · **Approval:** Dylan approved the Phase 2 proposal + 4 design answers (in-place rebuild / simplified dual-stack / declare-don't-move / retire legacy Apex)
**Companion docs:** [`2026-07-16-phase1-audit.md`](2026-07-16-phase1-audit.md) (defect register D1–D6) · [`2026-07-16-phase2-proposal.md`](2026-07-16-phase2-proposal.md) · ADR [`../../decisions/2026-07-16-os-rebuild.md`](../../decisions/2026-07-16-os-rebuild.md) · [`2026-07-16-skills-roadmap.md`](2026-07-16-skills-roadmap.md)

Every change below is auditable in git history (originals preserved; nothing content-bearing was deleted except pure duplicates/junk).

---

## 1. Created

| Path | What / why |
|---|---|
| `core/MAP.md` | Master index: load order, canonical-source table (fact→file), when-to-load table, directory map, not-the-OS list, stub registry. Fixes D1 (duplication) at the routing layer. |
| `core/IDENTITY.md` | Durable identity + voice + employment capsule (merged from profile/identity.md 2026-05-11 + communication.md durables). Tier 3. Volatile role scope moved out to NOW.md. |
| `core/PRINCIPLES.md` | Single home for behavioural rules, modes, P0–P3, per-audience drafting, 12 hard rules (was triplicated across CLAUDE.md/COWORK.md/PI — D1.5). Adds hard rule 8 (single-source) and 10 (prompt-deploy discipline). |
| `core/PROTOCOLS.md` | All procedures, weak-model-proofed: freshness contract, connector-first, reconciliation, tiered writes + capture + no-silent-fallback, naming/INDEX policy, git (403 + mount rules), deploys (frontmatter strip + sentinel), inbox lifecycle, end-of-session ritual, regeneration rules. |
| `memory/state/NOW.md` | THE current-truth file: strategy threads, Dylan's epics (verified live in Jira 2026-07-16), org post-restructure, open threads, naming, schedules. Freshness-dated per section. Fixes D2.1/D1.1/D1.2. |
| `memory/state/rules.md` | Learned-rules register, Tier 1 append-only, loaded every session. Seeded with 23 entries extracted from the 93-file learnings corpus (the rules flagged for promotion that never graduated — fixes D3.1 by promoting at capture time). |
| `memory/state/last-sweep.md` | Machine-checkable sweep marker (Morning Briefing warns >14 days). |
| `memory/initiatives/archive/` | Closed epics live here (5 files moved — see §3). |
| `memory/deliverables/handoffs/`, `memory/deliverables/system/` | New filing subdirs; system/ holds audit, proposal, this changelog, skills roadmap. |
| `inbox/processed/` | The archival half of the inbox lifecycle that never existed (D3.3). One-time backfill: 74 accumulated files moved into `processed/<YYYY-MM>/` by filename date. |
| `packs/chat-core.md` | Phase 4: self-contained chat-surface context pack, generation-stamped, stale-after 2026-07-30. |
| `playbooks/pack-regen.md` | Pack regeneration procedure (when, how, size discipline, weak-model check). |
| `memory/decisions/2026-07-16-os-rebuild.md` | The ADR for this rebuild (incl. simplified dual-stack decision + revisit triggers, 30-day validation ~2026-08-16). |
| `memory/deliverables/system/2026-07-16-skills-roadmap.md` | Phase 5: 8 recommended skills, build order (deploy-scheduled-task first). |

## 2. Rebuilt (full rewrite; original in git history)

| Path | Change / rationale |
|---|---|
| `CLAUDE.md` | 340-line master prompt → ~45-line thin Claude Code adapter pointing at core/. Career-signal protocol retained (condensed). Kills the three-way instruction fork (D1.5/D4.1). |
| `COWORK.md` | → pointer stub (content merged into core/; had duplicated its own §12 — D1.7). |
| `README.md` | → accurate map of the rebuilt system (was 2.5 months stale, cited retired branch — D2.5). |
| `cowork/project-instructions.md` | → regenerated: bootstrap essentials + pointers only; simplified dual-stack; no restated schedules/prompts (they drifted — D4.1). **Dylan action: re-paste into Cowork → Project → Settings.** |
| `memory/people/roster.md` | Cadel marked DEPARTING (was listed active — D2.2); added Matthew Warnken, Will Donovan, DJ, Jo, Daniel Wortmann, DROVER; two-Wills disambiguation; freshness header. |
| `memory/business/company.md` | De-duplicated (org table → roster/NOW; product list → products.md); ECP revenue fact surfaced; dual positioning note. |
| `memory/business/products.md` | Statuses/epics/owners stripped (→ NOW.md, single-source); added HORIZON Profile, Groundwork, Verterra detail, bank offering; LawrieCo → archive section. |
| `memory/business/customers.md` | Placeholders resolved where evidence existed: ops-registrar persona (Jo/DJ), bank-buyer persona [moderate], Stormboy targeting facts. |
| `memory/decisions/INDEX.md` | Regenerated in full — all 23 decisions (4 were missing), supersede statuses added (0 existed — D3.5). |
| `memory/initiatives/INDEX.md` | Regenerated — active-with-file / active-Jira-only / archived, statuses verified live in Jira 2026-07-16 (was frozen at the 2026-04-28 snapshot, pre-pivot — D2). |
| `.claude/commands/sweep.md` | Rewritten to the new maintenance role (indexes, freshness, rules graduation, duplication check, packs, inbox, marker). |
| `.claude/settings.json` | Dead `//home/user/Dylan-PM-/**` permission paths → `//c/Dylan PM/**` (D2.7); dead hook registrations removed. |
| `inbox/cowork/README.md`, `workspace/current/*` | Single inbox lifecycle model documented (the contradictory apex-pm-workbench model retired — D3.3); workspace retired (actions.md was a stale-data hazard — D5). |

## 3. Moved

- `memory/initiatives/{ap-1963,ap-1964,ap-1965,ap-2009,ap-2116}*.md` → `memory/initiatives/archive/` (all verified **Done** in Jira 2026-07-16; their status blocks still say "Development" — the INDEX warns readers).
- `workspace/current/handoff-2026-04-29.md` → `memory/deliverables/handoffs/`.
- `.claude/commands/apex-{morning,midday,afternoon,chat}.md` → `apex-pm/retired-commands/` (Q4: retire legacy Apex; the local server they drive is dead). Note: `apex-pm/` is now gitignored, so the retired copies live on disk + git history only.
- 74 inbox files → `inbox/processed/<YYYY-MM>/` (one-time backfill).

## 4. Fixed in place

- `.claude/skills/cowork-scheduled/apex-eod-reconciliation/SKILL.md` — OBSERVABILITY block repaired (was corrupted: apex-morning commit prefixes, filenames mangled with fake `http://apex-morning-*.md` URLs — D4.5).
- `apex-morning-briefing/SKILL.md` + `apex-eod-reconciliation/SKILL.md` — appended dated **SYSTEM UPDATE override blocks**: kernel reads, yesterday-EOD read-back, freshness sweep + hygiene warnings (morning), NOW.md upkeep + inbox archival (EOD), simplified dual-stack output. **DEPLOY PENDING** — recorded in both PROVENANCE files; ships together with the still-undeployed 2026-05-22 read_resource patch.
- `daily-briefing/SKILL.md` — retirement notice (live task already gone; decision 2026-04-29 finally executed).
- Skill updates appended (override-note pattern): `focus`, `daily-standup`, `reconcile`, `log-learning`, `recall`, `okr-check`, `brief`; `complement` marked SUPERSEDED (Stack B retired).
- `.claude/agents/deliverable-builder.md` — `templates/prd.md` reference corrected to "pointer only, never paste as PRD" (D5).
- `templates/{brief,one-pager,decision-memo}.md` — canonical-source banners (agriprove-pm/Confluence wins — extends the prd.md pattern).
- `memory/integrations/{jira,confluence,teams,cowork}.md` + `cowork/apex-data-sources.md` — correction banners: stale tool-ID prefixes (trust tool NAMES — D2.4), Teams channel procedure, EOD=17:30 SAST (D2.3), canonical prompt store.
- `memory/business/glossary.md` — added HORIZON Profile, Groundwork, DROVER, EIH, ACWIS, AASB S2; stale "Active Jira epics" block → pointer to NOW.md (D1.1); P0–P3 pointer fixed.
- Supersede notes appended: `2026-05-11-portfolio-rules.md` (→ 05-12 canonical), `2026-04-28-dual-stack-prioritisation.md` (→ os-rebuild), `2026-05-12-letter-of-offer-key-clauses.md` (duplicate of 05-11) — D1.4.

## 5. Superseded to pointer stubs (content relocated, originals in git)

`memory/profile/{identity,communication,working-style,decision-frameworks}.md` → core/ + state/ (paths kept alive because deployed prompts reference them) · `memory/business/metrics.md` → retired (never-populated template, D2) · learnings INDEXes ×4, retros INDEXes ×2, deliverables root INDEX, integrations INDEX → abolition stubs (all had drifted or truncated — D3.5; filename convention is now the index; prds/ + meetings/ sub-INDEXes kept, they were accurate) · `memory/integrations/cowork/INDEX.md` → HISTORICAL banner (withdrew the wrong "Current" label — D1.3; AI-Pulse ×2 + memory-curator prompts formally retired, their `apex-pm/ai-pulse/` dependency never existed — D4.4).

## 6. Deleted outright (no information content / pure duplicates)

`.claude/worktrees/` (2 stale full-repo copies, ~205 MB, one git-prunable — D1.6; worktree registrations pruned) · stray `C:\Dylan PM\C:\` nested dir (literal-path write bug — D6) · root junk: 2× `.tmp` PDF copies, `zib53jwN`, `add_err.log`, LibreOffice lock files, Office owner file, broken `shared-growth-memory-bus` symlink · `memory/retros/session/test_write` (bootstrap probe) · `.claude/hooks/` (3 bash scripts, dead on Windows — D3.6; capture discipline moved to PROTOCOLS §End-of-session) · `.claude/skills/career-sanitiser/` (empty dir).

## 7. Live-system actions (not files)

- **Disabled `persona-supplements-refresh`** via MCP — it was documented as superseded+disabled but found `enabled:true` and firing (last run 2026-07-14). PROVENANCE updated; watch for re-arming.
- Verified live scheduled-task inventory (13 tasks); confirmed `daily-briefing` and AI-Pulse tasks no longer exist live.
- `.gitignore`: added `apex-pm/`, `*.tmp`, lock-file patterns.

## 8. NOT done (deliberate, needs Dylan)

1. **Deploy the morning/EOD prompt patches** (incl. the 11-week-old read_resource Teams fix). Highest-value pending action. Use `core/PROTOCOLS.md` §Deploys; build the `deploy-scheduled-task` skill first (roadmap #1).
2. **Re-paste `cowork/project-instructions.md`** into Cowork → Project → Settings (I cannot change project settings from inside the session).
3. **Confirm NOW.md strategy section** — drafted [moderate] from July evidence; leadership-confirmed strategy doc still pending (strategy.md formally covers only May–July).
4. **Employment-structure open thread** (end-of-July deadline) — tracked in NOW.md, not resolvable by the OS.
5. `playbooks/local-setup-windows.md` still references the retired bootstrap branch internally (flagged in playbooks INDEX; low priority).
6. DJ + Jo full names — connector-first fetch on next natural interaction.

## 9. Judgement calls (flagged per quality bar)

- Kept `memory/learnings/` path (not renamed `journal/`) — path compatibility beat naming purity.
- `packs/chat-domain.md` declared optional/on-demand rather than generated — avoids maintaining a second derivative that mostly mirrors glossary.
- Skill updates use appended dated override blocks rather than in-body rewrites — preserves history and is safe against mount truncation, at the cost of some file length; `/sweep` can fold them in later.
- Archived initiative files were NOT edited (their stale status blocks stand, warned about in the INDEX) — append-only principle over cosmetic accuracy.
- `apex-pm/` gitignored per Q3/Q4 answers even though that leaves `retired-commands/` untracked — git history preserves the originals at their old paths.

## 10. Push status

Rebuild committed locally as `f506008` (+ this note as a follow-up commit). `git push origin main` failed from the Cowork sandbox — no GitHub credentials available to the VM (auth-class failure; not retried per rules.md 2026-05-11). **Dylan action: push from Claude Code or a git client** (`git push origin main`). Blobs verified intact pre-push (`git show HEAD:<path>` line counts match working files).
