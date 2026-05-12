# Cowork Activation Task — Career Portfolio System (single paste)

**For:** Dylan to paste into a fresh Cowork thread on his personal Windows machine.

**Purpose:** Stand up the entire career-portfolio system end-to-end in one Cowork session, with explicit pause points for the two steps that require Dylan's UI clicks (Notion integration token + Cowork MCP server add).

**Authority basis already in place:**
- 9 Portfolio Rules: [`../../memory/decisions/2026-05-12-career-portfolio-9-rules.md`](../../memory/decisions/2026-05-12-career-portfolio-9-rules.md)
- Letter of Offer key clauses: [`../../memory/learnings/2026-05/2026-05-12-letter-of-offer-key-clauses.md`](../../memory/learnings/2026-05/2026-05-12-letter-of-offer-key-clauses.md)
- Cl 13.1 defensibility: [`./2026-05-12-cl-13-1-defensibility.md`](2026-05-12-cl-13-1-defensibility.md)
- Compliance assessment (gate closed): [`./2026-05-11-career-portfolio-compliance-assessment.md`](2026-05-11-career-portfolio-compliance-assessment.md)
- Apex prompt spec (sanitiser-tightened): [`../../memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md`](../../memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md)

---

## Prompt body (paste verbatim into Cowork)

