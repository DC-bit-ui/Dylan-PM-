/**
 * Farm-visit transcript matcher — confirmation gate for ambiguous
 * visit classifications.
 *
 * When a Hobbs meeting is "past + SCHEDULED" (the team didn't mark it
 * complete in HubSpot), we tentatively classify it as
 * "likely_happened" — but that's a guess. A stronger confirmation
 * signal: is there a transcript file for this visit on the bus?
 *
 * Source files:
 *   shared-growth-memory/persona-supplements/hobbs/
 *     confluence-farmvisit-YYYY-MM-DD-<slug>.md
 *
 * Each file has:
 *   - Header line with a customer label (or "Unknown Customer")
 *   - "Field rep: Hobbs ..."
 *   - "HubSpot match: ..." (sometimes "None found")
 *   - Full transcript body
 *
 * Match strategy:
 *   1. Date proximity: file date within ±3 days of the meeting date
 *   2. Name match: contact's first name OR last name appears in
 *      the file body (case-insensitive, word boundary)
 *   3. Slug match: file slug contains a contact-name token
 *
 * Confidence scoring:
 *   - HIGH:   date within ±2 days AND (name in body OR name in slug)
 *   - MEDIUM: name in body OR slug, date >2 days off
 *   - LOW:    date within ±2 days, no name match (regional cluster)
 *
 * The matcher is OPPORTUNISTIC — it elevates confidence for visits
 * where a confirmation signal exists. Absence of a match doesn't
 * downgrade — many transcripts simply aren't uploaded yet, or use
 * the "Unknown Customer" label.
 */

const fs = require('fs');
const path = require('path');

const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const TRANSCRIPT_DIR = path.join(BUS_ROOT, 'persona-supplements', 'hobbs');
const TRANSCRIPT_PATTERN = /^confluence-farmvisit-(\d{4}-\d{2}-\d{2})-(.+)\.md$/;
const CACHE_TTL_MS = 5 * 60 * 1000;
const DATE_FUZZY_DAYS = 3;
const DATE_HIGH_CONFIDENCE_DAYS = 2;

let _indexCache = null;

function loadIndex() {
  if (_indexCache && Date.now() - _indexCache.loaded_at < CACHE_TTL_MS) {
    return _indexCache.index;
  }
  const index = [];
  try {
    if (!fs.existsSync(TRANSCRIPT_DIR)) {
      _indexCache = { loaded_at: Date.now(), index: [] };
      return index;
    }
    const files = fs.readdirSync(TRANSCRIPT_DIR);
    files.forEach(fileName => {
      const m = fileName.match(TRANSCRIPT_PATTERN);
      if (!m) return;
      const dateIso = m[1];
      const slug = m[2];
      const fullPath = path.join(TRANSCRIPT_DIR, fileName);
      let body = '';
      try {
        body = fs.readFileSync(fullPath, 'utf8');
      } catch (_) { return; }
      // Extract header summary: first markdown heading + customer label
      const headerMatch = body.match(/^#\s*(.+)$/m);
      const header = headerMatch ? headerMatch[1].trim() : '';
      // Extract HubSpot match line if present
      const hsLine = (body.match(/\*\*HubSpot match:\*\*\s*(.+)$/m) || [])[1] || null;
      // Lowercase body for matching
      const bodyLower = body.toLowerCase();
      index.push({
        file_name: fileName,
        slug,
        slug_lower: slug.toLowerCase(),
        date_iso: dateIso,
        date_ms: Date.parse(dateIso + 'T00:00:00Z'),
        header,
        hubspot_match_line: hsLine,
        body_lower: bodyLower,
        body_snippet: body.slice(0, 800),
      });
    });
  } catch (e) {
    console.warn('[transcript-matcher] index load failed:', e.message);
  }
  _indexCache = { loaded_at: Date.now(), index };
  console.log(`[transcript-matcher] indexed ${index.length} farm-visit transcripts`);
  return index;
}

function tokensFromName(name) {
  if (!name) return [];
  // Lower-case, strip punctuation, split on whitespace + "&" + "and" etc.
  return name.toLowerCase()
    .replace(/[^\w\s&-]/g, ' ')
    .split(/\s+|&|\band\b/g)
    .map(t => t.trim())
    .filter(t => t.length >= 3);
}

function findMatch({ first_name, last_name, meeting_iso }) {
  const index = loadIndex();
  if (!index.length) return null;
  const meetingMs = Date.parse(meeting_iso);
  if (!meetingMs || isNaN(meetingMs)) return null;
  const fnTokens = tokensFromName(first_name);
  const lnTokens = tokensFromName(last_name);
  const allTokens = Array.from(new Set([...fnTokens, ...lnTokens]));
  if (!allTokens.length) return null;

  const candidates = [];
  for (const t of index) {
    const dayDelta = Math.abs((meetingMs - t.date_ms) / (24 * 60 * 60 * 1000));
    if (dayDelta > DATE_FUZZY_DAYS) continue;

    // Match name tokens against body + slug
    const inBody = allTokens.some(tok => {
      const re = new RegExp(`\\b${tok}\\b`, 'i');
      return re.test(t.body_lower);
    });
    const inSlug = allTokens.some(tok => t.slug_lower.includes(tok));
    // The bulk-dump "Unknown Customer" transcripts have generic slugs
    // ("merino-mixed-farm", "tumut-angus-operation"). They might mention
    // the customer name in the body even if the slug doesn't.

    let confidence;
    let reasons = [];
    if ((inBody || inSlug) && dayDelta <= DATE_HIGH_CONFIDENCE_DAYS) {
      confidence = 'high';
      if (inBody) reasons.push('name in transcript body');
      if (inSlug) reasons.push('name in file slug');
      reasons.push(`date within ${Math.round(dayDelta)}d`);
    } else if (inBody || inSlug) {
      confidence = 'medium';
      if (inBody) reasons.push('name in transcript body');
      if (inSlug) reasons.push('name in file slug');
      reasons.push(`date ${Math.round(dayDelta)}d off`);
    } else if (dayDelta <= DATE_HIGH_CONFIDENCE_DAYS) {
      confidence = 'low';
      reasons.push(`date within ${Math.round(dayDelta)}d, no name match (regional cluster?)`);
    } else {
      continue; // no signal
    }

    candidates.push({
      file_name: t.file_name,
      slug: t.slug,
      date_iso: t.date_iso,
      header: t.header,
      day_delta: Math.round(dayDelta),
      confidence,
      reasons,
      hubspot_match_line: t.hubspot_match_line,
    });
  }

  if (!candidates.length) return null;
  // Best match = highest confidence + closest date
  const rank = { high: 3, medium: 2, low: 1 };
  candidates.sort((a, b) => {
    const r = rank[b.confidence] - rank[a.confidence];
    if (r !== 0) return r;
    return a.day_delta - b.day_delta;
  });
  return candidates[0];
}

module.exports = { findMatch, loadIndex };
