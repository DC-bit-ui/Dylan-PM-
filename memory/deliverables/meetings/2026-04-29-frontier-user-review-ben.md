# Frontier User Review: Ben (Inside Sales) - Findings & Roadmap Recommendations

| Field | Value |
|---|---|
| **Author** | Dylan Cronje |
| **Date** | 2026-04-29 (interview) / 2026-05-01 (report) |
| **Participants** | Dylan Cronje (PM), Ben (Inside Sales / BDM) |
| **Recording** | [Granola transcript](https://app.granola.so/notes/159e41bf-8f42-483d-a133-00d10731acde) |
| **Epic** | AP-1963: Frontier Phase 2 |
| **Related** | AP-2009 (Property Management), ROAD-162 (Log Call), Stormboy Standup 01/05 |
| **Status** | Complete: recommendations for team briefing |

---

## Context

On 29 April 2026, a live user interview was conducted with Ben to observe his end-to-end workflow when using Frontier for Stormboy cold-call outreach. The session was designed as an unstructured observation. Ben shared his screen and navigated Frontier with minimal prompting to surface organic friction points.

This report arrives at a critical inflection point. The Stormboy Standup on 1 May 2026 established that **conversion and tool utilisation are now the absolute business priority.** The Q4 target is 100,000 hectares in farm visits over 13 weeks, requiring ~100 calls/week. Ben is the primary outbound operator (~60-65 calls/week). Only 3 calls were made this week due to lack of allocated contact lists and tooling gaps. Frontier adoption by the sales team is no longer a "nice to have"; it is a direct input to whether the business hits its conversion numbers.

---

## User Background

Ben operates in a cold-call sales role, primarily targeting Stormboy prospects (300-400+ ha grazing properties) and following up Riverina outreach lists. During the interview, he had **7+ browser tabs open simultaneously**, each serving a specific function in his call preparation workflow:

HubSpot (contact lists, call logging), MapHub (portfolio map with project names), AgriProve website (case studies), Knowledge Hub (eligible activities, methodology), Claude Desktop (regional knowledge, icebreakers), Aircall (telephony), Core Markets (ACCU price), Clean Energy Regulator website, Google (rainfall data), and a hectare/ACCU converter.

Every one of these tabs represents a function that Frontier needs to either absorb or link to. The tab count is the clearest signal of the consolidation opportunity, and the gap between Frontier's current state and what adoption requires.

---

## Key Findings

### Finding 1: Search fails at Step 1 - contact name is the primary entry point

Ben could not find a single contact in Frontier. He searched "Robert Dunn" with no results. Tried property names with no match (contacts not linked to properties). Tried three contacts before giving up. His assessment: *"If we can't go past step one here, then I don't know if it's working."*

The root cause is a mental model mismatch. Frontier's universal search resolves farm names. Ben's workflow starts with a person's name from a HubSpot list. He doesn't know the farm name. He knows "Robert Dunn" and wants to find everything associated with him.

**Status in the roadmap:** The Address Search PRD (Confluence page 524910593) already includes contact/business name search as a distinct query type (S-contact). The open question *"Is contact name queryable via the search bar?"* is marked "Open, elevated priority." Figma frames for contact-name results (Frame D) and business-name results (Frame E) were commissioned on 2026-04-27. The Athul kickoff on 2026-04-28 covers the technical implementation.

**Recommendation:** No scope change required. This is on track. Elevate the contact name query resolution with Cadel as the single biggest adoption blocker for the sales persona. Ben's interview is confirmatory evidence for the existing PRD scope.

---

### Finding 2: Telephony is the binary adoption gate - Log Call was descoped from Phase 1

Ben's stated #1 requirement: *"It's got to start with the phone"* and *"that would totally shift me from just using HubSpot to totally 100% using this."* He was unambiguous. Without calling capability, he will not switch workflows.

The "Log Call" button in the Prospect Detail Panel was designed to trigger an Aircall window prompt + HubSpot write integration. Three Jira stories exist and are fully spec'd:

- **AP-1862**: Log Call Action - Aircall Window Prompt & HubSpot Write Integration (Story, Ready for Dev, Lowest priority, unassigned)
- **AP-1863**: Log Call Action - Post-Success Confirmation (Story, Ready for Dev, Lowest priority, unassigned)
- **AP-1864**: Log Call Action - Error State Handling (Story, Ready for Dev, Lowest priority, unassigned)

Parent roadmap ticket: **ROAD-162** (Log calls directly from Frontier).

These were intentionally descoped from Phase 1 to trim delivery. The stories are designed, have acceptance criteria, and reference both Confluence specs and Figma designs. They are ready to be re-raised.

**Recommendation:** Re-prioritise AP-1862, AP-1863, AP-1864 from Lowest to High. Assign and schedule for the next available sprint. Given the Stormboy Standup directive that conversion tooling is the absolute priority, this is the single highest-leverage unshipped feature for sales adoption. The stories are already "Ready for Development" and no additional PRD or design work is required. Estimated effort: 1-2 weeks (3 stories, each ~0.5-1 day).

---

### Finding 3: HubSpot activity actions - eye-frame modal, not feature replication

Ben wants to log calls, add notes, send templated emails, and create tasks from within Frontier. The current architecture is explicitly read-only by design decision (documented in the Property Management Epic Hub).

Building discrete HubSpot write-back features (email, task, note) individually would consume significant dev and design capacity and replicate what already works in HubSpot. An interim solution is more pragmatic.

**Technical research: HubSpot embeddability**

HubSpot's contact record pages **cannot be iframed.** HubSpot sets `X-Frame-Options: SAMEORIGIN` on all app.hubspot.com pages, which means any `<iframe>` pointing to a HubSpot contact record will be blocked by the browser. This is a hard technical constraint, not a configuration issue. [high confidence]

HubSpot's UI Extensions and CRM Cards work in the opposite direction: they embed third-party apps INTO HubSpot, not the reverse. HubSpot does not offer embeddable components, widgets, or SDKs for rendering contact records in external applications. [high confidence]

**Viable approaches (ranked):**

1. **Pop-up window (window.open)**: Open the HubSpot contact record in a controlled browser window (sized, positioned) from a Frontier button click. Minimal development effort (hours, not days). The user technically leaves Frontier, but the window can be sized and positioned alongside Frontier rather than replacing it. This is the fastest interim path. **Recommended as the immediate solution.**

2. **Custom activity panel via HubSpot API**: Build a lightweight Frontier-native panel using HubSpot's v3 Contacts API (read) + Engagements API (write: log call, add note, create task). This gives full control over the UX but requires backend integration work. Better long-term solution. Estimated effort: 2-3 weeks. **Recommended as the Phase 3 solution.**

3. **Sidebar slide-out**: Combine approach 1 with a Frontier UI element that opens a resizable sidebar containing the HubSpot window. More polished than a raw popup. Moderate effort. **Consider for Phase 3 if the popup proves insufficient.**

**Current state:** Frontier already has a HubSpot CTA that opens the contact record in a new browser window/tab. This means the basic "View in HubSpot" link is already shipped, no new ticket needed.

**Recommendation:** The existing HubSpot CTA is sufficient as the interim bridge. Ben's current workflow is HubSpot-native, and he will continue using HubSpot for activity actions until the workflow cards (Finding 5) give him a reason to start his session in Frontier. Attempting to replicate HubSpot's activity features inside Frontier before the call list integration exists would be duplicating his workflow into an unfamiliar system without sufficient pull. For Phase 3, scope the custom activity panel (approach 2) as the long-term path. Start with call logging + notes, which covers 80% of Ben's stated needs. But this should sequence *after* the workflow cards establish Frontier as the session starting point.

---

### Finding 4: Portfolio intelligence - must match or exceed website/MapHub functionality

Ben uses the MapHub portfolio map on every call. He clicks orange dots (credited projects), reads case study information, references ACCUs issued, and uses nearby project density as a talking point. He specifically values the right-hand sidebar listing credited project names with case study links.

Frontier has the spatial project data but lacks the narrative layer. Ben hasn't switched from MapHub because: (a) habit, and (b) MapHub has scannable project names and case study deep links that Frontier doesn't surface.

A key interaction Ben relies on in MapHub is the **hover tooltip** on project markers. When he hovers over a project dot, a tooltip surfaces the project name and attributed case studies, giving him a quick-scan mechanism to identify relevant talking points without clicking through. Clicking the tooltip expands to a case study summary, and a further link opens the full case study page. This three-tier interaction (hover, summary, deep link) is how Ben actually consumes portfolio data during call prep. It's fast, low-friction, and doesn't break his flow. Frontier's map markers need to replicate this pattern, not just link to case studies from a list view.

**What needs to exist in Frontier:**

- A navigable list of projects by crediting status (credited, in system, pipeline) accessible from the left-hand nav panel, with project names, ACCU counts, and case study links where available
- **Map marker hover tooltips** showing project name + attributed case studies at a glance, matching the MapHub interaction pattern Ben uses on every call. Clicking the tooltip opens a case study summary panel; a further link navigates to the full website case study
- Visual indication of case study availability per project (success/crediting badge)

**Recommendation:** Create a roadmap ticket for "Portfolio Intelligence: Credited Projects & Case Studies." Scope as a left-hand nav interaction that surfaces the project list by category, with case study identification and success indicators. This doesn't require new data; it's a presentation and linking problem against existing project data. Estimated effort: 2 weeks. Fits naturally as a Phase 2 polish item or early Phase 3 quick win.

---

### Finding 5: Workflow cards - transforming Frontier into a call preparation tool

This is a new concept not currently in the roadmap, and the single most important idea in this report. It transforms Frontier from a lookup tool into a **workflow tool**, giving Ben a reason to start his session in Frontier rather than HubSpot.

**The concept:** A horizontal tile strip sits at the top of the map view as a "call runway." Each tile is one prospect from the assigned call list, scrolling tile to tile. Clicking a tile **expands a panel downward** (between the tile bar and the map) showing research context and CTAs, while the map simultaneously navigates to the contact's linked property with surrounding projects highlighted. Ben gets talking points and spatial context in one glance. Completed tiles shift to a muted/checked state so he can track progress ("12 calls today, 4 done, 8 to go").

**The two-layer data model:** The expanded panel merges HubSpot contact data (name, phone, pipeline stage, tasks, Claudia's research notes) with Frontier spatial context (nearby credited projects, case study links, eligible activities, regional climate data). This is the merge that replaces Ben's 7 browser tabs.

**CTAs per card:** Log Call (Aircall trigger), View in HubSpot, Link Property (for unlinked contacts, triggers Address Search inline), Mark Complete/Skip, Add Notes.

#### The research data gap

Claudia's scraper produces basic contact identity (name, phone, address, email; of 6,000 scraped, 1,206 imported to HubSpot, 102 qualified for Frontier). But Ben needs richer context for call prep: rainfall, ACCU pricing, eligible activities, nearby credited projects, regional icebreakers. Frontier already has most of this spatially but doesn't surface it per-contact.

To bridge the gap long-term, Claudia's Claude Code automation should write research summaries into **HubSpot custom properties** per contact, so Frontier can pull them at card-load without requiring a parallel Claude Code session. [ASSUMPTION: needs discussion with Claudia.]

#### Property linkage dependency

Frontier's spatial data only covers properties from the original Stormboy scrape. Claudia's research lists (1,206 in HubSpot, only 102 in Frontier) mostly lack linked properties. Two distinct enrichment problems exist: Cadel's placeholders (missing identity, `stormboyxxx@agriprove.com`) and Claudia's contacts (have identity, missing property linkage). Both should surface as enrichment cards with different CTAs.

This also affects AP-1862 (Log Call). The trigger must work from the contact panel without a linked property. [ASSUMPTION: design check needed against Figma spec.]

#### Phased delivery

- **Phase 1 (3 weeks):** Tile queue for contacts with linked properties (Stormboy backlog). HubSpot data + Frontier spatial context merged in expand-down panel. Log Call and View in HubSpot CTAs. Covers the 100-calls/week target.
- **Phase 2 (+1-2 weeks after Property Management ships):** "Link Property" CTA for unlinked contacts. Address Search triggers inline, then spatial context loads. Enrichment cards for both placeholder types.
- **Phase 3:** Claudia's automation writes research to HubSpot custom properties. Cards surface regional talking points, enterprise details, eligible activities without Frontier deriving them spatially. The "7 tabs to 0 tabs" endgame.

**Technical feasibility:** Fully viable across all phases. HubSpot v3 CRM API supports all required queries (contact filtering by owner, task retrieval, custom properties read/write). Rate limits manageable with 15-30 min caching. [high confidence]

**Recommendation:** Create a roadmap ticket for "Frontier Workflow Cards: Call Preparation Queue." Schedule discovery workshops with Ben and Hobbs. Prototype the tile layout using the existing Magic Patterns design base. Phase 1 is the highest-leverage unshipped concept for sales adoption and should be treated as the centrepiece of the Frontier-as-workflow-tool vision.

---

### Finding 6: HORIZON Snapshot automation - confirmed in design phase

Ben ranked in-product snapshot generation in his top 5. He's doing a high volume of snapshots and currently switches to the HubSpot geomapping tool. The Snapshot Automation PRD Core v1.5 covers this. The design phase is active; snapshot automation designs have 50+ comments pending internal review (flagged in today's standup). Internal review sequence: Dylan first, then Ben and Daniel.

**Recommendation:** No scope change. Confirm the Frontier-surface trigger is included in the automation scope. Accelerate the design review. The 50+ unactioned comments are blocking progress.

---

### Finding 7: Contact-property linking - covered by Address Search

Many contacts Ben tried to find had no linked property. The Address Search feature (in design) includes property creation, contact linking, and the full S-contact query path. The four-feature Property Management epic (Address Search, Property Creation, Reassignment, Divide/Consolidate) addresses this systematically.

**Recommendation:** No additional scope. Address Search is the critical path: it resolves contact name search, property creation, and contact-property linking in a single feature. The Address Search PRD (S-contact query type) already covers the contact name lookup that Ben couldn't perform in the interview.

---

## Proposed Roadmap Escalations

Based on the findings above and the Stormboy Standup directive (conversion and tool utilisation = absolute priority), the following items should be raised with the team:

### Immediate (next sprint)

| Item | Jira | Effort | Rationale |
|---|---|---|---|
| Re-raise Log Call (Aircall integration) | AP-1862, AP-1863, AP-1864: reprioritise to High | 1-2 weeks | Fully spec'd, designed, ready for dev. Binary adoption gate for sales. Descoped from Phase 1, now the #1 blocker. **Design check needed:** confirm Log Call trigger works from contact panel without a linked property, required for Claudia's research list contacts. |

### Near-term (Phase 2 polish / Phase 3 entry)

| Item | Jira | Effort | Rationale |
|---|---|---|---|
| Portfolio Intelligence: Credited Projects & Case Studies | New roadmap ticket needed | 2 weeks | Replaces MapHub dependency. Project names, ACCU data, case study links in left-hand nav + map marker hover tooltips (three-tier: hover, summary, deep link). No new data, presentation layer only. |
| Workflow Cards: Call Preparation Queue (Phase 1) | New roadmap ticket (discovery) | 3 weeks (build) | Centrepiece of the Frontier-as-workflow-tool vision. Horizontal tile queue above map, expand-down panel merging HubSpot contact data + Frontier spatial context. Phase 1 covers linked-property contacts (Stormboy backlog). Phase 2 adds "Link Property" CTA for Claudia's research contacts (depends on Address Search + Property Creation). Phase 3 integrates Claudia's Claude Code research output via HubSpot custom properties. |

### Confirmed in flight (no change)

| Item | Status |
|---|---|
| Address Search (incl. contact name query) | In design: Athul building, Figma frames commissioned |
| Property Management epic (4 PRDs) | 3 PRDs in Engineering review |
| Snapshot Automation | In design: 50+ comments pending review |

### Deferred (Phase 3+)

| Item | Rationale |
|---|---|
| Custom HubSpot activity panel (API-driven) | Better long-term UX than external window, but 2-3 weeks effort. Sequence after workflow cards establish Frontier as session starting point. No value building activity features in Frontier while Ben's workflow starts in HubSpot. |
| Claude / "Ask AgriProve" chat integration | High value but high effort. Lightweight v1 (pre-populated regional context cards) could be scoped as Phase 3. Full chat integration is Phase 4+. |
| Knowledge Hub integration | Bundle with Claude/AI integration discovery. Not standalone priority. |

---

## Strategic Alignment

These recommendations connect directly to the business priority established in the Stormboy Standup (01/05/2026):

**Q4 target:** 100,000 hectares in farm visits over 13 weeks. Requires ~100 calls/week. Ben is the primary operator at 60-65 calls/week.

**Current blocker:** Only 3 calls made this week. Root causes: lack of allocated contact lists (being addressed via Claude Code allocation) and tooling friction (Frontier not yet functional as a call preparation tool).

**How these recommendations address it:**

- **Workflow Cards** are the centrepiece. They give Ben a reason to start his session in Frontier rather than HubSpot. The horizontal tile queue tells him who to call next, surfaces Claudia's research + Frontier's spatial context in the expand-down panel, and provides CTAs to action each prospect without tab-switching. This is the "pull" that drives adoption.
- **Log Call** enables Ben to make the call from within Frontier once he's there, completing the workflow loop
- **Address Search** (in flight) solves both the "can't find anyone" problem and the "Link Property" CTA for unlinked contacts in the card queue
- **Portfolio Intelligence** arms him with talking points (case studies, credited projects, hover tooltips) that currently require switching to MapHub, and feeds directly into the expand-down panel's Layer 2 spatial context
- **Claudia's research enrichment** (Phase 3 of workflow cards) writes contextual research to HubSpot custom properties, replacing the Claude Desktop / Google / Knowledge Hub tabs Ben currently uses for regional context and icebreakers

The through-line is clear: workflow cards are the gravitational centre. Every other recommendation either feeds data into the cards (Portfolio Intelligence, Claudia's research, Address Search) or enables action from them (Log Call). Together they replace Ben's 7+ tabs with a single Frontier session.

---

## Next Steps

1. **Cadel and Product to review** to scope alignment on these deliverables
2. **Create roadmap tickets** for Portfolio Intelligence and Workflow Cards (discovery)
3. **Re-prioritise AP-1862/1863/1864** in Jira from Lowest to High
4. **Schedule workshop with Ben** to validate the horizontal tile concept against his actual call list navigation
5. **Schedule workshop with Claudia** to discuss extending her Claude Code automation to write research output to HubSpot custom properties (Phase 3 dependency for workflow cards)
6. **Distribute briefing** to Cadel, Steve, and the design team (Vic/Ranjon) with prioritisation recommendation
7. **Schedule Hobbs interview** for a similar session to capture the farm visit workflow (distinct from cold-call workflow; workflow cards concept applies but the card content and CTAs may differ)

---

## Sources

- [Frontier User Review: Ben (Granola, 29 Apr 2026)](https://app.granola.so/notes/159e41bf-8f42-483d-a133-00d10731acde)
- [Stormboy Standup (Granola, 01 May 2026)](https://app.granola.so/notes/536649de-9452-4044-a74e-8ab2a1d783c7)
- [Claude Code Stormboy Architecture Walkthrough: Claudia (Granola, 01 May 2026)](https://app.granola.so/notes/39017ed7-ae82-4051-8d7b-9cdee5eb5b3b)
- [Storm Boy Lead Generation & Claude Code Workflow (Granola, 24 Apr 2026)](https://app.granola.so/notes/238276b4-7c2b-4a1a-8481-048961126018)
- [Process Alignment: Lead Generation & Spatial Mapping (Granola, 23 Apr 2026)](https://app.granola.so/notes/b07eda45-b233-4a79-9b3e-8bc277f10c7d)
- [PRD: Frontier Address Search (Confluence)](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/524910593)
- [Frontier Property Management: Epic Hub (Confluence)](https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/524877825)
- AP-1862, AP-1863, AP-1864 (Jira: Log Call stories)
- ROAD-162 (Jira: Log Call roadmap ticket)
