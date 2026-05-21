/**
 * Property-size × cycle-time × win-rate correlation analysis.
 *
 * Tests the hypothesis: "do larger prospects take longer to convert
 * and require more touches?" The actual signal in AgriProve's data
 * is more nuanced — medium-sized properties (200-1k ha) are the
 * sweet spot for win rate but take the longest cycle time.
 *
 * Buckets by estimated_project_ha:
 *   - Small      (<200 ha)
 *   - Medium     (200-1k ha)
 *   - Large      (1k-3k ha)
 *   - Very large (3k+ ha)
 *
 * For each bucket:
 *   - Sample size (closed deals)
 *   - Win count + win rate
 *   - Median + p75 cycle time (days_to_close)
 *   - Median + p75 hectares (size within bucket)
 *
 * Excludes LawrieCo (partner channel — different motion entirely).
 *
 * 24-month window from now.
 *
 * 1-hour disk cache; ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'property-size-insights.json');
const CACHE_TTL_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MONTHS = 24;

const SIZE_BUCKETS = [
  { key: 'small',      label: 'Small',      sub: '<200 ha',       min: 0,    max: 200    },
  { key: 'medium',     label: 'Medium',     sub: '200-1,000 ha',  min: 200,  max: 1000   },
  { key: 'large',      label: 'Large',      sub: '1,000-3,000 ha', min: 1000, max: 3000  },
  { key: 'very_large', label: 'Very large', sub: '3,000+ ha',     min: 3000, max: Infinity },
];

const WON_STAGE = '231921676';
const LOST_STAGE = 'closedlost';

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}`);
  return res.json();
}

async function fetchClosedDeals(token, sinceMs) {
  const out = [];
  for (const stage of [WON_STAGE, LOST_STAGE]) {
    let after;
    while (out.length < 10000) {
      const body = {
        filterGroups: [{ filters: [
          { propertyName: 'dealstage',           operator: 'EQ',  value: stage },
          { propertyName: 'closedate',           operator: 'GTE', value: String(sinceMs) },
          { propertyName: 'estimated_project_ha', operator: 'HAS_PROPERTY' },
        ]}],
        properties: ['dealname', 'dealstage', 'createdate', 'closedate', 'partner',
                     'estimated_project_ha', 'total_property_hectares'],
        sorts: [{ propertyName: 'closedate', direction: 'DESCENDING' }],
        limit: 100,
      };
      if (after) body.after = after;
      const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
      out.push(...(page.results || []));
      after = page.paging && page.paging.next && page.paging.next.after;
      if (!after) break;
    }
  }
  return out;
}

function pct(arr, p) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(p * (s.length - 1))];
}
const median = (arr) => pct(arr, 0.5);

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
  } catch (e) { console.error('[property-size-insights] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const sinceMs = Date.now() - WINDOW_MONTHS * 30 * DAY_MS;
  const deals = await fetchClosedDeals(token, sinceMs);

  // Filter: exclude LawrieCo, require valid cycle + project_ha
  const cleaned = deals
    .map(d => {
      const p = d.properties;
      const projectHa = parseFloat(p.estimated_project_ha || 0) || 0;
      const propertyHa = parseFloat(p.total_property_hectares || 0) || 0;
      const created = Date.parse(p.createdate || 0);
      const closed = Date.parse(p.closedate || 0);
      const days = (closed - created) / DAY_MS;
      return {
        id: d.id, name: p.dealname,
        won: p.dealstage === WON_STAGE,
        project_ha: projectHa,
        property_ha: propertyHa,
        days_to_close: Math.round(days),
        partner: (p.partner || '').trim(),
      };
    })
    .filter(d => d.partner !== 'LawrieCo')
    .filter(d => d.project_ha > 0)
    .filter(d => d.days_to_close > 0 && d.days_to_close < 1500); // sanity bounds

  console.log(`[property-size-insights] ${cleaned.length} closed deals (LawrieCo excluded) with project_ha + valid cycle`);

  const buckets = SIZE_BUCKETS.map(b => {
    const subset = cleaned.filter(d => d.project_ha >= b.min && d.project_ha < b.max);
    const won = subset.filter(d => d.won);
    const cycles = subset.map(d => d.days_to_close);
    const sizes = subset.map(d => d.project_ha);
    return {
      key: b.key,
      label: b.label,
      sub: b.sub,
      bounds: { min: b.min, max: b.max === Infinity ? null : b.max },
      n: subset.length,
      won: won.length,
      lost: subset.length - won.length,
      win_rate_pct: subset.length > 0 ? Math.round((won.length / subset.length) * 1000) / 10 : null,
      median_cycle_d: median(cycles) || null,
      p75_cycle_d: pct(cycles, 0.75) || null,
      median_size_ha: median(sizes) ? Math.round(median(sizes)) : null,
      total_hectares_won: Math.round(won.reduce((s, d) => s + d.project_ha, 0)),
    };
  });

  // Identify the sweet spot — highest win rate × non-trivial volume
  let sweetSpot = null;
  buckets.forEach(b => {
    if (b.n < 10) return;
    if (!sweetSpot || (b.win_rate_pct > sweetSpot.win_rate_pct)) sweetSpot = b;
  });

  // Identify the worst bucket (lowest win rate, non-trivial volume)
  let worstBucket = null;
  buckets.forEach(b => {
    if (b.n < 10) return;
    if (!worstBucket || (b.win_rate_pct < worstBucket.win_rate_pct)) worstBucket = b;
  });

  // Headline narrative
  let headline;
  if (sweetSpot && worstBucket && sweetSpot.key !== worstBucket.key &&
      sweetSpot.win_rate_pct - worstBucket.win_rate_pct > 8) {
    headline = `${sweetSpot.label} properties (${sweetSpot.sub}) are the sweet spot: ${sweetSpot.win_rate_pct}% win rate — vs ${worstBucket.win_rate_pct}% for ${worstBucket.label.toLowerCase()} (${worstBucket.sub}).`;
  } else {
    headline = `Win rate is roughly even across size buckets — property size isn't a strong discriminator in current data.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    window_months: WINDOW_MONTHS,
    total_closed_deals: cleaned.length,
    excluded: 'LawrieCo deals (partner channel — different motion)',
    buckets,
    sweet_spot: sweetSpot,
    worst_bucket: worstBucket,
    headline,
    caveats: [
      `Window: last ${WINDOW_MONTHS} months of closed deals. Cycle = closedate - createdate.`,
      `Bucketed by estimated_project_ha (the area enrolled in the carbon project, not the farmer's total property — typical project is 30-50% of property).`,
      `Excludes LawrieCo partner deals (different motion, dominates the win-rate signal otherwise).`,
      `Sample size matters: buckets with n<10 excluded from the sweet-spot/worst comparison.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
