# Instructions for Claudia's Claude Code — Shared Growth Memory Integration

**Audience:** the Claude Code (or Cowork) session inside Claudia's Storm Boy Tool.
**Goal:** wire automated writes from Claudia's tool into the shared bus so Dylan's dashboard can read every valuable signal her tool generates, and so her tool can read everything Apex generates on Dylan's side.

**Status as of 2026-05-16:** dashboard side wired and pushed. New per-deal/per-contact supplement endpoints are live on Dylan's dashboard (`/api/work/deal-supplements/:id`, `/api/work/contact-supplements/:id`, `/api/work/apex-heartbeat`). Apex daily-enrichment pipeline (Cowork) writes the supplement folders weekdays 13:00 AEST. **Claudia's side is the missing leg of the bidirectional contract.**

---

## 1. The bus location

The bus lives in SharePoint so OneDrive syncs every team member's copy automatically. Resolve the path on Claudia's machine like this:

```
<OneDrive root>\Claude Code Projects\shared-growth-memory\
```

Typical resolved path:
```
C:\Users\<windows-user>\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory\
```

**Discover dynamically** rather than hard-coding — Claudia's `<windows-user>` may differ:

```js
const path = require('path');
const os = require('os');

function busRoot() {
  // 1. Explicit override
  if (process.env.BUS_PATH) return process.env.BUS_PATH;
  // 2. OneDrive-AgriProve sync
  const od = process.env.OneDriveCommercial || process.env.OneDrive
          || path.join(os.homedir(), 'OneDrive - AgriProve');
  return path.join(od, 'Claude Code Projects', 'shared-growth-memory');
}
```

If `busRoot()` doesn't resolve to an existing folder, halt and report. Don't create — Dylan owns the folder structure.

---

## 2. The folder map (where each write goes)

```
shared-growth-memory/
├── README.md                            ← bus contract (read-only)
├── INTEGRATION-FOR-CLAUDIA.md           ← this file
├── sales-motion-separation.md           ← two-motion principle — read first
├── schemas/                             ← write according to these schemas
│   ├── customer-position.md
│   ├── deal-signal.md
│   ├── pattern.md
│   └── probe-outcome.md
├── patterns/                            ← either side writes durable learnings
├── deal-signals/                        ← dashboard writes; tool reads
├── customer-positions/                  ← TOOL WRITES; dashboard reads
├── probe-outcomes/                      ← either side writes/updates
├── deal-supplements/<deal_id>/          ← Apex writes daily; tool MAY write call summaries
├── contact-supplements/<contact_id>/    ← Apex writes daily; tool MAY write call summaries
├── persona-supplements/<rep_slug>/      ← Apex writes; tool can write rep-self learnings
├── team-brain/                          ← dashboard authoritative
│   ├── profiles/<slug>.md
│   ├── distillates/*.json
│   └── objection-plays/*
└── queues/<rep_slug>/work-cards.json    ← dashboard writes nightly; tool reads
```

Folders Claudia's tool **WRITES** to: `customer-positions/`, `probe-outcomes/`, `patterns/`, `deal-supplements/<id>/`, `contact-supplements/<id>/`, `persona-supplements/<rep_slug>/`.
Folders Claudia's tool **READS** only: `deal-signals/`, `team-brain/`, `queues/<rep_slug>/`, `schemas/`.

---

## 3. Atomic writes — non-negotiable

Every write must go via tmp-and-rename so readers never see a partially written file:

```js
function writeAtomic(filePath, content) {
  const tmp = filePath + '.tmp';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}
```

JSON files: `JSON.stringify(obj, null, 2)`. Markdown files: write with `\n` line endings (the bus is normalized to LF via `.gitattributes`).

---

## 4. Triggered automations — what to write when

### 4.1 After a logged call (`call-admin` skill)

When Claudia's tool finishes recording a call, fire three writes in parallel:

**(a) Customer position** — verbatim/distilled customer voice. Per `schemas/customer-position.md`.

```js
const positionFile = path.join(busRoot(), 'customer-positions', `contact-${contactId}.json`);
let rec = fs.existsSync(positionFile)
  ? JSON.parse(fs.readFileSync(positionFile, 'utf8'))
  : { contact_id: String(contactId), positions: [], associated_deal_ids: [] };

rec.positions.push({
  as_of: callTimestamp,                     // ISO-8601
  verbatim_or_distilled: customerLine,      // ≤300 chars; PII-generalised
  is_verbatim: true,
  source: 'call',
  source_id: aircallCallId,                 // for cross-reference
  topic: oneOf([                            // pick best fit; extend the list as patterns emerge
    'partner_alignment','timing','25_year_commitment','revenue_split',
    'competitor_mention','additionality','soil_health','price_friction','other'
  ]),
  sentiment: oneOf(['positive','neutral_warm','neutral','neutral_cool','negative']),
  captured_by: 'claudia_call_admin',
});
// keep at most last 5, plus anything from the last 14 days
rec.positions = pruneToRecent(rec.positions);
rec.last_updated = new Date().toISOString();
writeAtomic(positionFile, JSON.stringify(rec, null, 2));
```

