/**
 * Pattern quality gate — archive patterns that stayed at confidence=low for
 * more than 30 days without a second system confirming them.
 *
 * The rule: a pattern is meant to be a hypothesis that gets corroborated.
 * If 30 days pass and only ONE system still surfaces it (single-system
 * observation), it's effectively noise. Move it out of the active pool
 * so the bus stays signal-rich. Archived patterns are preserved — moved
 * to patterns/archive/ with archived_at + archive_reason front-matter
 * so they can be promoted back if new evidence arrives.
 *
 * Default mode is dryRun=true; pass dryRun=false (or POST without ?dry_run=1
 * on the endpoint) to actually move files.
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');

const DAY = 24 * 60 * 60 * 1000;
const ARCHIVE_AGE_DAYS = 30;

function parseFrontMatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return { fm: {}, rest: content };
  const fm = {};
  let currentList = null;
  m[1].split('\n').forEach(line => {
    if (/^\s*-\s/.test(line) && currentList) {
      fm[currentList].push(line.replace(/^\s*-\s*/, '').trim());
      return;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) { currentList = null; return; }
    const [, key, raw] = kv;
    if (raw === '' || raw == null) { fm[key] = []; currentList = key; }
    else { fm[key] = raw.trim().replace(/^["']|["']$/g, ''); currentList = null; }
  });
  const rest = content.slice(m[0].length).replace(/^\s*\n/, '');
  return { fm, rest };
}

function serializeFrontMatter(fm) {
  let out = '';
  Object.keys(fm).forEach(key => {
    const val = fm[key];
    if (Array.isArray(val)) {
      out += `${key}:\n`;
      val.forEach(v => { out += `  - ${v}\n`; });
    } else {
      out += `${key}: ${val}\n`;
    }
  });
  return out;
}

function writeAtomic(filePath, content) {
  const tmp = filePath + '.tmp';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

function assessPattern(filePath) {
  const stat = fs.statSync(filePath);
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); }
  catch (e) { return { skip: true, reason: 'unreadable: ' + e.message }; }
  const { fm } = parseFrontMatter(content);
  const writtenMs = fm.written_at ? Date.parse(fm.written_at) : stat.mtimeMs;
  const ageDays = (Date.now() - writtenMs) / DAY;
  const confidence = String(fm.confidence || 'unknown').toLowerCase();
  const systems = Array.isArray(fm.surfaced_in_systems) ? fm.surfaced_in_systems : [];
  const crossConfirmed = systems.length >= 2;
  const shouldArchive = (
    confidence === 'low' &&
    !crossConfirmed &&
    ageDays > ARCHIVE_AGE_DAYS
  );
  return {
    filename: path.basename(filePath),
    title: fm.title || path.basename(filePath, '.md'),
    confidence,
    systems,
    cross_confirmed: crossConfirmed,
    age_days: Math.floor(ageDays),
    should_archive: shouldArchive,
    archive_reason: shouldArchive
      ? `confidence=low for ${Math.floor(ageDays)} days without a second system confirming`
      : null,
  };
}

function archivePattern(srcPath, archiveReason) {
  const filename = path.basename(srcPath);
  const archiveDir = path.join(path.dirname(srcPath), 'archive');
  const destPath = path.join(archiveDir, filename);
  fs.mkdirSync(archiveDir, { recursive: true });
  if (fs.existsSync(destPath)) {
    return { skipped: true, reason: 'archive entry already exists at ' + destPath };
  }
  const content = fs.readFileSync(srcPath, 'utf8');
  const { fm, rest } = parseFrontMatter(content);
  fm.archived_at = new Date().toISOString();
  fm.archive_reason = archiveReason;
  fm.status = 'archived';
  const archived = `---\n${serializeFrontMatter(fm)}---\n\n${rest}`;
  writeAtomic(destPath, archived);
  fs.unlinkSync(srcPath);
  return { from: srcPath, to: destPath };
}

function curate({ dryRun = true } = {}) {
  const patternsDir = path.join(BUS_ROOT, 'patterns');
  if (!fs.existsSync(patternsDir)) {
    return { error: 'patterns dir does not exist at ' + patternsDir };
  }
  const candidates = [];
  const archived = [];
  const errors = [];

  fs.readdirSync(patternsDir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md'))
    .forEach(d => {
      const full = path.join(patternsDir, d.name);
      try {
        const a = assessPattern(full);
        if (a.skip) { errors.push({ filename: d.name, reason: a.reason }); return; }
        if (a.should_archive) {
          candidates.push(a);
          if (!dryRun) {
            const r = archivePattern(full, a.archive_reason);
            archived.push({ ...a, ...r });
          }
        }
      } catch (e) {
        errors.push({ filename: d.name, reason: e.message });
      }
    });

  return {
    dry_run: !!dryRun,
    rule: `confidence=low AND age>${ARCHIVE_AGE_DAYS}d AND surfaced_in_systems<2`,
    patterns_dir: patternsDir,
    archive_dir: path.join(patternsDir, 'archive'),
    candidate_count: candidates.length,
    archived_count: archived.length,
    candidates,
    archived,
    errors,
  };
}

module.exports = { curate, assessPattern, ARCHIVE_AGE_DAYS };
