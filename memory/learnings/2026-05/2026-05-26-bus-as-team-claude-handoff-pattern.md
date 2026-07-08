---
date: 2026-05-26
source: Claude Code stormboy-tracker session (handoff at inbox/cowork/2026-05-26-ben-work-insights-handoff.md) + Cowork verification session 2026-05-26
tags: [team-bus, claude-code, scale-out, design-pattern, handoff, ben]
severity: durable-pattern
applicability: [will, claudia, kieren, hobbs, harrison-when-active, future-reps]
related:
  - shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md (precedent)
  - shared-growth-memory/INSTRUCTIONS-FOR-BEN.md (this round)
  - shared-growth-memory/team-brain/ben-bootstrap/ (this round)
  - memory/decisions/2026-05-21-feedback-loop-design.md (the consumer side of the bus)
---

# The bus is a handoff substrate for per-rep Claudes — not just a data store

## The pattern

The team's `shared-growth-memory` bus was originally framed as a **storage layer** — atomic JSON files on a SharePoint-OneDrive-synced directory, schemas for patterns / customer-positions / deal-signals / feedback. The Frontier dashboard wrote to it; Kieren wrote to it; Apex wrote to it. Read-and-write data, with conventions about who owns what.

The 2026-05-26 Ben round-trip showed it's also a **handoff substrate**: a place where a per-rep instruction file plus a bootstrap folder turns each rep's Claude Code session into a thin, zero-metered-API consumer of the dashboard's overnight synthesis. The shape:

```
shared-growth-memory/
├── INSTRUCTIONS-FOR-<REP>.md          ← the rep's Claude reads this on every session
└── team-brain/
    └── <rep>-bootstrap/
        ├── CLAUDE.md                   ← portable; the rep copies this folder local
        ├── INSTALL.md                  ← one-time setup
        └── README.md                   ← why + how + cost
```

