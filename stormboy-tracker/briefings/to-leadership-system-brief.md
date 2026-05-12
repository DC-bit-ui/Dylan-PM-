# Stormboy Conversion Tracker: Context Packet for Leadership

---

## 📨 Cover message (copy-paste into Teams to Kieren and Will)

> Hey Kieren, Will,
>
> Want to share where the Stormboy Conversion Tracker has landed. It's bigger than a dashboard now and there's a real conversation in here.
>
> Rather than a memo to read, I've put it in a format you can hand to your Cowork agent (or Claude on your phone) and have it walk you through interactively. Top of the doc has the prompt to use. Means you can dig where you want, not where I think you should.
>
> Real asks at the end. Happy to walk through live, 15 min when both of you have time.
>
> Doc: `stormboy-tracker/briefings/to-leadership-system-brief.md`

---

## 🤖 How to use this document

**Give the full document below to Cowork (or any Claude session) with this prompt:**

```
You are helping me understand a new sales coaching system Dylan has built
at AgriProve. I'm a leader, time-poor, and I want to engage with this at
the right level of depth without reading the full doc.

Do this:

1. Read the whole packet.
2. Give me the 30-second summary in plain language. What it does, why it
   matters, what changes.
3. Then ask me which thread to pull on first:
   - The three findings from real data (LawrieCo, pre-Discovery
     attrition, Strategy Call stall cohort)
   - How the recruitment process changes
   - The two-motion separation principle
   - The integration with Claudia's tool
   - What I need to decide / approve
   - The risks and what could go wrong
4. Answer my questions using the packet. Cite sections by their headings.
   If I ask about something not in the packet, say so directly.
5. If I ask you to do analysis (e.g. "what would scaling LawrieCo cost"),
   reason it from the numbers in the packet. Show your working.
6. At the end, summarise: (a) the decisions I made, (b) what I owe Dylan,
   (c) what I want to follow up on later.
```

Useful follow-up questions:
- *"Compare the LawrieCo finding to typical referral economics. Is 3× win rate plausible?"*
- *"What does this change for Will's team specifically?"*
- *"Draw the unified system as a diagram"*
- *"What does Ben's Monday look like with this rolled out"*
- *"Talk me through what could go wrong"*
- *"Build me three discussion questions for the leadership meeting"*

---

# Context packet starts here

## 30-second summary

We built an active learning system on top of HubSpot that does three things our pipeline reporting cannot:

1. **Reads our live pipeline** and tells us which deals are stuck, why, and what to do, using multi-signal reasoning (stage timing + engagement velocity + customer-voice signal) not just stage age
2. **Captures Hobbs's language** from his on-farm transcripts and Ben's call recordings, distills the framings that land, surfaces them back as battle-card-ready content
3. **Hands reps ready-to-send drafts** when follow-up is needed, instead of adding work to their plate. The system enables, doesn't instruct.

The system is already producing real coaching against real data, citing real won/lost deals from our own pipeline, surfacing real customer-voice signals from real transcripts. It runs locally at `http://localhost:3401`.

The bigger story: it unifies with Claudia's existing Storm Boy Claude Tool through a shared memory bus so the team gets coherent guidance whether they're working in the dashboard or asking Claudia's tool for their call list.

## Three findings from today's live data run

### Finding 1: The LawrieCo channel is structurally different

| Metric | Direct sales | LawrieCo partner |
|---|---|---|
| Wins | 36 | 25 |
| Win rate | ~15% | ~45% |
| Median time to close | 47 days | 28 days |
| Closed-lost in same period | 198 | 31 |

**Source:** HubSpot MCP inspection 2026-05-08. LawrieCo attribution via `closed_won_reason` keyword match (e.g. "LawrieCo relationship", "LawrieCo Project", "LawrieCo deal").

**Interpretation:** the partner channel closes 3× more often and 19 days faster than direct. The pre-existing trust shortcuts the friction we see at Discovery → Strategy in direct sales. **This is structural, not cherry-picked.**

