# Career Sanitiser — Deterministic Transformation Engine

**Purpose:** Transform raw career signals (real names, real numbers, internal terms) into compliant, portfolio-ready STAR entries. This is NOT advisory — it's a deterministic transformation pipeline that Apex career capture tasks call during the weekly auto-promote pass.

**When to use:** Called by Apex · Weekly Auto-Promote. Also callable on-demand when Dylan asks to sanitise a specific career signal.

**Governing decision:** [`memory/decisions/2026-05-11-portfolio-rules.md`](../../decisions/2026-05-11-portfolio-rules.md)

**Deployment:** Copy this file to `.claude/skills/career-sanitiser/SKILL.md` from Claude Code (skills folder is Tier 3 — Cowork can't write there).

---

## The Pipeline

For each Raw Log entry, run these 6 transforms in order. Each transform is deterministic — no judgment calls. If a transform can't resolve cleanly, the entry routes to Flagged (not Portfolio).

### Transform 1: STRIP NAMES → ROLES

Replace every named person with their role or a generic descriptor.

| Raw | Sanitised |
|-----|-----------|
| "Kieren approved the PRD" | "CPO approved the PRD" |
| "Cadel's team built the backend" | "engineering lead's team built the backend" |
| "presented to Kieren and Will" | "presented to product leadership" |
| "coordinated with Hobbs and Ben" | "coordinated with the field team" |
| "worked with Claudia on lead pipeline" | "worked with the growth team on lead pipeline" |
| Any customer/partner name | archetype (see Transform 3) |

**Fail → Flagged:** Name appears but isn't in the roster and can't be resolved to a role → `unknown-person`.

### Transform 2: STRIP NUMBERS → RATIOS

Replace all absolute metrics with relative terms (ratios, percentages, multipliers, order-of-magnitude).

| Raw | Sanitised |
|-----|-----------|
| "portfolio of 47 properties" | "portfolio of dozens of properties" |
| "reduced cycle time from 14 days to 3 days" | "reduced cycle time by ~80%" |
| "$2.3M pipeline" | "seven-figure pipeline" |
| "18 options at $489.16" | _(STRIP ENTIRELY — personal financial)_ |
| "generated 1,200 ACCUs" | "generated significant carbon credit volume" |
| "5,000 hectares" | "large-scale pastoral property" |

**Fail → Flagged:** Number is material to STAR impact and can't be expressed as a ratio → `absolute-number-unresolvable`.

### Transform 3: STRIP IDENTIFIERS → ARCHETYPES

Replace all customer, property, project, and location identifiers with category-level archetypes.

| Raw | Sanitised |
|-----|-----------|
| "LawrieCo" | "major referral partner" |
| Any customer name | "tier-1 cattle station" / "broadacre cropping property" / "pastoral enterprise" |
| Any property name | "large-scale property in eastern Australia" |
| Any Jira key (AP-XXXX) | "a cross-team delivery initiative" / "an engineering epic" |
| "Riverina" / "NSW" / "QLD" | "eastern Australia" (never more specific) |
| Coordinates / lat-long | _(STRIP ENTIRELY — absolute prohibition)_ |

**Fail → Flagged:** Identifier can't be archetypified without losing STAR meaning → `identifier-unresolvable`.

### Transform 4: STRIP INTERNALS → GENERIC DESCRIPTIONS

Replace all internal product names, codenames, and technology specifics with generic descriptions.

| Raw | Sanitised |
|-----|-----------|
| "HORIZON model" | "the company's proprietary soil carbon prediction model" |
| "Frontier" | "an internal property management and spatial mapping tool" |
| "Stormboy" | "a cross-functional lead generation pipeline initiative" |
| "GeoMapper" | "a spatial mapping module" |
| "Temporal workers" | "workflow orchestration system" |
| "Supabase" | "authentication provider" |
| "PostGIS" | "spatial database" |
| "Chakra UI" | "component design system" |
| "GA Espace" | "government carbon registry integration" |
| "ArcGIS" | "GIS platform" |
| "KCT" / "Koolah Carbon Trust" | "a carbon crediting workflow" |
| "Operation KCT" | "a crediting operations initiative" |
| "T1 Offsets" | "a crediting report template" |
| ERF | OK — public legislation |
| ACCU | OK — public term |
| Schedule 2 | OK — public regulatory reference |
| Carbon Industry Code | OK — public document |
| soil carbon | OK — public domain term |

**Fail → Flagged:** Unmapped internal term → `unmapped-internal-term`. Add to canary list.

### Transform 5: REFRAME COMPANY → PERSONAL

Reframe every statement from company narrative to personal professional experience.

| Raw | Sanitised |
|-----|-----------|
| "AgriProve launched a new feature" | "I led the launch of a new feature for a soil carbon measurement platform" |
| "The team decided to use Shape Up" | "I introduced Shape Up methodology to the product team" |
| "AgriProve's strategy shifted to..." | _(STRIP — company strategy is confidential)_ |
| "We built a system that..." | "I defined requirements and led delivery of a system that..." |

**Fail → Flagged:** Can't reframe to personal agency without misrepresenting Dylan's role → `attribution-ambiguous`.

### Transform 6: CANARY CHECK (fail-closed)

After transforms 1–5, grep the sanitised entry against the full Confidentiality Canary List (case-insensitive, word-boundary-aware).

- **Zero hits:** PASS → eligible for auto-promotion
- **Any hit:** FAIL → route to Flagged with `canary-hit-on-<term>`

---

## Output Format (Portfolio-ready STAR entry)

```
### [DATE] — [One-line headline]

**Context:** [1-2 sentences: the situation, using only public-information framing]

**What I did:** [2-3 sentences: specific actions Dylan took, using role titles not names]

**Result:** [1-2 sentences: quantified outcome using ratios/percentages, not absolutes]

**Skills demonstrated:** [comma-separated list for Skills Index]

_Source: Raw Log [date] | Promoted: [date] | Confidence: high_
```

---

## Routing Summary

| Condition | Destination |
|-----------|-------------|
| All 6 transforms pass + confidence == high | **Portfolio** (auto-promoted) |
| Any transform fails | **Flagged — Manual Review** |
| Confidence < high | **Flagged — Manual Review** |
| Canary hit | **Flagged — Manual Review** |

---

## Maintenance

- New person → add to Transform 1 mapping + canary list
- New product/codename → add to Transform 4 mapping + canary list
- Canary false-positive recurs → consider removing (Dylan's call)
- Flagged entry manually promoted → check which transform failed, add a mapping

---

*Proposed skill. Deploy to `.claude/skills/career-sanitiser/SKILL.md` via Claude Code session.*
