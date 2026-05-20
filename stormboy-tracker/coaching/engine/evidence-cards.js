/**
 * Evidence cards — Section 4 of the STATS redesign.
 *
 * Reads pattern files from shared-growth-memory/patterns/, extracts the
 * YAML-ish front-matter, and surfaces each as a tactical evidence card.
 * Each card cites its source file so the team can trace the claim back.
 *
 * Cards are intentionally lightweight — title + category + a one-line
 * stat from the first evidence bullet + source. The full pattern lives
 * in the file; the card is the "what works" headline.
 *
 * No HubSpot calls — pure filesystem read. 5-min in-memory cache for
 * the rendered list (file changes on disk are picked up promptly).
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = process.env.BUS_PATH
  ? path.join(process.env.BUS_PATH, 'patterns')
  : path.join('C:', 'Dylan PM', 'shared-growth-memory', 'patterns');
const CACHE_TTL_MS = 5 * 60 * 1000;
let _cached = null;

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { meta: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end < 0) return { meta: {}, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4).trim();
  // Minimal YAML parser — flat keys + simple list of strings (indented "- foo")
  const meta = {};
  let currentKey = null;
  raw.split(/\r?\n/).forEach(line => {
    if (/^\s*-\s+/.test(line) && currentKey) {
      const item = line.replace(/^\s*-\s+/, '').trim();
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(item);
    } else {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
      if (m) {
        currentKey = m[1];
        const val = m[2].trim();
        meta[currentKey] = val === '' ? [] : val;
      }
    }
  });
  return { meta, body };
}

// Pull a one-line headline stat from the evidence array. Prefer bullets
// with numbers/percentages so the card surfaces something concrete.
function pickHeadlineStat(meta) {
  if (!Array.isArray(meta.evidence) || !meta.evidence.length) return null;
  const numeric = meta.evidence.find(e => /\d+(\.\d+)?\s*[%×x]|\d+\s+(days?|deals?|won|lost)/i.test(e));
  return (numeric || meta.evidence[0]).replace(/\s+/g, ' ').trim();
}

// Heuristic accent colour per category — keeps it bus-driven, not
// hard-coded per file. Stats up-and-to-the-right get green; framings
// get neutral; risks get warm.
function pickAccent(meta) {
  const cat = (meta.category || '').toLowerCase();
  if (cat.includes('strategic_finding')) return { accent: '#2d6a4f', tone: 'good' };
  if (cat.includes('tactical_framing')) return { accent: '#5a6878', tone: 'flat' };
  if (cat.includes('tactical_play')) return { accent: '#2d6a4f', tone: 'good' };
  if (cat.includes('risk') || cat.includes('warning')) return { accent: '#8a3024', tone: 'bad' };
  return { accent: '#b6b09a', tone: 'flat' };
}

function readPatternFile(file) {
  const full = path.join(PATTERNS_DIR, file);
  const text = fs.readFileSync(full, 'utf8');
  const { meta, body } = parseFrontmatter(text);
  const headline = pickHeadlineStat(meta);
  const accent = pickAccent(meta);
  return {
    source_file: file,
    written_at: meta.written_at || null,
    title: meta.title || file,
    category: meta.category || 'pattern',
    confidence: meta.confidence || 'unknown',
    headline_evidence: headline,
    applicability_count: Array.isArray(meta.applicability) ? meta.applicability.length : 0,
    accent: accent.accent,
    tone: accent.tone,
    body_preview: body.split(/\r?\n/).slice(0, 3).join(' ').slice(0, 200),
  };
}

function run() {
  if (_cached && Date.now() - _cached.generated_at < CACHE_TTL_MS) {
    return { ..._cached.result, from_cache: true };
  }
  try {
    if (!fs.existsSync(PATTERNS_DIR)) {
      return { generated_at: new Date().toISOString(), cards: [], empty: true,
               reason: 'patterns/ directory not found in bus' };
    }
    const files = fs.readdirSync(PATTERNS_DIR).filter(f => f.endsWith('.md'));
    const cards = [];
    for (const f of files) {
      try { cards.push(readPatternFile(f)); }
      catch (e) { console.error('[evidence-cards] failed to parse', f, e.message); }
    }
    // Newest first by written_at, falling back to filename
    cards.sort((a, b) => {
      const ad = a.written_at || a.source_file;
      const bd = b.written_at || b.source_file;
      return bd.localeCompare(ad);
    });
    const result = {
      generated_at: new Date().toISOString(),
      cards,
      patterns_dir: PATTERNS_DIR,
      from_cache: false,
    };
    _cached = { generated_at: Date.now(), result };
    return result;
  } catch (e) {
    console.error('[evidence-cards] run failed:', e.message);
    return { generated_at: new Date().toISOString(), cards: [], error: e.message };
  }
}

module.exports = { run };
