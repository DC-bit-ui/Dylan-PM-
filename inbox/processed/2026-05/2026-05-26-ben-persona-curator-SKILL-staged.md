---
status: staged-not-deployed
intended-path: .claude/skills/cowork-scheduled/ben-persona-curator/SKILL.md
sibling-file-needed: .claude/skills/cowork-scheduled/ben-persona-curator/PROVENANCE.md
deploy-instruction: |
  Per CLAUDE.md §6.3 (edit-in-repo, deploy-via-MCP):
  1. mkdir C:\Dylan PM\.claude\skills\cowork-scheduled\ben-persona-curator\
  2. Move the body block below to .claude/skills/cowork-scheduled/ben-persona-curator/SKILL.md
  3. Create PROVENANCE.md sibling
  4. Commit to git
  5. Deploy via mcp__scheduled-tasks__create_scheduled_task from a Cowork session.
     Recommended cron: "30 16 * * 5" (16:30 SAST Friday — pairs with weekly-pattern-curation
     and weekly-system-retro). Strip the SKILL.md YAML frontmatter before sending.
  6. Update .claude/skills/cowork-scheduled/README.md "Active tasks" table.
held-because: |
  Ben hasn't started using the kit yet — there's nothing to curate. Deploy after Ben's first
  week of usage (estimated 2026-06-02 onwards). Before then, this task would write empty
  curator-log entries every Friday and not produce meaningful active-preferences updates.
relationship-to-ben-reengagement-digest: |
  Independent scheduled task. The reengagement-digest runs at 05:30 SAST weekdays and writes
  reengagement-candidates.json. The persona-curator runs at 16:30 SAST Fridays and writes
  active-preferences.json. Both stage in inbox/cowork/ until ready.
---

# Ben Persona Curator — staged SKILL.md body below

```markdown
---
name: ben-persona-curator
description: Distill Ben's past week of session-observations and feedback into an updated personas/ben/active-preferences.json. Runs Friday 16:30 SAST (pairs with weekly-pattern-curation and weekly-system-retro). Read-heavy, single-file write.
---

You are running the Ben Persona Curator. Your job: scan the past 7 days of Ben's interaction signals — session-observations and feedback entries — and produce an updated `personas/ben/active-preferences.json` that captures the patterns sharply.

## Step 0 · Resolve BUS_ROOT (must pass before any writes)

Same contract as `daily-enrichment-pipeline`:

```
BUS_ROOT = C:\Users\{current-windows-user}\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

Try the `C:\Dylan PM\shared-growth-memory-bus` junction first. Mount-race retry: 3 attempts, 10s backoff. If unresolved, write to `C:\Dylan PM\inbox\cowork\{YYYY-MM-DD}-apex-bus-path-missing.md` and abort.

## Step 1 · Inventory the week's signals

Window: now-7d to now (UTC). Pull:

1. `personas/ben/session-observations/*.jsonl` where filename date is within window. Parse all JSONL events.
2. `feedback/feedback-*.json` where `created_by === "ben@agriprove.io"` AND `created_at` is within window. Parse all.
3. Current `personas/ben/active-preferences.json` (or default if missing).

If 1+2 are both empty, write a "Skipped — no signal" entry to `curator-log.md` (atomic append), update `active-preferences.json.last_updated` only, and exit cleanly.

## Step 2 · Distill explicit signals (high confidence)

Process every `type === "preference"` feedback first. These are explicit Ben statements — they ALWAYS land in `active-preferences.json` with no further confirmation needed.

For each preference feedback:

1. Parse the body for the proposed preference key/value.
2. Apply to the appropriate section of the preferences JSON (`render` / `sort` / `filters` / `method_overrides` / `stop_recommending` / `voice` / `mode_default`).
3. Record the feedback ID in `_provenance.derived_from`.

For `stop_recommending` entries, if no `until` was specified, default to 90 days from the feedback's `created_at`.

## Step 3 · Distill behavioural patterns (require confirmation)

From session-observations, look for repeated signals that suggest a preference Ben hasn't stated:

| Pattern (≥3 sessions in window) | Proposed preference |
|---|---|
| Always asks for "top 10" instead of default top 5 | `render.default_top_n = 10` |
| First-mode-of-session is always `storm_boy` | `mode_default.first_mode_when_ambiguous = "storm_boy"` |
| Consistently `card_engagement: action=skipped` for `kind=stalled_call` with explicit decline | `filters.skip_cold_with_explicit_decline = true` |
| Consistently requests `diagnosis_depth: full` mid-session | `render.diagnosis_depth = "full"` |
| `mode_request.mode = "follow_up"` always follows a `card_engagement` deep-read on a specific deal | (no pref change — natural flow, just record observation) |

For each detected pattern, propose the preference change. Require ≥3 sessions in the window showing the same signal before applying. If only 2 sessions, log to `curator-log.md` as "watching" and re-evaluate next week.

