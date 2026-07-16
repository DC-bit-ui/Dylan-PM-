# D&D National Property API — Requirements Doc Task
**Date:** 2026-05-19
**From:** Claude Code (EIH Automation repo)
**To:** Cowork — `agriprove-pm` / `stakeholder-comms` skill
**Action requested:** Polish the draft below into a stakeholder-ready document for Dylan to send to Dye & Durham.

---

## Context for Cowork

D&D came back to Dylan today asking for AgriProve's requirements before they progress the API Connect request. The original request was made several weeks ago and stalled until now. Dylan needs a concise doc to reply with — enough to let D&D scope the integration and quote, not an exhaustive technical spec.

I (Claude Code) built the title-api abstraction in `web/src/lib/title-api/` over the past two days. The full technical context is fresh from that work. The draft below is sendable as-is, but I'm flagging it for `agriprove-pm` polish so the tone, format, and stakeholder framing match AgriProve's external-comms voice. Specifically:

- Tighten the "About AgriProve" para — I've kept it generic but you'll have the standard one-pager phrasing
- Confirm tone (technical-professional vs warmer commercial)
- Check the volume estimate — I've used `~hundreds of titles per year, dozens of projects` (deliberately fuzzy on commercial sensitivity). If Dylan wants firmer numbers, you have the project pipeline in HubSpot
- Confirm who to address — generic "API Connect / Partnerships team" placeholder; might have a named contact in Dylan's recent Outlook thread with D&D
- Add Dylan's preferred sign-off block

**Output:** save the polished version to `memory/deliverables/2026-05-19-dds-api-requirements.md` and (optionally) mirror to Notion under the EIH Automation project page. Don't auto-send to D&D — Dylan reviews + sends.

---

## Draft requirements document (technical content)

# AgriProve × Dye & Durham — National Property API Integration Requirements

**Prepared by:** AgriProve (Dylan Cronje, Product Manager)
**Date:** 2026-05-19
**Purpose:** Define the integration AgriProve needs from D&D's National Property API so D&D can scope, quote, and schedule onboarding.

## 1. About AgriProve

AgriProve is an Australian agtech company operating in the soil-carbon measurement space. We register and manage carbon projects on behalf of landholders under the Australian Government's Emissions Reduction Fund (ERF). Each project requires identifying every Eligible Interest Holder (EIH) on every land title in the project boundary — owners, mortgagees, caveators, easement holders, Crown — per the Carbon Farming Initiative Act 2011, sections 43–45A.

We are currently registering several dozen projects per year, each containing 5–20 land titles across the six freehold states (NSW, QLD, VIC, SA, WA, TAS).

## 2. Why we're integrating

Title ordering and parsing is currently a manual process pushing our operators into 14-hour days on high-volume projects. We have built an internal automation platform that:
- Takes land title data as structured JSON
- Classifies every party on title against the CFI Act EIH framework
- Generates consent forms (PandaDoc), KCTs, and CER ERF-002 registration CSVs
- Syncs to HubSpot and SharePoint for downstream workflows

D&D's National Property API is the missing piece for **automated title acquisition** — the operator initiates an order from inside our platform, sees a per-title quote, approves the purchase, and the title flows directly into our pipeline with structured data already typed.

## 3. Required capabilities

### 3.1 Title search
- **Inputs we'll send:** lot, plan number/type, address, state (auto-detected client-side where possible)
- **Expected output:** title-reference match, structured JSON containing the searched parcel + a per-title quote (cost in cents, AUD)
- **Coverage:** national — all six freehold states. We do not currently need NT or ACT but would not refuse them.

### 3.2 Purchase / order
- **Trigger:** server-side POST after operator approval of the quote
- **Expected output:** the full structured payload (see 3.3) + a downloadable PDF of the title (signed URL or attachment)
- **Billing model:** see §5

### 3.3 Structured payload — required fields
For every purchased title we need (where present on the underlying register):
- Title reference / folio identifier
- Volume + folio (where the state uses them)
- Lot + plan number + plan type
- State
- Land description fields applicable to the state (parish / county / hundred / land district / section)
- Address + LGA
- Registered owners (name, individual vs company, share, ACN where applicable)
- Tenancy (sole / joint / tenants-in-common / mixed)
- Interested parties, **pre-typed by category** — we expect Financial / Legal / Administrative groupings
- For each party: name, ACN (if a company), dealing reference, dealing type (mortgage / caveat / easement / charge / covenant / Crown reservation / etc), and for easements an indication of **burdening vs benefiting** the land
- Leasehold flag + tenure reference where the title is Crown leasehold

### 3.4 PDF
- The original Register Search Statement PDF as a downloadable attachment or signed URL. We persist this alongside the structured data for audit and CER lodgement evidence.

### 3.5 State-specific behaviours we need handled
- **NSW:** AUTO CONSOL folios should return the consolidated parcel list (one search → multiple lots) rather than requiring per-lot searches
- **QLD:** distinct treatment of Current Title Search (freehold) vs Current State Tenure Search (leasehold)
- **VIC:** Crown Grant vs non-Crown Grant titles return different boilerplate — we handle both downstream but need them returned consistently
- **TAS:** mortgage TRANSFER chains should resolve to the **current** mortgagee, not the original
- **SA:** Sections vs Allotment/Plan land description systems both supported
- **WA:** memorials returned but flagged as non-interested-party (they look like encumbrances but aren't EIHs)

## 4. Auth + integration shape

- **Auth:** Bearer token / API key in `Authorization` header. Per-environment keys (sandbox + production) preferred.
- **Calling pattern:** server-to-server from our Next.js application backend. No client-side calls to D&D.
- **Webhook callbacks:** preferred but not required for order status — we can poll if the API supports a status endpoint. If webhooks are available we'd consume them at a registered URL.
- **Sandbox:** we need a non-billing sandbox environment for development, integration testing, and CI.

## 5. Billing model

We are open to either of:
1. **Corporate account, monthly invoice.** AgriProve account holds the credit; all API-driven purchases bill against it; D&D sends a monthly invoice. Operators don't enter card details per order.
2. **Per-call tokenised billing.** Operator-entered card via our payment processor (Stripe Elements) generates a tokenised payment method we pass to D&D per order; D&D charges the token directly.

Please tell us which you support. We can build for either, but Option 1 is operationally cleaner for us at our volume.

## 6. Volume

- ~hundreds of title searches per year today, scaling as our project pipeline grows
- Burst pattern: a single project may order 5–20 titles within a few hours when the operator begins boundary work; otherwise spread across the working week
- We expect AEST business-hours weighted usage, occasional out-of-hours

## 7. Questions for D&D

To help us complete the technical design, please confirm:

1. **Endpoint contract:** is there a public OpenAPI / Swagger spec we can consume? Or sample request/response payloads we can review?
2. **Structured JSON output:** is the categorised-parties format (Financial / Legal / Administrative) standard, or by request / per product tier?
3. **PDF delivery:** signed URL, base64 attachment, or both?
4. **Pricing tiers:** what's the per-title cost at our volume, and is there a discount tier we'd qualify for?
5. **Sandbox:** is there a developer-portal sandbox or do we work in a discounted/mock production tier during integration?
6. **Onboarding timeline:** from contract signature to live credentials, what's the typical lead time?
7. **Rate limits + SLA:** what limits should we plan around?

## 8. Contact

**Dylan Cronje** — Product Manager, AgriProve
Email: dylan@agriprove.io

We can move fast — the platform is built; D&D is the last unblocked integration before we go live with the automated buy flow. A short kickoff call with your technical team would let us close out the remaining questions in one pass.
