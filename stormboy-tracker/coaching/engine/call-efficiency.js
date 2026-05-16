/**
 * Call efficiency metrics — calls made vs farm visits booked, per week.
 *
 * Answers Will's product-refinement ask (2026-05-14): "Are we doing that by
 * having to make 20 calls or 70 calls? I'd love to get to the point where
 * 20 phone calls produces 10 farm visits."
 *
 * Definitions:
 *   - Calls counted = outbound calls by Storm Boy team owners (Will, Claudia,
 *     Hobbs, Ben) in the last TRENDED_WEEKS. Aircall syncs into HubSpot so
 *     this captures the team's outbound dialling activity.
 *   - Visits = the farm-visit count for that week (same source as the
 *     /api/stats/farm-visits trend — contacts with storm_boy__meeting_date
 *     falling in that ISO week).
 *   - Conversion ratio = visits_in_week / calls_in_week
 *   - Calls per visit = calls_in_week / visits_in_week (Will's preferred framing)
 */

const HUBSPOT_BASE = 'https://api.hubapi.com';
const TRENDED_WEEKS = 12;

// Storm Boy operational team owners. `is_sales_rep` flag determines whether
// they count toward the team-target fair-share denominator. Will = Head of
// Operations, kept in the calls pull so we still see his volume if he calls,
// but excluded from the sales-rep target denominator.
const TEAM_OWNERS = {
  '76812243':  { name: 'Ben',     is_sales_rep: true },
  '78272376':  { name: 'Claudia', is_sales_rep: true },
  '361236574': { name: 'Hobbs',   is_sales_rep: true },
  '361823546': { name: 'Will',    is_sales_rep: false }, // Head of Operations, not a sales rep
};
// Convenience views — keep the old shape working with minimal code change.
const TEAM_OWNER_NAMES = Object.fromEntries(
  Object.entries(TEAM_OWNERS).map(([id, o]) => [id, o.name])
);
const SALES_REP_OWNERS = Object.fromEntries(
  Object.entries(TEAM_OWNERS).filter(([, o]) => o.is_sales_rep).map(([id, o]) => [id, o.name])
);

function weekStart(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return monday.toISOString().slice(0, 10);
}
function currentWeekStart() { return weekStart(new Date().toISOString()); }
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

// Build the set of "existing customer" contact ids — anyone associated with a
// closed-won deal. Calls to these contacts are servicing, not prospecting, and
// must be excluded from the team-target metrics.
async function buildCustomerContactIds(token) {
  const set = new Set();
  // Fetch all closed-won deals (paginate)
  let after;
  let safety = 100;
  while (safety-- > 0) {
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'dealstage', operator: 'EQ', value: '231921676' }] }],
      properties: ['dealname'],
      limit: 100,
    };
    if (after) body.after = after;
    const res = await fetch(HUBSPOT_BASE + '/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) break;
    const page = await res.json();
    const dealIds = (page.results || []).map(d => d.id);
    // Batch fetch deal→contact associations
    for (let i = 0; i < dealIds.length; i += 100) {
      const slice = dealIds.slice(i, i + 100);
      const assocRes = await fetch(HUBSPOT_BASE + '/crm/v4/associations/deals/contacts/batch/read', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: slice.map(id => ({ id })) }),
      });
      if (!assocRes.ok) continue;
      const data = await assocRes.json();
      (data.results || []).forEach(r => {
        (r.to || []).forEach(t => set.add(String(t.toObjectId)));
      });
    }
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return set;
}

// For a batch of call ids, fetch each call's associated contact ids.
async function fetchCallContacts(token, callIds) {
  const map = {};
  for (let i = 0; i < callIds.length; i += 100) {
    const slice = callIds.slice(i, i + 100);
    const res = await fetch(HUBSPOT_BASE + '/crm/v4/associations/calls/contacts/batch/read', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: slice.map(id => ({ id: String(id) })) }),
    });
    if (!res.ok) continue;
    const data = await res.json();
    (data.results || []).forEach(r => {
      const fromId = r.from && r.from.id;
      if (!fromId) return;
      map[fromId] = (r.to || []).map(t => String(t.toObjectId));
    });
  }
  return map;
}

async function fetchAllCalls(token, sinceTimestampMs, ownerIds) {
  const all = [];
  let after = undefined;
  let safety = 100;
  while (safety-- > 0) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: String(sinceTimestampMs) },
          { propertyName: 'hs_call_direction', operator: 'EQ', value: 'OUTBOUND' },
          { propertyName: 'hubspot_owner_id', operator: 'IN', values: ownerIds },
        ]
      }],
      properties: ['hs_timestamp', 'hubspot_owner_id', 'hs_call_direction', 'hs_call_disposition', 'hs_call_duration'],
      sorts: [{ propertyName: 'hs_timestamp', direction: 'DESCENDING' }],
      limit: 100,
    };
    if (after) body.after = after;
    const res = await fetch(HUBSPOT_BASE + '/crm/v3/objects/calls/search', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error('HubSpot calls search ' + res.status + ': ' + text.slice(0, 200));
    }
    const page = await res.json();
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return all;
}

