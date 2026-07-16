# Per-Category Caution Breakdown — Operational Rules
**Date:** 2026-05-11
**Source:** Compliance assessment across 14 categories (30 documents)
**Purpose:** Translate each "Proceed with caution" verdict into concrete, actionable rules for portfolio creation

---

## How to read this file

Each category below received a "Proceed with caution" verdict. For each, the breakdown specifies:

- **What the risk is** — the specific obligation or gap
- **Programmatic check** — can a tool/process verify compliance before publishing? (Y/N)
- **Human judgment required** — what only Dylan can decide
- **Operational rules** — the specific do/don't rules to follow

---

## Category 1: IP Assignment — PROCEED WITH CAUTION

**Risk:** Letter of Offer cl 20.1 assigns all IP to AgriProve — including IP created outside working hours and outside the workplace — if it was created "in the course of, or as a consequence of, performing your duties" or "directly or indirectly as a result of your access to the Confidential Information" or "in respect of, or associated with, any of the Company's services." Cl 20.5 prohibits publishing any of it.

**Programmatic check:** Partial. A review checklist can flag whether content describes methodologies, data models, or system architecture. But the boundary between "general PM skill" and "IP created as a consequence of duties" requires judgment.

**Human judgment required:** For each portfolio piece: "Could AgriProve argue this was created as a consequence of performing my duties, or as a result of access to Confidential Information?" If yes — don't include it.

**Operational rules:**
1. Never include work product created during employment (PRDs, specs, designs, code, data models, research outputs)
2. Describe *what you did* and *what outcomes resulted*, not *how the system works*
3. Use publicly available information about soil carbon, ERF, and ACCUs — not internal implementations
4. Original frameworks, mental models, and PM methodologies you brought to the role (pre-existing knowledge) are defensible; those you developed *at* AgriProve in the course of duties are not
5. When in doubt, apply the "could they claim it?" test — if yes, exclude

---

## Category 2: Confidentiality / NDA — PROCEED WITH CAUTION

**Risk:** Letter of Offer cl 19 is perpetual, broadly defined, and breach = serious misconduct (cl 19.9). The definition covers "all trade secrets, industrial processes, intellectual property, or any information concerning the business, affairs, or finances of the Company" plus 8 specific categories including algorithms, technology, client lists, and LinkedIn connections.

**Programmatic check:** Yes — a pre-publish checklist can screen for: company financials, client names, project names, property names, yield data, ACCU volumes, methodology specifics, algorithm details, technology architecture, team structure details.

**Human judgment required:** Whether a described outcome or approach reveals Confidential Information by implication (e.g., "we achieved X% improvement" might reveal business performance data).

**Operational rules:**
1. Never mention specific clients, properties, or projects by name
2. Never reference financial figures, ACCU volumes, yield rates, or commercial terms
3. Never describe internal algorithms, model parameters, or technology specifics
4. Never reference specific team structures, reporting lines, or internal processes in identifying detail
5. Anonymise all case studies — change names, locations, scale
6. "Industry-standard" framing is safe; "we built/discovered/invented" framing triggers cl 20

---

## Category 2A: Post-Employment Restraint — PROCEED WITH CAUTION

**Risk:** Letter of Offer cl 21 restricts post-employment activity for 3 months within Australia. Key limiter: cl 21.1.1 permits employment at a competitor *if the role does not involve similar work*. Cl 21.1.6 restricts employment that would *require* use of Confidential Information (note: "require," not "inevitably lead to" — see interpretation shift in verbatim clauses file).

**Programmatic check:** No — this is entirely about Dylan's future employment decisions, not portfolio content.

**Human judgment required:** All of it. The portfolio itself doesn't violate cl 21, but its *existence and content* could be used as evidence in a dispute. The question is: does the portfolio demonstrate knowledge that a future employer would *require* you to use?

**Operational rules:**
1. During the 3-month restraint period post-termination: do not publish portfolio content that demonstrates deep soil carbon methodology knowledge if seeking roles at competitors
2. Frame expertise as "product management in regulated climate-tech" rather than "soil carbon measurement and quantification"
3. Avoid creating content that could be characterised as a "playbook" for replicating AgriProve's approach
4. The cl 21.1.1 exception is your friend — demonstrate breadth (PM, strategy, stakeholder management) not depth in the specific competitive domain
5. "Competitive Business" is undefined in the contract — don't assume it's narrow, but also don't assume it's impossibly broad

