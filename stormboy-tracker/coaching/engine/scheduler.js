/**
 * Daily scheduler — fires the full diagnosis pipeline at a configured hour
 * (server local time) so reps walk into fresh artifact-grounded analysis.
 *
 * Order of operations on each daily run:
 *   1. Refresh the underlying caches (friction + active deals + twins) via
 *      the existing live pipeline.
 *   2. Diagnose-active-deals batch — Claude analysis per active deal.
 *   3. Diagnose-active-contacts batch — all three stages (completed,
 *      booked, stalled in conversation).
 *   4. Mirror the brain to the shared bus.
 *   5. Rebuild the per-rep queue files in the bus.
 *
 * Implementation uses plain timers — no node-cron dependency. Setup is idempotent:
 * server restart re-arms the next fire without losing yesterday's state.
 *
 * Config via .env:
 *   SCHEDULE_DAILY_HOUR=5    — hour of day (0-23, server local)  (default: 5)
 *   SCHEDULE_DAILY_MINUTE=0  — minute of hour                    (default: 0)
 *   SCHEDULE_ENABLED=false   — set to 'true' to enable           (default: false)
 *
 * Defaults to OFF so the cron is opt-in (avoid accidental Anthropic spend
 * during development). Set SCHEDULE_ENABLED=true in .env to turn on.
 */

const dealsBatch = require('./diagnose-active-deals');
const contactsBatch = require('./diagnose-active-contacts');
const brainSync = require('./sync-brain');
const repQueues = require('./rep-queues');

const _state = {
  enabled: false,
  hour: 5,
  minute: 0,
  next_fire_at: null,
  last_fire_at: null,
  last_status: null,
  last_error: null,
  timer: null,
};

