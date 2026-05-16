# Claudia Bryant — Profile

**Status:** Active capture. Claudia's primary contribution to the sales motion is meta — she builds the operating system the rest of the team uses. Her direct calling is occasional. Her tool's output is everyone else's input.
**Last updated:** 2026-05-12

**Role context:**
- Growth — operations + Claude Code automation system builder
- Owner of the Storm Boy Claude Tool (SharePoint: `Claude Code Projects/Storm Boy Claude Tool/`)
- Active rep alongside being the tool builder (occasional Storm Boy outreach calls)
- Runs the `/improve` weekly cycle that hardens the tool against rep feedback

**Sources so far:**
- Her Storm Boy Claude Tool's `CLAUDE.md` (read in full — captures her routing philosophy + workspace architecture)
- 1 distilled Aircall transcript: Xavier Burton 2026-04-08 (5m 39s outbound, visit booked successfully)
- Standup contribution 2026-04-24 (her articulation of the lead-scraper / lead-assessment tooling, vulnerability about a hard week with farmers, plus the Aircall API problem she later solved)
- Dashboard roster entry (Storm Boy Claude Tool location + active-rep-alongside-building framing)
**Sources pending:**
- More Claudia SB calls if more land in Confluence (currently only 1 in folder)
- Her self-improvement weekly logs (where she captures friction + improvement ideas)
- Direct interview about her tool-design philosophy and what's worked / failed

---

## How this profile differs from Hobbs's and Ben's

Hobbs's profile = digital replica (capture before he leaves).
Ben's profile = performance profile (what he does well + gaps).
**Claudia's profile = operating model.** Her contribution isn't a sales motion to replicate; it's a system that compounds the team's effectiveness. The right question for Claudia isn't *"how does she sell?"* but *"how does her tool make everyone else better?"*

Two consequences:

1. **The artifact IS the profile.** Her Storm Boy Claude Tool is the deliverable. This document is a description of how she's built it.
2. **Her call style is a calibration data-point, not the central output.** Useful to know (and a small upgrade signal for Ben's calls) but not the primary thing to capture.

---

## Her tool philosophy (what makes the Storm Boy Claude Tool work)

Pulled from her CLAUDE.md routing patterns + structural choices.

### 1. Per-user preferences as a first-class concept

The tool loads user-specific preferences before every routing decision:

> *"This is a personal team tool. Each person runs it on their own machine. Before routing to any workspace, establish who the user is using the session email — the email prefix maps directly to their user folder."*

Claudia treats the team as individual operators with individual style preferences, not as a homogeneous mass. The tool reflects this — `cross-project-shared/users/[folder]/preferences.md` per person.

**Implication for the wider system:** when the dashboard surfaces coaching, it should respect rep-specific preferences. Ben's coaching style ≠ Claudia's ≠ Hobbs's. The shared bus's pattern files should be readable through a personalisation layer.

### 2. Workspaces, not features

The tool isn't a list of features; it's a list of workspaces (Research Leads, Text Messages, Emails, Lead Scraping, Get Leads, Call Admin, Task Manager, ICM Architect, Self Improvement, Workflows). Each workspace is a discrete cognitive context. Reps switch into a workspace, work it, switch out.

This is a deliberate design choice over a more conventional "command-driven" tool. The mental model is **"what mode am I in right now"** not **"what command do I want to run."**

### 3. Routing happens at the top, not inside skills

Her CLAUDE.md has ~30 routing rules at the top. Each rule maps user language patterns to specific workspace + skill files. Skills don't try to figure out what the user wants; routing decides, then skills execute.

**Why it works:** keeps each skill simple and focused. The complexity lives at the routing layer, where it's centralised and inspectable.

### 4. Continuous self-improvement loop

Three skills working together:

- **`log-idea.md`** — every "I think we should change X" or "next time can you..." gets captured immediately
- **`capture-preference.md`** — personal style preferences captured (e.g., "Claudia prefers terse responses on Mondays")
- **`/improve` (Monday)** — reviews last week's logs, surfaces patterns, proposes refinements

**This is the pattern that makes her tool get smarter every week.** Friction observed → idea logged → Monday review → tool updated. The team's collective learning compounds into the tool's actual behaviour.

**Implication for the wider system:** the dashboard's coaching engine should adopt this pattern (or integrate with it via the shared bus). Each coaching cycle's outputs should feed back into the next cycle. This is exactly what the bus's `probe-outcomes/` is designed to enable.

### 5. Governance — Claudia is the only writer

Her CLAUDE.md is explicit: *"Only Claudia may request changes to any file in this project."* Users can only edit their own preferences files. Everything else flows through her.

This is the right move for a team-shared tool that needs to remain coherent. Distributed editing of a shared codebase produces drift. Single-author governance with structured input channels (`log-idea`, `capture-preference`) gets you the benefits of input without the chaos of unchecked writes.

**Implication for the shared bus integration:** the bus's contract respects this (it's described in `INTEGRATION-FOR-CLAUDIA.md`). Her tool reads from the bus + writes its specific outputs; the bus itself is the shared territory.

