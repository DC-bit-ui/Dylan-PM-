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

// Bus locations for evolving sources (interviews + standups + manual themes).
// Auto-discovered — new files matching the patterns automatically flow in.
const BUS_ROOT = process.env.BUS_PATH || require('path').join('C:', 'Dylan PM', 'shared-growth-memory');
const PERSONA_SUPPLEMENTS_DIR = path.join(BUS_ROOT, 'persona-supplements');
const INBOX_GRANOLA_DIR = path.join('C:', 'Dylan PM', 'inbox', 'granola');

// Patterns we treat as marketing-resonance signal sources:
//   manual-interview-*.md       — Dylan's team-member interviews (reflective syntheses, high signal)
//   manual-hobbs-feedback-*.md  — peer feedback captured in interviews
//   *-interview.md              — any other interview format (inbox or bus)
//   granola-*standup*.md        — Mon/Fri standup transcripts (weekly resonance signals)
//   manual-standup-*.md         — manual standup commitment captures
//   resonance-*.md / theme-*.md — explicit resonance/theme notes (future-proofing)
const EVOLVING_SOURCE_PATTERNS = [
  { pattern: /^manual-interview-\d{4}-\d{2}-\d{2}\.md$/i,      surface: 'interview',  weight: 3 },
  { pattern: /^manual-[a-z-]+-feedback-\d{4}-\d{2}-\d{2}\.md$/i, surface: 'interview', weight: 2 },
  { pattern: /interview\.md$/i,                                  surface: 'interview',  weight: 3 },
  { pattern: /granola.*standup.*\.md$/i,                         surface: 'standup',    weight: 2 },
  { pattern: /^manual-standup-.*\.md$/i,                         surface: 'standup',    weight: 2 },
  { pattern: /^(resonance|theme)-.*\.md$/i,                      surface: 'manual-note', weight: 3 },
];

function loadJson(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) { return null; }
}

// Parse a markdown interview / standup / theme note into synthetic
// distillate records. Each H3 (`###`) becomes a topic; each bullet
// beneath it becomes a customer_position. Strips emoji prefixes and
// markdown bold for cleaner clustering input.
//
// Heuristic: bullets that look like rep-mechanics ("rapport", "open",
// "intro") are DOWNWEIGHTED — we keep them so the cluster prompt can
// see them, but the prompt's DROP rules will exclude them. Bullets
// quoting a customer in italics or with quote chars get marked as
// 'landed' (someone reflected they resonate).
function parseInterviewMarkdown(filePath, opts) {
  let text;
  try { text = fs.readFileSync(filePath, 'utf8'); } catch (_) { return []; }
  if (!text || text.length < 50) return [];
  const fileName = path.basename(filePath);
  const out = [];
  const lines = text.split(/\r?\n/);
  let currentH3 = null;
  let currentTopic = null;
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    // Detect H3 heading (### Topic name) — start of a new topic block
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3) {
      currentH3 = h3[1]
        .replace(/^[^\w]+/, '')         // strip leading emoji/whitespace
        .replace(/\*\*/g, '')           // strip markdown bold
        .trim();
      currentTopic = currentH3;
      continue;
    }
    // Detect H2 (## Topic) as fallback
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      currentH3 = h2[1].replace(/^[^\w]+/, '').replace(/\*\*/g, '').trim();
      currentTopic = currentH3;
      continue;
    }
    // Bullets (- or *)
    const bullet = line.match(/^\s*[-*]\s+(.+?)\s*$/);
    if (!bullet || !currentTopic) continue;
    let body = bullet[1].trim();
    if (body.length < 15) continue;
    // Detect quoted/italicised customer phrasing as a stronger signal
    const hasQuote = /["“][^"”]{8,}["”]|[*_][^*_]{15,}[*_]/.test(body);
    // Strip leading "**Label:**" or "**Term** —" decoration but keep the meat
    body = body.replace(/^\*\*[^*]+\*\*\s*[—:-]\s*/, '');
    // Skip pure rep-mechanic bullets — the cluster prompt drops these anyway
    if (/^(intro|cold[\s-]?open|warm[\s-]?up|rapport|fellowship|greet)/i.test(body)) {
      // Keep but mark as rep_mechanic so we can downweight later
    }
    out.push({
      topic_label: currentTopic,
      topic_normalised: normaliseTopic(currentTopic),
      customer_position: body,
      rep_response: '',
      landed_or_friction: hasQuote ? 'landed' : 'landed', // interviews capture reflective insights — treat all as landed
      quotable_phrasing: hasQuote ? body.slice(0, 280) : '',
      confidence: 'high',
      rep: opts.rep || null,
      surface: opts.surface,
      source_file: fileName,
      source_path: filePath,
      source_meta: { kind: opts.surface, weight: opts.weight || 1 },
    });
  }
  return out;
}

