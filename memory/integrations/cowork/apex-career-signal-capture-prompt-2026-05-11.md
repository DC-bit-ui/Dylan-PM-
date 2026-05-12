# Apex Career Signal Capture — prompt spec

**Status:** **READY. Sanitiser tightened 2026-05-12 against verbatim Letter of Offer + 9 Portfolio Rules.** Activation requires Cowork-side setup (personal Notion integration token, MCP add, Apex tasks created, canary populated) — see [`../../../inbox/cowork/2026-05-12-cowork-activation-task.md`](../../../inbox/cowork/2026-05-12-cowork-activation-task.md).

**Purpose:** Daily / weekly / monthly Apex flows that capture career signal, auto-promote eligible entries to the Portfolio (gated programmatically by 9 Portfolio Rules + canary + confidence threshold), and audit-report to Dylan.

**Critical separation:** uses the `personal_notion` MCP server bound to Dylan's personal Notion integration token. Never the AgriProve `notion` MCP. Verify token resolution before any write.

**Authority basis:** [`../../decisions/2026-05-12-career-portfolio-9-rules.md`](../../decisions/2026-05-12-career-portfolio-9-rules.md) + [`../../learnings/2026-05/2026-05-12-letter-of-offer-key-clauses.md`](../../learnings/2026-05/2026-05-12-letter-of-offer-key-clauses.md).

---

## Task 1 — Apex · Career Signal Capture (daily)

**Schedule:** 18:00 SAST weekdays, after Apex EOD Reconciliation (17:30). **Cron (AEST):** `0 2 * * 2-6`. **MCP servers:** `personal_notion`, `granola`, `outlook`, `teams`, `jira`, `confluence`, `notion` (AgriProve, read-only).

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
   - Scope / responsibility changes ("Dylan now owns…")
2. Outlook — today's sent + inbox replies. Praise / acknowledgment / forward-looking commitments to senior stakeholders.
3. Teams — today's DMs + channels. Recognition / decisive moments / scope signals.
4. Jira — Dylan-authored / led tickets transitioned today. Epic completion, cross-team coordination.
5. Confluence — Dylan's edits / comments today. Strategy / decision docs.
6. Notion Work Priorities (AgriProve workspace, READ-ONLY) — tasks Dylan marked Done. Initiative completions, decisions.

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

CONFIDENCE RUBRIC (only high triggers auto-promotion):
- high: clear evidence, quantifiable outcome, Dylan's name explicitly tied, CV-worthy
- moderate: plausibly career-grade but quantification unclear, attribution slightly ambiguous, or scope mid-tier
- low: borderline, weak signal, ambiguous attribution — capture anyway, won't promote

DO NOT:
- Write to AgriProve Notion workspace
- Sanitise at this stage — raw detail stays in Raw Log
- Write to Portfolio directly
- Skip entries because they feel borderline — capture rich, let promotion gates filter

OUTPUT (Cowork chat):
- Count of signals captured by category
- Top 3 by confidence
- If zero signals: say so, do not pad
```

---

## Task 2 — Apex · Weekly Auto-Promote (weekly)

**Schedule:** Friday 16:30 SAST. **Cron (AEST):** `30 0 * * 6`. **MCP servers:** `personal_notion` only.

This task **replaces the manual promotion gate**. Auto-promotes eligible entries; routes ineligible to Flagged.

### Prompt body

```
APEX · WEEKLY AUTO-PROMOTE

PURPOSE: Process the past 7 days of Raw Log — Pending Review entries. Auto-promote eligible to Portfolio. Route ineligible to Flagged.

FOR EACH entry from the past 7 days:

GATE A — CONFIDENCE THRESHOLD
Auto-promote requires confidence == "high". Anything else → Flagged with reason "low-conf".

GATE B — SANITISATION (deterministic strip / reframe rules; 9 Portfolio Rules basis)

Apply ALL of the following. If any rule produces an ambiguous output, route to Flagged with reason "sanitiser-ambiguous":

