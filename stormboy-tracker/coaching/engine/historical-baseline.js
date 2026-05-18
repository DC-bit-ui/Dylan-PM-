/**
 * Historical baseline — pull closed deals from HubSpot and compute pre-system
 * baseline metrics. Solves the degenerate cohort problem in outcome-attribution
 * (today's 4 active deals all have system involvement, so there's no control
 * group). The baseline gives us PRE-system numbers from the existing pipeline
 * history, which we then compare against post-system trajectories as the bus
 * accumulates real data.
 *
 * Mental model:
 *   - Historical closed deals = the world WITHOUT this system (Apex started
 *     2026-05). These are the control.
 *   - Future closed deals (post system go-live) = the treatment cohort.
 *   - The difference, measured over time, is the system's contribution.
 *
 * Output: a JSON baseline file in <bus>/baselines/baseline-<since>-to-<until>.json
 * Read by outcome-attribution to render the comparison.
 *
 * Caveats baked into the file:
 *   - Historical deals may have had OTHER tooling assists (Frontier, KCT,
 *     etc.) that aren't this system. The baseline isn't a vacuum.
 *   - Selection bias: deals that closed at all are easier than deals stuck
 *     forever. The comparison favours the post-system cohort if it includes
 *     not-yet-closed deals.
 *   - Macro shifts (carbon market changes, regulation) confound year-to-year.
 *     Prefer comparing windows of similar length and recency.
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const WON_STAGE = '231921676';
const LOST_STAGE = 'closedlost';
const PAGE_LIMIT = 100;
const HARD_CAP = 5000; // safety; tune if real volume exceeds

async function hubspotPost(token, urlPath, body) {
  const res = await fetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HubSpot POST ${urlPath} → ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchClosedDeals({ token, sinceMs, untilMs, stage }) {
  const deals = [];
  let after = undefined;
  while (deals.length < HARD_CAP) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'dealstage', operator: 'EQ', value: stage },
          { propertyName: 'closedate', operator: 'GTE', value: String(sinceMs) },
          { propertyName: 'closedate', operator: 'LTE', value: String(untilMs) },
        ],
      }],
      properties: [
        'dealname', 'dealstage', 'createdate', 'closedate', 'hubspot_owner_id',
        'amount', 'pipeline', 'lead_source',
      ],
      sorts: [{ propertyName: 'closedate', direction: 'ASCENDING' }],
      limit: PAGE_LIMIT,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
    const results = page.results || [];
    deals.push(...results);
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return deals;
}

function median(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

function summarise(deals, label) {
  const daysToClose = [];
  const byOwner = {};
  const byYear = {};
  deals.forEach(d => {
    const p = d.properties || {};
    const created = Date.parse(p.createdate || '');
    const closed = Date.parse(p.closedate || '');
    if (created && closed && closed > created) {
      daysToClose.push(Math.round((closed - created) / (1000 * 60 * 60 * 24)));
    }
    const owner = p.hubspot_owner_id || 'unassigned';
    byOwner[owner] = (byOwner[owner] || 0) + 1;
    const year = (p.closedate || '').slice(0, 4);
    if (year) byYear[year] = (byYear[year] || 0) + 1;
  });
  return {
    label,
    count: deals.length,
    mean_days_to_close: mean(daysToClose),
    median_days_to_close: median(daysToClose),
    by_owner: byOwner,
    by_year: byYear,
  };
}

async function backfill({ since, until } = {}) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const now = Date.now();
  const untilMs = until ? Date.parse(until) : now;
  const sinceMs = since ? Date.parse(since) : (untilMs - 730 * 24 * 60 * 60 * 1000);

  const [wonDeals, lostDeals] = await Promise.all([
    fetchClosedDeals({ token, sinceMs, untilMs, stage: WON_STAGE }),
    fetchClosedDeals({ token, sinceMs, untilMs, stage: LOST_STAGE }),
  ]);

  const wonSummary = summarise(wonDeals, 'closedwon');
  const lostSummary = summarise(lostDeals, 'closedlost');
  const total = wonDeals.length + lostDeals.length;
  const winRate = total === 0 ? null : Math.round((wonDeals.length / total) * 1000) / 10;

  const baseline = {
    generated_at: new Date().toISOString(),
    period: {
      since_iso: new Date(sinceMs).toISOString(),
      until_iso: new Date(untilMs).toISOString(),
      days: Math.round((untilMs - sinceMs) / (1000 * 60 * 60 * 24)),
    },
    sample: {
      total_closed: total,
      won: wonDeals.length,
      lost: lostDeals.length,
      win_rate_pct: winRate,
    },
    by_outcome: {
      won: wonSummary,
      lost: lostSummary,
    },
    caveats: [
      'Historical deals may have had OTHER tooling assists (Frontier, KCT, manual coaching) that are not THIS system.',
      'Selection bias: only deals that closed are in this baseline. Stuck-forever deals are excluded.',
      'Macro confounders: carbon-market shifts, regulation, seasonal effects. Compare same-length windows.',
      'Owner mix changes over time; per-owner win rates are more comparable than the aggregate.',
    ],
    interpretation: total === 0
      ? 'No closed deals in this window — try a wider range or confirm HubSpot filters.'
      : `Pre-system win rate = ${winRate}% across ${total} closed deals. Post-system cohort should clear this bar plus a buffer before claiming impact.`,
  };

  const dir = path.join(BUS_ROOT, 'baselines');
  fs.mkdirSync(dir, { recursive: true });
  const filename = path.join(dir, `baseline-${new Date(sinceMs).toISOString().slice(0,10)}-to-${new Date(untilMs).toISOString().slice(0,10)}.json`);
  const tmp = filename + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(baseline, null, 2));
  fs.renameSync(tmp, filename);
  baseline.written_to = filename;
  return baseline;
}

function loadLatest() {
  const dir = path.join(BUS_ROOT, 'baselines');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('baseline-') && f.endsWith('.json'));
  if (!files.length) return null;
  files.sort();
  const newest = files[files.length - 1];
  try { return JSON.parse(fs.readFileSync(path.join(dir, newest), 'utf8')); }
  catch (_) { return null; }
}

module.exports = { backfill, loadLatest };
