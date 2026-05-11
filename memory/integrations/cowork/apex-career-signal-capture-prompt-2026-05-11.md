# Apex Career Signal Capture — prompt spec

**Status:** **DRAFT. NOT ACTIVE.** Activation is gated behind Dylan's sign-off on the compliance assessment at [`../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md`](../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md). Do not paste these into Cowork as live tasks until that gate is open.

**Purpose:** Daily / weekly / monthly scans of work-system signal for career-relevant moments. Writes candidate entries to **Dylan's PERSONAL Notion** (not AgriProve's workspace), under the page "Dylan Cronje — Professional & Personal Summary" (id `3288c08eb28f81378a20f1a9913dcd27`).

**Critical separation:** uses the `personal_notion` MCP server, which is bound to Dylan's personal Notion integration token (separate from the AgriProve `notion` MCP that writes to Work Priorities). Without this separation, the architecture's safety guarantees do not hold.

---

## Task 1 — Apex · Career Signal Capture (daily)

**Schedule (intended):** 18:00 SAST weekdays, after Apex EOD Reconciliation (17:30 SAST).
**Cron in AEST:** `0 2 * * 2-6`.
**MCP servers required:** `personal_notion`, `granola`, `outlook`, `teams`, `jira`, `confluence`, `notion` (AgriProve, read-only).

### Prompt body (paste into Cowork as task instructions)

```
APEX · CAREER SIGNAL CAPTURE — daily

TIMEZONE CONTEXT: This task fires at 18:00 SAST weekdays, after Apex EOD Reconciliation (17:30 SAST). The AEST team has wrapped. The day's signal is settled.

PURPOSE: Scan today's signal across work systems for career-relevant moments. Write candidate entries to Dylan's PERSONAL Notion. Dylan reviews weekly and promotes to canonical Portfolio.

CRITICAL DISTINCTION: This task writes to Dylan's PERSONAL Notion workspace using the personal_notion MCP server. Do NOT write to the AgriProve workspace (the one containing the Work Priorities database). Before any write, verify that the personal_notion token resolves to Dylan's personal email. If it does not, ABORT and write the error to inbox/cowork/<date>-career-capture-error.md.

TARGET LOCATION:
- Workspace: Dylan's personal Notion (his personal email account)
- Page: "Dylan Cronje — Professional & Personal Summary"
- Page ID: 3288c08eb28f81378a20f1a9913dcd27
- Sub-page to write to: "Raw Log — Pending Review" (create if not exists)

SCAN SOURCES (today's signal only):
1. Granola — transcripts dated today. Look for:
   - Someone crediting Dylan ("Dylan drove…", "Dylan's call…", "thanks to Dylan…")
   - Dylan articulating a decision, strategy, or framework
   - Dylan presenting to senior leadership
   - Scope or responsibility changes ("Dylan now owns…")
2. Outlook — sent items today + inbox replies. Look for:
   - Praise or acknowledgment in replies
   - Forwarded mentions ("Dylan's report on X")
   - Forward-looking commitments Dylan made to senior stakeholders
3. Teams — DMs and channels today. Look for:
   - Recognition messages
   - Decision moments where Dylan was decisive
   - Scope signals
4. Jira — Dylan-authored or Dylan-led tickets transitioned today. Look for:
   - Epic completion
   - Cross-team coordination Dylan led
5. Confluence — pages Dylan edited or commented on today. Look for:
   - Strategy / decision docs Dylan authored
   - Senior-leadership-facing material
6. Notion (Work Priorities, AgriProve workspace, READ-ONLY) — tasks Dylan marked Done today. Look for:
   - Initiative-level completions
   - Decisions made

CANDIDATE ENTRY FORMAT (one Notion bullet per signal, written to Raw Log — Pending Review):

  [DATE] [SOURCE] [CATEGORY] — One-line summary
  Evidence: <verbatim quote / link / Jira key>
  STAR (raw — sanitisation happens at weekly promotion, not here):
    S: <situation as it actually was>
    T: <Dylan's task>
    A: <what Dylan actually did>
    R: <real result with real numbers / names>
  Suggested Portfolio section: <Decisions Owned / Scope Expansion / Quantified Wins / Skills / Public Artifact / Comp Annex>
  Confidence: high / moderate / low (about whether this is career-grade)

DO NOT:
- Write to AgriProve Notion workspace
- Sanitise at this stage — Raw Log keeps real detail; sanitisation is at weekly promotion
- Write to canonical Portfolio sub-page — only "Raw Log — Pending Review"
- Auto-promote to anything external

OUTPUT (Cowork chat):
- Count of signals captured today by category
- Top 3 signals by confidence
- Any borderline signals — flag for Dylan
- If zero signals: say so, do not pad

FAILURE HANDLING:
- If personal_notion MCP token is missing or resolves to wrong workspace: ABORT, log to inbox/cowork/<date>-career-capture-error.md
- If a signal looks borderline confidential (could embarrass a named third party or reveal trade secret): include in Raw Log (it's private) but flag explicitly so Dylan considers redaction before promotion
- Do not produce a "no career signal today" template entry — silence is fine
```

