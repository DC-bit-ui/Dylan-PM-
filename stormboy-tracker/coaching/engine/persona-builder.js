/**
 * Persona Builder — deep, HubSpot-grounded persona generation for any rep.
 *
 * Given a rep identifier (owner_id, email, or name), this engine:
 *   1. DISCOVERS — finds all emails the rep sent via HubSpot search
 *      (hs_email_from_email = email) + (when owner_id is known) emails/notes
 *      they authored
 *   2. FANS OUT — collects unique associated contact_ids and deal_ids from
 *      those engagements
 *   3. TIMELINES — for each parent (contact + deal), pulls the FULL engagement
 *      history (notes / emails / calls / meetings) with verbatim bodies
 *      (BODY_FULL=4000 chars, vs the dashboard timeline's 600)
 *   4. CORPUS — assembles a structured per-parent corpus showing the
 *      conversation flow (Bill's sends + customer replies in time order)
 *   5. SYNTHESIS — Claude Sonnet pass with a structured prompt extracting
 *      conversation patterns, objection handling, conversion drivers, voice
 *   6. WRITES — drops profile.md to shared-growth-memory/team-brain/profiles/
 *      (the bus canonical location, also read by the BRAIN tab via the
 *      coaching/[slug]-profile.md mirror)
 *
 * Calling conventions:
 *   buildPersona({ slug: 'bill-hyem', email: 'william@agriprove.io', name: 'Bill Hyem' })
 *   buildPersona({ slug: 'ben',       owner_id: '76812243',          name: 'Ben Payne' })
 *
 * Cache: `coaching/cache/persona-corpus-<slug>.json` (intermediate corpus,
 * for re-synthesis without re-fetching)
 */

const fs = require('fs');
const path = require('path');
const { create: createBundle, readResult: readBundleResult } = require('./intelligence-bundles');

// Migrated from direct Anthropic API to bundle-based subscription compute
// per Cadel directive 2026-05-18. Persona synthesis (the expensive call —
// 4000-8000 token outputs per rep) now writes a bundle to the shared bus.
// First refresh queues; subsequent refresh upgrades to the completed result
// and regenerates the profile.md. The previous profile is preserved while
// the bundle is in flight (no half-written profiles, no broken UIs).

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const COACHING_ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(COACHING_ROOT, 'cache');
const FALLBACK_BUS = path.join(__dirname, '..', '..', '..', 'shared-growth-memory');
const BUS_ROOT = process.env.BUS_PATH || FALLBACK_BUS;
const BUS_PROFILES = path.join(BUS_ROOT, 'team-brain', 'profiles');
// Supplemental corpora — multi-source enrichment drops here. See
// shared-growth-memory/persona-supplements/README.md for the contract Apex/MCP
// systems follow when staging Confluence/Teams/Outlook/Granola signal per rep.
const SUPPLEMENTS_ROOT = path.join(BUS_ROOT, 'persona-supplements');

const BODY_FULL = 4000;          // chars per engagement body for synthesis
const MAX_PARENTS = 40;          // cap on unique contacts+deals to pull deep
const MAX_ENGAGEMENTS_PER_PARENT = 30;
const EMAIL_SEARCH_PAGE = 100;
const EMAIL_SEARCH_MAX = 1000;   // hard cap on emails pulled per rep
// Synthesis input cap — org tier limits us to 10K input TPM. Need room for
// system prompt (~500t) + user-prompt template (~600t) on top of corpus, so
// 24K chars (~6K tokens corpus) + ~1.5K tokens overhead = ~7.5K tokens total.
// Comfortably under 10K. Cooldown between reps remains as a safety net.
const SYNTHESIS_MAX_CHARS = 24000;
// Use Haiku for synthesis — higher TPM tier than Sonnet on entry orgs, and
// the persona task is structured JSON extraction not deep ambiguity reasoning.
const SYNTHESIS_MODEL = 'haiku';

// ---- HubSpot primitives ---------------------------------------------------

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HubSpot POST ${urlPath} → ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

async function hubspotGet(token, urlPath) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`HubSpot GET ${urlPath} → ${res.status}`);
  }
  return res.json();
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ').trim();
}

function truncate(s, n) {
  if (!s) return '';
  s = s.trim();
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
}

// ---- Stage 1: discover ----------------------------------------------------

async function findEmailsSentBy(token, fromEmail) {
  const out = [];
  let after = undefined;
  while (out.length < EMAIL_SEARCH_MAX) {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'hs_email_from_email', operator: 'EQ', value: fromEmail },
        ],
      }],
      properties: ['hs_email_subject', 'hs_email_direction', 'hs_email_from_email',
                   'hs_email_to_email', 'hs_timestamp', 'hs_email_text', 'hs_email_html'],
      sorts: [{ propertyName: 'hs_timestamp', direction: 'DESCENDING' }],
      limit: EMAIL_SEARCH_PAGE,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/emails/search', body);
    out.push(...(page.results || []));
    const next = page.paging && page.paging.next && page.paging.next.after;
    if (!next) break;
    after = next;
  }
  return out;
}

// ---- Stage 2: fan out to contacts + deals --------------------------------

async function batchEmailAssociations(token, emailIds, toType) {
  const map = {};
  for (let i = 0; i < emailIds.length; i += 100) {
    const slice = emailIds.slice(i, i + 100);
    const data = await hubspotPost(
      token,
      `/crm/v4/associations/emails/${toType}/batch/read`,
      { inputs: slice.map(id => ({ id: String(id) })) },
    ).catch(e => { console.error('assoc batch failed:', e.message); return null; });
    if (!data || !data.results) continue;
    data.results.forEach(r => {
      const fromId = r.from && r.from.id;
      if (!fromId) return;
      map[fromId] = (r.to || []).map(t => String(t.toObjectId));
    });
  }
  return map;
}

