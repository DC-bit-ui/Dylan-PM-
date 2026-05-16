/**
 * Brain sync — mirrors the dashboard-authored team-brain files into the
 * shared-growth-memory bus so Claudia's tool (and any other team Claude Code
 * instance) reads the same source material.
 *
 * Authoritative source: stormboy-tracker/coaching/ (this repo)
 * Mirror destination:   shared-growth-memory/team-brain/
 *
 * Idempotent — only copies files that have changed.
 */

const fs = require('fs');
const path = require('path');

const COACHING_ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(COACHING_ROOT, 'cache');
const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const BRAIN_DIR = path.join(BUS_ROOT, 'team-brain');
const PROFILES_DIR = path.join(BRAIN_DIR, 'profiles');
const DISTILLATES_DIR = path.join(BRAIN_DIR, 'distillates');

// Map: source path → destination filename (within profiles/ or distillates/)
const SYNC_MAP = [
  { src: path.join(COACHING_ROOT, 'hobbs-profile.md'),   dest: path.join(PROFILES_DIR, 'hobbs.md') },
  { src: path.join(COACHING_ROOT, 'ben-profile.md'),     dest: path.join(PROFILES_DIR, 'ben.md') },
  { src: path.join(COACHING_ROOT, 'claudia-profile.md'), dest: path.join(PROFILES_DIR, 'claudia.md') },
  { src: path.join(COACHING_ROOT, 'will-profile.md'),    dest: path.join(PROFILES_DIR, 'will.md') },
  { src: path.join(CACHE_DIR, 'hobbs-distillates-bulk.json'), dest: path.join(DISTILLATES_DIR, 'hobbs-farm-visits.json') },
  { src: path.join(CACHE_DIR, 'hobbs-calls-distillates.json'), dest: path.join(DISTILLATES_DIR, 'hobbs-calls.json') },
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function sameContent(a, b) {
  try {
    if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
    const sa = fs.statSync(a);
    const sb = fs.statSync(b);
    if (sa.size !== sb.size) return false;
    return fs.readFileSync(a).equals(fs.readFileSync(b));
  } catch (_) { return false; }
}

function atomicCopy(src, dest) {
  ensureDir(path.dirname(dest));
  const tmp = dest + '.tmp';
  fs.copyFileSync(src, tmp);
  fs.renameSync(tmp, dest);
}

function sync() {
  ensureDir(PROFILES_DIR);
  ensureDir(DISTILLATES_DIR);
  const report = { generated_at: new Date().toISOString(), bus_path: BUS_ROOT, files: [] };
  for (const { src, dest } of SYNC_MAP) {
    const entry = { src: path.relative(COACHING_ROOT, src), dest: path.relative(BUS_ROOT, dest) };
    if (!fs.existsSync(src)) {
      entry.status = 'source_missing';
      report.files.push(entry);
      continue;
    }
    if (sameContent(src, dest)) {
      entry.status = 'unchanged';
      report.files.push(entry);
      continue;
    }
    try {
      atomicCopy(src, dest);
      entry.status = 'copied';
      entry.size_bytes = fs.statSync(dest).size;
    } catch (e) {
      entry.status = 'failed';
      entry.error = e.message;
    }
    report.files.push(entry);
  }
  const copied = report.files.filter(f => f.status === 'copied').length;
  const unchanged = report.files.filter(f => f.status === 'unchanged').length;
  report.summary = `${copied} copied, ${unchanged} unchanged, ${report.files.length} total`;
  return report;
}

module.exports = { sync };
