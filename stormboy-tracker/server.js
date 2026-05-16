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

// v2 served at /v2 (exploration of new 4-tab restructure). Order matters: v2 mount
// must be registered before the root static mount so /v2/* assets resolve there.
app.use('/v2', express.static(path.join(__dirname, 'public-v2')));
app.use(express.static(path.join(__dirname, 'public')));

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Wire coaching routes (cache reads, refresh trigger). See coaching/engine/.
const { wireCoachingRoutes } = require('./coaching/engine/routes');
wireCoachingRoutes(app);

// Experiments — v2 exploration area, behind /v2 in the UI.
app.get('/api/experiments/lawrieco', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/experiments-lawrieco');
    const result = await run();
    res.json(result);
  } catch (e) {
    console.error('LawrieCo experiment failed:', e);
    res.status(500).json({ error: 'experiment failed', detail: e.message });
  }
});

// Brain content — feeds the v2 BRAIN tab. Profiles + distillates served
// with auto-generated TOC for navigation.
app.get('/api/brain/index', (req, res) => {
  try {
    const api = require('./coaching/engine/brain-api');
    res.json(api.getIndex());
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/brain/profile/:slug', (req, res) => {
  try {
    const api = require('./coaching/engine/brain-api');
    res.json(api.getProfile(req.params.slug));
  } catch (e) { res.status(404).json({ error: e.message }); }
});

// Continuous persona-builder: refresh a single persona from live HubSpot.
// POST /api/brain/refresh-persona/:slug → rebuilds corpus + synthesises + writes.
app.post('/api/brain/refresh-persona/:slug', async (req, res) => {
  try {
    const { refreshOne } = require('./coaching/engine/persona-builder');
    const r = await refreshOne(req.params.slug);
    res.json(r);
  } catch (e) {
    console.error('refresh-persona failed:', e);
    res.status(500).json({ error: e.message });
  }
});

// Registry — list known personas + their last-refresh status.
app.get('/api/brain/personas', (req, res) => {
  try {
    const { loadRegistry } = require('./coaching/engine/persona-builder');
    res.json(loadRegistry());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk refresh — typically fired by the daily scheduler. Locked behind
// a simple confirmation header so it can't be triggered accidentally.
app.post('/api/brain/refresh-all-personas', async (req, res) => {
  try {
    const { refreshAll } = require('./coaching/engine/persona-builder');
    const r = await refreshAll();
    res.json(r);
  } catch (e) {
    console.error('refresh-all-personas failed:', e);
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/brain/distillates', (req, res) => {
  try {
    const api = require('./coaching/engine/brain-api');
    res.json(api.getDistillates());
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/brain/objection-cards', (req, res) => {
  try {
    const oc = require('./coaching/engine/objection-cards');
    if (req.query.refresh === '1') oc.refresh();
    res.json(oc.buildCards());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Supplements — Apex-produced enrichment files per deal/contact, plus the
// daily-enrichment heartbeat. Per the 2026-05-15 system-enrichment-pipeline
// commission, Apex writes Confluence/Teams/Granola/Outlook signal into
// shared-growth-memory/{deal,contact}-supplements/<id>/ each weekday.
app.get('/api/work/deal-supplements/:id', (req, res) => {
  try {
    const { listSupplements } = require('./coaching/engine/supplements');
    res.json(listSupplements('deal', req.params.id));
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/work/contact-supplements/:id', (req, res) => {
  try {
    const { listSupplements } = require('./coaching/engine/supplements');
    res.json(listSupplements('contact', req.params.id));
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/work/apex-heartbeat', (req, res) => {
  try {
    const { readApexHeartbeat } = require('./coaching/engine/supplements');
    res.json(readApexHeartbeat());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Farm-visit booking metrics — total + week-on-week + vs goal. Live HubSpot.
app.get('/api/stats/farm-visits', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/farm-visit-metrics');
    res.json(await run());
  } catch (e) {
    console.error('Farm visit metrics failed:', e);
    res.status(500).json({ error: 'farm-visit metrics failed', detail: e.message });
  }
});

// Messaging — Customer themes. Aggregates topic-level signal from the team's
// actual customer conversations (farm visits + calls + emails). Groups by
// topic, ranks by frequency, surfaces verbatim customer voice + landed/friction
// split. The primary marketing-intel view — what's resonating with landholders.
app.get('/api/messaging/customer-themes', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/customer-themes');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('Customer themes failed:', e);
    res.status(500).json({ error: 'customer-themes failed', detail: e.message });
  }
});

// Messaging — Team language bank. Aggregates verbatim phrases reps use across
// persona profiles. Secondary view (used to be the primary "Resonance map";
// renamed for clarity since this is rep-side speech, not customer-side).
app.get('/api/messaging/resonance', (req, res) => {
  try {
    const { run } = require('./coaching/engine/resonance-map');
    res.json(run());
  } catch (e) {
    console.error('Resonance map failed:', e);
    res.status(500).json({ error: 'resonance failed', detail: e.message });
  }
});

// Win timeline — all closed-won deals with channel attribution + hectares.
// Powers the STATS tab's horizontal timeline. Client-side slices by range.
app.get('/api/stats/win-timeline', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/win-timeline');
    res.json(await run());
  } catch (e) {
    console.error('Win-timeline failed:', e);
    res.status(500).json({ error: 'win-timeline failed', detail: e.message });
  }
});

// Call efficiency — calls made vs visits booked, per week. Will's
// product-refinement ask: "20 calls for 10 visits". Live HubSpot.
app.get('/api/stats/call-efficiency', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/call-efficiency');
    res.json(await run());
  } catch (e) {
    console.error('Call-efficiency metrics failed:', e);
    res.status(500).json({ error: 'call-efficiency failed', detail: e.message });
  }
});

// Pipeline stats — feeds the v2 STATS tab. Era-stratified time-to-close,
// win-rate by channel, hectares-to-30K, recent wins. Live HubSpot.
app.get('/api/stats/pipeline', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stats-pipeline');
    res.json(await run());
  } catch (e) {
    console.error('Stats pipeline failed:', e);
    res.status(500).json({ error: 'stats failed', detail: e.message });
  }
});

// Scheduler — daily-pipeline state + manual fire trigger.
app.get('/api/schedule/state', (req, res) => {
  try {
    const { getState } = require('./coaching/engine/scheduler');
    res.json(getState());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/schedule/fire-now', async (req, res) => {
  try {
    const { fireNow } = require('./coaching/engine/scheduler');
    const state = await fireNow();
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Brain sync — mirror dashboard-authored team-brain files into the
// shared-growth-memory bus so Claudia's tool reads the same source material.
app.post('/api/brain/sync', (req, res) => {
  try {
    const { sync } = require('./coaching/engine/sync-brain');
    res.json(sync());
  } catch (e) {
    console.error('Brain sync failed:', e);
    res.status(500).json({ error: 'sync failed', detail: e.message });
  }
});

// Rep-queues — bucket diagnosed deals + contacts by owner and write per-rep
// queue files into the shared-growth-memory bus. Each rep's Claude Code
// workspace can read their own work-cards.json on session start.
app.post('/api/work/build-rep-queues', async (req, res) => {
  try {
    const { buildQueues } = require('./coaching/engine/rep-queues');
    const result = await buildQueues();
    res.json(result);
  } catch (e) {
    console.error('Build rep queues failed:', e);
    res.status(500).json({ error: 'build queues failed', detail: e.message });
  }
});

// Ask the team — natural-language query against the captured team brain
// (Hobbs profile + distillates + Ben + Claudia + Will profiles). Supports
// multi-turn conversation via the `history` array.
app.post('/api/ask', async (req, res) => {
  try {
    const { ask } = require('./coaching/engine/ask');
    const { question, context, history, model } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });
    const result = await ask({ question, context, history, model });
    res.json(result);
  } catch (e) {
    console.error('/api/ask failed:', e);
    res.status(500).json({ error: 'ask failed', detail: e.message });
  }
});

// Storm Boy contact summary — feeds the v2 WORK tab's Motion 1 stream.
// See coaching/engine/stormboy-summary.js.
app.get('/api/stormboy/summary', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-summary');
    const result = await run();
    res.json(result);
  } catch (e) {
    console.error('Storm Boy summary failed:', e);
    res.status(500).json({ error: 'stormboy summary failed', detail: e.message });
  }
});

// Storm Boy per-contact detail enrichment — feeds Farm Visits Completed +
// Call Queue synthesis cards on the WORK tab. Pulls HubSpot last note +
// Aircall distillate match + heuristic heat score per contact.
app.get('/api/stormboy/detail', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-detail');
    const stage = req.query.stage;
    const result = await run(stage);
    res.json(result);
  } catch (e) {
    console.error('Storm Boy detail failed:', e);
    res.status(500).json({ error: 'stormboy detail failed', detail: e.message });
  }
});

// WORK header stats — single consolidated payload for the top-of-page scorecard.
// Pulled live from HubSpot, ~3 batched API calls; uncached so numbers stay current.
app.get('/api/work/header-stats', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/work-header-stats');
    res.json(await run());
  } catch (e) {
    console.error('Header-stats failed:', e);
    res.status(500).json({ error: 'header-stats failed', detail: e.message });
  }
});

