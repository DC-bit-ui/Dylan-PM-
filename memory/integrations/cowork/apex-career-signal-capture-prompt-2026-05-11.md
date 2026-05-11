# Apex Career Signal Capture — prompt spec

**Status:** **DRAFT. NOT ACTIVE.** Activation is gated behind Dylan's sign-off on the compliance assessment ([`../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md`](../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md)) AND a populated canary list. After both are in place, the four tasks below operate **autonomously** — Dylan does not approve individual promotions.

**Purpose:** Daily / weekly / monthly Apex flows that capture career signal, auto-promote eligible entries to the Portfolio (gated programmatically), and audit-report to Dylan.

**Critical separation:** uses the `personal_notion` MCP server bound to Dylan's personal Notion integration token. Never the AgriProve `notion` MCP. Verify token resolution before any write.

---

## Task 1 — Apex · Career Signal Capture (daily)

**Schedule:** 18:00 SAST weekdays, after Apex EOD Reconciliation (17:30).
**Cron (AEST):** `0 2 * * 2-6`.
**MCP servers:** `personal_notion`, `granola`, `outlook`, `teams`, `jira`, `confluence`, `notion` (AgriProve, read-only).

### Prompt body

```
APEX · CAREER SIGNAL CAPTURE — daily

TIMEZONE: fires at 18:00 SAST weekdays, after EOD Reconciliation. The day's signal is settled.

PURPOSE: Scan today's signal across work systems for career-relevant moments. Write candidate entries to Raw Log — Pending Review in personal Notion. Weekly auto-promote pass handles sanitisation and promotion.

CRITICAL DISTINCTION: Use personal_notion MCP server. Before any write, verify token resolves to Dylan's personal email. If not, ABORT, log to inbox/cowork/<date>-career-capture-error.md.

TARGET LOCATION:
- Workspace: Dylan's personal Notion
- Page: "Dylan Cronje — Professional & Personal Summary" (id 3288c08eb28f81378a20f1a9913dcd27)
- Sub-page to write to: "Raw Log — Pending Review"

SCAN SOURCES (today's signal only):
1. Granola — today's transcripts. Look for:
   - Someone crediting Dylan ("Dylan drove…", "Dylan's call…", "thanks to Dylan…")
   - Dylan articulating a decision, strategy, framework
   - Dylan presenting to senior leadership
   - Scope/responsibility changes ("Dylan now owns…")
2. Outlook — today's sent + inbox replies. Look for:
   - Praise/acknowledgment in replies
   - Forwarded mentions of Dylan's work
   - Forward-looking commitments Dylan made to senior stakeholders
3. Teams — today's DMs + channels. Recognition, decisive moments, scope signals.
4. Jira — Dylan-authored/led tickets transitioned today. Epic completion, cross-team coordination.
5. Confluence — Dylan's edits/comments today. Strategy/decision docs, senior-leadership material.
6. Notion Work Priorities (READ-ONLY) — tasks Dylan marked Done. Initiative completions, decisions.

ENTRY FORMAT (one Notion bullet per signal in Raw Log — Pending Review):

  [DATE] [SOURCE] [CATEGORY] — One-line summary
  Evidence: <verbatim quote / link / Jira key>
  STAR (raw — sanitisation at weekly auto-promote):
    S: <situation as it actually was>
    T: <Dylan's task>
    A: <what Dylan actually did>
    R: <real result with real numbers / names>
  Suggested Portfolio section: <Decisions Owned / Scope Expansion / Quantified Wins / Skills / Public Artifact / Comp Annex>
  Confidence: high / moderate / low

CONFIDENCE RUBRIC (be conservative — only high triggers auto-promotion):
- high: clear evidence, quantifiable outcome, Dylan's name explicitly tied, CV-worthy
- moderate: plausibly career-grade but quantification unclear, attribution slightly ambiguous, or scope mid-tier
- low: borderline, weak signal, ambiguous attribution — capture anyway but don't expect promotion

DO NOT:
- Write to AgriProve Notion workspace
- Sanitise at this stage — raw detail stays in Raw Log
- Write to Portfolio directly — only to Raw Log — Pending Review
- Skip entries because they feel borderline — capture rich, let promotion gates filter

OUTPUT (Cowork chat):
- Count of signals captured by category
- Top 3 by confidence
- If zero signals: say so, do not pad

FAILURE:
- Wrong workspace token → ABORT, log error
- Borderline confidential content → include in Raw Log (private), explicitly note for sanitiser's attention
```

