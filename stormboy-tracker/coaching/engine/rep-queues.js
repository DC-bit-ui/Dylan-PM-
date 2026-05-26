/**
 * Rep queue builder — buckets diagnosed deals + contacts by owner and writes
 * per-rep queue files into the shared-growth-memory bus so each rep's Claude
 * Code workspace can read their own work-cards.
 *
 * Output: shared-growth-memory/queues/{rep_slug}/work-cards.json
 *
 * Each rep's queue contains all cards (deal + contact diagnoses) where they
 * are the HubSpot owner. Cards are exemplar-shape (matches the v2 dashboard's
 * card primitive) so Claudia's tool can render them with the same UX or
 * surface them in any other workflow.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const COACHING_CACHE = path.join(__dirname, '..', 'cache');
const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const QUEUES_DIR = path.join(BUS_ROOT, 'queues');

// HubSpot owner_id → rep slug. Slugs match SharePoint folder conventions
// and Claudia's user-preferences naming.
const OWNER_SLUGS = {
  '145644281': 'harrison-inactive',
  '361236574': 'hobbs',
  '76812243':  'ben',
  '78272376':  'claudia',
  '361823546': 'will',
  '401770537': 'dylan-jones',
};

function ownerSlug(ownerId) {
  if (!ownerId) return 'unassigned';
  return OWNER_SLUGS[String(ownerId)] || `owner-${ownerId}`;
}

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return fallback; }
}

function loadDealDiagnoses() {
  return loadJson(path.join(COACHING_CACHE, 'deal-diagnoses.json'), { deals: {} });
}

function loadContactDiagnoses() {
  return loadJson(path.join(COACHING_CACHE, 'contact-diagnoses.json'), { contacts: {} });
}

/**
 * Active.json holds the source deals with owner info missing. We fetch the
 * owner from HubSpot during queue build so each deal lands in the right rep's
 * bucket. Cached in memory for the duration of one build.
 */
async function fetchDealOwners(dealIds) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');
  if (!dealIds.length) return {};
  const body = {
    inputs: dealIds.map(id => ({ id: String(id) })),
    properties: ['hubspot_owner_id'],
  };
  const res = await hubspotFetch('https://api.hubapi.com/crm/v3/objects/deals/batch/read', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('HubSpot batch read failed: ' + res.status);
  const data = await res.json();
  const out = {};
  (data.results || []).forEach(d => {
    out[d.id] = d.properties && d.properties.hubspot_owner_id;
  });
  return out;
}

function dealDiagnosisToCard(dx, ownerId) {
  // Card-format version is bumped to 1.1 to signal new shape with
  // evidence array, snapshot_state hooks, and refresh_in_flight marker
  // for the rep's Claude Code consumers (see README + INTEGRATION).
  return {
    card_id: 'deal-' + dx.deal_id,
    kind: 'stuck_deal',
    lookup_type: 'deal',
    lookup_id: dx.deal_id,
    hubspot_url: `https://app.hubspot.com/contacts/24224559/record/0-3/${dx.deal_id}`,
    title: dx.deal_name,
    subtitle: `${dx.current_stage} · ${dx.days_in_current_stage}d in stage · ${dx.attribution || 'direct'} · risk ${dx.risk_score}`,
    heat: dx.risk_class === 'red' ? 'HOT' : dx.risk_class === 'amber' ? 'WARM' : 'COLD',
    owner_id: ownerId || null,
    next_step_short: dx.next_step_short,
    next_step_qualifier: dx.next_step_qualifier,
    diagnosis: dx.diagnosis || [],
    diagnosis_assessment: dx.diagnosis_assessment,
    diagnosis_generated_at: dx.regenerated_at,
    risk_score: dx.risk_score,
    risk_class: dx.risk_class,
    current_stage: dx.current_stage,
    days_in_current_stage: dx.days_in_current_stage,
    attribution: dx.attribution,
    refresh_in_flight: dx.refresh_in_flight || null,
    evidence: [],   // dashboard-side deal diagnoses don't carry the same
                    // signal channels as contacts (snapshot/ticket/Teams)
                    // — populated for contacts only. Reserved for future.
  };
}

