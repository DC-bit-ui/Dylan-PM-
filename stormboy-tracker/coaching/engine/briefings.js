/**
 * Monday + Friday briefing generators.
 *
 * Compile coaching cache + recent learnings into Teams-ready markdown.
 * Output structure designed to feed Claudia's `post-to-teams.md` workflow:
 * dashboard generates the content, Cowork (or a manual /post call) ships it.
 *
 *  Monday brief = forward-looking. What to watch this week. Stuck-deal
 *                 cohort, what's hot, what to push on.
 *  Friday brief = backward-looking. What happened. Wins, losses, new
 *                 learnings, things to remember.
 */

const fs = require('fs');
const path = require('path');
const cache = require('./cache');

const LEARNINGS_DIR = path.join(__dirname, '..', 'learnings');

function parseFrontMatter(content) {
  const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  const lines = m[1].split('\n');
  let currentListKey = null;
  for (const line of lines) {
    if (/^\s*-\s/.test(line) && currentListKey) {
      out[currentListKey].push(line.replace(/^\s*-\s*/, '').trim());
      continue;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) { currentListKey = null; continue; }
    const [, key, raw] = kv;
    if (raw === '' || raw == null) { out[key] = []; currentListKey = key; }
    else { out[key] = raw.trim(); currentListKey = null; }
  }
  return out;
}

function readRecentLearnings(daysBack = 14) {
  if (!fs.existsSync(LEARNINGS_DIR)) return [];
  const out = [];
  const cutoff = Date.now() - daysBack * 86_400_000;
  const months = fs.readdirSync(LEARNINGS_DIR).filter(n => /^\d{4}-\d{2}$/.test(n)).sort().reverse();
  for (const m of months) {
    const files = fs.readdirSync(path.join(LEARNINGS_DIR, m)).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(LEARNINGS_DIR, m, f), 'utf8');
      const meta = parseFrontMatter(content);
      const ts = meta.written_at ? new Date(meta.written_at).getTime() : 0;
      if (ts >= cutoff) out.push({ ...meta, slug: f.replace(/\.md$/, ''), month: m });
    }
  }
  return out.sort((a, b) => (b.written_at || '').localeCompare(a.written_at || ''));
}

function formatRiskBadge(cls) {
  return { red: '🔴', amber: '🟡', green: '🟢' }[cls] || '⚪';
}

// ============================================================================
// Monday brief — forward-looking
// ============================================================================