**(b) Call summary into deal AND contact supplements** — so the dashboard's timeline picks it up alongside HubSpot data.

Filename convention: `claudia-call-<YYYY-MM-DD-HHMM>-<short-slug>.md` (timestamp + slug ensures idempotent overwrite when the same call is re-processed).

```js
const callSummary = `---
source: claudia_call_admin
captured_at: ${callTimestamp}
aircall_id: ${aircallCallId}
rep: ${repSlug}
contact_id: ${contactId}
deal_id: ${dealId || 'none'}
sentiment: ${sentiment}
---

# Call summary — ${customerName} · ${callDate}

## Customer's most-impactful line
> ${customerLine}

## Topics covered
- ${topicsArray.join('\n- ')}

## Rep next-step
${repNextStep}
`;

const filename = `claudia-call-${formatStamp(callTimestamp)}-${slugify(customerName)}.md`;

// Write to contact supplements
writeAtomic(path.join(busRoot(), 'contact-supplements', String(contactId), filename), callSummary);

// If linked to a deal, also write there
if (dealId) {
  writeAtomic(path.join(busRoot(), 'deal-supplements', String(dealId), filename), callSummary);
}
```

The dashboard's `/api/work/deal-supplements/:id` and `/api/work/contact-supplements/:id` endpoints will surface this automatically.

**(c) Probe-outcome update** — if the call was a response to a dashboard-suggested probe, close the loop.

```js
const probesDir = path.join(busRoot(), 'probe-outcomes');
const open = fs.readdirSync(probesDir)
  .map(f => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(probesDir, f), 'utf8')) }))
  .filter(p => p.deal_id === dealId && !p.actual_outcome?.detected_at);

if (open.length) {
  const probe = open[0];
  probe.actual_outcome = {
    detected_at: callTimestamp,
    detected_by: 'claudia_call_admin',
    outcome_class: mapSentimentToOutcomeClass(sentiment),  // reply_warm / reply_neutral / reply_cool / reply_negative
    reply_summary: replySummary,  // ≤200 chars
  };
  writeAtomic(path.join(probesDir, probe.file), JSON.stringify(probe, null, 2));
}
```

### 4.2 After `log-idea` (rep articulates a pattern)

When a rep says something like *"every farmer who mentions their accountant slows down at SLA"*, capture it twice: once in Claudia's local brain-dump, once in the shared bus as a pattern.

Per `schemas/pattern.md`:

```js
const slug = `${todayISO()}-${slugify(title)}`;
const fmObj = {
  title,
  category: 'tactical_play',        // tactical_play | tactical_framing | strategic_finding | hypothesis
  confidence: 'low',                // start as hypothesis
  written_at: new Date().toISOString(),
  sources: ['claudia_storm_boy_tool/log-idea'],
  evidence: [repQuote],
  applicability,
  surfaced_in_systems: ['claudia_storm_boy_tool'],
};
const body = `---\n${yaml.stringify(fmObj)}---\n\n# ${title}\n\n${narrative}\n`;
writeAtomic(path.join(busRoot(), 'patterns', `${slug}.md`), body);
```

When the dashboard's next coaching run sees corroborating evidence across multiple deals, it will append `dashboard_coaching` to `surfaced_in_systems` and bump `confidence`. Two systems independently confirming = high-confidence pattern.

### 4.3 During the daily session for a given rep

When a rep opens Claudia's tool, the tool can surface today's work by reading:

```js
const queueFile = path.join(busRoot(), 'queues', repSlug, 'work-cards.json');
if (!fs.existsSync(queueFile)) return { stale: true, cards: [] };
const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
// queue.last_updated, queue.cards = [...]
```

Dashboard writes this every night at 05:00 SAST. Treat as read-only.

For each open card, the tool can ALSO pull deal-context from the dashboard's HTTP API if it's running on Dylan's machine:
- `GET http://<dylan-host>:3401/api/work/deal-supplements/<deal_id>` — latest signal per deal
- `GET http://<dylan-host>:3401/api/work/apex-heartbeat` — confirm Apex's data is fresh

