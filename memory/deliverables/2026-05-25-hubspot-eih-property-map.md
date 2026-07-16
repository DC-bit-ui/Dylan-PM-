# HubSpot EIH Property Map

**Date:** 2026-05-25
**Purpose:** Authoritative map of every HubSpot Deal property the EIH automation tool reads or writes. Used to (a) brief Kieren / HubSpot admin when creating the missing properties, (b) source for the Cowork operational-flow diagram, (c) audit reference for compliance.
**Status:** Reflects code in `web/src/lib/hubspot.ts` and `web/src/app/api/hubspot/setup-deal-properties/route.ts` as of 2026-05-25 (after the LawrieCo partner-wiring commit).

---

## TL;DR

| Direction | Count | Notes |
|---|---|---|
| **Read** from HubSpot (deal → project) | 7 existing properties | All standard or already created. `partner` is the new one to know about. |
| **Write** to HubSpot (project → deal) | 7 new properties to create | Property group: `agriprove_eih_summary`. All optional from HubSpot's perspective — adding them doesn't break existing UI. |
| Captured locally only (compliance) | 6 extra fields | Per `ProjectSummarySnapshot` table — granular EIH-type counts that HubSpot doesn't need but CER lodgement audits do. |

---

## Properties READ from HubSpot (already exist)

These power the deal-import + sync-pipeline-queue flows. The private-app token needs `crm.objects.deals.read` to consume them. No setup work — they're either HubSpot defaults or were already created by AgriProve admin.

| HubSpot internal name | Label | Type | Used by | Why we read it |
|---|---|---|---|---|
| `dealname` | Deal Name | string | Deal import, project listing | Becomes `Project.name`. |
| `pipeline` | Pipeline | enum | sync-pipeline-queue, workflow-band routing | Distinguishes Sales pipeline from Project pipeline. |
| `dealstage` | Deal Stage | enum | sync-pipeline-queue, landing-page workflow queue | Drives the band the project lives in (SLA Mapping, KCT Issued, Tn Sampling, Crediting). |
| `hubspot_owner_id` | Deal Owner | string | Workflow-queue display | Surface for who owns the deal in HubSpot. |
| `amount` | Deal Amount | currency | Project detail view | Commercial visibility for the operator. |
| `createdate` | Create Date | datetime | Sort order, audit | Project creation history. |
| **`partner`** | **Partner** | **enumeration** | **KCT template selection (NEW)** | **Enum values: `LawrieCo`, `KG2`, `Verterra`, `GreenCollar`. LawrieCo → LawrieCo's KCT template; null/other → AgriProve's. See §LawrieCo branch below.** |

### `partner` deep-dive (the operational lynchpin)

This single property is the only HubSpot field that **changes the legal document the system generates**. Mis-setting it = wrong KCT template fires for a LawrieCo client. Mis-reading it = same outcome. It is the highest-impact field in this entire map.

- **Where it lives in HubSpot:** Deal property, internal name `partner`, enumeration type
- **Where AgriProve sets it:** Manual today, per-deal in HubSpot. (Future state: automated when the inbound lead source identifies as a referral partner.)
- **Where the EIH tool reads it:** `lib/hubspot.ts:searchDeals` + `getDeal` request the `partner` property; both `/api/hubspot/deals/[id]/import` and `/api/hubspot/sync-pipeline-queue` persist it to `Project.partner`.
- **Where it shapes behaviour:** `/api/projects/[id]/kcts/create-pandadoc` branches: `project.partner === "LawrieCo"` → uses `PANDADOC_KCT_TEMPLATE_ID_LAWRIECO`; everything else uses `PANDADOC_KCT_TEMPLATE_ID`.
- **UI surface:** orange `partner: LawrieCo` badge in the project header, visible on every spoke so operators see which template a Create-KCT click will use before they click.
- **Audit:** the persisted `KCT` row's `notes` field records `(LawrieCo-registered project)` when the LawrieCo branch fires. Grepping notes confirms which template was used.

---

## Properties WRITTEN to HubSpot (need creating)

These are the 7-field rollup the project pushes to its associated HubSpot deal when the operator triggers a sync (per spec critical rule 4: no auto-writes — operator confirms). All sit under property group **`agriprove_eih_summary`**. Requires `crm.objects.deals.write` on the private-app token.

