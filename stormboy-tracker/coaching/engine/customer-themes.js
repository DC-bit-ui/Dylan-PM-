/**
 * Customer themes — aggregates topic-level signal from the team's actual
 * customer conversations (farm visits, calls, emails) to surface what's
 * resonating with landholders. Marketing-side intelligence.
 *
 * Source corpora:
 *   - hobbs-distillates-bulk.json (6 farm visits, ~30 topic distillates)
 *   - hobbs-calls-distillates.json (Hobbs Aircall transcripts)
 *   - ben-calls-distillates.json (Ben's Aircall transcripts)
 *   - farm_visit_distillates.json (generic farm visits)
 *   - email_distillates.json (email-derived topics where applicable)
 *
 * Each distillate has the structured shape:
 *   { topic_label, customer_position, rep_response, landed_or_friction,
 *     quotable_phrasing, confidence }
 *
 * Output groups by topic_label, ranks by frequency, surfaces the verbatim
 * customer voice + the landed-vs-friction split + which reps surfaced it.
 *
 * This is NOT the same as the rep-side language bank (that's
 * /api/messaging/resonance). This is customer-side speech grouped by what
 * THEY are responding to.
 */

const fs = require('fs');
const path = require('path');
const { create: createBundle, readResult: readBundleResult } = require('./intelligence-bundles');

// Migrated from direct Anthropic API to bundle-based subscription compute
// per Cadel directive 2026-05-18. The clustering call (~once per refresh)
// now writes a bundle to <bus>/intelligence-bundles/ and caches a pending
// stub. Subsequent runs check for the result and upgrade cache when ready.
// While pending, the engine returns ungrouped themes so the UI keeps working.

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const CLUSTERS_CACHE_PATH = path.join(CACHE_DIR, 'customer-themes-clusters.json');

// Distillate files we know about. The engine tolerates missing files.
const SOURCES = [
  { file: 'hobbs-distillates-bulk.json', label: 'Hobbs farm visits',  rep: 'Hobbs', surface: 'farm visit' },
  { file: 'hobbs-calls-distillates.json', label: 'Hobbs calls',        rep: 'Hobbs', surface: 'call' },
  { file: 'ben-calls-distillates.json',   label: 'Ben calls',          rep: 'Ben',   surface: 'call' },
  { file: 'farm_visit_distillates.json',  label: 'Farm visits (mixed)', rep: null,   surface: 'farm visit' },
  { file: 'email_distillates.json',       label: 'Emails',             rep: null,   surface: 'email' },
];

function loadJson(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) { return null; }
}

function normaliseTopic(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/[/+]/g, ' ')          // slashes + plus → space (otherwise "trust/track" ≠ "trust track")
    .replace(/[^\w\s-]/g, '')       // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// Walk the JSON looking for objects with topic_distillates arrays. Tolerates
// variation between files (hobbs-distillates-bulk uses .visits[*].topic_distillates,
// other shapes may use flat arrays).
function extractDistillates(data, source) {
  const out = [];
  function push(d, meta) {
    if (!d || !d.topic_label) return;
    out.push({
      topic_label: d.topic_label,
      topic_normalised: normaliseTopic(d.topic_label),
      customer_position: d.customer_position || '',
      rep_response: d.hobbs_response || d.rep_response || d.response || '',
      landed_or_friction: d.landed_or_friction || 'unknown',
      quotable_phrasing: d.quotable_phrasing || '',
      confidence: d.confidence || 'moderate',
      rep: source.rep || (meta && meta.rep) || null,
      surface: source.surface,
      source_file: source.file,
      source_meta: meta || null,
    });
  }
  if (!data) return out;
  if (Array.isArray(data.visits)) {
    data.visits.forEach(v => {
      const meta = { visit_date: v.visit_date, region: v.region_nrm, size: v.size_bucket };
      (v.topic_distillates || []).forEach(d => push(d, meta));
    });
  }
  if (Array.isArray(data.calls)) {
    data.calls.forEach(c => {
      const meta = { call_date: c.call_date || c.date, contact_id: c.contact_id };
      (c.topic_distillates || []).forEach(d => push(d, meta));
    });
  }
  if (Array.isArray(data.distillates)) {
    data.distillates.forEach(d => push(d, null));
  }
  if (Array.isArray(data.topic_distillates)) {
    data.topic_distillates.forEach(d => push(d, null));
  }
  return out;
}

