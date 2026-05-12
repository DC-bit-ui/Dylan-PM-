# Apex Flow Diagnostic — 2026-04-29

**Source:** Interactive Cowork session, read-only diagnostic
**Author:** Cowork (Dylan's request)
**Date:** 2026-04-29T11:47 SAST

---

## A. SKILL.md Inspection

### 1. `apex-morning-briefing`

**Classification: [NO SKILL.md EXISTS]**

No SKILL.md file exists anywhere in the repo for this flow. Searched:
- `C:\Dylan PM\.claude\skills\` — 16 skill directories found, none named `apex-morning-briefing` or similar
- `C:\Dylan PM\.claude\commands\` — 11 command files found, none for morning briefing
- Cowork skills plugin directory — no match

The scheduled task runs with only its description as the prompt:
> "Apex Morning Briefing — synthesise priorities from all systems into Notion daily task list"

**How it actually works:** The session loads CLAUDE.md (§10 Apex section) + COWORK.md (§10 Apex Morning Briefing) as project instructions. These contain detailed behavioural specs (data sources, dual-stack model, reconciliation, Notion write rules). The session then improvises execution based on those project-level instructions. No dedicated, self-contained skill file governs the flow.

**Evidence it produces real output:** 4 session transcripts found (Apr 24, 28, 29, plus one undated). All show structured briefings with Notion writes, TOP 3 priorities, slipping items, and Jira/Confluence/Teams/Granola scans.

### 2. `apex-eod-reconciliation`

**Classification: [NO SKILL.md EXISTS]**

Same pattern as morning briefing. No SKILL.md anywhere. Scheduled task description:
> "Apex End-of-Day Reconciliation — consolidate progress, flag carryovers, sync Jira, clean up Notion"

Relies entirely on CLAUDE.md §10 + COWORK.md §10 for execution guidance.

**Evidence it produces real output:** 4 session transcripts found (Apr 27, 28, 29, plus one empty — `local_98189b59`). Active sessions produce structured EOD reports with completed/in-progress/blocked/stale categorisation, tomorrow's top 3, and Jira sync checks. One session (`local_98189b59`) had no messages — indicating a failed or empty run.

### 3. `daily-briefing`

**Classification: [TBD — confirmed]**

A prior session (`local_a28e2b2e`) explicitly confirmed: "The current SKILL.md for this task just says 'TBD'." That same session drafted a comprehensive context document intended to replace the TBD content, but it was saved to the session's local outputs directory — **not** installed into `.claude/skills/` or the scheduled task definition.

No SKILL.md file was found in any searched location. The scheduled task description:
> "Scrape all my work systems and suggest work items of highest value for execution"

**Evidence it produces real output:** 4 session transcripts found. Outputs range from visual widgets (show_widget) to Notion task creates/updates. Quality varies — some sessions produce polished visual briefings, others do ad-hoc task management.

### Summary Table

| Flow | SKILL.md Status | Execution Source | Produces Output? |
|---|---|---|---|
| apex-morning-briefing | **NO SKILL.md EXISTS** | CLAUDE.md §10 + COWORK.md §10 | Yes — structured briefings |
| apex-eod-reconciliation | **NO SKILL.md EXISTS** | CLAUDE.md §10 + COWORK.md §10 | Yes — structured EOD reports |
| daily-briefing | **TBD (confirmed)** | Task description only | Yes — variable quality |

---

## B. Cron Timing Forensic

### B.1 VM Cron Timezone

**Finding: The scheduled task system interprets cron expressions in AEST (UTC+10).**

Evidence — `nextRunAt` values perfectly match AEST interpretation:

| Task | Cron | Cron in AEST | Expected UTC | nextRunAt (UTC) | Jitter | Match? |
|---|---|---|---|---|---|---|
| daily-briefing | `45 12 * * 1-5` | 12:45 AEST | 02:45 UTC | 2026-04-30T02:45:46Z | +46s | ✓ |
| apex-morning-briefing | `45 4 * * 1-5` | 04:45 AEST | 18:45 UTC (prev day) | 2026-04-29T18:52:35Z | +455s | ✓ |
| apex-eod-reconciliation | `0 12 * * 1-5` | 12:00 AEST | 02:00 UTC | 2026-04-30T02:08:12Z | +492s | ✓ |

**Critical implication:** The cron times in COWORK.md are specified as SAST:
- Morning Briefing: 04:45 SAST (= 02:45 UTC)
- EOD Reconciliation: 12:00 SAST (= 10:00 UTC)

But the system interprets them as AEST, so:
- Morning Briefing fires at 04:45 AEST = **20:45 SAST (previous day)** — 8 hours early
- EOD Reconciliation fires at 12:00 AEST = **04:00 SAST** — 8 hours early
- Daily Briefing fires at 12:45 AEST = **04:45 SAST** — matches morning slot instead of midday

**This means none of the three flows fire at the intended SAST times.** The morning briefing fires the evening before. The EOD fires at 4am. The daily briefing fires at 4:45am.

### B.2 lastRunAt Over Last 7 Days

The scheduled task API only returns the most recent `lastRunAt`. Historical fire times are inferred from session transcripts (dates mentioned in output):

| Date (SAST) | Morning Briefing | EOD Reconciliation | Daily Briefing |
|---|---|---|---|
| 2026-04-24 (Thu) | ✓ Ran (Apr 24 briefing) | — no transcript found | ✓ Ran (Friday briefing widget) |
| 2026-04-25 (Fri) | — | — | ✓ Ran (Friday briefing) |
| 2026-04-26 (Sat) | — (weekend, cron Mon-Fri) | — | — |
| 2026-04-27 (Sun) | — | ✓ Ran (Apr 27 EOD) | — |
| 2026-04-28 (Mon) | ✓ Ran (Apr 28 briefing) | ✓ Ran (Apr 28 EOD) | ✓ Ran (Monday briefing) |
| 2026-04-29 (Tue) | ✓ Ran (Apr 29 briefing) | ✓ Ran (Apr 29 EOD) | ✓ Ran (Apr 29 — Notion writes) |

**Note:** The Apr 27 (Sunday) EOD run is anomalous — cron says Mon-Fri only. This could be a manual trigger or a timezone-edge artifact (Sunday SAST = Monday AEST for some hours).

**Gaps:** No morning briefing transcripts found for Apr 25-27. No EOD transcripts for Apr 24-26. Session list only returns 30 most recent sessions across ALL session types, so older scheduled-task sessions may have aged out.

### B.3 Today's Batch Fire (2026-04-29)

All three tasks fired within ~90 seconds:

| Task | lastRunAt (UTC) | lastRunAt (SAST) | lastRunAt (AEST) |
|---|---|---|---|
| daily-briefing | 02:53:31 | 04:53:31 | 12:53:31 |
| apex-morning-briefing | 02:54:15 | 04:54:15 | 12:54:15 |
| apex-eod-reconciliation | 02:54:44 | 04:54:44 | 12:54:44 |

**Was this a real cron fire or manual batch trigger?**

The daily-briefing's scheduled time (02:45 UTC / 12:45 AEST) is close to the actual fire time (02:53 UTC / 12:53 AEST) — ~8 minutes late, plausibly within system load variance.

However, the morning briefing should fire at 18:45 UTC (04:45 AEST) — it fired ~8 hours late. The EOD should fire at 02:00 UTC (12:00 AEST) — it fired ~53 minutes late.

**Most likely explanation:** The system (or Dylan's Windows machine) was offline during the morning briefing's scheduled time (18:45 UTC / 20:45 SAST on Apr 28) and the EOD's scheduled time (02:00 UTC / 04:00 SAST on Apr 29). When it came back online at ~02:53 UTC (04:53 SAST / 12:53 AEST), all overdue tasks fired as catch-up simultaneously. The daily-briefing happened to be close to its actual scheduled time.

**Alternative:** Manual batch trigger via the Cowork UI. Cannot distinguish programmatically — the API doesn't expose trigger source.

### B.4 Cron Expression Discrepancies

| Task | Configured Cron | Intended Time (COWORK.md) | Actual Fire Time (AEST interp.) | Discrepancy |
|---|---|---|---|---|
| apex-morning-briefing | `45 4 * * 1-5` | 04:45 SAST | 04:45 AEST (= 20:45 SAST prev day) | **8 hours early** |
| apex-eod-reconciliation | `0 12 * * 1-5` | 12:00 SAST | 12:00 AEST (= 04:00 SAST) | **8 hours early** |
| daily-briefing | `45 12 * * 1-5` | 12:46 (description) | 12:45 AEST (= 04:45 SAST) | **8 hours early** |

**Root cause:** Crons were written assuming SAST interpretation but the system uses AEST. The 8-hour offset is exactly the SAST↔AEST gap.

---

## C. Workspace Access — Scheduled vs Interactive

### C.1 Interactive Session Mount (confirmed)

From this interactive Cowork session, `C:\Dylan PM` contents are fully visible:

```
CLAUDE.md       ✓
COWORK.md       ✓
memory/         ✓ (with all subdirectories)
.claude/        ✓ (skills, commands, agents, hooks)
inbox/          ✓
workspace/      ✓
playbooks/      ✓ (not listed in ls but referenced in CLAUDE.md)
templates/      ✓
```

Bash mount path: `/sessions/awesome-brave-heisenberg/mnt/Dylan PM/`

### C.2 Scheduled Task Filesystem Mount

**Cannot determine programmatically.** Here's what's observable:

- Most scheduled-task sessions have CWD paths under `C:\Users\DylanCronje\AppData\Roaming\Claude\local-agent-mode-sessions\e45b448d-522a-41d6-be0e-a7d2360cb6ce\f261866e-3e24-4e38-96d7-3552beb690b6\local_<session-id>\outputs` — same Project ID as this interactive session.
- One older EOD session (`local_98189b59`) has CWD `/sessions/keen-nifty-goldberg` — a different VM workspace name, confirming each session gets its own VM.
- **All sessions share the same Project ID** (`f261866e-3e24-4e38-96d7-3552beb690b6` + `e45b448d-522a-41d6-be0e-a7d2360cb6ce`), so they load the same CLAUDE.md + COWORK.md project instructions.
- **Session transcripts show the flows reading from and writing to `C:\Dylan PM\memory/`**, indicating the workspace folder IS mounted for scheduled sessions.
- However, whether the mount is a live sync (changes propagate immediately) or a snapshot (copied at session start) **cannot be determined from session metadata alone**.

**Indirect evidence the mount is live (or near-live):** Morning briefing session `local_16d2fc39` (Apr 29) wrote feedback to `memory/` and it persists in the current interactive session. EOD session `local_efa54b50` (Apr 29) wrote to `memory/retros/session/2026-04-29-eod.md` — this file should be verifiable from this session.

---

## D. Conditional Sample Capture

**SKIPPED** per instructions: neither Morning nor EOD have [REAL INSTRUCTIONS] in a SKILL.md.

All three flows have **no SKILL.md** (Morning, EOD) or **TBD SKILL.md** (Daily). Section D's condition is not met.

**However, note for the record:** All three flows DO produce substantial output by relying on project-level instructions (CLAUDE.md §10 + COWORK.md §10). The absence of dedicated SKILL.md files doesn't mean the flows are non-functional — it means they're ungoverned. Each session improvises its execution based on the Apex spec embedded in the project instructions, which leads to variable output quality and structure.

Sample transcripts from today's runs were captured during this diagnostic (read via `read_transcript`) and are summarised in sections A.1–A.3 above.

---

## Highest-Priority Findings

### 1. [CRITICAL] Cron timezone mismatch — all flows fire 8 hours early

The scheduled task system interprets cron expressions in **AEST (UTC+10)**, but the expressions were written assuming **SAST (UTC+2)**. Every flow fires 8 hours before intended:
- Morning briefing fires at **20:45 SAST the night before** instead of 04:45 SAST
- EOD reconciliation fires at **04:00 SAST** instead of 12:00 SAST
- Daily briefing fires at **04:45 SAST** instead of 12:45 SAST

**Fix:** Adjust cron hours by +8 to compensate for AEST interpretation:
- Morning 04:45 SAST → 12:45 AEST → cron `45 12 * * 1-5`
- EOD 12:00 SAST → 20:00 AEST → cron `0 20 * * 1-5`
- Daily 12:45 SAST → 20:45 AEST → cron `45 20 * * 1-5`

### 2. [HIGH] No SKILL.md files govern Morning or EOD flows

Both Apex core flows run without dedicated skill files. They rely entirely on the Apex spec scattered across CLAUDE.md §10 and COWORK.md §10. This means:
- No single, self-contained prompt governs each flow
- Execution quality depends on how much of the project instructions the session interprets
- No versioning or iteration path for the flow logic independent of the master prompts
- The daily-briefing context doc drafted in session `local_a28e2b2e` was never installed

**Recommendation:** Create `.claude/skills/apex-morning-briefing/SKILL.md` and `.claude/skills/apex-eod-reconciliation/SKILL.md` with the full execution spec extracted from COWORK.md §10. Install the daily-briefing context doc as its SKILL.md.

### 3. [MODERATE] Today's simultaneous fire suggests machine downtime

All three tasks fired within 90 seconds at ~04:53 SAST, regardless of their individual schedules. Most likely the Windows machine was offline and triggered catch-up fires on resume. This means the morning briefing and EOD from the previous cycle may have been missed entirely.

### 4. [LOW] One EOD session produced empty output

Session `local_98189b59` ("Apex eod reconciliation") had no messages — a silent failure. No error surfaced to Dylan. Suggests no monitoring or alerting exists for failed scheduled runs.

---

## Appendix: Raw Scheduled Task Config

```json
{
  "daily-briefing": {
    "cron": "45 12 * * 1-5",
    "jitter": 46,
    "lastRunAt": "2026-04-29T02:53:31.587Z",
    "nextRunAt": "2026-04-30T02:45:46.000Z",
    "enabled": true
  },
  "apex-morning-briefing": {
    "cron": "45 4 * * 1-5",
    "jitter": 455,
    "lastRunAt": "2026-04-29T02:54:15.020Z",
    "nextRunAt": "2026-04-29T18:52:35.000Z",
    "enabled": true
  },
  "apex-eod-reconciliation": {
    "cron": "0 12 * * 1-5",
    "jitter": 492,
    "lastRunAt": "2026-04-29T02:54:44.101Z",
    "nextRunAt": "2026-04-30T02:08:12.000Z",
    "enabled": true
  }
}
```
