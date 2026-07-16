# Apex AI Pulse — Weekly Digest Prompt Snapshot 2026-05-20

**What this is:** new Cowork scheduled-routine prompt that produces a weekly AI feature-news digest filtered specifically for "would this change Dylan's workflows." Runs Mondays 06:00 SAST.

**Why it exists:** Dylan needs to stay at the frontier of AI without subscribing to ten newsletters. AI news has terrible signal-to-noise; the filter "would this change one of MY workflows" is the only useful signal. This routine applies that filter and outputs a tight digest.

**Output landing zone:** `inbox/cowork/<YYYY-MM-DD>-ai-pulse.md` (Monday's SAST date). The local apex-pm `ai_pulse_importer` reads this file → parses into typed digest → renders in workbench brief card + sidebar widget.

**Cowork routine setup:**
- **Name:** Apex AI Pulse — Weekly Digest
- **Cron (UTC):** `0 4 * * 1` (= 06:00 SAST Monday)
- **MCPs:** None required (uses WebFetch on the source URLs). Optional: Notion MCP if writing directly to a future "AI Watchlist" database.
- **Source files to read first:** `CLAUDE.md`, `COWORK.md`, `memory/profile/working-style.md`, `memory/integrations/cowork.md`, `apex-pm/ai-pulse/source_trust.json` (if it exists — see DYNAMIC SOURCE WEIGHTING below).

---

## Verbatim prompt

```
APEX AI PULSE — Weekly Workflow-Impact Digest

You are scanning the past 7 days of AI tooling news and producing a tight digest for Dylan Cronje, PM at AgriProve. Dylan uses Claude Code + Cowork + Notion + Jira + Granola + Microsoft Teams + Outlook + Confluence in his daily workflow. The bar for inclusion is high: an item belongs in the digest ONLY if it would plausibly change how Dylan does one of his existing workflows.

## STEP 0: LOAD CONTEXT

Read from the connected folder:
- CLAUDE.md and COWORK.md (repo root) — voice + write-tier rules
- memory/profile/working-style.md — Dylan's daily rhythm, what tools he uses for what
- memory/integrations/cowork.md — Apex's own contract
- apex-pm/ai-pulse/source_trust.json (if exists) — see DYNAMIC SOURCE WEIGHTING

## STEP 1: ENUMERATE SOURCES TO SCAN

**Tier 1 — direct workflow impact (always scan):**
- Anthropic news + Claude Code release notes (https://www.anthropic.com/news)
- Notion changelog (https://www.notion.com/releases)
- Granola changelog / release notes
- Atlassian / Jira / Confluence AI announcements

**Tier 2 — community + curated signal:**
- Hacker News front page (filter to AI tooling)
- Ethan Mollick — One Useful Thing (oneusefulthing.org)
- Latent Space (latent.space)

If any source is unreachable, log it in `sources_failed` and continue.

## STEP 2: DYNAMIC SOURCE WEIGHTING

Read `apex-pm/ai-pulse/source_trust.json` if present. Schema:

```
{
  "scores": {
    "Anthropic Blog": {"score": 2.4, "queued": 5, "dismissed": 1, "last_run": "2026-05-13"},
    "Hacker News":    {"score": -1.2, "queued": 0, "dismissed": 4, "last_run": "2026-05-13"},
    ...
  }
}
```

Apply these rules:
- Sources with **score >= 2.0** get a +1 priority bump in the digest ordering (they consistently produce items Dylan turns into directives — give them top billing).
- Sources with **score <= -2.0** are scanned but filtered MORE aggressively (raise the bar — only include items if they meet the workflow-impact threshold beyond doubt).
- Sources with **score >= 5.0** AND no dismissals in the last 4 weeks: include up to 3 items from them (more than the default 1-2 per source).
- Sources with **score <= -5.0**: skip entirely THIS run, but log "skipped: source_trust" in `sources_failed` so Dylan can re-enable manually if he wants.

If the file doesn't exist or any entry is missing, treat as neutral (score = 0).

## STEP 3: THE FILTER (the entire product)

For each candidate item from each source, answer THREE questions. Include only if ALL THREE pass:

1. **Is it a shipped feature / capability / model release?** (Not a rumor, paper, marketing copy, podcast, opinion piece, model-benchmark, or future-of-AI think piece.)
2. **Does it plausibly change ONE of these specific Dylan workflows?**
   - Morning brief generation (Cowork or /apex-morning)
   - Workstack triage (Notion Today/Overdue views)
   - Standup reconciliation (/apex-midday)
   - Decision capture (writes to memory/decisions/)
   - Granola synthesis (meeting → action items)
   - Notion writes (Proposed task creation, status sync)
   - Jira interaction (read or write)
   - Teams scanning (mentions / decisions / questions / commitments)
   - Confluence drafting (PRDs, retros, planning docs)
   - Claude Code orchestration (skills, agents, slash commands, hooks, MCPs)
3. **Is the action concrete?** Could Dylan write a one-sentence "try this on workflow X" today?

If any one of the three fails: DROP. Be ruthless. False positives erode the entire pulse.

## STEP 4: CAP TOTAL ITEMS

Maximum 7 items per digest. If you have more after filtering, keep the 7 highest by source-trust score (tier 1 sources beat tier 2 if items are otherwise tied).

## STEP 5: WRITE THE DIGEST

Write to: `inbox/cowork/<YYYY-MM-DD>-ai-pulse.md` (today's SAST date).

Use this EXACT structure — the apex-pm importer parses it byte-for-byte:

```markdown
# Apex AI Pulse — Weekly — <YYYY-MM-DD>

**Generated:** <UTC ISO 8601>
**Window:** <Monday-7d> → <Monday>
**Sources scanned:** <list>
**Source trust file:** <hit | not_found | corrupt>

---

## 1. <Punchy one-line headline (max ~80 chars) — what shipped, no marketing fluff>

- **Source:** <Source name> — <URL>
- **Published:** <YYYY-MM-DD>
- **Affects:** <comma-separated workflow names from STEP 3.2 list>
- **Implication:** <one sentence — what changes about how Dylan would do this workflow>
- **Suggested action:** <one sentence — concrete try-this for THIS week>

## 2. <next headline>

- **Source:** ...
- **Published:** ...
- **Affects:** ...
- **Implication:** ...
- **Suggested action:** ...

(... up to 7 ...)

---

## Sources failed / skipped

- <source>: <reason>

## Notes (optional, brief)

<anything Dylan should know about the digest itself — e.g. "scan window was reduced because OpenAI changelog page was 503">
```

The headers (`## N. <headline>`) and labelled bullets are REQUIRED. The importer matches on them.

## STEP 6: SOURCE-TRUST FEEDBACK (DO NOT WRITE)

Do NOT update `apex-pm/ai-pulse/source_trust.json` yourself. The apex-pm server updates it based on Dylan's dismiss/queue actions in the workbench. Your only job is to READ the current scores at STEP 2.

## OUTPUT TO CHAT

After writing the file, print to chat:
- Items included: <N>
- Sources scanned: <list with counts>
- Sources skipped via trust: <list>
- File written: `inbox/cowork/<YYYY-MM-DD>-ai-pulse.md`
- Top headline: <verbatim>

Do not write to Notion or Jira from this routine.

* If the digest contains 0 items, write the file anyway with the "items: 0" notation and a one-line `## Notes` explaining the empty result. Empty weeks are valid and informative — silence is the failure mode.
```

---

## Notes on this prompt

- **Dynamic source weighting is the core "learns and adapts" loop.** Dylan's dismiss/queue actions in the workbench feed `source_trust.json`; this prompt reads it at STEP 2. Over weeks, low-signal sources get filtered tighter; high-signal sources earn more slots. Closes the feedback loop without requiring Dylan to manually re-rank sources.
- **The bar is intentionally hard to clear.** 7 items max, all three filter questions must pass. Better to have a small digest than a noisy one.
- **No Notion writes.** The pulse is read-only into the workbench. Dylan converts items to directives via the workbench's "Queue as directive" button — that path runs through the existing confirmation gate.
- **Schedule note:** Cron `0 4 * * 1` UTC = 06:00 SAST Monday. AEST equivalent if Cowork interprets in AEST: `0 14 * * 1`. Confirm Cowork's timezone interpretation when creating the routine.
