# PandaDoc Access Request — Draft to Kieren

**Date:** 2026-05-21
**From:** Dylan (PM, EIH Automation)
**To:** Kieren
**Purpose:** Source PandaDoc API credentials + template UUIDs to enable live KCT and EIH consent form generation in the EIH automation tool.

---

## Draft message

> **Subject:** PandaDoc API access for EIH automation tool
>
> Hey Kieren,
>
> I'm wiring the EIH automation tool into our PandaDoc account so it can generate KCTs and EIH consent forms automatically when a project's land titles are confirmed (no more manual token-pasting per landholder). To turn the live integration on I need three things from the AgriProve PandaDoc account — happy to walk through any of them on a call if easier:
>
> **1. PandaDoc API key** *(blocker)*
> A workspace-level API key, generated under **Settings → API Keys** in PandaDoc. Read + write scope (the tool both searches existing docs and creates new ones from templates). I'll drop this into the tool's `.env.local` as `PANDADOC_API_KEY` — it never leaves the AgriProve environment.
>
> **2. KCT template UUID** *(blocker)*
> The UUID of the **production KCT template** we use today for landholder agreements. Found in the PandaDoc UI: open the template → the URL ends in `/templates/<UUID>`. Set as `PANDADOC_KCT_TEMPLATE_ID`. The tool will pre-fill it with project + property + title data (see token list below) instead of operators copy-pasting.
>
> **3. EIH consent form template UUID** *(may need creating)*
> Separate template for **mortgagees, caveators, easement holders, and Crown** to acknowledge the carbon project — distinct from the KCT (different signer class, different legal text). If this template already exists, send the UUID. If not, can you point me at who drafts our consent-form legal copy and I'll coordinate the template creation in PandaDoc? Set as `PANDADOC_EIH_CONSENT_TEMPLATE_ID`. Without it the tool falls back to operators preparing tokens by hand — functional but kills the time-save.
>
> **Template tokens the tool will populate** (so whoever maintains the templates can map them):
>
> *KCT template:* `project_name`, `erf_id`, `landholder_name`, `landholder_legal_entity`, `landholder_acn`, `eih_type`, `eih_section`, `property_name`, `property_address`, `property_lga`, `property_state`, `title_count`, `title_schedule`, `organisation_name`, `organisation_abn`, `hubspot_deal_id`, `today`
>
> *EIH consent template:* `project_name`, `erf_id`, `eih_name`, `eih_legal_entity`, `eih_acn`, `eih_type`, `eih_section`, `eih_dealing_ref`, `property_name`, `property_address`, `property_lga`, `property_state`, `title_count`, `title_schedule`, `organisation_name`, `organisation_abn`, `hubspot_deal_id`, `today`
>
> If a template token doesn't match these names exactly the field stays blank when the doc generates — happy to either rename the tool side or have the template editor adjust.
>
> Thanks,
> Dylan

---

## Context for Dylan (not for Kieren)

### What each item unlocks

| Item | Without it | With it |
|---|---|---|
| API key | Mock client returns no results; ops dashboard shows "PD mock"; KCT discovery fails to find existing SLAs | Live search across all PandaDoc docs (signed KCT/SLA detection); live doc creation |
| KCT template UUID | `/api/projects/[id]/kcts/create-pandadoc` falls back to a stub (just opens PandaDoc's new-doc page, operator pastes tokens) | One-click "Create KCT in PandaDoc" produces a pre-filled draft |
| EIH consent template UUID | `/api/projects/[id]/eihs/[eihId]/generate-consent` falls back to tokens-only stub. **The tool deliberately does NOT silently re-use the KCT template** — wrong legal document. This is the only real blocker on the EIH consent bulk-generation path | One-click + bulk "Generate all consent forms" for every mortgagee / caveator / easement holder / Crown EIH |

### Likely sticking points

- **API key scope:** PandaDoc keys are workspace-level; Kieren may want to scope to a dedicated workspace or generate a fresh key. Either is fine — the tool only needs documents + templates read/write.
- **EIH consent template creation:** if no consent template exists yet, this is genuinely net-new legal work, not just an IT request. Worth surfacing to LawrieCo too if Kieren isn't the one who'd draft it. Could be a 2-week task.
- **Audit / monitoring:** the tool tags every created doc with `eih_automation_project_id` + `eih_automation_eih_id` metadata in PandaDoc's `metadata` field, so all auto-generated docs are filterable + revocable from PandaDoc's UI if anything goes wrong.

### Env vars to populate once Kieren replies

```
# web/.env.local
PANDADOC_API_KEY=<key>
PANDADOC_KCT_TEMPLATE_ID=<uuid>
PANDADOC_EIH_CONSENT_TEMPLATE_ID=<uuid>
```

No code change needed after that — `getPandadocClient()` in `web/src/lib/pandadoc.ts` swaps from `MockPandadocClient` to `LivePandadocClient` automatically, and the EIH consent generator route checks for the consent-template UUID before going live.

### Cross-references

- Token list source: `web/src/lib/eih-consent.ts:buildConsentTokens` + `web/src/app/api/projects/[id]/kcts/create-pandadoc/route.ts`
- Mock fallback: `web/src/lib/pandadoc.ts:MockPandadocClient`
- Live client: `web/src/lib/pandadoc.ts:LivePandadocClient`
- Bulk EIH consent route: `web/src/app/api/projects/[id]/eihs/generate-all-consents/route.ts`