If the dashboard isn't reachable, fall back to reading the bus folders directly — same data is on disk.

### 4.4 When a rep articulates self-improvement (their own working style)

When a rep tells the tool *"I want to remember that when I open with X, the customer responds with Y"* — that's persona evolution. Write to `persona-supplements/<rep_slug>/`:

```js
const filename = `tool-self-observation-${todayISO()}-${slugify(short)}.md`;
const body = `---
source: claudia_storm_boy_tool/self_observation
captured_at: ${new Date().toISOString()}
rep: ${repSlug}
---

# ${title}

${narrative}
`;
writeAtomic(path.join(busRoot(), 'persona-supplements', repSlug, filename), body);
```

Dashboard's persona-builder will read this on the next `/api/brain/refresh-persona/${repSlug}` and fold it into the rep's profile in `team-brain/profiles/<slug>.md`.

---

## 5. Idempotency rules

- **Same source-window + same artifact = same filename = overwrite.** A re-processed Aircall transcript for the same call must produce the same filename, so re-running on the same day doesn't accumulate dupes. Use deterministic naming: `claudia-call-<callTimestamp>-<contactSlug>.md` (timestamp + slug both come from the source record).
- Last-write-wins on `customer-positions/` and `deal-signals/`. Schemas are designed so both sides write complementary fields — collisions are usually safe.
- For `probe-outcomes/`: probe_id is assigned by the dashboard at creation. Tool updates merge into the existing file by reading-modifying-writing atomically.

---

## 6. Slug & owner conventions

The bus maps HubSpot owner IDs to slugs. Hard-code these into Claudia's tool:

| Slug | HubSpot owner | Active |
|---|---|---|
| `hobbs` | `361236574` | ✓ |
| `ben` | `76812243` | ✓ |
| `claudia` | `78272376` | ✓ |
| `will` | `361823546` | ✓ |
| `dylan-jones` | `401770537` | ✓ |
| `harrison-inactive` | `145644281` | ✗ |

Slug generation for filenames: lowercase, hyphenated, ASCII only. `"Daisy Bank · QLD"` → `daisy-bank-qld`. Strip apostrophes, accents, punctuation.

---

## 7. What Dylan's side writes (so the tool can consume)

Apex (Cowork-side automation, weekdays 13:00 AEST) writes:

| File | Path | Use case for Claudia's tool |
|---|---|---|
| Aircall transcript | `contact-supplements/<contact_id>/confluence-aircall-<YYYY-MM-DD-HHMM>-<slug>.md` | Surface "recent calls with this contact" inline |
| Teams message bundle | `deal-supplements/<deal_id>/teams-deals-channel-<YYYY-MM-DD>.json` | Surface "what was said in Deals channel this week" |
| Email | `deal-supplements/<deal_id>/outlook-email-<YYYY-MM-DD>-<slug>.md` | Surface "email exchanged with rep on this deal" |
| Granola meeting | `contact-supplements/<contact_id>/granola-meeting-<YYYY-MM-DD>-<slug>.md` | Surface "meeting transcript with this contact" |
| Farm visit transcript | `persona-supplements/hobbs/confluence-farmvisit-<YYYY-MM-DD>-<slug>.md` | Hobbs-only — feeds his persona |
| HubSpot engagement snapshot | `contact-supplements/<contact_id>/hubspot-engagement-snapshot-<YYYY-MM-DD>.json` | Background context — last activity, last sent email |
| Heartbeat | `apex-runs.log` (single-line append per run) | Confirm Apex is alive before using its data |

**Heartbeat check** before relying on this data:

```js
const log = path.join(busRoot(), 'apex-runs.log');
if (fs.existsSync(log)) {
  const lastLine = fs.readFileSync(log, 'utf8').trim().split(/\r?\n/).pop();
  // format: "2026-05-16T03:00:00Z · daily-enrichment · deals=128 contacts=1523 ..."
  const ts = Date.parse(lastLine.split('·')[0].trim());
  if (Date.now() - ts > 36 * 3600 * 1000) console.warn('Apex stale >36h — data may be old');
}
```

---

## 8. Sensitivity rules — PII generalisation

Both systems must generalise before writing. Hard rules:

- **Customer full names** → first name + property/business surname when material; "the contact" otherwise. Never write phone numbers, emails, addresses, exact financials into customer-positions or patterns. The contact_id is the join key.
- **Revenue / ACCU figures** → ratios, percentages, multipliers. Never absolute dollars or absolute carbon units.
- **Methodology IP** → category-level ("the 25-year baseline tooling"), not internal product code names.
- **Other reps' performance** → category ("a senior rep"), not named — unless explicitly attributed in a public artifact.