### 6. Workflows triggered by exact phrases

`pelican294` for Aircall sync, `walrus827` for weekly call summaries, `/hobbdoss` for grazier dossier prep, `/fridaycloseout` and `/improve` for the weekly cycle. Each workflow has a unique trigger phrase in the format `[noun][3 digits]`.

The triggers are intentionally non-discoverable — they're for power users who know what they want. The tool stays simple by default but has powerful workflows for those who know how to invoke them.

**This is good design.** Surfaces simplicity to new users; gives power to experienced users. Worth adopting in the dashboard.

---

## Her call style (single observation, Xavier Burton)

5m 39s outbound, ended with farm visit booked. Pattern observed:

### Opening — closer to Ben than Hobbs on company naming

> *"Hi Xavier, it's Claudia Bryant. How are going? Have I caught you at a good time?"*

Then:

> *"I'm from AgriProve based in Aubrey, and we're a carbon farming company."*

Names AgriProve in sentence 2 (like Ben). But she does use the permission-ask early ("have I caught you at a good time?") — Hobbs's discipline.

### Hobbs-as-attractor — the visit hook

> *"We have a guy here that is doing a fellowship from America, and he's looking to get out on farm. So we've been doing a bit of a call around of farms within the sort of extended area to see if he would be able to come out and talk about what you've been doing on farm and soil health and things like that."*

Identical structure to Ben's deployment of Hobbs as the bait. The "fellowship from America" framing does the work.

### Disarming the "I'm just a grazier" objection

When Xavier said *"I wouldn't say I do anything out of this world sort of thing,"* Claudia's response:

> *"He's like a grazing... he's from Texas... he's been a rancher for a long time... he's just getting out and wanting to see what even what is normal in Australia."*

She **validates Xavier as worth visiting without overclaiming his uniqueness.** Hobbs is the expert who wants to learn what's normal here, not the expert who's only interested in the special. This is a smart move — defuses the "you don't want to talk to me" reflex without flattery.

### Hobbs-discipline on the phone

**She does NOT pitch any value props.** No methodology, no 25/75 split, no ACCU revenue, no ratchet, no 25-year commitment. The whole call is about booking the visit. **Closer to Hobbs's phone discipline than Ben's pattern (which pitches in 9 of 14 calls).**

### Admin-tight close

Gets email, address, hectares (550ha — qualifies for project), books for April 29 (Wednesday) 9:30 AM, confirms calendar reminder + SMS follow-up.

### What she does that Ben doesn't (relevant for Ben)

- **Permission-ask in the open** (Hobbs-style). Ben uses warmth-as-greeting instead.
- **Resists pitching on the phone.** Holds for visit. This is the discipline Ben should adopt per the Hobbs profile's #1 transferable insight.

The Claudia sample size is tiny (1 call) but it's directionally consistent with Hobbs's discipline. Worth confirming with more calls if any land in Confluence.

---

## Her vulnerability + honesty pattern (from 2026-04-24 standup)

> *"I've had the worst week with farmers this week. Not, not one thing was solved in one email. It was all so many back and forth..."*

