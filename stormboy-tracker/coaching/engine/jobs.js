/**
 * Job runner — orchestrates the scheduled jobs that produce coaching caches.
 *
 * v1: hand-written job stubs that read from a HubSpot adapter (or mock data),
 *     shape input per prompt's contract, call Claude, write the cache.
 *
 * For Monday's live-data wiring, each job's input-shaping logic plugs into
 *  hubspot adapter; the prompt-call + cache-write stay identical.
 *
 * For the pre-token weekend demo, runAll() can be invoked with mode='mock'
 * to skip the Claude calls and just write canned mock outputs to the cache.
 */
const cache = require('./cache');
const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

function loadPrompt(filename) {
  const p = path.join(PROMPTS_DIR, filename);
  if (!fs.existsSync(p)) throw new Error('Prompt file missing: ' + filename);
  return fs.readFileSync(p, 'utf8');
}

/**
 * Run all jobs. mode='mock' writes canned outputs; mode='live' will eventually
 * call Claude (not implemented yet — Monday hop).
 */
async function runAll(mode = 'mock') {
  const ranAt = new Date().toISOString();
  const ran = [];

  if (mode === 'mock') {
    // Lazy-load mock generator to avoid loading heavy module until needed.
    const mock = require('./mock');
    cache.write('email_distillates', mock.emailDistillates());
    ran.push('email_distillates');
    cache.write('farm_visit_distillates', mock.farmVisitDistillates());
    ran.push('farm_visit_distillates');
    cache.write('friction', mock.friction());
    ran.push('friction');
    cache.write('twins', mock.twins());
    ran.push('twins');
    cache.write('objections', mock.objections());
    ran.push('objections');
    cache.write('active', mock.active());
    ran.push('active');
    cache.write('weekly', mock.weekly());
    ran.push('weekly');
    // Note: system learnings are written directly to coaching/learnings/YYYY-MM/
    // as markdown files — not into the cache layer. Auto-written, no approval
    // gate. Already on disk; nothing to write here in mock mode.

    // Bus mirror: write deal-signals to shared-growth-memory for any active
    // deal that has multi-signal data (currently just Daisy Bank). Same call
    // pattern as the live pipeline so behaviour is consistent.
    try {
      const bus = require('./shared-bus');
      const active = mock.active();
      let busWrites = 0;
      for (const d of (active.deals || [])) {
        if (!d.signals) continue; // only write deals with multi-signal data populated
        bus.writeDealSignal({
          deal_id: d.deal_id,
          deal_name: d.deal_name,
          as_of: ranAt,
          attribution: d.attribution,
          current_stage: d.current_stage,
          days_in_current_stage: d.days_in_current_stage,
          signals: d.signals,
          coaching_mode: d.coaching_mode,
          active_probes: [],
          what_we_dont_know: d.what_we_dont_know || [],
          supporting_twin_ids: d.supporting_twin_ids || [],
          next_recommended_action: d.primary_action || null
        });
        busWrites++;
      }
      if (busWrites > 0) ran.push('shared-bus:' + busWrites + '-deal-signals');
    } catch (e) {
      console.error('mock bus seeding failed:', e.message);
    }

    return { mode, ranAt, ran };
  }

  // mode === 'live' — real HubSpot + Anthropic pipeline.
  // Implementation in live-pipeline.js. Reads live HubSpot deals via the dashboard's
  // existing proxy, runs A1/B2/B1 against real data, writes real coaching to cache.
  const live = require('./live-pipeline');
  return live.runAllLive();
}

module.exports = { runAll, loadPrompt };
