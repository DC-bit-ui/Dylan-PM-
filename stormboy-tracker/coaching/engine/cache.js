/**
 * Cache layer — read/write JSON snapshots for coaching outputs.
 *
 * Design:
 * - Each cache file is double-buffered: writing a new value automatically
 *   archives the previous value so diff-detection can compute "what changed".
 * - All reads are sync (small files, hot path on tab switches).
 * - Writes are atomic (write to .tmp, rename) so a half-written file never
 *   gets read.
 */
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', 'cache');

const KEYS = ['friction', 'twins', 'objections', 'active', 'weekly', 'email_distillates', 'farm_visit_distillates', 'team_intel', 'learning_candidates'];

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function pathFor(key) {
  return path.join(CACHE_DIR, key + '.json');
}

function pathForPrev(key) {
  return path.join(CACHE_DIR, key + '.previous.json');
}

function read(key) {
  ensureDir();
  const p = pathFor(key);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`cache.read(${key}) parse error:`, e.message);
    return null;
  }
}

function readPrevious(key) {
  ensureDir();
  const p = pathForPrev(key);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function write(key, data) {
  ensureDir();
  const cur = pathFor(key);
  const prev = pathForPrev(key);
  const tmp = cur + '.tmp';

  // Archive current → previous (only if current exists and differs)
  if (fs.existsSync(cur)) {
    try { fs.copyFileSync(cur, prev); } catch (e) { /* best-effort */ }
  }

  // Atomic write
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, cur);
}

/**
 * Read current + previous for a key. Returns { current, previous } so
 * downstream code can compute diffs.
 */
function readWithPrevious(key) {
  return { current: read(key), previous: readPrevious(key) };
}

/**
 * Compute a Plays-style diff between current and previous active.json.
 * Returns null if either snapshot is missing.
 */
function diffActive() {
  const { current, previous } = readWithPrevious('active');
  if (!current || !previous) return null;
  const cur = current.deals || [];
  const prev = previous.deals || [];
  const prevById = Object.fromEntries(prev.map(d => [d.deal_id, d]));
  const curIds = new Set(cur.map(d => d.deal_id));

  const riskMoves = [];
  const actionChanges = [];
  const newDeals = [];
  const closed = [];

  cur.forEach(d => {
    const p = prevById[d.deal_id];
    if (!p) { newDeals.push(d); return; }
    if (p.risk_class !== d.risk_class) riskMoves.push({ deal_id: d.deal_id, deal_name: d.deal_name, from: p.risk_class, to: d.risk_class });
    if (p.primary_action !== d.primary_action) actionChanges.push({ deal_id: d.deal_id, deal_name: d.deal_name });
  });
  prev.forEach(p => { if (!curIds.has(p.deal_id)) closed.push({ deal_id: p.deal_id, deal_name: p.deal_name }); });

  return { riskMoves, actionChanges, newDeals: newDeals.map(d => ({ deal_id: d.deal_id, deal_name: d.deal_name })), closed };
}

module.exports = { KEYS, read, readPrevious, write, readWithPrevious, diffActive, CACHE_DIR };