// ---- Stage 3: pull full timelines per parent ------------------------------

const ENGAGEMENT_TYPES = [
  { key: 'notes',    body_prop: 'hs_note_body',    extra: [] },
  { key: 'emails',   body_prop: 'hs_email_text',   extra: ['hs_email_subject', 'hs_email_direction', 'hs_email_from_email', 'hs_email_to_email'] },
  { key: 'calls',    body_prop: 'hs_call_body',    extra: ['hs_call_disposition', 'hs_call_direction', 'hs_call_duration', 'hs_call_title'] },
  { key: 'meetings', body_prop: 'hs_meeting_body', extra: ['hs_meeting_title', 'hs_meeting_outcome', 'hs_meeting_start_time'] },
];

async function fetchEngagementsForParent(token, parentType, parentId) {
  const all = [];
  for (const cfg of ENGAGEMENT_TYPES) {
    try {
      const assoc = await hubspotGet(
        token,
        `/crm/v4/objects/${parentType}/${parentId}/associations/${cfg.key}?limit=${MAX_ENGAGEMENTS_PER_PARENT}`,
      );
      if (!assoc || !assoc.results || !assoc.results.length) continue;
      const ids = assoc.results.map(r => String(r.toObjectId)).filter(Boolean).slice(0, MAX_ENGAGEMENTS_PER_PARENT);
      if (!ids.length) continue;
      const props = ['hs_timestamp', 'hs_createdate', 'hs_lastmodifieddate',
                     'hubspot_owner_id', 'hs_created_by_user_id', cfg.body_prop, ...cfg.extra];
      const data = await hubspotPost(token, `/crm/v3/objects/${cfg.key}/batch/read`, {
        inputs: ids.map(id => ({ id })),
        properties: props,
      });
      const items = (data && data.results) || [];
      items.forEach(item => {
        const p = item.properties || {};
        const kind = cfg.key.replace(/s$/, '');
        const body = stripHtml(p[cfg.body_prop] || '');
        all.push({
          id: item.id,
          kind,
          timestamp: p.hs_timestamp || p.hs_createdate || p.hs_lastmodifieddate || null,
          owner_id: p.hubspot_owner_id || null,
          created_by_user_id: p.hs_created_by_user_id || null,
          subject: p.hs_email_subject || p.hs_call_title || p.hs_meeting_title || null,
          direction: p.hs_email_direction || p.hs_call_direction || null,
          from_email: p.hs_email_from_email || null,
          to_email: p.hs_email_to_email || null,
          disposition: p.hs_call_disposition || null,
          duration_s: p.hs_call_duration ? Math.round(Number(p.hs_call_duration) / 1000) : null,
          outcome: p.hs_meeting_outcome || null,
          body: truncate(body, BODY_FULL),
          has_body: !!body,
        });
      });
    } catch (e) {
      console.error(`engagements ${cfg.key} for ${parentType}/${parentId} failed:`, e.message);
    }
  }
  all.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb; // ASC for narrative flow
  });
  return all;
}

async function fetchParentProperties(token, type, ids) {
  if (!ids.length) return {};
  const props = type === 'contacts'
    ? ['firstname', 'lastname', 'email', 'phone', 'jobtitle', 'company', 'lifecyclestage', 'lead_status', 'hubspot_owner_id', 'createdate']
    : ['dealname', 'dealstage', 'amount', 'closedate', 'createdate', 'deal_stage_before_close', 'partner', 'total_property_hectares', 'estimated_project_ha', 'hubspot_owner_id'];
  const map = {};
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const data = await hubspotPost(token, `/crm/v3/objects/${type}/batch/read`, {
      inputs: slice.map(id => ({ id })),
      properties: props,
    }).catch(e => { console.error('parent batch read failed:', e.message); return null; });
    if (!data || !data.results) continue;
    data.results.forEach(r => { map[r.id] = r.properties || {}; });
  }
  return map;
}

// ---- Seed-and-traverse fallback (when email-search scope unavailable) ----
//
// Some Private App tokens cannot search standalone engagement collections.
// In that case, we seed from known parents (contact + deal IDs) where the rep
// is known to have been active, pull their engagement timelines (works via
// association), filter engagements where from_email matches the rep, then
// traverse 1 hop outward to associated contacts/deals of those emails.

async function fetchEngagementsForParentWithMeta(token, parentType, parentId) {
  // Same as fetchEngagementsForParent but always returns; used in traversal.
  try {
    return await fetchEngagementsForParent(token, parentType, parentId);
  } catch (e) {
    console.error(`traversal fetch failed for ${parentType}/${parentId}:`, e.message);
    return [];
  }
}

async function fetchEmailAssociations(token, emailId) {
  // For a single email, get associated contact + deal IDs.
  const out = { contacts: [], deals: [] };
  for (const t of ['contacts', 'deals']) {
    const res = await hubspotGet(token, `/crm/v4/objects/emails/${emailId}/associations/${t}?limit=20`);
    if (res && res.results) out[t] = res.results.map(r => String(r.toObjectId));
  }
  return out;
}

