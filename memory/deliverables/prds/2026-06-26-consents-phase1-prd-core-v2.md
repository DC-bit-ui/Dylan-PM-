# 26Q2 — Consents (Phase 1) Prospects — PRD Core (v2.0 draft)

> Working draft to replace the body of Confluence page 613548033 (v1.0, 2026-06-12). Tier-1 strategic PRD — execution detail → Design Appendix + the per-epic Jira epics. Diagrams referenced at the foot. **KCT = Key Commercial Terms** (the landholder sales/licence contract; legacy projects = SLA) — not "crediting tool".

| Field | Value |
|---|---|
| **Feature Owner** | Will / Cadel |
| **Delivery Owner** | Dylan Cronje |
| **Epic Hub** | Consents — Epic Hub (613515266) |
| **Jira Epic** | Consents (Phase 1) — split into 5 sub-epics (see §3) |
| **Status** | Draft v2.0 — for CPO + Eng review |
| **Last Updated** | 2026-06-26 |
| **Appetite** | Phased, drip-by-drip — one epic per release behind a flag, walked through with ops |
| **Phase** | 1 of 2 (Prospects → registration; Phase 2 = Crediting) |

## 1 · Problem (+ Evidence)

**Background (for the reader, assuming no prior context).** AgriProve registers soil-carbon projects on Australian farms so landholders can earn carbon credits (ACCUs) from the regulator, the Clean Energy Regulator (CER). Before a project can be registered, an operations team member must: confirm which land titles make up the property, purchase those titles, identify every party with a legal interest in the land — the **eligible interest holders (EIHs)**: the landholder plus entities such as mortgagee banks and utility/easement holders — secure their consent, map the project area, and lodge the registration. *Frontier* is AgriProve's sales/onboarding tool; the *Ops app* is where the operations team does the registration work. Ben onboards the landholder; Jo and DJ run the operations/registration work.

**Current state — two compounding problems.**

1. **No single digital source of truth, so the team can't rely on its own records.** There is no connected system that authoritatively tells an operator which titles and which interested parties a project actually involves. Jo works from landholder information relayed verbally through Ben's onboarding call — not from an authoritative digital record — so she repeatedly purchases the **wrong or unnecessary land titles**, and re-purchases them when the landholder's account turns out to be incomplete. The registration record is otherwise scattered across SharePoint with no consistent, defensible structure across systems.

