---
name: process-intelligence-bundles
description: Process intelligence bundles — morning drain at 08:30 AEST (00:30 SAST) weekdays. Up to 20 bundles per run. Supersedes the 2h cadence.
---

You are running the Intelligence Bundle Processor for the Frontier coaching system. Your job: drain queued intelligence bundles from the bus, perform the requested analysis, and write results back. This replaces metered Anthropic API calls with subscription compute — zero cost per bundle.

## Step 0 · Resolve BUS_ROOT

The canonical path is the SharePoint-synced folder. Resolve dynamically — never hard-code a Windows username:

```
BUS_ROOT = C:\Users\{current-windows-user}\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory
```

Resolve `{current-windows-user}` via `os.homedir()` or `%USERPROFILE%`. If `$env:BUS_PATH` is set, use that instead.

**HALT CHECK:** Verify `BUS_ROOT` exists as a directory. If not:
1. Do NOT create it
2. Write an error file to `C:\Dylan PM\inbox\cowork\{YYYY-MM-DD}-apex-bundles-bus-missing.md`
3. Abort the run

## Step 1 · Read the schema

Read `{BUS_ROOT}\schemas\intelligence-bundle.md` for the canonical file shapes. This is the contract between the dashboard (bundle producer) and you (bundle processor).

## Step 2 · Scan the queue

List all `*.json` files in `{BUS_ROOT}\intelligence-bundles\`.

For each file:
1. Read the JSON metadata
2. If `status` is NOT `queued` → skip (already processed or claimed)
3. If `status` is `claimed` AND `claimed_at` is more than 30 minutes ago → treat as stale, re-claim (previous run likely crashed)
4. If per-run budget (20 bundles) is exhausted → stop, remaining bundles will be picked up next run

## Step 3 · Process each bundle

For each queued/stale-claimed bundle:

### 3a. Claim it
Update the `.json` metadata:
```json
{
  "status": "claimed",
  "claimed_at": "{ISO timestamp}",
  "claimed_by": "cowork:apex-process-intelligence"
}
```
Atomic write (tmp + rename).

### 3b. Read the prompt
Read the companion markdown file `{BUS_ROOT}\intelligence-bundles\{id}.md`. This contains the full prompt + inputs for the analysis.

### 3c. Perform the analysis
Execute the analysis described in the markdown file. Use the model appropriate for the task:
- `model_hint: "haiku"` → use efficient reasoning (clustering, classification, simple diagnosis)
- `model_hint: "sonnet"` → use balanced reasoning (synthesis, persona refresh, deal diagnosis)
- `model_hint: "opus"` → use deep reasoning (complex strategy, multi-source synthesis)

If no `model_hint` is specified, default to sonnet-level reasoning.

The `purpose` field tells you what kind of analysis:
- `persona-refresh` — synthesise all supplements for a rep into an updated persona profile
- `deal-diagnosis` — analyse a deal's health from engagement data, call transcripts, Teams signals
- `customer-themes-cluster` — cluster customer interactions to find recurring themes
- `brain-ask` — answer a free-form question using the coaching knowledge base
- `objection-cards` — extract and categorise objections from call transcripts
- `win-pattern-extraction` — identify patterns in won deals
- `other` — follow the prompt as written

Produce output matching `output_schema` (json, markdown, or text).

### 3d. Write the result
Write `{BUS_ROOT}\intelligence-results\{id}.json`:
```json
{
  "id": "{id}",
  "completed_at": "{ISO timestamp}",
  "completed_by": "cowork:apex-process-intelligence",
  "result": <output matching output_schema>
}
```
Atomic write (tmp + rename).

### 3e. Update metadata to completed
Update the bundle's `.json` metadata:
```json
{
  "status": "completed",
  "completed_at": "{ISO timestamp}",
  "result_file": "intelligence-results/{id}.json"
}
```
Atomic write (tmp + rename).

### 3f. If the bundle also specifies a `target_file`
Some bundles want their result written to a specific bus location (e.g., `persona-supplements/ben/profile.json`). If `target_file` is set in the metadata, ALSO write the result content to `{BUS_ROOT}\{target_file}`. Atomic write.

## Step 4 · Handle failures

If processing a bundle fails (parse error, malformed inputs, analysis can't be completed):
1. Update metadata to `status: 'failed'`, `error: '{short reason}'`, `completed_at: now`
2. Atomic write
3. Do NOT retry — leave for Dylan to inspect via the dashboard HEALTH tab
4. Continue processing remaining queued bundles (don't abort the whole run)

## Step 5 · Log the run

Append to `{BUS_ROOT}\apex-runs.log`:
```
{ISO-timestamp} · intelligence-bundles · scanned={total files} queued={found queued} claimed={claimed this run} completed={successfully completed} failed={failed this run}
```

Atomic write for the log append: read existing content, append new line, write to `.tmp`, rename.

## Step 6 · Report

Surface in chat:
- How many bundles were in the queue
- How many were processed (with IDs and purposes)
- How many failed (with IDs and error reasons)
- How many remain queued for the next run
- Any stale claims that were re-claimed

If the queue was empty, report that cleanly: "No queued intelligence bundles. Queue is clear."

## Rules

1. **All writes to SharePoint bus** — never write to `C:\Dylan PM\shared-growth-memory\`.
2. **Atomic writes** — tmp + rename for every file write. OneDrive sync is sensitive to partial writes.
3. **Halt on missing BUS_ROOT** — abort, don't fall back.
4. **Per-run budget: 20 bundles** — stop after 20, remaining picked up next run. Keeps any single run bounded.
5. **Stale claim threshold: 30 minutes** — re-claim bundles that have been `claimed` for >30 min without completing.
6. **Never retry failed bundles automatically** — mark as failed and move on.
7. **No hard-coded usernames** — BUS_ROOT resolved dynamically every run.
8. **OneDrive conflict detection** — if conflict files exist in `intelligence-bundles/` or `intelligence-results/`, log `conflicts=N` in the run log.
9. **Create subdirectories as needed** — `intelligence-results/` may not exist on first run.
10. **Read the bundle schema** every run — the contract may evolve; always read `schemas/intelligence-bundle.md` before processing.