// Build a contact card. If snapshotByContactId is provided (Farm Visit
// completed only), the card's next-step is overridden with the
// evidence-driven snapshot-state output, and the evidence array is
// populated for the rep's Claude Code to consume.
function contactDiagnosisToCard(dx, { snapshotByContactId = {} } = {}) {
  const kindByStage = {
    'Farm Visit completed': 'completed_visit',
    'Farm Visit booked':    'upcoming_visit',
    'In Conversation':      'stalled_call',
  };
  const ss = snapshotByContactId[dx.contact_id] || null;
  // Snapshot-state wins for Farm Visit completed contacts because it's
  // evidence-driven (across HubSpot emails + tickets + custom flags +
  // optional Teams Graph). The cached LLM diagnosis often anchored on
  // the old "Send KCT or contract draft now" template input — out of
  // step with reality.
  const nextStepShort = ss ? ss.next_step_short : dx.next_step_short;
  const nextStepQualifier = ss ? ss.next_step : dx.next_step_qualifier;

  // Build evidence array from snapshot-state + any other rich context.
  const evidence = [];
  if (ss && Array.isArray(ss.evidence)) {
    const kindLabels = {
      snapshot_sent: 'HubSpot email · snapshot sent',
      customer_replied: 'HubSpot email · customer replied',
      flag_set: 'HubSpot property · flag set',
      kct_willing: 'HubSpot property · KCT willing',
      positive_sentiment: 'Last note · sentiment',
      ticket_requested: 'HubSpot ticket · requested',
      ticket_in_production: 'HubSpot ticket · in production',
      ticket_sent: 'HubSpot ticket · sent',
      ticket_exists: 'HubSpot ticket · exists (stage hidden)',
      teams_mention: 'Microsoft Teams · channel mention',
    };
    ss.evidence.forEach(e => {
      evidence.push({
        source: kindLabels[e.kind] || e.source || e.kind,
        kind: e.kind,
        detail: e.detail || '',
      });
    });
  }

  return {
    card_id: 'contact-' + dx.contact_id,
    kind: kindByStage[dx.stage] || 'contact',
    lookup_type: 'contact',
    lookup_id: dx.contact_id,
    hubspot_url: `https://app.hubspot.com/contacts/24224559/contact/${dx.contact_id}`,
    title: dx.name,
    subtitle: `${dx.stage}${dx.heat ? ' · heat ' + dx.heat : ''}${ss ? ' · ' + ss.state : ''}`,
    heat: dx.heat,
    owner_id: dx.owner_id || null,
    next_step_short: nextStepShort,
    next_step_qualifier: nextStepQualifier,
    diagnosis: dx.diagnosis || [],
    diagnosis_assessment: dx.diagnosis_assessment,
    diagnosis_generated_at: dx.regenerated_at,
    snapshot_state: ss ? {
      state: ss.state,
      evidence: ss.evidence || [],
    } : null,
    horizon_snapshot_created: dx.horizon_snapshot_created || null,
    proceed_to_kct: dx.proceed_to_kct || null,
    evidence,
    refresh_in_flight: dx.refresh_in_flight || null,
  };
}

