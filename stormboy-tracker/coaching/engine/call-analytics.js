/**
 * Call analytics engine — extends call-efficiency.js with:
 *   - Outcome breakdown (Connected / Voicemail / No answer / Busy /
 *     Wrong number / Left live message) per rep + per week
 *   - Connect rate (Connected / total) per rep + per week
 *   - Time-of-day × day-of-week heat map of connect counts (and
 *     connect rate per cell)
 *   - Per-rep daily leaderboard with rolling 30-day window
 *   - Call duration distribution among connected calls
 *
 * Built on the HubSpot call engagement object — Aircall already syncs
 * hs_call_disposition + hs_call_duration + hs_connected_count into
 * HubSpot, so no direct Aircall integration is needed.
 *
 * Disposition UUID → label map fetched once per process via the
 * /calling/v1/dispositions endpoint, then cached. Stable across the
 * AgriProve account.
 *
 * 30-min disk cache (Stormboy team activity churns intra-day, so
 * shorter than the 4h used by other stats engines).
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'call-analytics.json');
const CACHE_TTL_MS = 30 * 60 * 1000;
const WINDOW_DAYS = 90;
const ROLLING_LEADERBOARD_DAYS = 30;

const TEAM_OWNERS = {
  '76812243':  { name: 'Ben',     is_sales_rep: true },
  '78272376':  { name: 'Claudia', is_sales_rep: true },
  '361236574': { name: 'Hobbs',   is_sales_rep: true },
  '361823546': { name: 'Will',    is_sales_rep: false },
};

let _dispositionMapCache = null;

async function hubspotGet(token, urlPath) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${urlPath} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

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

async function loadDispositionMap(token) {
  if (_dispositionMapCache) return _dispositionMapCache;
  const data = await hubspotGet(token, '/calling/v1/dispositions');
  const map = {};
  (data || []).forEach(d => { if (!d.deleted) map[d.id] = d.label; });
  _dispositionMapCache = map;
  return map;
}

async function fetchTeamCalls(token, sinceMs) {
  const ownerIds = Object.keys(TEAM_OWNERS);
  const all = [];
  let after;
  while (all.length < 20000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: String(sinceMs) },
          { propertyName: 'hubspot_owner_id', operator: 'IN', values: ownerIds },
          { propertyName: 'hs_call_direction', operator: 'EQ', value: 'OUTBOUND' },
        ],
      }],
      sorts: [{ propertyName: 'hs_timestamp', direction: 'DESCENDING' }],
      properties: ['hs_timestamp', 'hs_call_disposition', 'hs_call_status',
                   'hs_call_duration', 'hs_connected_count',
                   'hubspot_owner_id', 'hs_call_direction'],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/calls/search', body);
    all.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return all;
}

function isoDay(ms)   { return new Date(ms).toISOString().slice(0, 10); }
function isoWeek(ms)  {
  const d = new Date(ms);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
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
  } catch (e) { console.error('[call-analytics] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return { ...cached, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const dispMap = await loadDispositionMap(token);
  const sinceMs = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const calls = await fetchTeamCalls(token, sinceMs);
  console.log(`[call-analytics] ${calls.length} team outbound calls in last ${WINDOW_DAYS}d`);

  // Roll-up containers
  const totalByOutcome = {};                           // outcome → count
  const byRep = {};                                    // ownerId → { name, total, byOutcome, connectedDurations[], dailyCounts }
  const byWeek = {};                                   // weekStart → { total, connected, voicemail, no_answer, ... }
  const hourDayGrid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ total: 0, connected: 0 })));
  const durationsConnected = [];

  function ensureRep(id) {
    if (!byRep[id]) {
      byRep[id] = {
        owner_id: id,
        name: (TEAM_OWNERS[id] || {}).name || id,
        is_sales_rep: !!(TEAM_OWNERS[id] && TEAM_OWNERS[id].is_sales_rep),
        total: 0,
        connected: 0,
        by_outcome: {},
        connected_durations_s: [],
        daily: {},
        rolling_30d: 0,
      };
    }
    return byRep[id];
  }

  const rolling30Cutoff = Date.now() - ROLLING_LEADERBOARD_DAYS * 24 * 60 * 60 * 1000;

  calls.forEach(c => {
    const p = c.properties;
    const ts = Date.parse(p.hs_timestamp || 0);
    if (!ts) return;
    const ownerId = p.hubspot_owner_id || '(unowned)';
    const dispId = p.hs_call_disposition || '';
    const outcome = dispMap[dispId] || (dispId ? '(unknown)' : '(no outcome)');
    const connected = outcome === 'Connected';
    const durMs = Number(p.hs_call_duration) || 0;
    const durS = Math.round(durMs / 1000);

    totalByOutcome[outcome] = (totalByOutcome[outcome] || 0) + 1;

    const rep = ensureRep(ownerId);
    rep.total++;
    if (connected) {
      rep.connected++;
      if (durS > 0) rep.connected_durations_s.push(durS);
      durationsConnected.push(durS);
    }
    rep.by_outcome[outcome] = (rep.by_outcome[outcome] || 0) + 1;
    const day = isoDay(ts);
    rep.daily[day] = (rep.daily[day] || 0) + 1;
    if (ts >= rolling30Cutoff) rep.rolling_30d++;

    const wk = isoWeek(ts);
    if (!byWeek[wk]) byWeek[wk] = { week_start: wk, total: 0, connected: 0, by_outcome: {} };
    byWeek[wk].total++;
    if (connected) byWeek[wk].connected++;
    byWeek[wk].by_outcome[outcome] = (byWeek[wk].by_outcome[outcome] || 0) + 1;

    // Heat map: day of week (0=Mon..6=Sun in AEST since Aircall traffic is Australian)
    const date = new Date(ts);
    // Convert to AEST (UTC+10) — Will's team works in AEST
    const aest = new Date(ts + 10 * 60 * 60 * 1000);
    let dow = aest.getUTCDay();    // 0=Sun..6=Sat
    dow = dow === 0 ? 6 : dow - 1; // shift to 0=Mon..6=Sun
    const hr = aest.getUTCHours();
    hourDayGrid[dow][hr].total++;
    if (connected) hourDayGrid[dow][hr].connected++;
  });

  // Compute derived stats per rep
  const repsArray = Object.values(byRep).map(r => {
    const connectRate = r.total > 0 ? r.connected / r.total : null;
    r.connected_durations_s.sort((a, b) => a - b);
    const median = r.connected_durations_s.length
      ? r.connected_durations_s[Math.floor(r.connected_durations_s.length / 2)]
      : null;
    return {
      owner_id: r.owner_id,
      name: r.name,
      is_sales_rep: r.is_sales_rep,
      total_calls: r.total,
      connected: r.connected,
      connect_rate_pct: connectRate != null ? Math.round(connectRate * 1000) / 10 : null,
      by_outcome: r.by_outcome,
      median_connected_duration_s: median,
      daily: r.daily,
      rolling_30d_calls: r.rolling_30d,
      rolling_30d_per_day: Math.round((r.rolling_30d / ROLLING_LEADERBOARD_DAYS) * 10) / 10,
    };
  }).sort((a, b) => b.rolling_30d_calls - a.rolling_30d_calls);

  // Weekly rollup with connect-rate derived
  const weeksArray = Object.values(byWeek)
    .sort((a, b) => a.week_start.localeCompare(b.week_start))
    .map(w => ({
      ...w,
      connect_rate_pct: w.total > 0 ? Math.round((w.connected / w.total) * 1000) / 10 : null,
    }));

  // Heat-map summary: flatten and surface the peak connect-rate hours
  const cells = [];
  const dowNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const cell = hourDayGrid[d][h];
      cells.push({
        day_of_week: d, day_label: dowNames[d], hour_aest: h,
        total: cell.total, connected: cell.connected,
        connect_rate_pct: cell.total > 0 ? Math.round((cell.connected / cell.total) * 1000) / 10 : null,
      });
    }
  }
  // "Best windows" — top 5 hour-day cells with at least 10 calls (sample threshold)
  const bestWindows = cells
    .filter(c => c.total >= 10 && c.connect_rate_pct != null)
    .sort((a, b) => b.connect_rate_pct - a.connect_rate_pct)
    .slice(0, 5);

  // Duration distribution among connected calls
  durationsConnected.sort((a, b) => a - b);
  function pct(arr, p) {
    if (!arr.length) return null;
    const i = Math.floor(p * (arr.length - 1));
    return arr[i];
  }
  const durationStats = durationsConnected.length ? {
    n: durationsConnected.length,
    p25_s: pct(durationsConnected, 0.25),
    median_s: pct(durationsConnected, 0.5),
    p75_s: pct(durationsConnected, 0.75),
    p90_s: pct(durationsConnected, 0.9),
    max_s: durationsConnected[durationsConnected.length - 1],
  } : null;

  const totalCalls = calls.length;
  const totalConnected = repsArray.reduce((s, r) => s + r.connected, 0);

  const result = {
    generated_at: new Date().toISOString(),
    window_days: WINDOW_DAYS,
    timezone: 'AEST (UTC+10)',
    totals: {
      calls: totalCalls,
      connected: totalConnected,
      connect_rate_pct: totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 1000) / 10 : null,
      by_outcome: totalByOutcome,
    },
    by_rep: repsArray,
    weekly: weeksArray,
    heatmap: {
      grid: hourDayGrid.map((row, d) => ({
        day_label: dowNames[d],
        hours: row.map((cell, h) => ({
          hour: h,
          total: cell.total,
          connected: cell.connected,
          connect_rate_pct: cell.total > 0 ? Math.round((cell.connected / cell.total) * 1000) / 10 : null,
        })),
      })),
      best_windows: bestWindows,
    },
    duration_connected_s: durationStats,
    leaderboard_30d: repsArray.map(r => ({
      name: r.name, owner_id: r.owner_id,
      calls: r.rolling_30d_calls,
      per_day: r.rolling_30d_per_day,
      connect_rate_pct: r.connect_rate_pct,
      is_sales_rep: r.is_sales_rep,
    })),
    caveats: [
      `Outbound calls only by Stormboy team owners (Ben, Claudia, Hobbs, Will).`,
      `Outcome = HubSpot hs_call_disposition (synced from Aircall). "Connected" maps to the answered-call disposition; system statuses like NO_ANSWER are exposed via outcome too.`,
      `Heat map uses AEST (UTC+10) regardless of where reps are located. Sample-size threshold of 10 calls per hour-cell for "best windows" — sparser cells excluded.`,
      `Rolling-30d leaderboard counts all outbound team calls; per-day = calls / 30. Will is included for visibility but flagged is_sales_rep=false so the dashboard can filter him from sales-rep comparisons.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run, TEAM_OWNERS };
