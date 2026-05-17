/**
 * Weekly system retro — "is the system itself learning this week?"
 *
 * Reads the same bus sources as system-health, filters to the last 7 days,
 * and synthesises a human-readable markdown summary. The point: surface
 * it in Friday standup so the team can see the system's own learning
 * curve, not just rep activity.
 *
 * Writes to <bus>/system-retros/YYYY-WW.md when called with write=true.
 * Idempotent — same week's file gets overwritten with the latest snapshot.
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');
const bus = require('./shared-bus');

const DAY = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;

function safeReadDir(p) {
  try { return fs.readdirSync(p, { withFileTypes: true }); }
  catch (_) { return []; }
}

function parseFm(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  let currentList = null;
  m[1].split('\n').forEach(line => {
    if (/^\s*-\s/.test(line) && currentList) { out[currentList].push(line.replace(/^\s*-\s*/, '').trim()); return; }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) { currentList = null; return; }
    const [, key, raw] = kv;
    if (raw === '' || raw == null) { out[key] = []; currentList = key; }
    else { out[key] = raw.trim().replace(/^["']|["']$/g, ''); currentList = null; }
  });
  return out;
}

function isoWeek(d) {
  const dt = new Date(d);
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((dt - yearStart) / DAY) + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function gather(sinceMs) {
  // Supplements written this week, grouped by source.
  const supplements = { count: 0, by_source: {}, by_entity: { contact: 0, deal: 0, persona: 0 } };
  ['contact-supplements', 'deal-supplements', 'persona-supplements'].forEach(kind => {
    const kindKey = kind.split('-')[0];
    safeReadDir(path.join(BUS_ROOT, kind)).filter(d => d.isDirectory()).forEach(entityDir => {
      const entityPath = path.join(BUS_ROOT, kind, entityDir.name);
      safeReadDir(entityPath).filter(f => f.isFile()).forEach(f => {
        try {
          const stat = fs.statSync(path.join(entityPath, f.name));
          if (stat.mtimeMs >= sinceMs) {
            supplements.count++;
            supplements.by_entity[kindKey]++;
            const src = classify(f.name);
            supplements.by_source[src] = (supplements.by_source[src] || 0) + 1;
          }
        } catch (_) {}
      });
    });
  });

  // Patterns written or promoted this week.
  const patterns = { added: [], promoted: [], cross_confirmed_new: 0 };
  safeReadDir(path.join(BUS_ROOT, 'patterns')).filter(f => f.isFile() && f.name.endsWith('.md')).forEach(f => {
    try {
      const full = path.join(BUS_ROOT, 'patterns', f.name);
      const stat = fs.statSync(full);
      const content = fs.readFileSync(full, 'utf8');
      const fm = parseFm(content);
      const written = fm.written_at ? Date.parse(fm.written_at) : stat.mtimeMs;
      if (written >= sinceMs) {
        patterns.added.push({
          filename: f.name,
          title: fm.title || f.name,
          confidence: fm.confidence,
          systems: Array.isArray(fm.surfaced_in_systems) ? fm.surfaced_in_systems : [],
        });
      }
      if (stat.mtimeMs >= sinceMs && written < sinceMs) {
        patterns.promoted.push({
          filename: f.name,
          title: fm.title || f.name,
          confidence: fm.confidence,
        });
      }
      const systems = Array.isArray(fm.surfaced_in_systems) ? fm.surfaced_in_systems : [];
      if (systems.length >= 2 && stat.mtimeMs >= sinceMs) patterns.cross_confirmed_new++;
    } catch (_) {}
  });

  // Probes — created this week + closed this week.
  const allProbes = bus.listAllProbes();
  const createdThisWeek = allProbes.filter(p => Date.parse(p.created_at || '') >= sinceMs);
  const closedThisWeek = allProbes.filter(p => p.actual_outcome && p.actual_outcome.detected_at && Date.parse(p.actual_outcome.detected_at) >= sinceMs);
  const outcomeMix = {};
  closedThisWeek.forEach(p => {
    const c = p.actual_outcome.outcome_class || 'unknown';
    outcomeMix[c] = (outcomeMix[c] || 0) + 1;
  });
  const probes = {
    created: createdThisWeek.length,
    closed: closedThisWeek.length,
    outcome_mix: outcomeMix,
    still_open: allProbes.filter(p => !p.actual_outcome || !p.actual_outcome.detected_at).length,
  };

  return { supplements, patterns, probes };
}

function classify(filename) {
  if (filename.startsWith('confluence-aircall-')) return 'aircall';
  if (filename.startsWith('confluence-farmvisit-')) return 'farmvisit';
  if (filename.startsWith('outlook-email-')) return 'outlook';
  if (filename.startsWith('teams-')) return 'teams';
  if (filename.startsWith('granola-meeting-')) return 'granola';
  if (filename.startsWith('hubspot-engagement-snapshot-')) return 'hubspot_snapshot';
  if (filename.startsWith('claudia-call-')) return 'claudia_call';
  return 'other';
}

function renderMarkdown(period, data) {
  const { supplements, patterns, probes } = data;
  const sourceLines = Object.entries(supplements.by_source).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  const outcomeLines = Object.entries(probes.outcome_mix).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  - ${k}: ${v}`).join('\n');
  const newPatterns = patterns.added.length
    ? patterns.added.map(p => `- **${p.title}** — confidence: ${p.confidence || 'n/a'} · in: ${(p.systems || []).join(', ') || 'one system'}`).join('\n')
    : '_(no new patterns this week)_';
  const promotedPatterns = patterns.promoted.length
    ? patterns.promoted.map(p => `- **${p.title}** — now: ${p.confidence || 'n/a'}`).join('\n')
    : '_(no patterns promoted this week)_';

  return `# System retro — ${period.label}

**Period:** ${period.since_iso} → ${period.until_iso}
**Generated:** ${new Date().toISOString()}

> Is the system itself learning this week? Five signals.

## 1. Apex enrichment volume

- **${supplements.count}** supplement files written
- By entity type: contact=${supplements.by_entity.contact} deal=${supplements.by_entity.deal} persona=${supplements.by_entity.persona}
- By source:
${sourceLines || '  _(no source breakdown)_'}

${supplements.count === 0
  ? '> ⚠ Zero supplements written this week — Apex may have stalled. Check apex-runs.log heartbeat.'
  : `> System pulled in fresh signal from ${Object.keys(supplements.by_source).length} distinct sources.`}

## 2. Patterns added or promoted

**New this week (${patterns.added.length}):**
${newPatterns}

**Promoted this week (${patterns.promoted.length}):**
${promotedPatterns}

**Cross-confirmed pattern updates this week:** ${patterns.cross_confirmed_new}

${patterns.added.length === 0 && patterns.promoted.length === 0
  ? '> ⚠ Neither system added nor promoted a pattern this week. Either nothing learned, or the capture flow isn\'t firing — check the log-idea automation on Claudia\'s side.'
  : ''}

## 3. Probe loop — action → outcome

- **Created this week:** ${probes.created}
- **Closed this week (outcome populated):** ${probes.closed}
- **Still open across all time:** ${probes.still_open}

Outcome mix this week:
${outcomeLines || '  _(no outcomes populated this week)_'}

${probes.closed === 0 && probes.created === 0
  ? '> ⚠ No probe activity this week — the action→outcome loop is idle. This is the single biggest unblock for system learning.'
  : ''}

## 4. Notable

${supplements.count > 500 ? '- Apex is hot — over 500 supplement files this week.\n' : ''}${patterns.cross_confirmed_new > 0 ? `- ${patterns.cross_confirmed_new} pattern(s) gained a second-system confirmation this week — confidence trajectory is upward.\n` : ''}${probes.still_open > 20 ? `- ${probes.still_open} probes are open with no outcome yet — backlog growing.\n` : ''}${(supplements.count === 0 && patterns.added.length === 0 && probes.created === 0) ? '- No activity in any signal. The system is dormant.\n' : ''}${'\n'}---

_Generated by \`coaching/engine/system-retro.js\` from BUS_ROOT \`${BUS_ROOT}\`._
`;
}

function generate({ since, until, write = false } = {}) {
  const untilMs = until ? Date.parse(until) : Date.now();
  const sinceMs = since ? Date.parse(since) : (untilMs - WEEK_DAYS * DAY);
  const period = {
    since_iso: new Date(sinceMs).toISOString(),
    until_iso: new Date(untilMs).toISOString(),
    label: isoWeek(untilMs),
  };
  const data = gather(sinceMs);
  const markdown = renderMarkdown(period, data);

  let written_to = null;
  if (write) {
    const dir = path.join(BUS_ROOT, 'system-retros');
    fs.mkdirSync(dir, { recursive: true });
    const filename = path.join(dir, `${period.label}.md`);
    const tmp = filename + '.tmp';
    fs.writeFileSync(tmp, markdown);
    fs.renameSync(tmp, filename);
    written_to = filename;
  }

  return { period, data, markdown, written_to };
}

module.exports = { generate };
