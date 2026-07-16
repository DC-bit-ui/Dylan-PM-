# NOW — Current truth

Last-verified: 2026-07-16 · Review-by: 2026-08-15 · Verified-by: claude-code (Fable 5 rebuild; epic statuses verified live in Jira 2026-07-16; strategy/org from July learnings + briefs)
**Write tier: 1.** This is the SINGLE source for current strategy, priorities, owned surfaces, active epics, org, and schedules (`core/MAP.md` §2). Update the relevant section AND its `As-of` date whenever state changes; Apex EOD owns routine updates.

---

## Strategy & priorities — As-of 2026-07-16

The formal strategy doc (`memory/business/strategy.md`, 2026-05-12) declared two priorities: recruit new projects + complete Schedule 2 crediting. **In practice the July workstack has moved on** [moderate — inferred from 4 weeks of briefs/learnings; needs Dylan/leadership confirmation]:

1. **Bank & insurer channel — risk-led pitch** [high, leadership-sponsored]. Pivot from "sell credits" to "solve the bank's physical-climate-risk disclosure problem" (AASB S2 wedge; APRA capital relief positions-for, not-yet-live). Target: Rabobank (~$28.1B ag book). Pitch to Matthew: Tue 2026-07-22 (align Mon 21 Jul 15:30 AEST). Sources: `learnings/2026-07/2026-07-15-bank-pitch-risk-pivot-horizon-profile.md`, `2026-07-14-bank-water-quality-credit-strategy.md`, `2026-07-15-regulatory-wedge-verification-aasb-s2-apra-tnfd.md`.
2. **Recruitment engine** [high]: Farm Boundary Drawing Tool (live; conversion problem — 180 views / 0 conversions as of 07-15, mobile UX suspected) + V2 + Groundwork top-of-funnel. 
3. **Prospective Projects restructure** [high]: 4-stage Frontier model (Land Titles → KCT Mapping → Consents → Registration); Steve's sizing/wave plan awaits Dylan's PM-ordering sign-off + Gayathri estimates.
4. **Verterra collaboration** [high]: water-quality data exchange, GLM reef-credit reports; HoA executed 2026-04-16; UJV in negotiation.

External positioning rule: "natural capital analytics service provider", never "soil carbon developer" (rules.md 2026-07-15). Q3 OKRs: none recorded [ASSUMPTION: still unset].

## Dylan's owned epics — As-of 2026-07-16 (verified live in Jira)

| Epic | Summary | Status | Assignee |
|---|---|---|---|
| AP-2514 | Farm Boundary Drawing Tool v1 | Discovery (v1 launched; iteration feedback logged) | Dylan |
| AP-2608 | Verterra Collaboration & Product Pathway | Discovery | Dylan |
| AP-2609 | Modular Snapshot Generator (native, in-app) | Discovery | Dylan |
| AP-2616 | Farm Map Tool V2 | Discovery | **unassigned — needs owner** |
| AP-2566 | Prospective Projects — Land Titles | Discovery | unassigned (Dylan = PM; PRD 2026-06-29) |
| AP-2567 | Prospective Projects — Consent Documents | Discovery | unassigned (Dylan = PM; PRD v2 2026-06-26) |
| AP-2187 | Crediting Workflow Template — T1 Offsets | Discovery | unassigned |

Closed 2026 epics (verified Done in Jira 2026-07-16): AP-1963 Frontier Phase 2, AP-1964 KCT ph1, AP-1965 LawrieCo, AP-2009 Frontier property mgmt, AP-2116 Schedule 2 validation framework, AP-2301 snapshot automation. Detail files: `memory/initiatives/` (active) and `memory/initiatives/archive/` (closed).

## Org — As-of 2026-07-16 (restructure of 2026-07-06)

- **Cadel Watson** — DEPARTING (~late July); handover epics AP-2576/2577 in progress. ~70% dev capacity reduction flagged. Do not assign him new work.
- **Steve Le Moenic** — elevated to **Program Manager** (was developer); owns delivery sequencing; took over Cadel's requirements sign-off gate.
- **Gayathri Menakath** — elevated to **Technical Lead** (frontend); carrying the main dev load.
- **Athul George** — Developer under Gayathri; owns AP-2632 queue bug, Farm Draw v2 tickets.
- **Olivier Decitre** — Verterra technical lead/data scientist (added 07-16); Dylan's timezone (SAST).
- **Kieren Whittock** — leadership; **on leave until 2026-07-20** (Will Frecheville covering).
- Unchanged: Matthew Warnken (founder/MD, bank-pitch sponsor), Hobbs (field), Ben Payne (field/Stormboy), Will Frecheville (engineer), Will Donovan (Head of Ops), Claudia Bryant (Growth), Daniel Wortmann (Growth/marketing), DJ + Jo (ops/registration). Full profiles: `memory/people/roster.md`.

## Open threads & watch items — As-of 2026-07-16

- **AP-2632 (P0):** HORIZON snapshot queues not starting — 3 days silent, blocks all snapshot generation incl. Morton Co (160k ha prospect). Escalate to Steve if no ETA. Likely root cause AP-2625 (SAGA queue starvation, unassigned).
- **Employment structure decision due end of July 2026:** SA-company/PE-risk question; Kieren needs Dylan's AUD salary expectation + Apr-2027 return date in writing. No decision recorded yet. `learnings/2026-07/2026-07-06-dylan-employment-structure-timeline.md`.
- **Bank pitch 07-15 delivery unconfirmed** (no Granola record); fresh pitch scheduled Tue 22 Jul.
- **Steve's wave plan** awaits Dylan sign-off; **AP-2616 needs an assignee**.
- **Teams-blind Apex:** scheduled briefings still run the pre-`read_resource` prompt — channel signal missing from production briefs. Fix is in repo, deploy pending (`.claude/skills/cowork-scheduled/apex-morning-briefing/PROVENANCE.md`).

## Naming — As-of 2026-07-16

- "Snapshot" (product) renamed **HORIZON Profile** (2026-07-11, Kieren+Matthew). Jira epics still carry old names — expected lag.
- **Groundwork** = the top-of-funnel tool that produces a HORIZON Profile (Dylan's working name, 2026-07-13; leadership alignment recommended before external use).
- ⚠️ Collision: "HORIZON Profile" is ALSO the working title of the bank risk-profiling artifact (07-15). Same name, two objects — disambiguate by context until resolved.

## Schedules — As-of 2026-07-16

| Run | Time | Status |
|---|---|---|
| Apex Morning Briefing | ~04:45 SAST weekdays (07-16 run fired ~06:45 — timing unstable) | Active |
| Apex EOD Reconciliation | 17:30 SAST weekdays | Active |
| Career tasks (capture daily 18:00; promote/audit Fri; monthly meta) | per `.claude/skills/cowork-scheduled/README.md` | Active, firing unverified |
| Weekly sweep / monthly review | — | **Removed from schedule 2026-07-16** — duties folded into daily runs + on-demand `/sweep` (see `core/PROTOCOLS.md`) |

Canonical task inventory: `.claude/skills/cowork-scheduled/README.md`.
