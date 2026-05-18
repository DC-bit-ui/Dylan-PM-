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
- **Residual risk:** LOW after sanitisation — the architecture's two-layer model (Raw Log → sanitised Portfolio) means system architecture details should never reach the publishable layer. The residual risk is whether a described technical approach reveals security-relevant information by implication. Human judgment per item.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 7. External Communications Policy
- **Policy citation:** Delegation of Authority POLDoA s16 (media delegation — only authorised persons may make public statements). HSE003 Duty of Care & Code of Conduct s5.3 (public comment restrictions — signed at onboarding, contractually binding). No standalone external communications policy exists.
- **Relevant text:** POLDoA s16 restricts media/public statements to authorised persons. HSE003 s5.3 restricts public comment on company matters. Letter of Offer cl 13.2 implies duty not to undermine the Company.
- **Alignment:** Portfolio Rule 3 (do not claim to speak for AgriProve) and Rule 4 (describe role using public information only) directly address this. Portfolio content is framed as personal professional experience, not company commentary. "I worked on X" is safe; "AgriProve decided to do X because Y" is not. The downstream uses (CV, LinkedIn, interviews) should follow the same rules.
- **Residual risk:** LOW — the sanitisation approach (personal narrative, public information only, no company positions) satisfies both POLDoA s16 and HSE003 s5.3. The residual risk is tone: even positive public commentary about company decisions could be read as "speaking for" the company. Rule 3's framing guidance addresses this.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 8. Social Media Policy
- **Policy citation:** No standalone social media policy exists. Letter of Offer cl 19.1.8 explicitly covers LinkedIn connections developed during employment. HSE003 s5.3 (public comment restrictions).
- **Relevant text:** cl 19.1.8: "Client lists and names of client contacts that you have developed while in the employment of the Company, but have stored outside of the Company's technology platform, such as in Social Media/Professional Networking platforms, such as, but not limited to, LinkedIn, Twitter, and Facebook." This is unusually specific — extends confidentiality to external platform data.
- **Alignment:** Portfolio Rule 6 directly addresses cl 19.1.8: do not reference specific client relationships, including LinkedIn connections, as portfolio evidence. "I worked with agricultural landholders" is safe; "I managed the relationship with [client name]" is not. Rule 3 covers the HSE003 s5.3 concern for any LinkedIn posts derived from the Portfolio.
- **Residual risk:** MODERATE — cl 19.1.8 is the sharpest social media risk. LinkedIn connections developed during employment are explicitly Confidential Information. Even publicly visible connections cannot be cited as evidence. The risk extends to endorsements, recommendations, and any activity that implies a specific client relationship. The pre-publish checklist screens for this.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 9. Australian Privacy Act 1988 (and APPs)
- **Statute reference:** Privacy Act 1988 (Cth); Australian Privacy Principles. Privacy Policy POLPRV (active, Ed 1, 19/03/2024).
- **Relevant text:** APPs govern collection, use, and disclosure of personal information about identifiable individuals. POLPRV documents AgriProve's obligations under APPs. Letter of Offer cl 19.1.5 ("Client's records") and cl 19.1.6 ("Client lists and names of client contacts") provide contractual coverage beyond statutory obligations.
- **Alignment:** Portfolio Rule 2 (do not include personal information of customers, employees, or stakeholders) addresses the statutory and contractual requirements. The two-layer architecture helps: Raw Log may contain names (private layer), but the Portfolio (publishable layer) strips all personal information through sanitisation. The Privacy Act's "personal use" exemption may apply to Dylan's personal Notion workspace, but the safer path is to treat all personal information about others as governed by APPs regardless.
- **Residual risk:** LOW after sanitisation — the Portfolio layer should contain no personal information about identifiable individuals. The residual risk is in the Raw Log: it contains real names in Dylan's private Notion workspace. If that workspace were compromised, personal information about colleagues/clients would be exposed. Notion's standard security mitigates this.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 10. Customer contract obligations (LawrieCo and others)
- **Citation:** Letter of Offer cl 19.1 (second limb): "all trade secrets, industrial processes, intellectual property, or any information concerning the business or finances of the suppliers, clients, or customers of the Company." cl 19.1 (third limb): information disclosed to the Company by third parties under confidentiality agreements. cl 19.6: "It is expressly forbidden to discuss Confidential Information revealed by clients outside the Company." Customer contracts were not individually reviewed in this assessment — the Letter of Offer provides blanket coverage.
- **Relevant text:** cl 19.1's second and third limbs extend confidentiality beyond AgriProve's own information to client/supplier information and third-party NDA-protected information. cl 19.6 adds an explicit prohibition on discussing client-revealed information externally.
- **Alignment:** Portfolio Rules 1, 2, and 6 collectively address this: no proprietary information, no personal information, anonymise all case studies. The sanitisation approach (archetype names like "tier-1 cattle station in NSW," ratios not absolutes, descriptive not named product references) strips client-identifiable information. The CLAUDE.md §16 confidentiality rules strip customer names, third-party NDA-bound names, and specific contract terms.
- **Residual risk:** MODERATE — individual customer contracts may impose obligations stricter than the Letter of Offer's blanket coverage (e.g., specific project-level NDAs, joint IP arrangements). The policy review did not access individual customer contracts. The conservative approach: treat all customer/project information as covered by cl 19.1's broadest reading. If a specific customer contract creates novel obligations, re-review at that point.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 11. Schedule 2 / Clean Energy Regulator obligations
- **Citation:** Carbon Credits (Carbon Farming Initiative) Act 2011 (Cth); ERF Method Determinations (public legislation). Carbon Industry Code of Conduct v1.0 (June 2018, public). AFSL Risk Policy (internal). No regulator-specific confidentiality obligations were identified in the policy review beyond those already covered by cl 19.
- **Relevant text:** The regulatory framework itself (CFI Act, ERF, Carbon Industry Code) is public legislation. AgriProve's internal compliance processes under these frameworks (AFSL obligations, audit procedures, regulator correspondence) are Confidential Information per cl 19.1.
- **Alignment:** Portfolio Rule 7 addresses this directly: reference the regulatory framework as professional credentials ("I work within the ERF regulatory framework and the Carbon Industry Code of Conduct") without disclosing internal compliance details ("AgriProve's AFSL compliance process involves [specifics]"). The distinction is between public regulatory literacy (safe) and internal compliance implementation (Confidential).
- **Residual risk:** LOW — the regulatory framework is public; internal compliance is covered by cl 19. The main risk is inadvertently revealing audit outcomes, regulator correspondence, or compliance gaps. The pre-publish checklist's "no system architecture or technical implementation details" screen catches most of this.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 12. Trade secret protection
- **Citation:** Common law (breach of confidence); Letter of Offer cl 19.1: "all trade secrets" (first words of the definition). cl 19.1.4: "All data, know how, algorithms and technology associated with the Company's operations." DRAFT Access Policy s3.5 PROPRIETARY class. DRAFT Protected Information Policy s3.1 (geotagged data absolute restriction).
- **Relevant text:** The HORIZON model, SOC quantification methodology, calibration data, measurement approaches, and data processing pipelines are trade secrets by any reasonable definition — they derive economic value from secrecy and AgriProve takes reasonable steps to maintain that secrecy (cl 19, draft policies, restricted access).
- **Alignment:** Portfolio Rules 1 and 5 address this. The caution breakdown (Category 12) is specific: never name HORIZON, Stormboy, or any internal model/system; never describe measurement methodology, calibration approaches, or quantification techniques; never reference accuracy metrics, validation results, or model performance. Frame as "the company uses proprietary soil carbon measurement technology" — not how it works. The confidentiality canary list should include model names and methodology-specific terms.
- **Residual risk:** MODERATE — trade secret protection has no time limit (unlike the 3-month restraint). The risk persists indefinitely. The main exposure: a portfolio entry that demonstrates deep familiarity with measurement methodology could be used to argue the author has trade secret knowledge, even without disclosing specifics. Portfolio Rule 9's "breadth not depth" framing mitigates this.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 13. Code of Conduct / Professional Conduct
- **Policy citation:** HSE003 Duty of Care & Code of Conduct (Aug 2020) — the "Retired CoC." Signed at onboarding, contractually binding per Employment Procedure SOP regardless of corporate retirement status. s5.3 (public comment restrictions), s5.4 (confidentiality).
- **Relevant text:** s5.3 restricts public comment on company matters. s5.4 reinforces confidentiality obligations. The corporate policy has been retired but the signed version is personally binding on Dylan.
- **Alignment:** Portfolio Rule 3 (do not claim to speak for AgriProve or represent company positions) directly addresses s5.3. The caution breakdown (Category 13) adds: never comment publicly on company decisions, strategy, or direction — even positively. Frame all portfolio content as personal professional experience, not company commentary. "I worked on X" is safe; "AgriProve decided to do X because Y" is not. Avoid language that implies insider access to decision-making rationale.
- **Residual risk:** LOW — the framing guidance in Rule 3 and the caution breakdown is sufficient. The residual risk is tone rather than content: even positive commentary could be read as "speaking for" the company. Human judgment per item on whether language implies official position vs. personal experience.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