---

## Category 3: Acceptable Use (AUP) — PROCEED WITH CAUTION

**Risk:** DRAFT AUP (unapproved but guiding) prohibits: storing work data on personal devices (s4.2.8), uploading work data to cloud/third-party apps without approval (s4.2.9), emailing work data to non-company addresses without approval (s4.2.10). The DRAFT also asserts monitoring rights (s5).

**Programmatic check:** Yes — ensure portfolio work is done on personal devices using personal accounts with no AgriProve data copied to personal infrastructure.

**Human judgment required:** Whether any content in the portfolio was derived from information accessed on company devices/systems.

**Operational rules:**
1. All portfolio work on personal devices, personal accounts, personal infrastructure
2. Never copy, screenshot, or transfer any AgriProve content to personal devices for portfolio use
3. Write all portfolio content from memory/public sources — do not reference internal documents while writing
4. Do not use AgriProve email, Teams, SharePoint, or any company system for portfolio-related communication
5. The DRAFT status means this isn't formally enforceable, but Letter of Offer cl 13.1 (exclusive service) and cl 19 (confidentiality) provide the same coverage via binding terms

---

## Category 4: Data Classification — PROCEED WITH CAUTION

**Risk:** DRAFT Access Policy defines three restricted classes: PERSONNEL, FINANCIAL, PROPRIETARY. DRAFT Protected Information Policy restricts geotagged datasets absolutely ("may not be distributed outside of the organisation under any circumstance"). Neither is approved, but both reflect organisational intent.

**Programmatic check:** Yes — screen for: geographic coordinates, property locations, lab results with location data, imagery with geotags, financial data, personnel information.

**Human judgment required:** Whether anonymised data could be reverse-engineered to identify a location or client.

