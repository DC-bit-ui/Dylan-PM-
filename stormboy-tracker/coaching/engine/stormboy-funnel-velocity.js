/**
 * Stormboy contact funnel velocity — Section 7 of the STATS redesign.
 *
 * The outreach motion lives in the CONTACT funnel, not the deal funnel:
 *   Identified → In Conversation → Farm Visit booked → Farm Visit
 *   completed → In Sales Pipeline → Exited
 * Deal funnel only catches contacts after they've reached In Sales
 * Pipeline. Section 6 (friction map) answers "where do deals die";
 * this one answers "is the outreach motion itself working".
 *
 * Per stage, computes:
 *   - currently_at:    count of contacts whose contact_lead_stage_storm_boy
 *                      equals this stage right now
 *   - ever_reached:    currently_at + count_in_all_later_stages
 *                      (proxy — assumes movement is forward-only)
 *   - conversion_to_next_pct: ever_reached[next] / ever_reached[this]
 *   - median_days_in_current_stage: median of (now - lastmodifieddate)
 *                                   for contacts currently at this stage.
 *                                   Approximate (lastmodifieddate fires
 *                                   on any property change, not just
 *                                   stage transitions) but useful enough
 *                                   to see "where contacts are sitting".
 *   - p75_days_in_current_stage: same calc, p75 — used to flag stuck.
 *   - stuck_count: contacts currently at this stage with days_in_stage
 *                  > p75 of historical Stormboy-era close window (28d).
 *
 * Stalled signal: a stage where conversion_to_next is < HALF of the
 * weakest healthy transition above it AND has materially non-zero
 * volume = the biggest drop-off in the outreach motion.
 *
 * 4h disk cache; ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const FUNNEL_STAGES = [
  'Identified',
  'In Conversation',
  'Farm Visit booked',
  'Farm Visit completed',
  'In Sales Pipeline',
  'Exited',
];
const STUCK_DAYS_THRESHOLD = 28;
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'stormboy-funnel-velocity.json');
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

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

async function fetchAllStormboyContacts(token) {
  const all = [];
  let after;
  while (all.length < 10000) {
    const body = {
      filterGroups: [{
        filters: [{ propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' }],
      }],
      properties: [
        'contact_lead_stage_storm_boy', 'createdate', 'lastmodifieddate',
        'notes_last_contacted', 'hubspot_owner_id',
      ],
      sorts: [{ propertyName: 'lastmodifieddate', direction: 'DESCENDING' }],
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

function daysBetween(ms1, ms2) {
  return Math.max(0, (ms2 - ms1) / (24 * 60 * 60 * 1000));
}
function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}
function quantile(arr, q) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const i = q * (s.length - 1);
  const lo = Math.floor(i), hi = Math.ceil(i);
  if (lo === hi) return s[lo];
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
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
  } catch (e) { console.error('[stormboy-funnel-velocity] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const contacts = await fetchAllStormboyContacts(token);
  console.log(`[stormboy-funnel-velocity] ${contacts.length} stormboy contacts`);

  // Per-stage: list of contacts currently at this stage + their dwell days
  const stageContacts = {};
  FUNNEL_STAGES.forEach(s => { stageContacts[s] = []; });
  let unstaged = 0, notEligible = 0;
  const now = Date.now();

  contacts.forEach(c => {
    const stage = c.properties.contact_lead_stage_storm_boy;
    if (!stage) { unstaged++; return; }
    if (stage === 'Not Eligible') { notEligible++; return; }
    if (!stageContacts[stage]) return;
    // Days in current stage proxy: now - lastmodifieddate (last property
    // change). Crude — could be any property, not necessarily a stage
    // change. For Identified contacts that haven't been touched, this
    // approximates "how long they've been sitting".
    const lastMod = Date.parse(c.properties.lastmodifieddate || c.properties.createdate || '');
    const created = Date.parse(c.properties.createdate || '');
    const daysInStage = lastMod ? daysBetween(lastMod, now) : null;
    const ageDays = created ? daysBetween(created, now) : null;
    stageContacts[stage].push({
      id: c.id,
      days_in_stage: daysInStage,
      age_days: ageDays,
    });
  });

  // Build per-stage rollups
  const stageData = FUNNEL_STAGES.map((stage, idx) => {
    const items = stageContacts[stage];
    const dwellDays = items.map(x => x.days_in_stage).filter(x => x != null);
    const med = median(dwellDays);
    const p75 = quantile(dwellDays, 0.75);
    const stuckCount = items.filter(x => x.days_in_stage != null && x.days_in_stage > STUCK_DAYS_THRESHOLD).length;
    return {
      stage,
      stage_index: idx,
      currently_at: items.length,
      median_days_in_stage: med != null ? Math.round(med) : null,
      p75_days_in_stage: p75 != null ? Math.round(p75) : null,
      stuck_count: stuckCount,
      stuck_pct: items.length ? Math.round((stuckCount / items.length) * 1000) / 10 : 0,
    };
  });

  // Cumulative "ever reached" = currently_at this stage + all later
  // stages' currently_at counts (assuming forward-only progression).
  // For each transition, conversion_to_next = ever_reached[next] /
  // ever_reached[this].
  for (let i = 0; i < stageData.length; i++) {
    let ever = 0;
    for (let j = i; j < stageData.length; j++) ever += stageData[j].currently_at;
    stageData[i].ever_reached = ever;
  }
  for (let i = 0; i < stageData.length - 1; i++) {
    const here = stageData[i].ever_reached;
    const next = stageData[i + 1].ever_reached;
    stageData[i].conversion_to_next_pct = here === 0 ? null : Math.round((next / here) * 1000) / 10;
    stageData[i].dropoff_count = Math.max(0, here - next);
  }

  // Headline: the transition with the biggest dropoff_count among
  // stages where the source had material volume (≥10 ever-reached).
  let biggest = null;
  for (let i = 0; i < stageData.length - 1; i++) {
    const here = stageData[i];
    if (here.ever_reached < 10) continue;
    if (!biggest || here.dropoff_count > biggest.dropoff_count) {
      biggest = {
        from_stage: here.stage,
        to_stage: stageData[i + 1].stage,
        from_ever: here.ever_reached,
        to_ever: stageData[i + 1].ever_reached,
        dropoff_count: here.dropoff_count,
        conversion_pct: here.conversion_to_next_pct,
      };
    }
  }

  // Top-of-funnel total identified (anyone who ever reached the funnel
  // is currently_at Identified or any later stage)
  const totalEverEntered = stageData[0].ever_reached;

  const result = {
    generated_at: new Date().toISOString(),
    total_contacts: contacts.length,
    unstaged,
    not_eligible: notEligible,
    total_ever_entered_funnel: totalEverEntered,
    stages: stageData,
    biggest_dropoff: biggest,
    caveats: [
      `Days-in-stage uses lastmodifieddate as proxy — any property change updates this, not just stage transitions. So "stuck for 60d" means "no property change in 60d", which usually maps to "no activity" but isn't strict stage dwell.`,
      `Stage progression assumed forward-only. A contact that exits then re-enters would inflate ever_reached counts upstream. Sample noise on this is small (Exited count is 0 in current data).`,
      `"In Sales Pipeline" and "Exited" counts being 0 may reflect a tracking gap: contacts who get a deal in HubSpot's Deals pipeline may not have their contact_lead_stage_storm_boy auto-updated. Worth a HubSpot workflow check.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