// Reuse the farm-visit logic to count meeting bookings per week.
async function fetchVisitsByWeek(token) {
  const body = {
    filterGroups: [{
      filters: [
        { propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' },
        { propertyName: 'storm_boy__meeting_date', operator: 'HAS_PROPERTY' },
      ]
    }],
    properties: ['storm_boy__meeting_date'],
    limit: 100,
  };
  const all = [];
  let after = undefined;
  let safety = 100;
  while (safety-- > 0) {
    const b = { ...body };
    if (after) b.after = after;
    const res = await fetch(HUBSPOT_BASE + '/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    if (!res.ok) throw new Error('HubSpot contacts search ' + res.status);
    const page = await res.json();
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  const byWeek = {};
  all.forEach(c => {
    const d = c.properties.storm_boy__meeting_date;
    if (!d) return;
    const w = weekStart(d);
    if (!w) return;
    byWeek[w] = (byWeek[w] || 0) + 1;
  });
  return byWeek;
}

async function run() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const weeks = lastNWeeks(TRENDED_WEEKS);
  const earliest = new Date(weeks[0] + 'T00:00:00Z').getTime();
  const ownerIds = Object.keys(TEAM_OWNERS);

  const [calls, visitsByWeek, customerContactIds] = await Promise.all([
    fetchAllCalls(token, earliest, ownerIds),
    fetchVisitsByWeek(token),
    buildCustomerContactIds(token),
  ]);

  // For each call, get its associated contact ids → tag prospecting vs service.
  // A call is "service" if EVERY associated contact is an existing customer
  // (touches only contacts associated with a closed-won deal). A call with
  // mixed associations or no associations falls through as prospecting (the
  // safe default — under-filter rather than over-filter).
  const callIds = calls.map(c => c.id);
  const callContactsMap = await fetchCallContacts(token, callIds);
  let serviceCount = 0;
  calls.forEach(c => {
    const cIds = callContactsMap[c.id] || [];
    const isService = cIds.length > 0 && cIds.every(id => customerContactIds.has(id));
    c.is_service = isService;
    c.is_prospecting = !isService;
    if (isService) serviceCount++;
  });
  // Filter to prospecting-only for all downstream metrics.
  const prospectingCalls = calls.filter(c => c.is_prospecting);
  console.log(`[call-efficiency] customer set: ${customerContactIds.size} contacts · ${calls.length} calls total · ${prospectingCalls.length} prospecting / ${serviceCount} service`);

  // Bucket calls by week + by owner
  const callsByWeek = {};
  const callsByWeekOwner = {};
  prospectingCalls.forEach(c => {
    const ts = c.properties.hs_timestamp;
    if (!ts) return;
    const w = weekStart(ts);
    if (!w) return;
    callsByWeek[w] = (callsByWeek[w] || 0) + 1;
    const owner = c.properties.hubspot_owner_id;
    if (owner) {
      callsByWeekOwner[w] = callsByWeekOwner[w] || {};
      callsByWeekOwner[w][owner] = (callsByWeekOwner[w][owner] || 0) + 1;
    }
  });

  // Build trend rows. Skip weeks before the trend window starts.
  const trend = weeks.map(w => {
    const calls = callsByWeek[w] || 0;
    const visits = visitsByWeek[w] || 0;
    const callsPerVisit = visits > 0 ? calls / visits : null;
    const visitRate = calls > 0 ? visits / calls : null;
    const byOwner = callsByWeekOwner[w] || {};
    return {
      week_start: w,
      calls,
      visits,
      calls_per_visit: callsPerVisit !== null ? Math.round(callsPerVisit * 10) / 10 : null,
      visit_rate: visitRate !== null ? Math.round(visitRate * 1000) / 1000 : null,
      by_owner: Object.entries(byOwner).map(([id, n]) => ({ owner: TEAM_OWNER_NAMES[id] || ('owner-' + id), calls: n })),
    };
  });

  // Headline numbers from the trailing window
  const totalCalls = trend.reduce((s, x) => s + x.calls, 0);
  const totalVisits = trend.reduce((s, x) => s + x.visits, 0);
  const avgCallsPerVisit = totalVisits > 0 ? totalCalls / totalVisits : null;
  const avgVisitRate = totalCalls > 0 ? totalVisits / totalCalls : null;

  // This vs last week
  const cur = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  const efficiencyDelta = (prev && prev.calls_per_visit !== null && cur && cur.calls_per_visit !== null)
    ? Math.round((prev.calls_per_visit - cur.calls_per_visit) * 10) / 10
    : null;

  // Per-rep aggregate over the window — prospecting-only
  const repTotals = {};
  prospectingCalls.forEach(c => {
    const owner = c.properties.hubspot_owner_id;
    if (!owner) return;
    const name = TEAM_OWNER_NAMES[owner] || ('owner-' + owner);
    repTotals[name] = (repTotals[name] || 0) + 1;
  });
  const byRep = Object.entries(repTotals)
    .map(([rep, n]) => ({ rep, calls: n }))
    .sort((a, b) => b.calls - a.calls);

  // Will's target (2026-05-14): 20 calls -> 10 visits = 2 calls per visit.
  const TARGET_CALLS_PER_VISIT = 2;
  const onTarget = avgCallsPerVisit !== null && avgCallsPerVisit <= TARGET_CALLS_PER_VISIT;

  // ---- Team call-volume target (Stormboy standup 2026-05-15) ----
  // Team target: 100 calls/week across the Storm Boy callers.
  // Configurable via env so it can be tuned without code change.
  const TEAM_TARGET_PER_WEEK = Number(process.env.CALL_TEAM_WEEKLY_TARGET) > 0
    ? Number(process.env.CALL_TEAM_WEEKLY_TARGET)
    : 100;

  // Pacing — what fraction of the week is elapsed and where should we be by now?
  // Working week = Mon-Fri (5 business days). Sat/Sun count as Friday for pacing
  // since the work week is over.
  const now = new Date();
  const dow = now.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Days into the working week (1-5). Mon→1, Tue→2, ..., Fri→5, Sat/Sun→5.
  const businessDayIdx = dow === 0 || dow === 6 ? 5 : dow;
  const businessDaysElapsed = businessDayIdx;
  const businessDaysRemaining = Math.max(0, 5 - businessDayIdx);
  const expectedByToday = Math.round((businessDaysElapsed / 5) * TEAM_TARGET_PER_WEEK);
  const onPace = (cur.calls || 0) >= expectedByToday;
  const callsNeeded = Math.max(0, TEAM_TARGET_PER_WEEK - (cur.calls || 0));
  const neededPerRemainingDay = businessDaysRemaining > 0
    ? Math.ceil(callsNeeded / businessDaysRemaining)
    : 0;

  // Per-rep contribution this week, with each rep's share of target.
  // Fair-share denominator = sales reps only (Will is Head of Ops, excluded).
  const thisWeekByOwner = callsByWeekOwner[cur.week_start] || {};
  const teamCallsThisWeek = cur.calls || 0;
  const salesRepCount = Object.keys(SALES_REP_OWNERS).length;
  const repTargetShare = salesRepCount > 0
    ? Math.round(TEAM_TARGET_PER_WEEK / salesRepCount)
    : 0;
  const perRepThisWeek = Object.entries(TEAM_OWNERS).map(([id, owner]) => {
    const c = thisWeekByOwner[id] || 0;
    return {
      owner_id: id,
      rep: owner.name,
      is_sales_rep: owner.is_sales_rep,
      calls: c,
      pct_of_team: teamCallsThisWeek > 0 ? Math.round((c / teamCallsThisWeek) * 100) : 0,
      pct_of_fair_share: owner.is_sales_rep && repTargetShare > 0
        ? Math.round((c / repTargetShare) * 100)
        : null, // ops roles don't have a fair-share — they're not on the call target
    };
  }).sort((a, b) => b.calls - a.calls);

  return {
    generated_at: new Date().toISOString(),
    trend_window_weeks: TRENDED_WEEKS,
    team_owners: Object.values(TEAM_OWNERS).map(o => o.name),
    sales_reps: Object.values(SALES_REP_OWNERS),
    trend,
    totals: {
      calls: totalCalls,
      visits: totalVisits,
      avg_calls_per_visit: avgCallsPerVisit !== null ? Math.round(avgCallsPerVisit * 10) / 10 : null,
      avg_visit_rate: avgVisitRate !== null ? Math.round(avgVisitRate * 1000) / 1000 : null,
    },
    this_week: cur,
    last_week: prev,
    efficiency_wow: efficiencyDelta,
    by_rep: byRep,
    target: {
      calls_per_visit: TARGET_CALLS_PER_VISIT,
      framing: 'Will\'s ask 2026-05-14: 20 calls for 10 visits.',
      on_target: onTarget,
    },
    // Call categorisation (Stormboy standup 2026-05-15 — exclude existing-customer service calls)
    call_pipeline_filter: {
      total_calls_in_window: calls.length,
      prospecting_calls: prospectingCalls.length,
      service_calls: serviceCount,
      customer_contact_set_size: customerContactIds.size,
      note: 'Service calls = those whose every associated contact is in the closed-won customer set. Excluded from all metrics below.',
    },
    // Team call-volume target — populated 2026-05-15 from Stormboy standup
    team_target: {
      target_per_week: TEAM_TARGET_PER_WEEK,
      this_week_calls: teamCallsThisWeek,
      pct_of_target: Math.round((teamCallsThisWeek / TEAM_TARGET_PER_WEEK) * 100),
      business_days_elapsed: businessDaysElapsed,
      business_days_remaining: businessDaysRemaining,
      expected_by_today: expectedByToday,
      on_pace: onPace,
      gap_vs_pace: teamCallsThisWeek - expectedByToday,
      calls_needed: callsNeeded,
      needed_per_remaining_day: neededPerRemainingDay,
      per_rep: perRepThisWeek,
      fair_share_per_rep: repTargetShare,
    },
  };
}

module.exports = { run };
