# Career Portfolio System — Knowledge-Sharing Compliance Assessment

> **For:** paste-ready content for a Notion sub-page under "Dylan Cronje — Professional & Personal Summary". Name the sub-page **"Knowledge-Sharing Compliance"** and paste the markdown below as the body.
>
> **Status:** **[COMPLETE — all 14 categories populated from policy review. Awaiting Dylan's sign-off to activate Apex career-signal flows.]**
>
> **Why this exists:** This is the **single up-front gate** for the career-portfolio system. Once Dylan signs off here, the Apex flows run autonomously without further per-entry approval. The gate is meaningful precisely because it's the only one.
>
> **How it was populated:** Cowork policy-review task read 30 documents from SharePoint (SHARED AP > Admin > Policies) + Dylan's employment documents. Results backfilled into 14 categories below by Claude Code session 2026-05-12 using the verbatim clauses file as authoritative source. Dylan reviews, edits, and signs.

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
- **Policy citation:** Letter of Offer (220615) cl 20.1–20.5; IP definition following cl 20.5
- **Relevant text:** cl 20.1: "the Company owns absolutely free from encumbrances all Intellectual Property made, discovered or created by you (whether alone or in conjunction with others, and whether created outside your normal place of work or during or outside standard working hours)" if created: in the course of/as a consequence of duties (20.1.1), using company/client resources (20.1.2), directly/indirectly as a result of access to Confidential Information (20.1.3), or in respect of/associated with any of the Company's services (20.1.4). cl 20.5 prohibits publishing any assigned IP.
- **Alignment:** The scope is total — covers IP created outside hours and workplace. Career narrative describing *what you did* and *what outcomes resulted* using publicly available information is defensible as personal professional knowledge, not assigned IP. Work product (PRDs, specs, designs, code, data models, research) is unambiguously assigned. The boundary: "general PM skill" vs "IP created as a consequence of duties" requires judgment per item. Portfolio Rule 5 (do not publish work product) and Rule 4 (describe role using public information only) address this.
- **Residual risk:** MODERATE — the "as a consequence of performing your duties" limb (cl 20.1.1) is broad. Frameworks or mental models *developed at* AgriProve in the course of duties are arguably assigned, even if they feel like personal skill. Pre-existing knowledge brought to the role is defensible. The "could they claim it?" test (caution breakdown Category 1) is the operational gate.
- **Decision:** [x] Proceed with caution [ ] Modify architecture [ ] Escalate to Legal

### 2. Confidentiality agreement / NDA
- **Policy citation:** Letter of Offer (220615) cl 19.1–19.10. No separate Confidentiality Deed exists for Dylan — cl 19 serves this function. SharePoint Confidentiality Deeds folder contains only external/third-party deeds.
- **Relevant text:** cl 19.1 defines Confidential Information as "all trade secrets, industrial processes, intellectual property, or any information concerning the business, affairs, or finances of the Company" plus 8 specific categories: business plans/forecasts (19.1.1), financial records (19.1.2), materials/manuals (19.1.3), data/know-how/algorithms/technology (19.1.4), client records (19.1.5), client lists and contacts (19.1.6), project/candidate/client databases (19.1.7), client contacts stored on external platforms including LinkedIn (19.1.8). Obligation is perpetual (cl 19.8). Breach = serious misconduct (cl 19.9).
- **Alignment:** The sanitisation rules (Portfolio Rules 1, 2, 6) are designed to strip exactly these categories. The cl 19.1.8 LinkedIn provision is unusually specific — even publicly visible LinkedIn connections cannot be cited as evidence of client relationships. Portfolio Rule 6 addresses this directly. The pre-publish checklist (caution breakdown summary) screens for all 8 specific categories.
- **Residual risk:** MODERATE — cl 19.1's catch-all ("any information concerning the business, affairs, or finances") is very broad. Describing outcomes in percentage or ratio terms (e.g., "reduced cycle time by X%") might reveal business performance data. Human judgment required per item on whether a described outcome reveals Confidential Information by implication.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 2A. Post-employment restraint
- **Policy citation:** Letter of Offer (220615) cl 21.1–21.5
- **Relevant text:** 3-month Restraint Period (cl 21.3) within Australia (cl 21.1). "Competitive Business" is used but NOT DEFINED in the document — its scope is subject to contextual interpretation. cl 21.1.1 non-compete has a critical exception: permitted if "the capacity in which you are so employed or provide services does not involve you performing work of a similar nature." cl 21.1.2 non-solicitation scoped to Key Clients with prior dealings only (not all clients/customers/suppliers). cl 21.1.6: employment that would "require" use of Confidential Information — this is a "require" threshold, NOT "inevitable disclosure" (that term does not appear in the document). No geographic cascading fallback exists.
- **Alignment:** The portfolio itself doesn't violate cl 21 — but its existence and content could be used as evidence in a dispute. Portfolio Rule 9 addresses this: frame expertise as "product management in regulated climate-tech" not domain-specific depth. The cl 21.1.1 exception is the strategic asset — demonstrate breadth of PM capability, not depth in competitive domain knowledge.
- **Residual risk:** LOW during employment; MODERATE in the 3-month post-termination window. Legal advice recommended on whether cl 21.1.6 extends beyond the Restraint Period (it cross-references perpetual cl 19, but its chapeau limits to "the Restraint Period").
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 3. Acceptable Use Policy (AUP) — IT systems
- **Policy citation:** DRAFT AUP (240308, unapproved, 6 pages, Stephen Warnken). Key sections: s1.1–1.4, s4.2.5, s4.2.8–4.2.10, s7.
- **Relevant text:** s1.1: "Do not use AgriProve resources for personal use." s4.2.8: storing work-related data on personal devices prohibited unless explicitly approved. s4.2.9: uploading work data to cloud/third-party apps prohibited unless explicitly approved. s4.2.10: emailing work data to non-company addresses prohibited unless explicitly approved. DRAFT status — unapproved, but Letter of Offer cl 13.1 (exclusive service) provides binding coverage for the same principles.
- **Alignment:** Portfolio Rule 8 (personal devices, personal infrastructure, outside working hours) directly addresses this. The architecture commitment that career data lives in Dylan's PERSONAL Notion workspace, not on AgriProve infrastructure, reduces the AUP surface. The read-from-AgriProve-write-to-personal flow is the residual question — the DRAFT AUP's personal-use prohibition would apply if approved, but cl 13.1's "whole of your working time" is the binding constraint and is satisfied by conducting portfolio work outside hours.
- **Residual risk:** MODERATE — the DRAFT AUP is unapproved so not formally enforceable, but reflects organisational intent. The stronger risk is cl 13.1 (binding): portfolio work during working hours = breach regardless of AUP status. Self-imposed Rule 8 is the mitigation.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 4. Data Classification Policy
- **Policy citation:** DRAFT Access Policy for Sensitive Information (240321, unapproved, 6 pages, Stephen Warnken). DRAFT Protected Information Policy (230817, unapproved, 2 pages, incomplete — s4–5 empty).
- **Relevant text:** Access Policy defines three Confidential Restricted Classes: PERSONNEL (employee files), FINANCIAL (transactions, models, forecasts, projections), PROPRIETARY (business strategy, intellectual property). Protected Information Policy s1.1: geotagged datasets "may not be distributed outside of the organisation under any circumstance" — absolute restriction. Also defines "under the control of AgriProve" — personal devices are explicitly NOT under AgriProve's control.
- **Alignment:** The three restricted classes map directly to Portfolio Rules: PERSONNEL → Rule 2, FINANCIAL → Rule 1, PROPRIETARY → Rule 1 + Rule 5. The absolute geotagged data restriction reinforces Rule 1 (no geotagged data) and Rule 6 (ensure anonymisation cannot be reverse-engineered to a location). The "under the control of AgriProve" definition supports the clean separation in Rule 8 — but also means Confidential Information on personal devices must be deleted on termination (Access Policy s3.5 extended).
- **Residual risk:** MODERATE — both policies are unapproved, but reflect organisational intent. The geotagged data restriction is the sharpest risk — even anonymised location data ("a 5,000-hectare property in the Riverina") might be identifiable given AgriProve's client base. Aggregate to industry-level per caution breakdown Category 4.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 5. AI / GenAI Usage Policy
- **Policy citation:** DRAFT AUP s6 — heading mentions "AI or online text compression/summarisation tools" but body is a single sentence: "Non-disclosure Agreement's do not circumvent AgriProve's responsibilities under Privacy laws." **AgriProve has NO AI/GenAI usage policy.** This is the single most critical organisational policy gap identified.
- **Relevant text:** The entire Section 6 body is one sentence about NDAs and privacy. No rules exist governing: what data can be input into AI tools, which AI tools are approved/prohibited, data classification requirements for AI input, output handling, model training opt-out, prompt injection risks.
- **Alignment:** The career-portfolio architecture uses the same Cowork + MCP connector infrastructure already deployed for Apex PM workflows. The incremental risk is the new flow (career signal capture → personal Notion). Self-imposed standing decision (`memory/decisions/2026-05-11-no-proprietary-data-in-ai-for-portfolio.md`) fills the organisational gap: no AgriProve proprietary data into any AI tool for portfolio creation. AI tools may be used for general writing assistance where input does not contain or describe Confidential Information.
- **Residual risk:** HIGH (organisational) — every employee can currently input company data into any AI tool without violating a specific policy. For Dylan specifically: MODERATE after self-imposed rule, because cl 19 (binding) provides the confidentiality backstop regardless of AI policy absence.
- **Decision:** [x] Modify — self-imposed conservative limits pending organisational policy [ ] Escalate

### 6. Information Security Policy
- **Policy citation:** No formal InfoSec policy exists. DRAFT AUP s5 asserts monitoring and access rights over company systems. AFSL Risk Policy s7.2 requires operational risk management. Letter of Offer cl 19.1.4 covers "all data, know how, algorithms and technology associated with the Company's operations."
- **Relevant text:** DRAFT AUP s5 (monitoring rights — unapproved). cl 19.1.4 is the binding constraint on technology/algorithm/architecture information.
- **Alignment:** Portfolio Rules 1 and 5 address this: never describe internal system architecture, infrastructure, deployment, security configurations, API endpoints, or technical implementation details. Frame technical decisions abstractly ("evaluated build vs. buy for spatial data processing") not specifically ("we use [tool] deployed on [infrastructure]"). Internal tools/platforms/vendors not publicly known should not be named. The personal Notion sync transmits only post-sanitisation content — the sanitisation rules strip anything classified as PROPRIETARY under the draft Access Policy.
- **Residual risk:** LOW after sanitisation — the architecture's two-layer model (Raw Log → sanitised Portfolio) means system architecture details should never reach 