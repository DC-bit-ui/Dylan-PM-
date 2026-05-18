/**
 * Batch orchestrator for Storm Boy contacts — Farm Visits Completed + Call Queue.
 *
 * Mirrors diagnose-active-deals.js but for contacts. Pulls /stormboy/detail
 * for each stage, runs diagnose() per contact with 35s throttle, writes to
 * coaching/cache/contact-diagnoses.json incrementally.
 *
 * Expected total: ~22 completed visits + ~8 stalled calls = ~30 contacts.
 * 30 × 35s = ~18 minutes.
 */

const fs = require('fs');
const path = require('path');
const { diagnose } = require('./diagnose-from-timeline');
const stormboyDetail = require('./stormboy-detail');

const CACHE_PATH = path.join(__dirname, '..', 'cache', 'contact-diagnoses.json');
const THROTTLE_MS = 35000;

let _jobState = {
  running: false,
  started_at: null,
  finished_at: null,
  target_count: 0,
  completed_count: 0,
  failed_count: 0,
  current_contact: null,
  errors: [],
};

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return { generated_at: null, contacts: {} };
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch (_) {
    return { generated_at: null, contacts: {} };
  }
}

function saveCache(data) {
  const tmp = CACHE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, CACHE_PATH);
}

function contactToInput(c) {
  let kind;
  let subtitle;
  if (c.stage === 'Farm Visit completed') {
    kind = 'completed_visit';
    subtitle = `Farm visit completed · ${c.days_since_visit ?? '?'}d ago · last contact ${c.days_since_contact ?? '?'}d ago`;
  } else if (c.stage === 'Farm Visit booked') {
    kind = 'upcoming_visit';
    subtitle = `Farm visit booked · scheduled ${c.meeting_date ? c.meeting_date.slice(0, 10) : 'no date set'} · last contact ${c.days_since_contact ?? '?'}d ago`;
  } else {
    kind = 'stalled_call';
    subtitle = `In Conversation · stalled ${c.days_since_contact ?? '?'}d`;
  }

  const otherEvidence = [];
  if (c.call_distillate) {
    otherEvidence.push({
      source: `Aircall · ${c.call_distillate.transcript_id}`,
      content: `Outcome: ${c.call_distillate.outcome || '?'}. ${c.call_distillate.one_line || ''}`,
    });
  }
  if (c.heat_reasoning && c.heat_reasoning.length) {
    otherEvidence.push({
      source: 'Heuristic signals',
      content: c.heat_reasoning.join(' · '),
    });
  }

  return {
    kind,
    title: c.name,
    subtitle,
    lookup_type: 'contact',
    lookup_id: c.id,
    assigned_to_name: '(see HubSpot owner)',
    next_step_short: c.next_step_short,
    next_step_qualifier: c.next_step,
    other_evidence: otherEvidence,
  };
}

async function diagnoseContact(c) {
  const input = contactToInput(c);
  const result = await diagnose(input);
  if (result && result._pending) {
    return {
      contact_id: c.id,
      name: c.name,
      stage: c.stage,
      heat: c.heat,
      owner_id: c.owner_id,
      diagnosis: [],
      next_step_short: '(pending — bundle queued)',
      next_step_qualifier: 'Cowork or Claude Code will process this bundle; diagnosis appears on next batch run.',
      diagnosis_assessment: 'pending',
      bundle_id: result.bundle_id,
      queued_at: result.queued_at,
      timeline_used: result.timeline_used,
      regenerated_at: new Date().toISOString(),
    };
  }
  return {
    contact_id: c.id,
    name: c.name,
    stage: c.stage,
    heat: c.heat,
    owner_id: c.owner_id,
    diagnosis: result.diagnosis || [],
    next_step_short: result.next_step_short,
    next_step_qualifier: result.next_step_qualifier,
    diagnosis_assessment: result.diagnosis_assessment,
    timeline_used: result.timeline_used,
    regenerated_at: result.generated_at,
    from_bundle: result.from_bundle,
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runBatch({ stages = ['Farm Visit completed', 'In Conversation'] } = {}) {
  if (_jobState.running) {
    return { started: false, reason: 'job already running', state: _jobState };
  }

  // Pull each stage
  const all = [];
  for (const stage of stages) {
    const result = await stormboyDetail.run(stage);
    const contacts = result.contacts || [];
    // For In Conversation, only include stalled (≥3d since last contact)
    const filtered = stage === 'In Conversation'
      ? contacts.filter(c => (c.days_since_contact ?? 99) >= 3)
      : contacts;
    all.push(...filtered);
  }
  // Skip contacts already diagnosed unless force=true
  // (caller passes existing cache state; for simplicity we let them through here
  // and let the LLM regenerate — disk write is idempotent on contact_id key)

  _jobState = {
    running: true,
    started_at: new Date().toISOString(),
    finished_at: null,
    target_count: all.length,
    completed_count: 0,
    failed_count: 0,
    current_contact: null,
    errors: [],
  };

  (async () => {
    const cache = loadCache();
    for (let i = 0; i < all.length; i++) {
      const c = all[i];
      _jobState.current_contact = { id: c.id, name: c.name, stage: c.stage, index: i + 1 };
      console.log(`[contact-batch] ${i + 1}/${all.length} ${c.name} (${c.stage})`);
      try {
        const entry = await diagnoseContact(c);
        cache.contacts[c.id] = entry;
        cache.generated_at = new Date().toISOString();
        saveCache(cache);
        _jobState.completed_count++;
        console.log(`[contact-batch]   ✓ ${entry.diagnosis_assessment} · ${entry.next_step_short || '(no next step)'}`);
      } catch (e) {
        _jobState.failed_count++;
        _jobState.errors.push({ contact_id: c.id, name: c.name, error: e.message });
        console.error(`[contact-batch]   ✗ ${e.message}`);
      }
      if (i < all.length - 1) await sleep(THROTTLE_MS);
    }
    _jobState.running = false;
    _jobState.finished_at = new Date().toISOString();
    _jobState.current_contact = null;
    console.log(`[contact-batch] DONE. ${_jobState.completed_count}/${_jobState.target_count} succeeded.`);
  })().catch(e => {
    _jobState.running = false;
    _jobState.finished_at = new Date().toISOString();
    _jobState.errors.push({ phase: 'orchestrator', error: e.message });
  });

  return { started: true, state: { ..._jobState } };
}

function getState() { return { ..._jobState }; }
function getCache() { return loadCache(); }

module.exports = { runBatch, getState, getCache };
