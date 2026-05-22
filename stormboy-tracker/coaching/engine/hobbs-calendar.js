/**
 * Hobbs's farm visit calendar — forward-focused calendar view of
 * past + booked farm visits so Dylan can see how the team is
 * positioned moving forward.
 *
 * Hobbs is the on-the-ground farm visit rep (HubSpot owner_id
 * 361236574). His meeting_date populates contact-level
 * storm_boy__meeting_date — that's the source of truth.
 *
 * Window: 2 weeks back + 6 weeks forward (default). Past visits
 * show as completed (or no-show if meeting_completed != Yes and
 * date is past). Future visits show as scheduled.
 *
 * Each contact's meeting carries enough metadata to drive a
 * calendar cell: name, postcode → NRM, days from now, completed
 * flag, snapshot state hooks.
 *
 * 15-min in-memory cache.
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

async function fetchHobbsVisits(token, sinceMs, untilMs) {
  const all = [];
  let after;
  while (all.length < 1000) {
    const body = {
      filterGroups: [{ filters: [
        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: HOBBS_OWNER_ID },
        { propertyName: 'storm_boy__meeting_date', operator: 'GTE', value: String(sinceMs) },
        { propertyName: 'storm_boy__meeting_date', operator: 'LTE', value: String(untilMs) },
      ]}],
      properties: [
        'firstname', 'lastname', 'hs_full_name_or_email',
        'storm_boy__meeting_date', 'storm_boy__meeting_completed',
        'storm_boy__meeting_scheduled',
        'storm_boy__horizon_snapshot_created',
        'storm_boy__proceed_to_kct_stage',
        'contact_lead_stage_storm_boy',
        'zip', 'postal_code', 'state', 'city',
        'notes_last_contacted',
      ],
      sorts: [{ propertyName: 'storm_boy__meeting_date', direction: 'ASCENDING' }],
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

function isoDay(ms) { return new Date(ms).toISOString().slice(0, 10); }
function dayStartUtcMs(d) {
  const date = new Date(d);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
// Monday-start week
function weekStartUtcMs(ms) {
  const d = new Date(ms);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff);
}

async function run({ pastWeeks = DEFAULT_PAST_WEEKS, futureWeeks = DEFAULT_FUTURE_WEEKS, force = false } = {}) {
  if (!force && _cache && Date.now() - _cache.generated_at < CACHE_TTL_MS) {
    return { ..._cache.result, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const now = Date.now();
  const today = dayStartUtcMs(now);
  const todayWeekStart = weekStartUtcMs(today);
  const sinceMs = todayWeekStart - pastWeeks * 7 * DAY_MS;
  const untilMs = todayWeekStart + (futureWeeks + 1) * 7 * DAY_MS - 1; // through end of last week
  const contacts = await fetchHobbsVisits(token, sinceMs, untilMs);
  console.log(`[hobbs-calendar] ${contacts.length} Hobbs visits between ${isoDay(sinceMs)} and ${isoDay(untilMs)}`);

  // Bucket by day
  const byDay = {};
  let totalCompleted = 0, totalScheduled = 0, totalNoShow = 0;
  contacts.forEach(c => {
    const p = c.properties;
    const meetMs = Date.parse(p.storm_boy__meeting_date || 0);
    if (!meetMs) return;
    const dayKey = isoDay(meetMs);
    if (!byDay[dayKey]) byDay[dayKey] = [];
    const fn = (p.firstname || '').trim();
    const ln = (p.lastname || '').trim();
    const name = [fn, ln].filter(Boolean).join(' ') || p.hs_full_name_or_email || '(contact)';
    const isPast = meetMs < today;
    const completed = p.storm_boy__meeting_completed === 'Yes';
    const isNoShow = isPast && !completed;
    if (isPast && completed) totalCompleted++;
    else if (isPast && !completed) totalNoShow++;
    else totalScheduled++;
    const pc = normalizePostcode(p.zip || p.postal_code);
    const nrm = pc ? postcodeToNRM(pc) : null;
    byDay[dayKey].push({
      id: c.id,
      name,
      meeting_iso: p.storm_boy__meeting_date,
      meeting_local_time: meetMs ? new Date(meetMs).toISOString().slice(11, 16) : null,
      completed,
      is_past: isPast,
      is_no_show: isNoShow,
      stage: p.contact_lead_stage_storm_boy,
      snapshot_created: p.storm_boy__horizon_snapshot_created,
      proceed_to_kct: p.storm_boy__proceed_to_kct_stage,
      city: p.city || null,
      state: p.state || null,
      nrm_region: nrm ? nrm.name : null,
      nrm_state: nrm ? nrm.state : null,
      hubspot_url: 'https://app.hubspot.com/contacts/24224559/contact/' + c.id,
    });
  });

  // Build week grid: [{ week_start, days: [{ date, day_label, is_today, is_past, in_window, visits: [...] }] }]
  const weeks = [];
  let weekStart = weekStartUtcMs(sinceMs);
  const endMs = weekStartUtcMs(untilMs);
  while (weekStart <= endMs) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayMs = weekStart + i * DAY_MS;
      const dayIso = isoDay(dayMs);
      const visits = byDay[dayIso] || [];
      visits.sort((a, b) => (a.meeting_iso || '').localeCompare(b.meeting_iso || ''));
      days.push({
        date: dayIso,
        day_of_month: new Date(dayMs).getUTCDate(),
        day_label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
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

  // Summary metrics
  const totalVisits = totalCompleted + totalScheduled + totalNoShow;
  const upcomingWeeks = weeks.filter(w => w.week_start >= isoDay(todayWeekStart));
  const visitsPerUpcomingWeek = upcomingWeeks.map(w => ({
    week_start: w.week_start,
    booked: w.days.reduce((sum, d) => sum + d.visits.filter(v => !v.is_past).length, 0),
  }));

  // Headline narrative
  let headline;
  const nextBookedDay = weeks.flatMap(w => w.days).find(d => d.is_future && d.visit_count > 0);
  if (totalScheduled === 0 && totalCompleted > 0) {
    headline = `${totalCompleted} visits completed in the window, nothing booked forward yet — risk of a quiet pipeline coming up.`;
  } else if (totalScheduled > 0 && nextBookedDay) {
    const upcoming = visitsPerUpcomingWeek.reduce((s, w) => s + w.booked, 0);
    headline = `${upcoming} farm visit${upcoming === 1 ? '' : 's'} booked in the next ${futureWeeks} weeks. Next: ${nextBookedDay.date} (${nextBookedDay.visit_count} visit${nextBookedDay.visit_count === 1 ? '' : 's'}).`;
  } else {
    headline = `${totalVisits} visits in the window. ${totalCompleted} completed · ${totalScheduled} booked · ${totalNoShow} past with no completion logged.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    rep: { name: 'Hobbs', owner_id: HOBBS_OWNER_ID },
    window: {
      since_iso: isoDay(sinceMs),
      until_iso: isoDay(untilMs),
      past_weeks: pastWeeks,
      future_weeks: futureWeeks,
      today_iso: isoDay(today),
    },
    totals: {
      visits: totalVisits,
      completed: totalCompleted,
      scheduled: totalScheduled,
      no_show: totalNoShow,
    },
    visits_per_upcoming_week: visitsPerUpcomingWeek,
    weeks,
    headline,
    caveats: [
      `Only Hobbs's visits (HubSpot owner ${HOBBS_OWNER_ID}). For other reps, parameterise the engine.`,
      `"No-show" = meeting_date in past, storm_boy__meeting_completed != 'Yes'. Could also mean the rep forgot to mark it complete — worth a manual cross-check.`,
      `NRM region inferred from contact postcode (when populated). Helpful for clustering visit locations.`,
    ],
    from_cache: false,
  };
  _cache = { generated_at: Date.now(), result };
  return result;
}

module.exports = { run };
