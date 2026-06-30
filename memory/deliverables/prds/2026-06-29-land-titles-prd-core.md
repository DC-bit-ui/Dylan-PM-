# Land Titles — PRD Core

| Field | Value |
|---|---|
| **Feature Owner** | Steve (approval) · Will |
| **Delivery Owner** | Dylan Cronje |
| **Programme** | Prospective Projects Restructure (Phase 1 — Prospects), Epic 3 |
| **Epic Hub** | [Prospective Projects Restructure — Epic Hub (613515266)](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/613515266) |
| **Jira Epic** | [AP-2566](https://agriprove.atlassian.net/browse/AP-2566) — Prospective Projects — Land Titles |
| **Status** | Draft — for Steve review |
| **Last Updated** | 2026-06-29 |

> This is the highest-value functional build in the programme. Approving this Core unlocks the Land Titles design + atomic stories. The detailed requirements (sub-jobs, EIH classification, DBYD R1–R8, Native Title NT1–NT5) sit in the linked requirements doc — this Core is the what/why for sign-off.

---

## 1. Problem (+ Evidence)

**Current state.** Getting a converted prospect from "we have a boundary" to "every title is confirmed and every party who must consent is identified" is the slowest, most error-prone step before registration, and the team can't currently trust its own record of which titles and which parties a project actually involves. Title and interest-holder information comes from the landholder relayed verbally through onboarding, not an authoritative digital record. So Jo buys the wrong or unnecessary titles, re-buys them when the picture turns out incomplete, and identifies eligible interest holders (EIHs) by hand from scattered SharePoint folders and SME knowledge. Consent then gets chased late, at crediting.

**Evidence.**

- Titles get **re-purchased multiple times per project** — Cadel flags this as the real blocker. The lapsed landholder-verification step removed even the manual check.
- In one week Jo hit two mismatches: a title sold to a different name, and a non-participating family member's title included. That's the routine output of having no source of truth.
- We register **~0% of projects unconditionally** [Dylan + DJ; exact rate pending HubSpot pull]. It bites at crediting: projects sampled ~14 months ago still can't be credited because consents aren't in (DJ).
- Business-wide data hygiene is known-unreliable (RMIT data-systems review), and running the process today leans on specialist knowledge.

**Impact.** Wasted title spend, mapping and KCTs built on the wrong boundary, EIH gaps that surface as a crediting blocker months later, and a process only a few people can run.

---

## 2. Job Stories

**Primary (must solve)**

| # | When… | I want to… | So I can… |
|---|---|---|---|
| 1 ★ | I pick up a newly-converted prospect | source the exact titles for the boundary quickly, accurately and cheaply | get a KCT into the customer's hands as fast as possible, while the lead is warm (Jo) |
| 2 | titles come back parsed | trust the data, with low-confidence titles flagged for review | rely on the record instead of re-checking by hand (Jo) |
| 3 | I have the titles | confirm the real set and **exclude** the mismatched / non-participating ones with a reason | map only valid land and not re-purchase (Jo) |
| 4 ★ | the title set is confirmed | identify **every** EIH from the title transfer file and curate the list | get the consent requirements right from the source of truth (Jo) |
| 5 | titles + EIHs are settled | lodge DBYD and run the Native Title check in the same place | clear safety + legal-right checks without leaving the flow (Jo) |

★ Jobs 1 and 4 are the core: get the right titles fast so the KCT moves, and identify every party whose consent the project needs.

**Secondary (improve, not launch-blockers)**

| # | When… | I want to… | So I can… |
|---|---|---|---|
| 1 | I'm new to the team | follow the screen step-by-step | run a registration without leaning on documented SOPs or a subject-matter expert |
| 2 | titles are bought elsewhere and DBYD replies over days | see clear waiting / refresh / came-back states | work async across the timezone gap (Jo) |

---

## 3. Success Metrics

What we're aiming for. Baselines come from a HubSpot pull; these are the targets.

| Target | Aim |
|---|---|
| Time to KCT in the customer's hands | **15% faster** turnaround |
| Title re-purchase rate | **under 10%** |
| Consent moving before registration | **>50%** of projects registered in the next **90 days** have EIH-C documents + packs sent to all parties for review **prior to registration** (we control sending the packs, not the parties' response time at crediting) |
| Unconditional registration | **+15%** of projects registered unconditionally |

Quality (dev-owned): EIH classification manual-correction rate kept low (target set with dev). Timeline set with dev at kickoff.

**Pivot criteria:** if, across the first ~10 projects, title re-purchases / mismatches aren't materially down and EIH-C packs aren't going out before registration, iterate the confirm/exclude + consent-initiation gates before scaling.

---

## 4. Scope

**In scope (launch-blockers)**

- **Parcels inventory** — what titles should exist for the boundary (from Frontier; interim bridges until the handoff lands), with boundary-clipped flags.
- **Source titles, three methods, cheapest-first** — SharePoint (held titles, auto-parse + auto-identify) → state-routed purchase (assisted; manual buy on corporate card; D&D GlobalX override) → PDF upload. All converge into one title list.
- **Deterministic parse + review** — the 6-state parser-service (not an LLM); confidence shown; low-confidence to a review queue.
- **Confirm + exclude** — explicit operator confirm gate; **exclude as a reversible, reason-coded action** (not a delete) → the confirmed title set.
- **EIH identification** — classify all interest holders per CFI Act s43–45A; curate (exclude/edit/add/change type); confirm the list; write to HubSpot/DB. **The confirmed titles + identified EIHs feed the CPP** (a structured input — titles, EIH table, encumbrances) and drive Consents; they are not a disconnected step.
- **DBYD** — lodge (pre-populated hand-off to 1100.com.au), capture responses, flag in-boundary utilities for the exclusion-zone step.
- **Native Title** — the 3-way check (none / extinguished + statement / not-extinguished → Native Title EIH).

**Out of scope (explicitly excluded)**

- **Convert** — happens upstream in Frontier.
- **Sub-project split** — Land Titles operates at **property level**; the split into carbon projects happens later, in KCT Mapping. The EIH list gains a sub-project column after that.
- **KCT mapping, consent generation + chasing (Consents tile), registration** — later epics.
- **Full Dye & Durham API** (~$8k / ~3 months) and **DBYD API** — interim portal hand-off; separate future tracks.
- **Easement-location auto-detection** — flag "encumbrance present" only; locating is manual.

**Future considerations:** D&D API; DBYD API + auto-ingest of email responses; `.dwf` auto-convert.

---

## 5. Key Decisions

| Decision | Rationale | By | Date |
|---|---|---|---|
| **Title transfer file is the source of truth**, not landholder self-report | Stops repeated title purchases | Cadel | 2026-06-12 |
| **EIH *identification* lives here; consent *collection* lives in Consents** | Same list, different jobs; identify early, chase later | Dylan | 2026-06-24 |
| **Exclude = reversible, reason-coded flag** (not delete) | Excluding wrong/sold/non-participating titles is the recurring pain | Dylan | 2026-06-25 |
| **Not building the Dye & Durham API** — manual purchase for V1 | API was too expensive (~$8k / ~3 months); manual buy is fine for V1 | Cadel / Dylan | 2026-06-29 |
| **Operates at property level**; no sub-project split here | Split happens at KCT mapping; titles are bought per property | Dylan / Jo | 2026-06-24 |
| **Deterministic parser + operator confirm gate** (not LLM) | Defensible; operator confirms the data | Dylan / Cadel | 2026-06-11 |
| **Native Title = 3-way check; gates crediting, not registration** | Per OPS002 §5.1 + CER; conditional declaration is valid | Dylan / DJ | 2026-06-24 |
| **Cheapest source first** (SharePoint → registry → D&D); buy on corporate card; never store portal passwords | Cost + security | Dylan | 2026-06-23 |
| **No blocked/locked states** | Everything stays accessible; missing items flag, never gate | Dylan / Cadel | 2026-06-24 |

---

## 6. Rabbit Holes & Dependencies

**Rabbit holes (avoid)**

- [ ] **Building the D&D / DBYD APIs now** → interim portal hand-off; APIs are separate future tracks.
- [ ] **LLM title parsing** → deterministic parser + confirm gate; don't chase agentic extraction.
- [ ] **Auto-detecting easement location** → flag presence only; manual locate via the title map.
- [ ] **Over-building DBYD automation** → V1 is lodge + manual response upload.

**Dependencies**

| Dependency | Owner | Status | Blocks launch? |
|---|---|---|---|
| Frontier → Ops-app parcels handoff (boundary + parcels) | Gayathri / Frontier | Clunky — workstack pull / GeoJSON upload interim | Partial |
| HubSpot **EIH custom object** + write access (+ data-model decision) | Cadel | Not decided | Yes for write-back — mock until decided |
| SharePoint Graph credentials (held-title sourcing) | Cadel / Stephen | Partial | Partial |
| parser-service (deterministic 6-state) | Eng | Live | No |
| 1100.com.au (DBYD lodge + responses) | Dylan / Jo / Will | Portal hand-off + manual upload | No |
| State registries / D&D GlobalX | — | Manual portal hand-off (D&D API not being pursued — too expensive) | No |

---

## 7. Resolved questions

Where the open questions landed. One remains open for the team.

| Question | Status |
|---|---|
| HubSpot EIH custom object — shape + write access | **Open** — recommend building the fields after the team signs off |
| Is DBYD a safety gate before mapping / sampling? | Resolved — yes, it's a gate |
| Dye & Durham API now? | Resolved — no; too expensive. Manual purchase for V1 |
| Metric targets | Resolved — see §3 |
| Exclude a title with a reason (reversible) | Resolved — yes, keep it |
| 1100.com.au API vs portal-only | Resolved — portal hand-off for V1; auto-ingest is a future track |

## Links

**Related documents**

- **Detailed requirements (the appendix):** `EIH Automation/docs/2026-06-23-land-titles-requirements.md` — sub-jobs, functional reqs A–G, DBYD R1–R8, Native Title NT1–NT5, data model, state model, handoffs.
- **Implementation pack (built-vs-net-new):** `EIH Automation/docs/2026-06-26-land-titles-implementation-pack.md`.
- **Programme PRD Core:** [613548033](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/613548033).
- **Epic Hub:** [613515266](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/613515266).
- SOPs: OPS002 §4.7 (land titles) + §5.1 (Native Title), OPS003 §4.3 (DBYD). CFI Act 2011 s43–45A; Native Title Act 1993 s23B.

---

## Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-29 | 1.0 | Initial Land Titles PRD Core, drawn from the requirements doc + programme PRD | Dylan / Cowork |
| 2026-06-30 | 1.2 | Approver re-routed Cadel → **Steve** (Cadel departing) | Dylan / Cowork |
| 2026-06-29 | 1.1 | Job 1 reframed to speed/accuracy → KCT-fast (core); cores = jobs 1 & 4; concrete metric targets (KCT −15%, <10% re-purchase, >50% EIH-C packs pre-registration in 90 days, +15% unconditional); D&D API dropped; open questions resolved (HubSpot EIH object remains open) | Dylan / Cowork |