function msUntilNext() {
  const now = new Date();
  const next = new Date();
  next.setHours(_state.hour, _state.minute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next - now;
}

async function fire() {
  _state.last_fire_at = new Date().toISOString();
  console.log(`[scheduler] FIRING at ${_state.last_fire_at}`);
  const report = { started_at: _state.last_fire_at, steps: [] };

  // Step 1: refresh underlying live caches (friction, active deals, twins).
  // Don't fail the whole run if this fails — Step 2/3 will use stale active.json.
  try {
    const jobs = require('./jobs');
    const r = await jobs.runAll('live');
    report.steps.push({ step: 'live-pipeline-refresh', ok: true, ran: r.ran });
  } catch (e) {
    report.steps.push({ step: 'live-pipeline-refresh', ok: false, error: e.message });
  }

  // Step 2: deals batch (kicks off in background; returns immediately)
  try {
    const r = await dealsBatch.runBatch({ limit: 20 });
    report.steps.push({ step: 'deals-batch-kicked', ok: r.started, state: r.state });
  } catch (e) {
    report.steps.push({ step: 'deals-batch-kicked', ok: false, error: e.message });
  }

  // Step 3: contacts batch — all three stages (background)
  try {
    const r = await contactsBatch.runBatch({ stages: ['Farm Visit completed', 'In Conversation', 'Farm Visit booked'] });
    report.steps.push({ step: 'contacts-batch-kicked', ok: r.started, state: r.state });
  } catch (e) {
    report.steps.push({ step: 'contacts-batch-kicked', ok: false, error: e.message });
  }

  // Steps 4 + 5 don't have to wait for the batches to finish — they operate
  // on whatever is on disk. The next day's run will pick up today's batch
  // results. (If we wanted same-day, we'd wait, but that means holding the
  // event loop for ~25 min — cleaner to keep them decoupled.)
  try {
    const r = brainSync.sync();
    report.steps.push({ step: 'brain-sync', ok: true, summary: r.summary });
  } catch (e) {
    report.steps.push({ step: 'brain-sync', ok: false, error: e.message });
  }

  try {
    const r = await repQueues.buildQueues();
    const counts = Object.fromEntries(Object.entries(r.reps).map(([k, v]) => [k, v.card_count]));
    report.steps.push({ step: 'build-rep-queues', ok: true, counts });
  } catch (e) {
    report.steps.push({ step: 'build-rep-queues', ok: false, error: e.message });
  }

  // Team pulse — single team-level briefing for Claude Code consumers
  try {
    const teamPulse = require('./team-pulse');
    const r = await teamPulse.build();
    report.steps.push({ step: 'build-team-pulse', ok: true, sources_ok: r.sources_ok });
  } catch (e) {
    report.steps.push({ step: 'build-team-pulse', ok: false, error: e.message });
  }

  // Step 6: refresh persona profiles. Runs every ~48 hours (timestamp-gated)
  // so the cadence holds regardless of which day of the week the daily fire
  // lands on. Manual refresh available via POST /api/brain/refresh-persona/:slug.
  // The engine merges HubSpot live-pull with multi-source supplements staged
  // by Apex into shared-growth-memory/persona-supplements/<slug>/.
  try {
    const { refreshAll, loadRegistry } = require('./persona-builder');
    const reg = loadRegistry();
    const HOURS_48_MS = 48 * 60 * 60 * 1000;
    const lastRefreshMs = reg._last_refreshed ? new Date(reg._last_refreshed).getTime() : 0;
    const ageMs = Date.now() - lastRefreshMs;
    if (ageMs >= HOURS_48_MS) {
      const r = await refreshAll();
      const ok = r.results.filter(x => x.ok).length;
      report.steps.push({ step: 'refresh-personas', ok: true, ran: ok, total: r.results.length, hours_since_last: Math.round(ageMs / (60 * 60 * 1000)) });
    } else {
      report.steps.push({ step: 'refresh-personas', ok: true, skipped: `last refresh ${Math.round(ageMs / (60 * 60 * 1000))}h ago (< 48h gate)` });
    }
  } catch (e) {
    report.steps.push({ step: 'refresh-personas', ok: false, error: e.message });
  }

  _state.last_status = report;
  _state.last_error = null;
  console.log(`[scheduler] DONE — ${report.steps.filter(s => s.ok).length}/${report.steps.length} ok`);
  arm();
}

function arm() {
  if (!_state.enabled) return;
  if (_state.timer) clearTimeout(_state.timer);
  const ms = msUntilNext();
  _state.next_fire_at = new Date(Date.now() + ms).toISOString();
  _state.timer = setTimeout(() => { fire().catch(e => { _state.last_error = e.message; arm(); }); }, ms);
  console.log(`[scheduler] Next fire: ${_state.next_fire_at} (${Math.round(ms / 60000)} min)`);
}

function init() {
  _state.enabled = process.env.SCHEDULE_ENABLED === 'true';
  _state.hour = Number(process.env.SCHEDULE_DAILY_HOUR);
  if (!Number.isFinite(_state.hour) || _state.hour < 0 || _state.hour > 23) _state.hour = 5;
  _state.minute = Number(process.env.SCHEDULE_DAILY_MINUTE);
  if (!Number.isFinite(_state.minute) || _state.minute < 0 || _state.minute > 59) _state.minute = 0;
  if (_state.enabled) {
    arm();
    console.log(`[scheduler] Enabled. Daily fire at ${_state.hour}:${String(_state.minute).padStart(2, '0')} (server local time).`);
  } else {
    console.log(`[scheduler] Disabled. Set SCHEDULE_ENABLED=true in .env to enable.`);
  }
}

function getState() {
  return {
    enabled: _state.enabled,
    hour: _state.hour,
    minute: _state.minute,
    next_fire_at: _state.next_fire_at,
    last_fire_at: _state.last_fire_at,
    last_status: _state.last_status,
    last_error: _state.last_error,
  };
}

async function fireNow() {
  await fire();
  return getState();
}

module.exports = { init, getState, fireNow };
