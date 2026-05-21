/**
 * Geographic insights — per-Australian-state performance breakdown
 * for Storm Boy contacts + associated deals.
 *
 * Why not NRM regions? HubSpot doesn't have a formal NRM region
 * property; deriving NRM from postcode requires the ABS NRM region
 * shapefile (or equivalent lookup). Out of scope for this round —
 * state-level granularity is the practical first step that uses
 * data we already have.
 *
 * Data sources:
 *   - Storm Boy contacts (storm_boy_campaign_member = Yes) with
 *     state property populated (~18% of contacts in current data)
 *   - Their associated deals + outcomes
 *
 * Per state:
 *   - Contact count
 *   - Won deals + win rate (where deal data exists)
 *   - Median cycle time
 *   - Total hectares enrolled (sum of project_ha for won deals)
 *
 * Normalizes state variants:
 *   - "NSW" / "New South Wales" → NSW
 *   - "VIC" / "Victoria" → VIC
 *   - "QLD" / "Queensland" → QLD
 *   - "SA" / "South Australia" → SA
 *   - "WA" / "Western Australia" → WA
 *   - "TAS" / "Tasmania" → TAS
 *   - "NT" / "Northern Territory" → NT
 *   - "ACT" / "Australian Capital Territory" → ACT
 *
 * 1-hour disk cache; ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'geographic-insights.json');
const CACHE_TTL_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const STATE_NORMALIZE = (s) => {
  if (!s) return null;
  const k = s.trim().toLowerCase();
  if (/^(nsw|new south wales)$/i.test(k))                              return 'NSW';
  if (/^(vic|victoria)$/i.test(k))                                     return 'VIC';
  if (/^(qld|queensland)$/i.test(k))                                   return 'QLD';
  if (/^(sa|south australia)$/i.test(k))                               return 'SA';
  if (/^(wa|western australia)$/i.test(k))                             return 'WA';
  if (/^(tas|tasmania)$/i.test(k))                                     return 'TAS';
  if (/^(nt|northern territory)$/i.test(k))                            return 'NT';
  if (/^(act|australian capital territory)$/i.test(k))                 return 'ACT';
  // Unknown — bucket as "(unverified)" rather than treating cities/garbage
  // as states. The dashboard surfaces the data-hygiene gap honestly.
  return '(unverified)';
};

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}`);
  return res.json();
}

async function fetchContacts(token) {
  const all = [];
  let after;
  while (all.length < 10000) {
    const body = {
      filterGroups: [{ filters: [
        { propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' },
      ]}],
      properties: ['firstname', 'lastname', 'state', 'state_region', 'city',
                   'total_property_ha', 'contact_lead_stage_storm_boy',
                   'storm_boy__meeting_date', 'storm_boy__meeting_completed'],
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

// Fetch closed deals so we can attribute outcomes per state via
// associated contacts.
async function fetchClosedDealsLastN(token, monthsBack) {
  const sinceMs = Date.now() - monthsBack * 30 * DAY_MS;
  const out = [];
  for (const stage of ['231921676', 'closedlost']) {
    let after;
    while (out.length < 5000) {
      const body = {
        filterGroups: [{ filters: [
          { propertyName: 'dealstage', operator: 'EQ',  value: stage },
          { propertyName: 'closedate', operator: 'GTE', value: String(sinceMs) },
        ]}],
        properties: ['dealname', 'dealstage', 'createdate', 'closedate', 'partner',
                     'estimated_project_ha', 'total_property_hectares'],
        limit: 100,
      };
      if (after) body.after = after;
      const page = await hubspotPost(token, '/crm/v3/objects/deals/search', body);
      out.push(...(page.results || []));
      after = page.paging && page.paging.next && page.paging.next.after;
      if (!after) break;
    }
  }
  return out;
}

async function fetchDealContactAssoc(token, dealIds) {
  if (!dealIds.length) return {};
  const map = {};
  for (let i = 0; i < dealIds.length; i += 100) {
    const batch = dealIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v4/associations/deals/contacts/batch/read', {
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(r => {
        const fromId = r.from && r.from.id;
        if (!fromId) return;
        map[fromId] = (r.to || []).map(t => String(t.toObjectId));
      });
    } catch (e) {
      console.warn('[geographic-insights] deal assoc batch failed:', e.message);
    }
  }
  return map;
}

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
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
  } catch (e) { console.error('[geographic-insights] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const [contacts, deals] = await Promise.all([
    fetchContacts(token),
    fetchClosedDealsLastN(token, 24),
  ]);

  // Build contact_id → state map
  const contactState = {};
  let contactsWithState = 0;
  contacts.forEach(c => {
    const raw = c.properties.state || c.properties.state_region;
    const norm = STATE_NORMALIZE(raw);
    if (norm) {
      contactState[c.id] = norm;
      contactsWithState++;
    }
  });

  // For each deal, attribute to a state via its associated contacts
  // (exclude LawrieCo).
  const dealsClean = deals.filter(d => (d.properties.partner || '').trim() !== 'LawrieCo');
  const dealIds = dealsClean.map(d => d.id);
  const dealContactMap = await fetchDealContactAssoc(token, dealIds);

  const stateData = {};
  function ensureState(state) {
    if (!stateData[state]) {
      stateData[state] = {
        state,
        contact_count: 0,
        contacts_with_visits: 0,
        deals_count: 0,
        won: 0,
        lost: 0,
        cycle_days: [],
        won_hectares: 0,
        sample_contact_names: [],
      };
    }
    return stateData[state];
  }
  contacts.forEach(c => {
    const state = contactState[c.id];
    if (!state) return;
    const s = ensureState(state);
    s.contact_count++;
    if (c.properties.storm_boy__meeting_date) s.contacts_with_visits++;
    if (s.sample_contact_names.length < 3) {
      const name = [c.properties.firstname, c.properties.lastname].filter(Boolean).join(' ');
      if (name) s.sample_contact_names.push(name);
    }
  });

  dealsClean.forEach(d => {
    const p = d.properties;
    const associatedContacts = dealContactMap[d.id] || [];
    // First associated contact with a state wins
    let state = null;
    for (const cid of associatedContacts) {
      if (contactState[cid]) { state = contactState[cid]; break; }
    }
    if (!state) return;
    const s = ensureState(state);
    s.deals_count++;
    if (p.dealstage === '231921676') {
      s.won++;
      s.won_hectares += parseFloat(p.estimated_project_ha || 0) || 0;
    } else {
      s.lost++;
    }
    const created = Date.parse(p.createdate || 0);
    const closed = Date.parse(p.closedate || 0);
    if (created && closed && closed > created) {
      s.cycle_days.push((closed - created) / DAY_MS);
    }
  });

  // Roll up — sort by contact count
  const states = Object.values(stateData)
    .filter(s => s.contact_count > 0 || s.deals_count > 0)
    .map(s => ({
      state: s.state,
      contact_count: s.contact_count,
      contacts_with_visits: s.contacts_with_visits,
      deals_count: s.deals_count,
      won: s.won,
      lost: s.lost,
      win_rate_pct: (s.won + s.lost) > 0 ? Math.round((s.won / (s.won + s.lost)) * 1000) / 10 : null,
      median_cycle_d: median(s.cycle_days) ? Math.round(median(s.cycle_days)) : null,
      won_hectares: Math.round(s.won_hectares),
      sample_contact_names: s.sample_contact_names,
    }))
    .sort((a, b) => b.contact_count - a.contact_count);

  // Headline — highest hectares-won, or best win-rate among states with material n
  let headline;
  const matStates = states.filter(s => (s.won + s.lost) >= 5);
  if (matStates.length) {
    const topWin = matStates.slice().sort((a, b) => b.win_rate_pct - a.win_rate_pct)[0];
    const topHa = states.slice().sort((a, b) => b.won_hectares - a.won_hectares)[0];
    headline = `${topHa.state} leads in hectares enrolled (${topHa.won_hectares.toLocaleString()} ha across ${topHa.won} wins). ${topWin.state} has the highest win rate (${topWin.win_rate_pct}% on ${topWin.won + topWin.lost} closed).`;
  } else {
    headline = `${contactsWithState} of ${contacts.length} contacts (${Math.round((contactsWithState/contacts.length)*100)}%) have state populated — geographic signal is thin. Most contacts need state data filled in to unlock this view.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    total_contacts: contacts.length,
    contacts_with_state: contactsWithState,
    pct_with_state: contacts.length > 0 ? Math.round((contactsWithState/contacts.length)*1000)/10 : 0,
    states,
    headline,
    caveats: [
      `Only ${contactsWithState}/${contacts.length} (${Math.round((contactsWithState/contacts.length)*100)}%) of Storm Boy contacts have state populated. Geographic signal is thin until this is filled in.`,
      `Deal-state attribution uses the first associated contact with a state — multi-contact deals may misattribute.`,
      `Excludes LawrieCo (partner channel — different motion).`,
      `State-level only. NRM region breakdown requires postcode → ABS NRM lookup; not implemented this round.`,
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