## Step 4 · Process correction/actioned/missed signals

These don't directly update preferences but DO inform the `weekly_observations` block:

- Count `type=correction` by week → if ≥5 in week, flag in curator-log: "diagnosis correction rate high — consider reviewing coaching engine"
- Count `type=actioned` by week → tells the dashboard's coaching engine how often Ben works outside the queue
- Count `type=missed` by week → if ≥3 in week, flag in curator-log: "queue heuristic missing items — consider reviewing inclusion logic"

Aggregate into `weekly_observations.feedback_logged_this_week` in the preferences JSON.

## Step 5 · Compute weekly observations

```json
"weekly_observations": {
  "modes_used_this_week": { "storm_boy": <int>, "follow_up": <int>, "reengagement": <int>, "deep_read": <int> },
  "average_cards_engaged_per_session": <float, 1 decimal>,
  "feedback_logged_this_week": { "correction": <int>, "actioned": <int>, "missed": <int>, "preference": <int>, "comment": <int>, "error": <int> }
}
```

Computed from `mode_request` events, `session_end` events, and feedback file counts.

## Step 6 · Atomic write the new active-preferences.json

Build the new preferences object:

```json
{
  "version": "ben-preferences-1.0",
  "last_updated": "<now ISO>",
  "_provenance": {
    "source": "ben-persona-curator",
    "curator_run": "ben-persona-curator:<now ISO>",
    "derived_from": [<list of feedback IDs + session-observation files consumed>]
  },
  "preferences": { ... },
  "weekly_observations": { ... }
}
```

Atomic write via tmp+rename (host-atomic in Cowork; bash sandbox can't reach BUS_ROOT directly).

## Step 7 · Append curator-log entry

```markdown
## <YYYY-MM-DD> · Weekly curator run

**Window:** <ISO start> → <ISO end>
**Signals consumed:** <N session-observations files, M feedback entries>

### Changes to active-preferences.json
- <bullet of what changed, with feedback ID or pattern description>
- ...

### Patterns being watched (not yet applied)
- <≤3-session patterns held for next week's confirmation>

### Volume signals
- Modes used: storm_boy=<N>, follow_up=<N>, reengagement=<N>, deep_read=<N>
- Feedback: correction=<N>, actioned=<N>, missed=<N>, preference=<N>
- Avg cards engaged/session: <float>

### Flags for Dylan
- <anything anomalous, e.g. "actioned count is 12 this week — Ben is working a lot outside the queue. Consider asking him why.">
```

Atomic append (read existing, append section, write back via tmp+rename).

## Step 8 · Surface result in chat

One-paragraph summary:

- `N` preferences applied to `personas/ben/active-preferences.json`
- `M` patterns watched for next week
- Volume: modes-used breakdown, feedback breakdown
- Any flags for Dylan's attention

## Failure modes

- **BUS_ROOT unreachable** → write apex-bus-path-missing.md and abort
- **No session-observations + no feedback in window** → write "Skipped — no signal" entry; do NOT touch active-preferences.json (preserves prior state)
- **active-preferences.json missing on first run** → bootstrap with defaults from the example schema; record this in curator-log
- **Conflicting preferences** (e.g., two `stop_recommending` entries for same target with different `until` dates) → keep the latest `created_at`; log the conflict to curator-log

## What this task does NOT do

- Touch `team-brain/profiles/ben.md` — that's Dylan's surface
- Touch other reps' personas or queues
- Apply behavioural-pattern preferences without ≥3 sessions of confirmation
- Override Ben's explicit `type=preference` feedback — those always win

## Why this exists

Without this curator, Ben's preferences live as scattered feedback entries that his next-session Claude has to read all of and re-derive on every session start — wasteful. Pre-distilling them once a week to a single `active-preferences.json` means his Claude does ONE file read on session start and gets all of his settings instantly.

Compounds with the in-session `type=preference` update flow (§5d of INSTRUCTIONS-FOR-BEN.md): in-session updates land immediately AND are reconfirmed by the weekly curator with all the other signals factored in.
```

# Cadence recommendation

**Friday 16:30 SAST** (`30 16 * * 5` UTC). Same slot as `weekly-pattern-curation` — they're both curator passes over the past week's data. The two don't conflict (different files, different schemas) and running them in the same window means Ben's preferences for next Monday are settled by Friday EOD AEST.

# When to deploy

Hold until Ben's been using the kit for at least 5 sessions (estimated 2026-06-02 onwards). Until then, this task would generate empty curator-log entries and not produce meaningful preference distillation. Once Ben has data in `session-observations/`, deploy and let it run on its first Friday.

# Cost

Zero metered API. Pure filesystem walk + JSON write. Runs in <10 seconds for a typical week (≤7 session-observations files + ≤20 feedback entries).
