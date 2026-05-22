/**
 * Standup-summary engine — surfaces the latest Storm Boy standup
 * transcripts (Mon/Fri cadence) as a STATS section. Dylan flagged
 * standup reviews as a high-value insight surface, and the team
 * already runs Mon/Fri standups whose Granola transcripts land on
 * the bus.
 *
 * SOURCE FILES (any of):
 *   shared-growth-memory/persona-supplements/<rep>/
 *     granola-*standup*.md
 *     granola-meeting-*-stormboy-standup*.md
 *   (Same standup may appear in multiple rep folders — dedup by
 *    extracted date + a content-prefix hash.)
 *
 * Each file has a relatively consistent shape:
 *   # Title (often includes the date)
 *   **Date:** YYYY-MM-DD … | **Participants:** …
 *   ## Summary | ## Updates relevant to <rep> | ## Commitments |
 *   ## Strategic decisions | ## Other
 *
 * Engine extracts:
 *   - meeting_date (from H1 or **Date:** line or filename)
 *   - title
 *   - section bullets keyed by section heading
 *   - participant names (best effort)
 *   - "diff" highlights when comparing this standup to the previous
 *
 * Returns top N standups (default 3), most recent first.
 *
 * 1-hour disk cache. ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');

const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const PERSONA_SUPPLEMENTS_DIR = path.join(BUS_ROOT, 'persona-supplements');
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'standup-summary.json');
const CACHE_TTL_MS = 60 * 60 * 1000;

// Pattern: any standup-flavoured granola file
const FILE_PATTERN = /granola.*standup|stormboy.*standup/i;

function parseFrontmatter(text) {
  // Extract title (first H1), date line, participants line, sections
  const lines = text.split(/\r?\n/);
  let title = null;
  let date = null;
  let participants = null;
  let meetingId = null;

  for (const line of lines.slice(0, 30)) {
    if (!title) {
      const m = line.match(/^#\s+(.+?)\s*$/);
      if (m) { title = m[1].trim(); continue; }
    }
    // **Date:** 2026-05-15 …
    const dm = line.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/i);
    if (dm) date = dm[1];
    // **Participants:** Dylan, Hobbs, Ben, …
    const pm = line.match(/\*\*Participants:\*\*\s*(.+?)\s*(?:\||$)/i);
    if (pm) participants = pm[1].trim();
    // **Meeting ID:** … or meeting id `…`
    const mm = line.match(/(?:meeting[\s_-]*id[\s:`]*)\s*([a-f0-9-]{6,})/i);
    if (mm && !meetingId) meetingId = mm[1].slice(0, 36);
  }
  // Sections: from each `## Heading` to next `##` or EOF
  const sections = {};
  const sectionRe = /^##\s+(.+?)\s*$/gm;
  const matches = [];
  let m;
  while ((m = sectionRe.exec(text)) !== null) {
    matches.push({ name: m[1].trim(), start: m.index + m[0].length });
  }
  matches.forEach((sec, i) => {
    const end = i + 1 < matches.length ? matches[i + 1].start - matches[i + 1].name.length - 4 : text.length;
    const body = text.slice(sec.start, end).trim();
    // Extract bullets (lines starting with - or *)
    const bullets = body.split(/\r?\n/)
      .map(l => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter(l => l && !/^[A-Z][\w ]+:?$/.test(l))
      .filter(l => l.length > 5);
    sections[sec.name] = {
      raw: body,
      bullets,
    };
  });

  return { title, date, participants, meeting_id: meetingId, sections };
}

function extractDateFromFilename(fileName) {
  const m = fileName.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function loadAllStandups() {
  const out = [];
  if (!fs.existsSync(PERSONA_SUPPLEMENTS_DIR)) return out;
  const reps = fs.readdirSync(PERSONA_SUPPLEMENTS_DIR)
    .filter(d => fs.statSync(path.join(PERSONA_SUPPLEMENTS_DIR, d)).isDirectory());
  for (const rep of reps) {
    const repDir = path.join(PERSONA_SUPPLEMENTS_DIR, rep);
    let files;
    try { files = fs.readdirSync(repDir); } catch (_) { continue; }
    for (const fileName of files) {
      if (!FILE_PATTERN.test(fileName)) continue;
      if (!fileName.endsWith('.md')) continue;
      const fullPath = path.join(repDir, fileName);
      let body;
      try { body = fs.readFileSync(fullPath, 'utf8'); } catch (_) { continue; }
      const fm = parseFrontmatter(body);
      const date = fm.date || extractDateFromFilename(fileName);
      if (!date) continue;
      out.push({
        rep_folder: rep,
        file_name: fileName,
        full_path: fullPath,
        meeting_date: date,
        title: fm.title || fileName,
        participants: fm.participants,
        meeting_id: fm.meeting_id,
        sections: fm.sections,
        body_length: body.length,
        // Hash a prefix of the body so two files referring to the same meeting
        // can be deduped even if filenames differ
        dedup_key: date + '|' + (fm.meeting_id || (body.slice(0, 200).replace(/\s+/g, ''))),
      });
    }
  }
  return out;
}

function dedupAndRank(all, limit = 5) {
  // Two-phase dedup:
  //   1. dedup_key (date + meeting_id or body-prefix) — catches the
  //      same meeting recorded in multiple rep folders
  //   2. by meeting_date — when same date has multiple files (e.g.,
  //      a rich Granola summary + a "transcript not pulled" stub),
  //      keep the longest body which is the substantive one
  const byKey = {};
  for (const s of all) {
    const k = s.dedup_key;
    if (!byKey[k] || s.body_length > byKey[k].body_length) byKey[k] = s;
  }
  const byDate = {};
  Object.values(byKey).forEach(s => {
    const cur = byDate[s.meeting_date];
    if (!cur || s.body_length > cur.body_length) byDate[s.meeting_date] = s;
  });
  const list = Object.values(byDate)
    .sort((a, b) => b.meeting_date.localeCompare(a.meeting_date));
  return list.slice(0, limit);
}

// Identify the cadence weekday for a date (Mon/Tue/.../Sun)
function weekdayOf(iso) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(iso + 'T00:00:00Z');
  return days[d.getUTCDay()];
}

// Build a lightweight diff: what's new in standup A vs standup B?
// Returns bullets from A whose normalized form isn't in B.
function diffBullets(standupA, standupB) {
  if (!standupB) return null;
  const normalize = s => s.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const prevBullets = new Set();
  Object.values(standupB.sections || {}).forEach(sec => {
    sec.bullets.forEach(b => prevBullets.add(normalize(b).slice(0, 100)));
  });
  const newBullets = [];
  Object.entries(standupA.sections || {}).forEach(([secName, sec]) => {
    sec.bullets.forEach(b => {
      const n = normalize(b).slice(0, 100);
      if (!prevBullets.has(n)) newBullets.push({ section: secName, bullet: b });
    });
  });
  return newBullets;
}

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const c = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (Date.now() - Date.parse(c.generated_at) > CACHE_TTL_MS) return null;
    return c;
  } catch (_) { return null; }
}
function writeCache(obj) {
  try {
    const tmp = CACHE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, CACHE_PATH);
  } catch (e) { console.error('[standup-summary] cache write failed:', e.message); }
}

async function run({ limit = 3, force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }

  const all = loadAllStandups();
  const ranked = dedupAndRank(all, limit + 1); // +1 for diff baseline
  console.log(`[standup-summary] indexed ${all.length} standup files; ${ranked.length} unique`);

  // Top `limit` for display; the (limit+1)th is used as diff baseline
  const display = ranked.slice(0, limit);
  const prevForDiff = ranked[limit] || null;
  display.forEach((s, i) => {
    const next = display[i + 1] || prevForDiff;
    s.diff_vs_previous = diffBullets(s, next);
    s.weekday = weekdayOf(s.meeting_date);
  });

  // Headline narrative
  const latest = display[0];
  let headline;
  if (!latest) {
    headline = 'No standup transcripts on the bus yet.';
  } else {
    const ageD = Math.floor((Date.now() - Date.parse(latest.meeting_date + 'T00:00:00Z')) / (24 * 60 * 60 * 1000));
    if (ageD === 0) {
      headline = `Latest standup is from today (${latest.meeting_date}, ${latest.weekday}). ${latest.diff_vs_previous ? latest.diff_vs_previous.length + ' new bullet(s) vs previous standup.' : ''}`;
    } else if (ageD <= 3) {
      headline = `Latest standup is ${ageD} day${ageD === 1 ? '' : 's'} old (${latest.meeting_date}, ${latest.weekday}). Surfacing key points and what's new since prior.`;
    } else {
      headline = `Latest standup transcript is ${ageD} days old — may be stale. Apex/Granola sync delay or no standup recorded recently.`;
    }
  }

  // Build a flat "key updates" timeline across the display set
  const keyUpdates = [];
  display.forEach(s => {
    // Headline section names we surface in the timeline
    const priorityOrder = ['Summary', 'Strategic decisions', 'Updates', 'Commitments', 'Other'];
    const flat = [];
    Object.entries(s.sections || {}).forEach(([name, sec]) => {
      const priority = priorityOrder.findIndex(p => name.toLowerCase().includes(p.toLowerCase()));
      flat.push({ section: name, priority: priority === -1 ? 99 : priority, bullets: sec.bullets });
    });
    flat.sort((a, b) => a.priority - b.priority);
    keyUpdates.push({
      meeting_date: s.meeting_date,
      weekday: s.weekday,
      title: s.title,
      participants: s.participants,
      sections: flat,
      diff_vs_previous: s.diff_vs_previous,
      file_name: s.file_name,
      rep_folder: s.rep_folder,
    });
  });

  const result = {
    generated_at: new Date().toISOString(),
    headline,
    total_standups_indexed: all.length,
    display_count: display.length,
    standups: keyUpdates,
    caveats: [
      'Source: any markdown file under persona-supplements/<rep>/ matching the standup pattern (granola-*standup*.md / *stormboy-standup*.md).',
      'Deduplicated across rep folders by meeting date + meeting_id (same standup may land in multiple rep folders).',
      'Sections parsed by ## headings; bullets extracted from leading - or * markers. Non-bulleted prose is omitted from the structured view.',
      '"What\'s new" diff compares each standup\'s bullets against the next-most-recent one — surface-level text matching, not deep semantic comparison.',
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