// Auto-discover interview / standup / theme markdown files in:
//   1. shared-growth-memory/persona-supplements/<rep>/
//   2. inbox/granola/ (local — not yet synced to bus)
//
// Returns parsed distillates ready to merge with the JSON sources.
//
// Dedup strategy:
//   - Standups land in EVERY rep's persona folder (4 copies of the same
//     team meeting). Dedup by filename so each standup is ingested once.
//   - Interviews are per-rep (Hobbs's interview ≠ Ben's interview) so
//     they don't dedup by name. But the SAME file can appear at both an
//     inbox path and a bus path → dedup by content hash of the first
//     400 chars too.
function loadEvolvingSources() {
  const out = [];
  const found = [];
  const seenFileNames = new Set();   // standup dedup
  const seenContentHashes = new Set(); // any-source content dedup

  function contentHash(text) {
    let h = 5381;
    const sample = text.slice(0, 400);
    for (let i = 0; i < sample.length; i++) h = ((h * 33) ^ sample.charCodeAt(i)) >>> 0;
    return String(h);
  }

  function scanDir(dir, defaultRep) {
    if (!fs.existsSync(dir)) return;
    let files;
    try { files = fs.readdirSync(dir); } catch (_) { return; }
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try { stat = fs.statSync(fullPath); } catch (_) { continue; }
      if (stat.isDirectory()) {
        // Per-rep subdirs in persona-supplements/
        scanDir(fullPath, file);
        continue;
      }
      if (!file.endsWith('.md')) continue;
      const match = EVOLVING_SOURCE_PATTERNS.find(p => p.pattern.test(file));
      if (!match) continue;

      // Standups are team-wide artifacts that get synced into every rep
      // folder. Skip if we've seen this filename already — the first
      // ingest wins (whichever rep folder iterated first).
      if (match.surface === 'standup' && seenFileNames.has(file)) continue;

      // Content-hash dedup for files that may appear at both inbox + bus paths
      let text;
      try { text = fs.readFileSync(fullPath, 'utf8'); } catch (_) { continue; }
      const hash = contentHash(text);
      if (seenContentHashes.has(hash)) continue;
      seenContentHashes.add(hash);
      if (match.surface === 'standup') seenFileNames.add(file);

      const rep = defaultRep
        ? (defaultRep.charAt(0).toUpperCase() + defaultRep.slice(1))
        : null;
      const parsed = parseInterviewMarkdown(fullPath, {
        rep,
        surface: match.surface,
        weight: match.weight,
      });
      if (parsed.length) {
        out.push(...parsed);
        found.push({
          file: path.relative(BUS_ROOT, fullPath).replace(/\\/g, '/'),
          surface: match.surface,
          rep,
          distillates: parsed.length,
        });
      }
    }
  }

  scanDir(PERSONA_SUPPLEMENTS_DIR, null);
  scanDir(INBOX_GRANOLA_DIR, null);
  return { distillates: out, sources_found: found };
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