2. **Consent is never worked up-front.** The team has optimised for speed-to-registration, so projects are registered *conditionally* (the regulator's term for "registered, but not all consents are in yet") and consent — especially the **EIH-C**, the form each non-landholder entity must sign — is chased much later, at the crediting stage. That makes consent the blocker that stops credits being issued.

**Evidence.**
- **Operators can't rely on a digital source of truth for who and what a project involves.** Because title and party information comes from landholder comms siphoned through Ben rather than an authoritative record, the correct title set is only found by trial and (paid) error — titles get **re-purchased multiple times per project** (Cadel: the real blocker), and the lapsed landholder-verification step removed even the manual check.
- **Business-wide data hygiene is known to be unreliable** (see the RMIT data-systems review) — which makes a single, connected, defensible source of truth a cross-cutting need, not just a registration one.
- **We register ~0% of projects unconditionally** [Dylan + DJ, 2026-06; exact rate pending a HubSpot pull] — "no focus on the consents, hence the conditional declaration" (DJ). It bites at crediting: projects sampled ~14 months ago still cannot be credited because consent (the EIH-C) isn't signed (DJ).
- *Supporting illustration:* in one week Jo hit two title mismatches — a title sold to a different name, and a non-participating family member's title included — the kind of error the absent source of truth produces routinely.
- Consent and before-you-dig (DBYD) files live fragmented in SharePoint, and running the whole process today depends on specialist (SME) knowledge.

**Impact.** Wasted title spend, wrong contract documents, mapping on the wrong boundary, and — at crediting — consent as the gating blocker plus a large manual workload, keeping projects conditional and delaying credit issuance by many months. Underneath all of it: the team cannot currently trust its own systems to tell it the truth about a project.

**The shift this feature makes.** Make the **Ops app the single interaction system** for registration work, with **SharePoint and HubSpot as the underlying repository** (the system of storage) — so operators act on one connected, defensible source of truth (anchored by the new Frontier → Ops-app connection) instead of stitching together disparate sources. And **move consent initiation to the start of the process** — build and *send* the EIH-C packs by the time the project registers — so consent stops being a crediting blocker. This connected interaction-layer-over-repository model also sets the precedent for the upcoming **Active Projects** redesign.

## 2 · Job Stories

**Primary (must solve)**

| # | When… | I want to… | So I can… |
|---|---|---|---|
| 1 | I've confirmed maps + titles with the landholder on the LMS call | convert the prospect to a prospective project and have it land with Jo automatically | hand off cleanly without a manual brief (Ben) |
| 2 | I pick up a newly-converted prospective project | have the correct titles + land area confirmed before I purchase or map | not buy the wrong titles or map the wrong land (Jo) |
| 3 ★ | a prospect is willing to proceed | facilitate title purchase to identify **every** eligible interest holder whose consent the project needs | get the consents requirements right from the source of truth (Jo) — the core job |
| 4 | titles + EIHs are confirmed | run DBYD **and** a native-title check in the same place | clear safety + legal-right checks without leaving the flow (Jo) |
| 5 | mapping (KCT-light) is done | generate the KCT for the landholder and **build + send the EIH-C packs** for the entities from one identified list | get consents *moving* before registration, not at crediting (Jo) |
| 6 | a carbon project is ready | generate the CER ERF-002 CSV and lodge with the step-by-step script beside the portal | register the project (conditionally is fine) without consent being a blocker (Jo) |

★ Job 3 is the core job — facilitating title purchase to identify every EIH. Job 5 is the strategic shift — consent initiated by registration.

**Secondary (improve, not launch-blockers)**

| # | When… | I want to… | So I can… |
|---|---|---|---|
| 1 | I'm new to the team | follow the workspace step-by-step without leaning on strict SOP/SME knowledge | run a registration with minimal hand-holding (de-skilling principle) |
| 2 | consent is still outstanding | see it tracked in the Ops app, not SharePoint | know what's left in one place (bridges to Phase 2) |

## 3 · Success Metrics

**Headline outcome (north-star, two parts):** (a) **faster time to KCT issued** — get the contract out to the landholder while the lead is warm; **target: reduce current time-to-KCT-issued by ~15%**; and (b) **the ability to declare unconditionally** — secure all consents up-front so projects *can* go unconditional rather than being stuck conditional. **Near-term floor:** consents **requested (EIH-C packs sent) by registration**, so consent is removed as a crediting blocker. (Exact baselines + targets are set with Kieren/Cadel; baselines need a HubSpot pull — flagged.)

**Metrics framework (per Cadel, 2026-06-26): 3 metrics per epic** — Target (business outcome, PM-owned) · Timeline (joint PM+dev) · Quality (technical, dev-owned). Set at epic start, reviewed at close, reported to Kieren at Tuesday prioritisation.

**High-level per-epic suggestions (placeholders — set the actual figures with Kieren/Cadel):**

| Epic | Target (business outcome) | Quality (technical) |
|---|---|---|
| 1. Dashboard + Project Hub *(task, not metric'd)* | (enabling) operator reaches any project's stage + next action in ≤2 clicks | all stages reachable; no dead links / console errors |
| 2. KCT mapping | reduce time-to-draft-ready mapping / KCT-quote readiness by X% (cf. Cadel's map-prep −75%) | manual DB fixes on <25% of projects |
| 3. Land titles | reduce time from convert → confirmed titles + EIHs identified by X% (or ≥X% titles auto-parsed + EIHs auto-classified, no manual entry) | EIH classification manual-correction rate <X% of titles |
| 4. Consents | **≥X% of newly-registered projects have EIH-C packs requested (sent) by registration** | pack correctness — manual rework on <X% of packs |
| 5. Registration | reduce time from KCT-signed → registration-packet-ready by X% (or first-time CER acceptance ≥X%) | CER CSV validates first-time on ≥X% of projects |

Timeline for each epic is set with dev at kickoff. Supporting baselines to pull from HubSpot: current unconditional rate (≈0% expected), time-to-KCT-issued (the −15% target's baseline), consent wait at crediting (~14mo tail per DJ).

**Pivot criteria:** if, across the first 10 projects, consents aren't materially in-flight by registration and title re-purchases/mismatches aren't reduced, iterate the consent-initiation + confirmation gates before scaling.

## 4 · Scope

**In scope (launch-blockers) — delivered as 5 sequenced epics:**
1. **Dashboard + Project Hub shell** — the stepped jobs-to-be-done structure (Land titles → KCT mapping → Consents → Registration), property overview + per-stage status, multi-tag search, breadcrumbs. *(Task — the enabling shell.)*
2. **KCT mapping** — status mirror of the in-app KCT automation ("Project KCT"), per carbon project, sequential; opens the tool. *(Largely delivered.)*
3. **Land titles (incl. DBYD + Native Title)** — source/purchase titles (assisted, state-routed; manual purchase V1), parse, confirm/exclude (reversible) with a titles-only map, identify EIHs from the title transfer file (CFI s43–45A), lodge DBYD, run the Native Title 3-way check (none / extinguished + statement / not-extinguished → Native Title EIH).
4. **Consents** — coverage + chase; KCT via PandaDoc (sandbox-tested); **CPP per carbon project incl. the in-workflow BCR**; **EIH-C build-pack → send** (the strategic shift).
5. **Registration** — per carbon project; ERF-002 CSV with preview; HubSpot sync; **Register-with-CER** (opens onlineservices.cer.gov.au + the application script split-screen; no credential capture); Mark-registered flips Prospective → Project. Registration is **never gated** on consents (conditional declaration is valid).
- **Cross-cutting:** the UX consistency spec (save/undo/reset, one per-project nav pattern, breadcrumbs); an **internal audit/event log**; no "blocked"/"locked" states.

**Out of scope (explicitly excluded):**
- **Phase 2 — Crediting** (reuse these structures to complete consent on registered projects) — next phase.
- **Active-projects restructure** — separate workstream (Dylan + Steve), not a dependency.
- **Rebuilding the KCT mapping tool** — it's in-app automation (Steve/Gayathri); we mirror + open it.
- **Full Dye & Durham API** (~$8k / ~3 months) and **DBYD API** — interim portal hand-off; both are separate future tracks.
- **Easement-location auto-detection** — flag "encumbrance present" only; locating is manual.
- **Deep PandaDoc e-sign automation** beyond generation/send.
- **Audit log as regulator evidence** — internal only; for exclusions, supply the updated title map/shapefile.

**Future considerations:** DBYD API; full D&D API; unified consent worklist across projects (pairs with Phase 2); the active-projects restructure (uses this as the template).

**Open scope call (flagged):** is the **legacy-project SharePoint backfill** in Phase 1 (the sync path for in-flight prospects that already have titles) or deferred to Phase 2 (DJ's historical-project entry)? — *recommend: the sync path is in (it's in the Land-titles design); full backfill of already-registered projects is Phase 2.*

## 5 · Key Decisions

| Decision | Rationale | By | Date |
|---|---|---|---|
| North-star = faster time-to-KCT-**issued** (target ~−15%) + ability to declare unconditionally; near-term floor = consents requested by registration | Removes consent as the crediting blocker; matches the real bottleneck | Dylan | 2026-06-26 |
| Break the feature into 5 sub-epics, each with one metric target | Cadel's metrics framework — small enough to carry a target | Cadel / Dylan | 2026-06-26 |
| Sequence: Dashboard → KCT mapping → Land titles → Consents → Registration | KCT mapping already delivered; Land titles is the value build | Dylan | 2026-06-26 |
| KCT mapping = in-app automation mirror (not GIS, not rebuilt); register off KCT-light mapping, refine post-registration before sampling | Get the KCT out while warm; automated mapping ~90% there | Steve / DJ / Dylan | 2026-06-25 |
| CPP lives in Consents (consumes mapping outputs); BCR generated in-workflow | It's document generation; populated from titles/EIH/mapping | Dylan / Cadel | 2026-06-24 |
| Native Title = 3-way check (none / extinguished+statement / not-extinguished → Native Title EIH) | Per OPS002 §5.1 + CER; feeds EIH list + CPP | Dylan / DJ | 2026-06-24 |
| Audit log = internal only (not regulator evidence) | For exclusions, the title map/shapefile is the source of truth | DJ | 2026-06-25 |
| No "blocked"/"locked" states; registration never gated on consents | Conditional declaration is valid; everything stays accessible | Dylan / Cadel | 2026-06-24 |
| Title transfer file is the source of truth (not landholder self-report) | Stops repeated title purchases | Cadel | 2026-06-12 |
| Prospective → Project flips at Registration | Regulator meaning; matches RBIMC | Dylan | 2026-06-12 |
| Build server-side in the Ops app (not via MCP) | Ops app already has per-user auth | Dylan / Cadel | 2026-06-11 |

## 6 · Rabbit Holes & Dependencies

**Rabbit holes (avoid):**
- [ ] **Rebuilding the KCT mapping tool** → mirror + open the in-app automation; don't reproduce the editor.
- [ ] **Building the D&D / DBYD APIs now** → interim portal hand-off; APIs are separate future tracks.
- [ ] **Auto-detecting easement location** → flag presence only; manual locate via the title map.
- [ ] **Over-engineering the audit log for the regulator** → internal only; supply the title map/shapefile for exclusions.
- [ ] **Pulling the active-projects restructure into this** → prospect→registration workspace only.
- [ ] **Perfecting agentic title parsing** → deterministic parser + operator confirm gate.
- [ ] **Delivering too much at once** → drip-by-drip, one epic per release, walked through with ops (Steve's KCT-automation lesson).

**Dependencies:**

| Dependency | Owner | Blocks launch? |
|---|---|---|
| HubSpot EIH custom object + write access (+ data model decision) | Cadel | Yes (for EIH writeback) — mock until decided |
| PandaDoc API (KCT + EIH-C) | Cadel / Dylan | **Tested in sandbox — works** |
| Server-side SharePoint Graph credentials (doc sourcing) | Cadel / Stephen | Partial |
| Project → Parcel link (carry confirmed parcels) | Gayathri | Yes |
| KCT mapping tool integration (status mirror + deep-link) | Steve / Gayathri | Partial — mirror/mock interim |
| BCR / NDRE compute service (call existing ops-app service) | Eng | Partial — mock chart interim |
| 5 example CPPs to template the generator | DJ | No (improves CPP quality) |

## 7 · Open Questions + Links

| Question | Owner | Resolution |
|---|---|---|
| Exact baselines (unconditional rate, time-to-KCT-issued, consent wait) | Dylan | Pending HubSpot pull (registry erroring this session) |
| Per-epic Target %s | Kieren / Cadel | Set at Tuesday prioritisation |
| Legacy-project backfill in Phase 1 or Phase 2? | Dylan / DJ | Recommend: sync path in; full backfill Phase 2 |
| DJ vs Joe ownership of EIH/consent work | Will / DJ / Joe | — |

**Related:** Consents — Epic Hub (613515266) · UX consistency spec · Claude Code handoff brief (+ Amendment 1) · per-stage requirements (land-titles, kct-mapping, consents, registration) · the chunked Claude Design prompts — all in the EIH Automation repo docs. SOPs: OPS002 §4.7 + §5.1 (Native Title), OPS003 §4.3, OPS004, OPS009. CER: legal-right + EIH-consent guidance.

## Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-12 | 1.0 | Initial PRD Core (Phase 1 Prospects) | Dylan / Cowork |
| 2026-06-26 | 2.0 | Reframed north-star (KCT-signed speed + unconditional capability; consents-requested-by-registration); 5-epic breakdown + metrics framework; CPP-in-Consents + BCR; in-app KCT mapping mirror; Native Title 3-way; audit-log-internal; register-off-KCT-light; UX consistency + simplicity principle; no-blockers | Dylan / Cowork |
