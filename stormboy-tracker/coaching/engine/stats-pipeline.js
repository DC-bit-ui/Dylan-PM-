/**
 * Pipeline stats — feeds the v2 STATS tab.
 *
 * Pulls all deals from HubSpot, computes era-stratified conversion-time
 * stats with sample sizes + IQR (so leadership can read the spread, not
 * just the median), win-rate splits by channel, and the current funnel
 * snapshot.
 *
 * Honest stats principles:
 *   - Always show n alongside any aggregate.
 *   - Show p25 / p50 / p75, not just median.
 *   - Flag low-n comparisons explicitly ("n<20 — directional only").
 *   - Don't compute a p-value unless n is large enough to mean anything.
 */

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';

const STAGE_NAMES = {
  '64066367':   'Qualified Account',
  '2929183214': 'Discovery Call',
  '64066368':   'Strategy Call',
  '64066369':   'SLA/KCT Mapping',
  '1026535686': 'KCT Issued',
  '231921676':  'Closed Won',
  'closedlost': 'Closed Lost',
};

// Era boundaries. Adjust if a clearer date emerges from the operating doc.
const PRE_STORMBOY_END = '2025-08-31T23:59:59Z';
const STORMBOY_ERA_START = '2025-09-01T00:00:00Z';
// The 30k target-set date — used ONLY for the hectares-to-30k card so
// it matches the header-tile figure. The era-comparison stats above
// keep using STORMBOY_ERA_START because those are about Stormboy as a
// motion, not about the 30k target's reporting window.
const HA_TARGET_SET_DATE = '2026-04-27T00:00:00Z';

// Multi-era classification (used by Era & Channel sub-tab). Tightened from
// the simple pre/post binary so leadership can see the KCT and Stormboy phases.
const ERAS = [
  { key: 'legacy',  name: 'Legacy',       start: '1970-01-01', end: '2024-07-31' },
  { key: 'kct',     name: 'KCT era',      start: '2024-08-01', end: '2025-08-31' },
  { key: 'stormboy',name: 'Stormboy era', start: '2025-09-01', end: '9999-12-31' },
];

function classifyEra(closedate) {
  if (!closedate) return null;
  for (const e of ERAS) {
    if (closedate >= e.start && closedate <= e.end + 'T23:59:59Z') return e.key;
  }
  return null;
}

