# Stormboy Tracker + Shared Memory Bus: Context Packet for Claudia

---

## 📨 Cover message (copy-paste into Teams to Claudia)

> Hey Claudia,
>
> Want to walk you through what's been built on the dashboard side and how it'd plug into your Storm Boy tool. Rather than a read-it-all memo, I've put it in a format you can hand to your Cowork agent (or any Claude session). Top of the doc has the prompt to use.
>
> Read it however suits, ask your agent the questions, then let me know when you want to chat. Real ask in here, no urgency.
>
> Doc: `stormboy-tracker/briefings/to-claudia-system-context.md`

---

## 🤖 How to use this document

**Give the entire document below to a Claude session (Cowork, Claude Code, claude.ai, whichever) with this prompt:**

```
You are helping me understand a new system Dylan has built that connects
to my Storm Boy Claude Code tool. I'm going to give you the full context
packet. Do this:

1. Read the whole packet first.
2. Give me a 90-second summary in your own words. Plain language.
3. Then ask me what I want to dig into first:
   - The two-motion principle (why my get-leads stays separate)
   - The shared bus (what reads/writes I'd add)
   - The schemas (what file shapes look like)
   - The value flow (what my tool gets out of this)
   - The risks / concerns
4. As I ask questions, answer using the packet. If I ask something not
   in the packet, say so plainly.
5. If I ask for a diagram, draw one in ASCII or describe the flow clearly.
6. At the end, summarise the three things I'm committing to do.
```

You can also ask the agent things like:
- *"Draw the data flow between my tool and the dashboard"*
- *"Walk me through a day where Ben uses both systems"*
- *"What's the smallest version of the integration I could ship first"*
- *"What could go wrong"*
- *"Compare this to how I currently handle log-idea outputs"*

---

# Context packet starts here

## What Dylan has built (the dashboard)

