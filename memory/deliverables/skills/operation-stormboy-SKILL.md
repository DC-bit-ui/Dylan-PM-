---
name: operation-stormboy
description: >
  End-to-end knowledge of Operation Stormboy — AgriProve's systematic field recruitment campaign targeting 500+ ha agricultural properties in the Murray-Darling Basin for soil carbon project sign-ups. Covers the full 7-stage pipeline: Geographic Scoping, Lead Generation (Claude Code scraper), Lead Research & Enrichment, Call List & Outreach, Farm Visit, HORIZON Snapshot (post-visit), and Post-Visit Conversion. Use this skill whenever anyone asks about Stormboy, the recruitment pipeline, lead generation, call lists, farm visits, HubSpot lead stages, the Storm Boy Claude Code tool, Claudia's scraper, Hobbs or Ben's field work, snapshot generation for recruitment, KCT conversion, or anything related to how AgriProve signs up new landholders. Also trigger when someone says "how does recruitment work", "what's the lead process", "how do we get new properties", "what's the call list workflow", "how does the scraper work", or references HubSpot contact stages like Identified, Assessed, Contacted, Visit Booked, etc. If Frontier is mentioned in the context of recruitment (not platform development), this skill applies.
---

# Operation Stormboy — Recruitment Operating System

Operation Stormboy is AgriProve's systematic field recruitment campaign. It targets 500+ ha agricultural properties in the Murray-Darling Basin (initially NSW, expanding to VIC) for soil carbon project sign-ups via the ERF (Emissions Reduction Fund).

**Owner:** Cross-functional. Dylan owns PM-side alignment. Claudia Lombard owns Growth tooling (Claude Code scraper). Hobbs and Ben are the field team executing calls and visits.

**Positioning:** "Fellowship Not Sales" — Hobbs positions as a peer explorer rather than a salesperson. This drives ~40% positive response rate vs industry 5-10%.

**Pipeline target:** 40,000 ha (Phase 1 milestone hit ~23,000 ha / 55% in first two weeks).

---

## The Pipeline — 7 Stages

```
1. Geographic Scoping
2. Lead Generation (Claude Code scraper → CSV → HubSpot → Frontier)
3. Lead Research & Enrichment (Claude Code per-contact research)
4. Call List & Outreach (Claude Code daily call list → field team calls)
5. Farm Visit (template snapshot, Three-Legged Stool, boundary confirmation)
6. HORIZON Snapshot (POST-visit, automated via Frontier, Daniel QA)
7. Post-Visit Conversion (KCT negotiation, Land & Expand)
```

Each stage maps to a HubSpot `contact_lead_stage_storm_boy` value. The pipeline is sequential — a lead must pass each gate before advancing.

---

## Stage 1: Geographic Scoping

**Purpose:** Define target regions with high soil carbon potential and sufficient property density.

**Current regions:**
- NSW: Murray-Darling Basin corridor — primary region, 340+ contacts identified
- VIC: Expanding — 141+ contacts identified via breed society directories

**Selection criteria:**
- 500+ ha agricultural properties (cattle/sheep grazing primary)
- Within Murray-Darling Basin or adjacent high-potential zones
- Breed society membership signals quality enterprise operators
- Enterprise name identification strategy: target named studs (e.g., "Hicks Beef", "Ardrossan Angus") rather than generic farm businesses

**Tools:** Breed society directories, AuctionsPlus, Yellow Pages, Google Maps, Geoscape spatial data.

**Key insight:** Enterprise-named properties convert at higher rates because they signal professional operations with the scale and mindset for carbon projects.

---

## Stage 2: Lead Generation

**Who:** Claudia Lombard (Growth) operates the Claude Code scraper.

**How it works — the Storm Boy Claude Code Tool:**

Claudia built a Claude Code project (VS Code) with a `CLAUDE.md` router architecture. The router directs to specific skill folders, saving ~35k tokens per interaction. The scraper searches multiple online sources:

- Breed society directories (Angus Australia, Hereford, etc.)
- Yellow Pages, True Local
- AuctionsPlus (livestock sales records)
- Google Maps (business listings)
- Jina AI Reader as bypass for sites that block direct scraping

**Output:** `lead-scraping/lists/storm-boy-leads-master.csv` — contains business name, contact name (when available), phone, address, source URL, and scraping notes.

**Caveats the scraper has:**
- CSV can be messy — quality varies by source
- Will repeat searches without guidance on what's already been tried
- No auto-sync to HubSpot — manual import step required
- Source registry tracks what's been searched to avoid duplication

**Import flow — CSV to systems:**

```
Scraper CSV
  → Manual import to HubSpot (contact created with stage "Identified")
  → Claudia Scrape Bulk Property Import (AP-2237):
      CSV → Geoscape address resolution → PostgreSQL Property + Property_Parcel
      → HubSpot placeholder contact (claudia_research+N@agriprove.io namespace)
      → User_Property linking
      → Frontier (spatial view with property polygons)
```