async function fetchAll(token, filterGroups, properties) {
  const all = [];
  let after = undefined;
  let safety = 50;
  while (safety-- > 0) {
    const body = {
      filterGroups,
      properties,
      limit: 100,
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
    };
    if (after) body.after = after;
    const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HubSpot search ' + res.status);
    const page = await res.json();
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return all;
}

function num(s) { const n = parseFloat(s); return Number.isFinite(n) ? n : 0; }
function daysBetween(a, b) {
  if (!a || !b) return null;
  const d = (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
  return Number.isFinite(d) && d >= 0 ? d : null;
}
function percentile(arr, p) {
  if (!arr.length) return null;
  const sorted = arr.slice().sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function eraStats(deals, eraStart, eraEnd) {
  const inEra = deals.filter(d => {
    if (!d.properties.closedate) return false;
    const c = new Date(d.properties.closedate).toISOString();
    return (!eraStart || c >= eraStart) && (!eraEnd || c <= eraEnd);
  });
  const ttcs = inEra
    .map(d => daysBetween(d.properties.createdate, d.properties.closedate))
    .filter(x => x !== null);
  return {
    n: inEra.length,
    n_with_ttc: ttcs.length,
    median_days: percentile(ttcs, 0.5),
    p25_days: percentile(ttcs, 0.25),
    p75_days: percentile(ttcs, 0.75),
    min_days: ttcs.length ? Math.min(...ttcs) : null,
    max_days: ttcs.length ? Math.max(...ttcs) : null,
  };
}

function honestSignificanceNote(preN, postN, preMedian, postMedian) {
  if (!preN || !postN || preMedian === null || postMedian === null) {
    return 'Sample sizes too small to compare meaningfully.';
  }
  if (postN < 20) {
    return `Post-Stormboy n=${postN} is small; the ${Math.round(preMedian - postMedian)}-day improvement is directional, not yet statistically confirmed. Re-check when n>30.`;
  }
  if (postN >= 20 && postN < 50) {
    return `Post-Stormboy n=${postN} is moderate. The improvement is suggestive of real change. A formal test (Mann-Whitney U) would strengthen the claim.`;
  }
  return `Post-Stormboy n=${postN} is large enough for confident comparison. Median improvement of ${Math.round(preMedian - postMedian)} days appears real.`;
}

async function fetchOpenDeals(token) {
  // Open deals = everything not Closed Won or Closed Lost
  const stageIds = ['64066367', '2929183214', '64066368', '64066369', '1026535686'];
  const filterGroups = stageIds.map(id => ({
    filters: [{ propertyName: 'dealstage', operator: 'EQ', value: id }]
  }));
  return fetchAll(token, filterGroups,
    ['dealname', 'dealstage', 'createdate', 'hs_v2_date_entered_current_stage', 'partner', 'lead_source', 'hubspot_owner_id']);
}

async function run() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // Pull all Closed Won + Closed Lost for win-rate + era stats
  const terminalFilters = [
    { filters: [{ propertyName: 'dealstage', operator: 'EQ', value: '231921676' }] },
    { filters: [{ propertyName: 'dealstage', operator: 'EQ', value: 'closedlost' }] },
  ];
  const [allTerminal, openDeals] = await Promise.all([
    fetchAll(token, terminalFilters,
      ['dealname', 'dealstage', 'createdate', 'closedate', 'partner', 'lead_source',
       'total_property_hectares', 'estimated_project_ha', 'deal_stage_before_close',
       'hs_v2_date_entered_current_stage', 'days_to_close', 'hubspot_owner_id',
       'hs_v2_cumulative_time_in_64066367',
       'hs_v2_cumulative_time_in_2929183214',
       'hs_v2_cumulative_time_in_64066368',
       'hs_v2_cumulative_time_in_64066369',
       'hs_v2_cumulative_time_in_1026535686']),
    fetchOpenDeals(token),
  ]);

  const won = allTerminal.filter(d => d.properties.dealstage === '231921676');
  const lost = allTerminal.filter(d => d.properties.dealstage === 'closedlost');

  // Era stats
  const preEra = eraStats(won, null, PRE_STORMBOY_END);
  const postEra = eraStats(won, STORMBOY_ERA_START, null);
  const delta = (preEra.median_days !== null && postEra.median_days !== null)
    ? preEra.median_days - postEra.median_days
    : null;

  // Win rate by channel
  function rate(deals, predicate) {
    const subset = deals.filter(predicate);
    const wins = subset.filter(d => d.properties.dealstage === '231921676').length;
    const losses = subset.filter(d => d.properties.dealstage === 'closedlost').length;
    return {
      n: subset.length,
      wins,
      losses,
      terminal_win_rate: (wins + losses) ? wins / (wins + losses) : null,
    };
  }
  const channels = {
    lawrieco: rate(allTerminal, d => d.properties.partner === 'LawrieCo'),
    direct:   rate(allTerminal, d => !d.properties.partner),
  };

  // Era wins — used by the multi-era + recent-win sections below
  const eraWins = won.filter(d => new Date(d.properties.closedate) >= new Date(STORMBOY_ERA_START));

  // Hectares to 30K — anchor at the date the 30k target was set
  // (2026-04-27), matching the header-tile figure. Different from
  // eraWins above because the 30k target is a leadership artefact
  // post-dating the Stormboy era start.
  const targetSetWins = won.filter(d => new Date(d.properties.closedate) >= new Date(HA_TARGET_SET_DATE));
  const totalHa = targetSetWins.reduce((s, d) => s + num(d.properties.total_property_hectares), 0);
  const projectHa = targetSetWins.reduce((s, d) => s + num(d.properties.estimated_project_ha), 0);

  // Monthly project-ha trend (since target set)
  const byMonth = {};
  targetSetWins.forEach(d => {
    const m = d.properties.closedate.slice(0, 7); // YYYY-MM
    byMonth[m] = (byMonth[m] || 0) + num(d.properties.estimated_project_ha);
  });
  const monthlyTrend = Object.entries(byMonth)
    .sort()
    .map(([month, ha]) => ({ month, project_ha: Math.round(ha) }));

  // Recent wins
  const recentWins = won
    .slice()
    .sort((a, b) => new Date(b.properties.closedate) - new Date(a.properties.closedate))
    .slice(0, 6)
    .map(d => ({
      id: d.id,
      name: d.properties.dealname,
      closedate: d.properties.closedate,
      createdate: d.properties.createdate,
      days_to_close: daysBetween(d.properties.createdate, d.properties.closedate),
      project_ha: num(d.properties.estimated_project_ha),
      total_ha: num(d.properties.total_property_hectares),
      partner: d.properties.partner || null,
      lead_source: d.properties.lead_source || null,
    }));

  // -------------------- Pipeline funnel (open deals by stage) --------------------
  const funnelStages = [
    { id: '64066367',   name: 'Qualified Account' },
    { id: '2929183214', name: 'Discovery Call' },
    { id: '64066368',   name: 'Strategy Call' },
    { id: '64066369',   name: 'SLA/KCT Mapping' },
    { id: '1026535686', name: 'KCT Issued' },
  ];
  function daysInStage(d) {
    const entered = d.properties.hs_v2_date_entered_current_stage;
    if (!entered) return null;
    return Math.floor((Date.now() - new Date(entered).getTime()) / (1000 * 60 * 60 * 24));
  }
  const pipelineFunnel = funnelStages.map(s => {
    const subset = openDeals.filter(d => d.properties.dealstage === s.id);
    const dwellTimes = subset.map(daysInStage).filter(x => x !== null);
    return {
      stage_id: s.id,
      stage_name: s.name,
      open_count: subset.length,
      median_days_in_stage: percentile(dwellTimes, 0.5),
      max_days_in_stage: dwellTimes.length ? Math.max(...dwellTimes) : null,
      oldest_deals: subset
        .map(d => ({ name: d.properties.dealname, days: daysInStage(d) }))
        .filter(x => x.days !== null)
        .sort((a, b) => b.days - a.days)
        .slice(0, 3),
    };
  });

  // -------------------- Loss analysis (where deals die) --------------------
  const lostByStage = {};
  funnelStages.forEach(s => { lostByStage[s.name] = []; });
  lostByStage['(unknown stage)'] = [];
  lost.forEach(d => {
    const stage = d.properties.deal_stage_before_close;
    const bucket = stage && lostByStage[stage] !== undefined ? stage : '(unknown stage)';
    lostByStage[bucket].push({
      name: d.properties.dealname,
      partner: d.properties.partner || null,
      days_to_close: daysBetween(d.properties.createdate, d.properties.closedate),
      closedate: d.properties.closedate,
    });
  });
  const lossAnalysis = Object.entries(lostByStage).map(([stage, deals]) => ({
    stage,
    lost_count: deals.length,
    median_days_to_loss: percentile(deals.map(x => x.days_to_close).filter(x => x !== null), 0.5),
    recent_examples: deals
      .filter(x => x.closedate)
      .sort((a, b) => new Date(b.closedate) - new Date(a.closedate))
      .slice(0, 3)
      .map(x => ({ name: x.name, partner: x.partner, days_to_loss: x.days_to_close })),
  }));

  // -------------------- Quarterly trend (wins) --------------------
  function quarterOf(iso) {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
  }
  const quarterly = {};
  won.forEach(d => {
    if (!d.properties.closedate) return;
    const q = quarterOf(d.properties.closedate);
    if (!quarterly[q]) quarterly[q] = { quarter: q, won: 0, project_ha: 0, total_ha: 0 };
    quarterly[q].won++;
    quarterly[q].project_ha += num(d.properties.estimated_project_ha);
    quarterly[q].total_ha += num(d.properties.total_property_hectares);
  });
  const quarterlyTrend = Object.values(quarterly)
    .sort((a, b) => a.quarter.localeCompare(b.quarter))
    .map(q => ({ ...q, project_ha: Math.round(q.project_ha), total_ha: Math.round(q.total_ha) }));

  // -------------------- Multi-era breakdown --------------------
  // Same shape as era_comparison but for 3+ eras. Used in Era & Channel sub-tab.
  const multiEra = ERAS.map(e => {
    const subset = won.filter(d => {
      const c = d.properties.closedate;
      return c && c >= e.start && c <= e.end + 'T23:59:59Z';
    });
    const ttcs = subset
      .map(d => daysBetween(d.properties.createdate, d.properties.closedate))
      .filter(x => x !== null);
    const projectHa = subset.reduce((s, d) => s + num(d.properties.estimated_project_ha), 0);
    return {
      key: e.key,
      name: e.name,
      window: `${e.start} → ${e.end === '9999-12-31' ? 'now' : e.end}`,
      n: subset.length,
      median_days: percentile(ttcs, 0.5),
      p25_days: percentile(ttcs, 0.25),
      p75_days: percentile(ttcs, 0.75),
      project_ha: Math.round(projectHa),
    };
  });

  // -------------------- Conversion-time distribution --------------------
  // Histogram of days-to-close across all won deals + stratified by era.
  // Enables percentile sliders + outlier inspection in the Conversion Analysis sub-tab.
  function distribution(deals) {
    const ttcs = deals
      .map(d => daysBetween(d.properties.createdate, d.properties.closedate))
      .filter(x => x !== null)
      .sort((a, b) => a - b);
    if (!ttcs.length) return { n: 0, buckets: [] };
    const bucketSize = 30; // 30-day buckets
    const max = Math.ceil(Math.max(...ttcs) / bucketSize) * bucketSize;
    const buckets = [];
    for (let lo = 0; lo < max; lo += bucketSize) {
      const hi = lo + bucketSize;
      const count = ttcs.filter(t => t >= lo && t < hi).length;
      buckets.push({ lo, hi, count });
    }
    return {
      n: ttcs.length,
      min: ttcs[0],
      max: ttcs[ttcs.length - 1],
      median: percentile(ttcs, 0.5),
      p25: percentile(ttcs, 0.25),
      p75: percentile(ttcs, 0.75),
      p90: percentile(ttcs, 0.9),
      buckets,
    };
  }
  const conversionTimeDistribution = {
    all_time: distribution(won),
    stormboy_era: distribution(eraWins),
    by_era: ERAS.map(e => ({
      key: e.key,
      name: e.name,
      ...distribution(won.filter(d => {
        const c = d.properties.closedate;
        return c && c >= e.start && c <= e.end + 'T23:59:59Z';
      })),
    })),
  };

  // -------------------- Stage transition median times --------------------
  // Historical median time spent in each stage by *won* deals — i.e. how long
  // each stage typically takes when the deal eventually closes won. Computed
  // from hs_v2_cumulative_time_in_<stage_id> (milliseconds). Stratified by era
  // so the Stormboy-era column reflects the current process, not legacy data.
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  function cumDays(d, stageId) {
    const raw = d.properties['hs_v2_cumulative_time_in_' + stageId];
    if (raw == null || raw === '') return null;
    const ms = parseFloat(raw);
    if (!Number.isFinite(ms) || ms <= 0) return null;
    return ms / MS_PER_DAY;
  }
  function stageStats(deals, stageId) {
    const vals = deals.map(d => cumDays(d, stageId)).filter(x => x !== null);
    return {
      n: vals.length,
      median: percentile(vals, 0.5),
      p25: percentile(vals, 0.25),
      p75: percentile(vals, 0.75),
      p90: percentile(vals, 0.9),
    };
  }
  const transitionTimes = funnelStages.map(s => {
    const openInStage = openDeals.filter(d => d.properties.dealstage === s.id);
    const openDwell = openInStage.map(daysInStage).filter(x => x !== null);
    return {
      stage_id: s.id,
      stage_name: s.name,
      // Historical: time spent in this stage by deals that eventually closed won
      won_all_time: stageStats(won, s.id),
      won_stormboy_era: stageStats(eraWins, s.id),
      // Current: how long today's open deals have been sitting in this stage
      current_open: {
        n: openInStage.length,
        median: percentile(openDwell, 0.5),
        p25: percentile(openDwell, 0.25),
        p75: percentile(openDwell, 0.75),
        max: openDwell.length ? Math.max(...openDwell) : null,
      },
    };
  });

  // -------------------- 30K hectare projection --------------------
  // At current trailing rate, when do we hit 30K? Naive linear extrapolation
  // based on the trailing 6-month run rate. Explicitly marked as projection
  // (not commitment).
  const trailingMonths = 6;
  const cutoff = new Date(Date.now() - trailingMonths * 30 * 24 * 60 * 60 * 1000);
  const recentEraWins = eraWins.filter(d => new Date(d.properties.closedate) >= cutoff);
  const recentHa = recentEraWins.reduce((s, d) => s + num(d.properties.estimated_project_ha), 0);
  const monthlyRate = trailingMonths > 0 ? recentHa / trailingMonths : 0;
  const remaining = Math.max(0, 30000 - projectHa);
  const monthsToTarget = monthlyRate > 0 ? remaining / monthlyRate : null;
  const targetDate = monthsToTarget !== null
    ? new Date(Date.now() + monthsToTarget * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : null;
  const projection = {
    target_ha: 30000,
    current_ha: Math.round(projectHa),
    remaining_ha: Math.round(remaining),
    trailing_months: trailingMonths,
    recent_ha_in_window: Math.round(recentHa),
    avg_monthly_ha: Math.round(monthlyRate),
    months_to_target: monthsToTarget !== null ? Math.round(monthsToTarget * 10) / 10 : null,
    estimated_target_date: targetDate,
    confidence: recentEraWins.length >= 5 ? 'medium' : 'low',
    note: recentEraWins.length < 5
      ? `Only ${recentEraWins.length} wins in the trailing ${trailingMonths}-month window. Projection is directional only.`
      : `Based on trailing ${trailingMonths}-month run rate of ~${Math.round(monthlyRate)} ha/month. Linear extrapolation; doesn't account for seasonality or pipeline acceleration.`,
  };

  // -------------------- Per-rep performance (within Stormboy era) --------------------
  const OWNER_NAMES = {
    '145644281': 'Harrison (inactive)',
    '361236574': 'Hobbs',
    '76812243':  'Ben',
    '78272376':  'Claudia',
    '361823546': 'Will',
    '401770537': 'Dylan Jones',
  };
  const repPerf = {};
  eraWins.forEach(d => {
    const ownerId = d.properties.hubspot_owner_id || 'unknown';
    const name = OWNER_NAMES[ownerId] || `owner-${ownerId}`;
    if (!repPerf[name]) repPerf[name] = { rep: name, owner_id: ownerId, wins: 0, project_ha: 0 };
    repPerf[name].wins++;
    repPerf[name].project_ha += num(d.properties.estimated_project_ha);
  });
  const repPerformance = Object.values(repPerf)
    .map(r => ({ ...r, project_ha: Math.round(r.project_ha) }))
    .sort((a, b) => b.project_ha - a.project_ha);

  return {
    generated_at: new Date().toISOString(),
    era_comparison: {
      pre_stormboy: { window: `before ${PRE_STORMBOY_END.slice(0, 10)}`, ...preEra },
      post_stormboy: { window: `from ${STORMBOY_ERA_START.slice(0, 10)}`, ...postEra },
      delta_median_days: delta !== null ? Math.round(delta * 10) / 10 : null,
      honesty_note: honestSignificanceNote(preEra.n_with_ttc, postEra.n_with_ttc, preEra.median_days, postEra.median_days),
    },
    win_rate_by_channel: channels,
    hectares_to_30k: {
      target_ha: 30000,
      total_property_ha: Math.round(totalHa),
      project_ha: Math.round(projectHa),
      project_pct: Math.round((projectHa / 30000) * 1000) / 10,
      monthly_trend: monthlyTrend,
      n_wins: targetSetWins.length,
    },
    recent_wins: recentWins,
    totals: {
      all_won_lifetime: won.length,
      all_lost_lifetime: lost.length,
      open_deals: openDeals.length,
    },
    pipeline_funnel: pipelineFunnel,
    loss_analysis: lossAnalysis,
    quarterly_trend: quarterlyTrend,
    rep_performance: repPerformance,
    multi_era: multiEra,
    conversion_time_distribution: conversionTimeDistribution,
    transition_times: transitionTimes,
    projection_30k: projection,
  };
}

module.exports = { run };