When unsure, over-strip and flag for Dylan rather than write. Patterns can be sanitised post-hoc; verbatim customer voice can't easily un-leak.

---

## 9. Verification — how to confirm the wiring works

After implementing each automation, verify end-to-end:

### Verify call-admin write

1. Log a test call via Claudia's tool against a known contact (e.g. `109483813745`).
2. From any machine with the bus synced: `ls <bus>/contact-supplements/109483813745/` — should contain `claudia-call-*.md` written within the last minute.
3. From Dylan's dashboard host: `curl http://localhost:3401/api/work/contact-supplements/109483813745` — should return the file in the listing with full content.
4. From Dylan's dashboard host: `curl http://localhost:3401/api/work/deal-supplements/<deal_id>` if the contact has an associated active deal — file should appear there too.

### Verify pattern write

1. Trigger `log-idea` with a clearly novel pattern.
2. `ls <bus>/patterns/` — should contain a new `<YYYY-MM-DD>-<slug>.md`.
3. Dashboard `/api/brain/refresh-persona/<owner-rep>` or the next nightly run will pick it up. Patterns surface in Dashboard's Patterns tab within ~24h.

### Verify customer-position write

1. After a call, check `<bus>/customer-positions/contact-<id>.json` — should have a new entry in `positions[]` with `captured_by: claudia_call_admin`.
2. Dashboard's next coaching refresh (`POST http://localhost:3401/api/coaching/refresh`) will re-classify the deal using the new position.

---

## 10. Open coordination questions (raise back to Dylan when you have a position)

These are unresolved between the two systems. Don't block — write per the conventions above and we'll converge:

1. **Transcript-analysis duplication** — Claudia's ACORE pipeline and Apex's Confluence sweep both analyse the same Aircall transcripts. Decide between consolidated output vs. parallel-with-distinct-framings.
2. **Cadence alignment** — Claudia's ACORE runs every 2 days; Apex runs daily weekdays. Either is fine; the bus tolerates both.
3. **Confluence-as-storage** — is Confluence under the Stormboy folder a better home for some shared learnings than SharePoint? Markdown patterns specifically might live better there. SharePoint stays canonical for high-frequency JSON.
4. **Schema evolution** — if a new write doesn't fit existing schemas, add a new schema file in `schemas/` and a corresponding write-target folder. Coordinate with Dylan before introducing a new top-level folder.

---

## 11. Failure modes to design against

- **OneDrive sync conflict** — same file written from both sides within seconds. Effect: OneDrive creates `<file> (Conflict — <user>).<ext>`. Recovery: human merges. Mitigation: Claudia's tool and Dylan's dashboard write different field-sets to the same file (call data vs. email data on a customer-position), so two-sided collisions are rare and usually safe.
- **OneDrive offline** — write succeeds locally; sync pending. Effect: other side doesn't see it until reconnect. Mitigation: writes are idempotent; on reconnect they sync naturally.
- **Bus folder missing** — `busRoot()` resolves to a non-existent path. Effect: writes fail. Mitigation: halt and report to Dylan rather than auto-creating; the structure is owned by the dashboard side.
- **Schema drift** — Claudia's tool writes a `customer-position` with a new field the dashboard doesn't expect. Effect: dashboard ignores the field harmlessly. Treat all schema fields as additive; never repurpose existing ones.

---

## 12. Reading order for orientation

When the Claude Code session inside Claudia's tool boots up for the first time, walk these in order:

1. `README.md` — bus contract
2. `sales-motion-separation.md` — Storm Boy outreach vs. Engaged Pipeline Follow-up (two distinct motions, must not be merged)
3. This file (`INTEGRATION-FOR-CLAUDIA.md`)
4. `schemas/*.md` — the four canonical schemas
5. `team-brain/README.md` — how the brain is structured (read-only from Claudia's side)
6. `team-brain/ask-team-skill-template.md` — reference implementation if Claudia wants to add `/ask-team` to her tool

After reading: implement the four triggered automations in §4 (call-admin write, log-idea write, daily-queue read, self-observation write), wire the atomic-write helper from §3, and run the verifications in §9.

---

**Contact:** Dylan (`dylan@agriprove.io`). The dashboard side is in active development; expect changes to schemas and folder conventions. Pull this file fresh from the bus before any major implementation pass.

— Dylan + the dashboard
