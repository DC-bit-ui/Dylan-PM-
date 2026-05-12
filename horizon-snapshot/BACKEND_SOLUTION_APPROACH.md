# HORIZON Snapshot — Phase 0.5 Backend Solution Approach

**For:** Dev team (Cadel)
**From:** Dylan Cronje (PM)
**Date:** 2026-05-05
**Context:** Complements `HORIZON_Snapshot_Backend_Handoff.md`. This document maps the Phase 0.5 requirements against existing backend architecture and the March 2026 Confluence pipeline design.

---

## How Phase 0.5 relates to the March architecture

The March Confluence docs (Pipeline Architecture page 491159554, Proposed Tickets page 497385473) describe the full Phase 1 vision: a 7-step automated pipeline with model auto-trigger, completion webhooks, orchestration layer, structured data assembly, tokenised URL delivery, and engagement tracking. That's 13 tickets across two phases with a 4-6 week appetite.

Phase 0.5 is deliberately scoped smaller. The standalone snapshot engine already handles parsing, calculation, narrative generation, and PDF export. What it needs from the backend is access to the data it currently gets via manual file upload.

**The difference:** Phase 0.5 is "give the existing engine access to the data." Phase 1 is "build an automated pipeline." Phase 0.5 gets us from 45 minutes to ~5 minutes per snapshot. Phase 1 gets us to fully automated.

---

## What exists today

| Component | Status | Reference |
|---|---|---|
| `RunModelUnifiedWorkflow` (Temporal) | Running in production | Triggered via `socModelRunTrigger` mutation or `socruns` poller |
| `SOCModelRun` entity with status enum | Exists | 10-value enum: NOT_STARTED through COMPLETED |
| SOCModelRun UUID = Temporal workflow ID | Confirmed | Direct correlation, same PK |
| Model output files in S3 | Written by Temporal worker on completion | metadata.txt, map.png, map_depth.png, map_ph.png, horizon_landscape.geojson, input.geojson, classified.geojson |
| Property entity with name, address, area | Exists in schema | Queryable via GraphQL |
| `TotalArea` record on project | Exists | Required for socruns poller visibility |
| GraphQL API layer | Exists | TypeScript BFF, all queries in typed-graphql.ts |

---

## Three P0 items — proposed implementation

### 1. Pre-signed S3 URLs for model output files

**What:** Add resolver fields to the `SOCModelRun` GraphQL type that generate pre-signed S3 URLs for each output file.

**Why this is small:** The files are already in S3. The SOCModelRun UUID correlates directly to the Temporal workflow ID. If the S3 key pattern follows `{workflowId}/filename` (or similar), this is a set of resolver fields that call `s3.getSignedUrl()` per file.

**Proposed resolver fields on SOCModelRun type:**
```graphql
type SOCModelRun {
  # ... existing fields ...
  metadataUrl: String      # pre-signed S3 URL
  mapUrl: String           # pre-signed S3 URL
  mapDepthUrl: String      # pre-signed S3 URL
  mapPhUrl: String         # pre-signed S3 URL
  landscapeGeoJsonUrl: String  # pre-signed S3 URL
  inputGeoJsonUrl: String  # pre-signed S3 URL
  classifiedGeoJsonUrl: String # pre-signed S3 URL
}
```

**Implementation:** Each resolver constructs the S3 key from the SOCModelRun ID + known filename, calls `s3.getSignedUrl('getObject', ...)` with a reasonable expiry (e.g. 1 hour). No schema migration needed - these are computed fields.

**Blocking question:** What is the S3 key pattern for model output files? If it's `{workflowId}/{filename}`, this is trivial. If it's something else, Cadel needs to confirm the pattern.

**Scope estimate:** ~2 hours if key pattern is known. [high confidence]

### 2. Property data query

**What:** Confirm that the existing GraphQL schema exposes property name, address, and total area for a given property ID.

**Why this might already be done:** These are core Property entity fields. The frontend (farmer platform) already queries them. The snapshot engine needs the same data - it may just need to call the same existing query from a Frontier context.

