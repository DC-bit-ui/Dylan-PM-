# Career Portfolio System — Knowledge-Sharing Compliance Assessment

> **For:** paste-ready content for a Notion sub-page under "Dylan Cronje — Professional & Personal Summary". Name the sub-page **"Knowledge-Sharing Compliance"** and paste the markdown below as the body.
>
> **Status:** **[DRAFT — awaiting Dylan's single-gate sign-off after Cowork policy-review task pre-fills citations]**
>
> **Why this exists:** This is the **single up-front gate** for the career-portfolio system. Once Dylan signs off here, the Apex flows run autonomously without further per-entry approval. The gate is meaningful precisely because it's the only one.
>
> **How it gets populated:** the Cowork policy-review task at [`./2026-05-11-cowork-policy-review-task.md`](./2026-05-11-cowork-policy-review-task.md) reads the AgriProve policies folder via the Windows filesystem and pre-fills the 14 categories below with actual citations. Dylan reviews, edits, and signs.

---

## Operational model: single gate, then trustless automation

```
  ┌─ ONE-TIME (Dylan's only manual step) ──────────────────────┐
  │ 1. Cowork runs policy-review task → prefilled compliance page │
  │ 2. Dylan reads, decides, signs → system activates             │
  └───────────────────────────────────────────────────────────────────┘
                              ↓
  ┌─ AUTONOMOUS (Dylan does not need to remember anything) ──────┐
  │ Daily   → Apex captures signal to Raw Log                    │
  │ Weekly  → Apex auto-promotes eligible entries to Portfolio   │
  │           (gated by sanitisation + canary + confidence)      │
  │ Weekly  → Audit digest posted to Cowork chat                 │
  │ Monthly → Skill graph, comp benchmark, narrative arc         │
  └───────────────────────────────────────────────────────────────────┘
```

**Dylan's only ongoing involvement:** glance at the Friday audit digest in Cowork. Redact in Notion if anything looks off; that single redaction also updates the canary list, so the same leak can't happen twice.

**Why this works without per-entry review:**
- Sanitisation rules are deterministic (strip the categories listed in CLAUDE.md §16)
- Confidentiality canary list is fail-closed — any term hit blocks auto-promotion for that entry, sends to Flagged sub-page (Dylan can ignore or review at leisure)
- Confidence threshold gates auto-promotion — only `high`-confidence Raw Log entries auto-promote; `moderate`/`low` go to Flagged sub-page (no review burden)
- Audit trail is preserved — Raw Log is intact; Portfolio history is intact; redaction is reversible

---

## What this system does

Dylan maintains a career portfolio — a continuously updated record of his professional achievements, skills demonstrated, and quantified wins — for use in CV / LinkedIn / cover letter / interview prep / remuneration discussions. The system captures signal from work systems (Granola, Outlook, Teams, Jira, Confluence, Notion) on a daily/weekly cadence via Apex automation in Cowork, sanitises it according to confidentiality rules, and stores the result in Dylan's **personal** Notion workspace. A separate personal Claude account reads the sanitised Portfolio for drafting external-facing material. Nothing AgriProve-confidential is stored outside AgriProve infrastructure.

---

## Architectural commitments that reduce risk

| Commitment | What it prevents |
|---|---|
| Career-aggregation data does NOT persist in the work-machine repo (`Dylan-PM-`) | Avoids the question of whether career-portfolio derivatives are AgriProve IP because they live on AgriProve-adjacent infrastructure |
| All career data lives in Dylan's PERSONAL Notion workspace, separated from the AgriProve Notion workspace | Clean tenant/account separation |
| Two distinct Notion API tokens — `notion` (AgriProve) and `personal_notion` (Dylan) — with different scopes | Defense in depth against accidental writes to the wrong workspace |
| Two-layer architecture: Raw Log (private, real names/numbers) and Portfolio (sanitised, publishable) | Real data never enters the publishable layer without programmatic gates |
| Sanitisation rules strip customer names, absolute metrics, internal product code names, named individuals, unannounced roadmap, third-party NDA names | Removes the categories most likely to constitute confidential information |
| Confidentiality canary list — fail-closed grep before any auto-promotion | Hard backstop if sanitisation misses something |
| Confidence threshold for auto-promotion (`high` only) | Borderline entries stay in Flagged sub-page; no surface to Portfolio without strong signal |
| Counter-Evidence Annex and Comp Benchmark Annex remain in Raw Log layer only — never synced to Portfolio or read by personal Claude | Honest interview prep without exposing weakness in any external-facing artifact |
| Personal Claude account reads ONLY the Portfolio sub-page, not Raw Log / Comp Annex / Counter-Evidence | Bounded blast radius if personal Claude ever leaks content |
| Apex Career Capture writes only to personal Notion; cannot reach AgriProve Notion (different MCP token) | Wrong-workspace writes architecturally impossible |
| Weekly audit digest → Cowork chat | Dylan sees what was promoted without needing to remember to check |
| Post-hoc redaction protocol: redact in Notion, add term to canary list | Self-healing system — same leak can't recur |

---

## Policy review — 14 categories

For each: the Cowork policy-review task pre-fills the citation, relevant clause, and alignment analysis. Dylan reviews, decides Proceed / Modify / Escalate, and signs.

### 1. Employment contract — IP assignment clause
- **Policy citation:** [PRE-FILLED BY COWORK TASK]
- **Relevant text:** [PRE-FILLED BY COWORK TASK]
- **Alignment:** Career narrative, skills demonstrated, and personal professional growth are typically NOT assigned IP — they are the employee's own. The architecture stores no AgriProve-owned IP (product code, methodology specifics, strategic plans, customer data) in personal infrastructure. [Cowork task to confirm Dylan's clause's scope — particularly any "all derivatives of work performed" language]
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify architecture [ ] Escalate to Legal

### 2. Confidentiality agreement / NDA
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** Confidentiality clauses typically cover trade secrets, customer information, financial data, unannounced products, internal strategy, and information not publicly available. The sanitisation rules in this system are designed to strip exactly these categories. Validate that the rules match the contractual definition of "confidential information."
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 3. Acceptable Use Policy (AUP) — IT systems
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** This architecture uses AgriProve's Cowork installation and AgriProve's Notion/Outlook/Teams/Granola/Jira/Confluence connectors to READ AgriProve data, then WRITES (post-sanitisation) to Dylan's personal systems. The question is whether using AgriProve compute/connectors for personal benefit (career portfolio) is permitted under the AUP.
- **Residual risk:** **HIGH-PRIORITY ITEM** — many AUPs prohibit "use of company systems for personal commercial benefit" without authorization. Career-advancement use may or may not qualify.
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 4. Data Classification Policy
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** If AgriProve has a data classification policy (Public / Internal / Confidential / Restricted), the sanitisation rules should be re-expressed in those terms. The Cowork task proposes the mapping; Dylan confirms.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 5. AI / GenAI Usage Policy
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** Anthropic's Claude (via Cowork) and the MCP connectors pipe AgriProve data through Claude. AgriProve's policy may approve or restrict this. The career-portfolio use case is incremental — same Claude, same connectors, new flow.
- **Residual risk:** **HIGH-PRIORITY ITEM** — verify the existing Apex flows were approved, and whether this new flow falls within that approval or needs separate sign-off.
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 6. Information Security Policy
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** The personal Notion sync transmits AgriProve-system-sourced data (post-sanitisation) to a Notion workspace outside AgriProve's tenant. Confirm sanitisation removes anything classified Confidential or Restricted before transmission.
- **Residual risk:** [Consider data-in-transit and data-at-rest. Personal Notion uses Notion's standard security; verify that's sufficient under InfoSec policy.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 7. External Communications Policy
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** Governs what employees can say publicly about their work. The Portfolio's downstream uses (CV, LinkedIn, interviews, talks) are external communications. The sanitisation rules need to align with what AgriProve's policy permits employees to disclose.
- **Residual risk:** [Some policies require pre-approval for LinkedIn job-related content or external speaking.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 8. Social Media Policy
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** Specifically relevant to LinkedIn updates drafted from the Portfolio. Confirm the policy permits employees to describe role, scope, and quantified achievements at the abstraction level the sanitiser produces.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 9. Australian Privacy Act 1988 (and APPs)
- **Statute reference:** Privacy Act 1988 (Cth); Australian Privacy Principles
- **Relevant text:** APPs governing collection, use, and disclosure of personal information about identifiable individuals.
- **Alignment:** Raw Log may contain personal information about colleagues, customers, stakeholders (names, opinions, reported feedback). Even though Raw Log is private, the Act may impose obligations on handling personal information about others.
- **Residual risk:** [MODERATE — verify Dylan's personal use of work-context personal information about others is within the "personal use" exemption or that he is acting under AgriProve's APP-compliant systems.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 10. Customer contract obligations (LawrieCo and others)
- **Citation:** [PRE-FILLED — Cowork task to enumerate non-public partnerships from the contracts folder if accessible]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** Customer and partner contracts may impose confidentiality obligations stricter than employment-level. Soil carbon methodology specifics, partnership terms, joint IP arrangements need explicit treatment.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 11. Schedule 2 / Clean Energy Regulator obligations
- **Citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** As a soil carbon platform, AgriProve operates under Schedule 2 and ERF regimes. Audit-related work may have regulator-imposed confidentiality obligations beyond company-level confidentiality.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 12. Trade secret protection
- **Common law / Corporations Act references**
- **Alignment:** Distinct from contractual confidentiality. Information that derives independent economic value from not being known and is subject to reasonable efforts to maintain secrecy is protected as trade secret. Sanitisation rules err on the side of stripping anything plausibly trade-secret. Canary list captures specific terms.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 13. Code of Conduct / Professional Conduct
- **Policy citation:** [PRE-FILLED]
- **Relevant text:** [PRE-FILLED]
- **Alignment:** Governs how the employee represents themselves and the company externally. Boundaries around competitive intelligence, comparative claims, public criticism.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 14. Insider information / market-sensitive information
- **Citation:** [PRE-FILLED if applicable]
- **Alignment:** If AgriProve has investor information-disclosure rules, financial / forward-looking information may be market-sensitive. The Portfolio's discussion of growth, scale, and trajectory may inadvertently touch this.
- **Residual risk:** [Confirm AgriProve's listing status and any analogous obligations.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

---

## Programmatic gates (replace the manual per-entry gate)

| Gate | Implementation | Failure mode |
|---|---|---|
| Sanitisation | Deterministic rules per CLAUDE.md §16 | Sanitiser miss → canary catches OR audit catches |
| Confidentiality canary list | Fail-closed grep of every promotion candidate against the canary sub-page | Canary hit → entry goes to Flagged sub-page, NOT auto-promoted; Dylan reviews when curious |
| Confidence threshold | Only `high`-confidence Raw Log entries auto-promote | `moderate`/`low` → Flagged sub-page; never block, just available |
| Cross-workspace guard | `personal_notion` token cannot reach AgriProve workspace; verified before each write | Token misconfig → ABORT, write error to inbox/cowork/, no silent failure |
| Audit digest | Friday post to Cowork chat: "promoted X, flagged Y, canary-blocked Z" | Dylan glances; redact protocol for any miss |
| Audit trail | Notion page history preserves who promoted what when; Raw Log retains real names | Reversible: redact, audit Raw Log for similar terms, update canary |

---

## Self-healing protocol

If Dylan spots a confidentiality miss in the Portfolio (post-promotion):

1. **Redact** the offending text in the Notion Portfolio sub-page
2. **Add** the leaked term(s) to the Confidentiality Canary List
3. **Trigger** Apex on-demand "canary re-audit" task to grep all existing Portfolio entries against the updated canary list; flag any matches for further redaction
4. (Optional) **Log** in Counter-Evidence Annex what was leaked and why, for sanitiser-rule improvement

The miss becomes the system's improvement — same leak can't happen twice.

---

## What requires re-review (not Dylan's everyday attention, but moments)

Re-run Step 0 (compliance assessment update) when:

- AgriProve issues a new or updated policy (HR / Legal notification)
- Dylan's role, scope, or surfaces materially change
- Dylan signs a new customer/partner contract he's personally bound by
- A regulatory change touches the Schedule 2 / Privacy Act / GenAI policy categories
- Dylan leaves AgriProve (the whole architecture pivots — raw layer may move to personal repo, AgriProve-connector reads cease)
- An audit digest surfaces a pattern of canary misses suggesting sanitiser rules need tightening

Annual cadence as backstop: scan AgriProve policies folder once a year for any changes; Cowork task re-runs the pre-fill and surfaces diffs.

---

## Sign-off (the gate)

| Reviewer | Date | Sign-off | Notes |
|---|---|---|---|
| Dylan Cronje (self) | [DATE] | [ ] Reviewed all 14 rows and signed off | This unlocks the autonomous Apex flows. |
| AgriProve People / HR | [DATE — only if Dylan chooses to share] | [ ] N/A OR [ ] Reviewed | Sharing is a transparency choice, not a contractual requirement. |
| AgriProve Legal | [DATE — only if Dylan chooses to share] | [ ] N/A OR [ ] Reviewed | Same. |

**Activation gate:** the Apex Career Capture flows do NOT activate until Dylan's self-review row is signed off. **Once signed, the flows operate autonomously. Dylan's only ongoing surface is the weekly audit digest in Cowork chat.**

---

## Change log

| Date | Change | Reason |
|---|---|---|
| 2026-05-11 | Initial draft of compliance framework | Dylan added safety-first compliance review |
| 2026-05-11 | Restructured to single-gate trustless automation model | Dylan's preference: one review, then automated; he shouldn't be a per-entry dependency |

---

## Disclaimer

This document is a self-assessment framework, not legal advice. Dylan is responsible for the actual policy review and for any decision to proceed. If anything looks like it would benefit from professional input, escalate to AgriProve Legal or external counsel.