```
CAREER PORTFOLIO · ACTIVATION TASK

You are activating the career-portfolio system end-to-end. Three phases. PAUSE between phases where indicated and ask Dylan to confirm UI steps before continuing.

Authority docs (read all five before starting):
- memory/decisions/2026-05-12-career-portfolio-9-rules.md (the 9 standing rules)
- memory/learnings/2026-05/2026-05-12-letter-of-offer-key-clauses.md (verbatim Letter of Offer)
- inbox/cowork/2026-05-12-cl-13-1-defensibility.md (defence analysis)
- inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md (full gate)
- memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md (4 Apex task prompts)

=== PHASE A — PRE-CHECKS + CANARY DRAFT ===

A1. Verify your filesystem access:
    - cd "C:\Dylan PM" works
    - The five authority docs above exist and are readable
    If any fail: ABORT, surface error.

A2. Verify personal Notion access:
    - Use the existing notion MCP first to check what workspace it's bound to
    - If it's bound to AgriProve workspace: confirm by checking workspace name
    - DO NOT YET attempt to write to Dylan's personal workspace — the personal_notion MCP doesn't exist yet (created in Phase B)

A3. PRE-DRAFT THE CONFIDENTIALITY CANARY LIST
    
    Read these sources in this repo:
    - memory/people/roster.md (named individuals)
    - memory/business/products.md (internal product names)
    - memory/business/customers.md (customer archetypes — do NOT extract specific names if any present; flag for Dylan to redact)
    - memory/business/glossary.md (methodology terms, regulatory acronyms with internal compliance meaning)
    - memory/business/strategy.md (unannounced strategy, OKRs not yet public)
    - memory/integrations/cowork.md and *.md (MCP-extracted internal identifiers)
    
    Compose a draft Confidentiality Canary List with sections:
      Customer / Property / Partner names (one per line)
      Internal product / system names not in public marketing (HORIZON, Stormboy, Frontier, Verterra, ReadyGraze, KCT, any others)
      Specific financial figures / valuation / ACCU volumes / hectare totals Dylan has handled
      Initiative / project code names not yet announced
      Named individuals beyond standard public-facing leaders (CEO, COO, CTO are typically OK to name in context; everyone else default to role)
      Methodology / algorithm / model terms (HORIZON modelling, SOC quantification specifics, calibration terms, accuracy metric values)
      Third-party NDA-bound names (LawrieCo, regulators, partners)
      Pre-launch product names
      Geographic identifiers Dylan has worked with (specific regions / properties)
    
    Write the draft to: inbox/cowork/2026-05-12-canary-draft.md
    
    Include a header: "DRAFT — Dylan reviews and edits before pasting into personal Notion 'Confidentiality Canary List' sub-page in Phase C."
    
    git add inbox/cowork/2026-05-12-canary-draft.md && git commit -m "Pre-drafted canary list from repo memory" && git push origin main
    (If push 403s, use mcp__github__push_files — per memory/learnings/2026-05/2026-05-11-git-push-403-workaround.md)

A4. PAUSE — report to Dylan in chat:
    "Phase A complete. Canary draft at inbox/cowork/2026-05-12-canary-draft.md. 
     Before Phase B, you need to do TWO UI things:
       1. In personal Notion: create the sub-page structure (I'll list it below) AND create a new Notion integration scoped to your personal workspace. Copy the token.
       2. In Cowork settings: add a new MCP server named `personal_notion` with that token.
     I'll wait for your confirmation that both are done, plus the token (paste into this thread or save as env var; do NOT commit to git)."
    
    Provide Dylan the exact sub-page list:
      Dylan Cronje — Professional & Personal Summary
      ├── Knowledge-Sharing Compliance (already exists per gate)
      ├── Portfolio
      │   ├── Role Summary
      │   ├── Track Record
      │   ├── Quantified Wins
      │   ├── Public Artifacts
      │   └── Career Narrative
      ├── Raw Log — Pending Review
      ├── Flagged — Manual Review
      ├── Skills Index
      ├── Comp Benchmark Annex
      ├── Public Artifacts Registry
      ├── Counter-Evidence Annex (PRIVATE)
      └── Confidentiality Canary List (PRIVATE — paste from inbox/cowork/2026-05-12-canary-draft.md after editing)
    
    Provide Notion integration setup link: https://www.notion.so/profile/integrations
      Capabilities: Read content, Update content, Insert content. NO User information.
      Associated workspace: personal (NOT @agriprove)
      Then on the Professional & Personal Summary page: "..." → Connections → add the new integration.
    
    DO NOT PROCEED until Dylan confirms.

=== PHASE B — AFTER DYLAN COMPLETES UI STEPS ===

B1. Verify personal_notion MCP is now available and resolves to Dylan's personal workspace (NOT @agriprove). If it resolves to AgriProve: ABORT, escalate to Dylan.

B2. Sanity check: read the parent page (3288c08eb28f81378a20f1a9913dcd27) via personal_notion. Confirm the sub-pages listed above exist. If any missing: ask Dylan to create them or create programmatically if API permits.

B3. Read inbox/cowork/2026-05-12-canary-draft.md (Dylan may have edited). If empty / not edited / clearly placeholder: ask Dylan to confirm canary contents before proceeding.

B4. Confirm canary is populated in the personal Notion "Confidentiality Canary List" sub-page. Dylan may have pasted directly; you can also write programmatically if he asks.

B5. PAUSE — confirm to Dylan: "Phase B complete. personal_notion MCP resolves correctly to your personal workspace. Sub-pages exist. Canary populated. Proceeding to Phase C — creating the four Apex tasks and running Task 1 once to verify."

=== PHASE C — CREATE APEX TASKS + VERIFY ===

C1. CREATE THE FOUR APEX TASKS

For each, in Cowork → Tasks → + New task. Use the prompt body for each task verbatim from memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md.

| Task | Schedule (SAST) | Cron (AEST) | MCP servers |
|---|---|---|---|
| Apex · Career Signal Capture (daily) | 18:00 weekdays | `0 2 * * 2-6` | personal_notion, granola, outlook, teams, jira, confluence, notion (read-only) |
| Apex · Weekly Auto-Promote (weekly) | Fri 16:30 | `30 0 * * 6` | personal_notion only |
| Apex · Weekly Audit Digest (weekly) | Fri 16:45 | `45 0 * * 6` | personal_notion only |
| Apex · Monthly Meta-Pass (monthly) | First Mon 06:00 | `0 14 1-7 * 1` | personal_notion only |

Also create the on-demand task "Apex · Canary Re-Audit" with no schedule, using the on-demand prompt body. Dylan triggers manually.

C2. SMOKE TEST — RUN TASK 1 (Career Signal Capture) MANUALLY

Fire Task 1 once now. Confirm:
- It writes to Dylan's PERSONAL Notion (not AgriProve) — check page edit attribution
- Entries land in "Raw Log — Pending Review" sub-page
- Entry shape: STAR + Evidence + Confidence (not sanitised — raw)
- If today is mid-week and there's any signal, expect entries; if low-signal day, zero is fine

If wrong workspace OR no signal correctly detected: STOP, surface to Dylan.

C3. SMOKE TEST — RUN TASK 2 (Weekly Auto-Promote) MANUALLY (only if Task 1 captured something)

If Task 1 produced entries, run Task 2 on those entries. Verify:
- All 16 sanitisation rules apply correctly (especially: Cl 20 IP reframe "I built" → "I led the development of")
- Canary check fires against the populated canary list
- Promotion gate only allows confidence=high+sanitisation-clean+canary-clean
- Otherwise routes to Flagged sub-page

If any rule misfires: surface the specific case to Dylan with the offending entry + expected sanitisation.

C4. WRITE THE ACTIVATION RECORD

Write to inbox/cowork/2026-05-12-activation-confirmed.md:
  - Timestamp activation completed
  - Confirmation of all four tasks scheduled
  - First manual-run outputs (counts, samples)
  - Any anomalies
  - Next scheduled fire times

git add inbox/cowork/2026-05-12-activation-confirmed.md && git commit -m "Career portfolio system activated; first runs verified" && git push origin main

C5. REPORT TO DYLAN

Final chat message:
  "CAREER PORTFOLIO ACTIVATED.
   
   Four Apex tasks scheduled and verified:
   - Career Signal Capture: next fire <datetime>
   - Weekly Auto-Promote: next fire <datetime>
   - Weekly Audit Digest: next fire <datetime>
   - Monthly Meta-Pass: next fire <datetime>
   
   First runs completed:
   - Today's capture: <N entries / 0 if low-signal day>
   - Auto-promote test: <results if applicable>
   
   Personal Claude project set up: <yes/no>
   - If no: separate ~10 min UI task on personal account; instructions at inbox/cowork/2026-05-11-career-portfolio-setup.md §3
   
   Ongoing: ~5 min/week glance at Friday audit digest in this Cowork chat. Nothing else required from you until anything looks off."

=== CRITICAL RULES THROUGHOUT ===

- VERIFY personal_notion token resolution before EVERY write. Wrong-workspace write = critical incident.
- If anything fails or surprises you, STOP and surface to Dylan rather than continuing.
- DO NOT modify any AgriProve Notion content (Work Priorities database is off-limits to this task).
- DO NOT log canary contents to chat verbatim — the list itself is confidential; reference by section / count.
- AT EVERY PAUSE: state what's done, what's next, what you need from Dylan, and wait for explicit confirmation before proceeding.
```

---

## What's left for Dylan personally (cannot be automated from here)

1. **Run the prompt above** in Cowork (one paste, three explicit pause points)
2. **Two UI steps during Phase A→B pause:**
   - Create personal Notion integration token (~3 min)
   - Add `personal_notion` MCP server in Cowork settings (~2 min)
3. **Review the canary draft** Cowork produces and edit before pasting into Notion (~5–10 min)
4. **Personal Claude project setup** (separate ~10 min UI task on personal Claude account) — see [`./2026-05-11-career-portfolio-setup.md`](2026-05-11-career-portfolio-setup.md) §3

Total Dylan time: ~25 min of UI clicks + Cowork-paced confirmations.

After activation: **~5 min/week** glancing at the Friday audit digest. The system is autonomous.

---

## Optional: Cl 13.1 escalation

If Dylan prefers to escalate to AgriProve People for written approval despite the defensibility analysis: draft a message via the `dylans-voice` skill referencing [`./2026-05-12-cl-13-1-defensibility.md`](2026-05-12-cl-13-1-defensibility.md). Frame as transparency, not request for new authorisation.

Not required for activation. Architecture stands on personal-record-keeping defence.
