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

// Shared HubSpot client with 429 retry-with-backoff. All HubSpot requests
// from this server (proxies + engine modules) route through it.
const { hubspotFetch } = require('./coaching/engine/hubspot-client');

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

// System health — single aggregator that answers "is this thing working?".
// Apex liveness, write volume, pattern growth, loop closure, heuristic drift.
// Consumed by the v2 HEALTH tab; safe to call as often as needed (filesystem
// scans only, no external API calls).
app.get('/api/system/health', (req, res) => {
  try {
    const { snapshot } = require('./coaching/engine/system-health');
    res.json(snapshot());
  } catch (e) {
    console.error('system/health failed:', e);
    res.status(500).json({ error: e.message });
  }
});

// Pattern quality gate — archives patterns that stayed confidence=low for
// >30 days without cross-confirmation. Defaults to dry-run (GET, or POST
// with ?dry_run=1); pass ?dry_run=0 on POST to actually move files.
// Apex schedules this weekly per inbox/cowork/2026-05-17-apex-weekly-pattern-curation-*.md.
// Weekly system retro — synthesises last 7 days of bus activity into a
// readable markdown summary. GET returns the synthesis without writing;
// POST with ?write=1 also drops a file into <bus>/system-retros/<isoweek>.md
// so it's visible to the whole team via SharePoint.
app.get('/api/system/retro', (req, res) => {
  try {
    const { generate } = require('./coaching/engine/system-retro');
    res.json(generate({ since: req.query.since, until: req.query.until, write: false }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/system/retro', (req, res) => {
  try {
    const { generate } = require('./coaching/engine/system-retro');
    const write = req.query.write === '1';
    res.json(generate({ since: req.query.since, until: req.query.until, write }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Sales outcome attribution — measurement infrastructure for "are deals
// with system involvement progressing differently?". Descriptive, not
// causal — caveats baked into the response. Needs 50+ deals × 90+ days
// for statistical meaning; building the pipe now so it starts collecting.
// Intelligence bundles — subscription-LLM compute substrate. Replaces direct
// Anthropic API calls for analytic synthesis. Bundles are processed by Cowork
// scheduled task or interactive Claude Code session — both run under Dylan's
// flat-fee subscription, no metered API cost. See shared-growth-memory/
// schemas/intelligence-bundle.md for the contract.
app.post('/api/intelligence/bundles', (req, res) => {
  try {
    const ib = require('./coaching/engine/intelligence-bundles');
    const created = ib.create(req.body || {});
    res.status(201).json(created);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/intelligence/bundles', (req, res) => {
  try {
    const ib = require('./coaching/engine/intelligence-bundles');
    const items = ib.listBundles({ status: req.query.status });
    res.json({ count: items.length, items, stats: ib.stats() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/intelligence/bundles/:id', (req, res) => {
  try {
    const ib = require('./coaching/engine/intelligence-bundles');
    const meta = ib.readMeta(req.params.id);
    if (!meta) return res.status(404).json({ error: 'not found' });
    res.json({ meta, markdown: ib.readMarkdown(req.params.id) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/intelligence/bundles/:id/claim', (req, res) => {
  try {
    const ib = require('./coaching/engine/intelligence-bundles');
    const processor = (req.body && req.body.processor) || 'manual';
    res.json(ib.claim(req.params.id, processor));
  } catch (e) { res.status(409).json({ error: e.message }); }
});
app.post('/api/intelligence/results/:id', (req, res) => {
  try {
    const ib = require('./coaching/engine/intelligence-bundles');
    const body = req.body || {};
    const result = ib.submitResult(req.params.id, {
      result: body.result,
      completed_by: body.completed_by || 'manual_paste',
      error: body.error,
    });
    res.json(result);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/intelligence/results/:id', (req, res) => {
  try {
    const ib = require('./coaching/engine/intelligence-bundles');
    const r = ib.readResult(req.params.id);
    if (!r) return res.status(404).json({ error: 'not yet processed' });
    res.json(r);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Feedback — user-raised errors / preferences / comments / corrections.
// Stored in <bus>/feedback/feedback-<id>.json per schemas/feedback.md.
// Both systems read this; coaching engines should check open type=error
// feedback for a target before generating new suggestions.
app.get('/api/feedback', (req, res) => {
  try {
    const fb = require('./coaching/engine/feedback');
    res.json({
      count: fb.list(req.query).length,
      items: fb.list(req.query),
      stats: fb.stats(),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/feedback', (req, res) => {
  try {
    const fb = require('./coaching/engine/feedback');
    const entry = fb.create(req.body || {}, { createdBy: (req.body && req.body.created_by) || 'manual_dashboard' });
    res.status(201).json(entry);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/feedback/:id', (req, res) => {
  try {
    const fb = require('./coaching/engine/feedback');
    const item = fb.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.patch('/api/feedback/:id', (req, res) => {
  try {
    const fb = require('./coaching/engine/feedback');
    const updated = fb.update(req.params.id, req.body || {});
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/system/outcome-attribution', (req, res) => {
  try {
    const { analyze } = require('./coaching/engine/outcome-attribution');
    res.json(analyze());
  } catch (e) {
    console.error('outcome-attribution failed:', e);
    res.status(500).json({ error: e.message });
  }
});

// Historical baseline — pull closed deals from HubSpot (default past 24 months)
// and compute pre-system win-rate + days-to-close. Solves the empty-control-
// cohort problem in outcome-attribution: lets us compare post-system trajectory
// against pre-system reality.
app.post('/api/system/backfill-baseline', async (req, res) => {
  try {
    const { backfill } = require('./coaching/engine/historical-baseline');
    const result = await backfill({ since: req.query.since, until: req.query.until });
    res.json(result);
  } catch (e) {
    console.error('backfill-baseline failed:', e);
    res.status(500).json({ error: e.message });
  }
});
app.get('/api/system/baseline', (req, res) => {
  try {
    const { loadLatest } = require('./coaching/engine/historical-baseline');
    const latest = loadLatest();
    if (!latest) return res.json({ ok: false, reason: 'no baseline yet — POST /api/system/backfill-baseline to generate one' });
    res.json(latest);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/system/curate-patterns', (req, res) => {
  try {
    const { curate } = require('./coaching/engine/curate-patterns');
    res.json(curate({ dryRun: true }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/system/curate-patterns', (req, res) => {
  try {
    const { curate } = require('./coaching/engine/curate-patterns');
    const dryRun = req.query.dry_run !== '0';
    res.json(curate({ dryRun }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Probes — the action→outcome loop. Dashboard (and Claudia's tool) write probes;
// either side updates the outcome once detected. listOpenProbes is the queue;
// probe-outcome update is how the loop closes.
app.get('/api/work/open-probes', (req, res) => {
  try {
    const bus = require('./coaching/engine/shared-bus');
    const open = bus.listOpenProbes()
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    res.json({ count: open.length, probes: open });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/work/probe-stats', (req, res) => {
  try {
    const bus = require('./coaching/engine/shared-bus');
    res.json(bus.probeStats());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create a new probe record. Body: { probe_id?, deal_id, deal_name, contact_id?,
// probe_type, rationale, probe_text, predicted_outcomes?, sent_channel?, sent_by? }
// probe_id auto-generated if absent. Used by manual probe-tagging in the UI and
// by future Apex-side probe-suggestion automation.
app.post('/api/work/probe', (req, res) => {
  try {
    const bus = require('./coaching/engine/shared-bus');
    const p = req.body || {};
    if (!p.deal_id || !p.probe_type) {
      return res.status(400).json({ error: 'deal_id and probe_type required' });
    }
    const probe = {
      probe_id: p.probe_id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: p.created_at || new Date().toISOString(),
      created_by: p.created_by || 'manual_by_rep',
      sent_at: p.sent_at || null,
      ...p,
    };
    const written = bus.writeProbeOutcome(probe);
    res.json(written);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Manually populate (or update) a probe's actual_outcome. Used by Dylan when
// surveying old probes; Claudia's tool calls this from call-admin per the
// INTEGRATION-FOR-CLAUDIA.md §4.1c flow.
app.post('/api/work/probe-outcome/:probe_id', (req, res) => {
  try {
    const bus = require('./coaching/engine/shared-bus');
    const o = req.body || {};
    if (!o.outcome_class) return res.status(400).json({ error: 'outcome_class required' });
    const merged = bus.writeProbeOutcome({
      probe_id: req.params.probe_id,
      actual_outcome: {
        detected_at: o.detected_at || new Date().toISOString(),
        detected_by: o.detected_by || 'manual',
        outcome_class: o.outcome_class,
        reply_latency_hours: o.reply_latency_hours,
        reply_sentiment: o.reply_sentiment,
        reply_summary: o.reply_summary,
      },
    });
    res.json(merged);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Farm-visit booking metrics — total + week-on-week + vs goal. Live HubSpot.
// Stormboy efficacy — the "is Stormboy working?" headline answer.
// Compares Stormboy-cohort vs control deals on win_rate, days_to_close,
// hectares within the same time window. Caches 4h on disk; ?force=1 to refresh.
app.get('/api/stats/stormboy-efficacy', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-efficacy');
    const result = await run({
      windowMonths: req.query.months ? parseInt(req.query.months, 10) : undefined,
      force: req.query.force === '1',
    });
    res.json(result);
  } catch (e) {
    console.error('stormboy-efficacy failed:', e);
    res.status(500).json({ error: 'efficacy failed', detail: e.message });
  }
});

// Cohort funnel — Section 2 of the STATS redesign. Side-by-side stage
// conversion for Stormboy / direct control / LawrieCo. Same caching
// as efficacy (4h disk). ?force=1 refreshes.
app.get('/api/stats/cohort-funnel', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/cohort-funnel');
    const result = await run({
      windowMonths: req.query.months ? parseInt(req.query.months, 10) : undefined,
      force: req.query.force === '1',
    });
    res.json(result);
  } catch (e) {
    console.error('cohort-funnel failed:', e);
    res.status(500).json({ error: 'funnel failed', detail: e.message });
  }
});

// Forward forecast — Section 8 of the STATS redesign. Leading
// indicator: open pipeline × historical stage-win probability →
// "expected to register". Pairs with Section 5's trailing pace.
app.get('/api/stats/forecast', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-forecast');
    const result = await run({ force: req.query.force === '1' });
    res.json(result);
  } catch (e) {
    console.error('stormboy-forecast failed:', e);
    res.status(500).json({ error: 'forecast failed', detail: e.message });
  }
});

// Call monitoring — matches Will's "Storm Boy call monitoring"
// dashboard from the Operation Storm Boy Teams channel. Weekly target
// progress + volume tiles + efficacy tiles + daily engagement chart.
// 15-min disk cache; ?force=1 refreshes.
app.get('/api/stats/call-monitoring', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/call-monitoring');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('call-monitoring failed:', e);
    res.status(500).json({ error: 'call-monitoring failed', detail: e.message });
  }
});

// Call analytics — connect rate, outcome breakdown, time-of-day
// heat map, per-rep daily leaderboard. Built on HubSpot call
// engagement object (Aircall already syncs disposition + duration).
// 30-min disk cache.
app.get('/api/stats/call-analytics', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/call-analytics');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('call-analytics failed:', e);
    res.status(500).json({ error: 'call-analytics failed', detail: e.message });
  }
});

// Snapshot ticket SLA — distribution of how long tickets dwell in
// each HORIZON Snapshot pipeline stage. Surfaces drafting bottlenecks
// + completion trend. 30-min disk cache; ?force=1 refreshes.
app.get('/api/stats/snapshot-ticket-sla', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/snapshot-ticket-sla');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('snapshot-ticket-sla failed:', e);
    res.status(500).json({ error: 'snapshot-ticket-sla failed', detail: e.message });
  }
});

// Lead-response-time distribution — speed-to-lead metric. For new
// Stormboy contacts: time from createdate → first outbound touch.
// 30-min disk cache.
app.get('/api/stats/lead-response-time', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/lead-response-time');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('lead-response-time failed:', e);
    res.status(500).json({ error: 'lead-response-time failed', detail: e.message });
  }
});

// Snapshot pipeline — STATS section. Throughput view of the snapshot
// workflow across Farm Visit completed contacts. Surfaces drafting
// bottlenecks, reply-wait stalls, KCT-handoff queue. 15-min cache.
app.get('/api/stats/snapshot-pipeline', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/snapshot-pipeline');
    res.json(await run({ force: req.query.force === '1' }));
  } catch (e) {
    console.error('snapshot-pipeline failed:', e);
    res.status(500).json({ error: 'snapshot-pipeline failed', detail: e.message });
  }
});

// Bus rebuild — manually trigger rep-queue rebuild + team-pulse write.
// Useful when the team wants their Claude Code workspaces to reflect
// the latest dashboard state without waiting for the 5am scheduler.
// Heavy: pulls live HubSpot data to enrich Farm Visit completed cards
// with current snapshot-state.
app.post('/api/bus/rebuild', async (req, res) => {
  try {
    const repQueues = require('./coaching/engine/rep-queues');
    const teamPulse = require('./coaching/engine/team-pulse');
    const queues = await repQueues.buildQueues();
    const pulse = await teamPulse.build();
    res.json({
      ok: true,
      queues: {
        generated_at: queues.generated_at,
        reps: queues.reps,
      },
      team_pulse: pulse,
    });
  } catch (e) {
    console.error('bus rebuild failed:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});
app.get('/api/bus/rebuild', async (req, res) => {
  // Allow GET for easy manual triggering from a browser
  try {
    const repQueues = require('./coaching/engine/rep-queues');
    const teamPulse = require('./coaching/engine/team-pulse');
    const queues = await repQueues.buildQueues();
    const pulse = await teamPulse.build();
    res.json({ ok: true, queues: queues, team_pulse: pulse });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Snapshot-state integration health check — surfaces which channels
// (HubSpot emails, HubSpot tickets, MS Teams) are wired in. Used by
// the WORK page banner and for ops debugging.
app.get('/api/snapshot/coverage', async (req, res) => {
  try {
    const { getCoverageStatus } = require('./coaching/engine/snapshot-state');
    let teamsProbe = null;
    try {
      const teams = require('./coaching/engine/teams-graph');
      teamsProbe = await teams.probe();
    } catch (_) {}
    res.json({
      channels: getCoverageStatus(),
      teams_probe: teamsProbe,
    });
  } catch (e) {
    res.status(500).json({ error: 'coverage check failed', detail: e.message });
  }
});

// Stormboy contact funnel velocity — Section 7 of the STATS redesign.
// The outreach motion lives in the contact funnel (Identified → In
// Conversation → Farm Visit booked → ... → Exited), not the deal
// funnel. Surfaces conversion-to-next, median dwell, stuck counts,
// and the biggest dropoff. 4h disk cache.
app.get('/api/stats/funnel-velocity', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-funnel-velocity');
    const result = await run({ force: req.query.force === '1' });
    res.json(result);
  } catch (e) {
    console.error('stormboy-funnel-velocity failed:', e);
    res.status(500).json({ error: 'funnel-velocity failed', detail: e.message });
  }
});

// Friction map — Section 6 of the STATS redesign. Ranks pipeline-stage
// transitions by impact (gap × volume) so the top item is "biggest
// lever for Stormboy efficacy". Includes loss-reason concentration
// per stage per cohort. Built on top of cohort-funnel cache.
app.get('/api/stats/friction-map', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/friction-map');
    res.json(await run());
  } catch (e) {
    console.error('friction-map failed:', e);
    res.status(500).json({ error: 'friction-map failed', detail: e.message });
  }
});

// 30k hectare projection — Section 5 of the STATS redesign. Builds on
// cached trajectory data and computes projected target hit-dates at
// 4-week / 12-week / since-anchor paces.
app.get('/api/stats/projection', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-projection');
    res.json(await run());
  } catch (e) {
    console.error('stormboy-projection failed:', e);
    res.status(500).json({ error: 'projection failed', detail: e.message });
  }
});

// Evidence cards — Section 4 of the STATS redesign. Reads pattern files
// from shared-growth-memory/patterns/ and surfaces each as a tactical
// card with title + headline stat + category + source file. 5-min
// in-memory cache.
app.get('/api/stats/evidence-cards', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/evidence-cards');
    res.json(run());
  } catch (e) {
    console.error('evidence-cards failed:', e);
    res.status(500).json({ error: 'evidence failed', detail: e.message });
  }
});

// Trajectory time-series — Section 3 of the STATS redesign. Trailing
// 12-week running win-rate + weekly hectares + weekly direct pipeline
// entries, with Stormboy launch (2026-01-13) annotated. LawrieCo
// excluded so the trajectory reflects direct/Stormboy performance.
// 4h disk cache; ?force=1 refreshes.
app.get('/api/stats/trajectory', async (req, res) => {
  try {
    const { run } = require('./coaching/engine/stormboy-trajectory');
    const result = await run({
      windowMonths: req.query.months ? parseInt(req.query.months, 10) : undefined,
      force: req.query.force === '1',
    });
    res.json(result);
  } catch (e) {
    console.error('stormboy-trajectory failed:', e);
    res.status(500).json({ error: 'trajectory failed', detail: e.message });
  }
});

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
// Curated ASK prompts — launcher pattern. The dashboard's ASK tab shows
// these questions; clicking one copies a self-contained prompt to clipboard
// for the user's Claude Code Desktop. No conversational ASK in the dashboard
// — the user's own Claude Code is the conversation surface.
app.get('/api/ask/prompts', (req, res) => {
  try {
    const ap = require('./coaching/engine/ask-prompts');
    res.json(ap.listQuestions());
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/ask/prompt/:id', (req, res) => {
  try {
    const ap = require('./coaching/engine/ask-prompts');
    const p = ap.getPrompt(req.params.id);
    if (!p) return res.status(404).json({ error: 'not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DEPRECATED — conversational ASK is being replaced by the launcher above.
// Kept for legacy callers until v2-ask.js fully ships. The underlying
// ask.js still calls Anthropic directly, which fails with credit-balance
// errors on this org's shared API key.
app.post('/api/ask', async (req, res) => {
  res.set('X-Deprecated', '/api/ask conversational endpoint; use /api/ask/prompt/:id + launcher pattern');
  try {
    const { ask } = require('./coaching/engine/ask');
    const { question, context, history, model } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });
    const result = await ask({ question, context, history, model });
    res.json(result);
  } catch (e) {
    console.error('/api/ask (deprecated) failed:', e);
    res.status(500).json({
      error: 'ask failed',
      detail: e.message,
      hint: 'The conversational /api/ask is deprecated. Use /api/ask/prompts to fetch curated questions and /api/ask/prompt/:id for a ready-to-paste Claude Code prompt.',
    });
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

    // Bundle path — diagnose may return _pending. In that case the exemplar's
    // existing diagnosis stays untouched; UI tells the user to wait.
    if (result && result._pending) {
      return res.json({
        ok: true,
        pending: true,
        exemplar_id: exemplarId,
        bundle_id: result.bundle_id,
        queued_at: result.queued_at,
        message: 'Diagnosis bundle queued. Result will appear on the next batch run (or run "process the next intelligence bundle" in Claude Code).',
      });
    }

    // Apply the result back into the JSON
    ex.diagnosis = result.diagnosis || ex.diagnosis;
    if (result.next_step_short) ex.next_step_short = result.next_step_short;
    if (result.next_step_qualifier) ex.next_step_qualifier = result.next_step_qualifier;
    ex.diagnosis_metadata = {
      regenerated_at: result.generated_at,
      assessment: result.diagnosis_assessment,
      timeline_used: result.timeline_used,
      from_bundle: result.from_bundle,
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

    const resp = await hubspotFetch(url, {
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
      const resp = await hubspotFetch(url, {
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
// AI Analysis
// POST /api/ai/analyze
// Body: { prompt: "..." }
//
// Default path (DEPRECATED — pending removal): proxies to Anthropic Messages
//   API. Counts against the shared ANTHROPIC_API_KEY quota.
// Bundle path (?via=bundles): writes the prompt to <bus>/intelligence-bundles/
//   and returns 202 with a poll_url. Cowork-scheduled task or Claude Code
//   interactive session processes under flat-fee subscription. Zero metered
//   cost. Per Cadel directive 2026-05-18.
//
// Once v1 callers migrate to ?via=bundles, the legacy path will be removed
// and ?via=bundles will become default. See briefings/api-to-subscription-
// migration-plan.md for the schedule.
// ---------------------------------------------------------------------------
app.post('/api/ai/analyze', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  // ----- Bundle path (subscription compute) -----
  if (req.query.via === 'bundles') {
    try {
      const ib = require('./coaching/engine/intelligence-bundles');
      const meta = ib.create({
        purpose: 'ai-analyze',
        system_prompt: 'You are an analyst supporting a sales pipeline review. Read the user prompt below carefully and produce the analysis it asks for. Return as plain markdown text — no JSON wrapper, no preamble, just the answer. Be concrete with specific numbers from the input.',
        input_data: prompt,
        output_spec: 'Plain markdown text. Match what the user prompt asks for in count of insights (e.g. "Give exactly 3 insights") and format. Use real numbers from the input data, not placeholders.',
        output_schema: 'text',
        model_hint: 'haiku',
        target_kind: 'analysis',
        input_summary: `v1 ai/analyze · ${prompt.slice(0, 100).replace(/\s+/g, ' ')}`,
        created_by: 'dashboard:/api/ai/analyze',
      });
      return res.status(202).json({
        bundle_id: meta.id,
        status: meta.status,
        poll_url: `/api/intelligence/results/${meta.id}`,
        bundle_url: `/api/intelligence/bundles/${meta.id}`,
        message: 'Bundle queued. Cowork-scheduled task processes every 2h; for immediate completion, run "process the next intelligence bundle" in a Claude Code session pointed at shared-growth-memory/.',
      });
    } catch (e) {
      console.error('intelligence-bundle create failed:', e);
      return res.status(500).json({ error: 'bundle create failed', detail: e.message });
    }
  }

  // ----- Legacy API path (deprecated) -----
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured', hint: 'Use ?via=bundles to route via subscription compute instead.' });
  }
  res.set('X-Deprecated', '/api/ai/analyze direct API path; migrate callers to ?via=bundles');

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
