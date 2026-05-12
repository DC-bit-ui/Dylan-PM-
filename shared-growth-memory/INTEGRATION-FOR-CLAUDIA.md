# Integration Guide — Claudia's Storm Boy Claude Tool

This doc is for **you, Claudia**. The dashboard side of the shared bus is wired. To make it bidirectional — the principle Dylan called out as essential ("these systems cannot live in isolation") — your tool needs to **read** the bus when working on a contact/deal, and **write** to it after each customer interaction.

> **⚠ Read this first:** [`sales-motion-separation.md`](sales-motion-separation.md)
>
> Two parallel sales motions: **Storm Boy outreach** (your `get-leads/` — primary queue, cold-call to scraped leads, Hobbs-on-farm-targeted) and **Engaged Pipeline Follow-up** (NEW — secondary queue, re-engaging existing pipeline deals using accumulated learnings).
>
> **Do NOT fold dashboard deal-signals into `get-leads/`.** They are a different motion with different KPIs. Storm Boy targets (call volume, farm visits booked) must not be polluted by pipeline re-touches. The integration creates a **separate secondary surface**, not a merged list.

## What the dashboard already writes here

Every time the dashboard's coaching pipeline runs against live HubSpot data, it writes:

- `deal-signals/deal-<deal_id>.json` — one per active deal coached. Multi-signal state (stage health, engagement health, content health), coaching mode, active probes, gaps in our data, next recommended action.
- `patterns/*.md` — durable learnings the system has identified. Same shape as your own `cross-project-shared/self-improvement/` files would be.
- `probe-outcomes/probe-<id>.json` — every probe the dashboard suggests creates a record; outcome populated when the customer responds (or doesn't).
- `customer-positions/contact-<contact_id>.json` — verbatim customer language pulled from farm-visit transcripts.

You can `cat` any of these files to verify what's there now.

## What your tool should do — three integration points

### 1. NEW skill: `engaged-pipeline-followups/engaged-pipeline-followups.md` — secondary queue, separate from `get-leads/`

This is a **new skill, parallel to `get-leads/`** — not a modification to it. Reps should be able to ask for two distinct things:

| Rep says | Routes to | Reads from | Motion |
|---|---|---|---|
| *"who should I call today"* | `get-leads/` (existing) | HubSpot Storm Boy contact listing | Motion 1 (Storm Boy outreach) |
| *"any pipeline follow-ups"* / *"what engaged pipeline deals need attention"* / *"who in the sales pipeline needs a touch"* | `engaged-pipeline-followups/` (NEW) | `shared-growth-memory/deal-signals/` | Motion 2 (Engaged Pipeline Follow-up) |

**Implementation sketch** for the new skill:

```js
// engaged-pipeline-followups/engaged-pipeline-followups.md
//
// Surface dashboard-derived re-engagement opportunities for deals already
// in the sales pipeline. Reads deal-signals from the shared bus. Does NOT
// pull from Storm Boy contact lists — that's get-leads/'s job.

const fs = require('fs');
const path = require('path');

const SIGNALS_DIR = 'C:\\Dylan PM\\shared-growth-memory\\deal-signals';

function getCurrentUserOwnerId(/* from session */) { /* ... */ }

function pipelineFollowups() {
  const ownerId = getCurrentUserOwnerId();
  const files = fs.readdirSync(SIGNALS_DIR).filter(f => f.endsWith('.json'));
  const signals = files.map(f => JSON.parse(fs.readFileSync(path.join(SIGNALS_DIR, f), 'utf8')));

  // Filter to deals owned by this user; sort by coaching_mode priority
  const priority = {
    stuck_but_live: 1,
    mystery_disconnect: 2,
    partner_alignment_blocked: 3,
    early_warning: 4,
    cooling: 5,
    cold_loss_imminent: 6,
    healthy_progression: 99
  };

  return signals
    .filter(s => s.owner_id === ownerId)  // when dashboard writes owner to deal-signals (small follow-up)
    .sort((a, b) => (priority[a.coaching_mode] || 99) - (priority[b.coaching_mode] || 99));
}
```

**Surface format** (in your tool's chat output):
```
> Engaged pipeline follow-ups (3) — separate from your Storm Boy call list
>
> 1. James Almond — Daisy Bank · KCT Issued (426d, RED) · STUCK BUT LIVE
>    Last from customer (23d ago): "Thanks for the update Ben — the wife
>    and I are talking it through over Easter. I'll get back to you in early May."
>    Next: Send low-pressure check-in. Draft ready in dashboard.
>    [Open in HubSpot] [Open dashboard probe draft]
>
> 2. Will McLachlan — Rosebank · KCT Issued (287d, RED) · STUCK BUT LIVE
>    Next: 21-day countersign deadline. Copy agronomist who mapped the property.
>    [Open in HubSpot] [Open dashboard]
>
> 3. ...
```

The trigger phrases should make clear this is a **secondary list, not the Storm Boy queue**. Reps explicitly choose which motion they're working on right now.

### 2. `call-admin/stormboy-call-admin.md` — write customer-positions + update probe-outcomes

When the rep logs a call via your tool's call-admin flow, your skill already produces a structured record. **Add two writes**:

**(a) Write a customer position:**
```js
const positionFile = `C:\\Dylan PM\\shared-growth-memory\\customer-positions\\contact-${contactId}.json`;
let record;
if (fs.existsSync(positionFile)) record = JSON.parse(fs.readFileSync(positionFile));
else record = { contact_id: contactId, positions: [], associated_deal_ids: [] };

record.positions.push({
  as_of: callTimestamp,
  verbatim_or_distilled: "<the customer's most-impactful line from the call, ≤300 chars, PII-generalised>",
  is_verbatim: true,
  source: "call",
  source_id: aircallCallId,
  topic: "<one of: partner_alignment | timing | 25_year_commitment | revenue_split | competitor_mention | etc.>",
  sentiment: "<positive | neutral_warm | neutral | neutral_cool | negative>",
  captured_by: "claudia_call_admin"
});
// truncate to last 5 + anything in last 14 days
record.last_updated = new Date().toISOString();
fs.writeFileSync(positionFile + '.tmp', JSON.stringify(record, null, 2));
fs.renameSync(positionFile + '.tmp', positionFile);
```

**(b) If the call was a response to a recent probe, update the probe outcome:**
Check `probe-outcomes/` for any probe targeting this deal with `actual_outcome` not yet populated:
```js
const probes = fs.readdirSync('C:\\Dylan PM\\shared-growth-memory\\probe-outcomes')
  .map(f => JSON.parse(fs.readFileSync(`C:\\Dylan PM\\shared-growth-memory\\probe-outcomes\\${f}`)))
  .filter(p => p.deal_id === dealId && !p.actual_outcome?.detected_at);

if (probes.length > 0) {
  const probe = probes[0];
  probe.actual_outcome = {
    detected_at: callTimestamp,
    detected_by: "claudia_call_admin",
    outcome_class: "<reply_warm | reply_neutral | reply_cool — based on call sentiment>",
    reply_summary: "<≤200 chars summary of what the customer said on the call>"
  };
  // atomic write back
}
```

This closes the loop: the dashboard suggested a probe → rep called the customer → your tool records the outcome → the dashboard's next coaching run reads it and re-classifies the deal.

### 3. `log-idea.md` — write patterns when reps articulate a new insight

When the rep says something like *"Just noticed every farmer who mentions their accountant slows down at SLA — should we get accountants involved earlier?"*, that's a pattern observation.

Currently your skill captures these into your own brain-dump. **Also write to shared patterns/**:

```js
const slug = `${date}-${slugify(title)}`;
const filePath = `C:\\Dylan PM\\shared-growth-memory\\patterns\\${slug}.md`;
const fm = {
  title: "...",
  category: "tactical_play | tactical_framing | strategic_finding | hypothesis",
  confidence: "low",  // start as hypothesis; bumps to moderate/high if dashboard's data corroborates
  written_at: new Date().toISOString(),
  sources: ["claudia_storm_boy_tool/log-idea"],
  evidence: ["<the rep's quote or context>"],
  applicability: ["<where this might apply>"],
  surfaced_in_systems: ["claudia_storm_boy_tool"]
};
// write atomically
```

The dashboard reads these on each pipeline run. If the dashboard's data confirms the pattern across multiple deals, it appends `dashboard_coaching` to `surfaced_in_systems` and bumps `confidence`. Two systems independently confirming = high-confidence pattern.

## Conflict handling

Last-write-wins for `deal-signals/` and `customer-positions/`. If your tool and the dashboard both write to the same file, the later timestamp wins — but our schemas are designed so both should be writing complementary updates (you write call-derived data, dashboard writes email/farm-visit-derived data).

For `patterns/`: each pattern has a unique slug. No collision. If you write the same pattern title separately, it gets a different dated slug; cross-references via `also_observed_by` link them.

For `probe-outcomes/`: probe_id is assigned at creation. Updates merge into the existing file. Both your tool and the dashboard can update the same probe (different fields).

## Atomic writes — important

Always write to `<file>.tmp` then rename. Otherwise readers can see half-written JSON:
```js
fs.writeFileSync(filePath + '.tmp', content);
fs.renameSync(filePath + '.tmp', filePath);
```

## How to verify it works

After your skill writes a customer-position:
1. Run the dashboard's coaching refresh (POST /api/coaching/refresh)
2. The deal-signal for that customer's deal should now include the new position in its content signal
3. The Plays tab on the dashboard should show "Latest from customer" pulled from your write

After your skill writes a pattern:
1. Within ~5 seconds (no polling lag — filesystem is shared)
2. The dashboard's Patterns tab should show the new learning in its "Recent system learnings" section

## What's NOT in the bus (and why)

- **Customer PII** (full names, addresses, exact financial figures) — both systems must generalise before writing. The schemas explicitly require PII generalisation.
- **HubSpot deal records** — those are the source of truth; we don't duplicate. Both systems READ HubSpot independently.
- **Aircall transcripts** — those live in Confluence (via your `pelican294` workflow). We reference them by Confluence page ID in customer-positions records.
- **Frontier (HORIZON Snapshot generation)** — that's a separate spatial app. When the dashboard recommends a HORIZON Snapshot, it surfaces an "Open in Frontier" link, not a Cowork delegation.

## Coordination

When you have a moment, let me know if anything in the schemas needs adjustment for how your tool actually works. The dashboard side is wired and will write to the bus on every coaching run — but until your tool also writes, the bus is effectively one-direction.

The shared assumption: we're building one coherent system that happens to have two execution surfaces (your tool for daily rep workflow, the dashboard for pipeline visibility + leadership). The bus is what makes them coherent.

— Dylan + the dashboard