function generateMondayBrief() {
  const today = new Date().toISOString().slice(0, 10);
  const friction = cache.read('friction');
  const active = cache.read('active');
  const weekly = cache.read('weekly');
  const learnings = readRecentLearnings(7);

  const lines = [];
  lines.push(`# Stormboy Briefing — Monday ${today}`);
  lines.push('');
  lines.push('> Forward-looking. What to watch + push on this week.');
  lines.push('');

  // 1. Headline
  if (friction && friction.top_systemic_friction) {
    lines.push('## This week\'s headline');
    lines.push('');
    lines.push(`> ${friction.top_systemic_friction}`);
    lines.push('');
  }

  // 2. Hot deals — top 5 highest-risk
  if (active && active.deals) {
    const hot = active.deals
      .filter(d => d.risk_class === 'red' || d.risk_class === 'amber')
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, 5);
    if (hot.length) {
      lines.push(`## Deals needing attention (${hot.length} this week)`);
      lines.push('');
      hot.forEach(d => {
        lines.push(`### ${formatRiskBadge(d.risk_class)} ${d.deal_name} — ${d.current_stage} · ${d.days_in_current_stage}d`);
        lines.push(`*Risk: ${d.risk_class.toUpperCase()} ${d.risk_score}/100*`);
        lines.push('');
        if (d.coaching_message) {
          lines.push(d.coaching_message);
          lines.push('');
        }
        if (d.primary_action) {
          lines.push(`**Do this week:** ${d.primary_action}`);
          lines.push('');
        }
      });
    }
  }

  // 3. Channel performance (if known)
  if (weekly && weekly.channel_comparison) {
    const c = weekly.channel_comparison;
    lines.push('## Channel watch');
    lines.push('');
    lines.push(`| Channel | Win rate | Median to close | Wins |`);
    lines.push(`| --- | --- | --- | --- |`);
    if (c.direct)   lines.push(`| Direct sales | ${Math.round((c.direct.win_rate || 0) * 100)}% | ${c.direct.median_days_to_close || '?'}d | ${c.direct.won || '?'} |`);
    if (c.lawrieco) lines.push(`| LawrieCo partner | ${Math.round((c.lawrieco.win_rate || 0) * 100)}% | ${c.lawrieco.median_days_to_close || '?'}d | ${c.lawrieco.won || '?'} |`);
    if (c.observation) { lines.push(''); lines.push(`> ${c.observation}`); }
    lines.push('');
  }

  // 4. Plays in rotation (from learnings — confirmed-working tactics)
  if (learnings.length) {
    const plays = learnings.filter(l => l.category === 'tactical_play' || l.category === 'tactical_framing');
    if (plays.length) {
      lines.push(`## Plays in rotation this week`);
      lines.push('');
      plays.slice(0, 3).forEach(l => {
        lines.push(`- **${l.title}** [\`${l.category}\` · \`${l.confidence}\`]`);
      });
      lines.push('');
    }
  }

  // 5. Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Generated by Stormboy Conversion Tracker · ${new Date().toISOString()}*`);

  return lines.join('\n');
}

// ============================================================================
// Friday brief — backward-looking
// ============================================================================

function generateFridayBrief() {
  const today = new Date().toISOString().slice(0, 10);
  const friction = cache.read('friction');
  const active = cache.read('active');
  const weekly = cache.read('weekly');
  const learnings = readRecentLearnings(7);

  const lines = [];
  lines.push(`# Stormboy Briefing — Friday ${today}`);
  lines.push('');
  lines.push('> Backward-looking. What we learned this week.');
  lines.push('');

  // 1. New learnings this week
  if (learnings.length) {
    lines.push(`## New system learnings (${learnings.length} this week)`);
    lines.push('');
    learnings.slice(0, 5).forEach(l => {
      lines.push(`### ${l.title}`);
      lines.push(`*\`${l.category}\` · ${l.confidence} confidence · ${l.written_at?.slice(0, 10) || ''}*`);
      lines.push('');
      if (l.applicability && l.applicability.length) {
        lines.push(`**Applies when:** ${l.applicability[0]}`);
        lines.push('');
      }
      if (l.sources && l.sources.length) {
        lines.push(`**Sources:** ${l.sources.slice(0, 2).map(s => `\`${s}\``).join(' · ')}`);
        lines.push('');
      }
    });
  }

  // 2. Pipeline state — what's still stuck
  if (active && active.deals) {
    const red = active.deals.filter(d => d.risk_class === 'red');
    if (red.length) {
      lines.push(`## Pipeline state — ${red.length} deals still RED`);
      lines.push('');
      lines.push('| Deal | Stage | Days stuck | Risk |');
      lines.push('| --- | --- | --- | --- |');
      red.slice(0, 8).forEach(d => {
        lines.push(`| ${d.deal_name} | ${d.current_stage} | ${d.days_in_current_stage}d | ${d.risk_score}/100 |`);
      });
      lines.push('');
    }
  }

  // 3. What the system observed about us this week
  if (friction && friction.era_lift_observation) {
    lines.push('## What the system observed');
    lines.push('');
    lines.push(`> ${friction.era_lift_observation}`);
    lines.push('');
  }

  // 4. Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Generated by Stormboy Conversion Tracker · ${new Date().toISOString()}*`);

  return lines.join('\n');
}

module.exports = { generateMondayBrief, generateFridayBrief };
