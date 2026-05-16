/**
 * Storm Boy contact summary — feeds the WORK tab's Storm Boy stream.
 *
 * Two motions are tracked separately by design (see
 * shared-growth-memory/sales-motion-separation.md). This module only deals
 * with Motion 1 (Storm Boy outreach): contacts tagged
 * storm_boy_campaign_member = Yes, broken down by contact_lead_stage_storm_boy.
 *
 * Returns:
 *   - funnel:     counts per stage (Identified → ... → Exited)
 *   - upcoming:   contacts with stage "Farm Visit booked" sorted by next meeting
 *   - call_queue: "In Conversation" contacts not contacted in the last N days
 *   - recent:     contacts whose stage moved in the last 7 days
 */

const FUNNEL_STAGES = [
  'Identified',
  'In Conversation',
  'Farm Visit booked',
  'Farm Visit completed',
  'In Sales Pipeline',
  'Exited',
];
const TERMINAL_STAGES = ['Not Eligible', 'Exited'];
const CALL_QUEUE_STALE_DAYS = 3;

const HUBSPOT_BASE = 'https://api.hubapi.com';

async function fetchContactsPage(token, filterGroups, after, properties) {
  const body = {
    filterGroups,
    properties,
    limit: 100,
    sorts: [{ propertyName: 'lastmodifieddate', direction: 'DESCENDING' }],
  };
  if (after) body.after = after;

  const res = await fetch(HUBSPOT_BASE + '/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('HubSpot contacts search failed: ' + res.status + ' ' + text);
  }
  return res.json();
}

async function fetchAllContacts(token, filterGroups, properties) {
  const all = [];
  let after = undefined;
  let safety = 30; // 30 pages × 100 = 3000 max — well above current Storm Boy population
  while (safety-- > 0) {
    const page = await fetchContactsPage(token, filterGroups, after, properties);
    all.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return all;
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function displayName(c) {
  const fn = (c.properties.firstname || '').trim();
  const ln = (c.properties.lastname || '').trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
  return c.properties.hs_full_name_or_email || ('contact #' + c.id);
}

async function run() {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const filters = [{ filters: [{ propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' }] }];
  const properties = [
    'firstname', 'lastname', 'hs_full_name_or_email',
    'contact_lead_stage_storm_boy', 'hs_lead_status',
    'notes_last_contacted', 'createdate', 'lastmodifieddate',
    'hubspot_owner_id',
    'storm_boy__meeting_date', 'storm_boy__meeting_scheduled', 'storm_boy__meeting_completed',
    'storm_boy__call_outcome', 'storm_boy__date_called',
    'storm_boy__horizon_snapshot_created',
  ];

  const contacts = await fetchAllContacts(token, filters, properties);

  // Funnel breakdown
  const funnelCounts = {};
  FUNNEL_STAGES.forEach(s => { funnelCounts[s] = 0; });
  let unstagedCount = 0;
  let notEligibleCount = 0;
  contacts.forEach(c => {
    const stage = c.properties.contact_lead_stage_storm_boy;
    if (!stage) unstagedCount++;
    else if (stage === 'Not Eligible') notEligibleCount++;
    else if (funnelCounts[stage] !== undefined) funnelCounts[stage]++;
  });

  // Upcoming farm visits — contacts in "Farm Visit booked", sorted by meeting date
  const upcoming = contacts
    .filter(c => c.properties.contact_lead_stage_storm_boy === 'Farm Visit booked')
    .map(c => ({
      id: c.id,
      name: displayName(c),
      owner_id: c.properties.hubspot_owner_id,
      meeting_date: c.properties.storm_boy__meeting_date,
      last_contacted: c.properties.notes_last_contacted,
      meeting_completed: c.properties.storm_boy__meeting_completed,
      horizon_snapshot_created: c.properties.storm_boy__horizon_snapshot_created,
      hubspot_url: 'https://app.hubspot.com/contacts/24224559/contact/' + c.id,
    }))
    .sort((a, b) => {
      if (!a.meeting_date && !b.meeting_date) return 0;
      if (!a.meeting_date) return 1;
      if (!b.meeting_date) return -1;
      return new Date(a.meeting_date) - new Date(b.meeting_date);
    })
    .slice(0, 10);

  // Call queue — "In Conversation" contacts whose last contact is older than N days
  const callQueue = contacts
    .filter(c => c.properties.contact_lead_stage_storm_boy === 'In Conversation')
    .map(c => ({
      id: c.id,
      name: displayName(c),
      owner_id: c.properties.hubspot_owner_id,
      last_contacted: c.properties.notes_last_contacted,
      days_since_contact: daysSince(c.properties.notes_last_contacted),
      hubspot_url: 'https://app.hubspot.com/contacts/24224559/contact/' + c.id,
    }))
    .filter(c => c.days_since_contact === null || c.days_since_contact >= CALL_QUEUE_STALE_DAYS)
    .sort((a, b) => (b.days_since_contact || 0) - (a.days_since_contact || 0))
    .slice(0, 8);

  // Recently completed farm visits — last 14 days
  const recentVisits = contacts
    .filter(c => c.properties.contact_lead_stage_storm_boy === 'Farm Visit completed')
    .map(c => ({
      id: c.id,
      name: displayName(c),
      owner_id: c.properties.hubspot_owner_id,
      meeting_date: c.properties.storm_boy__meeting_date,
      days_since: daysSince(c.properties.storm_boy__meeting_date),
      hubspot_url: 'https://app.hubspot.com/contacts/24224559/contact/' + c.id,
    }))
    .filter(c => c.days_since !== null && c.days_since <= 14)
    .sort((a, b) => a.days_since - b.days_since)
    .slice(0, 5);

  return {
    generated_at: new Date().toISOString(),
    total_contacts: contacts.length,
    unstaged: unstagedCount,
    not_eligible: notEligibleCount,
    funnel: FUNNEL_STAGES.map(s => ({ stage: s, count: funnelCounts[s] })),
    upcoming,
    call_queue: callQueue,
    recent_visits: recentVisits,
  };
}

module.exports = { run };