async function discoverViaSeed(token, email, seedContacts, seedDeals) {
  // From seed parents, pull their engagements, find those authored by `email`,
  // and traverse 1 hop to discover more parents the rep touched.
  console.log(`[persona-builder] seed traversal · ${seedContacts.length} contacts + ${seedDeals.length} deals`);
  const repEmailIds = new Set();
  const discoveredContacts = new Set(seedContacts);
  const discoveredDeals = new Set(seedDeals);

  // Pass 1: pull engagements for seed parents, find rep's emails
  for (const cid of seedContacts) {
    const engagements = await fetchEngagementsForParentWithMeta(token, 'contacts', cid);
    engagements.forEach(e => {
      if (e.kind === 'email' && e.from_email && e.from_email.toLowerCase() === email.toLowerCase()) {
        repEmailIds.add(e.id);
      }
    });
  }
  for (const did of seedDeals) {
    const engagements = await fetchEngagementsForParentWithMeta(token, 'deals', did);
    engagements.forEach(e => {
      if (e.kind === 'email' && e.from_email && e.from_email.toLowerCase() === email.toLowerCase()) {
        repEmailIds.add(e.id);
      }
    });
  }
  console.log(`[persona-builder]   → ${repEmailIds.size} emails from ${email} found in seed engagements`);

  // Pass 2: for each rep-authored email, traverse to its associated parents
  const emailIdList = Array.from(repEmailIds);
  for (let i = 0; i < emailIdList.length; i++) {
    const eid = emailIdList[i];
    const assoc = await fetchEmailAssociations(token, eid);
    assoc.contacts.forEach(c => discoveredContacts.add(c));
    assoc.deals.forEach(d => discoveredDeals.add(d));
  }
  console.log(`[persona-builder]   → traversal expanded to ${discoveredContacts.size} contacts + ${discoveredDeals.size} deals`);

  return {
    contactIds: Array.from(discoveredContacts),
    dealIds: Array.from(discoveredDeals),
    repEmailIds: emailIdList,
  };
}

// ---- Stage 4: corpus assembly --------------------------------------------

async function buildCorpus({ email, name, slug, seed }) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  let sentEmails = [];
  let useSeedFallback = false;
  try {
    console.log(`[persona-builder] discovering emails sent by ${email} (search path)`);
    sentEmails = await findEmailsSentBy(token, email);
    console.log(`[persona-builder]   → ${sentEmails.length} emails sent (search)`);
  } catch (e) {
    if (String(e.message).includes('403') || String(e.message).includes('scopes')) {
      console.log(`[persona-builder] email-search scope unavailable → falling back to seed traversal`);
      useSeedFallback = true;
    } else {
      throw e;
    }
  }

  let contactIds = [];
  let dealIds = [];
  let contactsMap = {};
  let dealsMap = {};

  if (useSeedFallback) {
    if (!seed || (!seed.contacts && !seed.deals)) {
      return { slug, name, email, error: 'email-search scope unavailable AND no seed contacts/deals provided. Provide seed: { contacts: [...], deals: [...] } or have admin add crm.objects.emails.read scope to the Private App.' };
    }
    const discovery = await discoverViaSeed(token, email, seed.contacts || [], seed.deals || []);
    contactIds = discovery.contactIds;
    dealIds = discovery.dealIds;
    // sentEmails is empty in this path — we identify rep-authored emails later via from_email filter
  } else if (!sentEmails.length) {
    return { slug, name, email, error: 'no emails sent by this address found in HubSpot' };
  } else {
    const emailIds = sentEmails.map(e => e.id);
    console.log(`[persona-builder] fanning out: contact + deal associations for ${emailIds.length} emails`);
    [contactsMap, dealsMap] = await Promise.all([
      batchEmailAssociations(token, emailIds, 'contacts'),
      batchEmailAssociations(token, emailIds, 'deals'),
    ]);
    const contactCount = {};
    const dealCount = {};
    Object.values(contactsMap).forEach(ids => ids.forEach(id => { contactCount[id] = (contactCount[id] || 0) + 1; }));
    Object.values(dealsMap).forEach(ids => ids.forEach(id => { dealCount[id] = (dealCount[id] || 0) + 1; }));
    contactIds = Object.entries(contactCount).sort((a,b) => b[1] - a[1]).slice(0, MAX_PARENTS).map(([id]) => id);
    dealIds = Object.entries(dealCount).sort((a,b) => b[1] - a[1]).slice(0, MAX_PARENTS).map(([id]) => id);
  }
  const topContacts = contactIds.slice(0, MAX_PARENTS);
  const topDeals = dealIds.slice(0, MAX_PARENTS);
  console.log(`[persona-builder]   → top ${topContacts.length} contacts, top ${topDeals.length} deals`);

  // Parent metadata
  const [contactProps, dealProps] = await Promise.all([
    fetchParentProperties(token, 'contacts', topContacts),
    fetchParentProperties(token, 'deals', topDeals),
  ]);

  // Full timelines per parent
  console.log(`[persona-builder] pulling full timelines for ${topContacts.length + topDeals.length} parents (this takes a moment)`);
  const contactThreads = [];
  for (const cid of topContacts) {
    const engagements = await fetchEngagementsForParent(token, 'contacts', cid);
    if (!engagements.length) continue;
    contactThreads.push({
      contact_id: cid,
      properties: contactProps[cid] || {},
      engagement_count: engagements.length,
      engagements,
    });
  }
  const dealThreads = [];
  for (const did of topDeals) {
    const engagements = await fetchEngagementsForParent(token, 'deals', did);
    if (!engagements.length) continue;
    dealThreads.push({
      deal_id: did,
      properties: dealProps[did] || {},
      engagement_count: engagements.length,
      engagements,
    });
  }

  const corpus = {
    generated_at: new Date().toISOString(),
    subject: { slug, name, email },
    discovery_method: useSeedFallback ? 'seed-traversal' : 'email-search',
    discovery: {
      sent_emails_count: sentEmails.length,
      unique_contacts: contactIds.length,
      unique_deals: dealIds.length,
      top_n_contacts_pulled: topContacts.length,
      top_n_deals_pulled: topDeals.length,
    },
    sent_emails: sentEmails.map(e => ({
      id: e.id,
      timestamp: e.properties.hs_timestamp,
      subject: e.properties.hs_email_subject,
      to_email: e.properties.hs_email_to_email,
      body: truncate(stripHtml(e.properties.hs_email_text || e.properties.hs_email_html || ''), BODY_FULL),
    })),
    contact_threads: contactThreads,
    deal_threads: dealThreads,
  };

  // Save corpus to cache for re-synthesis without re-fetching
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const corpusPath = path.join(CACHE_DIR, `persona-corpus-${slug}.json`);
  fs.writeFileSync(corpusPath, JSON.stringify(corpus, null, 2));
  console.log(`[persona-builder] corpus saved to ${corpusPath}`);

  return corpus;
}

