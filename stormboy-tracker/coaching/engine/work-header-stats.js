/**
 * WORK tab header stats — a single consolidated payload for the top-of-page
 * stat pills. Pulled live from HubSpot each request (no cache — the numbers
 * are small, and we want them current).
 *
 * Returned shape:
 *   {
 *     target_set_date: '2025-09-01',
 *     project_ha_since_target: number,         // sum of estimated_project_ha for wins closed >= target_set_date
 *     project_ha_target: 30000,
 *     project_ha_pct: number,                  // 0-100
 *     farm_visits: {
 *       lifetime_booked: number,
 *       booked_this_week: number,
 *       completed_this_week: number,
 *       week_start: 'YYYY-MM-DD',
 *     },
 *     stormboy_wins: {
 *       count_since_target: number,
 *       most_recent: { deal_name, closedate, days_ago } | null,
 *     },
 *     most_recent_win: { deal_name, closedate, days_ago, channel: { stormboy, partner, direct } } | null,
 *   }
 */

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
// 30K conversion target anchor — date the target was set. Hectares + Stormboy
// wins in the header scorecard count only from this date forward.
const TARGET_SET_DATE = '2026-04-27';
const HA_TARGET = 30000;

function weekStart(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return monday.toISOString().slice(0, 10);
}
function currentWeekStart() { return weekStart(new Date().toISOString()); }

