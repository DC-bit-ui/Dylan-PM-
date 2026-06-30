# Steve 1:1 — prototype/design review + strategy (2026-06-30)

**Source:** Granola "Steve PM 1 on 1 — Roadmap strategy, partnerships, and farm data capture" (2026-06-30) — meeting `9bff9ffc-e71d-41cf-9d45-7bc82b1fc28e`. Notes only (transcript paid-gated).
**Confidence:** [high] from the AI notes; quotes not verbatim (no transcript).

## ⚠️ Cadel is departing
- Significant loss; he's the **primary SME on HORIZON**, and HORIZON work is at risk with him leaving (unclear if a contractor can cover short-term).
- **Affects the Land Titles sign-off:** the PRD + proposal were prepped for **Cadel** as approver (Confluence 635797512, email drafted). Need to decide whether to push it through with Cadel before he goes, or re-route the approver (Will / Kieren). **Flag to Dylan.**

## Prototype/design gaps to plug (Project Hub Review) — Prospective Projects
1. **HORIZON run visualization** should be included in the flow (not just a deep-link). Extends the earlier "re-home the Actions-menu HORIZON run" point → KCT mapping requirements §4.E (upgrade from link to visualization). [Dylan]
2. **NDRE + other Actions-button items need a clear home.** The redesign dropped the Actions menu; NDRE/etc. orphaned. NDRE for prospects = the BCR. Give them an explicit home. [Dylan]
3. **Annual reviews / NDRE placement for prospects** was unclear — clarify (annual reviews are active-projects; NDRE-for-prospects = BCR in Consents/CPP).
4. **BCR IA not obvious.** Baseline Condition Report already sits in the Consents page under the CPP flow, but the UI doesn't make that obvious. Surface it more clearly.
5. **CPP completeness / ownership.** Steve asked: is the full CPP absorbed into the product, or partly done outside and brought back? **Dylan's intent: the full CPP is populated progressively through the ops workflow** — land titles, EIHs, and baseline management activities (pulled from HubSpot via the LMS call) flow in; **paddock maps come from the landholder → saved to SharePoint → pulled into the CPP**. Make this flow explicit in the Consents/CPP spec.
6. **CPP edit view — not prioritised.** Steve floated an editable view (like snapshots, edit paragraphs). Current: no edit structure; ops copy-paste standard paragraphs with little change → not prioritised now. [decision]
7. **Paddock maps — no in-tool conversion.** Keep Phase 3 scope tight; don't duplicate QGIS. No functional paddock-map→spatial-file conversion in-tool; instead make **importing external QGIS work back into the automation tool easy**. Open to reconsider if a simpler high-value in-tool option appears. [decision] Dylan action: explore the paddock-map format ops uses in current CPPs.
8. **CEA/CASET mapping — config navigation gap.** Ops should be able to **go back into project config / redo setup while mapping is still in progress**, by returning to the **CASET mapping tool** directly. Dylan to design how to expose that access point from the page (without clutter). [Dylan action]
9. **Progress tracker on the CEA mapping page — questionable value.** Ops usually finish the whole sequence in one sitting; Steve thinks the 6-step tracker adds visual complexity without operational value. Prefer avoiding unnecessary charts/visualisations. **Reconsider / simplify the 6-step status mirror** in the KCT mapping spec (currently central to it). [open — Dylan call]
10. **Broader takeaway:** most gaps are workflow/ownership/UI-clarity, not missing functionality. Reduce ambiguity about **where work happens, in-tool vs outside, and how to move back/forward** through the Prospective Projects flow.

## Terminology
- Steve refers to the mapping tool as **"CASET mapping tool"** (alongside CEA). Confirm whether CASET is the canonical tool name vs CEA/Project KCT. [confirm]

## Strategy context (not prototype, captured for awareness)
- Concern AgriProve is building features without a grounded view of customer acquisition/revenue; soil-carbon market small + nearing capacity.
- **Partnerships > direct acquisition** — LawrieCo model as the template (revenue/ACCU share, digital tooling, "we can objectively measure the efficacy of your products"). Target QLD/VIC analogues + biological-product businesses.
- **Stormboy expansion** (new regions) = earlier, lower-effort win than new partnerships.
- Farm-management data capture: start now imperfectly (progress over perfection); it's one of two crediting blockers alongside sign-offs.
- Ways of working: Steve wants **workshop-style roadmap sessions** with Will + Kieren every ~4 weeks (sync for real ideation); routine refinement calls have gone stale. Training/support critical (ops run KCTs ~every 1.5 weeks, so frequent tool changes confuse).

## Action items
- Dylan: explore the paddock-map format used in current CPPs (informs tooling).
- Dylan: add config navigation to the CEA mapping page (access CASET config mid-workflow, no clutter).
- Steve: set up workshop-style roadmap sessions with Will + Kieren (~4-weekly).
