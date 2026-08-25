# How fast we fill - can the five figures be sourced

Run 17 August 2026 against HubSpot (reauthorised) and the shared growth memory bus at `SHARED AP/Projects/Other Projects/Claude Code Projects/shared-growth-memory`.

**Short answer: none of the five reproduce. Four have no source I can find, and the fifth is real but points in whichever direction the window is chosen to make it point.**

---

## Row by row

### First contact to signed contract · 103 → 84 days · claimed 19 days faster

Not reproducible as stated. There is no instrumented "first contact" timestamp that reaches a signed contract, because first contact happens at the Storm Boy contact level and signature happens on the deal.

The closest measurable analogue is **deal created to Closed Won**, Sales Pipeline. It gives two answers:

| Window | n | Median days to close |
|---|---|---|
| Year to 16 Aug 2025 | 45 | **188** |
| Year to 17 Aug 2026 | 19 | **87** |

| Window | n | Median days to close |
|---|---|---|
| Calendar 2025 | 18 | **52.5** |
| Calendar 2026 to date | 12 | **118** |

**On a rolling twelve months the cycle halved. On calendar years it more than doubled.** Same property, same pipeline, same filter. The rolling window's "before" is inflated by a backlog clear-out - deals closed in Q3 2024 had a median age of 245 days and Q4 2024 of 182 days, and those 29 deals dominate the earlier window.

Neither pairing produces 103 and 84. The 84 is close to the rolling-window current figure of 87. The 103 matches nothing in the record.

**Where 19 days probably came from.** The growth memory holds a pattern file dated 9 May 2026 titled *"LawrieCo partner-channel deals close 3× more often and 19 days faster than direct sales"* - direct median about 47 days, LawrieCo about 28. That is a **comparison between two channels in the same period**, not a change over time. If it has been carried into the panel as a year-on-year improvement, the number is real but the claim it is making is not.

Verdict: **do not publish.** The underlying story may be good, but it is not currently decidable which direction it runs.

### Contracted per field team each week · 470 → 640 ha

No source found. There is no hectares property on the deal object. The contact-level `farm_size` and `property_size` fields are Facebook Lead Ad captures and are self-reported.

The growth memory does carry a weekly hectare pace, computed 1 June 2026: **864 ha per week on the long window, 1,963 ha per week on the short window**, against 7,853 hectares registered. Neither is 470 or 640, and both are whole-programme rates rather than per field team.

Verdict: **unsourced.** If these come from Frontier or ArcGIS rather than the CRM, that needs saying and the extract needs to be reproducible.

### Farm visits per field agent each month · 9 → 13

This one is not a measurement error, it is a category error.

**Operation Storm Boy launched on 13 January 2026.** Querying `storm_boy__meeting_date` across every month of 2025 returns zero. There were no Storm Boy farm visits last year, so "last year" cannot be 9.

Actual monthly counts, all owners:

| 2026 | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug |
|---|---|---|---|---|---|---|---|---|
| Visits | 3 | 6 | 9 | 8 | **23** | **24** | 7 | 0 |

Eighty in total across roughly seven months, about 11.4 per month for the whole programme. By contact owner: 57 to Ben, 20 to Hobbs, 3 to Claudia - and the contact owner is the person who booked it, not the agent who drove out.

Two problems with 13. It exceeds the entire programme's monthly output in every month except May and June. And **the last two months are 7 and 0**, so a figure presented as "now" is the peak of a curve that has since fallen off.

Verdict: **do not publish.** A rate taken at its peak and labelled as current is the kind of thing a buyer's analyst finds by asking for the monthly series.

### Farm visit to landholder decision · 19 days

There are no completed observations of this interval.

The growth memory funnel snapshot from 1 June 2026 shows the Storm Boy outreach stages as: Identified 484 ever reached, In Conversation 207, Farm Visit booked 58, Farm Visit completed 39, **In Sales Pipeline 0**. Conversion out of Farm Visit completed is recorded as 0 per cent, with all 39 still sitting in it.