| HubSpot internal name | Label | Type | Source field | Why HubSpot needs it | Where it makes a difference |
|---|---|---|---|---|---|
| `agriprove_erfid` | AgriProve · ERF ID | text | `Project.erfId` | Single canonical ID linking HubSpot deal ↔ CER lodgement ↔ AgriProve project record | Reporting, audits, support tickets — anyone in HubSpot can grep an ERF ID and find the deal. |
| `agriprove_consents_outstanding` | AgriProve · Consents outstanding | number | `ProjectSummary.consentOutstandingCount` | At-a-glance "what's blocking" without opening the EIH app | Pipeline reviews; "we can't lodge until N drops to 0". |
| `agriprove_eih_summary` | AgriProve · EIH summary | long-text | Synthesised from owners, mortgagees, caveators, easements, Crown flag | One field summarises the entire EIH picture for stakeholders who don't have EIH-app access | Account exec running a review meeting; legal-team spot-checks; status updates that don't need raw data. |
| `agriprove_mortgagee_names` | AgriProve · Mortgagee names | long-text | `ProjectSummary.mortgageeNames` joined with `; ` | Bank-chase is a distinct workflow — kept separate from the summary for sort/filter | Quick filter: "which deals have CBA as mortgagee" → bulk bank engagement. |
| `agriprove_has_crown_eih` | AgriProve · Has Crown EIH | bool | `ProjectSummary.hasCrownEih` | Crown lands consent is a separate, slower process — early-warning flag | Triages projects that need state-government engagement; sets up Crown lands consent timeline expectations. |
| `agriprove_titles_progress` | AgriProve · Titles progress | text | `${titlesConfirmed}/${titlesTotal} confirmed` | Visible without clicking into the EIH app | Status calls — "we're at 5/7 on titles for the Hodges deal". |
| `agriprove_app_url` | AgriProve · Open in EIH app | text | Deep link to project workspace | Single click from HubSpot into the granular EIH app | Drives operators back to the canonical workspace when HubSpot's summary isn't enough. |

### How HubSpot admin creates these

Two options:

**Manual (preferred for first setup):**
1. HubSpot **Settings → Properties → Deals**
2. **Create property** for each row above, using exact internal name + type + label
3. Group them under a new property group: **AgriProve EIH summary**
4. No need to mark any required — the EIH tool writes them on sync

**Programmatic (future):**
1. Grant `crm.schemas.deals.write` to the private-app token
2. POST to `/api/hubspot/setup-deal-properties` with `{ create: true }` (route exists as GET today, returns the definitions; the write path is a TODO until the scope is granted)

---

## Properties captured LOCALLY only (compliance audit, never to HubSpot)

The "13 → 7 reduction" commit (`e30ae77`, 2026-05-13) deliberately keeps these out of HubSpot. They live in `ProjectSummarySnapshot` rows — one snapshot per HubSpot sync, retained forever for CER-defensible audit. Per spec critical rule on legal entity names + audit trail: "defensibly answer 'what state was this project in on date X' for CER lodgements."

| Local field | Why not in HubSpot |
|---|---|
| `eihCount` | Derivable from `agriprove_eih_summary` text; HubSpot doesn't need a separate count field. |
| `ownerNames` (full list) | Rolled into `agriprove_eih_summary`. Full granularity stays local. |
| `caveatorNames` (full list) | Same — folded into summary. |
| `easementHolderNames` (full list) | Same — folded into summary. |
| `consentRequiredCount` | HubSpot only needs the *outstanding* count (the actionable number). |
| `consentSignedCount` | Derivable (`required - outstanding`). |

Why the reduction: 13 fields in HubSpot bloats deal records, slows the deal-edit screen for non-EIH-relevant users, and creates more "stale data" surface area when the EIH app's truth drifts from HubSpot's cache between syncs. The 7-field surface gives the right operational visibility without polluting the deal object.

---

## Setup checklist for the AgriProve HubSpot admin (probably Kieren)

1. **Confirm `partner` enum values** are exactly: `LawrieCo`, `KG2`, `Verterra`, `GreenCollar` (already verified via HubSpot MCP 2026-05-25). No setup needed — already exists.
2. **Create the 7 new deal properties** under the `agriprove_eih_summary` property group. Internal names + types per the table above.
3. **Grant the private-app token** these scopes (or confirm if already granted):
   - `crm.objects.deals.read` (already in place — without it the existing import flow wouldn't work)
   - `crm.objects.deals.write` (needed for the EIH rollup sync to write back)
   - `crm.objects.contacts.read` + `crm.objects.companies.read` + `crm.associations.read` (already in place)
4. **Drop the token** into `web/.env.local` as `HUBSPOT_PRIVATE_APP_TOKEN` (already done if HubSpot integration is "live" in the app).

When all four are in place, the project's "Sync to HubSpot" button (existing UI) pushes the 7 fields per-project; the rest stays local.

---

## Cross-references

- Code source: `web/src/lib/hubspot.ts:DEAL_PROPERTY_NAMES`, `buildEIHSummaryString`, `summaryToProperties`
- Discovery route: `GET /api/hubspot/setup-deal-properties` — returns the same property definitions programmatically
- Local audit shape: `prisma/schema.prisma:ProjectSummarySnapshot`
- 13→7 reduction history: commit `e30ae77` (2026-05-13) "Compliance schema + reduce HubSpot rollup 13 → 7"
- LawrieCo partner branch: commit `00bd997` (2026-05-25) "LawrieCo partner-aware KCT template selection"
- Related Cowork diagram brief: `inbox/cowork/2026-05-25-hubspot-eih-property-diagram-brief.md` (next deliverable)