The bulk import creates properties in the AgriProve database with Geoscape-resolved boundaries, visible on Frontier's map view. Deduplication runs at both property level (via `geoscape_parcel_id`) and contact level (via phone/business_name). ~1,500 leads per batch, ~350 with phone numbers.

**HubSpot stage at exit:** `Identified`

**Confluence refs:**
- "13. Lead Scraping" (page 572391453)
- "Claudia Scrape Bulk Property Import — Proposed Implementation Plan" (page 549978125)
- "Operation Storm Boy — Property Intelligence Hub" (page 393445380)

---

## Stage 3: Lead Research & Enrichment

**Who:** Field team (Hobbs, Ben) via Claude Code, or Claudia for bulk runs.

**Purpose:** Enrich each contact with background intelligence so the field team knows who they're calling and can lead with relevant context (breed, property scale, sale history).

**How it works — Claude Code "Research Leads":**

Two modes:
1. **Single contact:** User names a contact → Claude Code fetches from HubSpot → searches internet (livestock sales, breed societies, Yellow Pages, ABN lookup, Google) → writes a research note to HubSpot → stamps `storm_boy__date_assessed` → optionally adjusts Storm Boy Call task priority.

2. **Bulk queue:** Each team member has a personal queue file (`users/[folder]/research-queue.md`). Claude Code works through the queue sequentially — fully resumable if interrupted. Same per-contact flow as single mode.

**What gets researched:**
- Property size and enterprise type (cattle/sheep, breed)
- Recent livestock sales (AuctionsPlus, breed society sale results)
- Business registration (ABN lookup)
- Online presence (website, Yellow Pages listing, social media)
- Any existing relationship signals (prior AgriProve contact, referrals)

**HubSpot fields touched:**
- `storm_boy__date_assessed` — timestamp of research completion
- Storm Boy Call task priority (High/Medium/Low based on fit)
- Notes engagement — research summary attached to contact

**Stormboy completion gate:** A sub-skill enforces data discipline before any task can be marked complete. Three conditions must be met:
1. Stage is NOT "Identified" (must have been assessed)
2. `date_assessed` has a value
3. `date_called` has a date (exempt for Not Eligible/On Hold)

If any condition fails, a recovery flow walks the user through updating the contact before proceeding.

**HubSpot stage at exit:** `Assessed`

**Confluence refs:**
- "4. Research Leads" (page 544178178)
- "SB Claude Tool Instructions" (page 543129601)

---

## Stage 4: Call List & Outreach

**Who:** Hobbs (primary), Ben — each morning via Claude Code.

**Morning workflow:**

1. Team member asks Claude Code for their daily call list
2. Claude Code queries HubSpot:
   - **Section A:** Storm Boy Call tasks sorted by priority (High → Medium → Low → none) — new contacts to call
   - **Section B:** Contacts in "In Conversation" or "Farm Visit" stages with >5 days since last contact — follow-ups
3. Returns 10 new leads + 5 follow-ups with: contact name, phone number, website, and all scraped source information (research notes, breed, property details)
4. Always refetches from HubSpot (no caching) — ensures latest state

**After calls — two options:**
- **Option 1:** Tell Claude Code immediately after each call (updates HubSpot in real-time)
- **Option 2:** Wait for Claudia's 1:30pm automated sync (batch update from call notes)

**Claude Code post-call capabilities:**
- Update HubSpot contact stage
- Log call outcome as note
- Send follow-up text messages
- Send follow-up emails
- Schedule callbacks
- Analyse call transcripts for insights

**Call outcomes map to HubSpot stages:**

| Outcome | HubSpot Stage | Next Action |
|---|---|---|
| Positive, interested | `Contacted` → `Callback` | Schedule follow-up |
| Very interested, wants visit | `Visit Booked` | Arrange farm visit |
| Not interested now | `Review Later` | Re-queue in 3-6 months |
| Not eligible (too small, wrong land use) | `Ineligible/Closed Lost` | Remove from active pipeline |
| No answer | Stays current stage | Re-queue next call list |

**Reallocation:** Call lists can be reallocated across teammates if someone is unavailable. Claude Code supports this natively.

**HubSpot portal:** 24224559

**HubSpot stage at exit:** `Contacted` or `Callback` or `Visit Booked`

**Confluence refs:**
- "3. Sales Team Day to Day" (page 571899905)
- "11. Get Leads (Call List)" (page 573145089)
- "2. Storm Boy Tool Tour" (page 541949957)

---

## Stage 5: Farm Visit

**Who:** Hobbs (primary), Ben.

**Purpose:** Face-to-face visit to build relationship, explain the soil carbon opportunity, confirm property boundaries, and assess landholder fit.

