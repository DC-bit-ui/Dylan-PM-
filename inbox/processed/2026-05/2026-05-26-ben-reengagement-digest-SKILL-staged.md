---
status: staged-not-deployed
intended-path: .claude/skills/cowork-scheduled/ben-reengagement-digest/SKILL.md
sibling-file-needed: .claude/skills/cowork-scheduled/ben-reengagement-digest/PROVENANCE.md
deploy-instruction: |
  Per CLAUDE.md §6.3 (edit-in-repo, deploy-via-MCP):
  1. mkdir C:\Dylan PM\.claude\skills\cowork-scheduled\ben-reengagement-digest\
  2. Move this file's body (everything below the frontmatter on this staging file) to
     .claude/skills/cowork-scheduled/ben-reengagement-digest/SKILL.md, keeping its own
     YAML frontmatter intact.
  3. Create PROVENANCE.md sibling — see template in adjacent skills (e.g. apex-morning-briefing/PROVENANCE.md).
  4. Commit to git.
  5. Deploy via mcp__scheduled-tasks__create_scheduled_task from a Cowork session
     (this is a NEW task, not an update — strip the SKILL.md YAML frontmatter before
     sending; Cowork auto-prepends its own from task metadata).
  6. Recommended cron: "30 3 * * 1-5" (05:30 SAST weekdays, after daily-enrichment-pipeline at 03:00).
  7. Update .claude/skills/cowork-scheduled/README.md "Active tasks" table.
reason-staged-not-deployed: |
  Cowork session denied direct write to .claude/skills/cowork-scheduled/ben-reengagement-digest/
  ("protected location"). Likely the harness blocks creating new task folders under .claude/
  to prevent silent skill drift. Dylan can mkdir manually from a Claude Code CLI session,
  then move the body across.
---

# Ben Reengagement Digest — staged SKILL.md body below

---

The block from `---name:` through end-of-file below is the canonical task_prompt. Move it verbatim to the SKILL.md path above.

```markdown
---
name: ben-reengagement-digest
description: Pre-compute Ben's daily reengagement candidates so his Claude Code session reads a ranked JSON instead of walking customer-positions/ live. Mon-Fri 05:30 SAST after the daily-enrichment-pipeline (03:00) lands but before Ben's workday starts. Writes queues/ben/reengagement-candidates.json.
---

You are running the Ben Reengagement Digest. Your job: walk the bus for prospects worth revisiting from the "cliff" cohort (deferred 6-18 months ago, no closure, no recent re-touch), rank them, and write a single JSON file Ben's Claude can read in one shot instead of walking `customer-positions/` per session.

Anchor question Ben asks his Claude: *"Who's worth revisiting from the old prospect database?"* This task answers it ahead of time.

Heuristic is defined verbatim in `shared-growth-memory/INSTRUCTIONS-FOR-BEN.md` §2b. This task implements §2b; if the file's heuristic changes, mirror the change here in the next deploy.

## Step 0 · Resolve BUS_ROOT (must pass before any writes)

Same contract as `daily-enrichment-pipeline`:

```
BUS_ROOT = C:\Users\{current-windows-user}\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

If `$env:BUS_PATH` is set, use that. Try the `C:\Dylan PM\shared-growth-memory-bus` junction first; fall back to the full SharePoint path. Mount-race retry: 3 attempts, 10s backoff.

HALT CHECK: If BUS_ROOT doesn't resolve after retries, write `C:\Dylan PM\inbox\cowork\{YYYY-MM-DD}-apex-bus-path-missing.md` and abort. Do NOT fall back to `C:\Dylan PM\shared-growth-memory\` (historical archive only).

## Step 1 · Read the data state

Before applying the heuristic, count:

1. `customer-positions/contact-*.json` — file count + most-recent `as_of` across all positions
2. `deal-signals/deal-*.json` — file count + how many have non-null `coaching_mode`
3. `queues/ben/work-cards.json` — read once, parse `generated_at` and the card list

Record these in the digest's `_provenance.data_state` block (see schema below). The downstream consumer (Ben's Claude) needs to know whether the digest is grounded in real customer voice or in fallback heuristics.