**Operational rules:**
1. Never include any geotagged data, coordinates, or location-identifiable information
2. Never include any data that could identify a specific property, even if anonymised (e.g., "a 5,000-hectare property in the Riverina" might be identifiable given AgriProve's client base)
3. Aggregate to industry-level: "properties in eastern Australia" not "properties in [region]"
4. Never reference specific lab results, soil sample data, or measurement outputs
5. Never reference PROPRIETARY-class information (strategy, IP) even in anonymised form

---

## Category 6: Information Security — PROCEED WITH CAUTION

**Risk:** DRAFT AUP s5 asserts monitoring and access rights over company systems. AFSL Risk Policy s7.2 requires operational risk management. No formal InfoSec policy exists, but cl 19.1.4 (algorithms, technology, know-how) covers the substance.

**Programmatic check:** Yes — ensure no system architecture, infrastructure details, security configurations, API endpoints, or technical implementation details are included.

**Human judgment required:** Whether a described technical approach reveals security-relevant information.

**Operational rules:**
1. Never describe internal system architecture, infrastructure, deployment, or security configurations
2. Never mention specific tools, platforms, or vendors used internally (unless publicly known — e.g., AgriProve's website mentions certain technologies)
3. Frame technical decisions abstractly: "we evaluated build vs. buy for spatial data processing" not "we use [specific tool] deployed on [specific infrastructure]"
4. Never describe data flows, API integrations, or system boundaries in operational detail

---

## Category 8: Social Media — PROCEED WITH CAUTION

**Risk:** Letter of Offer cl 19.1.8 explicitly covers LinkedIn connections developed during employment. HSE003 s5.3 restricts public comment. No standalone social media policy exists.

**Programmatic check:** Partial — can check whether portfolio references specific client relationships from LinkedIn.

**Human judgment required:** Whether LinkedIn activity (endorsements, connections, posts) constitutes "use" of Confidential Information per cl 19.1.8.

**Operational rules:**
1. Do not reference specific client relationships, even if visible on LinkedIn
2. Do not use LinkedIn connections data as portfolio evidence (e.g., "managed relationships with X clients")
3. Portfolio content shared on LinkedIn should follow all other rules in this file
4. Do not claim to speak for AgriProve in social media posts
5. "I worked with agricultural landholders" is fine; "I managed the relationship with [client name]" is not

---

## Category 12: Trade Secrets — PROCEED WITH CAUTION

**Risk:** Letter of Offer cl 19.1.4 explicitly protects "all data, know how, algorithms and technology." The HORIZON model, SOC quantification methodology, calibration data, and measurement approaches are trade secrets by any reasonable definition. DRAFT Access Policy classifies these as PROPRIETARY (restricted class).

**Programmatic check:** Yes — screen for: model names (HORIZON), algorithm descriptions, calibration approaches, measurement methodology specifics, data processing pipelines, accuracy metrics.

**Human judgment required:** Whether a described outcome implies knowledge of trade secrets (e.g., "achieved X% measurement accuracy" reveals performance data about the proprietary methodology).

**Operational rules:**
1. Never name or describe HORIZON, Stormboy, or any internal model/system by name in the portfolio
2. Never describe measurement methodology, calibration approaches, or quantification techniques
3. Never reference accuracy metrics, validation results, or model performance
4. Frame as: "the company uses proprietary soil carbon measurement technology" — not how it works
5. "I managed the product roadmap for a measurement platform" is safe; "I designed the workflow for SOC quantification using [approach]" is not

---

## Category 13: Code of Conduct — PROCEED WITH CAUTION

**Risk:** HSE003 (signed at onboarding, contractually binding per Employment Procedure SOP) includes s5.3 (public comment restrictions) and s5.4 (confidentiality). The corporate policy has been retired but the signed version is binding on Dylan personally.

**Programmatic check:** No — this is about tone and framing, not specific data points.

**Human judgment required:** Whether portfolio content could be read as "public comment" on AgriProve's behalf, or as criticism/endorsement of company decisions.

**Operational rules:**
1. Never claim to speak for AgriProve or represent company positions
2. Never comment publicly on company decisions, strategy, or direction — even positively
3. Frame all portfolio content as personal professional experience, not company commentary
4. "I worked on X" is fine; "AgriProve decided to do X because Y" is not
5. Avoid language that implies insider access to decision-making rationale

---

## Category 14: Insider Information — PROCEED WITH CAUTION

**Risk:** Dylan holds options via EOP (240701) — 18 options, Exercise Price AUD$489.16, Minimum Holding Period ends 1 July 2026. This creates insider information obligations beyond standard employment. Combined with cl 19 (confidentiality) and AFSL Risk Policy requirements.

**Programmatic check:** Partial — can screen for financial data, valuation references, funding status.

**Human judgment required:** Whether portfolio content could be interpreted as disclosing material non-public information about AgriProve's business performance or prospects.

**Operational rules:**
1. Never reference company financials, valuation, funding status, or growth metrics
2. Never reference the option plan or personal financial interest in portfolio content
3. Never describe business performance in terms that could affect valuation (revenue, client count, growth rate, pipeline)
4. Avoid forward-looking statements about company direction or strategy
5. Be especially cautious until after the Minimum Holding Period (1 July 2026) — after which the financial exposure reduces but cl 19 obligations remain perpetual

---

## Summary: The Pre-Publish Checklist

Before publishing any portfolio content, verify:

- [ ] No client/property/project names (Category 2, 8, 12)
- [ ] No financial figures, ACCU volumes, yield rates (Category 2, 14)
- [ ] No algorithm/model/methodology descriptions (Category 12, 6)
- [ ] No system architecture or technical implementation details (Category 6)
- [ ] No geotagged data or location-identifiable information (Category 4)
- [ ] No work product created during employment (Category 1)
- [ ] No company positions or public commentary (Category 13)
- [ ] No forward-looking business statements (Category 14)
- [ ] No LinkedIn connection references as evidence (Category 8)
- [ ] All work done on personal devices/accounts (Category 3)
- [ ] Content framed as personal experience, not company narrative (Category 13)
- [ ] Anonymisation cannot be reverse-engineered (Category 4)

---

*Operational breakdown from compliance assessment. Cross-reference with verbatim clauses file and portfolio rules file for full context.*
