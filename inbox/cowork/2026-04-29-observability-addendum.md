# Observability addendum for Morning + EOD prompts

**Purpose:** Drop-in additions to the existing Morning Briefing and EOD Reconciliation prompts (in Cowork UI per-task Instructions). Designed to make every run leave a verifiable trace — what got pulled, what got written, what failed — so we can detect silent regressions (connector timeouts, missed writes, etc.) without re-running the flow.

**How to apply (Cowork UI):**
1. Open the `apex-morning-briefing` task in Cowork.
2. Append the **MORNING ADDENDUM** block below to the existing prompt — paste at the very end, after the existing OUTPUT SUMMARY section.
3. Save.
4. Repeat for `apex-eod-reconciliation` with the **EOD ADDENDUM** block.
5. After applying, re-snapshot both prompts to `memory/integrations/cowork/` with date `2026-04-30` (or the date of edit).

**Design principles:**
- Additive only — nothing in the existing prompts is changed. Lower regression risk.
- Telemetry is rendered as a final fenced block, easy to spot in the chat output and easy to grep if dumped to file.
- Failure modes are explicit, not silent.
- The Tier 1 writeback line is the single durability check — if it's empty, the run produced no `memory/` writes and that's a signal.

---

## MORNING ADDENDUM

Paste this verbatim at the end of the existing Morning Briefing prompt:

```
## OBSERVABILITY (always emit, even on partial-failure runs)

After the existing OUTPUT SUMMARY, append a final fenced block titled "RUN TELEMETRY". Format:

```
RUN TELEMETRY — Apex Morning Briefing
Run timestamp (SAST): YYYY-MM-DD HH:MM
Run timestamp (AEST): YYYY-MM-DD HH:MM

CONNECTOR STATUS
- Notion        : OK | TIMEOUT | ERROR | NOT_CALLED   (records returned: N)
- Jira          : OK | TIMEOUT | ERROR | NOT_CALLED   (issues returned: N across queries a-f)
- Granola       : OK | TIMEOUT | ERROR | NOT_CALLED   (meetings scanned: N, commitments surfaced: N)
- Teams         : OK | TIMEOUT | ERROR | NOT_CALLED   (messages scanned: N)
- HubSpot       : OK | TIMEOUT | ERROR | NOT_CALLED   (objects scanned: N)
- Confluence    : OK | TIMEOUT | ERROR | NOT_CALLED   (pages scanned: N)

WRITE SUMMARY
- Notion creates : N (list task names, one per line)
- Notion updates : N (list task names, one per line)
- Jira comments  : N (list issue keys, one per line)
- inbox/cowork/ scanned : YES | NO     (files processed: N)

TIER 1 WRITEBACKS TO REPO (file paths created or updated under memory/)
- (list each path; if none: "NONE — flag for review if Granola surfaced ≥1 commitment")

ANOMALIES (anything unexpected, even if not blocking)
- (free-text bullets; if none: "NONE")

CONFIDENCE
- (one of: HIGH — full coverage, all writes succeeded;
           MODERATE — one connector degraded but core writes succeeded;
           LOW — multiple connectors failed OR no Tier 1 writebacks despite signal)
```

If a connector returns TIMEOUT or ERROR, do NOT silently skip it. Mark its status accordingly and proceed with the rest of the flow. The OUTPUT SUMMARY's "New discoveries" count must reflect what was actually retrieved, not what would have been retrieved if all connectors were healthy.
```

---

## EOD ADDENDUM

Paste this verbatim at the end of the existing EOD Reconciliation prompt:

```
## OBSERVABILITY (always emit, even on partial-failure runs)

After the existing structured summary (completed / in progress / blocked / not touched / new items / Jira synced / stale items / tomorrow's top 3), append a final fenced block titled "RUN TELEMETRY". Format:

```
RUN TELEMETRY — Apex EOD Reconciliation
Run timestamp (SAST): YYYY-MM-DD HH:MM
Run timestamp (AEST): YYYY-MM-DD HH:MM

CONNECTOR STATUS
- Notion        : OK | TIMEOUT | ERROR | NOT_CALLED   (Today: N tasks, Overdue: N tasks)
- Jira          : OK | TIMEOUT | ERROR | NOT_CALLED   (last 8h activity items: N)
- Granola       : OK | TIMEOUT | ERROR | NOT_CALLED   (this week's meetings: N)
- Teams         : OK | TIMEOUT | ERROR | NOT_CALLED   (last 8h messages: N)
- Confluence    : OK | TIMEOUT | ERROR | NOT_CALLED   (last 8h doc edits: N)

RECONCILIATION OUTCOME
- Tasks transitioned to Done           : N
- Tasks carried over (P0/P1, kept date): N
- Tasks pushed to tomorrow (P2/P3)     : N
- Stale Proposed flagged for review    : N
- Stale Proposed auto-cancelled        : N (per cancel-default-after-3d rule once enabled)
- Jira transitions executed            : N (list issue keys)
- Jira comments added                  : N (list issue keys)

TIER 1 WRITEBACKS TO REPO (file paths created or updated under memory/)
- (list each path; if none: "NONE — flag for review if any major decision or stakeholder commitment was surfaced today")

ANOMALIES (anything unexpected, even if not blocking)
- (free-text bullets; if none: "NONE")
- (e.g. "Teams connector timed out — afternoon messages not scanned"; "Granola returned no meetings for today")

CONFIDENCE
- (HIGH | MODERATE | LOW with one-line rationale)
```

If a connector returns TIMEOUT or ERROR, do NOT silently skip it. Mark its status accordingly. The "NEW ITEMS DISCOVERED" section must reflect actual retrieval; if Teams timed out and no afternoon messages were scanned, say so explicitly there as well — the OUTPUT and the TELEMETRY must agree.
```

---

## Post-application checklist

- [ ] Both addenda pasted into respective Cowork tasks
- [ ] Tasks saved
- [ ] Fresh prompt snapshots committed at `memory/integrations/cowork/apex-morning-briefing-prompt-<DATE>.md` and `apex-eod-reconciliation-prompt-<DATE>.md` (do not overwrite the 2026-04-29 snapshots)
- [ ] First run after edit visually inspected for the RUN TELEMETRY block
- [ ] If the block is missing or malformed on the first run, the addendum needs tightening — log a learning and retry

## Why this design (notes for future-Claude / future-Dylan)

- **One telemetry block per run, at the end** — easy to find, easy to copy-paste into an issue if something looks off, doesn't fragment the human-readable summary above it.
- **Connector status is six explicit states, not a boolean** — distinguishes "I called this and it failed" from "I never called this" from "called and got nothing legit". The latter two are operationally different.
- **Tier 1 writebacks are listed by path, not just counted** — if EOD says "0 Tier 1 writebacks" on a day with a major decision in Granola, that's an actionable signal. Without paths, you can't audit.
- **Anomalies are free-text** — the model will surface things we didn't think to ask for. That's the point.
- **Confidence is the headline** — three-bucket signal that lets a human glance at the bottom of the output and decide "trust" or "double-check".
