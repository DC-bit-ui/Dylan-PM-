---
date: 2026-06-03
source: CEEZER P&C interview prep session
tags: [jobhunter, product-feature, interview-prep, pattern]
type: product-insight
---

# Interview Cheat Sheet — JobHunter feature pattern

## What was built

An interactive HTML interview prep dashboard for the CEEZER P&C screen. Light-mode, tabbed interface with 10 sections:

1. **Screening** — What this round tests for, interviewer intel
2. **Company** — Stats, leadership table, values grid (memorisable)
3. **Products** — Portfolio breakdown by asset class, product detail cards with "your angle" callouts
4. **Market** — Key stats from company's own reports, phrases to use naturally
5. **Positioning** — Core narrative + three pillars (supply→demand, AI-native builder, high agency)
6. **Q&A** — Accordion-style expandable cards for likely questions with prepared responses + coaching notes
7. **My Thesis** — Personal conviction statements layered by depth (scaling thesis → purpose → buyer gap → the line → ecological cascade)
8. **My Questions** — Curated questions tagged by which interview round to deploy them in
9. **Watch Points** — Behavioural guardrails (don't over-explain, confidentiality, salary deflection)
10. **Checklist** — Interactive pre-interview checkboxes

## Why this pattern is valuable for JobHunter

This is the **Interview Intelligence** panel of the 3-panel command centre. The pattern works because:

- **Tabbed navigation** lets the user glance at relevant sections mid-call without scrolling through a wall of text
- **Accordion Q&A** means answers are hidden until needed — reduces cognitive load, prevents reading from a script
- **Coaching notes** (amber callouts) provide meta-guidance ("keep to 90 seconds", "save for round 2") alongside the content itself
- **"Your angle" callouts** (green) on every product/company section bridge the user's experience to the company's needs — this is the differentiator vs. generic interview prep
- **Question tagging** (which questions for which round) shows sophistication about multi-stage interview processes
- **Thesis layering** — not a single "why this company" answer but a depth stack the user can draw from depending on how deep the conversation goes
- **Checklist with strike-through** — small UX touch that reduces pre-interview anxiety

## Data sources that powered this prep

| Source | What it provided |
|--------|-----------------|
| Job posting (Ashby) | Role requirements, interview process stages, hiring manager/bar raiser names |
| Company website (careers, about, product pages) | Values, leadership, product detail, team culture |
| Company blog / annual review | Market context, company framing ("climate pragmatism"), portfolio composition trends |
| Web search | Funding rounds, B Corp score, cohort details, competitor landscape |
| LinkedIn (attempted) | Interviewer background (partial — LinkedIn blocked, supplemented via web search) |
| User's memory files | Authentic career material, sanitised talking points, positioning strategy |
| User's Notion portfolio | Evidence base for claims (not shared externally — confidentiality) |

## How this maps to JobHunter architecture

This prep sheet is the **output artifact** of the Interview Intelligence feature. In the full system:

1. **Input:** User selects a job application from their pipeline
2. **Research agent:** Auto-fetches company intel (website, funding, leadership, products, news, Glassdoor, market context)
3. **Interviewer research:** Pulls interviewer profile from LinkedIn/web
4. **Positioning engine:** Maps user's experience (from their profile/brag-doc) to the company's requirements — generates "your angle" bridges
5. **Q&A generator:** Produces likely questions + prepared responses using the user's actual career material
6. **Thesis builder:** Structures the user's motivation into layered depth (lead → support → depth)
7. **Output:** Interactive HTML cheat sheet (this pattern) — tabbed, expandable, tagged by round

The cheat sheet should be **regeneratable per interview round** — the P&C version emphasises motivation/culture/logistics; the hiring manager version would emphasise product depth/case studies; the bar raiser version would emphasise values alignment and edge cases.

## Design decisions to carry forward

- **Light mode default** — interview prep is often done in bright environments (office, cafe). Dark mode available as toggle.
- **CEEZER teal (#1A5676) as accent** — matched the CV. In JobHunter, accent colour should auto-derive from the target company's brand.
- **No emojis in Q&A section** — professional tone. Emojis acceptable in watch points and checklist for scannability.
- **Coaching notes visually distinct** — amber background, italic, clearly not "the answer" but meta-guidance about delivery.
- **Confidentiality section** — essential for anyone interviewing while employed. Should be a standard section.

## Reference implementation

`C:\Personal Dev\Job Hunter\CEEZER_Interview_Prep.html` — light-mode, single-file HTML, no dependencies.

## Cross-references

- JobHunter product discovery brief: `C:\Personal Dev\Job Hunter\JobHunter_Product_Discovery_Brief.md`
- JobHunter interactive prototype: https://claude.ai/design/p/019e1077-cef5-790d-bbd9-f0e453341115
- CEEZER CV: `C:\Personal Dev\Job Hunter\Dylan_Cronje_CV_CEEZER_Builder_PM.pdf`
- CEEZER application questions: drafted in conversation 2026-06-03
