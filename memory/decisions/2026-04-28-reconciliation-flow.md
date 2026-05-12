# Decision: Reconciliation flow — eliminate phantom-open tasks before surfacing the workstack

**Date:** 2026-04-28
**Status:** accepted
**Owner:** Dylan
**Related:** [`2026-04-28-notion-canonical-workstack.md`](2026-04-28-notion-canonical-workstack.md), [`2026-04-28-integration-architecture.md`](2026-04-28-integration-architecture.md)

---

## Context

Dylan reported a recurring failure mode: tasks like "Book meeting with X" or "Reply to Y" get created in Notion, completed within minutes via Outlook / Teams, and then sit in the workstack as "open" for days. They pollute `/focus`, inflate `/standup`, and present a longer queue than reality.

Apex's EOD Reconciliation (12:00 SAST) handles part of this on schedule, but:
1. It runs once per day — phantom tasks live in the stack until then.
2. It can't be invoked on-demand from a Claude Code session.
3. Dylan calls `/focus` and `/standup` on demand, often before EOD has run.

## Decision

Add a `/reconcile` skill that **runs before any work-stack output** and validates each open Notion task against connector signals. Wired into `/focus` and `/standup` as a mandatory first step.

### The flow Dylan specified
1. Review commitments via Granola and Notion (the "what should exist" inputs)
2. Review Teams, Jira, Confluence, Notion to assess if requested task was completed (the "did it happen" check)
3. **If yes:** mark done with context copy (evidence + system + timestamp)
4. **If no:** add to / keep on work stack and prioritise with reference to commitment from source

### Implementation
- New skill: `.claude/skills/reconcile/SKILL.md` — defines the task→signal mapping, two-pass logic, output format, and failure modes
- `/focus` (`.claude/skills/focus/SKILL.md`): calls reconcile first, ranks the still-open subset
- `/standup` (`.claude/skills/daily-standup/SKILL.md`): calls reconcile first; "✅ recommend mark done" items go into Yesterday, not Today
- `CLAUDE.md` §6.2: documents the rule repo-wide

### What gets checked, by task pattern

| Pattern | Signal |
|---|---|
| "Book meeting with X" | Outlook calendar invite to X post-creation |
| "Reply to X" | Outlook sent items to X post-creation |
| "Message X" | Teams outbound to X post-creation |
| "Review PRD" | Confluence edit / comment by Dylan post-creation |
| "Update AP-NNNN" | Jira comment / transition by Dylan post-creation |
| "Follow up on Y" | Any outbound (Teams/Outlook) referencing Y post-creation |
| Generic / "Read X" | No signal — leave open, flag ambiguous |

### Read-only by default
This skill **recommends** mark-done; Dylan confirms before any Notion write. Matches the repo-wide rule that Apex handles routine writes — this repo is read-primary.

## Consequences

**Positive**
- `/focus` and `/standup` reflect reality, not Notion latency.
- Granola commitments without matching tasks surface as gaps — closes a known signal-loss path.
- "Done" tasks carry their evidence (system + timestamp + link), which feeds future retros and standups.

**Negative / risk**
- More MCP calls per `/focus` invocation → slower response. Mitigation: bound the scan window to last 7 days; cache within session.
- False-positive done would silently drop a task. Mitigation: conservative threshold — only recommend done with a clear, post-creation, time-stamped signal in the right system.
- Some task types ("read X", "draft Y") have no programmatic signal — explicitly categorised as ambiguous, never auto-closed.

## Alternatives considered

1. **Wait for Apex EOD only** — rejected; Dylan calls `/focus` and `/standup` on demand throughout the day, and the gap is the whole problem.
2. **Auto-write to Notion when signal found** — rejected for now; matches read-primary repo posture and avoids silent state changes. Can revisit if false-positive rate proves negligible.
3. **Build into Apex instead** — Apex should still own scheduled reconciliation; this is the on-demand companion. Both can coexist (Apex covers the daily sweep; `/reconcile` covers the moment).

## Validation

Once HubSpot, Confluence, Outlook, Teams MCPs are wired into a session, run `/reconcile` against the live workstack and review the report with Dylan. Tune the task→signal mapping based on misses.