// Recent wins with derived WHY-pattern — LLM-grounded analysis of why each
// recently won deal closed, with a 3-bullet replicable pattern. Cached per
// deal_id (wins don't change post-close). Force-refresh with ?force=1.
app.get('/api/work/recent-wins', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/win-patterns');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('Recent-wins analysis failed:', e);
    res.status(500).json({ error: 'recent-wins failed', detail: e.message });
  }
});

// Engagement timeline — verbatim notes / emails / calls / meetings for a
// contact or deal. Replaces signal-language ("stalled", "orphan") with
// artifacts ("last email 2025-10-12 said: ...").
app.get('/api/work/timeline', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/engagement-timeline');
    const result = await run(req.query.type, req.query.id);
    res.json(result);
  } catch (e) {
    console.error('Engagement timeline failed:', e);
    res.status(500).json({ error: 'timeline failed', detail: e.message });
  }
});

// WORK tab exemplars — 3 hand-crafted "3-steps-down" insight cards that
// demonstrate the pattern: specific drafts, counterfactuals with base rates,
// pre-filled actions. Phase 2 will replace these with LLM-generated equivalents
// at refresh time, cached to the same file.
app.get('/api/work/exemplars', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const p = path.join(__dirname, 'coaching', 'cache', 'work-exemplars.json');
    const raw = fs.readFileSync(p, 'utf8');
    res.type('application/json').send(raw);
  } catch (e) {
    console.error('Exemplars load failed:', e);
    res.status(500).json({ error: 'exemplars load failed', detail: e.message });
  }
});