**Strategic question for you:** how much of our incremental sales effort should go into scaling partnerships vs scaling direct sales? The unit economics are unambiguous, but partnership scalability has its own constraints (LawrieCo's bandwidth, what other partners look like).

### Finding 2: Pre-Discovery cold attrition is our largest pipeline loss

Quoting the system's verbatim output from today's analysis:

> *"Pre-Discovery cold attrition is the single largest volume loss: 139 qualified accounts lost, 114 coded 'Cold', median 33 days idle. Speed-to-first-contact failure is destroying pipeline before any AgriProve value proposition is ever delivered."*

**The numbers:** of 230 total closed-lost deals in the data window, 139 came from Qualified Account stage. 82% of those (114) were coded "Cold" (silent attrition, no formal objection). Median dwell time in Qualified Account before being lost: 33 days.

**Why this matters more than in-pipeline friction:** the volume here dwarfs anything we'd gain from optimising Strategy Call or KCT-stage friction. Tightening time-to-first-contact post-qualification is the largest available lever in the pipeline.

**Strategic question for you:** is this a process / capacity issue (we don't have enough call capacity to reach all qualified accounts within 7 days) or a prioritisation issue (we're calling the wrong ones first)? Both have different fixes.

### Finding 3: There's a 9-month-old Strategy Call stall cohort

Six active deals are 245-426 days stuck in their current stage:
- Daisy Bank (KCT Issued, 426d)
- Rosebank (KCT Issued, 287d)
- Hanrahan-Plibersek (KCT Issued, 284d)
- Bulgoo Pastoral (Strategy Call, 271d)
- JA - John Atherton (Strategy Call, 249d)
- Brigalow and Mostowie (Strategy Call, 245d)

All Ben's. The three Strategy Call deals were created Jul-Sep 2025 and stalled at Strategy together. **Something happened in the process during that window** (mid-2025) that produced a wave of stalls. Worth investigating.

These deals are not Cold-loss-imminent. The dashboard's multi-signal analysis on Daisy Bank shows the customer's last email was warm and named "early May" as his deadline. They're **stuck-but-live**, partner-alignment, decision-paralysis, or in-flight customer process. Worth re-engaging, not closing-lost.

## What the system changes operationally

### The recruitment process gains a parallel motion

**Today:** the Storm Boy motion is volume-led. Scrape leads, call them, book Hobbs on-farm, deliver HORIZON Snapshot. KPIs are call count + farm visits booked. Claudia's tool runs this workflow and the team is measured on these numbers.

**With the dashboard:** a parallel motion comes online, targeted re-engagement of pipeline deals using accumulated learnings. Not new lead acquisition. Not Storm Boy outreach.

This is the work the team doesn't currently get to because cold outreach burns the day. The dashboard surfaces it, drafts the artifact, tells the rep what to expect from the response. **Quality work on existing pipeline that we've been leaving on the floor.**

### The two motions stay separate (critical)

Storm Boy KPIs and pipeline-follow-up KPIs do not merge. Same rep can do both, but each action is logged against the right motion. If pipeline re-engagement starts counting toward Storm Boy call volume, two things break:
- Storm Boy's number becomes uninterpretable
- Reps cherry-pick warm pipeline touches over harder cold outreach (gaming the easier metric)

Full principle: `shared-growth-memory/sales-motion-separation.md`.

### Hobbs's brain becomes transferable

From distilling one real Hobbs farm-visit transcript, the system extracted seven verbatim framings he uses that work. Three examples:

- *"Our 25% is what stops you carrying the methodology liability for 25 years"*, reframes the revenue split as risk transfer, not commission
- *"You agree to not build a trailer park home"*, bounds the 25-year commitment with humour
- *"Nothing works on a ratchet"*, explains the downside-protection mechanism (you don't hand credits back unless you violate conditions)

These now sit as battle-card content. Ben or any other rep can use this language directly. As more Hobbs transcripts get distilled, the language accumulates. **What lives in Hobbs's head today becomes systemic knowledge.**

## How the system works (technical, but useful for you to understand)

### The three-tier signal model

Every active deal gets analysed across three signal tiers, not just stage age:

| Tier | What it measures | Source |
|---|---|---|
| **Stage** | Days in current stage vs median time to next stage | HubSpot deal data |
| **Engagement** | Reply latency trend, contact velocity, last meaningful contact | HubSpot engagement objects (emails, calls, meetings) |
| **Content** | Latest customer position (verbatim), sentiment trajectory, unresolved objections | Pass 0 distillation of emails, calls, farm-visit transcripts |

Each tier gets a health rating (red/amber/green) and a confidence rating. The dashboard reasons across all three to produce a **coaching mode** (e.g., `stuck_but_live`, `cold_loss_imminent`, `mystery_disconnect`, `partner_alignment_blocked`).

This is what lets the system differentiate between deals that all look "RED 100" by stage age but mean fundamentally different things. Daisy Bank is RED by stage age but warm in content, coaching mode is `stuck_but_live`, recommendation is a low-pressure probe. A deal that's RED across all three tiers would get coaching mode `cold_loss_imminent` and recommendation to close-lost cleanly.

### Probes instead of prescriptions

When a deal's state is ambiguous, the system suggests a **probe**, a low-stakes test whose outcome resolves the uncertainty. For Daisy Bank the probe is a low-pressure check-in email. Predicted outcomes:
- Reply <24h with positive sentiment → push toward SLA Mapping
- Reply 3-7d, neutral → offer joint partner call
- No reply 14d → close-lost cleanly

The system also drafts the email ready for the rep to review and send. The rep doesn't draft from scratch. **The system enables the work, doesn't add to it.**

### How it unifies with Claudia's tool

Both systems share a memory bus at `C:\Dylan PM\shared-growth-memory\`. Four record types:
- `patterns/`, durable learnings (Hobbs framings, LawrieCo finding, etc.)
- `deal-signals/`, current state per active deal
- `customer-positions/`, what customers have actually said
- `probe-outcomes/`, closed-loop probe data

**The dashboard writes** patterns and deal-signals on each coaching run. **Claudia's tool will write** customer-positions after each call and patterns when reps articulate insights. Both systems read everything. Same data, two execution surfaces.

The rep gets coherent guidance whether they're looking at the dashboard or asking Claudia's tool for their pipeline follow-ups.

## Worked example, Ben's Monday: before vs after

**Before the system:**
- Ben opens HubSpot, sorts deals by stage
- Sees Daisy Bank at 426d KCT, registers as "old deal, probably dead, but James was a good contact"
- Decides he doesn't have time to figure out where this one is at
- Moves on to call list (Storm Boy)
- Daisy Bank drifts another month

**After the system:**
- Ben opens Claudia's tool, asks "any pipeline follow-ups"
- Tool surfaces Daisy Bank: *"STUCK BUT LIVE. James said 'I'll get back to you early May' on Apr 18. Today's May 11. System suggests low-pressure check-in. Draft ready."*
- Ben opens the dashboard, reviews the 135-word draft (named "early May" back to James, gave him explicit permission to say no, mentioned the autumn HORIZON Snapshot as a hook)
- Ben edits one sentence, clicks send
- 3 minutes of his time spent on a deal he was about to lose

If James responds warm within 24h, the system auto-detects (via HubSpot engagement polling) and re-classifies the deal. Ben gets a notification: *"Daisy Bank moved warming. Book SLA Mapping conversation."* He doesn't have to remember to check.

## What's still in progress (and what's done)

**Done and verified:**
- ✅ Live HubSpot integration (token live, 349 real deals loaded)
- ✅ Real coaching against 7 active deals (rate-limited on first run; throttled and clean now)
- ✅ Real Hobbs framings distilled from one real farm-visit transcript
- ✅ Real Aircall distillate from one real call (Ben + Alec Thompson, 2026-05-06)
- ✅ Patterns tab + Plays tab live
- ✅ Monday + Friday briefing endpoints
- ✅ Shared bus scaffolded (`C:\Dylan PM\shared-growth-memory\`)
- ✅ Enablement layer (inline drafts) on Daisy Bank as proof-of-concept

**Designed, not yet running:**
- ⏳ Per-active-deal Pass 0 distillation of emails (needs Cowork orchestration to run nightly)
- ⏳ Probe outcome auto-detection (HubSpot engagement polling, needs Cowork)
- ⏳ Claudia's tool plugging into the bus (her side, with the context doc I've written her)
- ⏳ Full live coaching for all 12 active deals with multi-signal data (currently just Daisy Bank has the demo)

**Deferred:**
- 🔵 Postcode → NRM region lookup (improves twin matching, ~1hr build)
- 🔵 LawrieCo learnings v2 analytical pass (mines transferable patterns from LawrieCo wins)
- 🔵 Dashboard deployment to Will's team (currently on Dylan's machine only)

## Investigation hooks (questions your agent can answer)

**Q: Is the LawrieCo 3× win rate finding real or an artifact?**
A: Real. It comes from a HubSpot MCP inspection on 2026-05-08 where 25 of 61 closed-won deals had `closed_won_reason` containing "LawrieCo" (variants: "LawrieCo relationship", "LawrieCo Project", "LawrieCo deal"). LawrieCo n=56 closed total (25 won, 31 lost). Direct sales n=234 (36 won, 198 lost). The numbers are exact, not estimated.

**Q: What would it cost to scale LawrieCo?**
A: Not directly knowable from the packet. The packet shows current performance, not partnership capacity constraints. Worth a separate conversation with whoever manages the LawrieCo relationship. Open question: is the 3× rate a function of their unique network, or replicable with other partners we could onboard?

**Q: Why does the system trust customer-voice signal more than stage timing for Daisy Bank?**
A: Because stage timing only tells us *how long* something has been sitting. Customer voice tells us *why*. James Almond's last email was warm, named the wife being on board, and gave an "early May" timeframe. That's qualitatively different from a deal where the customer has stopped replying entirely. Both look RED by stage age (426d > 12d median). They need different plays.

**Q: How does this change Storm Boy targets?**
A: It doesn't. Storm Boy KPIs stay exactly what they are (call volume, farm visits booked). The new motion (engaged pipeline follow-up) gets its own separate metrics (deals re-engaged, probes resolved, stuck deals cleared). The two motions never share counters by design.

**Q: What does Will need to do specifically?**
A: Three things: (1) tell the team Motion 1 and Motion 2 are separate workflows, (2) have a 30-min conversation with Claudia about plugging her tool into the bus, (3) decide on the LawrieCo and pre-Discovery findings, do we want to scope follow-up initiatives.

**Q: What could go wrong?**
A: Five risks worth thinking about:
1. **Motion confusion**, reps could conflate the two motions if leadership doesn't reinforce the separation. Mitigation: explicit messaging when the secondary surface ships.
2. **Bus location**, currently filesystem on Dylan's machine. Cross-machine sharing requires OneDrive sync or a different substrate. Not blocking until we expand beyond one machine.
3. **Coaching drift**, if Pass 0 doesn't run regularly, deal-signals get stale and recommendations get worse. Mitigation: Cowork orchestration once it lands.
4. **Anthropic costs**, current estimate ~$5/day with current volumes. Could grow if we expand input sources or refresh frequency. Mitigation: cost ceilings documented in cowork-orchestration-contract.md.
5. **Pattern drift**, if the system surfaces patterns that don't actually work, reps lose trust fast. Mitigation: probe outcomes are the closed-loop validation; patterns get re-validated against accumulated probe data.

**Q: What's the deployment plan?**
A: Currently runs on Dylan's machine at `localhost:3401`. To roll out to Will's team, two options: (a) host it somewhere (Render/Railway/Azure) with the same .env config, or (b) replicate Dylan's setup on Will's machine. Pre-Monday we should decide based on whether the team actually gets value from it in pilot use. Deferred until that's validated.

**Q: When can Will and the team start using it?**
A: Today, on Dylan's machine. The full multi-signal value won't be there until Pass 0 distillation runs against all active deals (needs Cowork or another iteration of in-session mining). But the live coaching for the 7 stuck deals + the Patterns tab insights + the Monday/Friday briefings are all usable now.

## What I'm asking for, in priority order

1. **A 30-min conversation with both of you**, walk through the dashboard live so you've seen it, not just read about it. I can come to either of your offices.

2. **Awareness across the team** that this exists and what each surface is for. Specifically: Storm Boy outreach stays in Claudia's tool. Pipeline follow-ups come from the dashboard.

3. **A view on the LawrieCo finding.** 3× win rate is structurally different. Whether we want to invest in scaling partnerships vs scaling direct sales is a leadership call.

4. **A view on the pre-Discovery attrition finding.** 139 lost qualified accounts at 33-day median dwell is our biggest leak. If you want, I can scope a tightening initiative.

5. **A 30-min conversation with Claudia.** I've written her a context doc (`stormboy-tracker/briefings/to-claudia-system-context.md`) and she'll get her agent to walk her through it. Once she's read it, the three of us coordinate on the integration plan.

## Glossary

- **Active learning system**, a system that observes outputs and adjusts behaviour, not just a dashboard
- **Bus**, `C:\Dylan PM\shared-growth-memory\`, the shared filesystem substrate between the dashboard and Claudia's tool
- **Coaching mode**, system's classification of why a deal is the way it is (stuck_but_live, cold_loss_imminent, etc.)
- **HORIZON Snapshot**, the post-visit customer report Hobbs delivers, generated by Frontier (AgriProve's spatial app)
- **KCT**, Knowledge & Capability Tool, the assessment customers complete
- **Motion 1**, Storm Boy outreach (Claudia's get-leads)
- **Motion 2**, Engaged Pipeline Follow-up (dashboard-driven secondary surface)
- **Pass 0**, distillation pass that reads emails/transcripts and outputs structured signal
- **Pattern**, durable learning written as a markdown file in shared bus
- **Probe**, low-stakes test the system suggests to disambiguate a deal's state
- **Twin**, a historical deal (won or lost) with similar profile to an active deal, used for analogue reasoning

Kind regards,
Dylan