// ---- Multi-source supplements --------------------------------------------
//
// Each supplemental drop sits at:
//   shared-growth-memory/persona-supplements/<slug>/<source-type>-<id>.{json,md}
//
// The filename prefix declares the source-type so the synthesis prompt can
// group/label them. Recognised prefixes (extensible):
//   - confluence-aircall-…    Aircall transcripts saved to Confluence
//   - teams-channel-…         Teams channel messages by/about the rep
//   - outlook-email-…         Outlook emails by/about the rep
//   - granola-meeting-…       Granola meeting transcripts featuring the rep
//   - manual-…                Hand-curated notes (interview transcripts, etc.)
//
// Apex (Cowork) is the natural owner of these drops because it has MCP access
// to Dylan's Confluence/Teams/Outlook/Granola auth. The dashboard server can't
// reach those sources directly.

function loadSupplements(slug) {
  const dir = path.join(SUPPLEMENTS_ROOT, slug);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => /\.(json|md|txt)$/i.test(f));
  const items = [];
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const ext = path.extname(f).toLowerCase();
      // Source-type = filename up to first "-" or "."
      const m = f.match(/^([a-z]+(?:-[a-z]+)?)-/i) || f.match(/^([a-z]+)\./i);
      const source_type = m ? m[1] : 'misc';
      items.push({
        file: f,
        source_type,
        content: ext === '.json' ? safeParseJson(raw) : raw,
      });
    } catch (e) {
      console.error(`supplement load failed for ${f}:`, e.message);
    }
  }
  return items;
}

function safeParseJson(s) {
  try { return JSON.parse(s); } catch (_) { return s; }
}

// ---- Stage 5: synthesis ---------------------------------------------------

function formatCorpusForLLM(corpus, supplements = []) {
  const lines = [];
  lines.push(`SUBJECT: ${corpus.subject.name} (${corpus.subject.email})`);
  lines.push(`HUBSPOT DISCOVERY: ${corpus.discovery.sent_emails_count} emails sent across ${corpus.discovery.unique_contacts} unique contacts and ${corpus.discovery.unique_deals} unique deals`);
  if (supplements.length) {
    const bySource = {};
    supplements.forEach(s => { bySource[s.source_type] = (bySource[s.source_type] || 0) + 1; });
    const supSummary = Object.entries(bySource).map(([k, v]) => `${k}=${v}`).join(', ');
    lines.push(`SUPPLEMENTAL SOURCES: ${supSummary}`);
  }
  lines.push('');

  // Supplemental sources — group by source-type so the model can weight them
  if (supplements.length) {
    const grouped = {};
    supplements.forEach(s => {
      grouped[s.source_type] = grouped[s.source_type] || [];
      grouped[s.source_type].push(s);
    });
    Object.entries(grouped).forEach(([type, items]) => {
      lines.push(`\n=== SUPPLEMENT · ${type.toUpperCase()} (${items.length} item${items.length === 1 ? '' : 's'}) ===`);
      items.forEach((item, i) => {
        lines.push(`\n--- ${type}#${i+1} · ${item.file} ---`);
        const c = item.content;
        if (typeof c === 'string') {
          lines.push(c.slice(0, 20000));
        } else if (c && typeof c === 'object') {
          // Common shapes: { transcript: "..." } or { messages: [...] } or { body: "..." }
          if (c.transcript) lines.push(String(c.transcript).slice(0, 20000));
          else if (c.body) lines.push(String(c.body).slice(0, 20000));
          else if (Array.isArray(c.messages)) {
            c.messages.slice(0, 100).forEach(m => {
              const who = m.from || m.author || m.sender || '?';
              const ts = m.timestamp || m.date || '?';
              const text = m.text || m.content || m.body || '';
              lines.push(`[${ts}] ${who}: ${String(text).slice(0, 1000)}`);
            });
          } else {
            lines.push(JSON.stringify(c).slice(0, 8000));
          }
        }
      });
    });
    lines.push('');
  }

  lines.push('=== CONTACT THREADS (chronological per contact) ===');
  corpus.contact_threads.forEach((t, idx) => {
    const p = t.properties || {};
    const name = [p.firstname, p.lastname].filter(Boolean).join(' ') || '(unnamed)';
    lines.push(`\n--- THREAD ${idx+1}: ${name} · ${p.company || ''} · ${p.jobtitle || ''} · lead_status=${p.lead_status || '?'} · ${t.engagement_count} engagements ---`);
    t.engagements.forEach(e => {
      const date = e.timestamp ? new Date(e.timestamp).toISOString().slice(0, 10) : '?';
      const head = `[${date}] ${e.kind.toUpperCase()}${e.subject ? ' · ' + e.subject : ''}${e.direction ? ' · ' + e.direction.toLowerCase() : ''}${e.from_email ? ' · from ' + e.from_email : ''}`;
      lines.push(head);
      if (e.body) lines.push('  ' + e.body);
    });
  });
  lines.push('');
  lines.push('=== DEAL THREADS (chronological per deal) ===');
  corpus.deal_threads.forEach((t, idx) => {
    const p = t.properties || {};
    lines.push(`\n--- DEAL ${idx+1}: ${p.dealname || '(unnamed)'} · stage=${p.dealstage || '?'} · close=${p.closedate || '?'} · partner=${p.partner || 'direct'} · ${t.engagement_count} engagements ---`);
    t.engagements.forEach(e => {
      const date = e.timestamp ? new Date(e.timestamp).toISOString().slice(0, 10) : '?';
      const head = `[${date}] ${e.kind.toUpperCase()}${e.subject ? ' · ' + e.subject : ''}${e.direction ? ' · ' + e.direction.toLowerCase() : ''}${e.from_email ? ' · from ' + e.from_email : ''}`;
      lines.push(head);
      if (e.body) lines.push('  ' + e.body);
    });
  });
  return lines.join('\n');
}

