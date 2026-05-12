# Sales Motion Separation — Stormboy Outreach vs Engaged Pipeline Follow-up

**Established:** 2026-05-11 (Dylan)
**Status:** Architectural principle. Read this BEFORE integrating either system with the bus.

## The two motions

AgriProve currently runs two distinct sales motions in parallel. They share a customer base eventually, but the *work* is different and the *measurement* must be different.

### Motion 1 — Stormboy Outreach (the primary list)

- **What it is:** cold-call outreach to scraped Storm Boy contacts. Lead acquisition campaign targeting farmers near Albury NSW.
- **Goal:** get Hobbs on-farm. Calls/SMS/email are the funnel TO the farm visit, not the conversion event.
- **Population:** Storm Boy contacts at funnel stages — `Identified`, `In Conversation`, `Farm Visit booked`, `Farm Visit completed`. Tracked via HubSpot CONTACT-level properties (`contact_lead_stage_storm_boy`, `storm_boy_*`).
- **Owner of the queue:** Claudia's Storm Boy Claude Tool, specifically `get-leads/`. The skill assigns calls to Ben + other reps based on contact owner and queue health.
- **KPIs:** call volume, farm visits booked, identified-bucket clearance, lead acquisition velocity.
- **Goals/quotas:** Storm Boy team has weekly targets (e.g., 100,000 ha of farm visits as a module unit per Storm Boy Cascade). These are the numbers that matter for *this* motion.

### Motion 2 — Engaged Pipeline Follow-up (the secondary list)

- **What it is:** targeted re-engagement of deals already in the sales pipeline. Surfaced when the dashboard's coaching pipeline identifies stale, ambiguous, or probe-worthy deals.
- **Goal:** un-stick deals using the system's accumulated learnings — Hobbs's verbatim framings, team-named tactics, twin-deal patterns. **Apply our modern techniques and Hobbs's brain into our sales system.**
- **Population:** Deals at `Qualified Account`, `Discovery Call`, `Strategy Call`, `SLA/KCT Mapping`, `KCT Issued` stages — **post-funnel, in the sales pipeline**.
- **Owner of the queue:** Dashboard's Plays tab. Claudia's tool can surface a **separate secondary list** (NOT folded into `get-leads`) reading from `shared-growth-memory/deal-signals/`.
- **KPIs:** deals re-engaged, probe outcomes, stuck-zombie deals resolved (won or close-lost cleanly), learnings applied per deal.
- **Goals/quotas:** independent of Stormboy targets. These re-engagements are *quality work on existing pipeline*, not *acquisition volume*.

## Why the separation matters

Three reasons:

### 1. KPIs don't mix
If engaged-pipeline follow-ups counted toward Storm Boy's call volume, two things break:
- Reps get rewarded for re-touching warm pipeline (easy) at the expense of cold outreach (hard but where the volume goal lives)
- Storm Boy's volume goal becomes uninterpretable — was the volume increase real Storm Boy progression or cherry-picked pipeline re-touches?

The two motions need separate counters. Same rep can do both, but each action is logged against the correct motion.

### 2. The work is fundamentally different
- Storm Boy: rep dials a stranger, builds rapport, books Hobbs on-farm. The hard part is getting through.
- Engaged Pipeline: rep re-engages a known prospect using specific learnings. The hard part is the *right framing*, not the connection.

Coaching for these is different. Tools for these are different. Surfacing them together produces noise.

### 3. The system's signal is different
The dashboard's deal-signals reason from stage timing, engagement velocity, and content signals — all of which assume an *existing* pipeline relationship. Surfacing the same signals against cold Storm Boy contacts produces meaningless output (we have no engagement history with someone we've never called).

## What this means in practice

### For Claudia's Storm Boy Claude Tool

**Do not fold dashboard deal-signals into `get-leads/`.** The call list stays exactly what it is — a Storm Boy outreach prioritisation.

**Add a NEW skill: `engaged-pipeline-followups.md`** (parallel to `get-leads/`). This skill:
- Triggers on phrases like *"what pipeline follow-ups do I have"*, *"any pipeline deals to check in on"*, *"show me my engaged pipeline"*
- Reads from `C:\Dylan PM\shared-growth-memory\deal-signals/`
- Filters to deals owned by the current user (`hubspot_owner_id` match)
- Surfaces in priority order based on `coaching_mode`:
  1. `stuck_but_live` — high-value re-engagement
  2. `mystery_disconnect` — probe to disambiguate
  3. `partner_alignment_blocked` — offer joint call
  4. `early_warning` — head off before stage advances
  5. `cooling` — assess + decide
  6. `cold_loss_imminent` — close-lost cleanly OR last-ditch probe
- For each deal, surfaces: `next_recommended_action`, `latest_customer_position`, and any active probes

**Reps should be able to choose**: "give me my Storm Boy calls" → `get-leads/` → Motion 1; "give me my pipeline follow-ups" → `engaged-pipeline-followups/` → Motion 2.

### For the dashboard

**The Plays tab IS the engaged pipeline follow-up surface.** Make this explicit in the UI — add a clarifying sub-header on the deal list so users understand this is NOT the Storm Boy queue. Example heading:

```
Your engaged pipeline follow-ups
(post-funnel deals already in the sales pipeline — for Storm Boy cold outreach,
use Claudia's tool)
```

### For metrics + reporting

If we ever build a "rep activity dashboard" or roll up call/visit counts:
- Storm Boy calls (from Aircall, routed by Claudia's call-admin to Storm Boy bucket) → counted toward Motion 1
- Pipeline follow-up calls (initiated via dashboard's enablement layer OR via the new engaged-pipeline-followups skill) → counted toward Motion 2
- Briefings (Monday + Friday) should report Motion 1 and Motion 2 metrics separately. Never aggregate them.

## Cross-motion handoff

There IS a natural handoff between motions:

```
Motion 1: Storm Boy outreach
     ↓
   call → farm visit booked → farm visit completed → Hobbs visits → HORIZON Snapshot
     ↓
   `contact_lead_stage_storm_boy: "Proceed to Sales Pipeline"`
     ↓
   HubSpot deal created at Qualified Account stage
     ↓
Motion 2: Engaged Pipeline Follow-up begins
```

A contact graduates from Motion 1 to Motion 2 when their lead stage moves to `Proceed to Sales Pipeline`. Once in Motion 2, the dashboard begins coaching the deal; Claudia's tool's engaged-pipeline-followups surfaces the deal in its queue.

The bus is what makes this handoff coherent — Claudia's `call-admin` records the Storm Boy outreach interaction in `customer-positions/`, then weeks later the dashboard's coaching reads those positions when reasoning about the now-pipeline deal.

## Summary for builders

Whenever you add a new skill, surface, or KPI:

1. **Ask:** is this Motion 1 (outreach) or Motion 2 (pipeline follow-up)?
2. **Don't mix them.** Separate skills, separate counters, separate UIs.
3. **Use the bus as the bridge** between them — not as a way to fold them into one.
