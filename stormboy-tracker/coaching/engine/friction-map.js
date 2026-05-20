/**
 * Friction map — Section 6 of the STATS redesign.
 *
 * Synthesis layer over cohort-funnel + loss-reason data. Answers the
 * question: "given the cohort gaps, where should I push next?"
 *
 * For each stage transition (idx 1..n in the pipeline), computes:
 *   - stormboy_gap_pp     = stormboy_conv_pct - control_conv_pct
 *   - control_volume      = count of control deals that reached the prev
 *                           stage (the pool the gap acts on)
 *   - estimated_impact_n  = abs(gap_pp/100) × control_volume
 *                           — an upper-bound estimate of "deals lost
 *                           or gained because of the gap"
 *   - direction           = 'stormboy_winning' | 'stormboy_lagging' | 'flat'
 *
 * Ranks all transitions by abs(estimated_impact_n) descending — so the
 * top of the list is "biggest lever for Stormboy efficacy".
 *
 * Loss-reason concentration per cohort piggybacks on the cohort-funnel
 * data we already extended.
 *
 * No new HubSpot calls — pure synthesis. 5-min in-memory cache
 * (underlying cohort-funnel cache is 4h).
 */

const FLAT_THRESHOLD_PP = 4;     // gap smaller than this is treated as flat
const MIN_VOLUME_FOR_RANK = 3;   // ignore tiny-volume transitions in the ranking
const CACHE_TTL_MS = 5 * 60 * 1000;
let _cached = null;

function directionOf(gapPp) {
  if (gapPp == null) return 'unknown';
  if (Math.abs(gapPp) < FLAT_THRESHOLD_PP) return 'flat';
  return gapPp > 0 ? 'stormboy_winning' : 'stormboy_lagging';
}

function recommendedFix(prevStageName, gapPp, lossReasonForStage) {
  // prevStageName is the stage where deals were lost on this transition.
  // Light heuristic — point users at the right pattern based on stage +
  // dominant loss reason. Pattern slugs reference shared-growth-memory/
  // patterns/ files. The frontend resolves the relative path.
  if (gapPp == null) return null;
  const reason = (lossReasonForStage || '').toLowerCase();
  if (reason.includes('25%') || reason.includes('too high')) {
    return {
      hint: 'Reframe 25% as risk-transfer, not commission',
      pattern_file: '2026-05-09-hobbs-2575-methodology-liability-frame.md',
    };
  }
  if (reason.includes('not for') || reason.includes('6 months') || reason.includes('timing')) {
    return {
      hint: 'Re-engage with fresh HORIZON Snapshot — timing objection pattern',
      pattern_file: '2026-05-09-nurture-back-horizon-snapshot.md',
    };
  }
  if (prevStageName === 'Strategy Call' || prevStageName === 'SLA/KCT Mapping' || prevStageName === 'KCT Issued') {
    return {
      hint: 'Hobbs\'s seven-topic objection playbook — every framing landed in transcripts',
      pattern_file: '2026-05-11-hobbs-objection-handling-playbook.md',
    };
  }
  return null;
}