---

## Task 2 — Apex · Weekly Auto-Promote (weekly)

**Schedule:** Friday 16:30 SAST.
**Cron (AEST):** `30 0 * * 6`.
**MCP servers:** `personal_notion` only.

This task **replaces the manual promotion gate**. Auto-promotes eligible entries; routes ineligible to Flagged. Dylan does not review individual entries.

### Prompt body

```
APEX · WEEKLY AUTO-PROMOTE

PURPOSE: Process the past 7 days of Raw Log — Pending Review entries. Auto-promote eligible to Portfolio. Route ineligible to Flagged sub-page for optional Dylan review (no review required).

For each entry from the past 7 days:

1. ELIGIBILITY GATES (all three must pass for auto-promotion):
   a. Confidence == "high" (from Raw Log entry)
   b. Sanitisation completes cleanly (no rule produces an ambiguous output)
   c. Confidentiality Canary List grep returns ZERO hits against the sanitised candidate

2. SANITISATION (per CLAUDE.md §16):
   - Customer names → archetype ("tier-1 cattle station in NSW")
   - Absolute revenue/ACCU/hectare numbers → ratios/percentages/multipliers
   - Internal product code names → descriptive
   - Named team members → role titles ("led team of 6", "presented to CEO")
   - Third-party NDA-bound names → type ("federal regulator")
   - Unannounced roadmap → category

3. CANARY CHECK:
   - Read Confidentiality Canary List sub-page (private)
   - For each canary term, grep the sanitised candidate (case-insensitive, word-boundary-aware)
   - If ANY hit: do NOT auto-promote; route to Flagged with the hit highlighted

4. ROUTE THE ENTRY:
   - All three gates pass → PROMOTE: append sanitised STAR entry to Portfolio → appropriate sub-section (Track Record / Quantified Wins / Public Artifacts / etc.)
   - Confidence < high OR sanitisation ambiguous OR canary hit → FLAGGED: append to Flagged — Manual Review sub-page with reason (low-conf / sanitiser-ambiguous / canary-hit-on-<term>)

5. AUDIT FIELDS (on each promoted Portfolio entry):
   - Source Raw Log entry ID (link)
   - Promotion timestamp
   - Confidence at promotion: high
   - Canary version at promotion (so we know which canary list was applied)

DO NOT:
- Modify Raw Log — Pending Review entries (preserve for audit trail; mark as "Processed" via property only)
- Promote anything with confidence < high (no exceptions)
- Skip canary check
- Modify Portfolio entries from previous weeks (no retroactive edits without explicit Dylan trigger via "canary re-audit")

OUTPUT (for the Audit Digest task to consume):
- Promoted: N entries, with one-line summaries
- Flagged: M entries, with reason codes
- Canary blocked: K entries, with offending terms (so Dylan can see if a canary update is needed)
- New skills demonstrated this week (extracted from promoted entries)
```

---

## Task 3 — Apex · Weekly Audit Digest (weekly)

**Schedule:** Friday 16:45 SAST (15 min after auto-promote).
**Cron (AEST):** `45 0 * * 6`.
**MCP servers:** `personal_notion` only.

### Prompt body

