# Canva autofill fields ≠ Components; Data autofill is Enterprise-only

**Date:** 2026-07-13
**Source:** Live verification via Canva connector on brand template `EAHPP0leWCg` /
design `DAHPP8wSh1E`; Canva developer docs ([autofill guide](https://www.canva.dev/docs/connect/autofill-guide/),
[autofill API](https://www.canva.dev/docs/connect/api-reference/autofills/)) and
[Help Centre — Data autofill](https://www.canva.com/help/data-autofill/).
**Context:** HORIZON Snapshot native rebuild — verifying Daniel's brand-template field work.

## The finding [high]

Making a Canva **Component** (name + component controls) does **NOT** create an
autofill data field. Daniel built a component named `horizon_summary`; after
publishing the design as a Brand Template (`EAHPP0leWCg`), the Connect API
`get-brand-template-dataset` returned `{}` (empty) and `search-brand-templates
dataset=non_empty` did not list it. Confirmed three ways: empty dataset read,
absent from non_empty search, present only under `dataset=any`.

Two pieces of prior guidance in the How-To artifact were WRONG and have been
corrected: (1) "rename a layer", and (2) "Create component → Component settings
→ Data field / Connect data". Neither is the real mechanism.

## The correct mechanism

Autofill fields are created with the Canva **Data autofill app**:
Editor → **Apps** → (More from Canva) **Data autofill** → **Custom** → Continue
→ select element → **Data field** button on the floating toolbar → type exact
name → **Add** → repeat → **Publish as Brand Template**.

## The gate that likely blocks us [high]

- The **Data autofill** feature is **Canva Enterprise only** (Enterprise admin,
  developer, or brand designer). If the "Data field" button doesn't appear, the
  org isn't on Enterprise.
- The Connect **Autofill API** requires the acting user to be an Enterprise
  member — for BOTH the integration developer and every integration user.
- This explains why Daniel reached for Components: that feature is available on
  lower tiers; Data autofill was not. **Open question:** is AgriProve on Canva
  Enterprise? If not, the autofill-endpoint path is closed.

**RESOLVED 2026-07-13 (Daniel):** AgriProve is on **Canva Pro with Teams**, not
Enterprise. So the Data-autofill app and the Connect Autofill API are unavailable.
This does NOT block us: the **editing-API path is confirmed working on Pro/Teams**
(create-design-from-brand-template + start-editing-transaction + perform-editing-operations
+ export all ran on this subscription today, twice). Brand-template publishing also
works on Pro/Teams (Daniel published EAHPP0leWCg; needs admin/brand-designer role, not
Enterprise). Net: editing-API path is the production route; Enterprise is optional and
only buys visual field-tagging + a simpler fill call. Bulk Create (Pro/Teams native,
CSV-driven, batch, 300-row cap) is a possible manual stopgap, not the automated pipeline.

## What we use instead — proven [high]

The **editing-API fill path** works under a **Member seat**, no Enterprise, no
publish, no data fields. Proven end-to-end on the **Rosemont** property
(568.37 ha, 491.95 ha eligible, Alberton TAS) on 2026-07-13:
`create-design-from-brand-template` → `start-editing-transaction` →
`perform-editing-operations` (replace_text on cover `property_name` +
`horizon_summary`) → `commit` → `export-design` (PDF). Cover and page-2 summary
filled with real property data; single clean P