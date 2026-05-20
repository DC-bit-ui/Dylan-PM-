/**
 * Cohort funnel — Stormboy vs direct control vs LawrieCo, stage-by-stage.
 *
 * Answers: where in the pipeline does Stormboy add (or lose) value?
 * For each of the 6 pipeline stages, count how many deals in each cohort
 * reached that stage (entered_<stage> property is non-null). Compute the
 * stage-to-stage conversion % for each cohort so the rendering can show
 * a side-by-side funnel with drop-off annotations.
 *
 * Cohort classification matches stormboy-efficacy.js (3-way split: a
 * deal with any Stormboy-tagged contact = stormboy regardless of partner;
 * non-Stormboy + partner=LawrieCo = lawrieco; else = control).
 *
 * Cached on disk with same 4h TTL as efficacy. ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const STORMBOY_LAUNCH_DATE = '2026-01-13';
const DEFAULT_WINDOW_MONTHS = 18;
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'cohort-funnel.json');
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

// Pipeline stage order — matches CLAUDE.md and v1 dashboard. The "Closed
// Won" stage is the last successful stage. Closed Lost is tracked
// separately because it's a terminal but non-progressing outcome.
const STAGES = [
  { id: '64066367',  name: 'Qualified Account' },
  { id: '2929183214', name: 'Discovery Call' },
  { id: '64066368',  name: 'Strategy Call' },
  { id: '64066369',  name: 'SLA/KCT Mapping' },
  { id: '1026535686', name: 'KCT Issued' },
  { id: '231921676', name: 'Closed Won' },
];
const LOST_STAGE_ID = 'closedlost';

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

async function fetchClosedDeals(token, sinceMs, untilMs, stage) {
  const deals = [];
  let after;
  // Include stage-entry timestamps so we can count which stages each deal traversed
  const stageProps = STAGES.map(s => `hs_v2_date_entered_${s.id}`);
  while (deals.length < 5000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'dealstage', operator: 'EQ', value: stage },
          { propertyName: 'closedate', operator: 'GTE', value: String(sinceMs) },
          { propertyName: 'closedate', operator: 'LTE', value: String(untilMs) },
        ],
      }],
      properties: ['dealname', 'dealstage', 'createdate', 'closedate',
                   'partner', 'lead_source', ...stageProps],
      sorts: [{ propertyName: 'closedate', direction: 'ASCENDING' }],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
    deals.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return deals;
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

function buildFunnel(deals, cohortOf) {
  const cohorts = ['stormboy', 'control', 'lawrieco'];
  const counts = {};
  cohorts.forEach(c => { counts[c] = { lost: 0 }; STAGES.forEach(s => { counts[c][s.id] = 0; }); });
  deals.forEach(d => {
    const c = cohortOf.get(d.id);
    if (!c) return;
    STAGES.forEach(s => {
      if (dealEnteredStage(d, s.id)) counts[c][s.id]++;
    });
    if (d.properties.dealstage === LOST_STAGE_ID) counts[c].lost++;
  });
  // Build per-stage rows with drop-off rate calc
  const stages = STAGES.map((s, idx) => {
    const prev = idx === 0 ? null : STAGES[idx - 1];
    const row = { id: s.id, name: s.name };
    cohorts.forEach(c => {
      row[c] = counts[c][s.id];
      // Conversion rate from prev stage to this stage
      if (prev) {
        const prevN = counts[c][prev.id];
        row[c + '_conversion_pct'] = prevN === 0 ? null : Math.round((counts[c][s.id] / prevN) * 1000) / 10;
      }
    });
    return row;
  });
  // Per-cohort: total entered Qualified (top of funnel) + total won + total lost
  const summary = {};
  cohorts.forEach(c => {
    const top = counts[c][STAGES[0].id];
    const won = counts[c][STAGES[STAGES.length - 1].id];
    const lost = counts[c].lost;
    summary[c] = {
      entered_pipeline: top,
      reached_won: won,
      reached_lost: lost,
      overall_win_rate_pct: (won + lost) === 0 ? null : Math.round((won / (won + lost)) * 1000) / 10,
      total_funnel_conversion_pct: top === 0 ? null : Math.round((won / top) * 1000) / 10,
    };
  });
  // Identify the biggest stage-to-stage delta between stormboy and control
  // — highlights where the difference is most visible.
  let biggestDelta = { stage_name: null, delta_pp: 0 };
  for (let i = 1; i < stages.length; i++) {
    const sb = stages[i].stormboy_conversion_pct;
    const ct = stages[i].control_conversion_pct;
    if (sb == null || ct == null) continue;
    const d = sb - ct;
    if (Math.abs(d) > Math.abs(biggestDelta.delta_pp)) {
      biggestDelta = { stage_name: stages[i].name, delta_pp: Math.round(d * 10) / 10, stage_index: i };
    }
  }
  return { stages, summary, biggest_delta: biggestDelta };
}

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const c = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (!c.generated_at) return null;
    if (Date.now() - Date.parse(c.generated_at) > CACHE_TTL_MS) return null;
    return c;
  } catch (_) { return null; }
}
function writeCache(obj) {
  try {
    const tmp = CACHE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, CACHE_PATH);
  } catch (e) { console.error('[cohort-funnel] cache write failed:', e.message); }
}

async function run({ windowMonths, force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return { ...cached, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const months = windowMonths || DEFAULT_WINDOW_MONTHS;
  const untilMs = Date.now();
  const sinceMs = untilMs - months * 30 * 24 * 60 * 60 * 1000;

  console.log(`[cohort-funnel] querying closed deals ${new Date(sinceMs).toISOString().slice(0,10)} → ${new Date(untilMs).toISOString().slice(0,10)}`);
  const [won, lost] = await Promise.all([
    fetchClosedDeals(token, sinceMs, untilMs, '231921676'),
    fetchClosedDeals(token, sinceMs, untilMs, 'closedlost'),
  ]);
  const allDeals = [...won, ...lost];
  console.log(`[cohort-funnel] ${won.length} won + ${lost.length} lost = ${allDeals.length} closed deals`);

  if (allDeals.length === 0) {
    return {
      generated_at: new Date().toISOString(),
      window: { months, since_iso: new Date(sinceMs).toISOString(), until_iso: new Date(untilMs).toISOString() },
      empty: true,
      reason: 'No closed deals in window.',
    };
  }

  const dealIds = allDeals.map(d => d.id);
  const dealContacts = await fetchDealContacts(token, dealIds);
  const contactIds = Array.from(new Set(Object.values(dealContacts).flat()));
  const contactFlags = await fetchStormboyFlags(token, contactIds);
  const cohortOf = new Map();
  allDeals.forEach(d => cohortOf.set(d.id, classifyCohort(d, dealContacts, contactFlags)));

  const funnel = buildFunnel(allDeals, cohortOf);

  const result = {
    generated_at: new Date().toISOString(),
    window: { months, since_iso: new Date(sinceMs).toISOString(), until_iso: new Date(untilMs).toISOString() },
    stormboy_launch_date: STORMBOY_LAUNCH_DATE,
    stages: funnel.stages,
    summary: funnel.summary,
    biggest_delta: funnel.biggest_delta,
    caveats: [
      'Closed deals only (won + lost). Open deals not in this snapshot.',
      'Stage entry counts use hs_v2_date_entered_<stage_id> — a deal "entered" a stage if it ever passed through, even briefly.',
      'Stormboy cohort = any associated contact has storm_boy_campaign_member=Yes. LawrieCo cohort = partner=LawrieCo AND no Stormboy contact. Control = direct, neither.',
    ],
    from_cache: false,
  };

  writeCache(result);
  return result;
}

module.exports = { run, STAGES };
