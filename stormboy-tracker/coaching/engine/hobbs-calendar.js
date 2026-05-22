/**
 * Hobbs's farm visit calendar — forward-focused view of past + booked
 * visits, sourced from HubSpot MEETING ENGAGEMENTS (the calendar
 * invites), not the sparsely-populated storm_boy__meeting_date custom
 * property.
 *
 * 2026-05-22 rewrite: original used storm_boy__meeting_date on the
 * contact, which only catches a fraction of real visits because the
 * field is set manually + rarely. The truth is in the meeting object —
 * Hobbs's calendar (Outlook/Google calendar) syncs into HubSpot as
 * `meetings` engagements with hs_meeting_start_time and hs_meeting_
 * outcome populated. Source-of-truth correction reported 32 visits
 * vs the previous 6, and surfaced 25 in the active window.
 *
 * SOURCE:
 *   GET /crm/v3/objects/meetings/search
 *     where hubspot_owner_id = Hobbs
 *       AND hs_meeting_start_time in window
 *   Plus meeting → contact associations to attribute each visit to
 *   a named landholder.
 *
 * OUTCOME CLASSIFICATION:
 *   Future + SCHEDULED        → "booked"  (will happen)
 *   Future + RESCHEDULED      → "booked"
 *   Past   + COMPLETED        → "completed" (confirmed happened)
 *   Past   + SCHEDULED        → "likely_happened" (team didn't mark)
 *   Past   + NO_SHOW          → "no_show"
 *   Past   + CANCELED         → "canceled"
 *   Future + CANCELED         → "canceled"
 *
 * Default window: 2 weeks past + 6 weeks forward.
 * 15-min cache.
 */

const { hubspotFetch } = require('./hubspot-client');
const { postcodeToNRM, normalizePostcode } = require('./nrm-regions');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const HOBBS_OWNER_ID = '361236574';
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PAST_WEEKS = 2;
const DEFAULT_FUTURE_WEEKS = 6;
const CACHE_TTL_MS = 15 * 60 * 1000;