```
APEX · WEEKLY AUDIT DIGEST

PURPOSE: Post a glance-able summary of this week's career portfolio activity to Cowork chat. Dylan reads in 30 seconds.

Read the output of Apex · Weekly Auto-Promote (this week's run). Format:

  CAREER PORTFOLIO — WEEK OF [date]

  Auto-promoted: N entries to Portfolio
  - <one-line summary of each, sanitised, with link to entry>

  Flagged for optional review: M entries (in Flagged sub-page)
  - <one-line summary of each + reason: low-conf / sanitiser-ambiguous / canary-hit-on-X>

  Canary-blocked: K entries
  - <terms that triggered the canary, so Dylan can see the patterns>

  New skills demonstrated this week:
  - <list>

  Cumulative this quarter:
  - Portfolio entries: <total>
  - Skills count: <total>
  - Scope expansion flags: <count, link to Comp Benchmark Annex>

  If anything looks off:
  1. Open Portfolio sub-page, redact the offending text
  2. Add the leaked term to Confidentiality Canary List
  3. Trigger Apex on-demand "canary re-audit" task to scan existing Portfolio against the updated canary

Post this to Cowork chat. Do not post to Notion (it's an in-the-moment notification, not a durable record).
```

---

## Task 4 — Apex · Monthly Portfolio Meta-Pass (monthly)

**Schedule:** First Monday of each month, 06:00 SAST.
**Cron (AEST):** `0 14 1-7 * 1`.
**MCP servers:** `personal_notion` only.

### Prompt body

```
APEX · MONTHLY PORTFOLIO META-PASS

1. SKILL GRAPH UPDATE
Scan all canonical Portfolio entries. Extract demonstrated skills (e.g., stakeholder mgmt, RICE prioritisation, vendor mgmt, Shape Up, discovery, P&L modelling, Schedule 2 regulatory expertise). Increment skill counters. Write to Skills Index sub-page as a table: Skill | Count | Latest Example | Notes.

2. COMP BENCHMARKING FLAGS
Identify Portfolio entries from past 90 days indicating scope expansion (new surface owned, new stakeholder forum, headcount under management, P&L exposure, new geography). Flag in Comp Benchmark Annex: Date | Expansion | Suggested benchmark check (market data sources, peer roles).

3. PUBLIC ARTIFACTS REGISTRY
Scan for public-facing artifacts this month (talks, blog posts, podcasts, public PR). Write URLs to Public Artifacts sub-page if not already present.

4. NARRATIVE ARC (quarterly only — Jan / Apr / Jul / Oct)
Generate 3-paragraph narrative covering past 90 days: through-line, demonstrated growth, direction. Write to "Career Narrative — Q[N] YYYY" sub-page.

DO NOT modify canonical Portfolio entries. Meta-analysis only.
```

---

## On-demand task — Canary re-audit (Dylan triggers manually)

No schedule. Dylan runs after updating the Canary List.

```
APEX · CANARY RE-AUDIT (on-demand)

PURPOSE: After Dylan updates the Confidentiality Canary List, re-scan all existing Portfolio entries against the new list to catch retroactive leaks.

1. Read current Canary List
2. For each existing Portfolio sub-page entry (Track Record, Quantified Wins, Public Artifacts, Career Narrative):
   - Grep against canary terms
   - If any hit: flag the entry in a "Canary Re-Audit — [date]" sub-page with offending term highlighted
3. Output to Cowork chat: count and list of flagged entries
4. Do NOT auto-redact. Dylan reviews flagged list and redacts manually — then adds any new terms to canary if needed.
```

---

## Activation checklist

0. [ ] **Compliance assessment signed off** ([`../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md`](../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md))
1. [ ] **Canary List populated** in personal Notion (precondition for trustless auto-promote)
2. [ ] Personal Notion workspace confirmed (not AgriProve's)
3. [ ] Notion sub-pages created (Portfolio + sub-sections, Raw Log, Flagged, Skills Index, Comp Annex, Public Artifacts, Counter-Evidence, Canary List)
4. [ ] Personal Notion integration token created and scoped
5. [ ] `personal_notion` MCP added to Cowork
6. [ ] Tasks 1–4 created in Cowork using prompt bodies above
7. [ ] Task 1 manual run → verifies write goes to personal Notion
8. [ ] Task 2 manual run (with a few Raw Log entries to test) → verifies auto-promote logic + canary check
9. [ ] Personal Claude project set up with Notion MCP read access

Full setup walkthrough: [`../../../inbox/cowork/2026-05-11-career-portfolio-setup.md`](../../../inbox/cowork/2026-05-11-career-portfolio-setup.md).