function groupByTheme(distillates) {
  const groups = {};
  distillates.forEach(d => {
    const key = d.topic_normalised;
    if (!key) return;
    groups[key] = groups[key] || {
      theme_key: key,
      display_labels: new Set(),
      occurrences: 0,
      landed_count: 0,
      friction_count: 0,
      customer_positions: [],
      quotes: [],
      reps: new Set(),
      surfaces: new Set(),
      sources: new Set(),
      visit_dates: new Set(),
    };
    const g = groups[key];
    g.display_labels.add(d.topic_label);
    g.occurrences++;
    if (d.landed_or_friction === 'landed') g.landed_count++;
    if (d.landed_or_friction === 'friction') g.friction_count++;
    if (d.customer_position) g.customer_positions.push({ text: d.customer_position, rep: d.rep, surface: d.surface, landed: d.landed_or_friction });
    if (d.quotable_phrasing) g.quotes.push({ text: d.quotable_phrasing, rep: d.rep, surface: d.surface, landed: d.landed_or_friction });
    if (d.rep) g.reps.add(d.rep);
    g.surfaces.add(d.surface);
    g.sources.add(d.source_file);
    if (d.source_meta && d.source_meta.visit_date) g.visit_dates.add(d.source_meta.visit_date);
  });

  // Pick a canonical display label (longest one — usually most descriptive)
  const themes = Object.values(groups).map(g => {
    const labels = Array.from(g.display_labels);
    const canonical = labels.sort((a, b) => b.length - a.length)[0];
    return {
      theme: canonical,
      theme_alternatives: labels.filter(l => l !== canonical),
      occurrences: g.occurrences,
      landed_count: g.landed_count,
      friction_count: g.friction_count,
      land_rate: g.occurrences > 0 ? Math.round((g.landed_count / g.occurrences) * 100) : 0,
      customer_positions: g.customer_positions,
      quotes: g.quotes,
      reps: Array.from(g.reps),
      surfaces: Array.from(g.surfaces),
      visit_dates: Array.from(g.visit_dates).sort(),
      source_files: Array.from(g.sources),
    };
  });

  // Sort by occurrences desc, then by land_rate desc
  themes.sort((a, b) => {
    if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences;
    return b.land_rate - a.land_rate;
  });

  return themes;
}

// ---- Cluster topic labels via LLM, cached -------------------------------
//
// 110 distillates produce 110 unique topic_labels because the team phrases
// each topic slightly differently. To produce useful marketing themes we
// cluster them into ~15-25 broader themes once, cache the mapping, and rebuild
// only when new distillates land (cache invalidates when label count changes).

const CLUSTER_SYSTEM = `You are clustering sales-conversation topic labels into broader marketing themes for an Australian soil-carbon company (AgriProve). The input is a list of topic labels surfaced by reps in real farm-visit and call distillates. The output groups them into 12-22 broader themes that marketing can use to anchor campaign messaging.

Rules:
- Each cluster MUST have a short, concrete theme label (4-8 words). Not generic ("trust"); concrete ("track record and operator credibility").
- Labels that mean the same thing belong together — e.g. "25% revenue split" and "Revenue share / 25% framing" → one cluster.
- Customer-objection topics ("we'd do this anyway", "permanence concerns") get their own clusters — distinct from positive-framing topics.
- Order clusters by likely marketing utility (start with what's landing most widely).
- Do not omit any label — every label must appear in exactly one cluster.`;

// Queue (or check) clustering as an intelligence bundle.
// Returns one of:
//   { status: 'completed', clusters: [...] } — bundle result available
//   { status: 'queued',    bundle_id: 'xyz' } — bundle waiting; no clusters yet
function queueOrFetchClusters(labels, labelKey, cache) {
  if (labels.length === 0) return { status: 'completed', clusters: [] };

  // If cache has a pending bundle for this labelKey, check the result
  if (cache && cache.label_key === labelKey && cache.bundle_id && cache.status === 'queued') {
    const result = readBundleResult(cache.bundle_id);
    if (result && result.result != null) {
      const parsed = safeParseJson(result.result);
      if (parsed && Array.isArray(parsed.clusters)) {
        return { status: 'completed', clusters: parsed.clusters, bundle_id: cache.bundle_id };
      }
    }
    // Still pending — keep returning queued
    return { status: 'queued', bundle_id: cache.bundle_id };
  }

  // No matching cache; create a new bundle
  const numbered = labels.map((l, i) => `${i}. ${l}`).join('\n');
  const user = `Cluster these ${labels.length} topic labels into 12-22 broader marketing themes. Return strict JSON only:
{
  "clusters": [
    {
      "theme": "concrete 4-8 word theme name",
      "member_indices": [0, 3, 8, 19]
    },
    ...
  ]
}

LABELS:
${numbered}`;

  const meta = createBundle({
    purpose: 'customer-themes-cluster',
    system_prompt: CLUSTER_SYSTEM,
    input_data: user,
    output_spec: 'Strict JSON: { "clusters": [ { "theme": "...", "member_indices": [...] }, ... ] }',
    output_schema: 'json',
    model_hint: 'haiku',
    target_kind: 'cluster',
    target_file: 'coaching/cache/customer-themes-clusters.json',
    input_summary: `Customer themes clustering · ${labels.length} labels`,
    created_by: 'customer-themes.js',
  });
  return { status: 'queued', bundle_id: meta.id };
}

