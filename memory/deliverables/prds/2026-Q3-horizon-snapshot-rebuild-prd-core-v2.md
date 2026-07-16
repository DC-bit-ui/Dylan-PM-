# HORIZON Snapshot — Native Rebuild — PRD Core (v2, two-phase)

> Lean PRD Core. Supersedes the v1.x core for phasing and scope; the v1.x file remains the detailed decision + validation log. Paste into Confluence under the HORIZON Snapshot Epic Hub.

#### Document Header

| Field | Value |
|---|---|
| **Feature Owner** | [CPO / Kieren] |
| **Delivery Owner** | Dylan Cronje |
| **Epic Hub** | [Confluence Epic Hub 466452481] |
| **Jira Epic** | [AP-XXXX — HORIZON Snapshot opportunity] |
| **Status** | Draft |
| **Last Updated** | 2026-07-08 |

---

#### 1. Problem (+ Evidence)

**Current state:** The HORIZON Snapshot generator works but was vibe-coded as a standalone app off the platform stack. It is hard to debug, effectively impossible to change or reorder, cannot extend to new opportunity types, and its output quality is fragile. Once a snapshot is sent, nothing is tracked — there is no follow-up loop.

**Evidence:** Live prod walkthrough (Eungella, 1 Jul) and source review confirmed the fragility: zones rendered by pixel-walking a PNG with a CSS crop, economics numbers baked into the template image, no PII controls, manual per-property duplication in Canva. A real end-to-end trial (Rochester Farm, 8 Jul) proved the target render path works via the Canva connector (see `horizon-snapshot-rebuild/09`).

**Impact:** Growth cannot tailor pitches without a developer; the Verterra (ACWIS) and Reef Credit opportunities cannot be productised; and every sent snapshot is a dead end rather than a tracked opportunity. This tool is the missing middle between Frontier (acquire) and project establishment (deliver).

---

#### 2. Job Stories

**Primary (Phase 1)**

| # | When… | I want to… | So I can… |
|---|---|---|---|
| 1 | a snapshot arrives from the pipeline (or I upload a ZIP) | review the data, copy and maps in one place | trust it before it goes out under Ben's name |
| 2 | the generated copy or a map does not fit a prospect | edit copy and reframe maps directly | tailor the pitch without a developer |
| 3 | the snapshot is ready | export a marketing-grade PDF and send via HubSpot | deliver it without quality regression |
| 4 | I am triaging a batch of prospects | see value, source and a one-line recommendation per card | decide who to pursue in seconds |

**Primary (Phase 2)**

| # | When… | I want to… | So I can… |
|---|---|---|---|
| 5 | a sent snapshot is being engaged with | see the engagement and a prompted next action | follow up at the right moment and close |
| 6 | marketing designs or changes a template | bring it in and map its fields without a developer | keep the document current myself |
| 7 | a prospect commits | convert the opportunity to a project with its context intact | hand off cleanly to establishment |

---

#### 3. Success Metrics

| Indicator | Baseline | Target | Phase | Setup |
|---|---|---|---|---|
| Snapshot created → sent without dev involvement | ~0 | 100% of routine sends | 1 | instrument |
| Time from data-ready to sent | [measure] | ≤ current | 1 | instrument |
| Output fidelity (marketing-grade) | current tool = reference | no visible regression; designer sign-off + pixel-diff | 1 | design-QA + CI |
| Follow-up acted on warm snapshots | n/a | ≥ [X]% of warm within 48h | 2 | engagement events |
| Opportunity conversion (sent → project) | [measure] | uplift vs baseline | 2 | funnel |
| Template changes shipped by marketing (no dev) | 0 | ≥ [X]/quarter | 2 | Hub events |

**Pivot criteria:** if, 30 days after Phase 1, routine sends still need a developer or teams revert to the old tool, stop and re-scope before Phase 2.

---

#### 4. Scope

**Phase 1 — Document creation (create & send a marketing-grade snapshot)**

- Native React/Chakra tool in Frontier; data from the platform (GraphQL/S3) plus a first-class manual ZIP upload entry.
- Engine ported with frozen constants (`CORES_PER_CEA=24`, $12.50, $50k cap, rainfall×land-use rates, soil lookups); land-use override.
- Copy generation (Page 2, Page 4, email) with Standard/Stormboy registers, Persistent Narrative Guide, guided regeneration, model selector (Haiku/Sonnet) + cost tracking; copy rules enforced (no em dashes, defensible language, disclaimer, signs off as Ben, thanks Hobbs).
- **Marketing-grade render:** Canva Brand Template (built by Daniel) + Autofill / editing-API fill → per-page export merged into one exportable PDF. Never a Canva link. Fidelity enforced by design-QA + pixel-diff CI. Maps generated server-side at 300 dpi and injected.
- Guided flow (confirm interests → generate summaries → frame maps → final review → send) + manual editor with collapsible page manager and "Add page".
- **Intelligent, always-editable maps:** fit property boundary, legend auto-placed clear of it; map directly editable at all times (no edit button).
- Review → Edit → Send; preview-as-landholder; pre-send quality check; Send via HubSpot; Growth Summary (internal, not in PDF); PII scoped to delivery.
- De-noised queue: value tiers, Stormboy/Organic source, one value figure, one-line recommendation.

**Phase 2 — Sent pipeline, templates & engagement**