**What's NOT needed from the property query:**
- Production system (pasture/cropping) - comes from `input.geojson` paddock features, already covered by S3 URLs above
- Contact name/email - comes from the requesting user's session context in Frontier
- Rainfall - comes from `metadata.txt`, already covered by S3 URLs above

**Scope estimate:** Likely zero new work if existing queries cover these fields. ~1 hour if a new composite query is preferred. [high confidence]

### 3. Trigger model run from Frontier + query latest completed run

**What:** Two parts:

**3a. Trigger a fresh model run** when the Growth user clicks "Request HORIZON Snapshot" via the Actions button in Frontier's right-hand nav. This should call the existing `socModelRunTrigger` mutation on the defined property area. The mutation already exists and starts a `RunModelUnifiedWorkflow` in Temporal. No new workflow logic needed — we're just wiring an existing mutation to a new UI action.

**3b. Query the latest completed run** so the snapshot tool can load results once the model finishes. A query that returns the most recent SOCModelRun where `status = COMPLETED` for a given project, ordered by completion date descending.

**Implementation (3b):** New resolver or query argument that wraps a Prisma `findFirst` with:
```typescript
prisma.sOCModelRun.findFirst({
  where: {
    project_id: projectId,
    status: 'COMPLETED'
  },
  orderBy: { completed_at: 'desc' }
})
```

Combined with the S3 URL resolvers from item 1, this single query returns the completed run AND all its output file URLs.

**Blocking question (3a):** Does the `socModelRunTrigger` mutation require any parameters beyond project ID? And does the Frontier property detail view have access to the project context needed to call it?

**Scope estimate:** 3a is potentially zero new backend work if the mutation is already exposed via GraphQL and Frontier just needs to call it. 3b is ~1-2 hours. [high confidence]

---

## What's explicitly NOT in Phase 0.5 scope

These are all Phase 1 items from the March architecture. They remain the long-term vision but are not needed for Phase 0.5:

| Phase 1 item | Why not needed now |
|---|---|
| Model auto-trigger (fully automated, no user action) | Phase 0.5 uses the existing `socModelRunTrigger` mutation via a user-initiated action in Frontier. Fully automated triggering (on HubSpot ticket creation, no human click) is Phase 1 |
| Completion webhook / orchestration layer | Phase 0.5 stretch: simple webhook to HubSpot on completion. Full orchestration layer is Phase 1 |
| Zone spatial description generation (Query A from March doc) | Engine parses `horizon_landscape.geojson` client-side for zone data |
| Tokenised URL delivery (`agriprove.io/snapshot/[token]`) | PDF export via Puppeteer, manual download/send |
| Engagement tracking (open, scroll, CTA clicks) | Not applicable until tokenised URL delivery exists |
| Pipeline queue view in Frontier | Volume doesn't justify this yet |
| HubSpot email draft auto-population | Manual send for now |
| Error handling / failure state orchestration | Basic UI error states only |

---

## Mapping Phase 0.5 to March tickets

| March Ticket | Phase 0.5 equivalent | Notes |
|---|---|---|
| Ticket 1 (auto-trigger) | Not needed | Manual trigger from Frontier |
| Ticket 2 (completion webhook) | Not needed | Query for existing completed runs |
| Ticket 3 (data assembly) | Simplified to S3 URL resolvers + property query | No orchestration layer; engine does its own parsing |
| Ticket 4 (copy generation) | Handled client-side | Engine calls Claude API from its own server |
| Ticket 5 (error handling) | Basic UI error states | No pipeline failure orchestration |
| Ticket 6 (delivery) | PDF export via Puppeteer | No tokenised URLs yet |
| Tickets 7-13 | Phase 1+ scope | Queue view, notifications, engagement tracking |

---

## Proposed GraphQL query shape

```graphql
query SnapshotData($propertyId: ID!) {
  property(id: $propertyId) {
    name
    address
    totalArea {
      area_hectares
    }
  }
  latestCompletedSOCModelRun(projectId: $projectId) {
    id
    status
    completedAt
    metadataUrl
    mapUrl
    mapDepthUrl
    mapPhUrl
    landscapeGeoJsonUrl
    inputGeoJsonUrl
    classifiedGeoJsonUrl
  }
}
```

