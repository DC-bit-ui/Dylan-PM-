/**
 * Team pulse — writes a single team-level JSON file to the bus so any
 * Growth team member's Claude Code can answer cross-cutting questions
 * like:
 *   - "How is the team doing this week?"
 *   - "Are we on pace for the 30k target?"
 *   - "Where is Stormboy converting better than direct?"
 *   - "What's the biggest dropoff in our outreach motion?"
 *
 * Pulls cached outputs from the read-side engines (no extra HubSpot
 * calls — uses what's already been computed). Written atomically.
 *
 * Output: shared-growth-memory/team-pulse.json
 *
 * Card-shape contract is documented in shared-growth-memory/schemas/
 * (will add team-pulse.md as part of this commit).
 */

const fs = require('fs');
const path = require('path');

const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const OUT_PATH = path.join(BUS_ROOT, 'team-pulse.json');

function atomicWrite(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

// Safe runner that returns null on any failure (one source breaking
// shouldn't take the whole pulse down).
async function tryRun(label, fn) {
  try { return await fn(); }
  catch (e) {
    console.warn(`[team-pulse] ${label} failed: ${e.message}`);
    return null;
  }
}

async function build() {
  const [callMon, callQual, efficacy, funnel, velocity, projection, forecast, friction, trajectory] = await Promise.all([
    tryRun('call-monitoring',     () => require('./call-monitoring').run({})),
    tryRun('call-analytics',      () => require('./call-analytics').run({})),
    tryRun('stormboy-efficacy',   () => require('./stormboy-efficacy').run({})),
    tryRun('cohort-funnel',       () => require('./cohort-funnel').run({})),
    tryRun('funnel-velocity',     () => require('./stormboy-funnel-velocity').run({})),
    tryRun('projection',          () => require('./stormboy-projection').run({})),
    tryRun('forecast',            () => require('./stormboy-forecast').run({})),
    tryRun('friction-map',        () => require('./friction-map').run({})),
    tryRun('trajectory',          () => require('./stormboy-trajectory').run({})),
  ]);

  // Trim each source to the headline shape — full details remain in
  // the dashboard endpoints. The bus version is "the team-level
  // briefing", not the raw analytical output.
  const pulse = {
    generated_at: new Date().toISOString(),
    version: 'team-pulse-1.0',
    description: 'Single-file team-level snapshot for Claude Code consumers. Read-only; refresh by rerunning team-pulse build (or via /api/bus/rebuild on the dashboard).',
    this_week: callMon && callMon.this_week ? {
      ...callMon.this_week,
      generated_at: callMon.generated_at,
    } : null,
    call_volume_tiles: callMon ? callMon.volume_tiles : null,
    call_efficacy_tiles: callMon ? callMon.efficacy_tiles : null,
    call_quality: callQual ? {
      window_days: callQual.window_days,
      totals: callQual.totals,
      duration_connected_s: callQual.duration_connected_s,
      best_connect_windows: (callQual.heatmap && callQual.heatmap.best_windows) || [],
      leaderboard_30d: callQual.leaderboard_30d,
    } : null,
    efficacy_hero: efficacy ? {
      win_rate_delta_pp: efficacy.win_rate_delta_pp,
      days_to_decision_delta_pct: efficacy.days_to_decision_delta_pct,
      hectares_per_won_deal_delta_pct: efficacy.hectares_per_won_deal_delta_pct,
      direct_pipeline_entries_per_week_delta_pct: efficacy.direct_pipeline_entries_per_week_delta_pct,
      window: efficacy.window,
    } : null,
    cohort_funnel_summary: funnel ? funnel.summary : null,
    cohort_funnel_biggest_delta: funnel ? funnel.biggest_delta : null,
    outreach_funnel_biggest_dropoff: velocity ? velocity.biggest_dropoff : null,
    outreach_funnel_stages: velocity ? velocity.stages : null,
    hectares_30k: projection ? {
      registered: projection.registered_hectares,
      remaining: projection.remaining_hectares,
      pct_of_target: projection.pct_of_target,
      pace_short_window_weekly_ha: projection.pace && projection.pace.short_window_weekly_ha,
      pace_long_window_weekly_ha: projection.pace && projection.pace.long_window_weekly_ha,
      pace_needed_weekly_ha_by_fy_end: projection.pace && projection.pace.needed_weekly_ha_by_fy_end,
      eta_short_pace: projection.projection && projection.projection.at_short_pace,
      eta_long_pace: projection.projection && projection.projection.at_long_pace,
    } : null,
    forward_forecast: forecast ? {
      already_registered: forecast.already_registered_hectares,
      expected_to_register: forecast.expected_to_register_hectares,
      projected_total: forecast.projected_total_hectares,
      gap_to_30k: forecast.gap_to_30k_hectares,
      pct_covered_by_pipeline: forecast.pct_covered_by_pipeline,
      at_risk: forecast.at_risk,
    } : null,
    friction_top_lagging: friction ? friction.top_lagging : null,
    friction_top_winning: friction ? friction.top_winning : null,
    loss_reasons_top_by_cohort: friction ? friction.loss_reasons_top : null,
    trajectory_recent: trajectory ? {
      stormboy_launch_date: trajectory.stormboy_launch_date,
      latest_week: (trajectory.weeks || []).slice(-1)[0] || null,
      rolling_window_weeks: trajectory.rolling_window_weeks,
    } : null,
    sources: {
      call_monitoring_generated_at: callMon ? callMon.generated_at : null,
      call_quality_generated_at: callQual ? callQual.generated_at : null,
      efficacy_generated_at: efficacy ? efficacy.generated_at : null,
      funnel_generated_at: funnel ? funnel.generated_at : null,
      velocity_generated_at: velocity ? velocity.generated_at : null,
      projection_generated_at: projection ? projection.generated_at : null,
      forecast_generated_at: forecast ? forecast.generated_at : null,
      friction_generated_at: friction ? friction.generated_at : null,
      trajectory_generated_at: trajectory ? trajectory.generated_at : null,
    },
    consumer_notes: [
      'This file is the team-level briefing for Growth-team Claude Code sessions.',
      'For per-rep work queues, see queues/<rep_slug>/work-cards.json — that\'s the per-card actionable view.',
      'For per-entity context (a specific deal or contact), see deal-signals/, deal-supplements/, contact-supplements/.',
      'For tactical playbooks, see patterns/.',
      'Some fields may be null if the underlying engine cache is cold or unavailable; check the sources block.',
    ],
  };

  atomicWrite(OUT_PATH, JSON.stringify(pulse, null, 2));
  return { path: OUT_PATH, generated_at: pulse.generated_at, sources_ok:
    Object.values(pulse.sources).filter(v => v != null).length };
}

module.exports = { build };