const CLUSTER_SYSTEM = `You are extracting MARKETING-GRADE themes from real sales conversations between AgriProve reps and Australian landholders considering soil-carbon projects. The goal is to produce themes that marketing can use as CAMPAIGN ANCHORS, not a list of call mechanics.

Each input topic comes with:
- A topic label (what a rep tagged the topic as)
- 1–2 sample customer positions (verbatim things the landholder said)
- A land/friction outcome

YOUR JOB
Cluster these into 12–18 LANDHOLDER-CENTRIC themes that drive marketing reapplication.

CRITICAL FRAMING — what counts as a marketing theme

  KEEP — landholder concern, belief, fear, motivation, or desired outcome:
    - "25% revenue split as risk transfer, not commission"
    - "Cycle-grazing already aligned — soil-carbon is the missing monetisation"
    - "ACCU price volatility worries vs guaranteed pipeline of credits"
    - "25-year permanence concerns and exit-clause friction"
    - "Methodology liability transfer over 25 years"
    - "Neighbour adoption / peer FOMO"
    - "Carbon credits as a financial product, not a moral one"
    - "ERF regulator legitimacy and government-backing reassurance"
    - "Family succession and intergenerational asset framing"

  DROP — rep-mechanic, procedural, or housekeeping topics. These have ZERO marketing value:
    - "Cold open", "cold-open as your favorite American", "warm intro", "fellowship frame"
    - "Visit framing", "scheduling the next call", "follow-up timing"
    - "Internal handoffs", "introducing the team", "first-name + AgriProve"
    - "Greeting style", "rapport-building", "introducing geographic ties"

  If a candidate cluster is ONLY about how the rep started or framed a conversation, DROP IT entirely — don't include it in the output.

RULES
- 4–10 word theme name. Concrete, landholder-perspective.
- Friction themes get their own clusters — counter-arguments are campaign gold.
- For each cluster, ALSO produce:
  - marketing_angle: 1-sentence campaign hook this theme could anchor
  - headline_candidate: punchy 4–12 word headline draft
  - supporting_quote: the single best verbatim customer line from the inputs (their exact words)
- Order by marketing utility — most-resonant + most-actionable first.

OUTPUT (strict JSON):
{
  "clusters": [
    {
      "theme": "concrete landholder-perspective theme (4-10 words)",
      "marketing_angle": "1-sentence campaign hook",
      "headline_candidate": "punchy 4-12 word headline",
      "supporting_quote": "best verbatim customer line",
      "member_indices": [0, 3, 8]
    }
  ]
}

DO NOT include rep-mechanic clusters. DO NOT pad. Better fewer concrete themes than many shallow ones.`;

