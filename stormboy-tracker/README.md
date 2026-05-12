# Stormboy Conversion Tracker

Live dashboard tracking AgriProve's HubSpot sales pipeline — conversion times, era comparisons, loss analysis, Stormboy recruitment funnel, and AI-powered insights.

## Quick Start

```bash
cp .env.example .env
# Edit .env with your tokens (see below)
npm install
npm start
# Open http://localhost:3000
```

## Environment Variables

### HUBSPOT_TOKEN (required)

A HubSpot Private App token with read access to contacts and deals.

**To create one:**

1. Go to your HubSpot account > Settings (gear icon)
2. Left sidebar: Integrations > Private Apps
3. Click "Create a private app"
4. Name: `Stormboy Tracker` (or whatever you like)
5. Scopes tab — enable these:
   - `crm.objects.contacts.read`
   - `crm.objects.deals.read`
6. Click "Create app", then copy the token

Paste the token into `.env`:
```
HUBSPOT_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### ANTHROPIC_API_KEY (required for AI features)

Powers the "Analyse" buttons throughout the dashboard. Uses Claude Haiku (~$0.01 per click).

1. Go to https://console.anthropic.com/settings/keys
2. Create a new key
3. Paste into `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
```

If omitted, the dashboard still works — AI buttons will show an error when clicked.

## Docker

```bash
docker build -t stormboy-tracker .
docker run -p 3000:3000 --env-file .env stormboy-tracker
```

## Architecture

```
server.js              Express server (Node 18+)
├── GET  /             Serves the dashboard
├── POST /api/hubspot/search        Proxies to HubSpot CRM search API
├── POST /api/hubspot/associations  Batch contact→deal association lookup
├── POST /api/ai/analyze            Proxies to Anthropic Messages API
└── GET  /api/health                Config status check

public/
└── index.html         Self-contained dashboard (HTML + CSS + JS + Chart.js)
```

The frontend is a single HTML file with no build step. All data is fetched live from HubSpot via the server proxy. The server exists solely to keep API tokens server-side.

## What It Shows

- **Overview** — total deals, median conversion time, win rate, era breakdown, Stormboy vs pre-Stormboy comparison
- **Recent Wins** — expandable deal cards with per-stage timing vs benchmarks, AI deal-level insights
- **Loss Analysis** — conversion funnel, drop-off analysis, loss rate by era, quarterly trends, AI pattern analysis
- **SB Funnel** — Stormboy recruitment pipeline (contact-level), exit reasons, call outcomes, milestone conversion rates
- **Process Evolution** — stage duration comparison across Legacy / KCT / Stormboy v1 / v2 eras
- **Deal Ranking** — all won deals ranked by speed with expandable stage breakdowns
- **Active Pipeline** — current deals with age, risk flags, predicted close dates, at-risk isolation filter
- **Trends** — quarterly conversion median and volume trends
- **Deep Dive** — per-deal inspection with AI analysis

## Notes

- HubSpot portal ID `24224559` is hardcoded in deal links. Change it in `public/index.html` if your portal differs.
- The Stormboy contact filter uses `storm_boy_campaign_member = Yes`. This is an AgriProve custom property.
- Pipeline ID `default` and deal stage IDs are specific to AgriProve's HubSpot config.