This is a suggestion - the actual shape should follow existing schema conventions. The key point: one or two queries that return everything the engine needs. The frontend fetches the pre-signed URLs and downloads the files client-side.

---

## Snapshot tool delivery: pop-out tab (not modal)

The snapshot tool opens as a **new browser tab** from Frontier, not a modal overlay. This keeps Phase 0.5 scope minimal: zero Frontier frontend changes beyond a link/button.

**Entry point:** Frontier property detail view shows a "Generate Snapshot" action when a completed SOCModelRun exists for that property's project. Clicking it opens `frontier.agriprove.io/snapshot?propertyId={id}` in a new tab. The snapshot tool auto-fetches data via the GraphQL queries described above.

**Exit point:** After the Growth member reviews, generates narratives, and exports/sends the PDF, a "Back to Frontier" link returns them to the property view.

---

## Ticket lifecycle and notification routing

The snapshot workflow runs through the existing **HORIZON Snapshot Requests** HubSpot pipeline (ID: `1433968072`). Currently has 3 stages; we propose adding 1 new stage.

### Current pipeline (3 stages)

| Stage | Stage ID | Current usage |
|---|---|---|
| New HORIZON Snapshot Request | `2379316691` | Auto-created on Frontier request. 89 of 90 tickets sit here. |
| Snapshot In Progress | `2379316693` | Unused. Zero tickets. |
| Complete & Sent | `2379316694` | 1 ticket (manually moved). |

### Proposed pipeline (4 stages)

| Stage | Status | Trigger | Automation |
|---|---|---|---|
| **New HORIZON Snapshot Request** | Existing | Frontier form submission creates ticket | None needed (already works) |
| **Snapshot In Progress** | Existing (repurposed) | Model run triggered via `socModelRunTrigger` mutation or `socruns` poller | Webhook from BFF on SOCModelRun creation (status = `NOT_STARTED`) moves ticket to this stage |
| **Ready for Review** | **NEW** | Model run completes (SOCModelRun status = `COMPLETED`) | Webhook from Temporal worker on completion moves ticket. **HubSpot workflow on stage entry** fires two actions (see below) |
| **Complete & Sent** | Existing | Growth member sends snapshot PDF to landholder | Manual move by Growth (Phase 0.5). Automated via snapshot tool webhook (Phase 1) |

### Double routing on "Ready for Review" entry

A single HubSpot workflow triggered on ticket entering the "Ready for Review" stage fires two parallel actions:

1. **Teams channel post** — Posts to `Product > Platform Notifications` channel. Message tags the ticket owner (Growth member) and includes a direct link to the snapshot tool with the property ID pre-loaded. This uses HubSpot's native Microsoft Teams integration (already available in the HubSpot account).

2. **HubSpot task** (optional) — Creates a task assigned to the ticket owner: "Review and send HORIZON Snapshot for [property name]". Provides a second notification path via HubSpot's task queue.

### What the Teams notification looks like

```
@Ben — HORIZON Snapshot ready for review

Property: Dawlish Road (George Williams)
Model run completed: 2026-05-05 16:30 AEST

Review and send: https://frontier.agriprove.io/snapshot?propertyId=abc123

HubSpot ticket: https://app.hubspot.com/contacts/24224559/record/0-5/254383356380
```

### Backend work required for lifecycle automation

| Item | Scope | Phase |
|---|---|---|
| Webhook on SOCModelRun creation (NOT_STARTED) → move HubSpot ticket to "Snapshot In Progress" | 1 API call in BFF mutation | Phase 0.5 stretch |
| Webhook on SOCModelRun completion (COMPLETED) → move HubSpot ticket to "Ready for Review" | 1 API call in Temporal worker | Phase 0.5 stretch |
| HubSpot workflow: on "Ready for Review" entry → Teams post + optional task | HubSpot config only, no code | Phase 0.5 |
| Add "Ready for Review" stage to the HORIZON Snapshot Requests pipeline | HubSpot config only | Phase 0.5 |
| Snapshot tool sends webhook on PDF send → move ticket to "Complete & Sent" | Future enhancement | Phase 1 |

