/**
 * Sales outcome attribution — measurement infrastructure for "are deals with
 * system involvement progressing differently than deals without?".
 *
 * Caveats (read first):
 *   - This is descriptive, not causal. We don't have randomised assignment;
 *     deals receive system signal based on which contacts Apex sweeps. Any
 *     correlation here is a hypothesis to test, not a proof.
 *   - Statistically meaningful comparison needs (a) a sample of 50+ deals
 *     per cohort, (b) 90+ days of post-signal observation. Until then,
 *     treat the numbers as directional and unstable.
 *   - Use this to spot DIVERGENCE: if signal-heavy deals consistently show
 *     better risk_score progression over months, that's a hypothesis worth
 *     a proper experiment (e.g. randomly withhold signal from a cohort).
 *
 * Inputs:
 *   - Active deals from coaching/cache/active.json (the dashboard's working set)
 *   - Per-deal supplement counts from <bus>/deal-supplements/<id>/
 *   - Probe outcomes from <bus>/probe-outcomes/
 *   - Deal signals from <bus>/deal-signals/
 *
 * Outputs:
 *   - per_deal: signal-involvement state + current outcome metrics
 *   - cohort_summary: split by signal volume, mean risk metrics per cohort
 *   - methodology_note: caveats baked in so consumers can't forget
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');
const bus = require('./shared-bus');
const { loadLatest: loadLatestBaseline } = require('./historical-baseline');

function safeReadDir(p) {
  try { return fs.readdirSync(p, { withFileTypes: true }); }
  catch (_) { return []; }
}

function countSupplementsForDeal(dealId) {
  const dir = path.join(BUS_ROOT, 'deal-supplements', String(dealId));
  if (!fs.existsSync(dir)) return { total: 0, recent_7d: 0 };
  const now = Date.now();
  let total = 0;
  let recent = 0;
  safeReadDir(dir).filter(f => f.isFile()).forEach(f => {
    total++;
    try {
      const stat = fs.statSync(path.join(dir, f.name));
      if (now - stat.mtimeMs < 7 * 24 * 60 * 60 * 1000) recent++;
    } catch (_) {}
  });
  return { total, recent_7d: recent };
}

function hasDealSignal(dealId) {
  const p = path.join(BUS_ROOT, 'deal-signals', `deal-${dealId}.json`);
  return fs.existsSync(p);
}

function loadActiveDeals() {
  const cachePath = path.join(__dirname, '..', 'cache', 'active.json');
  if (!fs.existsSync(cachePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return raw.deals || [];
  } catch (_) { return []; }
}

function mean(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

function analyze() {
  const deals = loadActiveDeals();
  const allProbes = bus.listAllProbes();
  const probesByDeal = {};
  allProbes.forEach(p => {
    if (!p.deal_id) return;
    probesByDeal[p.deal_id] = (probesByDeal[p.deal_id] || 0) + 1;
  });

  const perDeal = deals.map(d => {
    const sup = countSupplementsForDeal(d.deal_id);
    const signal = hasDealSignal(d.deal_id);
    const probes = probesByDeal[d.deal_id] || 0;
    // Crude involvement score: any of (supplement files, deal signal, probe).
    const involved = sup.total > 0 || signal || probes > 0;
    return {
      deal_id: d.deal_id,
      deal_name: d.deal_name,
      current_stage: d.current_stage,
      days_in_current_stage: d.days_in_current_stage,
      risk_class: d.risk_class,
      risk_score: d.risk_score,
      supplement_count: sup.total,
      supplements_last_7d: sup.recent_7d,
      has_deal_signal: signal,
      probe_count: probes,
      involved,
      involvement_score: sup.total + (signal ? 5 : 0) + probes * 3,
    };
  });

  const involved = perDeal.filter(p => p.involved);
  const notInvolved = perDeal.filter(p => !p.involved);

  function cohortStats(arr, label) {
    const risks = arr.map(p => p.risk_score).filter(x => typeof x === 'number');
    const days = arr.map(p => p.days_in_current_stage).filter(x => typeof x === 'number');
    const classDist = {};
    arr.forEach(p => {
      const k = p.risk_class || 'unknown';
      classDist[k] = (classDist[k] || 0) + 1;
    });
    return {
      label,
      count: arr.length,
      mean_risk_score: mean(risks),
      mean_days_in_stage: mean(days),
      risk_class_distribution: classDist,
    };
  }

  // Heavy-vs-light split within the involved cohort — once enough data lands,
  // this is what shows whether MORE signal correlates with better outcomes.
  const medSig = involved.length
    ? [...involved].sort((a, b) => a.involvement_score - b.involvement_score)[Math.floor(involved.length / 2)].involvement_score
    : 0;
  const heavySignal = involved.filter(p => p.involvement_score > medSig);
  const lightSignal = involved.filter(p => p.involvement_score <= medSig);

  // Historical baseline — generated separately via /api/system/backfill-baseline.
  // When present, this is the proper "no-system" control: closed deals before
  // Apex went live, with known outcomes (win/lose) and days-to-close.
  const baseline = loadLatestBaseline();

  return {
    generated_at: new Date().toISOString(),
    methodology_note: [
      'Descriptive, not causal. No randomised assignment; deals receive signal',
      'based on Apex sweep coverage and rep activity. Treat differences here',
      'as hypotheses for proper experiments, not proofs.',
      'Requires 50+ deals per cohort and 90+ days observation for statistical',
      'meaning. Below that, results are directional and unstable.',
    ].join(' '),
    sample: {
      active_deals_in_working_set: deals.length,
      involved: involved.length,
      not_involved: notInvolved.length,
      caveat: notInvolved.length < 5
        ? 'Control cohort is too small for comparison — most active deals already have system involvement. This is expected today and improves only if Apex coverage narrows or rep behaviour creates natural variance.'
        : 'Cohort sizes meaningful enough for directional read; still below statistical-significance threshold.',
    },
    cohorts: {
      involved: cohortStats(involved, 'Any system involvement'),
      not_involved: cohortStats(notInvolved, 'No system involvement detected'),
      heavy_signal: cohortStats(heavySignal, `Heavy signal (involvement_score > ${medSig})`),
      light_signal: cohortStats(lightSignal, `Light signal (involvement_score <= ${medSig})`),
    },
    per_deal: perDeal.sort((a, b) => b.involvement_score - a.involvement_score),
    baseline: baseline ? {
      generated_at: baseline.generated_at,
      period: baseline.period,
      sample: baseline.sample,
      mean_days_to_close_won: baseline.by_outcome && baseline.by_outcome.won && baseline.by_outcome.won.mean_days_to_close,
      median_days_to_close_won: baseline.by_outcome && baseline.by_outcome.won && baseline.by_outcome.won.median_days_to_close,
      interpretation: baseline.interpretation,
    } : null,
  };
}

module.exports = { analyze };
