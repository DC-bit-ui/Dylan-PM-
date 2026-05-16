# Update for Claudia — 2026-05-13

This is an **addendum** to `to-claudia-system-context.md` (sent 2026-05-11). Read that one first if you haven't. This update captures what's landed in the system since, and what Dylan is asking from you now.

---

## 📨 Cover message (copy-paste into Teams)

> Hey Claudia, quick update on the conversion-tracker system. A lot has shipped since I first sent you context two days ago — the ASK Hobbs interface is now live, the team-brain (profiles + distillates) is mirrored to the bus so your tool can read it, and per-rep work-card queues are now being written nightly into the bus for each of us. The big thing I need from you is to **(a) confirm where in SharePoint we should land the bus folder so OneDrive syncs it across the team's machines, and (b) plug a small `/ask-team` skill into your tool so reps can query the brain from inside their workflow.** I've left the skill template in the bus at `team-brain/ask-team-skill-template.md`. The folder is currently at `C:\Dylan PM\shared-growth-memory\` on my machine — once we agree the SharePoint location, I'll move it there and we'll both point at the synced copy. Want to chat for 20 mins on Wednesday?

---

## 🤖 How to use this document

Same as last time. Hand this + the original `to-claudia-system-context.md` + the bus's `README.md` + `INTEGRATION-FOR-CLAUDIA.md` to your Cowork or Claude Code session and ask it to walk you through the current state. Everything is grounded in real files; your agent can verify by reading them.

---

## What's changed since 2026-05-11

### 1. ASK Hobbs is real

There's now a natural-language query interface against the team brain. A rep types a question; the system answers with verbatim quotes from Hobbs's profile + distillates + Ben + your profile + Will's profile.

- Lives at `http://localhost:3401/v2#ask` (on Dylan's machine for now; portable to yours via the `/ask-team` skill below).
- Multi-turn conversation memory works — follow-ups reference prior answers.
- Anthropic prompt caching keeps cost bounded — first turn full price, subsequent turns 10%.
- Cost per question ≈ $0.005 (Haiku). 50 questions/day across team = $0.25/day.

**Why this matters for your tool:** every rep query against the brain is happening in the dashboard right now. If you add a parallel `/ask-team` skill to your tool, reps can stay in-flow and ask the brain without context-switching.

### 2. The team brain is now in the bus

Four profiles + the Hobbs distillates are mirrored at `shared-growth-memory/team-brain/`:

```
team-brain/
├── README.md
├── ask-team-skill-template.md     ← reference implementation for /ask-team
├── profiles/
│   ├── hobbs.md (23KB) · ben.md (24KB) · claudia.md (13KB) · will.md (18KB)
└── distillates/
    ├── hobbs-farm-visits.json     ← 6 farm visits, 47 topic distillates
    └── hobbs-calls.json           ← 6 Aircall calls, 14 topic distillates
```

**Authoritative source:** the dashboard at `stormboy-tracker/coaching/`. These files are mirrored here on each nightly scheduler run. Treat the bus copy as read-only from your tool's perspective.

**Ben's profile was updated today (2026-05-13)** with his validated curiosity-frame cold-open pattern. That's the kind of update that flows automatically — your tool will see fresh content as Dylan adds to the brain.

### 3. Per-rep queue files now exist

Every night at 05:00 SAST, the dashboard runs a full diagnosis pipeline across:
- The top 20 active deals
- All farm-visit-completed + stalled-in-conversation contacts
- All upcoming farm visits

Then it buckets the diagnosed cards by HubSpot owner and writes one file per rep at:

```
shared-growth-memory/queues/
├── ben/work-cards.json          (28 cards)
├── hobbs/work-cards.json        (15 cards)
├── claudia/work-cards.json      (when you own contacts/deals)
├── will/work-cards.json
├── dylan-jones/work-cards.json
└── INDEX.json                   (cross-rep summary)
```

Each card includes: heat, kind, title, next-step (short + qualifier), full 3-step diagnosis, HubSpot URL, assessment tag.

**Why this matters:** when reps land in your tool on a morning, the tool can read their queue file and surface "here's today's work" — without anyone clicking refresh. This is the bridge between the dashboard and the rep's workflow.

### 4. Ben validated the integration vision

Yesterday's chat with Ben (transcript: Granola `df155d74`, 2026-05-13). Ben saw the dashboard pull in his real activity (a contact he called that morning), reacted "*just like big brother stuff. Wow*," and immediately asked *"this is something we plug into from here?"* — meaning his Claude Code. The per-rep queue path is what he was asking for.

He's also going to share three docs that need to land in the bus when they arrive:

1. Ben's Claude-built objection-handling-in-order doc
2. SharePoint FAQ doc
3. A Hobbs-authored X-Factor objection-handling doc (Ben's note: *"there might be some colourful responses on that one"*)

When these arrive, slot into `team-brain/objection-plays/` (new folder). The brain will get materially sharper at the exact thing reps query most.

---

## What I heard from our 12-May chat (and how the system reflects it)

Quick acknowledgement of what you told me before you had to run:

**Your ACORE transcript pipeline is already analysing the same source the dashboard's `team-brain/distillates/hobbs-calls.json` came from.** Both systems are reading from Confluence and pulling trends. Concrete risk of duplication. I'd value 10 minutes Wednesday to map what each side currently produces from those transcripts, so we can decide:

- Do we consolidate to one analysis output (your tool's or the dashboard's)?
- Or do we keep two parallel outputs with different framings (yours = cold-outreach patterns; mine = pipeline-coaching distillates)?

I lean toward the second — they're answering different questions — but worth confirming.

**Token efficiency was your stated #1 priority.** I've designed accordingly:

- Reads from the bus are filesystem-only — zero API cost.
- The `/ask-team` skill template uses Anthropic prompt caching: the 30K-token brain sits in a `cache_control: ephemeral` block, so first turn pays full price, every subsequent turn within ~5 min pays 10%. A 10-turn conversation goes from ~$0.05 to ~$0.007.
- Disclosure on the dashboard side: my nightly batch (deals + contacts + brain sync + queue build) costs ~$0.25/day. I'm logging it explicitly so we can see total team spend against the $20/month shared subscription.

**I raised the "vibe zone" as a possible landing spot for the dashboard.** That's an internal question on my side, not for you to answer — flagging it here only so the surface boundaries are clear: your tool is in-flow rep workflow; the dashboard is standalone analytics + diagnosis. Each surface serves a different moment.

**I pointed you at the `/Agriproof backend` shared skill** for the HubSpot field schemas — wanted to flag that the dashboard hasn't yet consumed those schemas. If you've already wired them into your tool, worth comparing what each side maps so we don't define them twice.

---

## Who writes what (so we don't double-up)

| Surface | Written by | Read by | Cadence |
|---|---|---|---|
| `shared-growth-memory/patterns/*.md` | Either system | Both | On-demand |
| `shared-growth-memory/deal-signals/*.json` | Dashboard (from active.json) | Claudia's tool when surfacing pipeline context | Nightly |
| `shared-growth-memory/probe-outcomes/*.json` | Either system after an action | Both for diff/learning | On-action |
| `shared-growth-memory/customer-positions/*.json` | Mostly Claudia's tool (from call admin) | Dashboard's ASK + diagnoses | On-call |
| `shared-growth-memory/team-brain/profiles/*.md` | Dashboard (authoritative) | Both | On-edit + nightly mirror |
| `shared-growth-memory/team-brain/distillates/*.json` | Dashboard (authoritative for now) | Both | On-edit + nightly mirror |
| `shared-growth-memory/queues/<rep>/work-cards.json` | Dashboard (nightly batch) | Each rep's Claude Code via your tool | Nightly |

**What neither system should do** (anti-duplication boundaries):

- Neither system should overwrite the other's HubSpot data. The dashboard is read-only on HubSpot; your tool's writes (call admin, status updates) are the source of truth for activity.
- The dashboard owns pipeline-stage analysis (era stats, conversion times, deal diagnoses). Your tool owns call-volume + outreach-rate metrics. Both can read each other's outputs; neither should re-derive the other's.
- Transcript distillation: open question (covered above). Let's decide Wednesday.

## What I'm asking you for

### Priority 1 — Confirm the SharePoint location for the bus

The bus is currently at `C:\Dylan PM\shared-growth-memory\` on my machine. For accessibility across the team, it needs to live in a SharePoint folder that OneDrive syncs to everyone's machine.

**My proposed location** (subject to your sign-off):

```
SharePoint:  Claude Code Projects/shared-growth-memory/
OneDrive:    C:\Users\<rep>\OneDrive - AgriProve\Claude Code Projects\shared-growth-memory\
```

This sits parallel to your `Claude Code Projects/Storm Boy Claude Tool/` folder. Each rep already has the parent folder syncing via OneDrive.

**Once you confirm**, I'll:

1. Copy the contents of `C:\Dylan PM\shared-growth-memory\` into the SharePoint folder (preserving structure).
2. Update the dashboard's `.env` to point `BUS_PATH=<my local OneDrive sync path>`.
3. Verify a test write from my side becomes readable on your side within ~1 minute.
4. Post in the Stormboy Deals Teams channel so all reps know it's live and how to use it.

**OneDrive sync delay** is typically seconds-to-minutes. Writes use atomic write (tmp + rename) so partially-written files never appear to readers. Conflicts are rare given the file-per-entity scheme (one file per pattern, one per deal-signal, etc.).

### Priority 2 — Add the `/ask-team` skill to your tool

Reference implementation is at `team-brain/ask-team-skill-template.md`. The summary:

- Skill takes a question + optional context tag
- Loads `team-brain/profiles/*.md` + `team-brain/distillates/*.json`
- Builds a prompt with the brain as a `cache_control: ephemeral` system block (so multi-turn is cheap)
- Calls Anthropic Messages API (Haiku by default)
- Maintains conversation history per session (last 10 turns)
- Outputs `{answer, sources, confidence}` for the rep to act on

Reps inside your tool can then ask:
- *"Pre-call prep for a NSW grazier"*
- *"A prospect just said 25% is too high — what's the move?"*
- *"What was Hobbs's framing on the additionality objection?"*
- *"What did Ben say at the standup last week about nurture-back?"*

The dashboard's `ask.js` is the working reference implementation. I can walk through it with you if useful.

### Priority 3 — Mark which queue belongs to your tool

Your tool runs each rep's session under their own identity. When a session opens for a given rep, the tool can read `shared-growth-memory/queues/<rep_slug>/work-cards.json` and surface those cards in their workflow.

The slug-to-owner mapping I've set is:

| Slug | HubSpot owner | Active |
|---|---|---|
| `hobbs` | 361236574 | ✓ |
| `ben` | 76812243 | ✓ |
| `claudia` | 78272376 | ✓ |
| `will` | 361823546 | ✓ |
| `dylan-jones` | 401770537 | ✓ |
| `harrison-inactive` | 145644281 | ✗ (orphaned deals — flag for reassignment) |

If any of these is wrong, let me know and I'll adjust the map in `coaching/engine/rep-queues.js`.

### Priority 4 — Tell me where Ben should drop the three docs

When Ben shares his objection-handling docs (likely Teams chat or a SharePoint location), where should they land so my system can ingest them? Two options:

a) **Send the files to me directly** — I add them to `coaching/` and the nightly scheduler mirrors them into `team-brain/` automatically.

b) **You take them into your tool's territory** (you already have an objection-handling workspace) — and I read from a shared location.

I lean toward (a) for now because the dashboard owns the team-brain authoritative copy and your tool reads from the bus. But happy to invert if it fits your workflow better.

---

## What's working between our two systems today

- **Read substrate is real.** `team-brain/` exists, your tool can read from there once the SharePoint move is done.
- **Write substrate has shape but is one-way.** The dashboard writes patterns + deal-signals + probe-outcomes + per-rep queues + brain mirrors. Your tool reads from these. The reverse channel (your tool writing learnings back) exists in the schemas but hasn't been exercised yet. We can wire it the moment you have writes you want to send.
- **The contract is in three files**, and they're all in the bus:
  - `README.md` — what the bus is
  - `INTEGRATION-FOR-CLAUDIA.md` — your tool's integration points
  - `team-brain/README.md` — the brain contract specifically

---

## Open questions I'd value your view on

1. **SharePoint location** — is `Claude Code Projects/shared-growth-memory/` the right home, or do you have a stronger preference?
2. **Transcript-analysis duplication** — your ACORE pipeline + my distillates pipeline both analyse the same Confluence transcripts. Consolidate to one, or keep both with distinct framings? My lean is two parallel outputs (yours = cold-outreach patterns, mine = pipeline-coaching distillates) but want your read.
3. **Cadence alignment** — your analysis runs every 2 days; my scheduler runs daily. Should I drop to 2-day to align, or keep daily and just write to the same bus location (no actual conflict either way)?
4. **The shared-learnings location** — is Confluence (under the Stormboy folder) a better home for shared learnings than SharePoint? Your system already writes there; reps already browse there; markdown renders natively. I'd keep the high-frequency JSON (deal-signals, per-rep queues, distillates) on SharePoint/filesystem for speed, but markdown learnings + profiles could live in Confluence as the canonical source. Walk me through where your system currently writes so we can converge.
5. **HubSpot schema reuse** — your `/Agriproof backend` skill has the field definitions. Where does it live so the dashboard can reference the same schema rather than defining its own?
6. **`/improve` Monday outputs** — does that cycle already produce learnings that should land in `shared-growth-memory/patterns/`? What's the lift to wire it?
7. **Data-quality punch list** — 15 of 24 Storm Boy contacts the dashboard diagnosed came back `heuristic_was_wrong` because of data hygiene (out-of-catchment, missing visit notes, duplicate records). Want me to surface this as a "data-quality work" view in the dashboard so it routes to whoever owns the clean-up? Or is this work already in your tool's lane?

Happy to chat Wednesday at a time that works. The system is moving fast — I'd rather sync now than have us drift.

— Dylan