1. CUSTOMER / PROPERTY / PROJECT NAMES → archetype
   - "a tier-1 cattle station in NSW", "a mid-sized broadacre operation in WA"
   - Strip property identifiers, project code names, client names
   - (Rule 1, Rule 6; cl 19.1.5–1.6)

2. ABSOLUTE FINANCIAL / VOLUME FIGURES → ratios / percentages / multipliers
   - $X revenue → "meaningful revenue growth"; "40% reduction"; "tripled"; "meaningful proportion of TAM"
   - Strip ACCU volumes, hectare totals, yield rates, project value, contract value, valuation, funding amounts, growth metrics
   - (Rule 1, Rule 4; cl 19.1; insider-info heightened mode until 1 July 2026)

3. INTERNAL PRODUCT / SYSTEM NAMES → descriptive
   - HORIZON → "the soil carbon measurement platform"
   - Stormboy → "the operational tracking tool"
   - Frontier / Verterra / ReadyGraze / KCT → descriptive equivalents
   - Any unannounced product / project code name → category
   - (Rule 1, Rule 4; cl 19.1.4 "data, know how, algorithms and technology")

4. NAMED TEAM MEMBERS → role titles
   - "led team of 6", "presented to CEO", "escalated to VP Engineering"
   - Strip individual names except public-facing leaders in context (and even those, default to role)
   - (Rule 2, Rule 6)

5. THIRD-PARTY NDA-BOUND NAMES → type
   - LawrieCo → "a delivery partner"
   - Clean Energy Regulator → "the federal regulator"
   - Named auditors / consultants → "a specialist consultancy"
   - (Rule 2, Rule 6)

6. ALGORITHM / MODEL / METHODOLOGY DESCRIPTIONS → STRIP ENTIRELY
   - SOC quantification methodology, calibration approaches, accuracy metrics, validation results, measurement protocols, lab procedures, sampling approaches → strip
   - Replace with: "the company uses proprietary soil carbon measurement technology" (no how)
   - (Rule 1, Rule 5, Rule 7; cl 19.1.4, cl 20.1)

