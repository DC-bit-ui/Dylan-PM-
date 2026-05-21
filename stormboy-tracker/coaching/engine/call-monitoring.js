/**
 * Call monitoring — replicates Will's "Storm Boy call monitoring"
 * dashboard from the Operation Storm Boy Teams channel
 * (2026-05-21 post). Different framing from call-analytics.js:
 * this is CAMPAIGN PROGRESS against weekly target, not raw call
 * quality metrics.
 *
 * Panels (matching Will's exact layout):
 *
 *   THIS WEEK VS TARGET — TEAM TOTAL
 *     sb_connected_this_week / weekly_target (default 100)
 *     other_campaigns_connected_this_week
 *     storm_boy_calls_remaining
 *
 *   VOLUME TILES (6):
 *     unique_contacts_engaged          ← distinct SB contacts touched
 *     via_date_called                  ← contacts with storm_boy__date_called set
 *     via_last_contacted_only          ← contacts with last_contacted but no date_called
 *     storm_boy_call_volume            ← total OUTBOUND call events on SB contacts
 *     all_outbound_volume              ← total team outbound calls
 *     other_campaigns_volume           ← all_outbound - storm_boy
 *
 *   EFFICACY TILES (6):
 *     visits_booked                    ← SB contacts with meeting_date in era
 *     calls_per_visit                  ← storm_boy_call_volume / visits_booked
 *     visits_per_100_calls             ← 100 * visits / storm_boy_call_volume
 *     tasks_completed                  ← team completed tasks in era
 *     avg_touches_per_contact          ← sum(num_contacted_notes) / engaged_contacts
 *     first_last_engagement            ← era start → today
 *
 *   DAILY ENGAGEMENT CHART:
 *     per day: via_date_called bar, via_last_contacted_only bar,
 *              cumulative unique contacts line
 *
 * Storm Boy era anchor: 2026-01-13 (matches STORMBOY_LAUNCH_DATE
 * used elsewhere in the codebase).
 *
 * 15-min disk cache — short because this is a daily-pacing view
 * the team checks intra-day.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'call-monitoring.json');
const CACHE_TTL_MS = 15 * 60 * 1000;

const ERA_START = '2026-01-13T00:00:00Z';
const WEEKLY_TARGET = 100;

const TEAM_OWNERS = {
  '76812243':  { name: 'Ben',     is_sales_rep: true },
  '78272376':  { name: 'Claudia', is_sales_rep: true },
  '361236574': { name: 'Hobbs',   is_sales_rep: true },
  '361823546': { name: 'Will',    is_sales_rep: false },
};

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

// All Storm Boy contacts with the engagement signals we need
async function fetchAllStormBoyContacts(token) {
  const all = [];
  let after;
  while (all.length < 10000) {
    const body = {
      filterGroups: [{
        filters: [{ propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' }],
      }],
      properties: [
        'firstname', 'lastname',
        'contact_lead_stage_storm_boy',
        'storm_boy__date_called',
        'storm_boy__meeting_date',
        'storm_boy__meeting_completed',
        'notes_last_contacted',
        'num_contacted_notes',
        'createdate', 'lastmodifieddate',
      ],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/contacts/search', body);
    all.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return all;
}

// Team outbound calls since era start
async function fetchTeamOutboundCalls(token, sinceMs) {
  const ownerIds = Object.keys(TEAM_OWNERS);
  const all = [];
  let after;
  while (all.length < 25000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: String(sinceMs) },
          { propertyName: 'hubspot_owner_id', operator: 'IN', values: ownerIds },
          { propertyName: 'hs_call_direction', operator: 'EQ', value: 'OUTBOUND' },
        ],
      }],
      sorts: [{ propertyName: 'hs_timestamp', direction: 'ASCENDING' }],
      properties: ['hs_timestamp', 'hs_call_disposition', 'hubspot_owner_id'],
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

// Batch-resolve call → contact associations so we can classify each
// call as Storm Boy vs other campaigns. Returns { callId: [contactId] }.
async function fetchCallContactAssociations(token, callIds) {
  if (!callIds.length) return {};
  const map = {};
  for (let i = 0; i < callIds.length; i += 100) {
    const batch = callIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v4/associations/calls/contacts/batch/read', {
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(r => {
        const fromId = r.from && r.from.id;
        if (!fromId) return;
        map[fromId] = (r.to || []).map(t => String(t.toObjectId));
      });
    } catch (e) {
      console.warn('[call-monitoring] call→contact assoc batch failed:', e.message);
    }
  }
  return map;
}

// Team completed tasks since era start
async function fetchTeamCompletedTasks(token, sinceMs) {
  const ownerIds = Object.keys(TEAM_OWNERS);
  const all = [];
  let after;
  while (all.length < 10000) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'hs_task_status', operator: 'EQ', value: 'COMPLETED' },
          { propertyName: 'hubspot_owner_id', operator: 'IN', values: ownerIds },
          { propertyName: 'hs_task_completion_date', operator: 'GTE', value: String(sinceMs) },
        ],
      }],
      properties: ['hs_task_completion_date', 'hubspot_owner_id'],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/tasks/search', body);
    all.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return all;
}

// === ISO week helpers (Monday-start, UTC) ===
function thisWeekStartMs() {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday.getTime();
}
function isoDay(ms) { return new Date(ms).toISOString().slice(0, 10); }

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
  } catch (e) { console.error('[call-monitoring] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const eraStartMs = Date.parse(ERA_START);
  const weekStartMs = thisWeekStartMs();
  const todayIso = new Date().toISOString().slice(0, 10);

  // Pull contacts + calls + tasks in parallel
  const [contacts, calls, tasks] = await Promise.all([
    fetchAllStormBoyContacts(token),
    fetchTeamOutboundCalls(token, eraStartMs),
    fetchTeamCompletedTasks(token, eraStartMs),
  ]);
  console.log(`[call-monitoring] ${contacts.length} SB contacts · ${calls.length} team outbound calls · ${tasks.length} completed tasks`);

  // Resolve call → contact associations so we can split SB vs other
  const callIds = calls.map(c => c.id);
  const callContactMap = await fetchCallContactAssociations(token, callIds);
  const sbContactIdSet = new Set(contacts.map(c => c.id));

  // Bucket calls: storm_boy vs other; this week vs not
  let sbCallsTotal = 0;
  let sbCallsThisWeekConnected = 0;
  let otherCallsThisWeekConnected = 0;
  let allCallsTotal = calls.length;
  // Disposition UUID for "Connected" — discoverable via /calling/v1/dispositions
  // but stable across the org. Hard-coded here to avoid an extra round-trip.
  const CONNECTED_DISP = 'f240bbac-87c9-4f6e-bf70-924b57d47db7';

  calls.forEach(c => {
    const p = c.properties;
    const ts = Date.parse(p.hs_timestamp || 0);
    const connected = p.hs_call_disposition === CONNECTED_DISP;
    const associatedContacts = callContactMap[c.id] || [];
    const isSB = associatedContacts.some(cid => sbContactIdSet.has(cid));
    if (isSB) {
      sbCallsTotal++;
      if (ts >= weekStartMs && connected) sbCallsThisWeekConnected++;
    } else {
      if (ts >= weekStartMs && connected) otherCallsThisWeekConnected++;
    }
  });

  // Bucket SB contacts: via date_called, via last_contacted only, both signals
  let viaDateCalled = 0;
  let viaLastContactedOnly = 0;
  let uniqueEngaged = 0;
  let visitsBooked = 0;
  let totalTouches = 0; // sum of num_contacted_notes across engaged contacts

  // Daily engagement series (era_start → today)
  const dailySeries = {};
  function bumpDay(day, key) {
    if (!dailySeries[day]) dailySeries[day] = { date: day, via_date_called: 0, via_last_contacted: 0 };
    dailySeries[day][key]++;
  }

  contacts.forEach(c => {
    const p = c.properties;
    const dateCalled = p.storm_boy__date_called;
    const lastContacted = p.notes_last_contacted;
    const meetingDate = p.storm_boy__meeting_date;

    // Only count signals within the Storm Boy era
    const dcMs = dateCalled ? Date.parse(dateCalled) : null;
    const lcMs = lastContacted ? Date.parse(lastContacted) : null;
    const inEraDC = dcMs && dcMs >= eraStartMs;
    const inEraLC = lcMs && lcMs >= eraStartMs;

    let engaged = false;
    if (inEraDC) { viaDateCalled++; engaged = true; bumpDay(isoDay(dcMs), 'via_date_called'); }
    if (inEraLC && !inEraDC) { viaLastContactedOnly++; engaged = true; bumpDay(isoDay(lcMs), 'via_last_contacted'); }
    if (engaged) {
      uniqueEngaged++;
      totalTouches += Number(p.num_contacted_notes) || 0;
    }
    if (meetingDate && Date.parse(meetingDate) >= eraStartMs) {
      visitsBooked++;
    }
  });

  // Build sorted daily series + cumulative-unique-contacts running total
  // For cumulative: each new contact's engagement DAY contributes +1 once
  // to the running total. To get this right we need per-contact "first
  // engagement day in era" — recompute by iterating contacts.
  const firstEngagementDayByContact = {};
  contacts.forEach(c => {
    const p = c.properties;
    const dcMs = p.storm_boy__date_called ? Date.parse(p.storm_boy__date_called) : null;
    const lcMs = p.notes_last_contacted ? Date.parse(p.notes_last_contacted) : null;
    const candidates = [];
    if (dcMs && dcMs >= eraStartMs) candidates.push(dcMs);
    if (lcMs && lcMs >= eraStartMs) candidates.push(lcMs);
    if (!candidates.length) return;
    const first = Math.min(...candidates);
    firstEngagementDayByContact[c.id] = isoDay(first);
  });
  const newContactsByDay = {};
  Object.values(firstEngagementDayByContact).forEach(d => {
    newContactsByDay[d] = (newContactsByDay[d] || 0) + 1;
  });

  const allDays = Array.from(new Set([
    ...Object.keys(dailySeries),
    ...Object.keys(newContactsByDay),
  ])).sort();
  let cumulative = 0;
  const daily = allDays.map(d => {
    cumulative += newContactsByDay[d] || 0;
    const row = dailySeries[d] || { date: d, via_date_called: 0, via_last_contacted: 0 };
    return { ...row, cumulative_unique: cumulative };
  });

  // Tasks bucket
  const tasksCompleted = tasks.length;

  // Derived efficacy
  const callsPerVisit = visitsBooked > 0 ? Math.round((sbCallsTotal / visitsBooked) * 10) / 10 : null;
  const visitsPer100 = sbCallsTotal > 0 ? Math.round((100 * visitsBooked / sbCallsTotal) * 10) / 10 : null;
  const avgTouches = uniqueEngaged > 0 ? Math.round((totalTouches / uniqueEngaged) * 10) / 10 : null;

  const result = {
    generated_at: new Date().toISOString(),
    era_start: ERA_START.slice(0, 10),
    today: todayIso,
    weekly_target: WEEKLY_TARGET,
    this_week: {
      week_start: new Date(weekStartMs).toISOString().slice(0, 10),
      storm_boy_connected: sbCallsThisWeekConnected,
      other_campaigns_connected: otherCallsThisWeekConnected,
      total_connected: sbCallsThisWeekConnected + otherCallsThisWeekConnected,
      target: WEEKLY_TARGET,
      pct_of_target: Math.round((sbCallsThisWeekConnected / WEEKLY_TARGET) * 1000) / 10,
      remaining: Math.max(0, WEEKLY_TARGET - sbCallsThisWeekConnected),
    },
    volume_tiles: {
      unique_contacts_engaged: uniqueEngaged,
      via_date_called: viaDateCalled,
      via_last_contacted_only: viaLastContactedOnly,
      storm_boy_call_volume: sbCallsTotal,
      all_outbound_volume: allCallsTotal,
      other_campaigns_volume: allCallsTotal - sbCallsTotal,
    },
    efficacy_tiles: {
      visits_booked: visitsBooked,
      calls_per_visit_booked: callsPerVisit,
      visits_per_100_calls: visitsPer100,
      tasks_completed: tasksCompleted,
      avg_touches_per_contact: avgTouches,
      first_engagement: ERA_START.slice(0, 10),
      last_engagement: todayIso,
    },
    daily,
    caveats: [
      `Storm Boy era anchor: ${ERA_START.slice(0,10)}. Weekly target: ${WEEKLY_TARGET} calls (matches Will's dashboard).`,
      `"Storm Boy calls" = team outbound calls associated with a contact where storm_boy_campaign_member = Yes. "Other campaigns" = all other team outbound.`,
      `"Connected" calls = hs_call_disposition matches Aircall's Connected disposition.`,
      `"Via date called" = storm_boy__date_called property set within era. "Via last contacted only" = notes_last_contacted in era but no storm_boy__date_called.`,
      `"Avg touches/contact" = sum(num_contacted_notes) / unique_contacts_engaged. Approximation — num_contacted_notes is HubSpot's running counter of contact touches across channels.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
