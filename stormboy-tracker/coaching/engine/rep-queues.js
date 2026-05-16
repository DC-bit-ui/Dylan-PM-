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
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/batch/read', {
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
  };
}

function contactDiagnosisToCard(dx) {
  const kindByStage = {
    'Farm Visit completed': 'completed_visit',
    'Farm Visit booked':    'upcoming_visit',
    'In Conversation':      'stalled_call',
  };
  return {
    card_id: 'contact-' + dx.contact_id,
    kind: kindByStage[dx.stage] || 'contact',
    lookup_type: 'contact',
    lookup_id: dx.contact_id,
    hubspot_url: `https://app.hubspot.com/contacts/24224559/contact/${dx.contact_id}`,
    title: dx.name,
    subtitle: `${dx.stage}${dx.heat ? ' · heat ' + dx.heat : ''}`,
    heat: dx.heat,
    owner_id: dx.owner_id || null,
    next_step_short: dx.next_step_short,
    next_step_qualifier: dx.next_step_qualifier,
    diagnosis: dx.diagnosis || [],
    diagnosis_assessment: dx.diagnosis_assessment,
    diagnosis_generated_at: dx.regenerated_at,
  };
}

function atomicWrite(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

async function buildQueues() {
  const dealCache = loadDealDiagnoses();
  const contactCache = loadContactDiagnoses();

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
    ensure(slug, dx.owner_id).cards.push(contactDiagnosisToCard(dx));
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
      version: 'rep-queue-1.0',
      generated_at: new Date().toISOString(),
      rep_slug: slug,
      owner_id: bucket.owner_id,
      card_count: bucket.cards.length,
      cards: bucket.cards,
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

module.exports = { buildQueues, ownerSlug, OWNER_SLUGS };