The rep opens Claude Code in their local copy of `<rep>-bootstrap/`. Claude reads `CLAUDE.md`, resolves the OneDrive path to the bus, reads `INSTRUCTIONS-FOR-<REP>.md`, and waits for their question. The rep asks in plain English. Claude walks the bus (filesystem only, no API spend on the rep's side) and answers with citations to the files it read.

Corrections flow back via the same bus — the rep tells Claude "that's wrong", Claude writes a `feedback/feedback-<id>.json`, OneDrive syncs it to the dashboard's machine within ~60s, and the next overnight coaching run consumes it (once `2026-05-21-feedback-loop-design.md` ships — currently still a fictional `FB → ENG` arrow per `2026-05-21-architecture-diagram-vs-reality-drift.md`).

## Why this is the right shape

1. **Cost separation matches subscription topology.** Expensive synthesis (overnight coaching, pattern curation, persona refresh) runs on Dylan's subscription via Apex / Claude Code on Dylan's laptop. Read-side answers run on each rep's own subscription. No one pays metered API rates for the cross-team workflow because there are no API calls — only filesystem reads.

2. **OneDrive sync is the integration plane, not a service.** No webhooks, no queues, no extra infrastructure. The bus is files; OneDrive moves them. Sync latency is the only coordination cost (~60s typical, ~5min worst-case during initial sync after share).

3. **Schema evolution is conversational, not API-versioned.** When the schema needs to change (e.g., adding `_provenance` per `2026-05-21-supplement-provenance-schema.md`), the change lands in `schemas/` + each consumer's `INSTRUCTIONS-FOR-<REP>.md`, OneDrive syncs it, and every rep's next session reads the new version. No deploys, no version bumps, no breakage windows.

4. **Per-rep specialisation is cheap.** Kieren writes patterns (he's the strategic analyst). Ben reads work-cards + writes feedback (he's the daily sales rep). Will reads call-monitoring dashboards (he's ops). Each `INSTRUCTIONS-FOR-<REP>.md` is shaped around that rep's actual job-to-be-done. The bus doesn't have to be a generic API; the contract is per-consumer.

5. **The bootstrap folder is a portable kit.** The rep copies 3 markdown files to their local drive and is running in ~3 minutes. No npm install, no auth setup, no Docker. The kit is human-readable on its own.

## How to repeat for the next rep

When extending to Will, Claudia, Harrison-if-reactivated, or anyone else:

1. **Confirm the JTBD.** What three questions does this rep ask repeatedly? For Ben: who to follow up, who to revisit, why this card. For Kieren: how do I capture this finding so the team benefits. For Will: ??? (call-monitoring? deal handoffs? ops state?). The JTBD shapes the entire `INSTRUCTIONS-FOR-<REP>.md`.

2. **Identify the read sources.** Which bus folders does their Claude need to walk? Ben: `queues/ben/`, `customer-positions/`, `deal-signals/`, `deal-supplements/`, `contact-supplements/`. Different reps will touch different subsets. Keep it minimal — every additional path is an instruction surface that can go wrong.

3. **Identify the write targets (if any).** Most reps will only write `feedback/`. Kieren writes `patterns/` because that's his job. Don't expand write rights without explicit owner decision — every rep with write access to a folder is a potential source of schema drift.

4. **Pre-compute heavy synthesis on Dylan's side.** If the rep's question requires walking many files (Ben's reengagement question walks customer-positions/), add an Apex scheduled task that pre-computes the answer into a single queue file (`queues/<rep>/<question>.json`). The rep's Claude reads one file instead of N. Pattern named in `.claude/skills/cowork-scheduled/ben-reengagement-digest/SKILL.md` (staged 2026-05-26).

5. **Write `INSTRUCTIONS-FOR-<REP>.md` first, then the bootstrap.** The bootstrap is a thin pointer; the instructions file is where the operational logic lives. Mirror the Ben / Kieren sectioning: 1 = where the bus is, 2 = what the rep asks for, 3 = feedback loop, 4 = atomic writes, 5 = PII rules, 6 = staleness handling, 7 = what NOT to do, 8 = suggested openers, 9 = reading order.

6. **Dry-run before shipping.** Before pinging the rep, run as their Claude: resolve the bus path, check apex-runs.log freshness, read whatever's in their primary queue, output the rendered response. If anything looks off, fix the instruction file — not the conversation.

7. **Ping by Teams with three things only:** (a) location of the bootstrap folder, (b) flow diagram link, (c) concrete first question. Anything more is noise. The instructions file handles depth.

## The fragility

1. **OneDrive sync delays compound across team members.** A correction Ben writes at 11:00 SAST appears on Dylan's machine ~60s later, on Claudia's ~60s after that. In practice this is fine, but it's a real constraint when designing time-sensitive flows.

2. **`INSTRUCTIONS-FOR-<REP>.md` drifts from actual data.** §2b of Ben's instructions was sanity-checked against actual `customer-positions/` and `deal-signals/` on 2026-05-26 and found to rely on data that doesn't exist yet (customer-positions empty, coaching_mode null on 100% of deal-signals). The fix was a fallback path that uses work-cards directly. Lesson: the instruction file must encode honest data-state handling, not just the ideal-state heuristic.

3. **No version control on the bus itself.** `shared-growth-memory/` is SharePoint-synced, not a git repo. Changes to `INSTRUCTIONS-FOR-<REP>.md` aren't reviewable; rollbacks require manual file edits. Mitigation: keep canonical copies of high-stakes instructions in `C:\Dylan PM\shared-growth-memory\` (which IS git-tracked as part of the PM-OS repo), edit there, let OneDrive replicate. This is the current state for Ben — instructions file is in the git-tracked Dylan PM folder, OneDrive carries the propagation.

4. **Apex must be running for the cost model to hold.** If apex-runs.log goes stale (>36h), the queue files don't refresh. Ben's Claude is instructed to warn on staleness but cannot fix it. This is a Dylan-side reliability dependency — the team-bus model only works if Dylan's machine is up most weekday nights. The intelligence-bundles backfire `process-intelligence-bundles` issue (queue jammed at 80 pending, 0 results) is a warning sign here.

5. **The pattern doesn't scale to 20 reps.** It's designed for the current sales+ops team of ~6 people, where each rep's questions are distinct enough that per-rep instruction files are tractable. At 20+ reps you'd want a generic schema + role-based instruction templates. Today's pattern is sized to today's team.

## How to apply

- **Don't propose this pattern for any rep with no JTBD signal yet.** The Ben kit shipped because Ben articulated three concrete questions in Granola d5922502 (2026-05-26). Will / Claudia haven't articulated theirs at the same level of crispness. Wait for them to ask before extending.
- **Don't expand write rights as a default.** Each rep writes `feedback/` and nothing else, unless an owner decision says otherwise.
- **Don't bypass the instruction file** when extending — the temptation is to bake logic into the bootstrap `CLAUDE.md`. Resist. The bootstrap is a thin pointer; the operational logic lives in `INSTRUCTIONS-FOR-<REP>.md` where it can be edited without breaking every rep's local bootstrap copy.
- **Do promote this to a pattern in `shared-growth-memory/patterns/`** once it's been repeated for a second rep (likely Will or Claudia). The third application is the test of whether the abstraction holds.

## Confidence

**Moderate.** Pattern is proven for two reps (Kieren writing, Ben reading) with parallel structure. Third application will be the real test. Risk factors: OneDrive sync reliability, Apex schedule reliability, drift between instructions and actual data state.

## Related

- [`shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md`](../../../shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md) — the precedent
- [`shared-growth-memory/INSTRUCTIONS-FOR-BEN.md`](../../../shared-growth-memory/INSTRUCTIONS-FOR-BEN.md) — this round (§2b sanity-checked 2026-05-26)
- [`shared-growth-memory/team-brain/ben-bootstrap/`](../../../shared-growth-memory/team-brain/ben-bootstrap/) — the bootstrap kit
- [`inbox/cowork/2026-05-26-ben-work-insights-handoff.md`](../../../inbox/cowork/2026-05-26-ben-work-insights-handoff.md) — handoff brief
- [`inbox/cowork/2026-05-26-ben-reengagement-digest-SKILL-staged.md`](../../../inbox/cowork/2026-05-26-ben-reengagement-digest-SKILL-staged.md) — the pre-compute task that operationalises §2b
- [`inbox/cowork/2026-05-26-jira-correction-stream-surveillance.md`](../../../inbox/cowork/2026-05-26-jira-correction-stream-surveillance.md) — the consumer-side ticket that closes the FB → ENG loop
- [`memory/decisions/2026-05-21-feedback-loop-design.md`](../../decisions/2026-05-21-feedback-loop-design.md) — parallel branch for pattern confidence