function num(x) { const n = parseFloat(x); return Number.isFinite(n) ? n : 0; }
function daysAgo(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

async function searchAll(token, path, filterGroups, properties, sorts) {
  const all = [];
  let after = undefined;
  let safety = 100;
  while (safety-- > 0) {
    const body = { filterGroups, properties, limit: 100 };
    if (sorts) body.sorts = sorts;
    if (after) body.after = after;
    const res = await hubspotFetch(HUBSPOT_BASE + path, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HubSpot ${path} ${res.status}`);
    const page = await res.json();
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return all;
}

async function fetchDealContacts(token, dealIds) {
  if (!dealIds.length) return {};
  // HubSpot batch limit is 100 per request — split if needed
  const map = {};
  for (let i = 0; i < dealIds.length; i += 100) {
    const slice = dealIds.slice(i, i + 100);
    const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v4/associations/deals/contacts/batch/read', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: slice.map(id => ({ id })) }),
    });
    if (!res.ok) {
      console.error('header-stats associations batch failed', res.status);
      continue;
    }
    const data = await res.json();
    (data.results || []).forEach(r => {
      const fromId = r.from && r.from.id;
      if (!fromId) return;
      map[fromId] = (r.to || []).map(t => String(t.toObjectId));
    });
  }
  return map;
}

async function fetchContactStormboyFlags(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const slice = contactIds.slice(i, i + 100);
    const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v3/objects/contacts/batch/read', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: ['storm_boy_campaign_member'],
        inputs: slice.map(id => ({ id })),
      }),
    });
    if (!res.ok) {
      console.error('header-stats contacts batch failed', res.status);
      continue;
    }
    const data = await res.json();
    (data.results || []).forEach(c => {
      map[c.id] = c.properties && c.properties.storm_boy_campaign_member;
    });
  }
  return map;
}

async function run() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // ---- 1. Farm-visit MEETING ENGAGEMENTS ----
  //
  // Reworked 2026-05-22 — original sourced from storm_boy__meeting_date
  // on the contact, but that field is sparsely populated (Hobbs's team
  // doesn't fill it in) so completed_this_week was returning 0 even
  // though visits were happening. Truth lives in HubSpot meeting
  // engagements (calendar invites): all team-owned meetings whose
  // title contains "farm visit". Outcome enum
  // (SCHEDULED/COMPLETED/RESCHEDULED/NO_SHOW/CANCELED) + the
  // start_time relative to now lets us classify reliably.
  //
  //   booked_this_week    = team farm-visit meetings with start_time
  //                         in this ISO week (regardless of outcome,
  //                         excluding CANCELED)
  //   completed_this_week = same, but only those whose start_time is
  //                         already past AND outcome ≠ NO_SHOW/CANCELED
  //                         (i.e., it happened — either explicitly
  //                         COMPLETED or implicitly via past + SCHEDULED
  //                         since the team rarely flips the outcome)
  //   lifetime_booked     = all team farm-visit meetings ever (excluding CANCELED)
  const STORMBOY_TEAM_OWNERS = ['76812243', '78272376', '361236574', '361823546'];
  const thisWeek = currentWeekStart();
  const nowMs = Date.now();
  // Pull meetings owned by the team in a 2-year window (lifetime stat needs
  // history; this-week filter handles the recent slice).
  const yearAgo = nowMs - 365 * 2 * 24 * 60 * 60 * 1000;
  const farmVisitMeetings = await searchAll(
    token,
    '/crm/v3/objects/meetings/search',
    [{
      filters: [
        { propertyName: 'hubspot_owner_id', operator: 'IN', values: STORMBOY_TEAM_OWNERS },
        { propertyName: 'hs_meeting_start_time', operator: 'GTE', value: String(yearAgo) },
      ],
    }],
    ['hs_meeting_title', 'hs_meeting_start_time', 'hs_meeting_outcome', 'hubspot_owner_id'],
    [{ propertyName: 'hs_meeting_start_time', direction: 'DESCENDING' }],
  );
  let lifetimeBooked = 0;
  let bookedThisWeek = 0;
  let completedThisWeek = 0;
  farmVisitMeetings.forEach(m => {
    const p = m.properties || {};
    const title = (p.hs_meeting_title || '').toLowerCase();
    if (!title.includes('farm visit')) return;     // only farm visits
    const outcome = (p.hs_meeting_outcome || '').toUpperCase();
    if (outcome === 'CANCELED') return;            // exclude cancellations
    const startMs = Date.parse(p.hs_meeting_start_time || '');
    if (!startMs) return;
    lifetimeBooked++;
    const w = weekStart(p.hs_meeting_start_time);
    if (w === thisWeek) {
      bookedThisWeek++;
      // Completed = past AND not no-show (and not canceled, which we
      // already filtered out above). Past + SCHEDULED counts because
      // the team rarely toggles the outcome after the visit.
      if (startMs < nowMs && outcome !== 'NO_SHOW') {
        completedThisWeek++;
      }
    }
  });

  // ---- 2. ALL won deals (no date filter) ----
  // Hectares are filtered to since-target in step 4; Stormboy wins count
  // includes all-time so leadership sees the full Stormboy track record.
  const wonDeals = await searchAll(
    token,
    '/crm/v3/objects/deals/search',
    [{
      filters: [
        { propertyName: 'dealstage', operator: 'EQ', value: '231921676' },
      ],
    }],
    ['dealname', 'closedate', 'partner', 'lead_source', 'estimated_project_ha', 'total_property_hectares'],
    [{ propertyName: 'closedate', direction: 'DESCENDING' }],
  );

  const targetCutoff = TARGET_SET_DATE + 'T00:00:00Z';
  const winsSinceTarget = wonDeals.filter(d => d.properties.closedate && d.properties.closedate >= targetCutoff);

  // Project ha since target set
  const projectHaSinceTarget = winsSinceTarget.reduce((s, d) => s + num(d.properties.estimated_project_ha), 0);

  // ---- 3. Stormboy attribution via contact associations ----
  const dealIds = wonDeals.map(d => d.id);
  const dealContacts = await fetchDealContacts(token, dealIds);
  const allContactIds = Array.from(new Set(Object.values(dealContacts).flat()));
  const contactFlags = await fetchContactStormboyFlags(token, allContactIds);

  const stormboyWins = [];
  wonDeals.forEach(d => {
    const cids = dealContacts[d.id] || [];
    const isStormboy = cids.some(cid => contactFlags[cid] === 'Yes');
    if (isStormboy) stormboyWins.push(d);
  });

  // Most-recent Stormboy win
  const sbMostRecent = stormboyWins[0]
    ? {
        deal_id: stormboyWins[0].id,
        deal_name: stormboyWins[0].properties.dealname,
        closedate: stormboyWins[0].properties.closedate,
        days_ago: daysAgo(stormboyWins[0].properties.closedate),
      }
    : null;

  // Overall most-recent win (any channel)
  const mostRecent = wonDeals[0]
    ? (function() {
        const d = wonDeals[0];
        const cids = dealContacts[d.id] || [];
        const isStormboy = cids.some(cid => contactFlags[cid] === 'Yes');
        const partner = d.properties.partner || null;
        return {
          deal_id: d.id,
          deal_name: d.properties.dealname,
          closedate: d.properties.closedate,
          days_ago: daysAgo(d.properties.closedate),
          channel: {
            stormboy: isStormboy,
            partner,
            direct: !isStormboy && !partner,
          },
        };
      })()
    : null;

  return {
    generated_at: new Date().toISOString(),
    target_set_date: TARGET_SET_DATE,
    project_ha_since_target: Math.round(projectHaSinceTarget),
    project_ha_target: HA_TARGET,
    project_ha_pct: Math.round((projectHaSinceTarget / HA_TARGET) * 1000) / 10,
    farm_visits: {
      lifetime_booked: lifetimeBooked,
      booked_this_week: bookedThisWeek,
      completed_this_week: completedThisWeek,
      week_start: thisWeek,
    },
    stormboy_wins: {
      count: stormboyWins.length,
      most_recent: sbMostRecent,
    },
    most_recent_win: mostRecent,
    wins_since_target: winsSinceTarget.length,
    wins_lifetime: wonDeals.length,
  };
}

module.exports = { run };
