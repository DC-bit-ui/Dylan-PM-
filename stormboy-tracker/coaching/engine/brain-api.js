/**
 * Brain content API — serves the captured profiles + distillates to the v2 BRAIN tab.
 *
 * Endpoints feed:
 *   - /api/brain/index    — what profiles + distillate sets exist + counts
 *   - /api/brain/profile/:slug — markdown body + auto-generated TOC
 *   - /api/brain/distillates   — flat list of farm-visit + call distillates
 */

const fs = require('fs');
const path = require('path');

const COACHING_ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(COACHING_ROOT, 'cache');

const PROFILES = {
  hobbs:     { name: 'Hobbs',     file: 'hobbs-profile.md',     description: 'Digital replica — signature moves, language bank, plays.' },
  ben:       { name: 'Ben',       file: 'ben-profile.md',       description: 'Performance profile — call patterns, Hills mechanism.' },
  claudia:   { name: 'Claudia',   file: 'claudia-profile.md',   description: 'Operating model — tool philosophy + /improve cycle.' },
  will:      { name: 'Will',      file: 'will-profile.md',      description: 'Operations profile — Head of Operations, NOT a sales rep.' },
  kieren:    { name: 'Kieren',    file: 'kieren-profile.md',    description: 'Leadership profile — CPO-equivalent, how to bring things to him.' },
  'bill-hyem': { name: 'Bill Hyem', file: 'bill-hyem-profile.md', description: 'Excellence profile — historical top performer, ex-AP, now at Ceres Tag.' },
};

function loadFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; }
}

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

/**
 * Auto-generate TOC from markdown headers (## and ###). Returns array of
 * { level, text, slug } entries that the frontend can render as nav.
 */
function buildToc(md) {
  const lines = md.split('\n');
  const toc = [];
  const slugCounts = {};
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim();
    let slug = text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60);
    // De-dup slugs
    if (slugCounts[slug] !== undefined) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 0;
    }
    toc.push({ level, text, slug });
  }
  return toc;
}

function getIndex() {
  const out = { profiles: {}, distillates: {} };
  for (const [slug, meta] of Object.entries(PROFILES)) {
    const p = path.join(COACHING_ROOT, meta.file);
    if (!fs.existsSync(p)) continue;
    const stat = fs.statSync(p);
    out.profiles[slug] = {
      ...meta,
      size_bytes: stat.size,
      last_modified: stat.mtime.toISOString(),
    };
  }
  const fv = loadJson(path.join(CACHE_DIR, 'hobbs-distillates-bulk.json'));
  const calls = loadJson(path.join(CACHE_DIR, 'hobbs-calls-distillates.json'));
  out.distillates = {
    farm_visits: { count: (fv && fv.visits) ? fv.visits.length : 0 },
    calls: { count: (calls && calls.calls) ? calls.calls.length : 0 },
  };
  return out;
}

function getProfile(slug) {
  const meta = PROFILES[slug];
  if (!meta) throw new Error('Unknown profile: ' + slug);
  const filePath = path.join(COACHING_ROOT, meta.file);
  if (!fs.existsSync(filePath)) throw new Error('Profile file missing: ' + meta.file);
  const md = loadFile(filePath);
  return {
    slug,
    name: meta.name,
    description: meta.description,
    markdown: md,
    toc: buildToc(md),
    size_bytes: Buffer.byteLength(md, 'utf8'),
  };
}

function getDistillates() {
  const farmVisits = loadJson(path.join(CACHE_DIR, 'hobbs-distillates-bulk.json'));
  const calls = loadJson(path.join(CACHE_DIR, 'hobbs-calls-distillates.json'));
  const fvList = (farmVisits && farmVisits.visits || []).map(v => ({
    kind: 'farm_visit',
    id: v.transcript_id,
    visit_date: v.visit_date,
    region: v.region_nrm,
    size_bucket: v.size_bucket,
    outcome: v.visit_summary && v.visit_summary.overall_outcome,
    one_line: v.visit_summary && v.visit_summary.one_line_summary,
    topic_count: (v.topic_distillates || []).length,
    topics: (v.topic_distillates || []).map(t => ({
      topic_label: t.topic_label,
      customer_position: t.customer_position,
      hobbs_response: t.hobbs_response,
      landed_or_failed: t.landed_or_failed || null,
    })),
  }));
  const callList = (calls && calls.calls || []).map(c => ({
    kind: 'call',
    id: c.transcript_id,
    visit_date: c.visit_date,
    region: c.region_nrm,
    call_type: c.call_type,
    outcome: c.visit_summary && c.visit_summary.overall_outcome,
    one_line: c.visit_summary && c.visit_summary.one_line_summary,
    topic_count: (c.topic_distillates || []).length,
    topics: (c.topic_distillates || []).map(t => ({
      topic_label: t.topic_label,
      customer_position: t.customer_position,
      hobbs_response: t.hobbs_response,
    })),
  }));
  return {
    generated_at: new Date().toISOString(),
    farm_visits: fvList,
    calls: callList,
  };
}

module.exports = { getIndex, getProfile, getDistillates };
