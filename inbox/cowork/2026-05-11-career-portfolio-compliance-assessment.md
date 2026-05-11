# Career Portfolio System — Knowledge-Sharing Compliance Assessment

> **For:** paste-ready content for a Notion sub-page under "Dylan Cronje — Professional & Personal Summary". Name the sub-page **"Knowledge-Sharing Compliance"** and paste the markdown below as the body.
>
> **Status:** **[DRAFT — awaiting Dylan's self-assessment and citation of actual AgriProve policies]**
>
> **Why this exists:** Before the career-portfolio Apex sync activates, Dylan validates that the architecture aligns with AgriProve's actual policies and applicable Australian law. This page becomes the authoritative compliance record. If anyone asks "is your career portfolio compliant with your employment obligations?", this page is the answer.
>
> **Important:** I (Claude) **do not have access to AgriProve's actual policy documents**. Each policy category below has placeholders Dylan populates with verbatim citations from the actual documents. Do not enact the system until this page is signed off.

---

## TL;DR

> [Write this last, after completing the table below. One paragraph: the architecture is compliant with AgriProve's policies and Australian law; cite the key clauses; flag any residual risks.]

---

## What this system does

Dylan maintains a career portfolio — a continuously updated record of his professional achievements, skills demonstrated, and quantified wins — for use in CV / LinkedIn / cover letter / interview prep / remuneration discussions. The system captures signal from work systems (Granola, Outlook, Teams, Jira, Confluence, Notion) on a daily/weekly cadence via Apex automation in Cowork, sanitises it according to confidentiality rules, and stores the result in Dylan's **personal** Notion workspace. A separate personal Claude account reads the sanitised portfolio for drafting external-facing material. Nothing AgriProve-confidential is stored outside AgriProve infrastructure.

---

## Architectural commitments that reduce risk

| Commitment | What it prevents |
|---|---|
| Career-aggregation data does NOT persist in the work-machine repo (`Dylan-PM-`) | Avoids the question of whether career-portfolio derivatives are AgriProve IP because they live on AgriProve-adjacent infrastructure |
| All career data lives in Dylan's PERSONAL Notion workspace, separated from the AgriProve Notion workspace | Clean tenant/account separation |
| Two distinct Notion API tokens — `notion` (AgriProve) and `personal_notion` (Dylan) — with different scopes | Defense in depth against accidental writes to the wrong workspace |
| Two-layer architecture: Raw Log (private, real names/numbers) and Portfolio (sanitised, publishable) | Real data never enters the publishable layer without an explicit promotion gate |
| Sanitisation rules strip customer names, absolute metrics, internal product code names, named individuals, unannounced roadmap, third-party NDA names | Removes the categories most likely to constitute confidential information |
| Confidentiality canary list — fail-closed check before any sync | Hard backstop if sanitisation misses something |
| Counter-Evidence Annex and Comp Benchmark Annex remain in Raw Log layer only — never synced to publishable layer or read by personal Claude | Honest interview prep without exposing weakness in any external-facing artifact |
| Weekly promotion gate is manual (Dylan reviews before promoting Raw Log entries to Portfolio) | Dylan stays in the loop on every external-facing artifact |
| Personal Claude account reads ONLY the Portfolio sub-page, not Raw Log / Comp Annex / Counter-Evidence | Bounded blast radius if personal Claude ever leaks content |
| Apex Career Capture writes only to personal Notion; cannot reach AgriProve Notion (different MCP token) | Wrong-workspace writes architecturally impossible |

---

## Policy review — populate each section before activation

For each policy category: cite the actual AgriProve document, paste the relevant clause, state how the architecture aligns, note residual risks, decide.

### 1. Employment contract — IP assignment clause
- **Policy citation:** [DOCUMENT NAME, SECTION, DATE SIGNED]
- **Relevant text:** [PASTE VERBATIM]
- **Alignment:** Career narrative, skills demonstrated, and personal professional growth are typically NOT assigned IP — they are the employee's own. The architecture stores no AgriProve-owned IP (product code, methodology specifics, strategic plans, customer data) in personal infrastructure. [DYLAN TO CONFIRM HIS CLAUSE'S SCOPE — particularly any "all derivatives of work performed" language]
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify architecture [ ] Escalate to Legal

### 2. Confidentiality agreement / NDA
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** Confidentiality clauses typically cover trade secrets, customer information, financial data, unannounced products, internal strategy, and information not publicly available. The sanitisation rules in this system are designed to strip exactly these categories. Validate that the rules match the contractual definition of "confidential information."
- **Residual risk:** [Define edge cases — e.g., aggregated/anonymised data may still be confidential under some clauses.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 3. Acceptable Use Policy (AUP) — IT systems
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** This architecture uses AgriProve's Cowork installation and AgriProve's Notion/Outlook/Teams/Granola/Jira/Confluence connectors to READ AgriProve data, then WRITES (post-sanitisation) to Dylan's personal systems. The question is whether using AgriProve compute/connectors for personal benefit (career portfolio) is permitted under the AUP.
- **Residual risk:** [HIGH-PRIORITY ITEM — many AUPs prohibit "use of company systems for personal commercial benefit" without authorization. Career-advancement use may or may not qualify.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 4. Data Classification Policy
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** If AgriProve has a data classification policy (Public / Internal / Confidential / Restricted), the sanitisation rules should be re-expressed in terms of those classifications. Currently the rules are framed generically — refactor after review.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 5. AI / GenAI Usage Policy
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** Anthropic's Claude (used via Cowork) and the MCP connectors pipe AgriProve data through Claude. AgriProve's policy may approve or restrict this. The career-portfolio use case is incremental: it does not add new Claude/connector capability, just a new flow.
- **Residual risk:** [HIGH-PRIORITY ITEM — 2024-2026 has seen rapid AI-policy introduction. Verify the existing Apex flows (Morning Briefing, EOD Reconciliation) were approved, and whether this new flow falls within that approval or needs separate sign-off.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 6. Information Security Policy
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** The personal Notion sync transmits AgriProve-system-sourced data (post-sanitisation) to a Notion workspace outside AgriProve's tenant. Confirm sanitisation removes anything classified Confidential or Restricted before transmission.
- **Residual risk:** [Consider data-in-transit and data-at-rest. Personal Notion uses Notion's standard security; verify that's sufficient under InfoSec policy.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 7. External Communications Policy
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** Governs what employees can say publicly about their work. The portfolio's downstream uses (CV, LinkedIn, interviews, talks) are external communications. The sanitisation rules need to align with what AgriProve's policy permits employees to disclose.
- **Residual risk:** [Some policies require pre-approval for LinkedIn job-related content or external speaking. Verify.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 8. Social Media Policy
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** Specifically relevant to LinkedIn updates auto-drafted from the portfolio. Confirm the policy permits employees to describe their role, scope, and quantified achievements at the abstraction level the sanitiser produces.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 9. Australian Privacy Act 1988 (and APPs)
- **Statute reference:** Privacy Act 1988 (Cth); Australian Privacy Principles
- **Relevant text:** APPs governing collection, use, and disclosure of personal information about identifiable individuals.
- **Alignment:** Raw Log may contain personal information about colleagues, customers, stakeholders (names, opinions, reported feedback). Even though Raw Log is private, the Act may impose obligations on handling personal information about others.
- **Residual risk:** [MODERATE — verify Dylan's personal use of work-context personal information about others is within the "personal use" exemption or that he is acting under AgriProve's APP-compliant systems. Likely safe given AgriProve's own systems are the collection point, but worth confirming.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 10. Customer contract obligations (LawrieCo and others)
- **Citation:** [Enumerate non-public partnerships that touch Dylan's work]
- **Relevant text:** [VERBATIM key clauses]
- **Alignment:** Customer and partner contracts may impose confidentiality obligations stricter than employment-level. Soil carbon methodology specifics, partnership terms, joint IP arrangements need explicit treatment.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 11. Schedule 2 / Clean Energy Regulator obligations
- **Citation:** [Specific regulatory instruments]
- **Relevant text:** [VERBATIM]
- **Alignment:** As a soil carbon platform, AgriProve operates under Schedule 2 and ERF regimes. Audit-related work may have regulator-imposed confidentiality obligations beyond company-level confidentiality.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 12. Trade secret protection
- **Common law / Corporations Act references**
- **Alignment:** Distinct from contractual confidentiality. Information that derives independent economic value from not being known and is subject to reasonable efforts to maintain secrecy is protected as trade secret. Specific algorithmic approaches, customer acquisition strategies, methodological innovations may qualify. Sanitisation rules err on the side of stripping anything plausibly trade-secret.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 13. Code of Conduct / Professional Conduct
- **Policy citation:** [DOCUMENT, SECTION]
- **Relevant text:** [VERBATIM]
- **Alignment:** Governs how the employee represents themselves and the company externally. Boundaries around competitive intelligence, comparative claims, public criticism.
- **Residual risk:** [TO COMPLETE]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

### 14. Insider information / market-sensitive information
- **Citation:** [If applicable — Corporations Act; AgriProve internal market-sensitive-info policy]
- **Alignment:** If AgriProve is publicly listed or has investor information-disclosure rules, financial / forward-looking information may be market-sensitive. The portfolio's discussion of growth, scale, and trajectory may inadvertently touch this.
- **Residual risk:** [Confirm AgriProve's listing status and any analogous obligations for private companies with sophisticated investors.]
- **Decision:** [ ] Proceed [ ] Modify [ ] Escalate

---

## Operational safeguards

| Safeguard | Implementation |
|---|---|
| Sanitisation before any external use | Weekly Portfolio Review pass; canary list grep before promotion |
| Manual promotion gate | Dylan reviews every Raw Log → Portfolio promotion |
| External artifacts (CV / LinkedIn / cover letter) drawn ONLY from Portfolio sub-page | Personal Claude project instructions enforce this; never from Raw Log / Comp Annex / Counter-Evidence |
| Confidentiality canary list | Maintained in personal Notion; grepped by Apex Weekly Review |
| Periodic policy re-review | Annual cadence, or on any AgriProve policy change |
| Breach response | If a confidentiality breach is identified post-hoc: redact in Notion, document in Counter-Evidence, audit sanitiser, update canary, escalate to AgriProve People/Legal if material |
| Audit trail | Notion history preserves who promoted what when |

---

## Escalation triggers — when to involve AgriProve People / Legal

- Discovery that current employment IP clause is broader than expected (e.g., assigns career narrative or skills)
- Discovery that AI Usage Policy prohibits this Claude/Apex use of AgriProve data, even with sanitisation
- Customer contract obligation that the architecture cannot satisfy via sanitisation alone
- Trade secret / methodology that appears in Raw Log and cannot be safely sanitised even for personal-private use
- Any external use (interview, public talk) where Dylan is uncertain whether content is permitted
- Material change to AgriProve's role, scope, products, customers — re-review entire framework

If any of these arises: pause the system, escalate, document the resolution here.

---

## Sign-off

| Reviewer | Date | Sign-off | Notes |
|---|---|---|---|
| Dylan Cronje (self) | [DATE] | [ ] Reviewed and aligned | [NOTES] |
| AgriProve People / HR | [DATE — only if Dylan chooses to share] | [ ] N/A — informational only OR [ ] Reviewed and aligned | Sharing this page with HR is a transparency choice, not a contractual requirement. Some employees do; some don't. |
| AgriProve Legal | [DATE — only if Dylan chooses to share] | [ ] N/A OR [ ] Reviewed and aligned | Same — optional. |

**Activation gate:** the Apex Career Capture flows do NOT activate until Dylan's self-review row is signed off. The architecture is complete; the sync is gated.

---

## Change log

| Date | Change | Reason |
|---|---|---|
| 2026-05-11 | Initial draft of compliance framework | Dylan added safety-first compliance review to portfolio system request |

---

## Disclaimer

This document is a self-assessment framework, not legal advice. Dylan is responsible for the actual policy review and for any decision to proceed. If anything in this assessment looks like it would benefit from professional input, escalate to AgriProve Legal or external counsel.
