/**
 * Stormboy trajectory — time-series for STATS Section 3.
 *
 * Pulls closed deals in a window (default 24mo so there's enough pre-
 * Stormboy data to see the inflection), groups by close-week, computes
 * a trailing 12-week running win rate, weekly hectares enrolled, and
 * weekly direct-deal pipeline entries (createdate-based). The Stormboy
 * launch date annotation is included so the chart can mark the
 * inflection visually.
 *
 * LawrieCo excluded from the running win rate so the trajectory
 * reflects direct/Stormboy performance — same isolation as the era
 * comparison and the hero efficacy tile.
 *
 * Cache: 4h disk. ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const WON_STAGE = '231921676';
const LOST_STAGE = 'closedlost';
const STORMBOY_LAUNCH_DATE = '2026-01-13';
const DEFAULT_WINDOW_MONTHS = 24;
const ROLLING_WINDOW_WEEKS = 12;
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'stormboy-trajectory.json');
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
                   'partner', 'lead_source', 'estimated_project_ha', 'total_property_hectares'],
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
      properties: ['dealname', 'createdate', 'partner'],
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

// Snap a timestamp to the start of its ISO week (Monday 00:00 UTC).
function weekStart(ms) {
  const d = new Date(ms);
  const day = d.getUTCDay();         // 0=Sun, 1=Mon ... 6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}
function weekKey(ms) {
  return new Date(weekStart(ms)).toISOString().slice(0, 10);
}

function buildWeekBuckets(sinceMs, untilMs) {
  const buckets = {};
  let cursor = weekStart(sinceMs);
  const end = weekStart(untilMs);
  while (cursor <= end) {
    buckets[new Date(cursor).toISOString().slice(0, 10)] = {
      week_start: new Date(cursor).toISOString().slice(0, 10),
      won: 0, lost: 0,
      hectares: 0,             // estimated_project_ha (project area)
      property_hectares: 0,    // total_property_hectares (parity with header tile)
      direct_pipeline_entries: 0,
    };
    cursor += WEEK_MS;
  }
  return buckets;
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
  } catch (e) { console.error('[stormboy-trajectory] cache write failed:', e.message); }
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
  console.log(`[stormboy-trajectory] ${new Date(sinceMs).toISOString().slice(0,10)} → ${new Date(untilMs).toISOString().slice(0,10)}`);

  const [won, lost, entries] = await Promise.all([
    fetchClosedDealsInWindow(token, sinceMs, untilMs, WON_STAGE),
    fetchClosedDealsInWindow(token, sinceMs, untilMs, LOST_STAGE),
    fetchPipelineEntries(token, sinceMs, untilMs),
  ]);
  console.log(`[stormboy-trajectory] ${won.length} won + ${lost.length} lost + ${entries.length} pipeline entries`);

  const buckets = buildWeekBuckets(sinceMs, untilMs);
  // Closed deals (LawrieCo excluded so trajectory reflects direct/Stormboy)
  [...won, ...lost].forEach(d => {
    const p = d.properties;
    if ((p.partner || '').trim() === 'LawrieCo') return;
    const closed = Date.parse(p.closedate || '');
    if (!closed) return;
    const wk = weekKey(closed);
    if (!buckets[wk]) return;
    if (p.dealstage === WON_STAGE) {
      buckets[wk].won++;
      const projHa = parseFloat(p.estimated_project_ha || p.total_property_hectares || '0') || 0;
      const propHa = parseFloat(p.total_property_hectares || '0') || 0;
      buckets[wk].hectares += projHa;
      buckets[wk].property_hectares += propHa;
    } else if (p.dealstage === LOST_STAGE) {
      buckets[wk].lost++;
    }
  });
  // Pipeline entries (direct only, LawrieCo excluded)
  entries.forEach(d => {
    const p = d.properties;
    if ((p.partner || '').trim() === 'LawrieCo') return;
    const created = Date.parse(p.createdate || '');
    if (!created) return;
    const wk = weekKey(created);
    if (!buckets[wk]) return;
    buckets[wk].direct_pipeline_entries++;
  });

  const weeks = Object.values(buckets).sort((a, b) => a.week_start.localeCompare(b.week_start));

  // Trailing 12-week running win rate per week
  for (let i = 0; i < weeks.length; i++) {
    let won = 0, lost = 0;
    const start = Math.max(0, i - (ROLLING_WINDOW_WEEKS - 1));
    for (let j = start; j <= i; j++) {
      won += weeks[j].won;
      lost += weeks[j].lost;
    }
    const tot = won + lost;
    weeks[i].rolling_win_rate_pct = tot === 0 ? null : Math.round((won / tot) * 1000) / 10;
    weeks[i].rolling_closed = tot;
    weeks[i].rolling_won = won;
  }

  const result = {
    generated_at: new Date().toISOString(),
    window: { months, since_iso: new Date(sinceMs).toISOString(), until_iso: new Date(untilMs).toISOString() },
    stormboy_launch_date: STORMBOY_LAUNCH_DATE,
    rolling_window_weeks: ROLLING_WINDOW_WEEKS,
    weeks,
    caveats: [
      `LawrieCo deals excluded from all series so the trajectory reflects direct/Stormboy performance (LawrieCo's ~3x faster close + 84% win rate would dominate otherwise).`,
      `Hectares uses estimated_project_ha when present, else total_property_hectares fallback.`,
      `Trailing ${ROLLING_WINDOW_WEEKS}-week running win rate smooths weekly noise. Early weeks (first ${ROLLING_WINDOW_WEEKS}) have smaller effective sample.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