function safeParseJson(s) {
  if (typeof s !== 'string') return s;
  try { return JSON.parse(s); }
  catch (_) {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
    return null;
  }
}

function loadClusterCache() {
  try {
    if (!fs.existsSync(CLUSTERS_CACHE_PATH)) return null;
    return JSON.parse(fs.readFileSync(CLUSTERS_CACHE_PATH, 'utf8'));
  } catch (_) { return null; }
}

function saveClusterCache(c) {
  fs.writeFileSync(CLUSTERS_CACHE_PATH, JSON.stringify(c, null, 2));
}

async function clusterThemes(themes, force = false) {
  // Use the canonical theme label (longest member) as the clustering input
  const labels = themes.map(t => t.theme);
  const labelKey = labels.length + ':' + labels.slice(0, 5).join('|').slice(0, 80);
  let cache = loadClusterCache();

  // Cache hit (completed) — use it
  if (!force && cache && cache.label_key === labelKey
      && cache.labels && cache.labels.length === labels.length
      && Array.isArray(cache.clusters) && cache.status !== 'queued') {
    return applyClusters(themes, cache.clusters);
  }

  // Bundle path: queue or check
  console.log(`[customer-themes] clustering ${labels.length} labels via bundle queue`);
  const r = queueOrFetchClusters(labels, labelKey, cache);

  if (r.status === 'completed' && Array.isArray(r.clusters)) {
    cache = {
      generated_at: new Date().toISOString(),
      label_count: labels.length,
      label_key: labelKey,
      labels,
      clusters: r.clusters,
      bundle_id: r.bundle_id || null,
      status: 'completed',
    };
    saveClusterCache(cache);
    return applyClusters(themes, r.clusters);
  }

  // status === 'queued' — bundle in flight, return ungrouped for now.
  // Save the pending cache entry so next run can pick up the completed result.
  cache = {
    generated_at: new Date().toISOString(),
    label_count: labels.length,
    label_key: labelKey,
    labels,
    clusters: null,
    bundle_id: r.bundle_id,
    status: 'queued',
  };
  saveClusterCache(cache);
  return themes;  // ungrouped fallback while bundle processes
}

function applyClusters(themes, clusters) {
  const clustered = clusters.map(c => {
    const members = (c.member_indices || []).map(i => themes[i]).filter(Boolean);
    if (!members.length) return null;
    const occ = members.reduce((s, m) => s + m.occurrences, 0);
    const landed = members.reduce((s, m) => s + m.landed_count, 0);
    const friction = members.reduce((s, m) => s + m.friction_count, 0);
    const allCustomerPositions = members.flatMap(m => m.customer_positions);
    const allQuotes = members.flatMap(m => m.quotes);
    const reps = new Set();
    members.forEach(m => (m.reps || []).forEach(r => reps.add(r)));
    const surfaces = new Set();
    members.forEach(m => (m.surfaces || []).forEach(r => surfaces.add(r)));
    return {
      theme: c.theme,
      member_labels: members.map(m => m.theme),
      member_label_count: members.length,
      occurrences: occ,
      landed_count: landed,
      friction_count: friction,
      land_rate: occ > 0 ? Math.round((landed / occ) * 100) : 0,
      customer_positions: allCustomerPositions,
      quotes: allQuotes,
      reps: Array.from(reps),
      surfaces: Array.from(surfaces),
    };
  }).filter(Boolean);
  // Re-sort by occurrences
  clustered.sort((a, b) => {
    if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences;
    return b.land_rate - a.land_rate;
  });
  return clustered;
}

async function run(opts = {}) {
  const allDistillates = [];
  const sourcesLoaded = [];
  SOURCES.forEach(s => {
    const p = path.join(CACHE_DIR, s.file);
    const data = loadJson(p);
    if (!data) return;
    const extracted = extractDistillates(data, s);
    allDistillates.push(...extracted);
    sourcesLoaded.push({ file: s.file, label: s.label, distillates: extracted.length });
  });

  const rawThemes = groupByTheme(allDistillates);
  const themes = await clusterThemes(rawThemes, !!opts.force);

  // Compute high-level marketing signal
  const totalDistillates = allDistillates.length;
  const totalLanded = allDistillates.filter(d => d.landed_or_friction === 'landed').length;
  const totalFriction = allDistillates.filter(d => d.landed_or_friction === 'friction').length;
  const topLanded = themes.filter(t => t.landed_count > 0).slice(0, 10);
  const topFriction = themes.filter(t => t.friction_count >= 2).slice(0, 10);

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_topic_distillates: totalDistillates,
      total_themes: themes.length,
      total_landed: totalLanded,
      total_friction: totalFriction,
      overall_land_rate: totalDistillates > 0 ? Math.round((totalLanded / totalDistillates) * 100) : 0,
      sources_loaded: sourcesLoaded,
    },
    themes,
    top_landed_themes: topLanded,
    top_friction_themes: topFriction,
  };
}

module.exports = { run, clusterThemes };