- **Sent pipeline lifecycle** in the same queue: Create → Send → Warm → Follow up → Convert.
- **Engagement:** tokenised web snapshot with telemetry → warmth re-sort, next-action prompts, context-aware follow-up, convert-to-project handoff to establishment with context intact.
- **Template Hub (self-serve):** canonical data dictionary, auto-map on import, add-new-field + PM approval, partner namespaces (e.g. LawrieCo), marketing authoring guide.
- **Multi-opportunity extensibility:** interest selector; ACWIS/RC (Verterra) and Reef Credit as opportunity types (each gated on its data contract).

**Out of scope (both phases)**

- Full CRM / contact management — HubSpot. — this tool owns the artifact, its engagement, and the prompt to act, not the CRM.
- Lead sourcing / scraping — Frontier.
- Project delivery workflow — establishment / ops.

**Future**

- Batch auto-send for clean high-value; learning from edits into the narrative guide; Environmental Plantings opportunity type.

---

#### 5. Key Decisions

| Decision | Rationale | Date |
|---|---|---|
| Two phases: Phase 1 document creation, Phase 2 sent pipeline + templates + engagement | Ships a self-contained, valuable tool first; adds the loop-closing value on a working base | 2026-07-08 |
| Output rendered by Canva, never re-drawn in CSS; delivered as one exportable PDF | Marketing-grade by construction; the fix to "close enough" output | 2026-07-03 |
| Two fill paths validated (editing API needs no publish; autofill endpoint needs Brand Designer role) | Editing-API path removes the publishing dependency; keep both open | 2026-07-08 |
| Model produces content only; Canva renders; interactive map manipulation captured to a 300 dpi image | Preserves flexibility while keeping fidelity guaranteed | 2026-07-03 |
| Intelligent map framing default + always-editable maps (no edit button) | Auto-fit alone frames poorly; users must be able to reframe at any time | 2026-07-08 |
| Tool is not a CRM | Prevents bloat; keeps clear boundaries with HubSpot/Frontier | 2026-07-08 |

---

#### 6. Rabbit Holes & Dependencies

**Rabbit holes**
- [ ] Rebuilding a CRM inside the tool → **Mitigation:** hard boundary; artifact + engagement + prompt only.
- [ ] Perfect pixel parity across all edge cases → **Mitigation:** designer sign-off + pixel-diff on a reference set; "no visible regression".
- [ ] Over-decomposing into micro-blocks → **Mitigation:** block ≈ page; sub-slots only where editing needs them.
- [ ] Making maps a chore → **Mitigation:** intelligent framing default, always directly editable.

**Dependencies**

| Dependency | Owner | Phase | Blocks launch? |
|---|---|---|---|
| GraphQL/S3 data load + platform stack + render approach | Backend (Gayathri) | 1 | Yes |
| Canva Brand Template built (fields per spec) | Marketing (Daniel — Brand Designer) | 1 | Yes (for autofill path) |
| Map render + Canva asset-upload pipeline (composite over satellite at bounds + legend) | Backend | 1 | Yes |
| `bounds.json` in model output | Model team (Cadel) | 1 | No (improves alignment) |
| Engagement tracking infra (tokenised web snapshot + events) | Backend | 2 | Yes (Phase 2) |
| Verterra ACWIS API contract; Reef Credit data/methodology | Ben / partners | 2 | Yes (those opportunities) |

---

#### 7. Open Questions

| Question | Owner | Target |
|---|---|---|
| Platform stack + render approach (Puppeteer/tokenised URL) confirmed? | Gayathri | TBD |
| Editing-API fill vs autofill endpoint for production? | Gayathri / Dylan | TBD |
| Engagement telemetry approach for the web snapshot? | Backend | Phase 2 |

---

#### 8. Timing (provisional — dev team to estimate)

> Provisional placeholders only. Prior week figures assumed traditional velocity; with **Claude-Code-assisted development they are over-stated**. The dev team estimates each sliced epic bottom-up and we refine from there (Gayathri to size slice 1). PM owns the order and the JTBD, not the durations. See `memory/learnings/2026-07/2026-07-09-dev-estimation-process.md`.

Phase 1, sliced native-first, each slice shipping a Growth-visible outcome:

| # | Slice | Growth can then | Provisional (confirm w/ devs) |
|---|---|---|---|
| 1 | Native render pipeline | create + send a snapshot in-app, no dev | ~1 week |
| 1.1 | Map render | crisp, correct maps automatically | ~2–3 days |
| 1.2 | Intelligent + editable maps | reframe any map, boundary-fit, legend clear | ~2–3 days |
| 1.3 | Guided flow + copy tailoring | tailor the copy via a guided path | ~2–3 days |
| 1.4 | Triage queue | see value + source, pick who to pursue | ~2–3 days |

Provisional Phase 1 total **~2–3 weeks** (was 6–8). Phase 2 strands (engagement / Template Hub / opportunities): provisional **~3–5 days of build each**, gated on their dependencies (engagement telemetry infra; Verterra/Reef contracts).

Before committing: a short **discovery spike** to validate Canva Autofill → export → merge on the standard template across 3 reference properties and confirm the platform data/render stack.

#### Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-07-08 | 2.0 | Re-cast as a two-phase PRD (document creation; sent pipeline + templates + engagement); folded in validated render findings and intelligent-maps decision | Dylan Cronje (with Claude) |
| 2026-07-10 | 2.2 | Revised timing to Claude-Code-accelerated provisional estimates (Phase 1 ~2–3 wks vs 6–8), sliced native-first with Growth outcomes; durations to be confirmed bottom-up by the dev team | Dylan Cronje (with Cowork) |
