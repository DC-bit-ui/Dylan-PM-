/**
 * Win timeline — flat list of all closed-won deals with channel attribution
 * for the STATS tab's horizontal timeline visualization.
 *
 * Each win in the returned array carries:
 *   - deal_id, deal_name, closedate, createdate, days_to_close
 *   - channel: { stormboy: bool, partner: string|null, direct: bool }
 *   - project_ha, total_ha
 *   - hubspot_url
 *
 * Channel attribution uses the same canonical logic as the wins-rail and
 * header-stats: contact-association lookup for storm_boy_campaign_member='Yes'.
 *
 * Filter / slicing happens client-side — the dataset is small (~60-200 wins
 * lifetime) and small enough to ship as one payload.
 */

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';

function num(x) { const n = parseFloat(x); return Number.isFinite(n) ? n : 0; }
function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

async function fetchAllWins(token) {
  const all = [];
  let after = undefined;
  let safety = 100;
  while (safety-- > 0) {
    const body = {
      filterGroups: [{
        filters: [{ propertyName: 'dealstage', operator: 'EQ', value: '231921676' }],
      }],
      properties: ['dealname', 'closedate', 'createdate', 'partner', 'lead_source',
                   'total_property_hectares', 'estimated_project_ha', 'hubspot_owner_id'],
      sorts: [{ propertyName: 'closedate', direction: 'DESCENDING' }],
      limit: 100,
    };
    if (after) body.after = after;
    const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v3/objects/deals/search', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HubSpot wins search ' + res.status);
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
  const map = {};
  for (let i = 0; i < dealIds.length; i += 100) {
    const slice = dealIds.slice(i, i + 100);
    const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v4/associations/deals/contacts/batch/read', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: slice.map(id => ({ id })) }),
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

async function fetchContactStormboyFlags(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const slice = contactIds.slice(i, i + 100);
    const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v3/objects/contacts/batch/read', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: ['storm_boy_campaign_member'],
        inputs: slice.map(id => ({ id })),
      }),
    });
    if (!res.ok) continue;
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

  const wins = await fetchAllWins(token);
  if (!wins.length) return { generated_at: new Date().toISOString(), wins: [] };

  const dealIds = wins.map(w => w.id);
  const dealContacts = await fetchDealContacts(token, dealIds);
  const allContactIds = Array.from(new Set(Object.values(dealContacts).flat()));
  const contactFlags = await fetchContactStormboyFlags(token, allContactIds);

  const out = wins.map(d => {
    const p = d.properties || {};
    const cids = dealContacts[d.id] || [];
    const stormboy = cids.some(cid => contactFlags[cid] === 'Yes');
    const partner = p.partner || null;
    return {
      deal_id: d.id,
      deal_name: p.dealname,
      closedate: p.closedate,
      createdate: p.createdate,
      days_to_close: daysBetween(p.createdate, p.closedate),
      channel: { stormboy, partner, direct: !stormboy && !partner },
      project_ha: p.estimated_project_ha ? num(p.estimated_project_ha) : null,
      total_ha: p.total_property_hectares ? num(p.total_property_hectares) : null,
      hubspot_url: `https://app.hubspot.com/contacts/24224559/record/0-3/${d.id}`,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    wins_total: out.length,
    earliest_closedate: out[out.length - 1]?.closedate || null,
    latest_closedate: out[0]?.closedate || null,
    wins: out,
  };
}

module.exports = { run };