function atomicWrite(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

// Enrich Farm Visit completed contact records with live snapshot-state
// at build time. Reads HubSpot emails + tickets + (optional) Teams +
// custom properties. Returns { contactId: snapshot_state }.
async function enrichSnapshotStateForFarmVisitCompleted(contactCache) {
  try {
    const token = process.env.HUBSPOT_TOKEN;
    if (!token) return {};
    const fvcContactIds = Object.entries(contactCache.contacts || {})
      .filter(([_, dx]) => dx.stage === 'Farm Visit completed')
      .map(([id]) => id);
    if (!fvcContactIds.length) return {};

    // Fetch contact records with the properties snapshot-state needs
    // (one batch call rather than per-contact). Then prime the
    // __snapshot_last_note hook with a per-contact last-note fetch.
    const props = [
      'firstname', 'lastname', 'contact_lead_stage_storm_boy',
      'storm_boy__date_called', 'storm_boy__meeting_date',
      'storm_boy__horizon_snapshot_created',
      'storm_boy__proceed_to_kct_stage',
      'notes_last_contacted',
    ];
    const batchBody = {
      properties: props,
      inputs: fvcContactIds.map(id => ({ id: String(id) })),
    };
    const batchRes = await hubspotFetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/read', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(batchBody),
    });
    if (!batchRes.ok) throw new Error('contact batch read: ' + batchRes.status);
    const batchData = await batchRes.json();
    const contacts = (batchData.results || []);

    // Fetch each contact's last note (sequential — small N).
    const fetchLastNote = require('./stormboy-detail').__fetchLastNote
      || (async (_t, _id) => null);
    // stormboy-detail doesn't export fetchLastNote — quick re-implementation
    async function getLastNoteLocal(contactId) {
      try {
        const assocRes = await hubspotFetch(
          `https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/notes?limit=10`,
          { headers: { Authorization: 'Bearer ' + token } });
        if (!assocRes.ok) return null;
        const assoc = await assocRes.json();
        const noteIds = (assoc.results || []).map(r => r.toObjectId).filter(Boolean);
        if (!noteIds.length) return null;
        const latest = noteIds.sort((a, b) => Number(b) - Number(a))[0];
        const noteRes = await hubspotFetch(
          'https://api.hubapi.com/crm/v3/objects/notes/batch/read',
          {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inputs: [{ id: String(latest) }],
              properties: ['hs_note_body', 'hs_timestamp'],
            }),
          });
        if (!noteRes.ok) return null;
        const noteData = await noteRes.json();
        const note = (noteData.results || [])[0];
        if (!note) return null;
        return {
          body: note.properties.hs_note_body || '',
          timestamp: note.properties.hs_timestamp,
        };
      } catch (_) { return null; }
    }

    for (const c of contacts) {
      c.__snapshot_last_note = await getLastNoteLocal(c.id);
    }

    const { enrichContactsWithSnapshotState } = require('./snapshot-state');
    await enrichContactsWithSnapshotState(token, contacts);

    const out = {};
    contacts.forEach(c => {
      if (c.__snapshot_state) out[c.id] = c.__snapshot_state;
    });
    return out;
  } catch (e) {
    console.warn('[rep-queues] snapshot-state enrichment failed:', e.message);
    return {};
  }
}

