---
name: Stormboy standup — 2026-05-15
description: Weekly Storm Boy team standup. Call-volume execution gap (team below 100/week target), Carbon Link active in-region, marketing audit findings about competitor positioning. Decision: all Meta leads tagged Stormboy.
type: retro
---

# Stormboy Standup — 15 May 2026

**Source:** Granola query, 2026-05-15
**Attendees (inferred):** Will, Hobbs, Ben, Claudia, Dylan, Daniel
**Recurrence:** Weekly Friday-ish

## Single biggest theme
**Call volume is the #1 lever right now and the team is below target.** Automation is ready; the bottleneck is execution.

## Pipeline numbers (from the meeting)
- Team-level target: **100 calls/week** across all Storm Boy callers
- This week: ~23 calls (Hobbs) + ~0 (Ben) + Claudia load = significantly under 100
- Hobbs has **8 farm visits booked next week** → his call capacity drops significantly
- Visits booked this week: **5** (down from 8 last week)
- Goal: book Hobbs out **at least a fortnight ahead** of visits
- Hit-rate stays excellent: Hobbs converted his ~23 calls into 8 visit bookings — call quality is fine, volume is the constraint

## What's working
- **Claude (Apex automation) is fully operational** for call admin — handles lead delivery, emails/texts, transcript retrieval, daily post-call admin
- **Inbound lead volume notably strong this week** — Meta ads, platform, emails combined produced more than the entire previous month
- **Marketing audit (Daniel) confirmed** AgriProve's tech/platform is genuinely superior to competitors

## What's not working / blockers
- **HubSpot data hygiene:** duplicates flagged daily, not being actioned. Merge process is unclear to the team
- **Storm Boy lead count discrepancy:** original ~1,300 imported leads is actually fewer usable contacts than expected. Some outside region, some address-only entries with no contact record. Claudia is reconciling
- **Completed visits under-reported:** Hobbs to reconcile booked-vs-completed before Monday
- **Snapshot automation tool:** pending Daniel walkthrough; intended process is `tag Daniel → he runs the automation/PDF → sends through`

## Commitments + decisions

| Who | Commitment |
|---|---|
| Dylan | Loom: duplicate-merging process (Frontier → HubSpot button → merge function) |
| Dylan | Loom: multi-property / business-linking flow in Frontier |
| Dylan | Walkthrough of snapshot-automation tool with Daniel |
| Dylan | Reconcile visits-booked-vs-completed with Hobbs before Monday |
| Claudia | Background fix to Claude automation (won't interrupt ops) |
| Claudia | Get accurate Storm Boy contact count |
| Ben & Claudia | Increase call volume next week — carry Hobbs's call-load drop |
| Daniel | Expand marketing audit to Agracent + adjacent companies |
| All callers | Review daily hygiene readout, action duplicates assigned to them |
| **Decision** | All Meta ad leads tagged Stormboy regardless of location — campaign attribution change |

## Competitor intel — worth propagating

- **Carbon Link** is **actively knocking on doors in the Storm Boy region** (door-knock outbound, not just digital)
- Carbon Link is **hiring a BDM/carbon-projects role specifically for Queensland** — direct geographic pressure on AgriProve's strongest territory
- Carbon Link / competitors lean heavily on:
  - **In-person touchpoints and referrals** as the primary motion
  - **Financial / cost-benefit messaging** (no upfront costs, etc.)
- Marketing audit finding: AgriProve has **drifted away** from those two communication patterns
- Customer signal: farmers respond more to *"does your offering meet my needs"* than to volume of completed projects (so "57 projects, 22,689 ACCUs" is less convincing than direct fit framing)

## Cross-system routing

| Capture | Where it lands |
|---|---|
| 100/week team call target + per-rep contribution | `coaching/engine/call-efficiency.js` should track this — see suggestion #1 below |
| Carbon Link in-region + QLD BDM hire + competitor positioning patterns | `memory/learnings/2026-05/2026-05-15-marketing-audit-competitor-intel.md` (NEW) |
| Marketing-audit findings about AgriProve drift | Feeds directly into the MESSAGING tab's "Suggested refinements" sub-tab — strongest argument yet for staging the campaign brief |
| Ben's call commitment (daily next week) | `persona-supplements/ben/manual-standup-commitment-2026-05-15.md` (NEW) — auto-builder picks up |
| Claudia's contact-count fix in flight | Noted — once she lands the number, the WORK header should reflect accurate Storm Boy contact total |
| All-Meta-leads-tagged-Stormboy decision | `memory/decisions/2026-05-15-meta-leads-tagged-stormboy.md` (NEW) — affects Storm Boy contact universe |
| Loom links (once recorded) | Add to WORK tab as a "Help" rail or inline next to the merge action |

## What this standup tells us about the system

The dashboard's per-rep call-volume view is **almost** the right tool but doesn't yet show the team-level 100/week target or per-rep contribution. The team is currently doing this math on the call manually. That's the highest-leverage system gap.
