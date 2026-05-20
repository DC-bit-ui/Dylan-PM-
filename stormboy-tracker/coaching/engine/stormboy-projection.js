/**
 * 30k hectare projection — Section 5 of the STATS redesign.
 *
 * Queries HubSpot directly for won deals since 2026-04-27 (target-set
 * anchor — matches the dashboard header tile, which is the leadership
 * artefact for the 30k goal). Sums total_property_hectares for parity.
 *
 * INCLUDES all channels (LawrieCo + direct + Stormboy) because the 30k
 * target is an all-channel leadership goal, not a Stormboy-only target.
 * The Section 1 hero already carves out LawrieCo for efficacy analysis;
 * this section answers a different question — "will the company hit
 * the number?".
 *
 * Computes:
 *   - Hectares registered since 2026-04-27 (parity with header tile)
 *   - Recent pace — 4wk and 12wk trailing averages
 *   - Projected hit dates at each pace
 *   - Pace needed to hit by FY-end (30 Jun 2026)
 *
 * 4h disk cache.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const WON_STAGE = '231921676';
const TARGET_HECTARES = 30000;
const TARGET_SET_DATE = '2026-04-27T00:00:00Z';
const FY_END_DATE = '2026-06-30T00:00:00Z';
const SHORT_WINDOW_WEEKS = 4;
const LONG_WINDOW_WEEKS = 12;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'stormboy-projection.json');
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

// Fetch won deals closed since the target-set date so we can compute
// both the total and the recent pace from a single pass.
async function fetchWonDealsSince(token, sinceIso) {
  const sinceMs = Date.parse(sinceIso);
  const deals = [];
  let after;
  while (deals.length < 5000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'dealstage', operator: 'EQ', value: WON_STAGE },
          { propertyName: 'closedate', operator: 'GTE', value: String(sinceMs) },
        ],
      }],
      properties: ['dealname', 'closedate', 'partner', 'total_property_hectares', 'estimated_project_ha'],
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
  } catch (e) { console.error('[stormboy-projection] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // Pull won deals from the longer of (target-set date) and (long-window worth ago)
  // so we have enough history for the 12-week pace.
  const longWindowStart = Date.now() - LONG_WINDOW_WEEKS * WEEK_MS;
  const fetchSince = Math.min(Date.parse(TARGET_SET_DATE), longWindowStart);
  const fetchSinceIso = new Date(fetchSince).toISOString();

  const deals = await fetchWonDealsSince(token, fetchSinceIso);
  console.log(`[stormboy-projection] ${deals.length} won deals since ${fetchSinceIso.slice(0, 10)}`);

  const num = (v) => parseFloat(v || '0') || 0;
  const anchorMs = Date.parse(TARGET_SET_DATE);
  const shortStartMs = Date.now() - SHORT_WINDOW_WEEKS * WEEK_MS;
  const longStartMs = Date.now() - LONG_WINDOW_WEEKS * WEEK_MS;

  let registeredHa = 0;
  let shortHa = 0;
  let longHa = 0;

  // Use estimated_project_ha for parity with the dashboard header tile
  // (work-header-stats.js → project_ha_since_target). The 30k target is
  // about project area (the area actually enrolled in the carbon
  // project), not the farmer's total property — typical farms enrol a
  // fraction of their property hectares.
  deals.forEach(d => {
    const closeMs = Date.parse(d.properties.closedate);
    if (!closeMs) return;
    const ha = num(d.properties.estimated_project_ha);
    if (closeMs >= anchorMs) registeredHa += ha;
    if (closeMs >= shortStartMs) shortHa += ha;
    if (closeMs >= longStartMs) longHa += ha;
  });

  const remainingHa = Math.max(0, TARGET_HECTARES - registeredHa);
  const pctOfTarget = TARGET_HECTARES > 0 ? (registeredHa / TARGET_HECTARES) * 100 : 0;

  // Pace = avg ha/week over each window
  const weeksSinceAnchor = Math.max(1, Math.ceil((Date.now() - anchorMs) / WEEK_MS));
  const paceSinceAnchor = registeredHa / weeksSinceAnchor;
  const paceShort = shortHa / SHORT_WINDOW_WEEKS;
  const paceLong = longHa / LONG_WINDOW_WEEKS;

  function projectDate(weeklyHa) {
    if (!weeklyHa || weeklyHa <= 0) return null;
    const weeksToHit = remainingHa / weeklyHa;
    return new Date(Date.now() + weeksToHit * WEEK_MS).toISOString().slice(0, 10);
  }
  function weeksToHit(weeklyHa) {
    if (!weeklyHa || weeklyHa <= 0) return null;
    return Math.ceil(remainingHa / weeklyHa);
  }

  const weeksToFy = Math.max(1, Math.ceil((Date.parse(FY_END_DATE) - Date.now()) / WEEK_MS));
  const paceNeededFy = remainingHa / weeksToFy;

  const result = {
    generated_at: new Date().toISOString(),
    target_hectares: TARGET_HECTARES,
    target_set_date: TARGET_SET_DATE.slice(0, 10),
    registered_hectares: Math.round(registeredHa),
    remaining_hectares: Math.round(remainingHa),
    pct_of_target: Math.round(pctOfTarget * 10) / 10,
    weeks_since_anchor: weeksSinceAnchor,
    pace: {
      since_anchor_weekly_ha: Math.round(paceSinceAnchor),
      short_window_weeks: SHORT_WINDOW_WEEKS,
      short_window_weekly_ha: Math.round(paceShort),
      long_window_weeks: LONG_WINDOW_WEEKS,
      long_window_weekly_ha: Math.round(paceLong),
      needed_weekly_ha_by_fy_end: Math.round(paceNeededFy),
      weeks_to_fy_end: weeksToFy,
    },
    projection: {
      at_short_pace: { weeks_to_hit: weeksToHit(paceShort), eta: projectDate(paceShort) },
      at_long_pace:  { weeks_to_hit: weeksToHit(paceLong),  eta: projectDate(paceLong) },
      at_since_anchor_pace: { weeks_to_hit: weeksToHit(paceSinceAnchor), eta: projectDate(paceSinceAnchor) },
      fy_end_target_date: FY_END_DATE.slice(0, 10),
    },
    caveats: [
      `Total uses estimated_project_ha for won deals since ${TARGET_SET_DATE.slice(0,10)} — same property as the header-tile "Registered" metric (project area, not total property area). Includes ALL channels (direct + Stormboy + LawrieCo) because 30k is the company target, not Stormboy-only.`,
      `Projection assumes linear extrapolation from recent pace. Real growth is non-linear; ${LONG_WINDOW_WEEKS}-week pace is the smoothed line, ${SHORT_WINDOW_WEEKS}-week pace is recent-momentum sanity check.`,
      `If a window has zero won deals, projected ETA at that pace is null (would be "never" at zero pace).`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