The webhook calls use HubSpot's Tickets API (`PATCH /crm/v3/objects/tickets/{ticketId}`) to update `hs_pipeline_stage`. The ticket ID needs to be associated with the property/project somewhere queryable. This is likely already the case via the contact or company association on the ticket.

---

## What we already know from the codebase

Before the meeting, here's what I've confirmed against the backend reference docs:

**Property data (Q2): Answered — likely zero work.** Property entity has name, address, and area as core fields. These are already surfaced in GraphQL for the farmer platform and Frontier. [high confidence]

**SOCModelRun query by project + status (Q3): Answered — trivial.** The `socruns` poller already queries `SOCModelRun` by project + status in Prisma. A new resolver wrapping a similar `findFirst` is a few lines. [high confidence]

**`socModelRunTrigger` mutation (Q7): Partially answered.** The mutation exists and triggers `RunModelUnifiedWorkflow`. Takes project ID, inference date, model version, and boundary hash (computed at runtime from parcels). The mutation is already exposed via GraphQL. Frontier may just need to call it. [moderate confidence — need to confirm Frontier has the right context to call it]

**CORS for pre-signed S3 URLs (Q5): Precedent exists.** `StratificationRun` already has `presigned_url` sub-resolvers with 1-hour expiry that serve shapefile downloads to the browser. If those work from Frontier's domain, CORS is already configured. The SOCModelRun resolvers would follow the same pattern. [moderate confidence]

**`completed_at` field (Q4): Likely `updated_at` fallback.** Standard Prisma models have `created_at` and `updated_at`. If `completed_at` doesn't exist on `SOCModelRun`, `updated_at` works because the last mutation on a `COMPLETED` run is the status transition itself. [moderate confidence]

**Existing `HorizonSnapshotRequest` mechanism (architectural note):** The BFF already has a snapshot request flow (Pattern C — immutable log). `HorizonSnapshotRequest` creates a log entry and sets `User.horizon_snapshot_request_progress = REQUEST_SUBMITTED`, then fires a Teams notification. Everything after `REQUEST_SUBMITTED` (`ANALYSIS → COMPLETED → EMAIL_SENT`) is currently manual back-office. Phase 0.5 automates the `ANALYSIS → COMPLETED → EMAIL_SENT` portion by wiring the snapshot engine into Frontier. The existing `HorizonSnapshotRequest` log and `socModelRunTrigger` mutation remain separate concerns — the request logs the "who asked for what", the trigger starts the compute.

## Remaining questions for Cadel

| Question | Priority | Impact |
|---|---|---|
| What is the S3 key pattern for model output files? | Critical | Determines how resolvers construct the path. StratificationRun's `presigned_url` pattern is the precedent — is it `{workflowId}/{filename}` or different? |
| Does `socModelRunTrigger` require any context that Frontier doesn't currently have? | High | If Frontier already has the project ID and can pass inference date, this may be zero backend work |
| Is there a `completed_at` timestamp on SOCModelRun, or do we use `updated_at`? | Medium | Needed for ordering. `updated_at` is fine if `completed_at` doesn't exist |
| Is the HubSpot ticket ID associated with the Property or contact on the ticket? | Medium | Needed for the webhook that moves the ticket when the model completes. May need to query HubSpot by contact email to find the matching ticket |

---

## Summary

Phase 0.5 backend work is three resolver-level changes, no schema migrations, no new tables, no workflow changes. Estimated total: ~1 day for the P0 API items. The lifecycle automation (HubSpot ticket movement + Teams notification) is config-driven via HubSpot workflows and two small webhook calls, adding ~0.5 days if done in the same sprint. This gets us from manual Canva snapshots (45 min/property) to automated generation with notification routing, with the full Phase 1 pipeline as the next evolution.