const SYNTHESIS_SYSTEM = `You are building a deep, conversation-grounded sales persona for a specific person, based exclusively on their real HubSpot engagement footprint (notes, emails, calls, meetings) with customers and prospects.

The goal is replicable excellence: what this person does that another rep could adopt. Be specific, quote verbatim where possible, organise by situation not by chronology.

You MUST honour these rules:
- Quote exact phrases from the artifacts when capturing voice and language. Never invent quotes.
- Use confidence markers: [high] if a pattern appears in 3+ artifacts, [moderate] for 2, [low] for 1.
- Be honest about gaps. If the data doesn't show objection handling, say so.
- No flattery, no preamble, no AI tells. Write like an analyst who's read every email twice.
- Lead with the SINGLE most replicable habit, then build down.
`;

const SYNTHESIS_USER_TEMPLATE = `Below is the consolidated HubSpot engagement corpus for {NAME}. Build a deep, conversation-grounded persona.

Required output (strict JSON):
{
  "headline_read": "2-3 sentences — the single most replicable thing about how this rep operated. Specific, not generic.",
  "conversation_openers": [
    { "context": "cold inbound / cold outbound / referral / re-engagement / etc", "pattern": "what they did", "verbatim_examples": ["..."] }
  ],
  "discovery_questions": [
    { "question_pattern": "...", "verbatim_examples": ["..."], "what_it_surfaces": "..." }
  ],
  "transitions": [
    { "from": "rapport / discovery / question raised", "to": "next phase", "pattern": "...", "verbatim_examples": ["..."] }
  ],
  "objection_handling": [
    { "objection_raised": "exact customer concern (verbatim where possible)", "response_pattern": "how the rep handled it", "verbatim_examples": ["..."], "outcome_visible": "what happened next", "confidence": "high|moderate|low" }
  ],
  "conversion_drivers": [
    { "driver": "what moved the deal forward (e.g. custom deliverable, second-call discipline, multi-method framing)", "evidence_thread": "contact or deal name where this is visible", "confidence": "high|moderate|low" }
  ],
  "verbatim_language_bank": {
    "greetings": ["..."],
    "engagement_phrases": ["..."],
    "value_framings": ["..."],
    "soft_pushes": ["..."],
    "closes": ["..."],
    "internal_handoffs": ["..."]
  },
  "customer_archetypes": [
    { "archetype": "...", "characteristics": "...", "approach_used": "...", "example_thread": "name of contact/deal in corpus" }
  ],
  "anti_patterns_visible": [
    { "pattern": "things the rep did that did NOT seem to help — be cautious, only flag if multiple artifacts show this", "evidence": "..." }
  ],
  "headline_metrics": {
    "engagements_analysed": <int>,
    "contacts_analysed": <int>,
    "deals_analysed": <int>,
    "active_period": "from YYYY-MM to YYYY-MM",
    "primary_methodologies_discussed": ["..."]
  },
  "next_capture_pass": [
    "ranked list of what's missing from this corpus that would deepen the persona"
  ]
}

CORPUS:

{CORPUS}`;

// Progressively trim corpus to fit Sonnet's context window. Strategy:
// 1. Cap engagement body chars (most expensive per byte for least signal)
// 2. Cap engagements-per-parent (keep early + late, drop middle)
// 3. Drop lowest-engagement-count parents
// Each pass shrinks the corpus by ~30-50%. We loop until under budget.
function compressCorpusInPlace(corpus, maxChars) {
  function totalChars() {
    let n = 0;
    const visit = (e) => { n += (e.body || '').length + (e.subject || '').length + 60; };
    (corpus.contact_threads || []).forEach(t => (t.engagements || []).forEach(visit));
    (corpus.deal_threads || []).forEach(t => (t.engagements || []).forEach(visit));
    (corpus.sent_emails || []).forEach(e => { n += (e.body || '').length + (e.subject || '').length + 60; });
    return n;
  }

  let pass = 0;
  let bodyCap = BODY_FULL;
  let perParent = MAX_ENGAGEMENTS_PER_PARENT;

  while (totalChars() > maxChars && pass < 8) {
    pass++;
    // Pass 1-3: tighten body caps
    if (pass <= 3) {
      bodyCap = Math.max(400, Math.floor(bodyCap * 0.55));
      (corpus.contact_threads || []).forEach(t => (t.engagements || []).forEach(e => {
        if (e.body && e.body.length > bodyCap) e.body = e.body.slice(0, bodyCap) + '…';
      }));
      (corpus.deal_threads || []).forEach(t => (t.engagements || []).forEach(e => {
        if (e.body && e.body.length > bodyCap) e.body = e.body.slice(0, bodyCap) + '…';
      }));
      (corpus.sent_emails || []).forEach(e => {
        if (e.body && e.body.length > bodyCap) e.body = e.body.slice(0, bodyCap) + '…';
      });
      continue;
    }
    // Pass 4-5: cap engagements per parent (keep first/last)
    if (pass <= 5) {
      perParent = Math.max(6, Math.floor(perParent * 0.6));
      const trim = (engagements) => {
        if (engagements.length <= perParent) return engagements;
        const half = Math.floor(perParent / 2);
        return [...engagements.slice(0, half), ...engagements.slice(-(perParent - half))];
      };
      (corpus.contact_threads || []).forEach(t => { t.engagements = trim(t.engagements || []); });
      (corpus.deal_threads || []).forEach(t => { t.engagements = trim(t.engagements || []); });
      continue;
    }
    // Pass 6-7: drop lowest-engagement parents (keep the meatiest threads)
    const sortByCount = (a, b) => (b.engagement_count || 0) - (a.engagement_count || 0);
    corpus.contact_threads = (corpus.contact_threads || []).sort(sortByCount).slice(0, Math.max(10, Math.floor((corpus.contact_threads || []).length * 0.7)));
    corpus.deal_threads = (corpus.deal_threads || []).sort(sortByCount).slice(0, Math.max(10, Math.floor((corpus.deal_threads || []).length * 0.7)));
  }

  return { passes: pass, final_chars: totalChars(), body_cap: bodyCap, per_parent_cap: perParent };
}

