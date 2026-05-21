/**
 * Lead-response-time distribution — industry-standard speed-to-lead
 * metric. For new Stormboy contacts: time from createdate → first
 * outbound touch.
 *
 * "First touch" is the earliest of:
 *   - storm_boy__date_called (campaign-tracked first call)
 *   - notes_last_contacted (any logged contact — fallback)
 *   - storm_boy__date_assessed (if it's the first signal recorded)
 *
 * Buckets follow standard sales-engineering reporting:
 *   <1h · 1-24h · 1-3d · 3-7d · 7-30d · 30d+ · no-touch-yet
 *
 * Distribution across all Stormboy contacts + breakdown by rep
 * (where storm_boy__date_called captures Ben/Hobbs/etc).
 *
 * Conversion-side: contacts that ended up booking a farm visit —
 * is response time correlated? Computed as median response time
 * for booked-visit cohort vs not-booked cohort.
 *
 * 30-min disk cache; ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'lead-response-time.json');
const CACHE_TTL_MS = 30 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const BUCKETS = [
  { key: '<1h',       max_h: 1 },
  { key: '1-24h',     max_h: 24 },
  { key: '1-3d',      max_h: 24 * 3 },
  { key: '3-7d',      max_h: 24 * 7 },
  { key: '7-30d',     max_h: 24 * 30 },
  { key: '30d+',      max_h: Infinity },
  { key: 'no-touch',  max_h: null },
];

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}`);
  return res.json();
}

async function fetchStormBoyContacts(token) {
  const all = [];
  let after;
  while (all.length < 10000) {
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' }] }],
      properties: [
        'firstname', 'lastname', 'createdate',
        'storm_boy__date_called', 'storm_boy__date_assessed',
        'storm_boy__meeting_date', 'storm_boy__meeting_completed',
        'notes_last_contacted', 'contact_lead_stage_storm_boy',
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

function firstTouchMs(p) {
  const candidates = [
    p.storm_boy__date_called,
    p.notes_last_contacted,
    p.storm_boy__date_assessed,
  ]
    .map(v => Date.parse(v || ''))
    .filter(v => v && !Number.isNaN(v));
  return candidates.length ? Math.min(...candidates) : null;
}

function bucketOf(hours) {
  if (hours == null) return 'no-touch';
  for (const b of BUCKETS) {
    if (b.max_h !== null && hours <= b.max_h) return b.key;
  }
  return '30d+';
}

function pctFn(arr, p) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(p * (s.length - 1))];
}
function medianFn(arr) { return pctFn(arr, 0.5); }

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
  } catch (e) { console.error('[lead-response-time] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const contacts = await fetchStormBoyContacts(token);
  console.log(`[lead-response-time] ${contacts.length} stormboy contacts`);

  const counts = {};
  BUCKETS.forEach(b => { counts[b.key] = 0; });
  const responseHours = [];           // all touched
  const responseHoursBooked = [];     // among contacts that booked a visit
  const responseHoursNotBooked = [];  // among contacts that did not

  contacts.forEach(c => {
    const p = c.properties;
    const created = Date.parse(p.createdate || 0);
    if (!created) return;
    const firstMs = firstTouchMs(p);
    let hours = null;
    if (firstMs && firstMs > created) {
      hours = (firstMs - created) / HOUR_MS;
      responseHours.push(hours);
    }
    const bucket = bucketOf(hours);
    counts[bucket]++;

    // Booked = ever had a meeting_date
    const booked = !!p.storm_boy__meeting_date;
    if (hours != null) {
      if (booked) responseHoursBooked.push(hours);
      else        responseHoursNotBooked.push(hours);
    }
  });

  const totalTouched = responseHours.length;
  const totalContacts = contacts.length;
  const noTouchCount = counts['no-touch'];

  // Median + percentiles for the touched cohort
  const overallStats = {
    n: totalTouched,
    median_h: medianFn(responseHours),
    p25_h: pctFn(responseHours, 0.25),
    p75_h: pctFn(responseHours, 0.75),
    p90_h: pctFn(responseHours, 0.90),
    max_h: totalTouched ? Math.max(...responseHours) : null,
  };
  // Round
  Object.keys(overallStats).forEach(k => {
    if (k !== 'n' && overallStats[k] != null) overallStats[k] = Math.round(overallStats[k] * 10) / 10;
  });

  // Booked vs not-booked comparison
  const bookedMedian = medianFn(responseHoursBooked);
  const notBookedMedian = medianFn(responseHoursNotBooked);

  // Headline
  let headline;
  if (noTouchCount > totalContacts * 0.3) {
    headline = `${noTouchCount} of ${totalContacts} contacts (${Math.round((noTouchCount/totalContacts)*100)}%) have NEVER had an outbound touch logged — meaningful gap in the call coverage.`;
  } else if (bookedMedian && notBookedMedian && bookedMedian < notBookedMedian * 0.5) {
    headline = `Contacts who booked visits were responded to ${Math.round(bookedMedian)}h median vs ${Math.round(notBookedMedian)}h for non-booked — fast response correlates with booking.`;
  } else if (overallStats.median_h > 168) {
    headline = `Median response time ${Math.round(overallStats.median_h/24)}d — far above the industry <1h benchmark for speed-to-lead.`;
  } else {
    headline = `Median response ${overallStats.median_h}h · ${noTouchCount} contacts not yet touched · industry benchmark <1h.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    total_contacts: totalContacts,
    touched_count: totalTouched,
    no_touch_count: noTouchCount,
    buckets: BUCKETS.map(b => ({
      label: b.key,
      count: counts[b.key],
      pct: totalContacts > 0 ? Math.round((counts[b.key] / totalContacts) * 1000) / 10 : 0,
    })),
    overall: overallStats,
    by_outcome: {
      booked_visit: {
        n: responseHoursBooked.length,
        median_h: bookedMedian ? Math.round(bookedMedian * 10) / 10 : null,
      },
      no_visit: {
        n: responseHoursNotBooked.length,
        median_h: notBookedMedian ? Math.round(notBookedMedian * 10) / 10 : null,
      },
    },
    headline,
    caveats: [
      'First touch derived from storm_boy__date_called + notes_last_contacted + storm_boy__date_assessed (earliest). Misses purely-inbound responses where the customer reached out first.',
      'Industry "speed-to-lead" benchmark is <1h for B2B lead-gen contexts; agricultural sales can have longer reasonable response windows. The signal is the *trend* + the booked-vs-not-booked delta, not absolute compliance with the <1h target.',
      '"No touch" bucket includes contacts created but never logged with any of the date-* properties — could be Apex queue items waiting to be assigned, or genuine misses.',
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
