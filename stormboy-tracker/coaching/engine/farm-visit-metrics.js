/**
 * Farm visit booking metrics — feeds the STATS tab's farm-visit section.
 *
 * Definitions:
 *   - A "booking" = a Storm Boy contact whose storm_boy__meeting_date is set.
 *     Covers currently-booked, completed-visit, and progressed-past-visit contacts.
 *     Once a meeting date is set, the booking happened — counts as one regardless
 *     of whether the visit later got cancelled or completed.
 *   - "This week" / "last week" use ISO week boundaries (Mon-Sun) in server local time.
 *   - Goal = FARM_VISIT_WEEKLY_GOAL env var, defaulting to 8 (per Kieren's framing
 *     in the 2026-05-12 SLT — "the team produced 8 farm visits booked last week").
 *
 * Lifetime total + last 12 weeks trend + this/last week + running average + vs goal.
 */

const HUBSPOT_BASE = 'https://api.hubapi.com';
const TRENDED_WEEKS = 12;

function getGoal() {
  const g = Number(process.env.FARM_VISIT_WEEKLY_GOAL);
  return Number.isFinite(g) && g > 0 ? g : 8;
}

async function fetchAll(token, filterGroups, properties) {
  const all = [];
  let after = undefined;
  let safety = 50;
  while (safety-- > 0) {
    const body = { filterGroups, properties, limit: 100 };
    if (after) body.after = after;
    const res = await fetch(HUBSPOT_BASE + '/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HubSpot contacts search ' + res.status);
    const page = await res.json();
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return all;
}

// Monday-start ISO week. Returns 'YYYY-MM-DD' for the Monday of the week containing iso.
function weekStart(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getUTCDay(); // 0 = Sun, 1 = Mon, …
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return monday.toISOString().slice(0, 10);
}

function currentWeekStart() {
  return weekStart(new Date().toISOString());
}

function previousWeekStart() {
  const cur = new Date(currentWeekStart() + 'T00:00:00Z');
  const prev = new Date(cur.getTime() - 7 * 24 * 60 * 60 * 1000);
  return prev.toISOString().slice(0, 10);
}

function lastNWeeks(n) {
  const cur = currentWeekStart();
  const weeks = [cur];
  let d = new Date(cur + 'T00:00:00Z');
  for (let i = 1; i < n; i++) {
    d = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
    weeks.unshift(d.toISOString().slice(0, 10));
  }
  return weeks;
}

async function run() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // Storm Boy contacts with a meeting date set
  const filterGroups = [{
    filters: [
      { propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' },
      { propertyName: 'storm_boy__meeting_date', operator: 'HAS_PROPERTY' },
    ]
  }];
  const properties = [
    'firstname', 'lastname', 'storm_boy__meeting_date', 'contact_lead_stage_storm_boy',
    'storm_boy__meeting_completed', 'hubspot_owner_id', 'createdate',
  ];
  const contacts = await fetchAll(token, filterGroups, properties);

  // Bucket by week of meeting date
  const byWeek = {};
  let lifetimeTotal = 0;
  contacts.forEach(c => {
    const d = c.properties.storm_boy__meeting_date;
    if (!d) return;
    lifetimeTotal++;
    const w = weekStart(d);
    if (!w) return;
    byWeek[w] = (byWeek[w] || 0) + 1;
  });

  // Trended last N weeks
  const weeks = lastNWeeks(TRENDED_WEEKS);
  const trend = weeks.map(w => ({ week_start: w, bookings: byWeek[w] || 0 }));

  const thisWeek = byWeek[currentWeekStart()] || 0;
  const lastWeek = byWeek[previousWeekStart()] || 0;
  const wow = thisWeek - lastWeek;

  // Average over the trended window
  const windowBookings = trend.reduce((s, x) => s + x.bookings, 0);
  const averagePerWeek = windowBookings / TRENDED_WEEKS;

  const goal = getGoal();
  const vsGoalPct = (averagePerWeek / goal) * 100;

  return {
    generated_at: new Date().toISOString(),
    lifetime_total: lifetimeTotal,
    this_week: { week_start: currentWeekStart(), bookings: thisWeek },
    last_week: { week_start: previousWeekStart(), bookings: lastWeek },
    week_on_week_delta: wow,
    trend_window_weeks: TRENDED_WEEKS,
    trend,
    average_per_week: Math.round(averagePerWeek * 10) / 10,
    goal_per_week: goal,
    vs_goal_pct: Math.round(vsGoalPct * 10) / 10,
    on_track: averagePerWeek >= goal * 0.85,
    n_contacts_with_meeting: contacts.length,
  };
}

module.exports = { run };
