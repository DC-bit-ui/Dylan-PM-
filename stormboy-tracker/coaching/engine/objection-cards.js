/**
 * Objection cards — parses Hobbs's handbook + AgriProve guide into one
 * structured card per objection. Serves them to:
 *   - BRAIN tab (browseable card grid)
 *   - ASK tab (compact context, replaces the raw markdown dump)
 *
 * Each card has: objection (customer's verbatim), subtext (what they're
 * really saying), reframe (Hobbs's verbatim response), closing_line (his
 * punchline), category tags, and source attribution.
 *
 * Cached in memory; re-parses on every request (cheap — sub-ms).
 */

const fs = require('fs');
const path = require('path');

const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const OBJECTION_PLAYS_DIR = path.join(BUS_ROOT, 'team-brain', 'objection-plays');

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; }
}

// Normalise smart quotes / em-dashes for cleaner display + matching
function clean(s) {
  if (!s) return '';
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/—/g, '—')
    .replace(/–/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip surrounding quotes from a verbatim if present
function unquote(s) {
  if (!s) return '';
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

// Auto-tag by keyword match. Tags help the filter + ASK retrieval.
const TAG_KEYWORDS = [
  { tag: 'commitment',  match: /\b(25.years?|twenty.five.years?|locked.in|lock.in|long|commit)\b/i },
  { tag: 'trust',       match: /\b(trust|government|scam|bullshit|skeptic)\b/i },
  { tag: 'pricing',     match: /\b(25.percent|twenty.five.percent|fee|cost|expensive|too.much)\b/i },
  { tag: 'sampling',    match: /\b(baseline.sampling|sampling.expensive|soil.sampling)\b/i },
  { tag: 'autonomy',    match: /\b(country|telling.me|how.to.run|control|my.land|my.farm)\b/i },
  { tag: 'risk',        match: /\b(markets|climate|risk|uncertain|hedge|bag)\b/i },
  { tag: 'stalling',    match: /\b(time.to.think|solicitor|come.back|maybe.later|think.about)\b/i },
  { tag: 'eligibility', match: /\b(already.high|carbon.levels|room.to.improve|no.upside|baseline)\b/i },
  { tag: 'measurement', match: /\b(credits|measurement|audit|verification|numbers)\b/i },
  { tag: 'deferred',    match: /\b(defer|deferral|lower.rate|future.credits)\b/i },
];

function autoTags(text) {
  const tags = new Set();
  TAG_KEYWORDS.forEach(({ tag, match }) => { if (match.test(text)) tags.add(tag); });
  return Array.from(tags);
}

/**
 * Parse Hobbs's handbook. Handles two formats within the same file:
 *   Format A (simple): OBJECTION N: "...". Reframe:"..."
 *   Format B (rich):   OBJECTION N: "..." / What they are actually saying: / Narrative Reframe: / Closing Line:
 */
function parseHobbsHandbook(md) {
  const cards = [];
  // Split on OBJECTION N: or Objection N: at the start of a line
  const blocks = md.split(/(?=^\s*Objection\s+\d+\s*:)/im).filter(b => /Objection\s+\d+\s*:/i.test(b));

  for (const block of blocks) {
    const num = (block.match(/Objection\s+(\d+)\s*:/i) || [])[1];
    if (!num) continue;

    // Objection statement = text up to first newline or until next field
    const objMatch = block.match(/Objection\s+\d+\s*:\s*([^\n]+)/i);
    let objection = objMatch ? clean(objMatch[1]) : '';
    objection = unquote(objection);

    const subtextMatch = block.match(/What they (?:are |')?actually saying:\s*([\s\S]*?)(?=Narrative Reframe:|Reframe:|Closing Line:|Objection\s+\d+:|$)/i);
    const reframeMatch = block.match(/(?:Narrative Reframe|Reframe):\s*([\s\S]*?)(?=Closing Line:|Objection\s+\d+:|What they|$)/i);
    const closingMatch = block.match(/Closing Line:\s*([\s\S]*?)(?=Objection\s+\d+:|$)/i);

    const subtext = subtextMatch ? clean(unquote(subtextMatch[1])) : null;
    const reframe = reframeMatch ? clean(unquote(reframeMatch[1])) : '';
    const closing = closingMatch ? clean(unquote(closingMatch[1])) : null;

    if (!objection || !reframe) continue;

    const tags = autoTags(objection + ' ' + reframe);

    cards.push({
      id: 'hobbs-obj-' + num + '-' + slugify(objection),
      number: Number(num),
      objection,
      subtext,
      reframe,
      closing_line: closing,
      tags,
      source: 'Hobbs Farmer Objection Handbook (HM 2025-11-26)',
      source_file: 'hobbs-farmer-objection-handbook.md',
    });
  }
  return cards;
}

/**
 * Parse the AgriProve Objection Handling Guide via a line-by-line state
 * machine. Format is consistent:
 *
 *   CATEGORY HEADER (all-caps + OBJECTIONS)
 *   "<objection>"
 *
 *   What they mean: <subtext, may wrap multiple lines>
 *
 *   Reframe: <multi-line reframe>
 *
 *   Closing line: "<closing>"
 *
 * Each parsed entry becomes a first-class card alongside Hobbs's handbook —
 * different source, different framing, often covering an objection Hobbs
 * doesn't (e.g., "What happens if AgriProve folds").
 */
function parseAgriProveGuide(md) {
  const cards = [];
  let category = 'GENERAL';
  let state = 'idle';
  let current = null;

  function flush() {
    if (current && current.objection && current.reframe) {
      const objection = clean(current.objection);
      cards.push({
        id: 'ap-' + slugify(objection),
        number: null,
        objection,
        subtext: clean(current.subtext) || null,
        reframe: clean(current.reframe),
        closing_line: current.closing ? clean(unquote(current.closing)) : null,
        tags: autoTags(objection + ' ' + current.reframe),
        source: 'AgriProve Objection Handling Guide · ' + category,
        source_file: 'agriprove-objection-handling-guide.md',
      });
    }
    current = null;
    state = 'idle';
  }

  const lines = md.split('\n');
  for (const raw of lines) {
    const line = raw.trim();

    // Category header (e.g. "TRUST & CREDIBILITY OBJECTIONS" or "COMMITMENT & LOCK-IN OBJECTIONS")
    const catMatch = line.match(/^([A-Z][A-Z &\-]{3,}OBJECTIONS)$/);
    if (catMatch) {
      flush();
      category = catMatch[1];
      continue;
    }

    // Quoted objection at the start of a block
    const quoteMatch = line.match(/^"([^"]{5,200})"\s*\.?$/);
    if (quoteMatch) {
      flush();
      current = { objection: quoteMatch[1], subtext: '', reframe: '', closing: null };
      state = 'objection';
      continue;
    }

    if (line.startsWith('What they mean:')) {
      if (!current) current = { objection: '', subtext: '', reframe: '', closing: null };
      current.subtext = line.slice('What they mean:'.length).trim();
      state = 'subtext';
      continue;
    }
    if (line.startsWith('Reframe:')) {
      if (!current) continue;
      current.reframe = line.slice('Reframe:'.length).trim();
      state = 'reframe';
      continue;
    }
    if (line.startsWith('Closing line:')) {
      if (!current) continue;
      current.closing = line.slice('Closing line:'.length).trim();
      state = 'closing';
      continue;
    }
    if (!line) continue;

    // Continuation of current section
    if (state === 'subtext') current.subtext += ' ' + line;
    else if (state === 'reframe') current.reframe += ' ' + line;
    else if (state === 'closing') current.closing += ' ' + line;
  }
  flush();
  return cards;
}

let _cache = null;
function buildCards() {
  if (_cache) return _cache;

  const hobbsMd = readFile(path.join(OBJECTION_PLAYS_DIR, 'hobbs-farmer-objection-handbook.md'));
  const guideMd = readFile(path.join(OBJECTION_PLAYS_DIR, 'agriprove-objection-handling-guide.md'));

  const hobbsCards = parseHobbsHandbook(hobbsMd).map(c => ({
    ...c,
    source_author: 'Hobbs',
    source_priority: 1, // surfaces first in UI; verbatim from the closer
  }));
  const guideCards = parseAgriProveGuide(guideMd).map(c => ({
    ...c,
    source_author: 'AgriProve team',
    source_priority: 2, // surfaces below Hobbs's cards
  }));

  // Cross-link by tag: for each Hobbs card, find guide cards with overlapping tags
  // (and vice-versa) so a rep reading one sees the other.
  function tagLinks(card, others) {
    return others.filter(o => o.id !== card.id && o.tags.some(t => card.tags.includes(t)))
                 .slice(0, 3)
                 .map(o => ({ id: o.id, objection: o.objection, source_author: o.source_author }));
  }
  hobbsCards.forEach(c => { c.cross_references = tagLinks(c, guideCards); });
  guideCards.forEach(c => { c.cross_references = tagLinks(c, hobbsCards); });

  const cards = [...hobbsCards, ...guideCards];

  _cache = {
    version: 'objection-cards-1.1',
    generated_at: new Date().toISOString(),
    card_count: cards.length,
    by_source: {
      hobbs: hobbsCards.length,
      agriprove_guide: guideCards.length,
    },
    cards,
  };
  return _cache;
}

// For ASK: a compact text representation of all cards (cheaper than raw markdown).
function buildCompactBrainText() {
  const result = buildCards();
  const blocks = result.cards.map(c => {
    const sub = c.subtext ? `\n  Subtext: ${c.subtext}` : '';
    const close = c.closing_line ? `\n  Closing: "${c.closing_line}"` : '';
    return `### Objection ${c.number}: "${c.objection}"
  Tags: ${c.tags.join(', ')}${sub}
  Hobbs reframe: "${c.reframe}"${close}`;
  });
  return `OBJECTION CARDS (parsed from Hobbs's handbook + AgriProve guide):\n\n${blocks.join('\n\n')}`;
}

function refresh() {
  _cache = null;
  return buildCards();
}

module.exports = { buildCards, buildCompactBrainText, refresh };
