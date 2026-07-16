# Scheduled-task token optimisation — proposal package

**Date:** 2026-05-27
**Author:** Cowork (Apex-PM context), in response to Dylan's "running out of session tokens every Monday" prompt
**Status:** PROPOSAL — no canonical SKILL.md edited. Per CLAUDE.md §6.3 standing rule (edit-in-repo, deploy-via-MCP), every change below needs Dylan's sign-off, then a branch `cowork/token-optimisation-2026-05-27`, then deploy via `mcp__scheduled-tasks__update_scheduled_task`.
**Sources:** live `mcp__scheduled-tasks__list_scheduled_tasks` inventory + per-task `SKILL.md` audit by general-purpose subagent on 2026-05-27.
**Linked learning:** [`memory/learnings/2026-05/2026-05-27-monday-token-overrun-analysis.md`](../learnings/2026-05/2026-05-27-monday-token-overrun-analysis.md)

---

## The headline

Monday is heavy because **6 scheduled tasks fire** on a normal Monday, and **7 on the first Monday of the month**. Estimated token-equivalent load on a normal Monday: ~135–175k. On the first Monday of the month: ~155–260k. (Note: `apex-eod-reconciliation` does NOT fire on Monday itself — its cron `30 1 * * 2-6` means it runs Tue–Sat morning, processing the prior weekday's work. It contributes to Tuesday's session, not Monday's.)

One task is a real budget consumer that runs Monday morning (`daily-enrichment-pipeline`, XL), one is high-value but also XL (`apex-morning-briefing`), and one is a confirmed zombie that fires three times a week including Monday (`persona-supplements-refresh`). A second SKILL.md (`daily-briefing`) is orphaned in the repo as a stub but is NOT registered in the scheduler — it's not contributing load; it's just dead inventory.

The proposal saves an estimated **~75–100k token-equivalents per Monday with zero efficacy loss**. The recommended sequence is:

1. **Today (Wed):** kill the two zombies — `persona-supplements-refresh` + `daily-briefing`. Net save ~10–15k/Mon, ~10–15k/Wed, ~10–15k/Fri.
2. **Thu:** externalise the duplicated Teams-channel inventory. Net save ~7–10k/run on the three biggest tasks.
3. **Fri:** decide whether to merge `process-intelligence-bundles-afternoon` into the morning drain or move it to T/Th only.
4. **Next Mon:** verify the saved budget held. If Mon is comfortable, stop. If not, layer in the Granola-query collapse (apex-morning) and the JSONL-rollup refactor (daily-enrichment).

---

## Tier classification per CLAUDE.md §7

- All scheduled-task `SKILL.md` edits are **Tier 2** — they require a PR (branch `cowork/token-optimisation-<slug>`) and deployment via MCP.
- Disabling a task is a Tier 2 action via `mcp__scheduled-tasks__update_scheduled_task` (set `enabled: false`).
- The empty `daily-briefing` SKILL.md could arguably be deleted, but `memory/` is append-only — leave the file, just disable the scheduled task and add a forward-link header.

---

## P0 — Quick wins (do this week)

### 1. DISABLE `persona-supplements-refresh`

**Confidence:** [high]

**Why:** The SKILL.md description literally reads *"SUPERSEDED by daily-enrichment-pipeline. Re-disabled after channel mapping merged into daily pipeline."* The task is still enabled and firing M/W/F at 05:02 SAST — one minute before the daily-enrichment-pipeline that supersedes it. It duplicates Teams channels, Confluence Aircall queries, and Granola scans that daily-enrichment-pipeline §3-5 already covers.

**Efficacy preservation:** Outlook coverage was the only delta. Verify by checking `shared-growth-memory/persona-supplements/*/outlook-email-*.md` files — if none are read downstream, kill outright. If Outlook is load-bearing, add 4 `outlook_email_search` calls (~1k tokens) to `daily-enrichment-pipeline` and still kill this one.

**Action:**
```
mcp__scheduled-tasks__update_scheduled_task({
  taskId: "persona-supplements-refresh",
  enabled: false
})
```
Then in the SKILL.md, add forward-link header pointing to `daily-enrichment-pipeline/SKILL.md`. Commit message: `[cowork] disable superseded persona-supplements-refresh — daily-enrichment-pipeline covers it`.

**Saves:** ~10–15k token-equivalents per M/W/F run. ~30–45k/week.

---

### 2. CLEAN UP orphan `daily-briefing` SKILL.md (not actually scheduled)

**Confidence:** [high]

**Why:** The SKILL.md body is literally `TBD`. The file exists at `.claude/skills/cowork-scheduled/daily-briefing/SKILL.md` but is NOT registered in the live scheduler (verified via `mcp__scheduled-tasks__list_scheduled_tasks` — only 13 tasks active, daily-briefing is not among them). It's dead inventory — confusing future audits.

**Action:** Either (a) populate the SKILL.md with a real design and register it as a scheduled task, or (b) move the directory to `.claude/skills/cowork-scheduled/_archive/daily-briefing-stub/` with a README explaining it was deferred. Not urgent — it isn't burning tokens. Tracking here so the next audit doesn't double-count it.

**Saves:** Zero direct token saving; removes a phantom from future audits.

**Risk:** Zero.

---

### 3. Externalise the Teams-channel inventory

**Confidence:** [high]

**Why:** The same 10-channel `read_resource` block (4 OSB Stormboy + 6 Product channels) appears verbatim in:
- `apex-morning-briefing/SKILL.md` lines 92–106
- `apex-eod-reconciliation/SKILL.md` lines 35–49
- `daily-enrichment-pipeline/SKILL.md` lines 290–313

Three duplications, all citing `memory/integrations/cowork/apex-data-sources.md` as the canonical source already.

**Proposed change:** In all three SKILL.md files, replace the inline channel block with one line:
> See channel inventory at `memory/integrations/cowork/apex-data-sources.md`. Read those channels via `read_resource` for the lookback window specified in this task.

**Efficacy preservation:** The reference file is authoritative. The scheduled task already loads it (it's in the memory-load step of apex-morning). Reading the inventory from one place instead of three doesn't change which channels get read.

**Verification gate:** Before deploying, confirm `apex-data-sources.md` is up to date. If it's stale, update it first (Tier 1).

**Saves:** ~7–10k tokens across the three tasks combined per day. ~35–50k/week.

---

## P1 — Layer in after P0 holds (next week)

### 4. Collapse `apex-morning-briefing` Granola queries

**Confidence:** [moderate]

**Why:** STEP 3 currently fires 4 separate `query_granola_meetings` calls covering "action items / decisions requiring follow-up / unresolved blockers / explicit commitments." These overlap. Each returns full meeting context.

**Proposed change:** Replace with 2 broader queries:
1. "All action items, decisions, and explicit commitments from this week's meetings, grouped by topic"
2. "All unresolved blockers and follow-ups raised this week"

**Efficacy preservation:** Same lookback window, same connector. Broader semantic queries return the same content with less redundant retrieval.

**Saves:** ~3–5k tokens per apex-morning run, daily.

---

### 5. Rotate `apex-morning-briefing` STEP 0 memory load

**Confidence:** [moderate]

**Why:** Currently reads CLAUDE.md, COWORK.md, 4 profile files, roster.md, decisions/INDEX.md, integrations/cowork.md every single morning. The profile files (identity, communication, decision-frameworks, working-style) change infrequently.

**Proposed change:** Split into:
- **Always read:** CLAUDE.md, COWORK.md, communication.md, decision-frameworks.md, integrations/cowork.md (5 files)
- **Read on Monday only:** identity.md, working-style.md, roster.md, decisions/INDEX.md

**Efficacy preservation:** Profile + roster don't change mid-week. Reading them on Monday gives the week's worth of context; subsequent days inherit it as context from prior session anchoring.

**Caveat:** Cowork sessions don't share state across days. The argument for once-a-week read is that the profile values shouldn't change between Monday and Friday — and any same-week change would be captured live via Tier 1 writes anyway.

**Saves:** ~3–5k tokens × 4 days = ~12–20k/week.

---

### 6. Drop weak-signal queries from `apex-morning-briefing`

**Confidence:** [moderate]

**Why:** STEP 2 (Jira) line 63 includes ROAD project last-7-days and "Items in Prod status". ROAD ideas surface in roadmap reviews not daily briefings. Prod-status items get caught by reconciliation.

**Proposed change:** Drop those two JQL queries from the morning rotation. Keep the other 4 JQLs.

**Saves:** ~2–3k tokens per run.

---

### 7. Move `career-monthly-meta` to first Wednesday

**Confidence:** [high]

**Why:** Currently fires first Monday at 06:00 SAST — directly into the heaviest Monday of the month. Wednesday is the lightest day in the proposed schedule.

**Proposed cron:** `0 6 1-7 * 3` (first Wednesday of month).

**Efficacy preservation:** A 2-day delay on a monthly retrospective changes nothing.

**Saves:** Doesn't reduce total tokens but relieves the first-Monday spike that pushes Dylan over the line.

---

## P2 — Architectural changes (the next two weeks)

### 8. JSONL-rollup refactor for `daily-enrichment-pipeline` Step 2

**Confidence:** [moderate — needs design review]

**Why:** Rule 13 in the SKILL.md (line 439) admits the current architecture writes ~400 individual files per run (200 deal engagement snapshots + 200 contact snapshots). The known-issue queue already names a JSONL-rollup refactor that would collapse these to 2 files.

**Proposed change:** Move the engagement snapshots into a single append-only JSONL per day. One write op per day instead of 400.

**Efficacy preservation:** Frontier dashboard reads need to be updated to consume the JSONL. That's a coordinated change with Claudia's tool — not a unilateral Cowork edit. Track as a cross-Claude initiative.

**Saves:** Largest single architectural win — probably 30–40% of the daily-enrichment-pipeline token cost.

---

### 9. Decide on `process-intelligence-bundles-afternoon`

**Confidence:** [low — needs queue-depth data]

**Why:** The morning drain at 00:37 SAST processes up to 20 bundles. The afternoon drain at 06:09 SAST processes another 20. If the bundle producer (Frontier dashboard) typically generates <5 bundles between drains, the afternoon run is redundant.

**Proposed change:** Instrument the queue depth at 06:09 SAST for a week. If consistently <5, disable afternoon and raise morning to 30 bundles. If consistently >10, keep both but collapse the two near-identical SKILL.md files into one.

**Saves:** ~10–30k tokens per weekday if disabled. ~50–150k/week.

---

### 10. Restructure `daily-enrichment-pipeline` SKILL.md size

**Confidence:** [high]

**Why:** It's 445 lines / 23.5k chars — the longest scheduled-task prompt in the inventory. Big chunks are documentation, not instruction:
- Provenance front-matter spec (lines 44–127, ~85 lines)
- JSON example shapes (lines 167–217, 374–390)
- Per-step verbose description that could collapse into shared patterns

**Proposed change:** Replace the inline spec with a one-line reference to `memory/decisions/2026-05-21-supplement-provenance-schema.md`. Move JSON examples to a `templates/` file referenced once.

**Saves:** ~5k tokens per run, daily.

---

## P3 — Cross-cutting cleanups

### 11. Drop `daily-enrichment-pipeline` Step 6 SharePoint OR move to weekly

**Why:** SKILL.md itself notes Step 6 (SharePoint) is "lowest dashboard payload-per-call" and "drop first." It's a candidate for a weekly task instead of daily.

**Action:** Either drop entirely or extract to a new weekly scheduled task.

### 12. Specify `career-signal-capture` Teams scan as DM-only

**Why:** Line 26 says "today's DMs + channel posts" without specifying. If it falls back to a broad search, it's wasteful and noisy. DMs are where 1:1 praise lives anyway.

**Proposed change:** Replace with "Teams DMs via `chat_message_search` only — channel scan handled by apex-morning."

---

## What NOT to change

- **`apex-morning-briefing` core structure.** The 10-channel + 6-JQL + 4-Granola pattern is the operating loop. We trim, we don't gut.
- **`apex-eod-reconciliation` Cases A/B/C.** The observability logic is well-designed. Verbose, but principled.
- **`career-weekly-promote` and `career-audit-digest`.** These are already lean and Friday-only — no Monday relevance.
- **`career-canary-reaudit`.** Manual-only, zero scheduled cost.
- **`weekly-pattern-curation` and `weekly-system-retro`.** Friday-only, delegate to node module (low prompt cost).

---

## Verification plan (Mon–Fri this week)

| Day | Verification |
|---|---|
| Wed (today) | Disable persona-supplements-refresh + daily-briefing |
| Thu | Externalise Teams channel inventory in three SKILL.md files; commit + deploy |
| Fri | Measure Friday's actual token usage post-changes; baseline next Mon's expected load |
| Mon | Verify normal-Monday load is comfortable; check Dylan didn't hit session cap |
| Tue | If Mon held: ship Granola-collapse + memory-load rotation; if not, debug |

---

## Deploy checklist (per change)

For each Tier 2 change Dylan signs off on:

1. Branch from main: `git checkout -b cowork/token-optimisation-<slug>`
2. Edit the SKILL.md under `.claude/skills/cowork-scheduled/<task>/`
3. Update PROVENANCE.md with the patch entry and deploy log row
4. Commit: `[cowork] <verb> <task> — <one-line why>`
5. Push, open PR, Dylan reviews
6. After merge to main: deploy via `mcp__scheduled-tasks__update_scheduled_task({ taskId, prompt: <new content> })`
7. Record deploy timestamp + scheduled-task version in PROVENANCE.md
