/**
 * Snapshot state pipeline — for STATS, surfaces the throughput of the
 * snapshot workflow across Farm Visit completed contacts. Counts
 * contacts at each snapshot state in the canonical workflow order:
 *
 *   NOT_REQUESTED → REQUESTED → IN_PRODUCTION → SENT_VIA_TICKET
 *                 → SENT_AWAITING_REPLY → SENT_REPLIED
 *                 → WILLING_TO_PROGRESS
 *   (COLD + TICKET_EXISTS_STAGE_UNKNOWN + DISCUSSED_NOT_SENT counted but flagged off the main line)
 *
 * Different from STATS Section 7 (funnel velocity) — that's the
 * contact-stage funnel (Identified → In Conversation → Farm Visit
 * booked → Farm Visit completed → In Sales Pipeline). THIS section
 * sits inside "Farm Visit completed" and asks: of those completed,
 * where are they in the snapshot workflow? Surfaces drafting
 * bottlenecks, reply-wait stalls, KCT-handoff queue.
 *
 * No new HubSpot calls — uses snapshot-state enrichment which already
 * runs at queue-build time. We aggregate from the most recent
 * /api/stormboy/detail?stage=Farm Visit completed call.
 *
 * 15-min in-memory cache.
 */

const stormboyDetail = require('./stormboy-detail');

const PIPELINE_ORDER = [
  'NOT_REQUESTED',
  'REQUESTED',
  'IN_PRODUCTION',
  'SENT_VIA_TICKET',
  'SENT_AWAITING_REPLY',
  'SENT_NO_REPLY_STALE',
  'SENT_REPLIED',
  'WILLING_TO_PROGRESS',
];
const OFF_PIPELINE_STATES = [
  'TICKET_EXISTS_STAGE_UNKNOWN',
  'REQUESTED_NO_EMAIL',
  'DISCUSSED_NOT_SENT',
  'COLD',
];

const CACHE_TTL_MS = 15 * 60 * 1000;
let _cache = null;

async function run({ force = false } = {}) {
  if (!force && _cache && Date.now() - _cache.generated_at < CACHE_TTL_MS) {
    return { ..._cache.result, from_cache: true };
  }

  const detail = await stormboyDetail.run('Farm Visit completed');
  const contacts = detail.contacts || [];

  const counts = {};
  PIPELINE_ORDER.forEach(s => { counts[s] = 0; });
  OFF_PIPELINE_STATES.forEach(s => { counts[s] = 0; });
  let unclassified = 0;
  const examples = {};

  contacts.forEach(c => {
    const state = c.snapshot_state && c.snapshot_state.state;
    if (!state) { unclassified++; return; }
    if (counts[state] === undefined) counts[state] = 0;
    counts[state]++;
    if (!examples[state]) examples[state] = [];
    if (examples[state].length < 3) {
      examples[state].push({ name: c.name, contact_id: c.id, hubspot_url: c.hubspot_url });
    }
  });

  const total = contacts.length;
  const totalOnPipeline = PIPELINE_ORDER.reduce((s, k) => s + counts[k], 0);
  const totalOffPipeline = OFF_PIPELINE_STATES.reduce((s, k) => s + counts[k], 0);

  // Compute "throughput health" — share of completed visits that have
  // moved past NOT_REQUESTED (i.e., the workflow has at least kicked
  // off for them). High = system is processing visits cleanly.
  // Also compute "stuck-in-production" share — REQUESTED + IN_PRODUCTION
  // as % of total; high = Ben is the bottleneck.
  const movedPastNotRequested = totalOnPipeline - counts.NOT_REQUESTED;
  const throughputPct = totalOnPipeline > 0
    ? Math.round((movedPastNotRequested / totalOnPipeline) * 1000) / 10
    : 0;
  const stuckInProduction = counts.REQUESTED + counts.IN_PRODUCTION;
  const stuckPct = total > 0 ? Math.round((stuckInProduction / total) * 1000) / 10 : 0;
  const readyForKct = counts.WILLING_TO_PROGRESS;

  // Headline narrative — picks the dominant story.
  //
  // Important: HubSpot auto-creates tickets in "New" stage on Farm
  // Visit Completed transitions, so REQUESTED state primarily reflects
  // "auto-ticket exists, no one has picked it up". IN_PRODUCTION
  // (Ben advanced it manually) is the cleaner signal of real demand.
  // Reframe the headline to NOT call REQUESTED a bottleneck.
  let headline;
  if (counts.NOT_REQUESTED > total * 0.4) {
    headline = `${counts.NOT_REQUESTED} of ${total} completed visits have no snapshot signal at all — neither HubSpot ticket nor email.`;
  } else if (counts.IN_PRODUCTION > 0 && counts.IN_PRODUCTION >= total * 0.2) {
    headline = `${counts.IN_PRODUCTION} of ${total} actively in production (Ben drafting). ${counts.REQUESTED} more have auto-created tickets waiting to be picked up.`;
  } else if (readyForKct > 0) {
    headline = `${readyForKct} contact(s) ready to hand to KCT pipeline now.`;
  } else if (counts.REQUESTED > total * 0.5) {
    headline = `${counts.REQUESTED} of ${total} sitting in auto-created "Requested" stage. The HubSpot workflow creates these on every farm visit; treat the count as backlog-of-noise rather than queued demand until a real-backend signal is wired in.`;
  } else if ((counts.SENT_AWAITING_REPLY + counts.SENT_NO_REPLY_STALE) > total * 0.3) {
    headline = `Most contacts are post-send awaiting reply — system is throughputting but customers aren't responding fast.`;
  } else {
    headline = `Snapshot workflow flowing — distribution is roughly balanced.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    total_completed_visits: total,
    total_on_pipeline: totalOnPipeline,
    total_off_pipeline: totalOffPipeline,
    unclassified,
    pipeline_order: PIPELINE_ORDER,
    off_pipeline_states: OFF_PIPELINE_STATES,
    counts,
    examples,
    headline,
    throughput_past_not_requested_pct: throughputPct,
    stuck_in_production_count: stuckInProduction,
    stuck_in_production_pct: stuckPct,
    ready_for_kct_count: readyForKct,
    snapshot_coverage: detail.snapshot_coverage,
    caveats: [
      'Counts only contacts at stage "Farm Visit completed" — earlier stages do not have snapshot-state data yet.',
      'States are derived from HubSpot emails + tickets + custom flags + (optional) Teams Graph; see Section 0b coverage banner for which channels are active.',
      'IMPORTANT: HubSpot has a workflow that auto-creates a ticket in "New HORIZON Snapshot Request" on every Farm Visit Completed transition. The REQUESTED state therefore counts both real demand AND automation artifacts. IN_PRODUCTION is the cleaner signal of actual work because it requires a human to advance the ticket. Looking to wire a real backend production-request log signal in a follow-up.',
      'Off-pipeline states (TICKET_EXISTS_STAGE_UNKNOWN, REQUESTED_NO_EMAIL, DISCUSSED_NOT_SENT, COLD) shown separately because they don\'t fit the linear workflow but still need attention.',
    ],
    from_cache: false,
  };
  _cache = { generated_at: Date.now(), result };
  return result;
}

module.exports = { run };
