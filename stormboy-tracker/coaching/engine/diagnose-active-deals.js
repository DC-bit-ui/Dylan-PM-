/**
 * Batch orchestrator — runs diagnose-from-timeline across the top N active deals.
 *
 * Reads coaching/cache/active.json, sorts by risk_score DESC, calls Claude for
 * each (with HubSpot timeline pulled live), writes results incrementally to
 * coaching/cache/deal-diagnoses.json so frontend can show progress.
 *
 * Rate-limit safety: 35s between deals (Anthropic 4K tokens/min with ~3K
 * tokens per call leaves headroom). 20 deals × 35s ≈ 12 min.
 */

const fs = require('fs');
const path = require('path');
const { diagnose } = require('./diagnose-from-timeline');

const ACTIVE_CACHE  = path.join(__dirname, '..', 'cache', 'active.json');
const DIAGNOSES_CACHE = path.join(__dirname, '..', 'cache', 'deal-diagnoses.json');
const THROTTLE_MS = 35000;

let _jobState = {
  running: false,
  started_at: null,
  finished_at: null,
  target_count: 0,
  completed_count: 0,
  failed_count: 0,
  current_deal: null,
  errors: [],
};

function loadActiveDeals() {
  const raw = JSON.parse(fs.readFileSync(ACTIVE_CACHE, 'utf8'));
  return raw.deals || [];
}

function loadDiagnoses() {
  if (!fs.existsSync(DIAGNOSES_CACHE)) {
    return { generated_at: null, deals: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(DIAGNOSES_CACHE, 'utf8'));
  } catch (_) {
    return { generated_at: null, deals: {} };
  }
}

function saveDiagnoses(data) {
  const tmp = DIAGNOSES_CACHE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DIAGNOSES_CACHE);
}

function dealToDiagnoseInput(d) {
  return {
    kind: 'stuck_deal',
    title: d.deal_name,
    subtitle: `${d.current_stage} · ${d.days_in_current_stage}d in stage · attribution: ${d.attribution || 'direct'}`,
    lookup_type: 'deal',
    lookup_id: d.deal_id,
    assigned_to_name: '(see HubSpot deal owner)',
    next_step_short: d.primary_action ? d.primary_action.slice(0, 80) : 'Generate next step from artifacts',
    next_step_qualifier: d.coaching_message ? d.coaching_message.slice(0, 280) : '',
    other_evidence: [
      {
        source: `Stage friction baseline`,
        content: `Median time-to-close at this stage: won=${d.median_won_at_stage}d, lost=${d.median_lost_at_stage}d. Current dwell: ${d.days_in_current_stage}d. Risk class: ${d.risk_class} (${d.risk_score}).`,
      },
    ],
  };
}

async function diagnoseDeal(d) {
  const input = dealToDiagnoseInput(d);
  const result = await diagnose(input);
  return {
    deal_id: d.deal_id,
    deal_name: d.deal_name,
    risk_class: d.risk_class,
    risk_score: d.risk_score,
    current_stage: d.current_stage,
    days_in_current_stage: d.days_in_current_stage,
    attribution: d.attribution,
    diagnosis: result.diagnosis || [],
    next_step_short: result.next_step_short,
    next_step_qualifier: result.next_step_qualifier,
    diagnosis_assessment: result.diagnosis_assessment,
    timeline_used: result.timeline_used,
    regenerated_at: result.generated_at,
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runBatch({ limit = 20 } = {}) {
  if (_jobState.running) {
    return { started: false, reason: 'job already running', state: _jobState };
  }

  const deals = loadActiveDeals()
    .slice()
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, limit);

  _jobState = {
    running: true,
    started_at: new Date().toISOString(),
    finished_at: null,
    target_count: deals.length,
    completed_count: 0,
    failed_count: 0,
    current_deal: null,
    errors: [],
  };

  // Run async without awaiting — caller gets immediate response
  (async () => {
    const cache = loadDiagnoses();
    for (let i = 0; i < deals.length; i++) {
      const d = deals[i];
      _jobState.current_deal = { deal_id: d.deal_id, deal_name: d.deal_name, index: i + 1 };
      console.log(`[diagnose-batch] ${i + 1}/${deals.length} ${d.deal_name}`);
      try {
        const entry = await diagnoseDeal(d);
        cache.deals[d.deal_id] = entry;
        cache.generated_at = new Date().toISOString();
        saveDiagnoses(cache);
        _jobState.completed_count++;
        console.log(`[diagnose-batch]   ✓ ${entry.diagnosis_assessment} · ${entry.next_step_short || '(no next step)'}`);
      } catch (e) {
        _jobState.failed_count++;
        _jobState.errors.push({ deal_id: d.deal_id, deal_name: d.deal_name, error: e.message });
        console.error(`[diagnose-batch]   ✗ ${e.message}`);
      }
      if (i < deals.length - 1) await sleep(THROTTLE_MS);
    }
    _jobState.running = false;
    _jobState.finished_at = new Date().toISOString();
    _jobState.current_deal = null;
    console.log(`[diagnose-batch] DONE. ${_jobState.completed_count}/${_jobState.target_count} succeeded.`);
  })().catch(e => {
    _jobState.running = false;
    _jobState.finished_at = new Date().toISOString();
    _jobState.errors.push({ phase: 'orchestrator', error: e.message });
  });

  return { started: true, state: { ..._jobState } };
}

function getState() {
  return { ..._jobState };
}

function getCache() {
  return loadDiagnoses();
}

module.exports = { runBatch, getState, getCache };