// Batch-regenerate diagnoses for the top N active deals. Runs in background;
// returns immediately with job state. Frontend can poll /api/work/diagnose-job
// for progress, or /api/work/deal-diagnoses for incremental results.
app.post('/api/work/diagnose-batch', async (req, res) => {
  try {
    const { runBatch } = require('./coaching/engine/diagnose-active-deals');
    const limit = (req.body && Number(req.body.limit)) || 20;
    const result = await runBatch({ limit });
    res.json(result);
  } catch (e) {
    console.error('Diagnose batch failed:', e);
    res.status(500).json({ error: 'batch failed', detail: e.message });
  }
});

app.get('/api/work/diagnose-job', (req, res) => {
  try {
    const { getState } = require('./coaching/engine/diagnose-active-deals');
    res.json(getState());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/work/deal-diagnoses', (req, res) => {
  try {
    const { getCache } = require('./coaching/engine/diagnose-active-deals');
    res.json(getCache());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Storm Boy contact batch. Body { stages: [...] } selects cohorts; defaults to
// completed visits + stalled calls. Pass ['Farm Visit booked'] for the upcoming-
// visits prep-brief cohort.
app.post('/api/work/diagnose-contacts-batch', async (req, res) => {
  try {
    const { runBatch } = require('./coaching/engine/diagnose-active-contacts');
    const stages = (req.body && Array.isArray(req.body.stages)) ? req.body.stages : undefined;
    const result = await runBatch(stages ? { stages } : {});
    res.json(result);
  } catch (e) {
    console.error('Diagnose contacts batch failed:', e);
    res.status(500).json({ error: 'batch failed', detail: e.message });
  }
});

app.get('/api/work/diagnose-contacts-job', (req, res) => {
  try {
    const { getState } = require('./coaching/engine/diagnose-active-contacts');
    res.json(getState());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/work/contact-diagnoses', (req, res) => {
  try {
    const { getCache } = require('./coaching/engine/diagnose-active-contacts');
    res.json(getCache());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Regenerate the diagnosis for a single exemplar from its live engagement
// timeline using Claude. Replaces hand-crafted diagnosis with artifact-grounded
// one. Pattern scales to any contact/deal beyond the 3 exemplars.
app.post('/api/work/regenerate-exemplar', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { diagnose } = require('./coaching/engine/diagnose-from-timeline');

    const exemplarId = req.body && req.body.exemplar_id;
    if (!exemplarId) return res.status(400).json({ error: 'exemplar_id required' });

    const filePath = path.join(__dirname, 'coaching', 'cache', 'work-exemplars.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const ex = data.exemplars.find(e => e.id === exemplarId);
    if (!ex) return res.status(404).json({ error: 'exemplar not found' });

    const result = await diagnose({
      kind: ex.kind,
      title: ex.title,
      subtitle: ex.subtitle,
      lookup_type: ex.lookup_type,
      lookup_id: ex.lookup_id,
      assigned_to_name: ex.assigned_to_name,
      next_step_short: ex.next_step_short,
      next_step_qualifier: ex.next_step_qualifier,
      other_evidence: ex.evidence || [],
    });

    // Apply the LLM result back into the JSON
    ex.diagnosis = result.diagnosis || ex.diagnosis;
    if (result.next_step_short) ex.next_step_short = result.next_step_short;
    if (result.next_step_qualifier) ex.next_step_qualifier = result.next_step_qualifier;
    ex.diagnosis_metadata = {
      regenerated_at: result.generated_at,
      assessment: result.diagnosis_assessment,
      timeline_used: result.timeline_used,
    };

    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);

    res.json({ ok: true, exemplar_id: exemplarId, result });
  } catch (e) {
    console.error('Regenerate exemplar failed:', e);
    res.status(500).json({ error: 'regenerate failed', detail: e.message });
  }
});

// Capture exemplar action (Mark HOT, Drop, Snooze) — writes to the shared
// growth memory bus as a probe-outcome record.
app.post('/api/work/exemplar-action', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { exemplar_id, label, payload } = req.body || {};
    if (!exemplar_id || !label) {
      return res.status(400).json({ error: 'exemplar_id and label required' });
    }
    const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
    const dir = path.join(BUS_ROOT, 'probe-outcomes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const timestamp = new Date().toISOString();
    const id = 'work-action-' + timestamp.replace(/[:.]/g, '-');
    const record = {
      id,
      ts: timestamp,
      source: 'v2-work-exemplar',
      exemplar_id,
      action_label: label,
      payload: payload || {},
    };
    const tmp = path.join(dir, id + '.json.tmp');
    const final = path.join(dir, id + '.json');
    fs.writeFileSync(tmp, JSON.stringify(record, null, 2), 'utf8');
    fs.renameSync(tmp, final);
    res.json({ ok: true, recorded: id });
  } catch (e) {
    console.error('Exemplar action write failed:', e);
    res.status(500).json({ error: 'action write failed', detail: e.message });
  }
});

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
// Fallback: serve the right index.html for any unmatched route.
// /v2/* falls back to public-v2/index.html; everything else to public/index.html.
// ---------------------------------------------------------------------------
app.get('/v2*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public-v2', 'index.html'));
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Stormboy Tracker running on http://localhost:${PORT}`);
  console.log(`  HubSpot:  ${HUBSPOT_TOKEN ? 'configured' : 'NOT SET — add HUBSPOT_TOKEN to .env'}`);
  console.log(`  AI:       ${ANTHROPIC_API_KEY ? 'configured' : 'NOT SET — add ANTHROPIC_API_KEY to .env'}`);
  console.log(`  Bus path: ${process.env.BUS_PATH || 'C:\\Dylan PM\\shared-growth-memory (default)'}`);
  // Arm the daily scheduler if enabled via .env
  try {
    const { init: initScheduler } = require('./coaching/engine/scheduler');
    initScheduler();
  } catch (e) {
    console.error('Scheduler init failed:', e.message);
  }
});