Three things this captures:

1. **She admits to a hard week openly.** Most leads-team members wouldn't volunteer this in a standup.
2. **The diagnostic is structural** (email back-and-forth, not "I'm bad at this"). She names a system problem, not a personal one.
3. **It becomes a learning input.** This standup observation flowed into the system's "email round-trip exhaustion" pattern (captured as a friction signal in `coaching/prompts/a1-stage-friction.md` and `pass0-email-distillation.md`). Her vulnerability **became** the system's smarter framing.

**This is the team-learning pattern in action.** Claudia names a friction; the system records it; the next coaching cycle accounts for it. She IS the pattern she's built.

---

## What the rest of the team gets from Claudia's work

1. **Get-leads queue** — Ben's call list is produced by her tool. The quality of his daily work depends on the quality of her routing.
2. **Call admin pipeline** — every call Ben or Hobbs makes flows through her call-admin skill. The structure of what gets recorded is her design.
3. **Aircall → Confluence pipeline (`pelican294`)** — every transcript I've been distilling exists because she built the sync. **The Hobbs profile's call data, Ben's call data, this profile's call data all exist because of her workflow.**
4. **Weekly summary aggregation (`walrus827`)** — qualitative analysis of each week's calls, in Confluence. Future input to our team-intel pipeline.
5. **Research dossiers** — for Hobbs's farm visits, Claudia's `/hobbdoss` skill prepares deep research on each landholder. The success of Hobbs's visits depends partly on the dossier quality.

**Without Claudia's work, none of the rest of the AgriProve sales-coaching system functions.** The dashboard's distillation pipeline, the shared bus integration — all of it depends on her infrastructure.

---

## What the dashboard's system should learn from her tool

Three direct adoptions worth flagging:

### 1. The Monday `/improve` cycle — adopt this pattern

Per the shared bus's `probe-outcomes/`: every probe the system suggests + every outcome it observes should feed back. The cleanest cadence is a weekly Monday review (mirrors `/improve`) where patterns surface from the week's accumulated outcomes.

### 2. Per-user preferences in coaching

Ben and Hobbs would respond differently to the same coaching message. The system should respect this. Could add `user_coaching_preferences.json` to the shared bus where each rep has a profile.

### 3. Trigger-phrase workflows for power users

The dashboard's current UI is report-shaped. Adding power-user trigger phrases ("`/coach-stuck-deals`", "`/where-am-i-pushing-too-hard`") could surface depth on demand without polluting the default surface.

---

## Known gaps (will fill as data arrives)

1. **More call samples** — n=1 is thin. If Claudia does more Storm Boy outreach calls in coming weeks, distill those to validate the Hobbs-discipline pattern observed in Xavier Burton.

2. **Her self-improvement logs** — the Friday weekly logs + Monday /improve cycle. Reading these would surface her own articulation of what's worked and what hasn't.

3. **Her research patterns** — the `research-leads/` workspace + the `/hobbdoss` skill output. How does she structure research for Hobbs? What does a good dossier contain?

4. **Her tool's growth trajectory** — her CLAUDE.md is `Last updated: 2026-04-22`. The tool evolves weekly. What's the rate of change? What concepts get added vs deprecated?

5. **Her ideological position on tool-vs-judgment** — when should the system surface a recommendation vs let the rep decide? Worth asking directly.

---

## Validation step

Walk Claudia through this profile + show her the dashboard's coaching engine + the shared bus. Ask: *"What of this looks right? What would you build differently? What does your tool already do that we should adopt vs not duplicate?"*

The conversation that produces is probably more valuable than the profile itself.

---

## How this profile gets used

Different from Hobbs/Ben because the artifact (her tool) is already in use. This profile mostly serves to:

1. **Inform the shared bus integration** — what assumptions about her tool need to hold for the bus to work? Profile is the reference.
2. **Surface team-system patterns the dashboard should adopt** — the /improve cycle, per-user preferences, trigger-phrase workflows.
3. **Help leadership understand what they have** — Claudia's tool is the unsung operating system of the Stormboy motion. Worth Will and Kieren understanding what depends on it.