async function buildQueues() {
  const dealCache = loadDealDiagnoses();
  const contactCache = loadContactDiagnoses();

  // Enrich Farm Visit completed contacts with live snapshot-state so
  // each rep's queue card reflects the evidence-driven next-step, not
  // the cached LLM diagnosis (which may have anchored on stale text).
  const snapshotByContactId = await enrichSnapshotStateForFarmVisitCompleted(contactCache);

  // Fetch deal owners (cache doesn't store them; need HubSpot lookup)
  const dealIds = Object.keys(dealCache.deals || {});
  let dealOwners = {};
  try {
    dealOwners = await fetchDealOwners(dealIds);
  } catch (e) {
    console.warn('[rep-queues] Could not fetch deal owners:', e.message);
    // proceed; deals will land in 'unassigned'
  }

  const buckets = {}; // slug -> { rep_slug, owner_id, cards: [] }
  function ensure(slug, ownerId) {
    if (!buckets[slug]) buckets[slug] = { rep_slug: slug, owner_id: ownerId || null, cards: [] };
    return buckets[slug];
  }

  // Deals
  for (const [id, dx] of Object.entries(dealCache.deals || {})) {
    const ownerId = dealOwners[id];
    const slug = ownerSlug(ownerId);
    ensure(slug, ownerId).cards.push(dealDiagnosisToCard(dx, ownerId));
  }

  // Contacts (owner_id already in the diagnosis cache)
  for (const [id, dx] of Object.entries(contactCache.contacts || {})) {
    const slug = ownerSlug(dx.owner_id);
    ensure(slug, dx.owner_id).cards.push(
      contactDiagnosisToCard(dx, { snapshotByContactId })
    );
  }

  // Sort each bucket: HOT first, then by recency
  const heatOrder = { HOT: 0, WARM: 1, COLD: 2 };
  Object.values(buckets).forEach(b => {
    b.cards.sort((a, b) => {
      const h = (heatOrder[a.heat] ?? 3) - (heatOrder[b.heat] ?? 3);
      if (h !== 0) return h;
      return new Date(b.diagnosis_generated_at || 0) - new Date(a.diagnosis_generated_at || 0);
    });
  });

  // Ensure queues dir exists
  if (!fs.existsSync(QUEUES_DIR)) fs.mkdirSync(QUEUES_DIR, { recursive: true });

  // Write per-rep files
  const summary = { generated_at: new Date().toISOString(), reps: {} };
  for (const [slug, bucket] of Object.entries(buckets)) {
    const filePath = path.join(QUEUES_DIR, slug, 'work-cards.json');
    const payload = {
      version: 'rep-queue-1.1',
      generated_at: new Date().toISOString(),
      rep_slug: slug,
      owner_id: bucket.owner_id,
      card_count: bucket.cards.length,
      cards: bucket.cards,
      // Card-shape changelog so consumers (Claudia's Claude Code,
      // any other reader) can adapt. Bumped from 1.0 → 1.1 on
      // 2026-05-21 with the addition of snapshot_state, evidence[],
      // and proceed_to_kct fields.
      shape_changelog: [
        '1.0 → 1.1 (2026-05-21): contact cards gain snapshot_state, evidence[], proceed_to_kct, horizon_snapshot_created. deal cards gain risk_score, risk_class, current_stage, days_in_current_stage, attribution, refresh_in_flight, evidence[] (reserved). subtitle now includes snapshot state for Farm Visit completed.',
      ],
    };
    atomicWrite(filePath, JSON.stringify(payload, null, 2));
    summary.reps[slug] = {
      owner_id: bucket.owner_id,
      card_count: bucket.cards.length,
      path: path.relative(BUS_ROOT, filePath),
    };
  }

  // Also write a top-level index for discoverability
  atomicWrite(
    path.join(QUEUES_DIR, 'INDEX.json'),
    JSON.stringify(summary, null, 2)
  );

  return summary;
}

// Wrapper that respects the BUS_WRITES_ENABLED gate and swallows errors.
// Call this from any code path that refreshes deal-diagnoses or contact-
// diagnoses caches so the per-rep work-cards stay in sync with what the
// dashboard renders. Without this, the bus only refreshes on the daily 5am
// scheduler fire — UI-triggered cache refreshes left Ben's queue stale for
// up to 24h (and indefinitely if the server restarted between fires).
async function buildQueuesIfEnabled(reason) {
  if (process.env.BUS_WRITES_ENABLED !== 'true') {
    console.log(`[rep-queues] skipped (BUS_WRITES_ENABLED!=true) — reason: ${reason || 'unspecified'}`);
    return { skipped: true };
  }
  try {
    const r = await buildQueues();
    const counts = Object.fromEntries(Object.entries(r.reps).map(([k, v]) => [k, v.card_count]));
    console.log(`[rep-queues] rebuilt after ${reason || 'unspecified'}:`, counts);
    return r;
  } catch (e) {
    console.error(`[rep-queues] rebuild after ${reason || 'unspecified'} failed:`, e.message);
    return { error: e.message };
  }
}

module.exports = { buildQueues, buildQueuesIfEnabled, ownerSlug, OWNER_SLUGS };