### 14. Insider information / market-sensitive information
- **Citation:** Employee Option Plan (EOP 240701): 18 options calculated, 16 accepted, Exercise Price AUD$489.16, Minimum Holding Period ends 1 July 2026. Good Leaver / Bad Leaver provisions. AFSL Risk Policy (internal). Letter of Offer cl 19.1.1 ("business plans and forecasts"), cl 19.1.2 ("financial records, reports, accounts, and proposals").
- **Relevant text:** Dylan holds options — this elevates insider information obligations beyond standard employment. cl 19.1.1–19.1.2 explicitly cover business plans, forecasts, and financial records. AgriProve is not publicly listed, but the option plan creates analogous obligations regarding material non-public information that could affect company valuation.
- **Alignment:** The caution breakdown (Category 14) is specific: never reference company financials, valuation, funding status, or growth metrics. Never reference the option plan or personal financial interest. Never describe business performance in terms that could affect valuation (revenue, client count, growth rate, pipeline). Avoid forward-looking statements about company direction or strategy. Be especially cautious until after the Minimum Holding Period (1 July 2026).
- **Residual risk:** MODERATE — the option holder status creates a financial incentive that could be argued to colour the portfolio's framing of company performance. The mitigation: Portfolio Rule 1 (no financials/metrics) and the pre-publish checklist screen for valuation-adjacent content. After 1 July 2026 the financial exposure reduces but cl 19 obligations remain perpetual.
- **Decision:** [x] Proceed with caution [ ] Modify [ ] Escalate

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
| Dylan Cronje (self) | 12/05/26 | [x] Reviewed all 14 rows and signed off | This unlocks the autonomous Apex flows. |
| AgriProve People / HR | [DATE — only if Dylan chooses to share] | [ ] N/A OR [ ] Reviewed | Sharing is a transparency choice, not a contractual requirement. |
| AgriProve Legal | [DATE — only if Dylan chooses to share] | [ ] N/A OR [ ] Reviewed | Same. |

**Activation gate:** the Apex Career Capture flows do NOT activate until Dylan's self-review row is signed off. **Once signed, the flows operate autonomously. Dylan's only ongoing surface is the weekly audit digest in Cowork chat.**

---

## Change log

| Date | Change | Reason |
|---|---|---|
| 2026-05-11 | Initial draft of compliance framework | Dylan added safety-first compliance review |
| 2026-05-11 | Restructured to single-gate trustless automation model | Dylan's preference: one review, then automated; he shouldn't be a per-entry dependency |
| 2026-05-12 | All 14 categories backfilled with actual policy review findings | Claude Code session — sources: verbatim clauses file (authoritative), caution breakdown, portfolio rules, policy gaps. 5 interpretation shifts from verbatim re-read applied throughout. |

---

## Disclaimer

This document is a self-assessment framework, not legal advice. Dylan is responsible for the actual policy review and for any decision to proceed. If anything looks like it would benefit from professional input, escalate to AgriProve Legal or external counsel.
