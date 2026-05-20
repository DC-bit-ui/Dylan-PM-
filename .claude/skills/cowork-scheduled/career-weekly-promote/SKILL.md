---
name: career-weekly-promote
description: Weekly auto-promote — sanitises eligible Raw Log entries and promotes to Portfolio. Runs the 6-transform career-sanitiser pipeline.
---

APEX · WEEKLY AUTO-PROMOTE — Friday 16:30 SAST

PREREQUISITES CHECK:
1. Verify personal_notion MCP is available. If not → ABORT.
2. Read the career-sanitiser skill: memory/deliverables/career/career-sanitiser-SKILL.md (or .claude/skills/career-sanitiser/SKILL.md if deployed). This contains the 6-transform pipeline.
3. Read the Confidentiality Canary List from the personal Notion sub-page. If canary list is empty or missing → ABORT with "Canary list not populated. Cannot run auto-promote without it."

TARGET:
- Personal Notion page id 3288c08eb28f81378a20f1a9913dcd27
- Read from: "Raw Log — Pending Review"
- Write to: "Portfolio" sub-pages (Track Record / Quantified Wins / Public Artifacts) OR "Flagged — Manual Review"

FOR EACH Raw Log entry from the past 7 days:

1. CHECK ELIGIBILITY (all three must pass):
   a. Confidence == "high"
   b. All 6 sanitisation transforms complete cleanly (no Flagged routing)
   c. Canary list grep returns ZERO hits on the sanitised output

2. RUN THE 6-TRANSFORM PIPELINE (per career-sanitiser skill):
   Transform 1: STRIP NAMES → ROLES (people → role titles)
   Transform 2: STRIP NUMBERS → RATIOS (absolutes → percentages/multipliers)
   Transform 3: STRIP IDENTIFIERS → ARCHETYPES (customers/properties/locations → category-level)
   Transform 4: STRIP INTERNALS → GENERIC (product names/tech → descriptive phrases)
   Transform 5: REFRAME COMPANY → PERSONAL (company narrative → Dylan's personal agency)
   Transform 6: CANARY CHECK (grep sanitised output against canary list, fail-closed)

3. ROUTE:
   - All gates pass → PROMOTE to Portfolio in this format:

     ### [DATE] — [One-line headline]
     **Context:** [1-2 sentences, public-information framing only]
     **What I did:** [2-3 sentences, role titles not names]
     **Result:** [1-2 sentences, ratios/percentages not absolutes]
     **Skills demonstrated:** [comma-separated list]
     _Source: Raw Log [date] | Promoted: [date] | Confidence: high_

   - Any gate fails → route to "Flagged — Manual Review" with reason code:
     low-conf / unknown-person / absolute-number-unresolvable / identifier-unresolvable / unmapped-internal-term / attribution-ambiguous / canary-hit-on-<term>

4. Mark processed Raw Log entries as "Processed" (property update, don't delete).

DO NOT:
- Modify Raw Log content (preserve for audit trail)
- Promote anything with confidence < high
- Skip the canary check
- Edit previously promoted Portfolio entries

OUTPUT (for audit digest to consume + Cowork chat):
- Promoted: N entries with one-line summaries
- Flagged: M entries with reason codes
- Canary-blocked: K entries with offending terms
- New skills demonstrated this week