---

## Task 2 — Apex · Weekly Portfolio Review (weekly)

**Schedule (intended):** Friday 16:30 SAST.
**Cron in AEST:** `30 0 * * 6`.
**MCP servers required:** `personal_notion` only.

### Prompt body

```
APEX · WEEKLY PORTFOLIO REVIEW

PURPOSE: Read this week's entries in Dylan's personal Notion "Raw Log — Pending Review". Produce sanitised promotion candidates for Dylan's review.

For each entry from the past 7 days:
1. Confirm it's career-grade (does it actually demonstrate something CV-worthy?). If not, mark "skip" with one-line reason.
2. Apply sanitisation rules per CLAUDE.md §16:
   - Strip customer names → archetype ("tier-1 cattle station in NSW")
   - Strip absolute revenue / ACCU / hectare numbers → ratios / percentages / multipliers
   - Strip internal product code names → descriptive
   - Strip named team members → role titles ("led team of 6", "presented to CEO")
   - Strip third-party NDA-bound names → type ("federal regulator")
   - Strip unannounced roadmap → category
3. Reshape into STAR format
4. Suggest target Portfolio section
5. Generate a "promotion candidate" entry

CONFIDENTIALITY CANARY CHECK:
Before producing any candidate, grep each candidate against the "Confidentiality Canary List" sub-page (private). If any canary term appears in a candidate, FLAG that candidate for explicit Dylan review — do not include it in the "Ready to Promote" section.

Output a markdown table in a new sub-page named "Promotion Candidates — Week of YYYY-MM-DD":

| Raw entry ID | Career-grade? | Sanitised STAR | Target section | Canary check | Confidence |

DO NOT:
- Auto-promote to canonical Portfolio. Dylan does the final paste.
- Skip the canary check.
- Sanitise the Raw Log itself — leave it intact for audit trail.
```

---

## Task 3 — Apex · Monthly Portfolio Meta-Pass (monthly)

**Schedule (intended):** First Monday of each month, 06:00 SAST.
**Cron in AEST:** `0 14 1-7 * 1`.
**MCP servers required:** `personal_notion` only.

### Prompt body

```
APEX · MONTHLY PORTFOLIO META-PASS

1. SKILL GRAPH UPDATE
Scan all canonical Portfolio entries. For each, extract demonstrated skills (e.g., "stakeholder mgmt", "RICE prioritisation", "vendor mgmt", "Shape Up", "discovery", "P&L modelling", "Schedule 2 regulatory expertise"). Increment skill counters. Write to "Skills Index" sub-page as a table: Skill | Count | Latest Example | Notes.

2. COMP BENCHMARKING FLAGS
Identify Portfolio entries from the past 90 days indicating scope expansion (new surface owned, new stakeholder forum, headcount under management, P&L exposure, new geography). For any material expansion: flag in "Comp Benchmark Annex" sub-page as: Date | Expansion | Suggested next benchmark check (market data sources, peer roles).

3. PUBLIC ARTIFACTS REGISTRY
Scan for any public-facing artifacts logged this month (talks, blog posts, podcast appearances, public PR). Write URLs to "Public Artifacts" sub-page if not already present.

4. NARRATIVE ARC (quarterly only — Jan / Apr / Jul / Oct)
Generate a 3-paragraph narrative covering last 90 days: through-line, demonstrated growth, direction. Write to "Career Narrative — Q[N] YYYY" sub-page.

DO NOT modify the canonical Portfolio. This is meta-analysis only.
```

---

## Activation checklist (do not proceed past Step 0)

0. [ ] **Compliance assessment signed off** ([`../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md`](../../../inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md))
1. [ ] Personal Notion workspace confirmed (not AgriProve's)
2. [ ] Notion sub-pages created
3. [ ] Personal Notion integration token created, scoped to personal workspace only
4. [ ] `personal_notion` MCP server added to Cowork
5. [ ] Tasks 1–3 created in Cowork using prompt bodies above
6. [ ] Task 1 run manually once to verify it writes to personal Notion (not AgriProve)
7. [ ] Personal Claude project set up with Notion MCP read access
8. [ ] Confidentiality Canary List sub-page populated

Full setup walkthrough: [`../../../inbox/cowork/2026-05-11-career-portfolio-setup.md`](../../../inbox/cowork/2026-05-11-career-portfolio-setup.md).
