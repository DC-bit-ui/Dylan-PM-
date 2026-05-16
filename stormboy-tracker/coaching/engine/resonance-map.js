/**
 * Resonance map — aggregate verbatim language banks + objection-handling
 * phrases from every active persona profile. Returns structured per-category
 * data attributed to each rep so marketing can adopt phrases that already
 * resonate in 1:1 conversations.
 *
 * Reads from `shared-growth-memory/team-brain/profiles/<slug>.md` (the bus
 * canonical) — same files the BRAIN tab serves. No re-fetching of HubSpot or
 * LLM calls; this is structured-text extraction from already-synthesised
 * profiles.
 */

const fs = require('fs');
const path = require('path');

const FALLBACK_BUS = path.join(__dirname, '..', '..', '..', 'shared-growth-memory');
const BUS_ROOT = process.env.BUS_PATH || FALLBACK_BUS;
const PROFILES_DIR = path.join(BUS_ROOT, 'team-brain', 'profiles');
// Coaching mirror — used as a fallback if bus version is missing.
const COACHING_ROOT = path.join(__dirname, '..');

const SLUGS = [
  { slug: 'bill-hyem', name: 'Bill Hyem', file: 'bill-hyem.md', status: 'historical' },
  { slug: 'ben',       name: 'Ben Payne', file: 'ben.md',       status: 'active' },
  { slug: 'claudia',   name: 'Claudia Bryant', file: 'claudia.md', status: 'active' },
  { slug: 'will',      name: 'Will Donovan', file: 'will.md',   status: 'active' },
  { slug: 'hobbs',     name: 'Hobbs',     file: 'hobbs.md',     status: 'active' },
];

// Category headings the persona-builder writes (lowercase + de-snaked). Order
// = display order in the resonance map.
const CATEGORIES = [
  { key: 'greetings',         display: 'Greetings + opens',     icon: '👋' },
  { key: 'engagement phrases', display: 'Engagement phrases',   icon: '🎯' },
  { key: 'value framings',    display: 'Value framings',        icon: '💎' },
  { key: 'soft pushes',       display: 'Soft pushes / progressions', icon: '➜' },
  { key: 'closes',            display: 'Closes',                icon: '✓' },
  { key: 'internal handoffs', display: 'Internal handoffs',     icon: '⇄' },
];

function loadProfile(slug, file) {
  const busPath = path.join(PROFILES_DIR, file);
  const coachingPath = path.join(COACHING_ROOT, file.replace(/\.md$/, '-profile.md'));
  if (fs.existsSync(busPath)) return fs.readFileSync(busPath, 'utf8');
  if (fs.existsSync(coachingPath)) return fs.readFileSync(coachingPath, 'utf8');
  return null;
}

// Find the "verbatim language bank" section, then parse its sub-headings.
function extractLanguageBank(md) {
  if (!md) return {};
  // Match "## Verbatim language bank" through next h2
  const bankMatch = md.match(/##\s+Verbatim language bank\s*\n([\s\S]*?)(?=\n##\s|\n---\s*\n|$)/i);
  if (!bankMatch) return {};
  const body = bankMatch[1];
  const out = {};
  // Sub-headings are ### Category, then bullet list of "- "phrase""
  const sectionRe = /###\s+([^\n]+)\n([\s\S]*?)(?=\n###\s|$)/g;
  let m;
  while ((m = sectionRe.exec(body)) !== null) {
    const cat = m[1].trim().toLowerCase().replace(/_/g, ' ');
    const lines = m[2].split('\n');
    const phrases = [];
    for (const line of lines) {
      const bullet = line.match(/^\s*[-*]\s+"?(.+?)"?\s*$/);
      if (bullet) phrases.push(bullet[1].replace(/^"|"$/g, '').trim());
    }
    if (phrases.length) out[cat] = phrases;
  }
  return out;
}

// Pull the "objection_handling" table — captures the team's responses to
// objections that come back from real customers.
function extractObjectionRows(md) {
  if (!md) return [];
  const sec = md.match(/##\s+Objection handling[\s\S]*?\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!sec) return [];
  const body = sec[1];
  const rows = [];
  // Table rows after the header separator
  const tableMatch = body.match(/\|[\s\S]*?\|\n\|[-\s|]+\|\n([\s\S]*?)(?=\n\n|\n\*\*|\n##|$)/);
  if (!tableMatch) return [];
  const trs = tableMatch[1].split('\n').filter(l => l.startsWith('|'));
  for (const tr of trs) {
    const cells = tr.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length >= 3) {
      rows.push({
        objection: cells[0],
        response: cells[1],
        outcome: cells[2] || '',
        confidence: cells[3] || '',
      });
    }
  }
  return rows;
}

function buildResonanceMap() {
  const byCategory = {};
  CATEGORIES.forEach(c => { byCategory[c.key] = []; });
  const objections = [];
  const perRep = {};
  const errors = [];

  for (const p of SLUGS) {
    const md = loadProfile(p.slug, p.file);
    if (!md) {
      errors.push(`${p.slug}: profile not on disk`);
      continue;
    }
    perRep[p.slug] = { name: p.name, status: p.status, phrase_count: 0, objection_count: 0 };

    // Language bank
    const bank = extractLanguageBank(md);
    for (const cat of CATEGORIES) {
      const phrases = bank[cat.key] || [];
      phrases.forEach(phrase => {
        byCategory[cat.key].push({ phrase, rep: p.name, slug: p.slug, status: p.status });
        perRep[p.slug].phrase_count++;
      });
    }

    // Objection handling
    const rows = extractObjectionRows(md);
    rows.forEach(r => {
      objections.push({ ...r, rep: p.name, slug: p.slug });
      perRep[p.slug].objection_count++;
    });
  }

  // Stats per category
  const stats = CATEGORIES.map(c => ({
    key: c.key,
    display: c.display,
    icon: c.icon,
    phrase_count: byCategory[c.key].length,
    unique_reps: new Set(byCategory[c.key].map(p => p.slug)).size,
  }));

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_phrases: Object.values(byCategory).reduce((s, a) => s + a.length, 0),
      total_objections: objections.length,
      reps_aggregated: Object.keys(perRep).length,
    },
    categories: CATEGORIES.map(c => ({ ...c, phrases: byCategory[c.key] })),
    objections,
    per_rep: perRep,
    stats,
    errors,
  };
}

module.exports = { run: buildResonanceMap };
