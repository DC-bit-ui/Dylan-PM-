/**
 * Stormboy efficacy — the headline answer to "is Stormboy working?"
 *
 * Compares two cohorts of closed deals:
 *   - Stormboy cohort: deals where any associated contact has
 *     storm_boy_campaign_member = 'Yes'
 *   - Control cohort: deals with no Stormboy-tagged contacts
 *
 * Both cohorts are restricted to the same time window (default last 18
 * months) so macro shifts don't bias the comparison. Returns side-by-side
 * win rate, days-to-close, and hectares-won — plus deltas so the UI can
 * render hero cards without further math.
 *
 * Cache: 4-hour TTL on disk. Refresh by calling with ?force=1.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const WON_STAGE = '231921676';
const LOST_STAGE = 'closedlost';
const DEFAULT_WINDOW_MONTHS = 18;
const STORMBOY_LAUNCH_DATE = '2026-01-13';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'stormboy-efficacy.json');
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

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

async function fetchClosedDealsInWindow(token, sinceMs, untilMs, stage) {
  const deals = [];
  let after;
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
                   'hubspot_owner_id', 'total_property_hectares',
                   'estimated_project_ha', 'partner', 'lead_source'],
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

// Fetches every deal that entered the default sales pipeline in the
// window. Used for the "pipeline entry rate" metric — counts how often
// direct (non-LawrieCo) deals show up in the pipeline, normalised to
// deals/week so Stormboy era and control are directly comparable.
async function fetchPipelineEntries(token, sinceMs, untilMs) {
  const deals = [];
  let after;
  while (deals.length < 10000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'pipeline', operator: 'EQ', value: 'default' },
          { propertyName: 'createdate', operator: 'GTE', value: String(sinceMs) },
          { propertyName: 'createdate', operator: 'LTE', value: String(untilMs) },
        ],
      }],
      properties: ['dealname', 'createdate', 'partner', 'lead_source', 'dealstage'],
      sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
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

function pipelineEntryRate(deals, sinceMs, untilMs) {
  const direct = deals.filter(d => (d.properties.partner || '').trim() !== 'LawrieCo');
  const weeks = Math.max((untilMs - sinceMs) / (7 * 24 * 60 * 60 * 1000), 0.1);
  return {
    total_in_period: deals.length,
    direct_count: direct.length,
    excluded_lawrieco: deals.length - direct.length,
    weeks: Math.round(weeks * 10) / 10,
    direct_per_week: Math.round((direct.length / weeks) * 100) / 100,
    direct_per_month: Math.round((direct.length / weeks * 4.345) * 10) / 10,
  };
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
  return isStormboy ? 'stormboy' : 'control';
}

function mean(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function summariseCohort(label, deals) {
  const won = deals.filter(d => d.properties.dealstage === WON_STAGE);
  const lost = deals.filter(d => d.properties.dealstage === LOST_STAGE);
  const total = won.length + lost.length;
  const winRate = total === 0 ? null : Math.round((won.length / total) * 1000) / 10;
  const daysToClose = won.map(d => {
    const c = Date.parse(d.properties.createdate || '');
    const cl = Date.parse(d.properties.closedate || '');
    if (!c || !cl || cl <= c) return null;
    return Math.round((cl - c) / (24 * 60 * 60 * 1000));
  }).filter(x => x != null);
  const hectaresPerDeal = won.map(d => {
    const v = parseFloat(d.properties.estimated_project_ha || d.properties.total_property_hectares || '0');
    return isNaN(v) ? 0 : v;
  });
  const hectaresTotal = hectaresPerDeal.reduce((a, b) => a + b, 0);
  return {
    label,
    won_count: won.length,
    lost_count: lost.length,
    total_closed: total,
    win_rate_pct: winRate,
    mean_days_to_close: mean(daysToClose),
    median_days_to_close: median(daysToClose),
    hectares_won: Math.round(hectaresTotal),
    hectares_per_won_deal_mean: won.length === 0 ? null : Math.round(hectaresTotal / won.length),
  };
}

function delta(post, pre, opts = {}) {
  if (post == null || pre == null) return null;
  const abs = post - pre;
  const pct = pre === 0 ? null : Math.round((abs / pre) * 1000) / 10;
  // direction: 'up_good' means up is desirable (e.g. win_rate, hectares)
  //            'down_good' means down is desirable (e.g. days_to_close)
  const direction = opts.direction || 'up_good';
  let trend;
  if (Math.abs(pct || 0) < 1) trend = 'flat';
  else if (direction === 'up_good') trend = abs > 0 ? 'good' : 'bad';
  else trend = abs < 0 ? 'good' : 'bad';
  return { absolute: Math.round(abs * 10) / 10, pct_change: pct, trend, direction };
}

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const c = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (!c.generated_at) return null;
    const age = Date.now() - Date.parse(c.generated_at);
    if (age > CACHE_TTL_MS) return null;
    return c;
  } catch (_) { return null; }
}
function writeCache(obj) {
  try {
    const tmp = CACHE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, CACHE_PATH);
  } catch (e) { console.error('[stormboy-efficacy] cache write failed:', e.message); }
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

  console.log(`[stormboy-efficacy] querying closed deals ${new Date(sinceMs).toISOString().slice(0,10)} → ${new Date(untilMs).toISOString().slice(0,10)}`);
  const [won, lost] = await Promise.all([
    fetchClosedDealsInWindow(token, sinceMs, untilMs, WON_STAGE),
    fetchClosedDealsInWindow(token, sinceMs, untilMs, LOST_STAGE),
  ]);
  const allDeals = [...won, ...lost];
  console.log(`[stormboy-efficacy] ${won.length} won + ${lost.length} lost = ${allDeals.length} closed deals`);

  if (allDeals.length === 0) {
    return {
      generated_at: new Date().toISOString(),
      window: { months, since_iso: new Date(sinceMs).toISOString(), until_iso: new Date(untilMs).toISOString() },
      empty: true,
      reason: 'No closed deals in window — try a wider range.',
    };
  }

  const dealIds = allDeals.map(d => d.id);
  console.log(`[stormboy-efficacy] fetching deal→contact associations for ${dealIds.length} deals`);
  const dealContacts = await fetchDealContacts(token, dealIds);
  const contactIds = Array.from(new Set(Object.values(dealContacts).flat()));
  console.log(`[stormboy-efficacy] fetching storm_boy_campaign_member flag for ${contactIds.length} contacts`);
  const contactFlags = await fetchStormboyFlags(token, contactIds);

  const stormboyDeals = allDeals.filter(d => classifyCohort(d, dealContacts, contactFlags) === 'stormboy');
  const controlDeals = allDeals.filter(d => classifyCohort(d, dealContacts, contactFlags) === 'control');

  const stormboy = summariseCohort('Stormboy cohort', stormboyDeals);
  const control = summariseCohort('Control (non-Stormboy)', controlDeals);

  // Pipeline-entry rate — independent of close outcome. How often are
  // direct (non-LawrieCo) deals reaching the sales pipeline? Compute for
  // Stormboy era and for the (pre-Stormboy) part of the window so the
  // two rates are directly comparable as deals/week.
  const launchMs = Date.parse(STORMBOY_LAUNCH_DATE + 'T00:00:00Z');
  console.log(`[stormboy-efficacy] fetching pipeline entries in window for rate calc`);
  const entries = await fetchPipelineEntries(token, sinceMs, untilMs);
  const stormboyEra = entries.filter(d => {
    const c = Date.parse(d.properties.createdate || '');
    return !isNaN(c) && c >= launchMs;
  });
  const preStormboyEra = entries.filter(d => {
    const c = Date.parse(d.properties.createdate || '');
    return !isNaN(c) && c < launchMs;
  });
  const stormboyEraRate = pipelineEntryRate(stormboyEra, launchMs, untilMs);
  const preStormboyRate = pipelineEntryRate(preStormboyEra, sinceMs, launchMs);

  const result = {
    generated_at: new Date().toISOString(),
    window: { months, since_iso: new Date(sinceMs).toISOString(), until_iso: new Date(untilMs).toISOString() },
    stormboy_launch_date: STORMBOY_LAUNCH_DATE,
    cohorts: { stormboy, control },
    deltas: {
      win_rate_pp: stormboy.win_rate_pct != null && control.win_rate_pct != null
        ? { absolute: Math.round((stormboy.win_rate_pct - control.win_rate_pct) * 10) / 10, trend: stormboy.win_rate_pct >= control.win_rate_pct ? 'good' : 'bad', direction: 'up_good' }
        : null,
      win_rate_relative: delta(stormboy.win_rate_pct, control.win_rate_pct, { direction: 'up_good' }),
      median_days_to_close: delta(stormboy.median_days_to_close, control.median_days_to_close, { direction: 'down_good' }),
      mean_days_to_close: delta(stormboy.mean_days_to_close, control.mean_days_to_close, { direction: 'down_good' }),
      hectares_won: delta(stormboy.hectares_won, control.hectares_won, { direction: 'up_good' }),
      hectares_per_won_deal_mean: delta(stormboy.hectares_per_won_deal_mean, control.hectares_per_won_deal_mean, { direction: 'up_good' }),
      pipeline_entry_direct_per_week: delta(stormboyEraRate.direct_per_week, preStormboyRate.direct_per_week, { direction: 'up_good' }),
    },
    pipeline_entry: {
      stormboy_era: stormboyEraRate,
      pre_stormboy: preStormboyRate,
      launch_date: STORMBOY_LAUNCH_DATE,
      note: 'Direct deals only (excludes partner=LawrieCo). Measures deals entering the default sales pipeline per week, normalised across periods of different lengths.',
    },
    caveats: [
      'Cohort comparison, not randomised assignment. Stormboy deals are selected by the campaign, so selection effects matter.',
      'Same time window for both cohorts so macro shifts (carbon market, regulation) affect both equally.',
      'Hectares uses estimated_project_ha when present, else total_property_hectares as fallback.',
      'Days-to-close measured from createdate to closedate. Deals created pre-Stormboy that closed post-Stormboy still attribute to whichever cohort their contacts belong to.',
    ],
    from_cache: false,
  };

  writeCache(result);
  return result;
}

module.exports = { run };