**Pre-visit preparation:**
- Claude Code generates visit briefing from HubSpot research notes
- Template/example HORIZON snapshot report provided to the field team member — this gives the landholder a concrete visual of what they'd receive, using an example property, to make the opportunity tangible during conversation

**Visit structure — the Three-Legged Stool:**

AgriProve's value proposition rests on three legs:
1. **Soil carbon measurement** — HORIZON model gives spatial visibility into SOC across the property
2. **Carbon credit generation** — ACCUs earned through the ERF, with AgriProve managing the project
3. **Land management improvement** — carbon-positive practices also improve productivity

The field team member presents all three legs, positions as "fellowship not sales", and focuses on the landholder's specific context (breed, enterprise, land type).

**Key framing (from Matthew, Phase 1):** "For every credit we get, you get three" — emphasising the landholder's disproportionate benefit.

**Critical gate — boundary confirmation:**
During the visit, the field team confirms the exact property boundaries the landholder wants included. This is essential because the HORIZON snapshot (Stage 6) requires confirmed boundaries for a single model run. Incorrect boundaries mean wasted model compute and a snapshot that doesn't match the landholder's expectations.

**HubSpot stage at exit:** `Visit Completed`

**Confluence refs:**
- "Operation Storm Boy — Recruitment Operating System" (page 488210435) — visit protocol
- "Phase 1 Milestone Retrospective" (page 408911873) — "Fellowship Not Sales" learnings

---

## Stage 6: HORIZON Snapshot (Post-Visit)

**Who:** Automated via Frontier (Claude API); Daniel QAs.

**Purpose:** Generate a personalised HORIZON soil carbon prediction report for the landholder's confirmed property. This IS the post-visit follow-up — the snapshot serves as both the conversion tool and the proof of concept.

**Timing:** AFTER the farm visit, once boundaries are confirmed. This ordering is deliberate — generating snapshots before boundary confirmation wastes model runs and risks sending inaccurate reports.

> **History note:** The process originally had snapshots generated pre-visit. This was changed in early May 2026 after an automation bug caused snapshots to trigger incorrectly at visit booking stage. The current (correct) flow is: visit first, confirm boundaries, then snapshot.

**How it works — Frontier automation:**

```
Confirmed boundaries (from visit)
  → Frontier triggers HORIZON model run for the property
  → Model produces zone maps:
      - Strength zones (dark green) — high existing SOC
      - Reference zones (light grey) — baseline SOC
      - Opportunity zones (red) — highest potential for SOC gain
  → Claude API generates snapshot content (~5 min, ~2¢ per snapshot)
  → Daniel QAs the output
  → Snapshot sent to landholder as follow-up
```

**Snapshot contents:**
- Property overview with satellite imagery
- HORIZON zone map (colour-coded Strength/Reference/Opportunity)
- Depth and pH metadata
- Estimated carbon credit potential (defensible language only)
- Next steps toward project sign-up

**Non-negotiable language rules for snapshots:**
- No em dashes in any copy
- Defensible language only — no guaranteed outcomes, no spot pricing
- Two communication styles exist: "Standard" (formal) and "Operation Stormboy" (warmer, fellowship-aligned)

**HubSpot stage at exit:** `Desire to Proceed` (if landholder responds positively)

**Confluence refs:**
- "HORIZON Snapshot — Claude AI Workflow SOP" (page 488374275) — note: March 2026 version partially superseded by Frontier automation
- "Phase 2: Spatial Intelligence & Campaign Infrastructure" PRD (page 427819010)

---

## Stage 7: Post-Visit Conversion

**Who:** Hobbs/Ben (relationship), Dylan (PM alignment), Ops team (onboarding).

**Purpose:** Convert interested landholders into signed carbon project participants.

**Key Commercial Terms (KCT):**
The KCT is the legally binding project agreement between the landholder and AgriProve. It covers:
- Carbon credit split (landholder vs AgriProve)
- Project duration and commitments
- Land management requirements
- Measurement and verification obligations

**Conversion rate:** ~65% once KCT is issued — the hard work is getting to the KCT stage.

**Land & Expand strategy:**
Once a landholder signs, the field team explores:
- Additional properties owned by the same landholder
- Neighbouring properties (warm referral from signed landholder)
- Breed society network connections (one signed stud owner refers others)

This network effect is a core Stormboy advantage — each signed property opens doors to adjacent ones.

**HubSpot stages:**

| Stage | Meaning |
|---|---|
| `Desire to Proceed` | Landholder wants to move forward post-snapshot |
| `Proceed to Ops Pipeline` | KCT issued, transitioning to operational onboarding |

---

## HubSpot Pipeline Summary

The full `contact_lead_stage_storm_boy` dropdown:

| Stage | Position | Gate to Next |
|---|---|---|
| Identified | Entry (from scraper import) | Research completed |
| Assessed | Research done, priority set | Call attempted |
| Contacted | First call made | Outcome logged |
| Callback | Positive response, follow-up scheduled | Visit arranged |
| Visit Booked | Farm visit scheduled | Visit completed |
| Visit Completed | Visit done, boundaries confirmed | Snapshot sent |
| Desire to Proceed | Positive response to snapshot | KCT negotiation |
| Proceed to Ops Pipeline | KCT signed | Operational onboarding |
| Review Later | Not now, but possible future | Re-queue in 3-6 months |
| Ineligible/Closed Lost | Terminal | None |

---

## Team Roles

| Person | Role in Stormboy |
|---|---|
| **Claudia Lombard** | Growth — operates Claude Code scraper, manages lead database, bulk imports, 1:30pm automated sync |
| **Hobbs** | Field team — primary caller and visitor, "Fellowship Not Sales" positioning |
| **Ben** | Field team — caller and visitor |
| **Daniel** | QA on HORIZON snapshots post-generation |
| **Dylan Cronje** | PM — process alignment, Frontier platform (spatial intelligence), pipeline visibility |
| **Matthew** | Early contributor — "For every credit we get, you get three" framing |

---

## The Storm Boy Claude Code Tool

Claudia built and maintains a Claude Code project (VS Code) that is the field team's daily operating tool. Documentation lives on Confluence under "SB Claude Tool Instructions" (page 543129601).

**Architecture:** `CLAUDE.md` router pattern — a master prompt routes to specific skill folders based on the request type. This saves ~35k tokens per interaction vs loading everything at once.

**9 capabilities:**

| Capability | What it does |
|---|---|
| **Storm Boy Admin** | Contact updates, stage changes, task management |
| **Researching leads** | Per-contact internet research → HubSpot notes (Stage 3) |
| **Surfacing leads** | Morning call list generation with priorities (Stage 4) |
| **Sending texts** | Follow-up SMS to contacts post-call |
| **Sending emails** | Follow-up emails to contacts |
| **Call transcripts** | Analysis of recorded call transcripts for insights |
| **Lead scraping** | Bulk scraping from online sources (Stage 2) |
| **Self-improvement** | Tool iterates on its own prompts and skills based on usage patterns |
| **Bulk queue processing** | Resumable batch operations across contact lists |

**Confluence refs:**
- "SB Claude Tool Instructions" — table of contents (page 543129601)
- "2. Storm Boy Tool Tour" (page 541949957)
- "3. Sales Team Day to Day" (page 571899905)
- "4. Research Leads" (page 544178178)
- "11. Get Leads (Call List)" (page 573145089)
- "13. Lead Scraping" (page 572391453)

---

## Frontier's Role in Stormboy

Frontier (Phase 2, Dylan's primary platform build) provides spatial intelligence for the recruitment pipeline:

- **Map view:** All scraped/imported properties visible with Geoscape-resolved polygons
- **Pipeline colour coding:** Properties colour-coded by HubSpot stage on the map
- **Prospect detail panels:** Click a property to see contact details, research notes, stage history
- **Snapshot automation:** Triggers HORIZON model run and Claude API snapshot generation post-visit
- **Portfolio view:** Board reporting on pipeline progress, geographic coverage, conversion rates

**Active Jira epics:**
- AP-1963 — Frontier Phase 2 (Dylan; Development)
- AP-2009 — Frontier property management (Dylan; Development)
- AP-2237 — Claudia Scrape Bulk Property Import

---

## Key Metrics & Benchmarks

| Metric | Value | Source |
|---|---|---|
| Positive call response rate | ~40% | Phase 1 retrospective |
| Industry benchmark response rate | 5-10% | Phase 1 retrospective |
| Phase 1 pipeline (first 2 weeks) | ~23,000 ha (55% of 40k target) | Phase 1 retrospective |
| KCT conversion rate (once issued) | ~65% | Operational data |
| Snapshot generation time | ~5 min per property | Frontier automation |
| Snapshot generation cost | ~2¢ per property | Claude API |
| Contact database (NSW) | 340+ contacts | Property Intelligence Hub |
| Contact database (VIC) | 141+ contacts | Property Intelligence Hub |
| Scraper batch size | ~1,500 leads, ~350 with phone | Bulk import plan |

---

## When to Use This Skill

Load this skill when:
- Drafting comms about the recruitment pipeline
- Answering questions about how leads move through the system
- Reviewing or updating Stormboy HubSpot data
- Helping field team members with their workflow
- Writing PRDs or specs that touch the recruitment pipeline
- Analysing conversion metrics or pipeline health
- Discussing Frontier features related to recruitment mode
- Preparing for meetings about Growth, field operations, or lead generation
- Debugging issues with the Claude Code tool, scraper, or HubSpot stages
- Onboarding someone new to how Stormboy works