// Bundle-based synthesis. Returns one of:
//   - the parsed analysis object (when a previously-queued bundle has completed)
//   - { _pending: true, bundle_id, queued_at } when a bundle is in flight
//     (this run won't write a profile; the next refresh will)
async function synthesize(corpus, supplements = [], slug) {
  // First format to measure size, then compress if needed and re-format
  let corpusText = formatCorpusForLLM(corpus, supplements);
  if (corpusText.length > SYNTHESIS_MAX_CHARS) {
    const orig = corpusText.length;
    const stats = compressCorpusInPlace(corpus, SYNTHESIS_MAX_CHARS);
    corpusText = formatCorpusForLLM(corpus, supplements);
    if (corpusText.length > SYNTHESIS_MAX_CHARS) {
      corpusText = corpusText.slice(0, SYNTHESIS_MAX_CHARS) + '\n\n[corpus truncated to fit synthesis window]';
    }
    console.log(`[persona-builder] corpus compressed: ${orig} → ${corpusText.length} chars (${stats.passes} passes, body_cap=${stats.body_cap}, per_parent=${stats.per_parent_cap})`);
  }
  console.log(`[persona-builder] preparing synthesis bundle — corpus is ${corpusText.length} chars (~${Math.round(corpusText.length/4)} tokens), ${supplements.length} supplements folded in`);

  // Role-aware framing
  const isSalesRep = corpus.subject.is_sales_rep !== false;
  const role = corpus.subject.role || (isSalesRep ? 'Sales rep' : 'Non-sales role');
  const roleNote = isSalesRep ? '' : `\n\nIMPORTANT CONTEXT: This subject is NOT a sales rep. Their role is "${role}". Their HubSpot footprint reflects oversight, escalation, coordination, or partner work — not direct outbound prospecting. Frame the output as a leadership/operations profile, not a sales playbook. The "headline_read" should describe how they operate within their actual role, not how they sell.`;

  const userPrompt = SYNTHESIS_USER_TEMPLATE
    .replace('{NAME}', corpus.subject.name + ' (' + role + ')')
    .replace('{CORPUS}', corpusText) + roleNote;

  // Pending-bundle handling: one in-flight bundle per persona at a time.
  const slugKey = slug || corpus.subject.slug || (corpus.subject.email || 'unknown').replace(/[^a-z0-9]/gi, '-');
  const pendingPath = path.join(CACHE_DIR, `persona-pending-${slugKey}.json`);

  // (a) If there's already a pending bundle for this persona, check its result.
  if (fs.existsSync(pendingPath)) {
    let pending = null;
    try { pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8')); } catch (_) {}
    if (pending && pending.bundle_id) {
      const result = readBundleResult(pending.bundle_id);
      if (result && result.result != null) {
        const parsed = typeof result.result === 'string' ? safeParseJson(result.result) : result.result;
        if (parsed) {
          console.log(`[persona-builder] bundle ${pending.bundle_id} complete — using result`);
          try { fs.unlinkSync(pendingPath); } catch (_) {}
          return parsed;
        }
        console.error(`[persona-builder] bundle ${pending.bundle_id} result unparseable; clearing pending and re-queueing`);
        try { fs.unlinkSync(pendingPath); } catch (_) {}
        // fall through to (b) and queue a new bundle
      } else {
        // Still queued — return pending sentinel, don't re-queue
        return { _pending: true, bundle_id: pending.bundle_id, queued_at: pending.queued_at };
      }
    }
  }

  // (b) Queue a new bundle
  const meta = createBundle({
    purpose: 'persona-refresh',
    system_prompt: SYNTHESIS_SYSTEM,
    input_data: userPrompt,
    output_spec: 'Strict JSON object matching the schema in the user prompt. No preamble, no markdown fence. The persona analysis fields: headline_read, openers, discovery_questions, transitions, friction_patterns, replicable_plays, voice_signature, confidence_markers — match whatever the prompt requires.',
    output_schema: 'json',
    model_hint: SYNTHESIS_MODEL,
    target_kind: 'profile',
    target_file: `team-brain/profiles/${slugKey}.md`,
    input_summary: `Persona synthesis · ${corpus.subject.name} (${role})`,
    created_by: 'persona-builder.js',
  });
  fs.writeFileSync(pendingPath, JSON.stringify({
    bundle_id: meta.id,
    slug: slugKey,
    queued_at: new Date().toISOString(),
  }, null, 2));
  console.log(`[persona-builder] queued bundle ${meta.id} for ${slugKey} — profile will regenerate on next refresh once processed`);
  return { _pending: true, bundle_id: meta.id, queued_at: new Date().toISOString() };
}

// ---- Stage 6: write profile markdown -------------------------------------

function renderProfileMarkdown(corpus, analysis) {
  const s = corpus.subject;
  const d = corpus.discovery;
  const lines = [];
  lines.push(`# ${s.name} — Excellence Profile`);
  lines.push('');
  lines.push(`**Status:** Auto-generated from HubSpot engagement corpus. Re-runnable via persona-builder.`);
  lines.push(`**Last updated:** ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`**Subject:** ${s.name} · ${s.email}`);
  lines.push(`**Source corpus:**`);
  lines.push(`- ${d.sent_emails_count} emails sent (via HubSpot)`);
  lines.push(`- ${d.unique_contacts} unique contacts touched · top ${d.top_n_contacts_pulled} pulled deep with full engagement history`);
  lines.push(`- ${d.unique_deals} unique deals touched · top ${d.top_n_deals_pulled} pulled deep`);
  const sup = corpus.supplements_used || [];
  if (sup.length) {
    const bySource = {};
    sup.forEach(s => { bySource[s.source_type] = (bySource[s.source_type] || 0) + 1; });
    Object.entries(bySource).forEach(([t, n]) => {
      lines.push(`- ${n} supplemental ${t} item${n === 1 ? '' : 's'} (from bus)`);
    });
  } else {
    lines.push(`- 0 supplemental items in bus (Apex hasn't staged Confluence/Teams/Outlook/Granola drops for this slug yet)`);
  }
  if (analysis.headline_metrics) {
    const hm = analysis.headline_metrics;
    if (hm.active_period) lines.push(`- Active period in corpus: ${hm.active_period}`);
    if (hm.primary_methodologies_discussed && hm.primary_methodologies_discussed.length) {
      lines.push(`- Methodologies discussed: ${hm.primary_methodologies_discussed.join(', ')}`);
    }
  }
  lines.push('');
  lines.push(`> Confidence markers in this profile: \`[high]\` = pattern visible in 3+ artifacts. \`[moderate]\` = 2 artifacts. \`[low]\` = single artifact — treat as a hypothesis to validate.`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Headline
  lines.push('## Headline read — the most replicable thing');
  lines.push('');
  lines.push(analysis.headline_read || '(no headline)');
  lines.push('');

  // Openers
  if (analysis.conversation_openers && analysis.conversation_openers.length) {
    lines.push('## Conversation openers');
    lines.push('');
    analysis.conversation_openers.forEach(o => {
      lines.push(`### ${o.context}`);
      lines.push('');
      lines.push(`**Pattern.** ${o.pattern}`);
      lines.push('');
      if (o.verbatim_examples && o.verbatim_examples.length) {
        lines.push('**Verbatim:**');
        o.verbatim_examples.forEach(q => lines.push(`> "${q}"`));
        lines.push('');
      }
    });
  }

  // Discovery
  if (analysis.discovery_questions && analysis.discovery_questions.length) {
    lines.push('## Discovery questions');
    lines.push('');
    analysis.discovery_questions.forEach(q => {
      lines.push(`- **${q.question_pattern}** — _surfaces:_ ${q.what_it_surfaces}`);
      (q.verbatim_examples || []).forEach(v => lines.push(`  > "${v}"`));
    });
    lines.push('');
  }

  // Transitions
  if (analysis.transitions && analysis.transitions.length) {
    lines.push('## Transitions');
    lines.push('');
    analysis.transitions.forEach(t => {
      lines.push(`### From ${t.from} → ${t.to}`);
      lines.push('');
      lines.push(t.pattern);
      lines.push('');
      (t.verbatim_examples || []).forEach(v => lines.push(`> "${v}"`));
      lines.push('');
    });
  }

  // Objection handling
  if (analysis.objection_handling && analysis.objection_handling.length) {
    lines.push('## Objection handling — what came up + how they handled it');
    lines.push('');
    lines.push('| Objection | Response pattern | Outcome visible | Confidence |');
    lines.push('|---|---|---|---|');
    analysis.objection_handling.forEach(o => {
      const obj = (o.objection_raised || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const resp = (o.response_pattern || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const out = (o.outcome_visible || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      lines.push(`| ${obj} | ${resp} | ${out} | ${o.confidence || ''} |`);
    });
    lines.push('');
    // Verbatim examples below the table
    analysis.objection_handling.forEach(o => {
      if (o.verbatim_examples && o.verbatim_examples.length) {
        lines.push(`**Verbatim — ${o.objection_raised}:**`);
        o.verbatim_examples.forEach(q => lines.push(`> "${q}"`));
        lines.push('');
      }
    });
  }

  // Conversion drivers
  if (analysis.conversion_drivers && analysis.conversion_drivers.length) {
    lines.push('## Conversion drivers — what specifically moved deals forward');
    lines.push('');
    analysis.conversion_drivers.forEach(c => {
      lines.push(`- **${c.driver}** _[${c.confidence || 'moderate'}]_`);
      if (c.evidence_thread) lines.push(`  Evidence: ${c.evidence_thread}`);
    });
    lines.push('');
  }

  // Language bank
  if (analysis.verbatim_language_bank) {
    lines.push('## Verbatim language bank');
    lines.push('');
    const bank = analysis.verbatim_language_bank;
    Object.entries(bank).forEach(([cat, phrases]) => {
      if (!phrases || !phrases.length) return;
      lines.push(`### ${cat.replace(/_/g, ' ')}`);
      lines.push('');
      phrases.forEach(p => lines.push(`- "${p}"`));
      lines.push('');
    });
  }

  // Customer archetypes
  if (analysis.customer_archetypes && analysis.customer_archetypes.length) {
    lines.push('## Customer archetypes — who they engaged well');
    lines.push('');
    analysis.customer_archetypes.forEach(a => {
      lines.push(`### ${a.archetype}`);
      lines.push('');
      lines.push(`**Characteristics.** ${a.characteristics}`);
      lines.push('');
      lines.push(`**Approach.** ${a.approach_used}`);
      lines.push('');
      if (a.example_thread) lines.push(`**Example.** ${a.example_thread}`);
      lines.push('');
    });
  }

  // Anti-patterns
  if (analysis.anti_patterns_visible && analysis.anti_patterns_visible.length) {
    lines.push('## Anti-patterns visible');
    lines.push('');
    analysis.anti_patterns_visible.forEach(a => {
      lines.push(`- **${a.pattern}** — ${a.evidence || ''}`);
    });
    lines.push('');
  }

  // Next capture pass
  if (analysis.next_capture_pass && analysis.next_capture_pass.length) {
    lines.push('## Next capture pass — what would deepen this');
    lines.push('');
    analysis.next_capture_pass.forEach((n, i) => lines.push(`${i+1}. ${n}`));
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Generated by persona-builder from HubSpot corpus \`coaching/cache/persona-corpus-${corpus.subject.slug}.json\`. Re-run to refresh.*`);

  return lines.join('\n');
}

function writeProfile(slug, markdown) {
  // Primary: bus path (shared with Claudia's tool)
  if (!fs.existsSync(BUS_PROFILES)) fs.mkdirSync(BUS_PROFILES, { recursive: true });
  const busPath = path.join(BUS_PROFILES, `${slug}.md`);
  fs.writeFileSync(busPath, markdown);
  // Mirror: coaching/[slug]-profile.md so existing BRAIN API serves it
  const coachingPath = path.join(COACHING_ROOT, `${slug}-profile.md`);
  fs.writeFileSync(coachingPath, markdown);
  return { busPath, coachingPath };
}

// ---- Orchestrator ---------------------------------------------------------

async function buildPersona({ slug, name, email, seed, useCachedCorpus = false }) {
  if (!slug || !name) throw new Error('slug and name required');
  if (!email) throw new Error('email required (HubSpot search predicate)');

  let corpus;
  const corpusPath = path.join(CACHE_DIR, `persona-corpus-${slug}.json`);
  if (useCachedCorpus && fs.existsSync(corpusPath)) {
    console.log(`[persona-builder] using cached corpus ${corpusPath}`);
    corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  } else {
    corpus = await buildCorpus({ slug, name, email, seed });
    if (corpus.error) return { ok: false, ...corpus };
  }

  const supplements = loadSupplements(slug);
  if (supplements.length) {
    console.log(`[persona-builder] loaded ${supplements.length} supplemental items from bus`);
  }

  console.log(`[persona-builder] synthesising via bundle queue (subscription compute)`);
  const analysis = await synthesize(corpus, supplements, slug);

  // Bundle still in flight — leave the previous profile.md as-is and return.
  // Next refresh of this slug will pick up the completed bundle result.
  if (analysis && analysis._pending) {
    console.log(`[persona-builder] ${slug}: bundle ${analysis.bundle_id} queued; previous profile preserved`);
    return {
      ok: false,
      pending: true,
      slug,
      name,
      bundle_id: analysis.bundle_id,
      queued_at: analysis.queued_at,
      corpus_path: corpusPath,
      discovery: corpus.discovery,
      message: 'Persona synthesis queued. Profile will regenerate on next refresh after Cowork or Claude Code processes the bundle.',
    };
  }

  // Capture supplement counts in the corpus before rendering for the source list
  corpus.supplements_used = supplements.map(s => ({ file: s.file, source_type: s.source_type }));
  const markdown = renderProfileMarkdown(corpus, analysis);
  const paths = writeProfile(slug, markdown);
  console.log(`[persona-builder] profile written: ${paths.busPath}`);
  console.log(`[persona-builder] mirror:           ${paths.coachingPath}`);

  return {
    ok: true,
    slug,
    name,
    corpus_path: corpusPath,
    bus_path: paths.busPath,
    coaching_path: paths.coachingPath,
    discovery: corpus.discovery,
  };
}

// ---- Registry-driven refresh (continuous pipeline) -----------------------

const REGISTRY_PATH = path.join(CACHE_DIR, 'persona-registry.json');

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return { personas: [], _last_refreshed: null };
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function writeRegistry(reg) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2));
}

async function refreshOne(slug) {
  const reg = loadRegistry();
  const entry = (reg.personas || []).find(p => p.slug === slug);
  if (!entry) throw new Error(`unknown persona slug: ${slug}`);
  const result = await buildPersona({
    slug: entry.slug,
    name: entry.name,
    email: entry.email,
    seed: entry.seed || undefined,
  });
  entry.last_refreshed = new Date().toISOString();
  entry.last_result = {
    ok: result.ok,
    discovery: result.discovery || null,
    error: result.error || null,
  };
  writeRegistry(reg);
  return result;
}

async function refreshAll() {
  const reg = loadRegistry();
  const results = [];
  for (const p of reg.personas || []) {
    try {
      console.log(`[persona-builder] refreshing ${p.slug}`);
      const r = await refreshOne(p.slug);
      results.push({ slug: p.slug, ok: r.ok, error: r.error || null });
    } catch (e) {
      results.push({ slug: p.slug, ok: false, error: e.message });
    }
  }
  reg._last_refreshed = new Date().toISOString();
  writeRegistry(reg);
  return { generated_at: reg._last_refreshed, results };
}

module.exports = { buildPersona, buildCorpus, synthesize, renderProfileMarkdown, refreshOne, refreshAll, loadRegistry };
