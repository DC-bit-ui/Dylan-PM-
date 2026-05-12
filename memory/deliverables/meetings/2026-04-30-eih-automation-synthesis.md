# EIH Automation — Meeting Synthesis & Stakeholder Update

**Date:** 2026-04-30
**Source meetings:**
- [Meeting with Will — EIH documentation sourcing and automation requirements gathering](https://granola.so/docs/dbfd8982-6939-4c70-b5aa-618d92428c3f) (Apr 21)
- [Eligible interest holder consent process for carbon projects — DJ](https://granola.so/docs/0a2b2418-7148-4d70-90df-cf00ac8e1923) (Apr 24)
- [Follow up with DJ on EIH process](https://granola.so/docs/fb5f77a2-6abb-4dec-bf24-e7bb037c3c66) (Apr 30)

---

## Pain points captured

### Will's pain points (Apr 21)
- Manually processing 50+ land titles per SA project — pushing into 14-hour days
- Ben generates KCTs using HubSpot display names instead of legal entity names from titles, forcing Will to decline and request corrections (rework loop)
- No standardised data extraction methodology across NSW, QLD, VIC, SA, WA — each state's PDF format requires different parsing
- No email templates, welcome packs, or upfront guidance for landholders on what records to keep
- Historical approach of registering whole titles (including easements) caused 6-month crediting delays when the regulator later required third-party consents

### DJ's pain points (Apr 24 + Apr 30)
- Manual 14-step end-to-end workflow from land title sourcing through to crediting — zero automation
- CER portal CSV has fixed column headers and strict formatting rules; any deviation breaks the upload entirely
- State-specific field requirements: NSW uses Lot/Plan type/Plan number; TAS uses Volume/Folio only
- LGA and NRM region names must match government standards exactly — spelling errors reject the whole file
- Address fields must be selected from government-recognised dropdowns (no free text)
- Title diagrams must be purchased separately for any property with easements — additional cost and manual step
- Fire management record digitisation is a growing time sink with lots of back-and-forth
- Banks historically engaged only at crediting stage (5+ years in), causing major delays

### Shared/systemic
- No single source of truth linking land title data, HubSpot deal records, and CER registration requirements
- Each project requires manual CSV creation from scratch
- Easement identification requires purchasing separate plans and manual georeferencing in QGIS
- Proponent legal right type must always be "Assigned legal right" for Agriprove-lodged projects — but this isn't enforced anywhere

---

## Decisions already made

1. **Easement strategy:** Cut easement areas out of project boundaries (with 5-10m buffer) to avoid third-party consent requirements [high confidence — DJ confirmed Apr 30]
2. **Bank engagement timing:** Shift from crediting stage (5+ years) to within first 1-2 years [high confidence — DJ confirmed Apr 24]
3. **Legal right type:** Always "Assigned legal right" for Agriprove projects [high confidence — DJ confirmed Apr 30]
4. **Automation trigger:** Deal transition from Strategy Call to SLA KCT stage in HubSpot — no automatic purchasing without human approval [moderate — from Will meeting Apr 21]
5. **QLD parsing:** Already built; serves as template for remaining states [high confidence — Will meeting Apr 21]

---

## Phased approach

### Phase 1 — PDF extraction + HubSpot integration (Weeks 1-4)
**Goal:** Eliminate manual data entry from land title PDFs into HubSpot.

- Build state-specific PDF parsers (QLD done; NSW, VIC, SA, WA remaining)
- Extract: registered owner names, lot/plan numbers, mortgage details, caveats/easements
- Write extracted data to HubSpot custom objects via ops app API (direct API has auth issues)
- Associate custom objects with correct deal + contact records
- **Validates:** Can we achieve 100% extraction accuracy across all 5 state formats?

### Phase 2 — Document generation (Weeks 5-6)
**Goal:** Auto-generate EIH consent forms and KCTs with correct legal entity names.

- Pre-fill PandaDoc EIH consent forms using extracted title holder data (not HubSpot display names — fixes Ben's rework loop)
- Pre-fill KCT templates with legal entity names
- Generate one form per EIH, with ability to merge where directors overlap across company entities

### Phase 3 — CER registration CSV + compliance packaging (Weeks 7-8)
**Goal:** Generate upload-ready CSVs matching the CER portal's exact format.

- Auto-populate ERF-002 project area details CSV with correct column headers, lot/plan data, LGA, NRM region, plan publication dates
- Validate LGA and NRM region names against government reference lists before export
- Address formatting to match CER portal dropdown conventions
- Legal right type defaults to "Assigned legal right"; legal right file name auto-maps to title PDF filename

### Phase 4 — Historical backfill + optimisation (Weeks 9-12)
**Goal:** Backfill existing projects and refine based on real usage.

- Process existing project land title data through the pipeline
- SharePoint automated file organisation
- Feedback loop on extraction accuracy and edge cases
- Bank engagement workflow standardisation (NAB + CBA packs exist; build templates for remaining majors)

---

## Action items

| Owner | Action | Source | Status |
|---|---|---|---|
| Dylan | Build EIH automation skill (Claude/Cowork) — PDF extraction as Phase 1 | Will meeting Apr 21 | In progress |
| Dylan | Develop state-specific parsing for NSW, VIC, SA, WA (QLD done) | Will meeting Apr 21 | Not started |
| Dylan | Explore ops app API key for writing land title data to HubSpot custom objects | Will meeting Apr 21 | Not started |
| Dylan | Speak with Ben about managing land title requests through Frontier | Will meeting Apr 21 | Not started |
| DJ | Provide bank documentation examples (NAB, CBA exist; others needed) | DJ meeting Apr 24 | Pending DJ |
| DJ | Share example of completed ERF-002 CSV for template reference | DJ meeting Apr 30 | Done (shared in chat) |
| Dylan | Schedule follow-up with DJ for complex project deep-dive | DJ meeting Apr 30 | To schedule |

---

## Stakeholder update — draft for Will and DJ

> **Subject: EIH Automation — Where we're at + confirming your pain points**
>
> Will, DJ — wanted to loop you both in on where the EIH automation work stands after our conversations over the past two weeks.
>
> **What I've gathered from our chats:**
>
> The current EIH process is almost entirely manual — from purchasing and parsing land titles, to identifying EIHs, to creating the CER registration CSVs, to generating consent forms. The main pain points I've captured are:
>
> - **Volume:** 50+ titles per SA project, each requiring line-by-line extraction across 5 different state formats
> - **Rework loop:** KCTs being generated with HubSpot names instead of legal entity names from titles — requiring corrections before Will can proceed
> - **CER CSV formatting:** Fixed column headers, exact LGA/NRM region naming, address formatting that must match government dropdowns — any deviation rejects the whole upload
> - **Easement handling:** Previously registering whole titles caused 6-month delays when the regulator requested third-party consents we hadn't anticipated. Current approach is to cut easements out with a 5-10m buffer
> - **Bank timing:** Shifting from engaging banks at crediting (5+ years) to within 1-2 years to avoid late-stage holdups
> - **No templates or standardised guidance** for landholders upfront
>
> **Where I'd like your confirmation:** Does the above capture the core problems accurately? Anything missing or mischaracterised?
>
> **Proposed phased approach:**
>
> 1. **Phase 1 (Weeks 1-4):** PDF extraction from land titles + auto-population into HubSpot custom objects. QLD parsing exists; building NSW, VIC, SA, WA.
> 2. **Phase 2 (Weeks 5-6):** Auto-generate EIH consent forms and KCTs using legal entity names (not HubSpot display names).
> 3. **Phase 3 (Weeks 7-8):** CER-ready CSV generation matching the ERF-002 template exactly — validated against government LGA/NRM reference lists.
> 4. **Phase 4 (Weeks 9-12):** Backfill existing projects, SharePoint file org, bank engagement templates.
>
> Phase 1 is where the biggest time saving lives — eliminating the manual title-by-title data entry. Keen to get your read on whether the phasing makes sense or if something should move up.
>
> DJ — still need the bank documentation examples for the remaining majors when you get a chance. Will also book a follow-up for the complex project deep-dive.
>
> Cheers,
> Dylan

---

*Filed to: `memory/deliverables/meetings/2026-04-30-eih-automation-synthesis.md`*
*Sources: Granola meetings Apr 21, Apr 24, Apr 30 [live data]*
