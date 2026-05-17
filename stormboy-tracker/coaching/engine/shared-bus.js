/**
 * Shared Growth Memory bus client.
 *
 * Reads + writes to the shared-growth-memory/ folder — the substrate
 * both this dashboard and Claudia's Claude Code tool consume.
 *
 * Storage topology: the folder is intended to live in a SharePoint location
 * that OneDrive syncs to both Dylan's and Claudia's machines, so writes by
 * one tool become readable by the other. Set BUS_PATH in .env to point at
 * the synced location; falls back to the local dev path if unset.
 *
 * Contract: shared-growth-memory/README.md
 * Schemas:  shared-growth-memory/schemas/*.md
 *
 * Writes are atomic (tmp + rename). Reads tolerate missing files (return null).
 */

const fs = require('fs');
const path = require('path');

const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const PATTERNS_DIR = path.join(BUS_ROOT, 'patterns');
const PROBE_OUTCOMES_DIR = path.join(BUS_ROOT, 'probe-outcomes');
const DEAL_SIGNALS_DIR = path.join(BUS_ROOT, 'deal-signals');
const CUSTOMER_POSITIONS_DIR = path.join(BUS_ROOT, 'customer-positions');

function ensureDirs() {
  [PATTERNS_DIR, PROBE_OUTCOMES_DIR, DEAL_SIGNALS_DIR, CUSTOMER_POSITIONS_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function atomicWrite(filePath, content) {
  ensureDirs();
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

function atomicWriteJson(filePath, obj) {
  atomicWrite(filePath, JSON.stringify(obj, null, 2));
}

// ===========================================================================
// Patterns — markdown files with YAML front-matter
// ===========================================================================

/**
 * Write or update a pattern. Pattern slug becomes the filename.
 * If a file with the same slug already exists, merge: bump last_validated,
 * append to surfaced_in_systems if this system isn't already listed.
 */
function writePattern({ slug, frontMatter, body }) {
  const fp = path.join(PATTERNS_DIR, slug + '.md');
  let fm = { ...frontMatter };

  if (fs.existsSync(fp)) {
    // Merge: keep existing front-matter values, only update specific fields
    const existing = fs.readFileSync(fp, 'utf8');
    const existingFm = parseFrontMatter(existing);
    fm = {
      ...existingFm,
      ...fm,
      surfaced_in_systems: Array.from(new Set([
        ...(existingFm.surfaced_in_systems || []),
        ...(frontMatter.surfaced_in_systems || ['dashboard_coaching'])
      ])),
      last_validated: new Date().toISOString()
    };
  } else {
    fm.surfaced_in_systems = fm.surfaced_in_systems || ['dashboard_coaching'];
    fm.last_validated = fm.last_validated || new Date().toISOString();
  }

  const yaml = serializeFrontMatter(fm);
  atomicWrite(fp, `---\n${yaml}---\n\n${body || ''}\n`);
}

function readPattern(slug) {
  const fp = path.join(PATTERNS_DIR, slug + '.md');
  if (!fs.existsSync(fp)) return null;
  const raw = fs.readFileSync(fp, 'utf8');
  return { slug, frontMatter: parseFrontMatter(raw), body: stripFrontMatter(raw) };
}

function listPatterns() {
  ensureDirs();
  return fs.readdirSync(PATTERNS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => readPattern(f.replace(/\.md$/, '')))
    .filter(Boolean);
}

// ===========================================================================
// Deal signals — JSON, one file per active deal, overwritten on each run
// ===========================================================================

function writeDealSignal(signal) {
  if (!signal || !signal.deal_id) throw new Error('writeDealSignal requires deal_id');
  const fp = path.join(DEAL_SIGNALS_DIR, `deal-${signal.deal_id}.json`);
  const enriched = {
    ...signal,
    as_of: signal.as_of || new Date().toISOString(),
    written_by: 'dashboard_coaching'
  };
  atomicWriteJson(fp, enriched);
}

function readDealSignal(dealId) {
  const fp = path.join(DEAL_SIGNALS_DIR, `deal-${dealId}.json`);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { return null; }
}

function listDealSignals() {
  ensureDirs();
  return fs.readdirSync(DEAL_SIGNALS_DIR)
    .filter(f => f.startsWith('deal-') && f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(DEAL_SIGNALS_DIR, f), 'utf8')); }
      catch (e) { return null; }
    })
    .filter(Boolean);
}

// ===========================================================================
// Customer positions — JSON, append-with-truncation, indexed by contact
// ===========================================================================

const MAX_POSITIONS_PER_CONTACT = 5;
const MIN_DAYS_RETAINED = 14;