let _cache = null;

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}`);
  return res.json();
}

async function fetchMeetings(token, ownerId, sinceMs, untilMs) {
  const all = [];
  let after;
  while (all.length < 500) {
    const body = {
      filterGroups: [{ filters: [
        { propertyName: 'hubspot_owner_id',         operator: 'EQ',  value: ownerId },
        { propertyName: 'hs_meeting_start_time',    operator: 'GTE', value: String(sinceMs) },
        { propertyName: 'hs_meeting_start_time',    operator: 'LTE', value: String(untilMs) },
      ]}],
      properties: ['hs_meeting_title', 'hs_meeting_start_time', 'hs_meeting_end_time',
                   'hs_meeting_outcome', 'hs_meeting_location', 'hs_internal_meeting_notes'],
      sorts: [{ propertyName: 'hs_meeting_start_time', direction: 'ASCENDING' }],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/meetings/search', body);
    all.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return all;
}

async function fetchMeetingContacts(token, meetingIds) {
  if (!meetingIds.length) return {};
  const map = {};
  for (let i = 0; i < meetingIds.length; i += 100) {
    const batch = meetingIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v4/associations/meetings/contacts/batch/read', {
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(r => {
        const fromId = r.from && r.from.id;
        if (!fromId) return;
        map[fromId] = (r.to || []).map(t => String(t.toObjectId));
      });
    } catch (e) {
      console.warn('[hobbs-calendar] meeting→contact assoc batch failed:', e.message);
    }
  }
  return map;
}

async function fetchContactsBatch(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const batch = contactIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v3/objects/contacts/batch/read', {
        properties: ['firstname', 'lastname', 'hs_full_name_or_email',
                     'zip', 'postal_code', 'state', 'city',
                     'contact_lead_stage_storm_boy',
                     'storm_boy__horizon_snapshot_created',
                     'storm_boy__proceed_to_kct_stage'],
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(c => { map[c.id] = c; });
    } catch (e) {
      console.warn('[hobbs-calendar] contact batch read failed:', e.message);
    }
  }
  return map;
}

function isoDay(ms) { return new Date(ms).toISOString().slice(0, 10); }
function dayStartUtcMs(d) {
  const date = new Date(d);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
function weekStartUtcMs(ms) {
  const d = new Date(ms);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff);
}
function contactName(c) {
  const p = c.properties || {};
  const fn = (p.firstname || '').trim();
  const ln = (p.lastname || '').trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
  return (p.hs_full_name_or_email || '').trim() || ('contact #' + c.id);
}

function classifyOutcome(meeting, now) {
  const startMs = Date.parse(meeting.properties.hs_meeting_start_time);
  const outcome = (meeting.properties.hs_meeting_outcome || '').toUpperCase();
  const isPast = startMs < now;
  if (outcome === 'CANCELED') return { state: 'canceled', label: 'Canceled' };
  if (outcome === 'NO_SHOW')  return { state: 'no_show',  label: 'No-show' };
  if (outcome === 'COMPLETED') return { state: 'completed', label: 'Completed' };
  if (outcome === 'RESCHEDULED') return { state: 'rescheduled', label: 'Rescheduled' };
  // SCHEDULED (the default) — classify by time
  if (isPast) return { state: 'likely_happened', label: 'Likely happened (unmarked)' };
  return { state: 'booked', label: 'Booked' };
}

async function run({ ownerId = HOBBS_OWNER_ID, pastWeeks = DEFAULT_PAST_WEEKS, futureWeeks = DEFAULT_FUTURE_WEEKS, force = false } = {}) {
  if (!force && _cache && Date.now() - _cache.generated_at < CACHE_TTL_MS) {
    return { ..._cache.result, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const now = Date.now();
  const today = dayStartUtcMs(now);
  const todayWeekStart = weekStartUtcMs(today);
  const sinceMs = todayWeekStart - pastWeeks * 7 * DAY_MS;
  const untilMs = todayWeekStart + (futureWeeks + 1) * 7 * DAY_MS - 1;
  const meetings = await fetchMeetings(token, ownerId, sinceMs, untilMs);
  console.log(`[hobbs-calendar] ${meetings.length} meetings for owner ${ownerId} between ${isoDay(sinceMs)} and ${isoDay(untilMs)}`);

  // Get associated contacts for each meeting
  const meetingIds = meetings.map(m => m.id);
  const assoc = await fetchMeetingContacts(token, meetingIds);
  const allContactIds = Array.from(new Set(Object.values(assoc).flat()));
  const contactMap = await fetchContactsBatch(token, allContactIds);

  const byDay = {};
  let counts = { booked: 0, completed: 0, likely_happened: 0, no_show: 0, canceled: 0, rescheduled: 0 };
  meetings.forEach(m => {
    const startMs = Date.parse(m.properties.hs_meeting_start_time);
    if (!startMs) return;
    const dayKey = isoDay(startMs);
    if (!byDay[dayKey]) byDay[dayKey] = [];
    const outcomeInfo = classifyOutcome(m, now);
    counts[outcomeInfo.state]++;

    // First associated contact wins for the visit label
    const contactIds = assoc[m.id] || [];
    let primary = null;
    for (const cid of contactIds) {
      if (contactMap[cid]) { primary = contactMap[cid]; break; }
    }
    const name = primary ? contactName(primary) : (m.properties.hs_meeting_title || 'Farm visit');
    const cp = primary ? (primary.properties || {}) : {};
    const pc = normalizePostcode(cp.zip || cp.postal_code);
    const nrm = pc ? postcodeToNRM(pc) : null;

    byDay[dayKey].push({
      meeting_id: m.id,
      contact_id: primary ? primary.id : null,
      name,
      title: m.properties.hs_meeting_title,
      start_iso: m.properties.hs_meeting_start_time,
      start_local_time: new Date(startMs).toISOString().slice(11, 16),
      end_iso: m.properties.hs_meeting_end_time,
      outcome: m.properties.hs_meeting_outcome,
      state: outcomeInfo.state,
      state_label: outcomeInfo.label,
      is_past: startMs < now,
      is_future: startMs >= now,
      stage: cp.contact_lead_stage_storm_boy,
      snapshot_created: cp.storm_boy__horizon_snapshot_created,
      proceed_to_kct: cp.storm_boy__proceed_to_kct_stage,
      city: cp.city,
      state_au: cp.state,
      nrm_region: nrm ? nrm.name : null,
      nrm_state: nrm ? nrm.state : null,
      hubspot_url: primary ? ('https://app.hubspot.com/contacts/24224559/contact/' + primary.id) : null,
      meeting_url: 'https://app.hubspot.com/contacts/24224559/record/0-47/' + m.id,
      location: m.properties.hs_meeting_location,
    });
  });

  // Build week grid
  const weeks = [];
  let weekStart = weekStartUtcMs(sinceMs);
  const endMs = weekStartUtcMs(untilMs);
  while (weekStart <= endMs) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayMs = weekStart + i * DAY_MS;
      const dayIso = isoDay(dayMs);
      const visits = byDay[dayIso] || [];
      visits.sort((a, b) => (a.start_iso || '').localeCompare(b.start_iso || ''));
      days.push({
        date: dayIso,
        day_of_month: new Date(dayMs).getUTCDate(),
        day_label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        is_today: dayMs === today,
        is_past: dayMs < today,
        is_future: dayMs > today,
        visit_count: visits.length,
        visits,
      });
    }
    weeks.push({
      week_start: isoDay(weekStart),
      is_current_week: weekStart === todayWeekStart,
      days,
    });
    weekStart += 7 * DAY_MS;
  }

  // Forward-focused per-week summary
  const upcomingWeeks = weeks.filter(w => w.week_start >= isoDay(todayWeekStart));
  const visitsPerUpcomingWeek = upcomingWeeks.map(w => ({
    week_start: w.week_start,
    booked: w.days.reduce((sum, d) => sum + d.visits.filter(v => !v.is_past).length, 0),
  }));
  const totalUpcoming = visitsPerUpcomingWeek.reduce((s, w) => s + w.booked, 0);

  // Headline narrative
  const nextDay = weeks.flatMap(w => w.days).find(d => (d.is_today || d.is_future) && d.visits.some(v => !v.is_past));
  let headline;
  if (totalUpcoming === 0) {
    headline = `No farm visits booked in the next ${futureWeeks} weeks. Pipeline of visits is empty going forward.`;
  } else if (totalUpcoming >= 10) {
    headline = `Strong forward pipeline: ${totalUpcoming} visits booked in the next ${futureWeeks} weeks. ${nextDay ? `Next visit ${nextDay.date}.` : ''}`;
  } else if (totalUpcoming >= 5) {
    headline = `${totalUpcoming} visits booked in the next ${futureWeeks} weeks. ${nextDay ? `Next visit ${nextDay.date}.` : ''}`;
  } else {
    headline = `Only ${totalUpcoming} visits booked in the next ${futureWeeks} weeks. ${nextDay ? `Next visit ${nextDay.date}.` : ''} Consider whether more should be in the diary.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    rep: { name: 'Hobbs', owner_id: ownerId },
    source: {
      kind: 'hubspot_meeting_engagements',
      note: 'Sourced from HubSpot meeting engagements (calendar invites), not the storm_boy__meeting_date custom property. Hobbs\'s Outlook/Google calendar syncs in as meeting objects — that\'s the authoritative source.',
    },
    window: {
      since_iso: isoDay(sinceMs),
      until_iso: isoDay(untilMs),
      past_weeks: pastWeeks,
      future_weeks: futureWeeks,
      today_iso: isoDay(today),
    },
    totals: {
      meetings: meetings.length,
      booked: counts.booked,
      completed: counts.completed,
      likely_happened: counts.likely_happened,
      no_show: counts.no_show,
      canceled: counts.canceled,
      rescheduled: counts.rescheduled,
    },
    visits_per_upcoming_week: visitsPerUpcomingWeek,
    weeks,
    headline,
    caveats: [
      `Sourced from HubSpot meeting engagements via /crm/v3/objects/meetings/search filtered by hubspot_owner_id = ${ownerId}. This is the authoritative source — Hobbs's calendar syncs here.`,
      `Outcome classification: future + SCHEDULED = "booked"; past + COMPLETED = "completed"; past + SCHEDULED = "likely happened (unmarked)" because the team rarely updates outcome post-visit; explicit NO_SHOW / CANCELED honored.`,
      `Contact name on each chip is the first associated contact. Where no contact association exists, falls back to meeting title.`,
    ],
    from_cache: false,
  };
  _cache = { generated_at: Date.now(), result };
  return result;
}

module.exports = { run };
