# 2026-05-12 — Career Portfolio: 9 Rules (standing rules)

**Status:** accepted. **Owner:** Dylan. **Authority basis:** Letter of Offer (220615), Privacy Act 1988 (Cth), AgriProve policy landscape (verified verbatim 2026-05-11).

## Context

The career-portfolio system aggregates Dylan's wins, decisions, scope expansions, and skill demonstrations from work-system signal (Granola / Outlook / Teams / Jira / Confluence / Notion) into a sanitised Portfolio in his personal Notion workspace. The system is governed by Letter of Offer (220615) — specifically cl 13, 19, 20, 21 — and applicable Australian employment / privacy / common law.

A full verbatim review of 30 AgriProve policy documents was conducted by Cowork on 2026-05-11:
- [`../../inbox/cowork/2026-05-11-letter-of-offer-verbatim-clauses.md`](../../inbox/cowork/2026-05-11-letter-of-offer-verbatim-clauses.md)
- [`../../inbox/cowork/2026-05-11-policy-review-draft.md`](../../inbox/cowork/2026-05-11-policy-review-draft.md)
- [`../../inbox/cowork/2026-05-11-caution-breakdown.md`](../../inbox/cowork/2026-05-11-caution-breakdown.md)
- [`../../inbox/cowork/2026-05-11-portfolio-rules.md`](../../inbox/cowork/2026-05-11-portfolio-rules.md)
- [`../../inbox/cowork/2026-05-11-policy-gaps.md`](../../inbox/cowork/2026-05-11-policy-gaps.md)

This ADR codifies the 9 standing rules synthesised from that review. The Apex sanitiser, weekly auto-promote, and canary checks all enforce these.

## Decision

### Rule 1: Do not disclose proprietary information
No proprietary methodologies, SOC models, geotagged data, algorithms, know-how, technology specifics, customer contract terms, financials, ACCU volumes, or project yields.
*Authority: Letter of Offer cl 19.1, 19.1.4, 19.3.1, 19.8, 20.1; DRAFT Protected Information Policy s3.1; DRAFT Access Policy.*

### Rule 2: Do not include personal information
No personal information of customers, employees, or stakeholders.
*Authority: Privacy Act 1988 (Cth); Privacy Policy POLPRV; DRAFT Access Policy s3.1; Letter of Offer cl 19.1.5–19.1.6.*

### Rule 3: Do not claim to speak for AgriProve
No public commentary representing AgriProve positions, decisions, or strategy.
*Authority: HSE003 s5.3; DoA s16; Letter of Offer cl 13.2.*

### Rule 4: Describe role and outcomes using public information only
"I managed a product roadmap for a soil carbon measurement platform" — safe. "The roadmap included [specific features / timelines]" — Confidential.
*Authority: Letter of Offer cl 19.1 definition does not extend to general industry knowledge or publicly available company information.*

### Rule 5: Do not publish work product
No PRDs, code, design specs, data models, research outputs. These are assigned IP per cl 20.1, total assignment including outside hours and workplace, with publishing explicitly prohibited (cl 20.5).
*Authority: Letter of Offer cl 20.1, 20.5.*

### Rule 6: Anonymise all case studies
Remove identifiable customer, property, or project details. Do not reference specific client relationships, **including LinkedIn connections developed during employment** (cl 19.1.8 is explicit on this).
*Authority: Letter of Offer cl 19.1.5–19.1.8, cl 19.6; Privacy Policy POLPRV; DRAFT Protected Information Policy s3.1.*

### Rule 7: Reference regulatory framework as professional credentials
CFI Act, ERF, Carbon Industry Code, AFSL are public regulatory framework — safe to reference as professional credentials. Internal compliance details (specific audit approaches, AFSL operational decisions) are Confidential per cl 19.1.
*Authority: All public legislation. Internal compliance details = cl 19.1.*

### Rule 8: Conduct portfolio work outside working hours on personal devices
Apex runs on personal Windows machine. Personal Notion. Personal Claude account. Capture fires 18:00 SAST (after working hours). No AgriProve resources used for portfolio purpose beyond MCP read access already approved for existing Apex Morning / EOD flows.
*Authority: Letter of Offer cl 13.1; DRAFT AUP s1.1–1.4, s4.2.8–4.2.10.*

### Rule 9: Post-employment restraint awareness
Frame expertise as breadth (PM, strategy, stakeholder management) not depth in soil carbon methodology. cl 21.1.1 has an **exception** — competitor employment permitted if role does not involve similar work. cl 21.1.6 restricts employment that **requires** use of Confidential Information (narrower than "inevitable disclosure" — a common misreading; see verbatim clauses file).
*Authority: Letter of Offer cl 21.1, 21.1.1 (exception), 21.1.6, 21.3 (3-month restraint).*

## Consequences

- **Apex sanitiser** implements these as deterministic strip / reframe rules ([`../../memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md`](../integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md))
- **Confidentiality Canary List** in personal Notion enumerates specific terms covering Rules 1, 6, 7 (customer names, internal product names, methodology terms, financial figures, partnership names, geographic identifiers)
- **Confidence Threshold** gate prevents borderline entries from auto-promoting
- **Auto-promotion** to Portfolio permitted only when all rules pass
- **Cl 20 IP reframe pass** added: any "I built / designed / invented / created" framing for work product is reframed to "I led / managed / contributed to" before promotion
- **Insider-info heightened mode** until 1 July 2026 (Minimum Holding Period for EOP options)

## Alternatives considered

1. **No portfolio.** Rejected — significant career-development cost; architecture is defensible.
2. **Seek written approval under cl 13.1 from AgriProve People.** Optional. Not required for defensibility (see [`../../inbox/cowork/2026-05-12-cl-13-1-defensibility.md`](../../inbox/cowork/2026-05-12-cl-13-1-defensibility.md)). Dylan may pursue for additional comfort.
3. **Manual per-entry review.** Rejected — Dylan explicitly does not want to be a per-entry dependency. 9 Rules + programmatic gates suffice.

## Re-review triggers

- AgriProve issues a new or updated policy (especially AI / GenAI, AUP, Code of Conduct, IP clauses)
- Dylan's role / scope materially changes
- A canary breach is identified post-promotion (triggers self-healing + canary update + apex re-audit task)
- Material change to AgriProve's products / customers / regulatory posture
- Annually as backstop

## Supersedes

None. Foundational ADR for the career-portfolio system.
