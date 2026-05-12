/**
 * Express route handlers for /api/coaching/*.
 * Reads from cache; never calls Claude directly. Refresh trigger calls
 * jobs.runAll() (when wired) — for now it returns a "not yet implemented"
 * marker that the frontend treats as "no fresh data".
 */
const cache = require('./cache');

function wireCoachingRoutes(app) {
  // Active = per-deal coaching cards (B1 output) + previous snapshot for diffs.
  app.get('/api/coaching/active', (req, res) => {
    const { current, previous } = cache.readWithPrevious('active');
    if (!current) return res.status(404).json({ error: 'cache empty', cache: 'active' });
    res.json({
      ...current,
      previous_deals: previous ? previous.deals : null
    });
  });

  // Friction = stage-level analysis (A1 output).
  app.get('/api/coaching/friction', (req, res) => {
    const data = cache.read('friction');
    if (!data) return res.status(404).json({ error: 'cache empty', cache: 'friction' });
    res.json(data);
  });

  // Twins = per-active-deal comparable historical deals (B2 output).
  app.get('/api/coaching/twins', (req, res) => {
    const data = cache.read('twins');
    if (!data) return res.status(404).json({ error: 'cache empty', cache: 'twins' });
    res.json(data);
  });

  // Objections = stage-indexed counter-objection library (A2 output).
  app.get('/api/coaching/objections', (req, res) => {
    const data = cache.read('objections');
    if (!data) return res.status(404).json({ error: 'cache empty', cache: 'objections' });
    res.json(data);
  });

  // Weekly = top-3 plays + headline (C3, future).
  app.get('/api/coaching/weekly', (req, res) => {
    const data = cache.read('weekly');
    if (!data) return res.status(404).json({ error: 'cache empty', cache: 'weekly' });
    res.json(data);
  });

  // Diff = pre-computed change summary between current and previous active snapshot.
  app.get('/api/coaching/diff', (req, res) => {
    const diff = cache.diffActive();
    if (!diff) return res.status(404).json({ error: 'no previous snapshot' });
    res.json(diff);
  });

  // Farm-visit distillates — Hobbs on-farm conversation signal.
  app.get('/api/coaching/farm-visits', (req, res) => {
    const data = cache.read('farm_visit_distillates');
    if (!data) return res.status(404).json({ error: 'cache empty', cache: 'farm_visit_distillates' });
    res.json(data);
  });

  // Refresh = manual trigger to regenerate caches.
  // POST body { "mode": "mock" | "live" } — defaults to mock for safety.
  // Live mode reads HubSpot + calls Anthropic; takes 2-5 minutes.
  app.post('/api/coaching/refresh', async (req, res) => {
    try {
      const jobs = require('./jobs');
      const mode = (req.body && req.body.mode === 'live') ? 'live' : 'mock';
      const result = await jobs.runAll(mode);
      res.json({ ok: true, ran: result });
    } catch (e) {
      console.error('Coaching refresh failed:', e);
      res.status(500).json({ error: 'refresh failed', detail: e.message });
    }
  });

  // ===== Briefings (Monday + Friday) =====
  // Markdown briefings compiled from cache + learnings. Designed to be
  // posted to Teams via Claudia's post-to-teams workflow (Cowork picks up
  // the markdown and routes to the appropriate channel).

  app.get('/api/coaching/briefing/monday', (req, res) => {
    try {
      const { generateMondayBrief } = require('./briefings');
      res.type('text/markdown').send(generateMondayBrief());
    } catch (e) {
      console.error('Monday brief failed:', e);
      res.status(500).json({ error: 'briefing failed', detail: e.message });
    }
  });

  app.get('/api/coaching/briefing/friday', (req, res) => {
    try {
      const { generateFridayBrief } = require('./briefings');
      res.type('text/markdown').send(generateFridayBrief());
    } catch (e) {
      console.error('Friday brief failed:', e);
      res.status(500).json({ error: 'briefing failed', detail: e.message });
    }
  });

  // ===== System learnings (auto-written, no approval gate) =====
  // The coaching pipeline writes high-confidence patterns directly to
  // coaching/learnings/YYYY-MM/<slug>.md as soon as it identifies them.
  // No approval gate — Dylan reads what the system has surfaced rather
  // than gate-keeping each entry. Append-only; revisions use supersedes/
  // superseded_by front-matter. The Patterns tab reads from this endpoint.

  const fs = require('fs');
  const path = require('path');
  const LEARNINGS_DIR = path.join(__dirname, '..', 'learnings');

  app.get('/api/coaching/learnings', (req, res) => {
    try {
      const out = [];
      if (!fs.existsSync(LEARNINGS_DIR)) return res.json({ learnings: [] });
      const months = fs.readdirSync(LEARNINGS_DIR).filter(n => /^\d{4}-\d{2}$/.test(n)).sort().reverse();
      for (const m of months) {
        const monthDir = path.join(LEARNINGS_DIR, m);
        const files = fs.readdirSync(monthDir).filter(f => f.endsWith('.md')).sort().reverse();
        for (const f of files) {
          const fullPath = path.join(monthDir, f);
          const content = fs.readFileSync(fullPath, 'utf8');
          const meta = parseFrontMatter(content);
          out.push({
            slug: f.replace(/\.md$/, ''),
            month: m,
            path: `coaching/learnings/${m}/${f}`,
            title: meta.title || f,
            category: meta.category || 'unknown',
            confidence: meta.confidence || 'unknown',
            written_at: meta.written_at || null,
            sources: meta.sources || [],
            evidence: meta.evidence || [],
            applicability: meta.applicability || [],
            supersedes: meta.supersedes || null,
            superseded_by: meta.superseded_by || null,
            body_preview: content.replace(/^---[\s\S]*?---\s*/, '').slice(0, 600)
          });
        }
      }
      res.json({ learnings: out, count: out.length });
    } catch (e) {
      console.error('Learnings read failed:', e);
      res.status(500).json({ error: 'Failed to read learnings', detail: e.message });
    }
  });

  app.get('/api/coaching/learnings/:month/:slug', (req, res) => {
    const safe = /^[a-zA-Z0-9._-]+$/;
    if (!safe.test(req.params.month) || !safe.test(req.params.slug)) {
      return res.status(400).json({ error: 'invalid path' });
    }
    const fullPath = path.join(LEARNINGS_DIR, req.params.month, req.params.slug + '.md');
    if (!fullPath.startsWith(LEARNINGS_DIR) || !fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'not found' });
    }
    res.type('text/markdown').send(fs.readFileSync(fullPath, 'utf8'));
  });
}

// Minimal YAML-front-matter parser. Handles strings, ISO timestamps, and
// list values. Sufficient for our schema; not a general YAML parser.
function parseFrontMatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  const lines = m[1].split('\n');
  let currentListKey = null;
  for (const line of lines) {
    if (/^\s*-\s/.test(line) && currentListKey) {
      const v = line.replace(/^\s*-\s*/, '').trim();
      out[currentListKey].push(v);
      continue;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) { currentListKey = null; continue; }
    const [, key, raw] = kv;
    if (raw === '' || raw == null) {
      out[key] = [];
      currentListKey = key;
    } else {
      out[key] = raw.trim();
      currentListKey = null;
    }
  }
  return out;
}

module.exports = { wireCoachingRoutes };