## Step 2 · Build the primary candidate set (customer-positions path)

Walk every `customer-positions/contact-<id>.json`. For each contact, evaluate the most recent `positions[]` entry against the §2b filter:

- `topic` in `["timing", "partner_alignment", "25_year_commitment"]`
- `sentiment` in `["neutral_warm", "neutral", "neutral_cool", "positive"]` (include `neutral_cool` — silent-deferral cohort has typically cooled)
- `as_of` is between 6 and 18 months ago (relative to today)
- No newer position in the same file
- Deferral phrasing detected in `verbatim_or_distilled`: regex-match `revisit later|come back|after harvest|talk to my wife|once we'?ve|end of season|next year` (case-insensitive)

For each match, cross-reference `deal-signals/`:

- Resolve `associated_deal_ids[]` from the contact-position file
- For each deal_id, read `deal-signals/deal-<deal_id>.json`
- If `coaching_mode` in `["cooling", "cold_loss_imminent"]` OR deal is closed_lost → include
- If `coaching_mode === "healthy_progression"` → drop (already re-engaged)
- If `coaching_mode` is null (current state, all files) → include with a `cross_reference_state: "coaching_mode_null"` flag so Ben's Claude can note the cross-check was best-effort

## Step 3 · Build the fallback candidate set (work-cards path)

This is the live-today path. Until `customer-positions/` and `coaching_mode` backfill, the work-cards fallback IS the primary signal. Always compute it — don't make it conditional on Step 2 being empty.

Read `queues/ben/work-cards.json`. For each card:

- `kind === "stuck_deal"` AND
- `heat` in `["HOT", "WARM"]` AND
- Parse `subtitle` to extract `days_in_stage`; require `>= 180`

For each match, mine `diagnosis[0].body` for the customer's original deferral language. Common patterns: `"asked to revisit in (\w+)"`, `"will be in touch (\w+)"`, `"deferred until (\w+)"`, plus the regex set from Step 2. Capture the matched phrase as `deferral_quote_from_diagnosis`.

## Step 4 · Merge + dedupe

Some candidates may appear in both sets (a contact with a customer-position AND an active stuck_deal card). Dedupe by `contact_id` if available, otherwise by `deal_id`. Prefer Step 2 source when both exist (real customer voice > inferred from diagnosis).

## Step 5 · Rank

Sort by:

1. Recency-of-deferral ascending — older deferrals (closer to the 12-18mo edge) first, since they're the "leaving on the table" cohort Ben's HORIZON Snapshot tactic targets
2. Within same `as_of` month, sort by `heat` (HOT > WARM > COLD)
3. Tiebreak by `contact_id` (stable lex sort)

Cap at 25 candidates. Ben asks for top 10 by default; the extras let him filter by region or stage without re-running.

## Step 6 · Write the digest

Atomic write to `<BUS_ROOT>/queues/ben/reengagement-candidates.json`. Schema:

```json
{
  "version": "ben-reengagement-1.0",
  "generated_at": "<ISO 8601 UTC>",
  "_provenance": {
    "source": "ben-reengagement-digest",
    "fetched_by": "ben-reengagement-digest:<ISO timestamp>",
    "supplement_schema_version": 1,
    "data_state": {
      "customer_positions_file_count": 0,
      "customer_positions_latest_as_of": null,
      "deal_signals_file_count": 0,
      "deal_signals_with_coaching_mode": 0,
      "work_cards_generated_at": "<ISO>",
      "primary_path_yielded": 0,
      "fallback_path_yielded": 0,
      "after_dedupe": 0
    }
  },
  "candidates": [
    {
      "rank": 1,
      "candidate_id": "<contact-<id> or deal-<id>>",
      "source_path": "customer-positions | work-cards-fallback",
      "contact_id": "<HubSpot contact id or null>",
      "contact_name_generalised": "<from customer-positions when available; from card title otherwise>",
      "associated_deal_ids": ["<deal_id>"],
      "deferral": {
        "as_of": "<ISO>",
        "months_ago": 0,
        "verbatim_or_distilled": "<≤300 chars, PII-generalised>",
        "is_verbatim": false,
        "topic": "<from §2b enum>",
        "sentiment": "<from §2b enum>",
        "source": "customer_position | diagnosis_step_1"
      },
      "deal_context": {
        "deal_name_generalised": "<region + property archetype + first name>",
        "current_stage": "<HubSpot stage>",
        "days_in_current_stage": 0,
        "coaching_mode": "<null | cooling | cold_loss_imminent | closed_lost>",
        "cross_reference_state": "matched | coaching_mode_null | deal_not_found"
      },
      "why_now": "<one-line rationale — what's changed since the deferral, or why the original objection has likely softened. Pull from patterns/2026-05-09-nurture-back-horizon-snapshot.md when applicable.>",
      "suggested_move": "call | email | snapshot",
      "hubspot_url": "<deal or contact url>"
    }
  ]
}
```

