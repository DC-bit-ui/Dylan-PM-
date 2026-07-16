# Azure AD App Registration Request — Draft to AgriProve IT

**Date:** 2026-05-25
**From:** Dylan
**To:** AgriProve IT (whoever handles M365 tenant admin — likely Kieren or someone he routes to)
**Purpose:** Provision an Azure AD app registration so the EIH automation tool can read AgriProve's SharePoint via Microsoft Graph (Files.Read.All + Sites.Read.All), replacing the current mock that reads from local sample-titles/.
**Outcome needed:** four values back — tenant ID, client ID, client secret, site ID.

---

## Plain-text message (copy-paste ready)

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

## Context for Dylan (not for IT)

### What unlocks once these four values arrive

`web/.env.local`:
```
SHAREPOINT_TENANT_ID=<tenant GUID>
SHAREPOINT_CLIENT_ID=<client GUID>
SHAREPOINT_CLIENT_SECRET=<secret value>
SHAREPOINT_SITE_ID=<site ID>
SHAREPOINT_ROOT_PATH=/Shared Documents/SHARED AP/Projects/ERF Projects  # already defaulted in code
```

`getSharePointClient()` in `web/src/lib/sharepoint.ts` automatically swaps from `MockSharePointClient` to `MsGraphSharePointClient` once all four are set. No code change. The dev server needs a restart to re-read the env, but otherwise it's transparent.

After restart, the SharePoint sync flow on the Frontier tab and the KCT discovery on the EIH consent panel both run against live AgriProve SharePoint, not the local `sample-titles/` mock.

### Why these specific scopes

- **Files.Read.All** — needed to read PDF contents inside each project folder. Without it, the tool can list folder structure but can't download the PDF bytes for parsing.
- **Sites.Read.All** — needed for the search-within-site operation that finds the project folder by name. Specifically: `GET /sites/{siteId}/drive/root:/{path}:/search(q='Hodges')`. Without it, every project lookup would have to be by hardcoded path, which doesn't scale.

Both are application-scope (not delegated). The tool runs server-to-server with no user logged in. Standard pattern for service integrations.

### Risk surface to flag to IT if asked

- **Files.Read.All is tenant-wide read.** Once the secret is in the env file, anything that holds the secret can read any SharePoint file in AgriProve's tenant. The tool only reads under SHARED AP/Projects/ERF Projects, but the *capability* is broader. IT may want to:
  - Scope to a single SharePoint site via a Graph application access policy (`New-MgApplicationAccessPolicy`) — limits the app's reach to one site only, which is the tighter posture
  - Or accept the broad scope on the basis that the secret only lives on the dev machine
  - Either is fine; the tighter policy is preferable if IT will set it up.
- **Secret rotation.** 24-month expiry default. Calendar reminder needed before that date or the tool starts failing silently with 401s.

### If IT pushes back on the broad scope

Fallback: ask for the same two permissions but scoped via an application access policy to one specific SharePoint site (the AgriProve site that holds `SHARED AP/Projects/ERF Projects`). Documentation: https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access — same concept applies to Sites permissions via `New-MgApplicationSitesSelectedAccessPolicy`. Slightly more setup, much tighter access surface.

### When this work blocks vs doesn't block

- **Doesn't block:** the rest of the EIH automation tool. Mock SharePoint client keeps the UI working with `sample-titles/`.
- **Does block:** the "live project, real-data demo" Dylan wants for stakeholder review. Hodges/Felmingham mock has 2 PDFs; live SharePoint has whatever's actually filed for the project.
- **Becomes critical when:** the tool is rolled out to ops staff (Will, DJ) running real projects, not just Hodges in dev.
