# Message to AgriProve IT — Azure AD App Registration

**Date:** 2026-05-25
**From:** Dylan (via Claude Code, EIH Automation repo)
**For:** Dylan to copy-paste into Teams thread / email to AgriProve IT (whoever handles M365 tenant admin — likely Kieren or someone he routes to)
**Cowork action:** Surface this message inline so Dylan can copy in one click. If the `agriprove-pm` skill knows which IT contact this should route to (per Teams DM history or AgriProve org chart), include that as a suggested recipient. Do NOT auto-send.

---

## Message (copy-paste ready)

```
Hi [name],

I need to set up an Azure AD app registration in the AgriProve M365 tenant so the EIH automation tool can read our SharePoint folders via Microsoft Graph. Currently the tool runs against a local mock — to demo it end-to-end with real project data (Hodges/Felmingham first) we need read access to the live SharePoint structure under "SHARED AP > Projects > ERF Projects".

What I need from you (about 10 minutes of clicking, no scripting):

1. Create a new app registration

   - Azure Portal → Microsoft Entra ID → App registrations → New registration
   - Name: AgriProve EIH Automation (or whatever convention fits)
   - Supported account types: Single tenant (just AgriProve)
   - Redirect URI: leave blank (server-to-server, no user login flow)
   - Click Register

2. Grant Microsoft Graph permissions

   - Inside the new app → API permissions → Add a permission → Microsoft Graph → Application permissions
   - Add these two:
       Files.Read.All
       Sites.Read.All
   - Both must be APPLICATION permissions, not Delegated — the tool runs
     server-to-server with no user logged in.
   - Click "Grant admin consent for AgriProve" on both permissions.
     This step requires admin rights — if you can't grant it yourself,
     it needs whoever holds Global Admin in the tenant.

3. Generate a client secret

   - Inside the new app → Certificates & secrets → Client secrets → New client secret
   - Description: "EIH automation tool"
   - Expiry: 24 months (or AgriProve's policy default)
   - Important: copy the secret VALUE immediately after creation. Azure
     only shows it once — if it's lost, generate a new one.

4. Find the SharePoint site ID

   - Open the AgriProve SharePoint site in a browser (the one containing
     "SHARED AP > Projects > ERF Projects").
   - Either:
     a) Use Graph Explorer (https://developer.microsoft.com/graph/graph-explorer):
        GET https://graph.microsoft.com/v1.0/sites/agriprove.sharepoint.com:/sites/<site-path>
        — the response includes an "id" field (looks like
        "agriprove.sharepoint.com,xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx,
         yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy")
     b) Or just send me the site URL and I'll resolve the ID via Graph
        Explorer myself once I have the other three values.

5. Send back these four values:

   - Tenant ID:        <GUID>
   - Client ID:        <GUID>
   - Client secret:    <the secret VALUE, not the secret ID>
   - Site ID:          <or just the site URL if step 4 is faster for me>

Plus the expiry date on the client secret so I can put a calendar reminder
in for renewal.

Notes for context:
  - The tool only READS from SharePoint. No write scopes requested.
  - All four values land in the tool's environment file (web/.env.local on
    the dev machine), which is gitignored — they never go to source
    control.
  - The two permissions (Files.Read.All + Sites.Read.All) are read-only at
    application scope. The tool can read any SharePoint file in the
    tenant. Justification: it needs to walk the "ERF Projects" folder
    tree which sits under SHARED AP, and per-folder scoping isn't
    practical when project folders are created dynamically by ops.

Happy to walk through any of the steps on a call if easier.

Thanks,
Dylan
```

---

## Notes for Cowork's `agriprove-pm` skill (optional polish)

- If IT typically pushes back on broad tenant-wide read scopes, consider adding the fallback note: "if you prefer, I can scope the app to one SharePoint site only via a Graph application access policy — let me know and I'll provide the exact PowerShell commands". Full background in `memory/deliverables/2026-05-25-azure-ad-app-registration-request-it.md` under "If IT pushes back on the broad scope".
- The recipient name and Teams channel for IT requests should be inferred from Dylan's Teams DM history if Cowork has that access.
- Calibrate tone — IT requests at AgriProve tend to be transactional. Keep the warmth, drop any over-explaining if Cowork knows IT prefers terse.

**Don't auto-send.** Dylan reviews and posts manually.

---

## Related deliverables

- Full IT request with context: `memory/deliverables/2026-05-25-azure-ad-app-registration-request-it.md`
- HubSpot EIH property map: `memory/deliverables/2026-05-25-hubspot-eih-property-map.md`
- Cowork diagram brief (HubSpot EIH flow): `inbox/cowork/2026-05-25-hubspot-eih-property-diagram-brief.md`
- PandaDoc template UID request to Kieren: `inbox/cowork/2026-05-25-pandadoc-uid-request-kieren-message.md`
