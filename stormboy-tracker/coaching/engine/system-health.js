/**
 * System health — single aggregator that answers "is this thing working?"
 *
 * Reads the bus (BUS_PATH) plus shared-bus modules and returns a compact
 * snapshot the dashboard's HEALTH tab renders at-a-glance. Each section is
 * an independent signal — Apex liveness, write volume, knowledge growth,
 * loop closure, heuristic drift.
 */

const fs = require('fs');
const path = require('path');
const { readApexHeartbeat, BUS_ROOT } = require('./supplements');
const bus = require('./shared-bus');

const DAY = 24 * 60 * 60 * 1000;

function safeReadDir(p) {
  try { return fs.readdirSync(p, { withFileTypes: true }); }
  catch (_) { return []; }
}

function classifySupplement(filename) {
  if (filename.startsWith('confluence-aircall-')) return 'aircall';
  if (filename.startsWith('confluence-farmvisit-')) return 'farmvisit';
  if (filename.startsWith('outlook-email-')) return 'outlook';
  if (filename.startsWith('teams-')) return 'teams';
  if (filename.startsWith('granola-meeting-')) return 'granola';
  if (filename.startsWith('hubspot-engagement-snapshot-')) return 'hubspot_snapshot';
  if (filename.startsWith('claudia-call-')) return 'claudia_call';
  return 'other';
}

function supplementCounts() {
  const totals = {
    contact: 0, deal: 0, persona: 0,
    today: 0, week: 0, month: 0,
    by_source: {},
    entity_folders: { contact: 0, deal: 0, persona: 0 },
  };
  const now = Date.now();
  ['contact-supplements', 'deal-supplements', 'persona-supplements'].forEach(kind => {
    const kindKey = kind.split('-')[0];
    const root = path.join(BUS_ROOT, kind);
    safeReadDir(root).filter(d => d.isDirectory()).forEach(entityDir => {
      totals.entity_folders[kindKey]++;
      const entityPath = path.join(root, entityDir.name);
      safeReadDir(entityPath).filter(f => f.isFile()).forEach(f => {
        totals[kindKey]++;
        let mtime = 0;
        try { mtime = fs.statSync(path.join(entityPath, f.name)).mtimeMs; } catch (_) {}
        const age = now - mtime;
        if (age < DAY) totals.today++;
        if (age < 7 * DAY) totals.week++;
        if (age < 30 * DAY) totals.month++;
        const src = classifySupplement(f.name);
        totals.by_source[src] = (totals.by_source[src] || 0) + 1;
      });
    });
  });
  return totals;
}

function patternStats() {
  const patternsDir = path.join(BUS_ROOT, 'patterns');
  const archiveDir = path.join(patternsDir, 'archive');
  const out = {
    total: 0,
    archived: 0,
    by_confidence: { low: 0, moderate: 0, high: 0, unknown: 0 },
    by_age: { lt_7d: 0, lt_30d: 0, lt_90d: 0, gte_90d: 0 },
    cross_confirmed: 0,
    recent: [],
  };
  const now = Date.now();
  safeReadDir(patternsDir).filter(f => f.isFile() && f.name.endsWith('.md')).forEach(f => {
    out.total++;
    try {
      const full = path.join(patternsDir, f.name);
      const content = fs.readFileSync(full, 'utf8');
      const fm = bus.parseFrontMatter ? bus.parseFrontMatter(content) : parseFm(content);
      const conf = (fm.confidence || 'unknown').toLowerCase();
      out.by_confidence[conf] = (out.by_confidence[conf] || 0) + 1;
      const systems = Array.isArray(fm.surfaced_in_systems) ? fm.surfaced_in_systems : [];
      if (systems.length >= 2) out.cross_confirmed++;
      const written = fm.written_at ? Date.parse(fm.written_at) : fs.statSync(full).mtimeMs;
      const age = now - written;
      if (age < 7 * DAY) out.by_age.lt_7d++;
      else if (age < 30 * DAY) out.by_age.lt_30d++;
      else if (age < 90 * DAY) out.by_age.lt_90d++;
      else out.by_age.gte_90d++;
      if (out.recent.length < 5 && age < 30 * DAY) {
        out.recent.push({
          filename: f.name,
          title: fm.title || f.name.replace(/\.md$/, ''),
          confidence: conf,
          systems: systems,
          age_days: Math.floor(age / DAY),
        });
      }
    } catch (_) { /* skip unreadable */ }
  });
  safeReadDir(archiveDir).filter(f => f.isFile() && f.name.endsWith('.md')).forEach(() => out.archived++);
  return out;
}

// Minimal local front-matter parser — only used if shared-bus doesn't export one.
function parseFm(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  let currentList = null;
  m[1].split('\n').forEach(line => {
    if (/^\s*-\s/.test(line) && currentList) {
      out[currentList].push(line.replace(/^\s*-\s*/, '').trim());
      return;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) { currentList = null; return; }
    const [, key, raw] = kv;
    if (raw === '' || raw == null) { out[key] = []; currentList = key; }
    else { out[key] = raw.trim().replace(/^["']|["']$/g, ''); currentList = null; }
  });
  return out;
}

function heuristicErrorStats() {
  // Reads coaching/cache/deal-diagnoses.json (where the dashboard caches
  // its per-deal diagnostic assessments). 'heuristic_was_wrong' is the
  // tag the diagnosis pipeline sets when the next-step heuristic
  // disagreed with the live-timeline-derived next step.
  const cachePath = path.join(__dirname, '..', 'cache', 'deal-diagnoses.json');
  if (!fs.existsSync(cachePath)) return { total: 0, wrong: 0, rate: null };
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const deals = raw.deals || raw || {};
    let total = 0;
    let wrong = 0;
    Object.values(deals).forEach(d => {
      total++;
      if (d && d.diagnosis_assessment === 'heuristic_was_wrong') wrong++;
    });
    return {
      total,
      wrong,
      rate: total === 0 ? null : Math.round((wrong / total) * 100) / 100,
    };
  } catch (_) {
    return { total: 0, wrong: 0, rate: null };
  }
}

function feedbackStats() {
  try {
    const fb = require('./feedback');
    return fb.stats();
  } catch (_) { return { total: 0, open: 0 }; }
}

function snapshot() {
  return {
    generated_at: new Date().toISOString(),
    bus: {
      canonical_path: BUS_ROOT,
      reachable: (() => { try { return fs.existsSync(BUS_ROOT); } catch (_) { return false; } })(),
    },
    apex: readApexHeartbeat(),
    supplements: supplementCounts(),
    patterns: patternStats(),
    probes: bus.probeStats(),
    heuristic_errors: heuristicErrorStats(),
    feedback: feedbackStats(),
  };
}

module.exports = { snapshot };
