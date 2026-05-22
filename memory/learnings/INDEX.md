# Learnings Index

> Captured learnings, organised by month. The `log-learning` skill files here. The `memory-curator` promotes durable ones into `memory/profile/` or `memory/business/` when they become standing rules.

## Recent (last 30 days)
| Date | Type | Title | File |
|---|---|---|---|
| 2026-05-22 | PM scope / auto-cancel | Auto-cancel must check Outlook sent items for commercial/vendor tasks before firing — Paniri Gen 6 work was complete when EOD cancelled it | `2026-05/2026-05-22-auto-cancel-check-commercial-tasks.md` |
| 2026-05-22 | PM scope | DB permissions are Cadel's responsibility — do not create Notion tasks for Dylan to grant access | `2026-05/2026-05-22-db-permissions-cadels-responsibility.md` |
| 2026-05-22 | PM scope | Jira ticket assignment — devs self-assign when ready; Dylan does not chase assignment; only flag to Cadel if deadline-critical and >2 sprints unassigned | `2026-05/2026-05-22-jira-ticket-assignment-not-dylan.md` |
| 2026-05-21 | infrastructure / deploy-safety | OneDrive transiently truncates `.claude/skills/cowork-scheduled/*/SKILL.md` in the working tree — Cowork deploys must pre-flight-check sentinels + halt-don't-heal; incident #4 of OneDrive contention | `2026-05/2026-05-21-skill-md-onedrive-truncation.md` |
| 2026-05-12 | durable compliance fact | Letter of Offer (220615) key clauses — verbatim text for cl 13.1, 19, 20, 21; corrects 5 interpretation errors from original handoff; basis for career-portfolio 9 Rules | `2026-05/2026-05-12-letter-of-offer-key-clauses.md` |
| 2026-05-12 | business-intelligence | SLT 12 May — strategic pivot (two priorities May–Jul: recruit + Sch 2), cash discipline rules, entity structure live issue | `2026-05/2026-05-12-slt-strategic-pivot-and-cash-discipline.md` |
| 2026-05-11 | compliance | Letter of Offer (220615) key clauses (cl 13.1, 19, 20, 21) + 5 interpretation shifts correcting handoff brief errors — durable compliance facts for career portfolio | `2026-05/2026-05-11-letter-of-offer-compliance-clauses.md` |
| 2026-05-11 | tooling / infrastructure | `git push` from this Claude Code session returns HTTP 403 (auth) — workaround via `mcp__github__push_files`; don't retry, reroute | `2026-05/2026-05-11-git-push-403-workaround.md` |
| 2026-05-04 | correction + operational hazard | PR base-branch routing bug — legacy `claude/setup-claude-system-9cDDB` causes PRs to merge into a phantom (3 instances in 24h); fix is branch deletion + base verification gate | `2026-05/2026-05-04-pr-base-branch-routing-bug.md` |
| 2026-05-01 | diagnostic / mental model | "Looks-like-work" anti-pattern — surface output without durable side effects (Daily Briefing + memory-export both instances this week) | `2026-05/2026-05-01-looks-like-work-anti-pattern.md` |
| 2026-04-29 | correction + architecture | Apex prompts live in Cowork per-task Instructions field; "light prompt" hypothesis falsified | `2026-04/2026-04-29-apex-prompts-location-and-falsified-hypothesis.md` |
| 2026-04-29 | preference | Dylan likes visual artifact output for briefings (Daily widget style) — preserve signal even though Daily flow is being deleted | `2026-04/2026-04-29-visual-artifact-preference.md` |
| 2026-04-29 | diagnostic | Cowork bootstrap probe — false negative; folder was un-cloned | `2026-04/2026-04-29-cowork-bootstrap-probe.md` |
| 2026-04-29 | correction | GitHub MCP is web-only — Cowork desktop is filesystem-only | `2026-04/2026-04-29-mcp-surface-availability.md` |
| 2026-04-28 | research | Claude multi-surface architecture in 2026 — and the seam pattern that addresses it | `2026-04/2026-04-28-multi-surface-research.md` |
| 2026-04-28 | mechanism | Curation cadence — weekly default, layered, triggered | `2026-04/2026-04-28-curation-cadence.md` |
| 2026-04-28 | architecture | Dual-stack prioritisation — Mine + Complement, implemented in PR #2 | `2026-04/2026-04-28-dual-stack-implemented.md` |
| 2026-04-28 | correction | Dylan does NOT own T1 Offsets (AP-2187) — strategy.md and initiative file corrected | `2026-04/2026-04-28-t1-offsets-not-owned.md` |
| 2026-04-28 | correction | Cowork uses connected folders, not GitHub MCP — corrected COWORK.md §2 | `2026-04/2026-04-28-cowork-folder-not-mcp.md` |
| 2026-04-28 | architecture | Cowork ↔ this-repo is bidirectional — formalised in `/COWORK.md` | `2026-04/2026-04-28-cowork-bidirectional.md` |
| 2026-04-28 | mechanism + behaviour | Reconciliation rule + connector-first protocol + PRD reference-only | `2026-04/2026-04-28-reconciliation-and-connectors.md` |
| 2026-04-28 | mechanism | Cowork handoff absorbed — system architecture reconciled | `2026-04/2026-04-28-cowork-handoff-absorbed.md` |
| 2026-04-28 | mechanism | Dylan operates with external workflows that need to read/write this system | `2026-04/2026-04-28-external-integration-need.md` |

## Promoted → standing rules
> Learnings that have been confirmed enough to live in `profile/` or `business/`. Linked here for traceability.

| Original date | Title | Promoted to |
|---|---|---|
| _(none yet)_ | | |

## Monthly archives
- `2026-05/`
- `2026-04/`
