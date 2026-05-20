/**
 * Forward forecast — Section 8 of the STATS redesign.
 *
 * Trailing-pace projection (Section 5) is the truthful answer to "are
 * we on track at current pace". This is the leading indicator: given
 * what's in the pipeline RIGHT NOW, weighted by historical stage-win
 * probability, how much can we expect to land?
 *
 *   expected_hectares = Σ over open deals (project_ha × P(stage → win))
 *
 * P(stage → win) is calibrated from closed deals in the cohort-funnel
 * window: for each stage, P = wins_that_passed_through_stage /
 * total_deals_that_passed_through_stage. Per-cohort calibration so
 * Stormboy's stronger end-funnel conversion (the Section 6 finding) is
 * reflected in its forecast.
 *
 * Output:
 *   - expected_to_register: Σ expected hectares from open pipeline
 *   - already_registered: total project hectares since target-set anchor
 *                         (Section 5's number — included so the forecast
 *                         is a single readable line)
 *   - gap_to_30k: 30,000 - (already + expected)
 *   - by_stage: breakdown of expected hectares by current open stage
 *   - by_cohort: breakdown by Stormboy / control / LawrieCo
 *   - at_risk_hectares: open hectares where days_in_current_stage > p75
 *                       Stormboy-era for that stage (deals slipping)
 *
 * Honest caveats: stage-win probability is a smoothed/historical proxy
 * — does not account for deal-specific risk or seasonality.
 *
 * 4h disk cache.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const WON_STAGE = '231921676';
const LOST_STAGE = 'closedlost';
const TARGET_HECTARES = 30000;
const TARGET_SET_DATE = '2026-04-27T00:00:00Z';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'stormboy-forecast.json');
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

const STAGES = [
  { id: '64066367',  name: 'Qualified Account' },
  { id: '2929183214', name: 'Discovery Call' },
  { id: '64066368',  name: 'Strategy Call' },
  { id: '64066369',  name: 'SLA/KCT Mapping' },
  { id: '1026535686', name: 'KCT Issued' },
];

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${urlPath} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchOpenDeals(token) {
  const all = [];
  let after;
  const stageProps = STAGES.map(s => `hs_v2_date_entered_${s.id}`);
  while (all.length < 5000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'pipeline', operator: 'EQ', value: 'default' },
          { propertyName: 'dealstage', operator: 'IN', values: STAGES.map(s => s.id) },
        ],
      }],
      properties: ['dealname', 'dealstage', 'createdate', 'partner',
                   'estimated_project_ha', 'total_property_hectares',
                   'hs_v2_date_entered_current_stage', ...stageProps],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
    all.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return all;
}

async function fetchDealContacts(token, dealIds) {
  if (!dealIds.length) return {};
  const map = {};
  for (let i = 0; i < dealIds.length; i += 100) {
    const batch = dealIds.slice(i, i + 100);
    const data = await hubspotPost(token, '/crm/v4/associations/deals/contacts/batch/read', {
      inputs: batch.map(id => ({ id: String(id) })),
    });
    (data.results || []).forEach(r => {
      const fromId = r.from && r.from.id;
      if (!fromId) return;
      map[fromId] = (r.to || []).map(t => String(t.toObjectId));
    });
  }
  return map;
}

async function fetchStormboyFlags(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const batch = contactIds.slice(i, i + 100);
    const data = await hubspotPost(token, '/crm/v3/objects/contacts/batch/read', {
      properties: ['storm_boy_campaign_member'],
      inputs: batch.map(id => ({ id })),
    });
    (data.results || []).forEach(c => {
      map[c.id] = c.properties && c.properties.storm_boy_campaign_member;
    });
  }
  return map;
}

function classifyCohort(deal, dealContacts, contactFlags) {
  const contactIds = dealContacts[deal.id] || [];
  const isStormboy = contactIds.some(cid => contactFlags[cid] === 'Yes');
  if (isStormboy) return 'stormboy';
  const partner = (deal.properties.partner || '').trim();
  if (partner === 'LawrieCo') return 'lawrieco';
  return 'control';
}

function dealEnteredStage(deal, stageId) {
  return !!(deal.properties && deal.properties[`hs_v2_date_entered_${stageId}`]);
}

async function run({ force = false } = {}) {
  if (!force) {
    if (fs.existsSync(CACHE_PATH)) {
      try {
        const c = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
        if (Date.now() - Date.parse(c.generated_at) <= CACHE_TTL_MS) return { ...c, from_cache: true };
      } catch (_) {}
    }
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // Calibration data — reuse cohort-funnel which already counts
  // wins-passed-through-stage per cohort. From its stage counts we
  // can derive P(stage → win | cohort) as:
  //   P = stage_won_count / stage_ever_reached_count
  // where stage_won_count = count[stormboy/control/...] at the LAST
  // stage in STAGES (Closed Won), filtered to those that passed through
  // 'stage'. Since cohort-funnel counts ever_passed_through per stage,
  // and the last stage IS Closed Won, the ratio of Won / passed-through-X
  // for a cohort tells us "if a deal in cohort C is at stage X, what's
  // its historical chance of getting to Won?"
  const cohortFunnel = await require('./cohort-funnel').run({});
  const funnelStages = cohortFunnel.stages || [];
  const wonStageRow = funnelStages.find(s => s.id === WON_STAGE);

  // Build P(win | stage, cohort) table. Two-stage calibration:
  //   1. Raw: won / passed-through-stage for this cohort
  //   2. Smoothed: if raw is null OR 0 (no historical wins through this
  //      stage for this cohort — usually a HubSpot tracking gap, e.g.
  //      Discovery Call), fall back to the cohort's overall win rate
  //      (won_overall / passed_through_top_of_funnel). That way deals
  //      in a stage with broken tracking don't silently collapse to
  //      zero expected.
  const winProbByCohort = { stormboy: {}, control: {}, lawrieco: {} };
  const rawWinProbByCohort = { stormboy: {}, control: {}, lawrieco: {} };
  const cohortOverallWinRate = {};
  ['stormboy', 'control', 'lawrieco'].forEach(c => {
    const topRow = funnelStages[0];
    const topN = topRow ? topRow[c] : 0;
    const wonN = wonStageRow ? wonStageRow[c] : 0;
    cohortOverallWinRate[c] = topN > 0 ? wonN / topN : 0;
  });
  ['stormboy', 'control', 'lawrieco'].forEach(c => {
    STAGES.forEach(stage => {
      const row = funnelStages.find(s => s.id === stage.id);
      const passed = row ? row[c] : 0;
      const won = wonStageRow ? wonStageRow[c] : 0;
      const raw = passed > 0 ? won / passed : null;
      rawWinProbByCohort[c][stage.id] = raw;
      const smoothed = (raw == null || raw === 0) ? cohortOverallWinRate[c] : raw;
      winProbByCohort[c][stage.id] = smoothed;
    });
  });

  // Also derive Stormboy-era median time-in-stage for "at-risk" check.
  // We don't have it here, but the stats-pipeline already does — for
  // simplicity, flag at-risk as "days in current stage > 60". That's a
  // rough threshold; tighten later if needed.
  const AT_RISK_DAYS = 60;

  // Fetch open pipeline + classify cohorts
  const open = await fetchOpenDeals(token);
  console.log(`[stormboy-forecast] ${open.length} open pipeline deals`);
  const dealIds = open.map(d => d.id);
  const dealContacts = await fetchDealContacts(token, dealIds);
  const contactIds = Array.from(new Set(Object.values(dealContacts).flat()));
  const flags = await fetchStormboyFlags(token, contactIds);

  const now = Date.now();
  const expected = { stormboy: 0, control: 0, lawrieco: 0, total: 0 };
  const byStage = {};   // stageId → { count, hectares, expected_hectares }
  const byCohort = {};  // cohort → { count, hectares, expected_hectares }
  let atRiskHa = 0, atRiskCount = 0;
  STAGES.forEach(s => { byStage[s.id] = { stage_id: s.id, stage_name: s.name, count: 0, hectares: 0, expected_hectares: 0 }; });
  ['stormboy', 'control', 'lawrieco'].forEach(c => { byCohort[c] = { cohort: c, count: 0, hectares: 0, expected_hectares: 0 }; });

  open.forEach(d => {
    const p = d.properties;
    const ha = parseFloat(p.estimated_project_ha || '0') || 0;
    const stage = p.dealstage;
    const cohort = classifyCohort(d, dealContacts, flags);
    const winP = winProbByCohort[cohort][stage];
    const expHa = winP != null ? ha * winP : 0;

    expected[cohort] = (expected[cohort] || 0) + expHa;
    expected.total += expHa;

    if (byStage[stage]) {
      byStage[stage].count++;
      byStage[stage].hectares += ha;
      byStage[stage].expected_hectares += expHa;
    }
    byCohort[cohort].count++;
    byCohort[cohort].hectares += ha;
    byCohort[cohort].expected_hectares += expHa;

    const entered = Date.parse(p.hs_v2_date_entered_current_stage || '');
    const daysInStage = entered ? Math.floor((now - entered) / (24 * 60 * 60 * 1000)) : null;
    if (daysInStage != null && daysInStage > AT_RISK_DAYS) {
      atRiskHa += ha;
      atRiskCount++;
    }
  });

  // Already-registered (matches Section 5's number) — query a single
  // sum via the trajectory cache instead of re-fetching.
  let alreadyRegisteredHa = 0;
  try {
    const projection = await require('./stormboy-projection').run();
    alreadyRegisteredHa = projection.registered_hectares || 0;
  } catch (_) {}

  const expectedTotal = Math.round(expected.total);
  const projected_total = alreadyRegisteredHa + expectedTotal;
  const gap_to_30k = TARGET_HECTARES - projected_total;
  const open_total_ha = Object.values(byCohort).reduce((s, c) => s + c.hectares, 0);

  const result = {
    generated_at: new Date().toISOString(),
    target_hectares: TARGET_HECTARES,
    target_set_date: TARGET_SET_DATE.slice(0, 10),
    already_registered_hectares: Math.round(alreadyRegisteredHa),
    open_pipeline_hectares: Math.round(open_total_ha),
    expected_to_register_hectares: expectedTotal,
    projected_total_hectares: projected_total,
    gap_to_30k_hectares: gap_to_30k,
    gap_direction: gap_to_30k > 0 ? 'short' : 'over',
    pct_covered_by_pipeline: TARGET_HECTARES > 0 ? Math.round((projected_total / TARGET_HECTARES) * 1000) / 10 : 0,
    win_prob_by_stage_cohort: winProbByCohort,
    win_prob_raw_by_stage_cohort: rawWinProbByCohort,
    cohort_overall_win_rate: cohortOverallWinRate,
    by_stage: Object.values(byStage).map(s => ({
      ...s, hectares: Math.round(s.hectares), expected_hectares: Math.round(s.expected_hectares),
    })),
    by_cohort: Object.values(byCohort).map(c => ({
      ...c, hectares: Math.round(c.hectares), expected_hectares: Math.round(c.expected_hectares),
    })),
    at_risk: { count: atRiskCount, hectares: Math.round(atRiskHa), threshold_days: AT_RISK_DAYS },
    caveats: [
      `Stage-win probability calibrated from closed deals in the cohort-funnel window. Per-cohort, so Stormboy's stronger end-funnel conversion (Section 6) is reflected.`,
      `Linear weighting — does NOT account for deal-specific risk, seasonality, or stage-dwell timing. A deal in Strategy Call for 200 days counts the same as a fresh one at this stage.`,
      `"At-risk" = open hectares where days_in_current_stage > ${AT_RISK_DAYS}. Rough threshold; tighten once Section 7 (funnel velocity) calibrates a per-stage one.`,
      `Stormboy P(win|stage) is based on small n in current data — interpret directionally, not absolutely. As more closed deals land, calibration sharpens.`,
    ],
    from_cache: false,
  };
  try {
    const tmp = CACHE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(result, null, 2));
    fs.renameSync(tmp, CACHE_PATH);
  } catch (e) { console.error('[stormboy-forecast] cache write failed:', e.message); }
  return result;
}

module.exports = { run };