A coaching layer on top of HubSpot pipeline data. Lives at `C:\Dylan PM\stormboy-tracker\`. Runs as a Node.js Express server on `localhost:3401`. Three live components:

1. **Live HubSpot proxy**, reads deals/contacts/associations from AgriProve's HubSpot (token in `.env`). Same data your tool sees.

2. **Coaching pipeline**, distills Hobbs's farm-visit transcripts and Aircall call content (via Confluence pages your `pelican294` workflow produces), identifies stuck deals, generates per-deal coaching with Anthropic API. Already ran one full live coaching session producing real Claude-generated recommendations against 7 active deals citing real twins from the won/lost pool (Burnham Grazing, Weatherall CP, Mount Moon Pastoral etc.).

3. **Two surfaces:**
   - **Plays tab**, rep view, per-deal coaching cards with multi-signal risk (stage health / engagement health / content health), latest customer position, probe suggestions, ready-to-send draft emails
   - **Patterns tab**, leadership view, channel comparison (LawrieCo vs direct), stage friction map, recent system learnings, counter-objection library

## The architectural problem we're solving

Two AgriProve growth-domain Claude systems exist independently:

1. **Your Storm Boy Claude Tool**, owns rep workflow (get-leads, call-admin, lead research, log-idea, /improve)
2. **The dashboard**, owns pipeline coaching and pattern mining

If they keep running independently, three failure modes:
- Same insight gets "discovered" twice (waste)
- Your tool doesn't know what the dashboard's coaching says about a deal when Ben calls (rep gets fragmented guidance)
- The dashboard doesn't see what Ben heard on the call (next coaching cycle reasons from stale data)

**Dylan's principle:** "These systems cannot live in isolation."

Fix: shared memory bus both systems read+write at `C:\Dylan PM\shared-growth-memory\`.

## The two-motion principle (critical, read first)

**Motion 1: Storm Boy outreach (yours):**
- Population: scraped Storm Boy contacts at funnel stages
- Goal: book Hobbs on-farm
- Skill: `get-leads/` in your tool
- KPIs: call volume, farm visits booked, leads-to-funnel conversion

**Motion 2: Engaged Pipeline Follow-up (new, dashboard-driven):**
- Population: deals already in the sales pipeline (post-Qualified Account)
- Goal: re-engage stuck deals using accumulated learnings
- Skill: NEW `engaged-pipeline-followups/` in your tool, parallel to `get-leads/`
- KPIs: deals re-engaged, probes resolved, stuck deals cleared

**Why they must not merge:** if the dashboard's "this deal needs a check-in" lands in your Storm Boy call list, your call volume number stops meaning anything, and reps cherry-pick warm pipeline touches over harder cold outreach. The bus bridges the two motions, doesn't merge them.

Full principle doc: `C:\Dylan PM\shared-growth-memory\sales-motion-separation.md`.

## The shared bus, what's at `C:\Dylan PM\shared-growth-memory\`

```
shared-growth-memory/
├── README.md
├── INTEGRATION-FOR-CLAUDIA.md           ← detailed integration guide for you
├── sales-motion-separation.md           ← the principle
├── schemas/
│   ├── pattern.md
│   ├── probe-outcome.md
│   ├── deal-signal.md
│   └── customer-position.md
├── patterns/                            ← markdown, durable learnings (4 already seeded)
├── probe-outcomes/                      ← JSON, closed-loop probe data (empty)
├── deal-signals/                        ← JSON, one per active deal (1 seeded: Daisy Bank)
└── customer-positions/                  ← JSON, one per contact (empty)
```

Both systems read+write. Both can be either source. Schemas in `schemas/*.md` define the JSON shapes.

## The three integration points your tool needs

### Integration 1: NEW skill: `engaged-pipeline-followups/`

Parallel to your existing `get-leads/`. Reps trigger by saying things like *"any pipeline follow-ups"*, *"what engaged deals need attention"*, *"show me my engaged pipeline"*.

**Skill behaviour:**
1. Reads `deal-signals/deal-*.json` from the bus
2. Filters to deals owned by current user (`hubspot_owner_id` match)
3. Sorts by `coaching_mode` priority (stuck_but_live first, then mystery_disconnect, then partner_alignment_blocked, etc.)
4. Surfaces each deal with: `coaching_mode`, `next_recommended_action`, `latest_customer_position`, active probes

**Output format (suggested):**
```
> Engaged pipeline follow-ups (3), separate from your Storm Boy call list
>
> 1. James Almond, Daisy Bank · KCT Issued (426d, RED) · STUCK BUT LIVE
>    Last from customer (23d ago): "Thanks for the update Ben, the wife
>    and I are talking it through over Easter. I'll get back to you early May."
>    Next: Send low-pressure check-in. Draft ready in dashboard.
>    [Open in HubSpot] [Open dashboard probe draft]
>
> 2. Will McLachlan, Rosebank · KCT Issued (287d, RED) · STUCK BUT LIVE
>    Next: 21-day countersign deadline. Copy agronomist who mapped the property.
>    [Open in HubSpot] [Open dashboard]
```

### Integration 2: `call-admin/` writes to bus after each call

When a rep logs a call via your tool's call-admin flow, write two things:

**(a) A customer-position to `customer-positions/contact-<contact_id>.json`** (append + truncate to 5 most recent):
```json
{
  "as_of": "<call timestamp>",
  "verbatim_or_distilled": "<the customer's most-impactful line, PII-generalised>",
  "is_verbatim": true,
  "source": "call",
  "source_id": "<Aircall call ID>",
  "topic": "partner_alignment | timing | revenue_split | etc.",
  "sentiment": "positive | neutral_warm | neutral | neutral_cool | negative",
  "captured_by": "claudia_call_admin"
}
```

**(b) If the call was a response to a recent probe, update `probe-outcomes/probe-<id>.json`** with `actual_outcome` populated.

### Integration 3: `log-idea/` writes patterns to bus

When a rep articulates a pattern (e.g. *"every farmer who mentions their accountant slows down at SLA, maybe we should get accountants involved earlier"*), write to `patterns/<date>-<slug>.md` with `surfaced_in_systems: ['claudia_storm_boy_tool']`. The dashboard reads patterns on each coaching cycle. If its data corroborates, it appends `dashboard_coaching` to `surfaced_in_systems` and bumps confidence to high.

Detailed integration spec at `C:\Dylan PM\shared-growth-memory\INTEGRATION-FOR-CLAUDIA.md`.

## What's already in the bus

| Record type | Count | Notes |
|---|---|---|
| `patterns/` | 4 | Hobbs framings playbook, nurture-back HORIZON, LawrieCo 3× finding, methodology-liability frame |
| `deal-signals/` | 1 | Daisy Bank, full multi-signal mix with verbatim customer position |
| `probe-outcomes/` | 0 | Empty until first probe sent |
| `customer-positions/` | 0 | Empty until your call-admin or distillation writes |

The dashboard's next live coaching run will populate `deal-signals/` for all active deals (12 total once rate-limit constraints are sorted, currently 7 cached).

## Worked example, a day in Ben's workflow with both systems

**Monday 8am, Ben opens your tool:**
- Asks: "Who should I call today?"
- Your `get-leads/` reads HubSpot Storm Boy contact listing, returns prioritised call list. (Same as today. Unchanged.)
- Ben works through that list, books calls, logs results via your `call-admin/`.

**Monday 10:30am, Ben switches context:**
- Asks: "Any pipeline follow-ups?"
- Your NEW `engaged-pipeline-followups/` reads bus's `deal-signals/`, surfaces 3 deals (Daisy Bank, Rosebank, Hanrahan) with their coaching_mode + next action + customer's last position.
- Ben picks Daisy Bank, clicks through to dashboard's draft email, reviews, sends.
- Dashboard's enablement layer logs the probe to `probe-outcomes/`.

**Tuesday 9am, James Almond replies:**
- Cowork's poll on HubSpot engagement sees the reply within 24h (warm sentiment via Pass 0 distillation).
- Updates `probe-outcomes/probe-<id>.json` with `actual_outcome.outcome_class: "reply_warm"`.
- Writes a new `customer-positions/contact-<james>.json` entry with the reply content.
- Bumps `deal-signals/deal-31711997037.json` from `coaching_mode: stuck_but_live` to `warming`.

**Tuesday 11am, Ben asks Cowork to make a call:**
- Reads the updated deal-signal: "Daisy Bank moved warming, partner alignment landed. Next: book SLA Mapping conversation."
- Your tool surfaces this when Ben asks "what's going on with Daisy Bank?"

The rep got coherent guidance the whole time, working in whichever surface suited each moment. The two systems composed.

## What's in it for your tool

1. **Your tool inherits patterns the dashboard mines.** When the dashboard identifies *"Hobbs's '25% is what stops you carrying the methodology liability for 25 years' frame lands consistently"*, your `/improve` loop on Monday can read it from `patterns/` and roll it into your tool's working memory. No hand-writing.

2. **Your call-admin's writes get amplified.** When Ben logs a call, your write to `customer-positions/` propagates: the dashboard reads it, re-classifies the deal, re-coaches. The next time anyone touches that deal, the new context is present.

3. **Cross-system pattern validation.** A pattern observed only by one system has `confidence: low`. When both systems independently confirm, confidence bumps. The bus is the cross-validation mechanism.

4. **No duplication of work.** Pass 0 distillation of farm-visit transcripts only runs in the dashboard, not in your tool. But the distillates land in `customer-positions/` and your tool reads them. Your tool doesn't need its own distillation pipeline.

## Investigation hooks (questions your agent can answer)

**Q: How is this different from what I'm doing today?**
A: Today your tool runs Motion 1 (Storm Boy outreach). The dashboard adds Motion 2 (Engaged Pipeline Follow-up). Your tool gets a new skill (`engaged-pipeline-followups/`) and writes to two new file paths (`customer-positions/` and `patterns/`). Existing skills unchanged.

**Q: What's the smallest version of this I could ship first?**
A: Just the read side. Add `engaged-pipeline-followups/` that reads `deal-signals/` and surfaces deals. No writes from your tool yet. The dashboard is already writing the bus, so this surface is functional on day one. Write integrations (call-admin, log-idea) can land later.

**Q: What could go wrong?**
A: Three things to plan for:
1. **File contention**, two systems writing the same file simultaneously. Mitigation: atomic writes (`.tmp` + rename) which both systems do.
2. **Bus location**, currently `C:\Dylan PM\shared-growth-memory\` on Dylan's machine. If you run your tool on a different machine, we need a shared substrate (OneDrive sync, network share, or Confluence).
3. **Schema drift**, if your tool's customer-positions structure diverges from the dashboard's. Mitigation: schemas in `schemas/*.md` are the contract; both sides reference them.

**Q: Why filesystem and not Notion or Confluence?**
A: Filesystem is what both Claude Code tools already operate on natively. No third-party auth, no API rate limits. Schemas evolve via simple text edits. We can migrate to Confluence/Notion later if cross-machine sharing becomes critical.

**Q: How does this interact with your existing `/improve` flow?**
A: `/improve` runs Monday morning. After this integration, it should additionally read `shared-growth-memory/patterns/` for any patterns where `surfaced_in_systems` includes `dashboard_coaching` but not yet `claudia_storm_boy_tool`. Append `claudia_storm_boy_tool` once you've validated the pattern fits your tool's view. That's the cross-confirmation mechanism.

**Q: What about `pelican294`? Does the dashboard use Confluence transcripts?**
A: Yes. The dashboard's Pass 0 customer-interaction distillation reads from the four Confluence folders your `pelican294` workflow writes to (Hobbs Calls, Bens Calls, Claudia SB calls, Customer Success Calls). We depend on your pipeline being run. If `state.json` falls behind, we surface fewer recent transcripts. Transparent failure mode, not a blocker.

## Glossary

- **Bus**, `C:\Dylan PM\shared-growth-memory\`, the shared filesystem substrate
- **Motion 1**, Storm Boy outreach, your existing get-leads workflow
- **Motion 2**, Engaged Pipeline Follow-up, the new pipeline-coaching workflow
- **Deal-signal**, multi-signal state of an active deal (one JSON file per deal)
- **Customer-position**, verbatim/distilled customer voice indexed by contact (one JSON file per contact)
- **Pattern**, durable learning (markdown file with YAML front-matter, same shape as your self-improvement logs)
- **Probe**, a low-stakes test the dashboard suggests (e.g., low-pressure check-in) whose outcome resolves deal ambiguity
- **Pass 0**, distillation pass that reads emails/transcripts and outputs structured signal (objections raised, sentiment shift, value props landed)
- **Coaching mode**, the dashboard's classification of why a deal is the way it is (`stuck_but_live`, `cold_loss_imminent`, `mystery_disconnect`, etc.)

## What I'm asking for, in priority order

1. **Read this doc with your agent**, ask whatever questions come up
2. **Tell me if any of the schemas don't fit how your tool actually works.** Schema lock is the next step.
3. **Add the read side first** (`engaged-pipeline-followups/`). Single read, low risk, gives the team a working secondary surface
4. **Add the write side** (`call-admin/`, `log-idea/`) when the read side is proven

Want to chat through it before you start? Happy to jump on for 30 min.

- Dylan
