# Stormboy Conversion Tracker

## What this is
Live HubSpot pipeline dashboard for AgriProve's sales team. Tracks conversion times, era comparisons (Legacy → KCT → Stormboy v1/v2), loss analysis, Stormboy recruitment funnel, and AI-powered insights via Claude Haiku.

## Architecture
- `server.js` — Express server, proxies HubSpot CRM API + Anthropic Messages API. Keeps tokens server-side.
- `public/index.html` — Self-contained frontend (HTML + CSS + JS + Chart.js). No build step.
- `Dockerfile` — Node 18 Alpine, ready to deploy.
- `demo.html` — Static demo with hardcoded data for team review. Not part of the production app.

## API Routes
- `GET /api/health` — Config status check
- `POST /api/hubspot/search` — Proxies HubSpot CRM v3 search. Accepts `offset` or `after` for pagination.
- `POST /api/hubspot/associations` — Batch contact→deal association lookup via HubSpot v4.
- `POST /api/ai/analyze` — Proxies Anthropic Messages API (Claude Haiku, ~$0.01/click).

## HubSpot specifics
- Portal ID: 24224559 (hardcoded in deal links)
- Pipeline: `default`
- Stage IDs: 64066367 (Qualified Account), 2929183214 (Discovery Call), 64066368 (Strategy Call), 64066369 (SLA/KCT Mapping), 1026535686 (KCT Issued), 231921676 (Closed Won), closedlost (Closed Lost)
- Stormboy contacts: `storm_boy_campaign_member = Yes` custom property
- Stormboy funnel: `contact_lead_stage_storm_boy` custom property (Identified → In Conversation → Farm Visit Booked → Farm Visit Complete → In Sales Pipeline → Exited)

## Environment variables
- `HUBSPOT_TOKEN` — HubSpot Private App token (scopes: crm.objects.contacts.read, crm.objects.deals.read, crm.objects.tickets.read — tickets scope verified live 2026-05-21)
- `ANTHROPIC_API_KEY` — Anthropic API key for AI analysis features
- `PORT` — Server port (default 3000)

## Deployment blockers
1. Need HubSpot admin to create Private App → generates the token
2. Need hosting decision (Docker on internal infra, or cloud: Railway/Render/Azure)

## Integration vision
The API proxy layer is designed to be shared — Claude Code agents (initiative-tracker, pm-strategist, Apex automation) can consume the same `/api/hubspot/search` endpoint instead of each needing their own HubSpot integration.

## Origin
Built in Cowork as an artifact, then converted to standalone app. Will Donovan requested this in the Stormboy standup (1 May 2026) — wants a live operational dashboard for Corporate Carbon showing conversion rates, bottlenecks, and pipeline tracking.

## Key decisions
- No database — all data live from HubSpot on each page load. Server exists solely to proxy API tokens.
- Single HTML frontend — no React, no build step. Keeps it simple and editable.
- Era classification: Stormboy = deals with associated contacts where `storm_boy_campaign_member = Yes`. KCT = has KCT Issued stage entry. Legacy = everything else pre-March 2025.
