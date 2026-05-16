/**
 * LawrieCo learnings — experiment endpoint.
 *
 * Pulls two cohorts from HubSpot:
 *   A: deals where partner = "LawrieCo" (partner channel)
 *   B: deals where partner is empty (direct channel)
 *
 * Computes per-cohort: win rate, time-to-close (median + mean), stage
 * distribution, drop-off rates. Returns a JSON comparison the v2 experiment
 * page can render.
 *
 * No cache layer yet — runs live on each request. With ~1500 deals total it
 * takes 2-3 seconds. Add caching once the shape stabilises.
 */

const STAGE_NAMES = {
  '64066367':   'Qualified Account',
  '2929183214': 'Discovery Call',
  '64066368':   'Strategy Call',
  '64066369':   'SLA/KCT Mapping',
  '1026535686': 'KCT Issued',
  '231921676':  'Closed Won',
  'closedlost': 'Closed Lost',
};

const STAGE_ORDER = [
  '64066367', '2929183214', '64066368', '64066369', '1026535686', '231921676', 'closedlost'
];

const HUBSPOT_BASE = 'https://api.hubapi.com';

async function fetchDealsPage(token, filterGroups, after) {
  const body = {
    filterGroups,
    properties: ['dealname', 'dealstage', 'partner', 'createdate', 'closedate', 'amount'],
    limit: 100,
    sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
  };
  if (after) body.after = after;

  const res = await fetch(HUBSPOT_BASE + '/crm/v3/objects/deals/search', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('HubSpot search failed: ' + res.status + ' ' + text);
  }
  return res.json();
}

async function fetchAllDeals(token, filterGroups) {
  const all = [];
  let after = undefined;
  let safety = 50; // 50 pages × 100 deals = 5000 max — well above pipeline size
  while (safety-- > 0) {
    const page = await fetchDealsPage(token, filterGroups, after);
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return all;
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  const d = (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
  return isFinite(d) && d >= 0 ? d : null;
}

function median(arr) {
  const xs = arr.filter(x => x !== null && isFinite(x)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

function mean(arr) {
  const xs = arr.filter(x => x !== null && isFinite(x));
  if (!xs.length) return null;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function analyseCohort(deals) {
  const total = deals.length;
  const byStage = {};
  STAGE_ORDER.forEach(s => { byStage[s] = 0; });
  let closedWon = 0;
  let closedLost = 0;
  const timeToCloseDays = [];

  deals.forEach(d => {
    const stage = d.properties.dealstage;
    if (byStage[stage] !== undefined) byStage[stage]++;
    if (stage === '231921676') {
      closedWon++;
      const dt = daysBetween(d.properties.createdate, d.properties.closedate);
      if (dt !== null) timeToCloseDays.push(dt);
    } else if (stage === 'closedlost') {
      closedLost++;
    }
  });

  const inFlight = total - closedWon - closedLost;
  const terminal = closedWon + closedLost;
  return {
    total,
    closed_won: closedWon,
    closed_lost: closedLost,
    in_flight: inFlight,
    win_rate_total: total ? closedWon / total : null,
    win_rate_terminal: terminal ? closedWon / terminal : null,
    stage_distribution: STAGE_ORDER.map(s => ({
      stage_id: s,
      stage_name: STAGE_NAMES[s],
      count: byStage[s],
      pct: total ? byStage[s] / total : 0,
    })),
    time_to_close_days: {
      median: median(timeToCloseDays),
      mean: mean(timeToCloseDays),
      n: timeToCloseDays.length,
    },
  };
}

async function run() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // Cohort A: partner = LawrieCo
  const lawrieFilters = [{ filters: [{ propertyName: 'partner', operator: 'EQ', value: 'LawrieCo' }] }];

  // Cohort B: partner property NOT set (direct channel — includes Stormboy)
  const directFilters = [{ filters: [{ propertyName: 'partner', operator: 'NOT_HAS_PROPERTY' }] }];

  const [lawrie, direct] = await Promise.all([
    fetchAllDeals(token, lawrieFilters),
    fetchAllDeals(token, directFilters),
  ]);

  const lawrieAnalysis = analyseCohort(lawrie);
  const directAnalysis = analyseCohort(direct);

  return {
    generated_at: new Date().toISOString(),
    cohorts: {
      lawrieco: { label: 'LawrieCo (partner channel)', ...lawrieAnalysis },
      direct:   { label: 'Direct (no partner)',         ...directAnalysis },
    },
    deltas: {
      win_rate_total_pp:    diffPct(lawrieAnalysis.win_rate_total, directAnalysis.win_rate_total),
      win_rate_terminal_pp: diffPct(lawrieAnalysis.win_rate_terminal, directAnalysis.win_rate_terminal),
      time_to_close_median_days_delta: diffDays(lawrieAnalysis.time_to_close_days.median, directAnalysis.time_to_close_days.median),
    },
    notes: [
      'win_rate_total = closed_won / total (in-flight deals count as denominator).',
      'win_rate_terminal = closed_won / (closed_won + closed_lost) — only deals that have reached a terminal state.',
      'Direct cohort = every deal with no partner property set. Includes Stormboy outreach deals AND legacy / inbound / pre-Stormboy.',
      'Deltas are LawrieCo minus Direct. Positive win-rate delta means LawrieCo outperforms.',
    ],
  };
}

function diffPct(a, b) {
  if (a === null || b === null) return null;
  return (a - b) * 100; // returned in percentage points
}

function diffDays(a, b) {
  if (a === null || b === null) return null;
  return a - b;
}

module.exports = { run };
