/**
 * Engagement timeline — fetches the real notes, emails, calls, and meetings
 * for a HubSpot contact or deal, with verbatim bodies.
 *
 * Powers the "what specifically happened" diagnosis on exemplar cards.
 * The goal: replace signal-language ("orphan", "stalled") with artifacts
 * ("last email 2025-10-12 read: 'Will need to discuss with my brother…'").
 */

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const PER_TYPE_LIMIT = 5;
const BODY_TRUNCATE = 600;

const ENGAGEMENT_TYPES = [
  { key: 'notes',    body_prop: 'hs_note_body',    extra_props: [] },
  { key: 'emails',   body_prop: 'hs_email_text',   extra_props: ['hs_email_subject', 'hs_email_direction', 'hs_email_from_email'] },
  { key: 'calls',    body_prop: 'hs_call_body',    extra_props: ['hs_call_disposition', 'hs_call_direction', 'hs_call_duration', 'hs_call_title'] },
  { key: 'meetings', body_prop: 'hs_meeting_body', extra_props: ['hs_meeting_title', 'hs_meeting_outcome', 'hs_meeting_start_time'] },
];

async function hubspotGet(token, urlPath) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    headers: { 'Authorization': 'Bearer ' + token },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`HubSpot GET ${urlPath} → ${res.status}`);
  }
  return res.json();
}

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`HubSpot POST ${urlPath} → ${res.status}`);
  }
  return res.json();
}

function objectKey(type) {
  // 'deal' → 'deals', 'contact' → 'contacts'
  if (type === 'deal') return 'deals';
  if (type === 'contact') return 'contacts';
  return type;
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ').trim();
}

function truncate(s, n) {
  if (!s) return '';
  s = s.trim();
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
}

function timestampOf(props) {
  return props.hs_timestamp || props.hs_createdate || props.hs_lastmodifieddate || props.createdate || null;
}

function buildEntry(kind, id, props) {
  const cfg = ENGAGEMENT_TYPES.find(t => t.key === kind + 's' || t.key === kind);
  const bodyProp = cfg ? cfg.body_prop : null;
  const ts = timestampOf(props);
  const body = bodyProp ? stripHtml(props[bodyProp] || '') : '';

  let title = '';
  let subline = '';
  if (kind === 'note') {
    title = 'Note';
  } else if (kind === 'email') {
    title = 'Email · ' + (props.hs_email_subject || '(no subject)');
    const dir = (props.hs_email_direction || '').toLowerCase();
    subline = (dir === 'email_sent' || dir.includes('outgoing')) ? 'outbound' : (dir.includes('incoming') ? 'inbound' : '');
    if (props.hs_email_from_email) subline += subline ? ` · from ${props.hs_email_from_email}` : `from ${props.hs_email_from_email}`;
  } else if (kind === 'call') {
    const dispo = (props.hs_call_disposition || '').toString();
    title = (props.hs_call_title ? props.hs_call_title + ' · ' : 'Call · ') + (dispo || 'no disposition');
    const dur = Number(props.hs_call_duration) || 0;
    if (dur) subline = `${Math.round(dur / 1000)}s`;
    if (props.hs_call_direction) subline += subline ? ` · ${props.hs_call_direction.toLowerCase()}` : props.hs_call_direction.toLowerCase();
  } else if (kind === 'meeting') {
    title = props.hs_meeting_title || 'Meeting';
    subline = (props.hs_meeting_outcome || '').toString().toLowerCase();
  }

  return {
    id,
    kind,
    title,
    subline,
    timestamp: ts,
    body: body ? truncate(body, BODY_TRUNCATE) : '',
    has_body: !!body,
    hubspot_url: `https://app.hubspot.com/contacts/24224559/${kind === 'note' ? 'note' : kind}s/${id}`,
  };
}

async function fetchEngagementsForType(token, parentType, parentId, cfg) {
  const assoc = await hubspotGet(
    token,
    `/crm/v4/objects/${objectKey(parentType)}/${parentId}/associations/${cfg.key}?limit=${PER_TYPE_LIMIT * 3}`
  );
  if (!assoc || !assoc.results || !assoc.results.length) return [];

  // Take highest-numbered IDs first (usually most recent), cap at PER_TYPE_LIMIT
  const ids = assoc.results
    .map(r => String(r.toObjectId))
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, PER_TYPE_LIMIT);

  if (!ids.length) return [];

  const props = ['hs_timestamp', 'hs_createdate', 'hs_lastmodifieddate', cfg.body_prop, ...cfg.extra_props];
  const data = await hubspotPost(token, `/crm/v3/objects/${cfg.key}/batch/read`, {
    inputs: ids.map(id => ({ id })),
    properties: props,
  });

  const items = (data && data.results) || [];
  const kind = cfg.key.replace(/s$/, ''); // notes -> note, etc.
  return items.map(item => buildEntry(kind, item.id, item.properties || {}));
}

async function run(type, id) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');
  if (!type || !id) throw new Error('type and id required');

  const results = await Promise.allSettled(
    ENGAGEMENT_TYPES.map(cfg => fetchEngagementsForType(token, type, id, cfg))
  );

  const all = [];
  results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });

  // Sort all engagements by timestamp DESC
  all.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  // Cap total returned
  const capped = all.slice(0, 8);

  // Compute "days since last contact" from the most recent timestamp
  const mostRecent = capped[0]?.timestamp;
  const daysSinceLastContact = mostRecent
    ? Math.floor((Date.now() - new Date(mostRecent).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    type,
    id: String(id),
    generated_at: new Date().toISOString(),
    days_since_last_contact: daysSinceLastContact,
    last_contact_date: mostRecent,
    engagements_returned: capped.length,
    engagements: capped,
  };
}

module.exports = { run };
