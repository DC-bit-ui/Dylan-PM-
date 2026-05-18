# 2026-05-14 — system improvement asks from today's meetings

## Sources
- Granola `3aba2b32-3945-4043-9112-8d14c0512246` — Product refinement meeting (14:31 AEST) · Will + Cadel + Dylan
- Granola `e262812a-8908-4560-98cd-bc79a006650e` — Claudia sync on collective intelligence system (17:41 AEST)

## What Will asked for explicitly (highest priority)

1. **Weekly farm-visit booking metric, accessible to him.** *"Like Dylan, I'm sure there's a report or something somewhere that's like how many farm visits have been booked per week."* He's tracking this manually right now. The dashboard already has it; he needs a stable URL or shared report to hit.

2. **The goal is 10 visits per week, not 8.** *"Our target's to book 10 per week."* Captured wrong from Kieren's earlier SLT framing. `FARM_VISIT_WEEKLY_GOAL` in `.env` updated.

3. **Calls-to-visits conversion ratio (NEW METRIC).** Will: *"Are we doing that by having to make the 60 calls or the 80 or the 100 calls, or are we at the moment able to do it in 20?"* Followed by: *"I'd love to get to the point where our calls are so effective that we're only having to make 20 phone calls to get 10 farm visits."* This is THE efficiency lever leadership wants to track. Must be added to STATS.

4. **Total booked vs total completed.** Will is computing "37 booked, 22 completed" manually. Dashboard should surface both side-by-side.

5. **Cause-of-week-on-week-variation analysis.** *"What was the difference in framing, the research quality, the timing, the natural variation?"* — leadership wants the system to explain why some weeks book more than others, not just count them.

## What Claudia confirmed (settles previous open questions)

1. **Her system writes Aircall transcripts to Confluence daily at ~1pm.** Plus writes HubSpot notes with the transcript + summary (Aircall recordings expire after ~100 days). This is the canonical raw-transcript source.

2. **She doesn't see bidirectional brain writes as needed.** *"My system is probably not going to add direct value to contributing to a combined connection."* Her tool reads the brain via the /ask-team skill we already templated. Brain stays dashboard-authored.

3. **She agreed to build the /ask-team skill** that knows where to look in the bus. *"Yeah, I can definitely do that."* Awaiting from her side.

4. **Friday work-summary + Monday `/improve` pattern is live.** *"On Monday I run an /improve command and it will tell me all of the insights."* Captures friction points per person, weekly summary, then Monday review. Same pattern the dashboard should adopt for its own self-improvement loop.

5. **HubSpot tasks as prioritisation surface is token-heavy.** Worth knowing but not urgent for my system.

## What Cadel said about the dashboard

- *"At this point we can update priorities straight away... if this tool that Dylan's got is going to help them with the administration, and Claudia's tools to get through the calls, if they're still not getting through the calls and we can identify it, then we need to find what that is to then drop that in."* → The dashboard is officially on the team's radar as a conversion-efficiency lever, not a side project.

## Direct system-improvement priority order

1. **Fix goal from 8 → 10/week** (1 line in .env)
2. **Add calls-to-visits ratio** to STATS (new HubSpot fetch + metric)
3. **Fix stage dwell time** to use historical won-deals data (the original ask from earlier today)
4. **Surface total visits booked vs total visits completed** alongside the weekly rate (currently in STATS but worth highlighting)
5. **Eventually: cause-of-variation analysis** (LLM pass on what changed week-to-week). Lower urgency — needs more data first.

## What's NOT for the dashboard

- The KCT-light "Lightning lay" sales process (Will + Kieren are reviewing internally; product team picks up automation after their hard edit lands)
- The MCP custom-objects work (Cadel's lane)
- The EIH end-to-end automation (Will deprioritised)
- LawrieCo HORIZON expansion doc (Cadel scoping)

## Cross-references

- Updated farm-visit goal: `stormboy-tracker/.env` → `FARM_VISIT_WEEKLY_GOAL=10`
- Calls-to-visits ratio implementation: extends `coaching/engine/farm-visit-metrics.js`
- Stage dwell time fix: `coaching/engine/stats-pipeline.js` using `hs_v2_cumulative_time_in_<stage_id>`