Separately, the cohort summary in the same file records 12 Storm Boy deals as having entered the pipeline. **Both cannot be true**, and the likely explanation is that the contact-level lead stage is never advanced to "In Sales Pipeline" once a deal is created. That is a data hygiene problem worth fixing on its own merits, because it means the handoff between the two sales motions is currently invisible.

Verdict: **do not publish**, and raise the stage-update gap with whoever owns the Storm Boy workflow.

### Hectares added to the pipeline · 148,400 ha · claimed 26,800 more

No source found in HubSpot or the growth memory. It does not match the registered figure (7,853), the forward forecast (60,520 expected to register, 68,373 projected total), or any regional pipeline total in the console.

Verdict: **unsourced.** Most likely a Frontier or ArcGIS figure. Needs its origin and its definition of "in the pipeline" stated.

---

## What the growth memory does support

These are dated, computed by the scheduled tasks, and reproducible. They are stronger than what is currently on the panel because they carry their own populations.

**The recruitment funnel, as at 1 June 2026**

| Stage | Ever reached | Conversion to next | Median days in stage |
|---|---|---|---|
| Identified | 484 | 42.8% | 1 |
| In Conversation | 207 | 28.0% | 8 |
| Farm visit booked | 58 | 67.2% | 1 |
| Farm visit completed | 39 | - | 1 |

**Outbound effort behind it**: 1,136 outbound calls of which 606 Storm Boy, 347 unique contacts engaged, 1,030 tasks completed, 6.3 touches per contact on average. **9.2 calls per farm visit booked**, or 10.9 visits per 100 calls. Connect rate 74 per cent across 766 calls in the trailing 90 days, median connected call 47 seconds.

**Assessment issuance**: one every 23.6 hours improving to one every 6.4 hours, about 3.7 times, at roughly two cents each. Reported at Town Hall 7 July 2026 and corroborated independently on 3 July.

**Hectare pace against target**: 7,853 registered, 864 ha per week on the long window and 1,963 on the short, against 4,429 per week needed to hit the financial year target. Pipeline coverage of the 30,000 hectare target at 227.9 per cent.

---

## The finding that matters more than any of the above

The growth memory computes win rate by acquisition channel:

| Cohort | Entered pipeline | Won | Lost | Win rate |
|---|---|---|---|---|
| Storm Boy (cold outreach) | 12 | 2 | 10 | **16.7%** |
| Direct / control | 85 | 17 | 79 | 17.7% |
| LawrieCo (partner channel) | 18 | 16 | 3 | **84.2%** |

**Storm Boy is converting at the base rate, not above it.** The partner channel converts at roughly five times either. The May 2026 pattern file reaches the same conclusion independently on a different match: direct 15 per cent win rate at about 47 days median close, LawrieCo 45 per cent at about 28 days.

This matters for the module because the console is making a claim about a recruitment machine capable of assembling 125,000 hectares, and the engine at the centre of that claim currently converts no better than what it replaced. The volume argument may still hold - cold outreach can be scaled and a partner relationship cannot - but that is a different argument and it should be made deliberately rather than by implication.

It also explains the earlier finding that win rate out of the KCT stage has fallen from 75 per cent in H2 2024 to 46 per cent in H1 2026. Same cause, seen from a different angle: the mix shifted toward a channel that converts worse.

---

## Suggested position

The panel's structure is right and its numbers are not ready. Three options, in order of how much I would back them:

**Rebuild the rows on the funnel figures above.** They are dated, sourced, carry their populations, and describe exactly what the panel is trying to describe - a recruitment machine and what it can put through. Calls per visit booked, stage conversion, assessment issuance rate and hectare pace are all defensible today.

**Keep the current rows and instrument them properly.** First contact needs a real timestamp, hectares need a single agreed source and definition, and the field-agent denominator needs to be a field agent rather than a contact owner. That is a few days of work and it produces numbers that survive.

**Publish the cycle-time story with both windows shown.** Riskier, but honest and unusual: here is the rolling twelve month view, here is the calendar view, here is why they disagree. Most buyers have never been shown that by a vendor.

What I would avoid is publishing any of the five as they stand. They are checkable, and the first one that fails takes the projection above it with it.
