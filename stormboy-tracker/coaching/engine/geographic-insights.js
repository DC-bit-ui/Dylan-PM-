/**
 * Geographic insights — NRM region performance for AgriProve.
 *
 * Replaced the state-level v1 (2026-05-21 — Dylan: "State level signal
 * is definitely not enough — NRM is requirement"). NRM region is the
 * granularity that aligns with carbon-project targeting decisions:
 * each NRM body covers a relatively homogeneous agricultural land
 * type (rangelands, wheatbelt, high-rainfall pasture, etc.) which
 * predicts soil-carbon project viability.
 *
 * Data source: deal-level `postal_code` (HubSpot property, populated
 * for ~140 deals on 2026-05-21). Postcode → NRM mapping via
 * nrm-regions.js (curated AU lookup — accurate at region centres,
 * fuzzy at LGA-edge boundaries).
 *
 * Per NRM region:
 *   - Closed deals count
 *   - Wins + losses + win rate
 *   - Median cycle time
 *   - Total hectares enrolled (sum of project_ha for won deals)
 *   - Active deals (open pipeline) — count + hectares in play
 *
 * Where deal postcode is missing, falls back to the associated
 * contact's postal_code (if any contact in the deal has one).
 *
 * Excludes LawrieCo (partner channel — different motion entirely).
 *
 * 1-hour disk cache; ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');
const { postcodeToNRM, normalizePostcode } = require('./nrm-regions');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'geographic-insights.json');
const CACHE_TTL_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MONTHS = 24;

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}`);
  return res.json();
}

// Fetch deals (closed + open) in window with all geographic + size fields
async function fetchDealsInWindow(token, sinceMs) {
  const out = [];
  // Closed (won + lost)
  for (const stage of ['231921676', 'closedlost']) {
    let after;
    while (out.length < 10000) {
      const body = {
        filterGroups: [{ filters: [
          { propertyName: 'dealstage', operator: 'EQ',  value: stage },
          { propertyName: 'closedate', operator: 'GTE', value: String(sinceMs) },
        ]}],
        properties: ['dealname', 'dealstage', 'createdate', 'closedate', 'partner',
                     'estimated_project_ha', 'total_property_hectares',
                     'postal_code', 'street_address', 'address', 'region',
                     'cecil_address'],
        limit: 100,
      };
      if (after) body.after = after;
      const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
      out.push(...(page.results || []));
      after = page.paging && page.paging.next && page.paging.next.after;
      if (!after) break;
    }
  }
  // Active (open) — narrower property set
  let after;
  while (out.length < 15000) {
    const body = {
      filterGroups: [{ filters: [
        { propertyName: 'pipeline', operator: 'EQ', value: 'default' },
        { propertyName: 'dealstage', operator: 'IN', values: ['64066367','2929183214','64066368','64066369','1026535686'] },
      ]}],
      properties: ['dealname', 'dealstage', 'createdate', 'partner',
                   'estimated_project_ha', 'postal_code', 'street_address'],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
    out.push(...(page.results || []).map(d => ({ ...d, __open: true })));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return out;
}

// For deals without postcode, fall back to associated contact's postcode
async function fetchDealContacts(token, dealIds) {
  if (!dealIds.length) return {};
  const map = {};
  for (let i = 0; i < dealIds.length; i += 100) {
    const batch = dealIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v4/associations/deals/contacts/batch/read', {
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(r => {
        const fromId = r.from && r.from.id;
        if (!fromId) return;
        map[fromId] = (r.to || []).map(t => String(t.toObjectId));
      });
    } catch (e) {
      console.warn('[geographic-insights] deal→contact assoc batch failed:', e.message);
    }
  }
  return map;
}
async function fetchContactPostcodes(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const batch = contactIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v3/objects/contacts/batch/read', {
        properties: ['zip', 'postal_code', 'address'],
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(c => {
        const pc = normalizePostcode(c.properties.zip || c.properties.postal_code);
        if (pc) map[c.id] = pc;
      });
    } catch (e) {
      console.warn('[geographic-insights] contact batch read failed:', e.message);
    }
  }
  return map;
}

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const c = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (Date.now() - Date.parse(c.generated_at) > CACHE_TTL_MS) return null;
    return c;
  } catch (_) { return null; }
}
function writeCache(obj) {
  try {
    const tmp = CACHE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, CACHE_PATH);
  } catch (e) { console.error('[geographic-insights] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const sinceMs = Date.now() - WINDOW_MONTHS * 30 * DAY_MS;
  const deals = await fetchDealsInWindow(token, sinceMs);
  console.log(`[geographic-insights] ${deals.length} deals fetched (closed + open)`);

  // Try direct postcode first. For deals without one, batch-fall-back
  // to contact postcode.
  const fallbackDealIds = deals
    .filter(d => !normalizePostcode(d.properties.postal_code))
    .map(d => d.id);
  const fallbackAssoc = await fetchDealContacts(token, fallbackDealIds);
  const allFallbackContactIds = Array.from(new Set(Object.values(fallbackAssoc).flat()));
  const contactPostcodes = await fetchContactPostcodes(token, allFallbackContactIds);

  // Build region buckets
  const buckets = {};
  let totalDeals = 0;
  let dealsWithRegion = 0;
  let dealsWithoutAnyPostcode = 0;

  function ensureRegion(key, name, state) {
    if (!buckets[key]) {
      buckets[key] = {
        key, name, state,
        closed_count: 0, won: 0, lost: 0,
        open_count: 0,
        cycle_days: [],
        won_hectares: 0,
        open_hectares: 0,
        sample_won: [],   // names for tooltip
      };
    }
    return buckets[key];
  }

  deals.forEach(d => {
    if ((d.properties.partner || '').trim() === 'LawrieCo') return;
    totalDeals++;
    let pc = normalizePostcode(d.properties.postal_code);
    if (!pc) {
      // Try associated contacts
      const cids = fallbackAssoc[d.id] || [];
      for (const cid of cids) {
        if (contactPostcodes[cid]) { pc = contactPostcodes[cid]; break; }
      }
    }
    if (!pc) { dealsWithoutAnyPostcode++; return; }
    const nrm = postcodeToNRM(pc);
    if (!nrm) return;
    dealsWithRegion++;
    const key = nrm.state + '|' + nrm.name;
    const b = ensureRegion(key, nrm.name, nrm.state);
    const p = d.properties;
    const projHa = parseFloat(p.estimated_project_ha || 0) || 0;

    if (d.__open) {
      b.open_count++;
      b.open_hectares += projHa;
    } else if (p.dealstage === '231921676') {
      b.won++;
      b.closed_count++;
      b.won_hectares += projHa;
      if (b.sample_won.length < 3 && p.dealname) {
        b.sample_won.push(p.dealname.slice(0, 40));
      }
      const created = Date.parse(p.createdate || 0);
      const closed = Date.parse(p.closedate || 0);
      if (created && closed && closed > created) {
        b.cycle_days.push((closed - created) / DAY_MS);
      }
    } else {
      b.lost++;
      b.closed_count++;
    }
  });

  // Build output array, sorted by hectares won desc (then by deal count)
  const regions = Object.values(buckets).map(b => ({
    nrm_region: b.name,
    state: b.state,
    closed_deals: b.closed_count,
    won: b.won,
    lost: b.lost,
    win_rate_pct: b.closed_count > 0 ? Math.round((b.won / b.closed_count) * 1000) / 10 : null,
    median_cycle_d: median(b.cycle_days) ? Math.round(median(b.cycle_days)) : null,
    won_hectares: Math.round(b.won_hectares),
    open_deals: b.open_count,
    open_hectares: Math.round(b.open_hectares),
    sample_won_deals: b.sample_won,
  }));
  regions.sort((a, b) => {
    if (b.won_hectares !== a.won_hectares) return b.won_hectares - a.won_hectares;
    return b.closed_deals - a.closed_deals;
  });

  // Top performer / weakest performer (by win rate, requires material n)
  const materialRegions = regions.filter(r => r.closed_deals >= 5);
  const topWin = materialRegions.slice().sort((a, b) => b.win_rate_pct - a.win_rate_pct)[0];
  const weakestWin = materialRegions.slice().sort((a, b) => a.win_rate_pct - b.win_rate_pct)[0];
  const topHectares = regions[0];

  // Headline narrative
  let headline;
  if (topHectares && topWin) {
    const lead = `${topHectares.nrm_region} (${topHectares.state}) leads in hectares enrolled (${topHectares.won_hectares.toLocaleString()} ha across ${topHectares.won} wins).`;
    const best = (topWin && topWin.win_rate_pct >= 25)
      ? ` ${topWin.nrm_region} has the strongest win rate (${topWin.win_rate_pct}% on ${topWin.closed_deals} closed).`
      : '';
    headline = lead + best;
  } else if (dealsWithRegion < 10) {
    headline = `Only ${dealsWithRegion} deals have a usable postcode — too thin for regional signal. Push CRM hygiene to populate postal_code on more deals.`;
  } else {
    headline = `NRM-region distribution computed across ${dealsWithRegion} deals.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    window_months: WINDOW_MONTHS,
    total_deals_in_window: totalDeals,
    deals_with_region: dealsWithRegion,
    deals_without_any_postcode: dealsWithoutAnyPostcode,
    pct_with_region: totalDeals > 0 ? Math.round((dealsWithRegion / totalDeals) * 1000) / 10 : 0,
    regions,
    top_performer_by_hectares: topHectares,
    top_performer_by_win_rate: topWin,
    weakest_performer: weakestWin,
    headline,
    caveats: [
      `${dealsWithRegion}/${totalDeals} (${totalDeals > 0 ? Math.round((dealsWithRegion/totalDeals)*100) : 0}%) of deals have a usable postcode (or one inherited from an associated contact). Improve coverage by populating deal-level postal_code on remaining ${dealsWithoutAnyPostcode}.`,
      `NRM region inferred via postcode → AU NRM lookup. Boundaries are approximate (NRM regions follow LGA lines, not postcodes; ~20% of postcodes straddle two regions and are attributed to the agriculturally dominant one).`,
      `Excludes LawrieCo (partner-channel — different motion entirely).`,
      `"Won hectares" sums estimated_project_ha for won deals; for partial-postcode-coverage regions, the totals are LOWER bounds on actual enrolment.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