function buildRanking(funnel) {
  const stages = funnel.stages || [];
  const items = [];
  for (let i = 1; i < stages.length; i++) {
    const stage = stages[i];
    const prev = stages[i - 1];
    const sbConv = stage.stormboy_conversion_pct;
    const ctConv = stage.control_conversion_pct;
    const lwConv = stage.lawrieco_conversion_pct;
    const sbGap = (sbConv != null && ctConv != null) ? Math.round((sbConv - ctConv) * 10) / 10 : null;
    const controlVolume = prev.control || 0;
    const stormboyVolume = prev.stormboy || 0;
    const impactN = sbGap == null ? 0 : Math.abs((sbGap / 100) * controlVolume);

    // For a stage transition prev → stage, the deals that fell out had
    // deal_stage_before_close = prev.name (they were lost while at prev).
    // So we look up loss reasons keyed by prev.name, not stage.name.
    const lossByCohort = {};
    ['stormboy', 'control', 'lawrieco'].forEach(c => {
      const stageReasons = (funnel.loss_reasons_full && funnel.loss_reasons_full[c]
                            && funnel.loss_reasons_full[c][prev.name]) || {};
      const top = Object.entries(stageReasons).sort((a, b) => b[1] - a[1]).slice(0, 3);
      lossByCohort[c] = top.map(([reason, count]) => ({ reason, count }));
    });

    const topReasonHere = (lossByCohort.stormboy[0] && lossByCohort.stormboy[0].reason)
                       || (lossByCohort.control[0] && lossByCohort.control[0].reason)
                       || null;
    items.push({
      stage_id: stage.id,
      stage_name: stage.name,
      stormboy_conversion_pct: sbConv,
      control_conversion_pct: ctConv,
      lawrieco_conversion_pct: lwConv,
      gap_pp_vs_control: sbGap,
      direction: directionOf(sbGap),
      stormboy_volume_in_prev: stormboyVolume,
      control_volume_in_prev: controlVolume,
      estimated_impact_n: Math.round(impactN * 10) / 10,
      loss_reasons_at_stage: lossByCohort,
      lost_at_prev_stage: prev.name,
      recommended_fix: recommendedFix(prev.name, sbGap, topReasonHere),
    });
  }
  // Rank by estimated_impact_n desc — but only show items where the
  // control volume is big enough to be a real signal.
  const ranked = items
    .filter(it => it.control_volume_in_prev >= MIN_VOLUME_FOR_RANK)
    .sort((a, b) => b.estimated_impact_n - a.estimated_impact_n);

  return { items_ranked: ranked, items_all: items };
}

async function run() {
  if (_cached && Date.now() - _cached.generated_at < CACHE_TTL_MS) {
    return { ..._cached.result, from_cache: true };
  }
  const funnel = await require('./cohort-funnel').run({});
  if (!funnel || funnel.empty || !funnel.stages) {
    return { generated_at: new Date().toISOString(), empty: true,
             reason: funnel && funnel.reason || 'No funnel data' };
  }
  const { items_ranked, items_all } = buildRanking(funnel);

  // Headline: the top-impact transition where Stormboy is lagging is
  // the #1 thing to fix. The top winning one is what to protect.
  const topLagging = items_ranked.find(it => it.direction === 'stormboy_lagging') || null;
  const topWinning = items_ranked.find(it => it.direction === 'stormboy_winning') || null;

  // Data-hygiene snapshot for the caveat — HubSpot's
  // deal_stage_before_close is sparsely populated, so the per-stage
  // loss-reason breakdown is mostly empty. We surface this explicitly
  // so users don't read absence-of-signal as absence-of-problem.
  let stagedReasonsTotal = 0;
  let unstagedReasonsTotal = 0;
  Object.values(funnel.loss_reasons_full || {}).forEach(cohortMap => {
    Object.entries(cohortMap).forEach(([stage, reasons]) => {
      if (stage === '__all__') return;
      const c = Object.values(reasons).reduce((s, v) => s + v, 0);
      if (stage === '(unknown stage)') unstagedReasonsTotal += c;
      else stagedReasonsTotal += c;
    });
  });
  const hygiene = {
    losses_with_stage_before_close: stagedReasonsTotal,
    losses_without_stage_before_close: unstagedReasonsTotal,
    populated_pct: (stagedReasonsTotal + unstagedReasonsTotal) === 0
      ? null
      : Math.round((stagedReasonsTotal / (stagedReasonsTotal + unstagedReasonsTotal)) * 1000) / 10,
  };

  const result = {
    generated_at: new Date().toISOString(),
    window: funnel.window,
    items_ranked,
    items_all,
    top_lagging: topLagging,
    top_winning: topWinning,
    loss_reasons_top: funnel.loss_reasons_top,
    funnel_summary: funnel.summary,
    data_hygiene: hygiene,
    caveats: [
      `Impact = |gap_pp / 100| × control deals at the prior stage. Upper bound on "deals Stormboy lost (or gained) because of this transition's gap" — assumes the gap applies uniformly to volume.`,
      `Loss reasons by stage use deal_stage_before_close (HubSpot's last-stage-pre-close property). Empty values bucketed as "(unknown stage)".`,
      `Stages where control had < ${MIN_VOLUME_FOR_RANK} prior-stage deals are excluded from the ranking — gaps on tiny samples aren't actionable.`,
    ],
    from_cache: false,
  };
  _cached = { generated_at: Date.now(), result };
  return result;
}

module.exports = { run };
