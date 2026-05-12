const express = require('express');
const path = require('path');

// Load .env if present (no dependency — manual parse)
const fs = require('fs');
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq > 0) process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    });
  }
} catch (e) { /* .env is optional */ }

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Wire coaching routes (cache reads, refresh trigger). See coaching/engine/.
const { wireCoachingRoutes } = require('./coaching/engine/routes');
wireCoachingRoutes(app);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    hubspot: !!HUBSPOT_TOKEN,
    ai: !!ANTHROPIC_API_KEY
  });
});

// ---------------------------------------------------------------------------
// HubSpot CRM Search proxy
// POST /api/hubspot/search
// Body: same shape as HubSpot CRM search API (objectType, filterGroups, properties, limit, after)
// ---------------------------------------------------------------------------
app.post('/api/hubspot/search', async (req, res) => {
  if (!HUBSPOT_TOKEN) {
    return res.status(500).json({ error: 'HUBSPOT_TOKEN not configured' });
  }

  const { objectType, filterGroups, properties, limit, after, offset, sorts } = req.body;
  if (!objectType) {
    return res.status(400).json({ error: 'objectType is required' });
  }

  const objSlug = objectType.toLowerCase();
  const url = `https://api.hubapi.com/crm/v3/objects/${objSlug}/search`;

  try {
    const body = { filterGroups: filterGroups || [], limit: limit || 100 };
    if (properties) body.properties = properties;
    // Frontend sends 'offset' but HubSpot REST uses 'after' for cursor pagination
    const cursor = after || offset;
    if (cursor) body.after = String(cursor);
    if (sorts) body.sorts = sorts;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`HubSpot ${resp.status}: ${text}`);
      return res.status(resp.status).json({ error: `HubSpot API error: ${resp.status}`, detail: text });
    }

    const data = await resp.json();

    // Map HubSpot paging to the offset format the frontend expects
    const result = {
      results: data.results || [],
      total: data.total || 0
    };
    if (data.paging && data.paging.next && data.paging.next.after) {
      result.offset = parseInt(data.paging.next.after);
    }

    res.json(result);
  } catch (e) {
    console.error('HubSpot proxy error:', e);
    res.status(500).json({ error: 'HubSpot request failed', detail: e.message });
  }
});

// ---------------------------------------------------------------------------
// HubSpot Associations — batch lookup contact→deal associations
// POST /api/hubspot/associations
// Body: { fromType: "contacts", toType: "deals", ids: [123, 456, ...] }
// Returns: { results: { "123": ["789", "101"], "456": ["202"] } }
// ---------------------------------------------------------------------------
app.post('/api/hubspot/associations', async (req, res) => {
  if (!HUBSPOT_TOKEN) {
    return res.status(500).json({ error: 'HUBSPOT_TOKEN not configured' });
  }

  const { fromType, toType, ids } = req.body;
  if (!fromType || !toType || !ids || !ids.length) {
    return res.status(400).json({ error: 'fromType, toType, and ids are required' });
  }

  try {
    const results = {};
    // HubSpot batch associations: max 100 per request
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const url = `https://api.hubapi.com/crm/v4/associations/${fromType}/${toType}/batch/read`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`
        },
        body: JSON.stringify({ inputs: batch.map(id => ({ id: String(id) })) })
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error(`HubSpot associations ${resp.status}: ${text}`);
        return res.status(resp.status).json({ error: `HubSpot API error: ${resp.status}`, detail: text });
      }

      const data = await resp.json();
      (data.results || []).forEach(r => {
        const fromId = String(r.from && r.from.id);
        const toIds = (r.to || []).map(t => String(t.toObjectId));
        if (toIds.length) results[fromId] = toIds;
      });
    }

    res.json({ results });
  } catch (e) {
    console.error('HubSpot associations error:', e);
    res.status(500).json({ error: 'Associations request failed', detail: e.message });
  }
});

// ---------------------------------------------------------------------------
// AI Analysis proxy
// POST /api/ai/analyze
// Body: { prompt: "..." }
// Returns: { text: "..." }
// ---------------------------------------------------------------------------
app.post('/api/ai/analyze', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Anthropic ${resp.status}: ${text}`);
      return res.status(resp.status).json({ error: `Anthropic API error: ${resp.status}`, detail: text });
    }

    const data = await resp.json();
    const text = data.content && data.content[0] ? data.content[0].text : '';
    res.json({ text });
  } catch (e) {
    console.error('Anthropic proxy error:', e);
    res.status(500).json({ error: 'AI request failed', detail: e.message });
  }
});

// ---------------------------------------------------------------------------
// Fallback: serve index.html for any unmatched route
// ---------------------------------------------------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Stormboy Tracker running on http://localhost:${PORT}`);
  console.log(`  HubSpot: ${HUBSPOT_TOKEN ? 'configured' : 'NOT SET — add HUBSPOT_TOKEN to .env'}`);
  console.log(`  AI:      ${ANTHROPIC_API_KEY ? 'configured' : 'NOT SET — add ANTHROPIC_API_KEY to .env'}`);
});
