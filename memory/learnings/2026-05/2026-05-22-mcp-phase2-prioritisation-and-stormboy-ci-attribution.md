---
date: 2026-05-22
tags: [mcp, phase-2, stormboy, stormboy-ci, claudia, attribution, decisions]
---

# 2026-05-22 — MCP Phase 2 prioritisation + Stormboy Conversion Intelligence attribution correction

## Context

Working session with Dylan (in Cowork) to compile the MCP requirements list
following this morning's Product Standup (granola id `e2f6e58c-58be-4009-8921-60fd02482cfd`).
Action item from standup: Dylan owns compiling the full MCP requirements list
for Cadel. This learning captures the decisions made in the working session
and a critical attribution correction.

## Attribution correction — Stormboy Conversion Intelligence

**Dylan owns and is building the Stormboy Conversion Intelligence system.
NOT Will Frecheville.**

Earlier session research (the Cadel 1:1 synthesis 20/05) attributed it to Will.
That was wrong. Dylan corrected this 2026-05-22 — "the Stormboy conversion
intelligence system is what I am building not Will."

The system is **not yet launched** but will have MCP requirements when it is.
Dylan's vision:

- Pops up in team members' Claude Desktop on session start
- Team can interrogate it directly ("who is the highest value person to contact today?")
- Insights parse back through into their existing systems

Implication: any future MCP scoping conversation around Stormboy CI loops in
Dylan as the owner, not Will. Will's tooling work is separate (still TBD what
exactly).

## LAFI definition

**LAFI = Lab and Field Integration.** AgriProve's backend database (the
PostgreSQL store behind the GraphQL API). All project data, sample results,
and project history live here. Surfaced as a distinct ask by Claudia 2026-05-22
in the context of MCP-exposed reads/writes for the Stormboy conversion
intelligence layer.

Glossary updated: `memory/business/glossary.md` (added under L).

## MCP Phase 2 — final prioritised list (for Cadel proposal)

Dylan's final ranking, after two rounds of pushback on Cowork's v1 and v2 lists:

1. **Property navigation (parcel + address) → Frontier** — Growth enabler
2. **Request snapshot / snapshot update for this deal** — Growth enabler, Semantic B with confirmation modal
3. **Snapshot status + predicted turnaround** — Growth comms enabler
4. **Annual Review write + Contact/Deal/Company association** — Claudia ask
5. **Land titles backend write (NOT vendor purchase)** — DJ ask; PropertyID-keyed
6. **TN sampling object read + write** — Defer past June

Plus two forward-looking items not yet in scope but flagged for Cadel:

- **LAFI database read/write surface** — Claudia ask, scope pending
- **Stormboy Conversion Intelligence MCP layer** — Dylan-owned, pre-launch

## Standing decisions made this session

**Decision 1 — `request_snapshot` semantics: Semantic B (trigger directly).**
The MCP `request_snapshot` tool writes `HorizonSnapshotRequest`, flips
`User.horizon_snapshot_request_progress = REQUEST_SUBMITTED`, AND directly
calls `socModelRunTrigger` to kick the Temporal workflow. Phase 1 ships with
full Temporal-trigger semantics from day one.

Confirmation modal required: "Are you sure the property has all correct land
titles?"
- Yes → trigger snapshot
- No → user deep-links to Frontier property to manage parcels

**Decision 2 — `snapshot_status` keyed on Property ID.**
The status query is per property, not per user. This sidesteps the limit of
`User.horizon_snapshot_request_progress` being a single-valued enum at the
User level. Per-property progress state needs to live on `HorizonSnapshotRequest`
or `SOCModelRun` — Q for Cadel.

**Decision 3 — Land titles MCP scope = backend write only.**
The vendor purchase pipeline is a backend Temporal workflow, not MCP-shaped
(long-running async, no human-in-loop benefit). The MCP tool is the WRITE of
extracted EIH/title data into AgriProve's backend, keyed on **Property ID**
(not Contact ID — circumvents the contact-to-multi-property blocker). Reads
are also MCP-shaped (e.g. `get_land_titles_for_property`).

**Decision 4 — PandaDoc lives in EIH automation epic, owned by Dylan.**
Not an AgriProve MCP tool. Backend Temporal workflow fires on title extraction
completion. MCP can later expose thin wrappers for manual regeneration and
status reads, but the core automation belongs in the EIH track.

**Decision 5 — Annual Review association scope.**
Per Dylan: Contact, Deal, Company relationships. Not Property.

## Source

- Granola: Product Standup 22/05 — `e2f6e58c-58be-4009-8921-60fd02482cfd`
- Granola: Cadel 1:1 20/05 — `a7a8b328-55f6-4605-a514-6488dfa23b29`
- Granola: Land title API integration 19/05 — `6509ed25-5ac9-447d-ae27-29e47906da16`
- Granola synthesis: Claudia annual reviews + LAFI ask (multi-meeting query)
- Confluence MCP proposal: SCRUM/557449218 — still "Draft – for Cadel review"
- agriprove-backend skill: `references/system-architecture.md` (HORIZON lifecycle)

## Next actions

- Cowork session creates Confluence proposal page as child of SCRUM/557449218
- Dylan posts to Cadel via Teams pointing to the page
- Open Qs in the page need Cadel answers before requirements doc is final
- This learning supersedes any earlier attribution of Stormboy CI to Will

---

## 2026-05-25 update: Cadel reviewed, Row 4 resolved

Cadel left 7 inline comments on the proposal page (586678274) on 2026-05-24.
Summary of his positions:

- **Modal UX on Row 2:** Claude-via-MCP can't currently generate UI; modal not
  yet possible. Dylan backlogged. Tagged Athul as out-of-scope for now.
- **Semantic A vs B (Row 2):** "No preference, whatever you think is best for
  the user." Dylan's proposal (Semantic B) stands.
- **Property ID keying (Row 3):** confirmed yes.
- **Per-property progress location (Row 3):** "On `HorizonSnapshotRequest`.
  `SOCModelRun` is for the regular monthly runs." Resolves that open Q.
- **Turnaround estimate (Row 3):** "1.1 is same architecture, so no change to
  time." Median over recent runs is fine.
- **Row 4 HubSpot association scope:** "We clone the actual HubSpot MCP, can
  confirm via their docs." See resolution below.
- **Row 5 land titles spatial attribution:** Cadel asked how titles relate to
  parcels. Dylan replied "via lot and plan number." Row 5 still has an open
  question on M:N intermediate vs primary-parcel + cross-reference.

### Row 4 resolution (HubSpot association API)

[high — verified via HubSpot v3 Objects and v4 Associations API docs]

Two paths with very different cost depending on operation:

- **Branch A, create new (1 call):** `POST /crm/v3/objects/{annual_reviews}/batch/create`
  with the `associations` array inline. Multiple target object types (Contact,
  Deal, Company) all go in the same array. One API call creates the record
  and links all three.
- **Branch B, update existing (1 + 3 calls):** `PATCH /crm/v3/objects/{annual_reviews}/{id}`
  to update properties, then `POST /crm/associations/2026-03/{from}/{to}/batch/create`
  per target type. The batch endpoint is scoped per source-target object type
  pair. Batch limit is 2000 inputs per call.

### MCP tool design implication

`write_annual_review` supports both branches via an optional `existing_id`
input. Internal routing handles the branch selection. Property association
is appendable in either branch with no architectural cost (resolves open Q
(b) on Row 4).

Full implementation schema for Athul lives in the Confluence page under
"Implementation schema (row 4) for Athul" (page version 3, 2026-05-25). Covers
tool signature, both branches, type ID resolution + caching, error handling
(409 idempotency, 429 backoff), auth scopes, idempotency caveats, and test
plan.

### Open promotion to memory/integrations/hubspot.md

The 1-call-on-create vs per-pair-on-update fact belongs in
`memory/integrations/hubspot.md` per the integration contract pattern.
That's a Tier 2 PR (this learning file is Tier 1). Captured here for now,
promote later.

### Source references

- Confluence page version 3 — implementation schema lives here
- Confluence inline comment 587333642 (Cadel) + 588447801 (Dylan reply)
- HubSpot docs:
  - [Associate records v4 guide](https://developers.hubspot.com/docs/api-reference/crm-associations-v4/guide)
  - [Using Object APIs](https://developers.hubspot.com/docs/guides/crm/using-object-apis)
  - [Custom object records API guide](https://developers.hubspot.com/docs/api-reference/crm-custom-objects-v3/guide)

---

## 2026-05-25 update: Claudia adds sampling leaderboard query (new Row 4)

Claudia posted in the Product / General Teams channel 2026-05-25 03:47
asking for the MCP to expose sampling leaderboard prediction per project.
Verbatim:

> "Would it be possible for the Agriprove MCP to give us the sampling
> leaderboard prediction for a project? This will save me going into check
> the leaderboard every time and would surface potential discrepancies
> between model and LIA or if they aren't in the leaderboard. The prediction
> and the confidence would be good."

### Action taken

Inserted as new Row 4 in the Confluence proposal page (version 4). Existing
Rows 4, 5, 6 renumbered to 5, 6, 7. The implementation schema heading also
updated from "row 4" to "row 5" to reflect the Annual Review tool's new
position.

The Phase 1 MCP proposal already lists `sample_leaderboard` as a candidate
tool. Claudia's request makes it concrete: returns prediction + confidence
keyed by project, surfaces "not in leaderboard" cases, and surfaces
discrepancies between model and LIA.

### Final ranked list (as of 2026-05-25)

1. Property navigation in Frontier (parcel + address)
2. Request snapshot / snapshot update for this deal
3. Snapshot status + predicted turnaround
4. **Sampling leaderboard prediction for a project** (NEW, Claudia)
5. Annual Review write + Contact / Deal / Company association (Claudia)
6. Land titles backend write (NOT vendor purchase)
7. TN sampling object read + write

Plus two forward-looking items (LAFI surface, Stormboy CI MCP layer).

### Open questions on Row 4

- For Cadel: is the Phase 1 `sample_leaderboard` design aligned with returning
  prediction + confidence per project plus "not in leaderboard" status? Where
  in the data model does the prediction + confidence live (RunModelUnifiedWorkflow
  output, derived view, elsewhere)?
- For Claudia (Dylan to follow up): confirm LIA refers to lab-side data
  (vs model prediction); confirm preference between deterministic
  discrepancy flag vs raw values for caller-side comparison.

### Source

- Teams: [Claudia's message, Product / General channel, 2026-05-25 03:47](https://teams.microsoft.com/l/message/19:2ydR2PMGWfJeohnDjbsBUvg5GLX2AP8bupBpJG2IYiY1@thread.tacv2/1779680867876?tenantId=9e4ec61c-b7af-4060-bf72-5beaa52d2a51&groupId=6257a7df-cdec-4e2b-874d-c673782caabb)
