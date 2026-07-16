# Decisions — INDEX

Last-verified: 2026-07-16 · Verified-by: claude-code (regenerated in full — 23 files, statuses corrected; previously 4 files missing and 0 supersede markers)

> Every meaningful decision, ADR-style. Append-only corpus; this INDEX is **regenerated in full** whenever a decision is added (`core/PROTOCOLS.md` §Naming) — never hand-appended. Superseded decisions stay on disk with a forward-link note.

| Date | Decision | Status | File |
|---|---|---|---|
| 2026-04-28 | Multi-surface strategy — Cowork + repo = system of record; chat/mobile = capture-only via inbox | accepted | `2026-04-28-multi-surface-strategy.md` |
| 2026-04-28 | Layered curation cadence (daily/weekly/monthly/quarterly + triggers) | **superseded 2026-07-16** → `2026-07-16-os-rebuild.md` (cadences folded into daily runs; the weekly/monthly processes never executed) | `2026-04-28-curation-cadence.md` |
| 2026-04-28 | Dual-stack prioritisation (Mine cap 3 + Complement cap 3, leverage scoring) | **superseded 2026-07-16** → simplified dual-stack, `2026-07-16-os-rebuild.md` | `2026-04-28-dual-stack-prioritisation.md` |
| 2026-04-28 | Cowork bidirectional contract — tiered write protocol into memory/ | accepted (protocol text now lives in `core/PROTOCOLS.md`) | `2026-04-28-cowork-bidirectional-contract.md` |
| 2026-04-28 | Reconciliation flow — eliminate phantom-open tasks before surfacing work | accepted (procedure: `core/PROTOCOLS.md` §Reconciliation) | `2026-04-28-reconciliation-flow.md` |
| 2026-04-28 | Connector-first protocol | accepted (procedure: `core/PROTOCOLS.md` §Connector-first) | `2026-04-28-connector-first-protocol.md` |
| 2026-04-28 | PRD template — Confluence canonical, never copy locally | accepted | _(recorded in `templates/prd.md` + `.claude/skills/prd/SKILL.md`)_ |
| 2026-04-28 | Notion canonical for Dylan's workstack; repo = strategic memory | accepted | `2026-04-28-notion-canonical-workstack.md` |
| 2026-04-28 | Integration architecture — two-layer model (execution vs memory) | accepted | `2026-04-28-integration-architecture.md` |
| 2026-04-29 | Delete `daily-briefing`; Morning + EOD are the canonical pair | accepted (EOD = 17:30 SAST) | `2026-04-29-delete-daily-briefing.md` |
| 2026-04-29 | Heavy prescriptive prompts over light prompts for Apex | accepted | `2026-04-29-heavy-prescription-over-light-prompt.md` |
| 2026-05-01 | Proactive memory capture; canonical path only; no silent fallback | accepted (text: `core/PROTOCOLS.md` §Writes) | `2026-05-01-proactive-memory-capture-and-no-fallback.md` |
| 2026-05-05 | Notion default; Jira only on 3 criteria (cross-functional handoff + epic parent + team-visible) | accepted — note: original rationale actor (Cadel) departed 2026-07; rule stands | `2026-05-05-notion-default-jira-criteria.md` |
| 2026-05-11 | 9 Portfolio Rules (career) | **superseded** → `2026-05-12-career-portfolio-9-rules.md` (duplicate) | `2026-05-11-portfolio-rules.md` |
| 2026-05-11 | No proprietary data in external AI tools for portfolio work | accepted | `2026-05-11-no-proprietary-data-in-ai-for-portfolio.md` |
| 2026-05-12 | 9 Portfolio Rules (canonical) | accepted | `2026-05-12-career-portfolio-9-rules.md` |
| 2026-05-15 | Meta-ad leads tagged `storm_boy_campaign_member=Yes` regardless of geography | accepted | `2026-05-15-meta-leads-tagged-stormboy.md` |
| 2026-05-21 | Supplement provenance schema (shared-growth-memory) | accepted — referenced validator script was never built (`[ASPIRATIONAL]`) | `2026-05-21-supplement-provenance-sc