function writeCustomerPosition({ contact_id, contact_name_generalised, associated_deal_ids = [], position }) {
  if (!contact_id) throw new Error('writeCustomerPosition requires contact_id');
  const fp = path.join(CUSTOMER_POSITIONS_DIR, `contact-${contact_id}.json`);
  let record;

  if (fs.existsSync(fp)) {
    try { record = JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch (e) { record = null; }
  }

  if (!record) {
    record = {
      contact_id,
      contact_name_generalised: contact_name_generalised || '',
      associated_deal_ids: [],
      positions: [],
      last_updated: new Date().toISOString(),
      rolling_sentiment_trajectory: 'neutral'
    };
  }

  // Merge associated deals
  record.associated_deal_ids = Array.from(new Set([
    ...(record.associated_deal_ids || []),
    ...associated_deal_ids
  ]));
  if (contact_name_generalised) record.contact_name_generalised = contact_name_generalised;

  // Append new position
  record.positions.push({ ...position, captured_at: position.captured_at || new Date().toISOString() });

  // Truncate: keep last N OR positions within last 14 days OR is_verbatim from farm_visit
  const cutoff = Date.now() - MIN_DAYS_RETAINED * 86_400_000;
  record.positions = record.positions
    .sort((a, b) => (b.as_of || b.captured_at || '').localeCompare(a.as_of || a.captured_at || ''))
    .filter((p, i) => {
      if (i < MAX_POSITIONS_PER_CONTACT) return true;
      const ts = new Date(p.as_of || p.captured_at || 0).getTime();
      if (ts >= cutoff) return true;
      if (p.is_verbatim && p.source === 'farm_visit') return true;
      return false;
    });

  record.last_updated = new Date().toISOString();
  // Derive rolling sentiment from last 3 positions
  const recent3 = record.positions.slice(0, 3);
  const sentiments = recent3.map(p => p.sentiment).filter(Boolean);
  if (sentiments.length >= 2) {
    const positives = sentiments.filter(s => s === 'positive' || s === 'neutral_warm').length;
    const negatives = sentiments.filter(s => s === 'negative' || s === 'neutral_cool').length;
    if (positives > negatives + 0) record.rolling_sentiment_trajectory = 'warming';
    else if (negatives > positives) record.rolling_sentiment_trajectory = 'cooling';
    else record.rolling_sentiment_trajectory = 'neutral';
  }

  atomicWriteJson(fp, record);
}

function readCustomerPosition(contactId) {
  const fp = path.join(CUSTOMER_POSITIONS_DIR, `contact-${contactId}.json`);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { return null; }
}

// ===========================================================================
// Probe outcomes — JSON, append-only via unique probe_id
// ===========================================================================

function writeProbeOutcome(probe) {
  if (!probe || !probe.probe_id) throw new Error('writeProbeOutcome requires probe_id');
  const fp = path.join(PROBE_OUTCOMES_DIR, `probe-${probe.probe_id}.json`);

  if (fs.existsSync(fp)) {
    // Merge: existing fields take precedence unless new probe explicitly overrides
    try {
      const existing = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const merged = { ...existing, ...probe };
      // Special-case: actual_outcome merges field-by-field
      if (existing.actual_outcome || probe.actual_outcome) {
        merged.actual_outcome = { ...(existing.actual_outcome || {}), ...(probe.actual_outcome || {}) };
      }
      atomicWriteJson(fp, merged);
      return merged;
    } catch (e) { /* fall through to fresh write */ }
  }

  atomicWriteJson(fp, probe);
  return probe;
}

function listProbeOutcomesForDeal(dealId) {
  ensureDirs();
  return fs.readdirSync(PROBE_OUTCOMES_DIR)
    .filter(f => f.startsWith('probe-') && f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(PROBE_OUTCOMES_DIR, f), 'utf8')); }
      catch (e) { return null; }
    })
    .filter(p => p && p.deal_id === dealId);
}

function listAllProbes() {
  ensureDirs();
  if (!fs.existsSync(PROBE_OUTCOMES_DIR)) return [];
  return fs.readdirSync(PROBE_OUTCOMES_DIR)
    .filter(f => f.startsWith('probe-') && f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(PROBE_OUTCOMES_DIR, f), 'utf8')); }
      catch (e) { return null; }
    })
    .filter(Boolean);
}

function listOpenProbes() {
  return listAllProbes().filter(p => !p.actual_outcome || !p.actual_outcome.detected_at);
}

function probeStats() {
  const all = listAllProbes();
  const closed = all.filter(p => p.actual_outcome && p.actual_outcome.detected_at);
  const now = Date.now();
  const ageBuckets = { lt_7d: 0, lt_14d: 0, lt_30d: 0, gte_30d: 0 };
  all.forEach(p => {
    const t = Date.parse(p.created_at || p.sent_at || '');
    if (!t) return;
    const days = (now - t) / 86400000;
    if (days < 7) ageBuckets.lt_7d++;
    else if (days < 14) ageBuckets.lt_14d++;
    else if (days < 30) ageBuckets.lt_30d++;
    else ageBuckets.gte_30d++;
  });
  const outcomeMix = {};
  closed.forEach(p => {
    const c = p.actual_outcome.outcome_class || 'unknown';
    outcomeMix[c] = (outcomeMix[c] || 0) + 1;
  });
  return {
    total: all.length,
    open: all.length - closed.length,
    closed: closed.length,
    populated_rate: all.length === 0 ? null : Math.round((closed.length / all.length) * 100) / 100,
    by_age: ageBuckets,
    outcome_mix: outcomeMix,
  };
}

// ===========================================================================
// YAML front-matter parsing — minimal but sufficient for our schema
// ===========================================================================

function parseFrontMatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  const lines = m[1].split('\n');
  let currentListKey = null;
  for (const line of lines) {
    if (/^\s*-\s/.test(line) && currentListKey) {
      out[currentListKey].push(line.replace(/^\s*-\s*/, '').trim());
      continue;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) { currentListKey = null; continue; }
    const [, key, raw] = kv;
    if (raw === '' || raw == null) { out[key] = []; currentListKey = key; }
    else { out[key] = raw.trim(); currentListKey = null; }
  }
  return out;
}

function stripFrontMatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/, '');
}

function serializeFrontMatter(fm) {
  let out = '';
  Object.keys(fm).forEach(key => {
    const val = fm[key];
    if (Array.isArray(val)) {
      out += `${key}:\n`;
      val.forEach(v => { out += `  - ${v}\n`; });
    } else {
      out += `${key}: ${val}\n`;
    }
  });
  return out;
}

module.exports = {
  BUS_ROOT,
  writePattern, readPattern, listPatterns,
  writeDealSignal, readDealSignal, listDealSignals,
  writeCustomerPosition, readCustomerPosition,
  writeProbeOutcome, listProbeOutcomesForDeal, listAllProbes, listOpenProbes, probeStats,
};