Atomic write: use the `Write` tool directly (host-atomic at the OS level in Cowork sessions). Pretty-print JSON with 2-space indent. LF line endings.

## Step 7 · Append run summary to `apex-runs.log`

One line, same format as other tasks:

```
<ISO timestamp> · ben-reengagement-digest · candidates=<N> primary=<N> fallback=<N> data_state=<sparse|partial|full>
```

`data_state`:
- `sparse` — both customer-positions and coaching_mode are empty (current default)
- `partial` — one populated, the other not
- `full` — both populated

## Step 8 · Surface result in chat

Brief one-paragraph summary:

- `<N>` candidates written to `queues/ben/reengagement-candidates.json`
- Data state: `<sparse|partial|full>`. If sparse, name what's missing (customer-positions empty / coaching_mode null on all deal-signals) so Dylan knows the digest is heuristic-only today
- Top 3 candidates by rank — generalised description + months-ago + suggested move

## Failure modes

- BUS_ROOT unreachable → abort per HALT CHECK above
- work-cards.json missing or `generated_at` >36h stale → still write the digest but set `_provenance.data_state.work_cards_generated_at` honestly so Ben's Claude flags freshness when reading
- Zero candidates → write the file anyway (empty `candidates: []`), with the full `_provenance.data_state` block. Empty digest is signal — tells Ben's Claude there's nothing to revisit today

## Why this task exists

Without this digest, every time Ben asks *"who's worth revisiting?"*, his Claude has to walk every `customer-positions/contact-*.json` (currently ~0 files, but eventually hundreds), cross-reference deal-signals, and rank — burning his subscription compute on a synthesis the dashboard could have pre-computed once overnight under Dylan's subscription.

Pre-computing this once at 05:30 SAST (after the 03:00 daily-enrichment-pipeline lands new customer-positions and refreshes deal-signals) means Ben's session reads a single ranked JSON. Same shape every time, no walk, no metered API on Ben's side.

Mirrors the cost model in `INSTRUCTIONS-FOR-BEN.md` — expensive synthesis stays on Dylan's subscription via Apex; Ben's side is filesystem-only.
```

# Cadence recommendation

**05:30 SAST weekdays** (`30 3 * * 1-5` UTC).

Why this slot:

- After daily-enrichment-pipeline at 03:00 SAST (01:00 UTC) lands the day's new customer-positions and refreshes deal-signals — so the digest works on fresh inputs
- Before Ben's first session of the day (he's AEST, so SAST 05:30 = AEST 13:30 — already in his afternoon when he typically opens his laptop after lunch)
- Doesn't compete with apex-morning-briefing (04:45 SAST) — sits in the slack window between briefing and Dylan's workday

# When the data backfills

The §2b heuristic and this digest will become more accurate once two upstream pieces land:

1. `customer-positions/` populated — currently 0 files; the dashboard's Pass 0 distillation needs to produce these
2. `deal-signals/*.coaching_mode` populated — currently null on all 12 files; the coaching pipeline needs to set this field

Until then, the digest leans on the work-cards fallback. The `_provenance.data_state` block makes this explicit so the consumer (Ben's Claude, the dashboard) can downgrade confidence appropriately.

# Cost

Zero metered API. Pure filesystem walk + JSON write. Runs in <2 minutes once `customer-positions/` is at full scale (estimated hundreds of files); ~10 seconds today against an empty primary path.