7. SYSTEM ARCHITECTURE / INFRASTRUCTURE / VENDOR DETAILS → STRIP or category
   - Specific tools / platforms / vendors used internally (unless publicly known via AgriProve's website) → strip
   - API integrations, data flows, system boundaries, security configurations → strip
   - Frame abstractly: "we evaluated build vs. buy for spatial data processing" not "we use [tool] on [infra]"
   - (Rule 5; cl 19.1.4)

8. WORK-PRODUCT REFERENCES → STRIP ENTIRELY
   - PRDs, code, design specs, data models, research outputs, internal documents → strip
   - Replace with: "I led the discovery / planning / roadmap for [category]"
   - (Rule 5; cl 20.1, 20.5 — IP assignment, no publishing)

9. CL 20 IP REFRAME PASS — LANGUAGE
   - "I built X" → "I led the development of X"
   - "I designed X" → "I led the design of X" or "I contributed to the design of X"
   - "I invented X" → "I led the invention of X" (or just strip if X is methodology/IP — see rule 6)
   - "I created X" → "I led the creation of X"
   - The goal: portfolio describes Dylan as a leader / manager / contributor, not as the source of IP that AgriProve owns under cl 20
   - (Rule 5; cl 20.1)

10. LINKEDIN / CLIENT-RELATIONSHIP REFERENCES → STRIP ENTIRELY
    - "managed relationships with X clients", "key contact for [client name]", "developed network of [N] industry connections" → strip or aggregate to category ("engaged with agricultural landholders")
    - cl 19.1.8 is explicit: LinkedIn-stored client lists developed during employment are Confidential
    - (Rule 6; cl 19.1.8)

11. FORWARD-LOOKING / INSIDER-SENSITIVE STATEMENTS → STRIP
    - Company direction / strategy / valuation trajectory / funding plans / hiring plans / market expansion plans → strip
    - Historical-only framing safe; forward-looking strip
    - Heightened mode until 1 July 2026 (EOP Minimum Holding Period)
    - (Rule 2, Rule 3; cl 19.1, insider-info)

12. GEOGRAPHIC IDENTIFIERS / GEOTAGGED DATA → STRIP ENTIRELY
    - Coordinates, property locations, lab results with location, imagery with geotags → strip
    - Regional descriptors must aggregate enough that reverse-engineering to a specific client / property is implausible ("properties in eastern Australia" OK; "a 5,000-hectare property in the Riverina" NOT OK)
    - (Rule 1, Rule 6; DRAFT Protected Information Policy s3.1 — absolute restriction)

13. COMPANY-POSITION / PUBLIC-COMMENTARY LANGUAGE → REFRAME or STRIP
    - "AgriProve decided to do X because Y" → "I worked on X within the company's strategic direction"
    - Never claim to speak for AgriProve
    - Avoid implying insider access to decision-making rationale
    - (Rule 3; HSE003 s5.3)

14. UNANNOUNCED ROADMAP / STRATEGY → category-level only
    - Pre-launch product names → category
    - Unannounced partnerships / regulatory positions → strip
    - (Rule 1, Rule 11)

15. INTERNAL CONFLICT / NAMED FAILURE → category-level learning only
    - "led recovery from a vendor integration outage" OK; named parties / specific incident detail NOT OK
    - (Rule 2, Rule 6)

16. REGULATORY / COMPLIANCE INTERNALS → public framework only
    - Schedule 2 audit details, AFSL operational decisions, ERF method internals → strip
    - "I work within the ERF regulatory framework and the Carbon Industry Code of Conduct" OK; "AgriProve's AFSL compliance process involves [specifics]" NOT OK
    - (Rule 7; cl 19.1)

GATE C — CONFIDENTIALITY CANARY CHECK

After sanitisation, grep the candidate against the Confidentiality Canary List sub-page (private, in personal Notion). Case-insensitive, word-boundary-aware. If ANY hit: route to Flagged with reason "canary-hit-on-<term>". Do NOT auto-promote even if all other gates pass.

ROUTE THE ENTRY:
- ALL THREE GATES PASS (high confidence + sanitisation clean + canary clean) → PROMOTE: append sanitised STAR to Portfolio sub-section
- ANY GATE FAILS → FLAGGED: append to "Flagged — Manual Review" with the failed gate's reason

AUDIT FIELDS (on each promoted Portfolio entry):
- Source Raw Log entry ID (link)
- Promotion timestamp
- Confidence at promotion: high
- Canary version applied
- Sanitisation rules that fired (which strips happened)

DO NOT:
- Modify Raw Log entries (preserve for audit; mark "Processed" via property only)
- Promote anything below high confidence
- Skip the canary check
- Modify Portfolio entries from previous weeks (no retroactive edits without explicit "canary re-audit" trigger)

OUTPUT (for the Audit Digest task):
- Promoted: N entries, with one-line summaries
- Flagged: M entries, with reason codes
- Canary blocked: K entries, with offending terms
- New skills demonstrated this week (extracted from promoted entries)
```

---

## Task 3 — Apex · Weekly Audit Digest (weekly)

**Schedule:** Friday 16:45 SAST. **Cron (AEST):** `45 0 * * 6`. **MCP servers:** `personal_notion` only.

### Prompt body

```
APEX · WEEKLY AUDIT DIGEST

PURPOSE: Post a glance-able summary of this week's career-portfolio activity to Cowork chat. Dylan reads in 30 seconds.

Read the output of Apex · Weekly Auto-Promote (this week's run). Format:

  CAREER PORTFOLIO — WEEK OF [date]

  Auto-promoted: N entries
  - <one-line summary of each, sanitised>

  Flagged for optional review: M (in Flagged sub-page)
  - <one-line + reason: low-conf / sanitiser-ambiguous / canary-hit-on-X>

  Canary-blocked: K
  - <terms triggered — if patterns emerge, canary updates may help>

  New skills demonstrated this week:
  - <list>

  Cumulative this quarter:
  - Portfolio entries: <total>
  - Skills count: <total>
  - Scope expansion flags: <count, link to Comp Benchmark Annex>

  If anything looks off:
  1. Open Portfolio sub-page, redact the offending text
  2. Add the leaked term to Confidentiality Canary List
  3. Trigger Apex on-demand "canary re-audit" to scan existing Portfolio

Post to Cowork chat. Do not write to Notion (in-the-moment notification, not durable).
```

---

## Task 4 — Apex · Monthly Portfolio Meta-Pass (monthly)

**Schedule:** First Monday 06:00 SAST. **Cron (AEST):** `0 14 1-7 * 1`. **MCP servers:** `personal_notion` only.

### Prompt body

```
APEX · MONTHLY PORTFOLIO META-PASS

1. SKILL GRAPH UPDATE
Scan all canonical Portfolio entries. Extract demonstrated skills (e.g., stakeholder mgmt, RICE prioritisation, vendor mgmt, Shape Up, discovery, P&L modelling, Schedule 2 regulatory expertise, ERF / Carbon Industry Code domain). Increment counters. Write Skills Index sub-page: Skill | Count | Latest Example | Notes.

2. COMP BENCHMARKING FLAGS
Identify scope-expansion Portfolio entries in past 90 days (new surface owned, new stakeholder forum, headcount under management, P&L exposure, new geography). Flag in Comp Benchmark Annex: Date | Expansion | Suggested next benchmark check (market data sources, peer roles).

3. PUBLIC ARTIFACTS REGISTRY
Scan for public-facing artifacts this month (talks, blog posts, podcasts, public PR). Write URLs to Public Artifacts sub-page if not already present.

4. NARRATIVE ARC (quarterly only — Jan / Apr / Jul / Oct)
Generate 3-paragraph narrative: through-line of past 90 days, demonstrated growth, direction. Write to "Career Narrative — Q[N] YYYY" sub-page.

DO NOT modify canonical Portfolio entries. Meta-analysis only.
```

---

## On-demand task — Canary re-audit (Dylan triggers manually)

```
APEX · CANARY RE-AUDIT (on-demand)

PURPOSE: After Dylan updates the Confidentiality Canary List, scan all existing Portfolio entries against the new list.

1. Read current Canary List
2. For each existing Portfolio entry (Track Record, Quantified Wins, Public Artifacts, Career Narrative):
   - Grep against canary terms (case-insensitive, word-boundary-aware)
   - If any hit: flag in "Canary Re-Audit — [date]" sub-page, offending term highlighted
3. Output to Cowork chat: count and list of flagged entries
4. Do NOT auto-redact. Dylan reviews and redacts manually — then updates canary further if needed.
```

---

## Activation checklist (see [`../../../inbox/cowork/2026-05-12-cowork-activation-task.md`](../../../inbox/cowork/2026-05-12-cowork-activation-task.md) for the one-paste setup)

0. [x] **Compliance gate signed off** — see [`../../decisions/2026-05-12-career-portfolio-9-rules.md`](../../decisions/2026-05-12-career-portfolio-9-rules.md) and [`../../../inbox/cowork/2026-05-12-cl-13-1-defensibility.md`](../../../inbox/cowork/2026-05-12-cl-13-1-defensibility.md)
1. [ ] **Canary List populated** in personal Notion (Cowork pre-drafts; Dylan reviews)
2. [ ] Personal Notion workspace confirmed
3. [ ] Notion sub-pages created (Portfolio + sub-sections, Raw Log, Flagged, Skills Index, Comp Annex, Public Artifacts, Counter-Evidence, Canary List)
4. [ ] Personal Notion integration token created and scoped
5. [ ] `personal_notion` MCP added to Cowork
6. [ ] Tasks 1–4 created in Cowork using prompt bodies above
7. [ ] Task 1 manual run → verifies write goes to personal Notion
8. [ ] Task 2 manual run (with Raw Log entries) → verifies auto-promote + canary + cl 20 reframe
9. [ ] Personal Claude project set up with Notion MCP read access
