# Apex commission — Switch bus writes to SharePoint canonical

**Date:** 2026-05-16
**Owner (this side):** Dylan
**Owner (Cowork side):** Apex
**Status:** Awaiting Apex pickup
**Supersedes:** N/A — this is a config update layered on top of [2026-05-15 system-enrichment-pipeline commission](2026-05-15-system-enrichment-pipeline-commission.md). The 2026-05-15 commission's pipeline logic stays as-is; only the output path changes.

## The shift

Apex's daily-enrichment pipeline currently writes to a local-only filesystem path on Dylan's machine. The dashboard, Claudia's Storm Boy tool, and any future rep's Claude Code session all need to read the same bus state — and the only location that's already synced to every team member is **SharePoint via OneDrive**.

Going forward, every Apex write to `shared-growth-memory/` must land at the SharePoint-synced path, not the repo-local path.

## The new canonical path

```
C:\Users\<windows-user>\AgriProve\AgriProve - Documents\SHARED AP\Projects\Other Projects\Claude Code Projects\shared-growth-memory\
```

For Apex running on Dylan's machine, `<windows-user>` resolves to `DylanCronje`. **Resolve dynamically** — don't hard-code the username (this same Apex configuration template will eventually run on other machines):

```js
const path = require('path');
const os = require('os');

function busRoot() {
  if (process.env.BUS_PATH) return process.env.BUS_PATH;
  const sharepointBase = path.join(
    os.homedir(),
    'AgriProve',
    'AgriProve - Documents',
    'SHARED AP',
    'Projects',
    'Other Projects',
    'Claude Code Projects',
    'shared-growth-memory'
  );
  return sharepointBase;
}
```

If `busRoot()` doesn't resolve to an existing directory, halt the run and report. Don't create the folder structure — the dashboard side owns it.

## What needs to change in Apex's scheduled tasks

Two active scheduled tasks reference `shared-growth-memory/...`. Update both:

### 1. `daily-enrichment-pipeline` (cron `0 5 * * 1-5`)

Currently writes to: `C:\Dylan PM\shared-growth-memory\{persona,deal,contact}-supplements\...`
**Change to:** `<sharepointBase>\{persona,deal,contact}-supplements\...`

The Step-by-step in [the 2026-05-15 commission](2026-05-15-system-enrichment-pipeline-commission.md) names specific subfolders — every one of them needs to be relative to the SharePoint base. The structure inside the folder is unchanged.

### 2. `apex-runs.log` heartbeat append

Append the daily-run summary line to:
```
<sharepointBase>\apex-runs.log
```

The dashboard's `/api/work/apex-heartbeat` endpoint reads this file's last line. Format unchanged:
```
2026-05-16T03:00:00Z · daily-enrichment · deals=128 contacts=1523 confluence=24 teams=87 granola=12 outlook=156 personas-refreshed=4
```

## Atomic writes — non-negotiable

OneDrive sync is more sensitive than local disk to partial writes — readers across the team can see half-synced files. **Every write must be tmp + rename:**

```js
function writeAtomic(filePath, content) {
  const tmp = filePath + '.tmp';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}
```

JSON files: `JSON.stringify(obj, null, 2)`. Markdown: LF line endings. Never write directly to the destination path.

## Idempotency rules (unchanged from 2026-05-15)

Same source-window + same artifact = same filename = overwrite. Re-running on the same day must not double up. Naming conventions from the 2026-05-15 commission stand.

## What to do with the historical local writes

`C:\Dylan PM\shared-growth-memory\` on Dylan's machine has ~1,700 files accumulated from Apex's pre-SharePoint runs. Dylan ran a one-shot sync today (2026-05-16) bringing those into SharePoint. **Apex should not write back to the local path going forward.** Treat that location as historical archive only.

## Acceptance criteria

After the first daily-enrichment run under the new config:

- [ ] `<sharepointBase>\apex-runs.log` has a fresh entry timestamped today
- [ ] New files appear under `<sharepointBase>\contact-supplements\<id>\` and `<sharepointBase>\deal-supplements\<id>\` for at least 10 distinct contacts/deals
- [ ] **No new files** appear under `C:\Dylan PM\shared-growth-memory\{contact,deal,persona}-supplements\` for today's date
- [ ] Dashboard endpoint check from Dylan's machine: `curl http://localhost:3401/api/work/apex-heartbeat` returns `ok: true` with `age_seconds < 3600` shortly after the run completes
- [ ] OneDrive sync indicator shows the new files reaching cloud within ~5 minutes of write

## Failure modes to design against

- **SharePoint folder missing or not syncing** — halt the run, log to `<repo-local>\inbox\cowork\<date>-apex-bus-path-missing.md`, and surface in the next morning briefing. Do NOT silently fall back to the local path; that's what created today's divergence.
- **OneDrive conflict file appears** (`<file> (Conflict — <user>).<ext>`) — keep both, log the conflict in the next run's `apex-runs.log` entry as `conflicts=N`. Conflicts indicate two-sided simultaneous writes which the file-per-entity scheme should make rare.
- **Latency from a slow OneDrive sync** — Apex shouldn't wait for sync to verify writes; assume eventual consistency. The heartbeat log line is the dashboard's signal that the run completed locally.

## Why this matters

Three systems need to read what Apex writes:
1. Dylan's dashboard (`stormboy-tracker`) — already configured via `BUS_PATH=<sharepointBase>`
2. Claudia's Storm Boy tool — will resolve the SharePoint path via her OneDrive root (see `shared-growth-memory/INTEGRATION-FOR-CLAUDIA.md`)
3. Each rep's individual Claude Code session — same OneDrive resolution pattern

Until Apex writes to SharePoint, every Apex-generated artifact is invisible to systems #2 and #3. This is the single config change that turns shared-growth-memory from a single-machine sandbox into a team-wide substrate.

## Reply with

Confirmation you've updated `daily-enrichment-pipeline`'s output base path and the heartbeat log path, plus an ETA for the first cycle under the new configuration. If the path resolution helper doesn't fit Apex's runtime, suggest an alternative; the key requirement is dynamic resolution (no hard-coded `C:\Users\DylanCronje`).