// Queue (or check) clustering as an intelligence bundle.
// Returns one of:
//   { status: 'completed', clusters: [...] } — bundle result available
//   { status: 'queued',    bundle_id: 'xyz' } — bundle waiting; no clusters yet
//
// themesPayload provides per-label context (customer_positions, outcomes)
// so the LLM can cluster by landholder concern rather than rep-mechanic label.
function queueOrFetchClusters(labels, labelKey, cache, themesPayload) {
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

  // No matching cache; create a new bundle.
  // Pass each label WITH 1-2 sample customer positions so the LLM can
  // cluster by landholder concern rather than rep-mechanic label.
  const numbered = labels.map((l, i) => {
    const cp = (themesPayload && themesPayload[i] && themesPayload[i].customer_positions) || [];
    const samples = cp.slice(0, 2)
      .map(c => `   Customer said: "${(c.text || '').slice(0, 180).replace(/"/g, '\\"')}"`)
      .join('\n');
    const outcome = themesPayload && themesPayload[i] && themesPayload[i].landed_count > themesPayload[i].friction_count
      ? '   Outcome: landed'
      : (themesPayload && themesPayload[i] && themesPayload[i].friction_count > 0)
      ? '   Outcome: friction'
      : '';
    return `${i}. ${l}\n${samples}${outcome ? '\n' + outcome : ''}`;
  }).join('\n\n');

  const user = `Below are ${labels.length} topic clusters from real AgriProve sales conversations. Each has the rep's topic label + verbatim customer positions.

Cluster these into 12–18 MARKETING-GRADE landholder-centric themes per the system prompt rules. Drop rep-mechanic clusters entirely. Return strict JSON only.

TOPIC CLUSTERS:
${numbered}`;

  const meta = createBundle({
    purpose: 'customer-themes-cluster',
    system_prompt: CLUSTER_SYSTEM,
    input_data: user,
    output_spec: 'Strict JSON: { "clusters": [ { "theme": "...", "marketing_angle": "...", "headline_candidate": "...", "supporting_quote": "...", "member_indices": [...] }, ... ] }',
    output_schema: 'json',
    model_hint: 'haiku',
    target_kind: 'marketing-theme-cluster',
    target_file: 'coaching/cache/customer-themes-clusters.json',
    input_summary: `Marketing-grade landholder theme clustering · ${labels.length} input topics`,
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
  // Use the canonical theme label (longest member) as the clustering input.
  // v2 (2026-05-22) prefix: bumped to invalidate stale rep-mechanic clusters
  // so the new marketing-grade prompt re-runs against existing data.
  const labels = themes.map(t => t.theme);
  const labelKey = 'v2:' + labels.length + ':' + labels.slice(0, 5).join('|').slice(0, 80);
  let cache = loadClusterCache();

  // Cache hit (completed) — use it
  if (!force && cache && cache.label_key === labelKey
      && cache.labels && cache.labels.length === labels.length
      && Array.isArray(cache.clusters) && cache.status !== 'queued') {
    return applyClusters(themes, cache.clusters);
  }

  // Bundle path: queue or check.
  // Pass themesPayload so the bundle prompt can include customer_positions
  // alongside each label — the LLM clusters by landholder concern, not by
  // the rep-mechanic label text.
  console.log(`[customer-themes] clustering ${labels.length} labels via bundle queue (v2 marketing-grade)`);
  const r = queueOrFetchClusters(labels, labelKey, cache, themes);

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
      // NEW marketing-grade fields surfaced by the v2 clustering prompt
      marketing_angle: c.marketing_angle || null,
      headline_candidate: c.headline_candidate || null,
      supporting_quote: c.supporting_quote || null,
      // Existing fields
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

  // 1) Structured distillate JSONs (existing path)
  SOURCES.forEach(s => {
    const p = path.join(CACHE_DIR, s.file);
    const data = loadJson(p);
    if (!data) return;
    const extracted = extractDistillates(data, s);
    allDistillates.push(...extracted);
    sourcesLoaded.push({ file: s.file, label: s.label, surface: s.surface, distillates: extracted.length });
  });

  // 2) Evolving markdown sources — interviews, standups, manual theme notes.
  // Auto-discovered from the bus + inbox so the surface grows whenever Dylan
  // captures more material. Higher-weight sources (interviews especially)
  // carry "reflective" signal — the rep's own synthesis of what's resonating.
  const evolving = loadEvolvingSources();
  allDistillates.push(...evolving.distillates);
  evolving.sources_found.forEach(s => sourcesLoaded.push({
    file: s.file, label: s.surface, surface: s.surface,
    rep: s.rep, distillates: s.distillates,
  }));

  const rawThemes = groupByTheme(allDistillates);
  const themes = await clusterThemes(rawThemes, !!opts.force);

  // Surface the clustering status so the UI can tell the difference between
  // final marketing-grade clusters and the ungrouped fallback shown while a
  // re-cluster bundle is still being processed by subscription compute.
  const clusterCache = loadClusterCache();
  const clustering = {
    status: clusterCache && clusterCache.status === 'queued' ? 'queued' : 'completed',
    bundle_id: clusterCache ? (clusterCache.bundle_id || null) : null,
    clustered_at: clusterCache && clusterCache.status !== 'queued' ? (clusterCache.generated_at || null) : null,
  };

  // Compute high-level marketing signal
  const totalDistillates = allDistillates.length;
  const totalLanded = allDistillates.filter(d => d.landed_or_friction === 'landed').length;
  const totalFriction = allDistillates.filter(d => d.landed_or_friction === 'friction').length;
  const topLanded = themes.filter(t => t.landed_count > 0).slice(0, 10);
  const topFriction = themes.filter(t => t.friction_count >= 2).slice(0, 10);

  return {
    generated_at: new Date().toISOString(),
    clustering,
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
