// Mirrors /api/stats/* contracts. Pass 1: efficacy, cohort funnel, trajectory,
// call monitoring. Pass 2: snapshot-pipeline, lead-response, geographic,
// hobbs-calendar. Pass 3 (this file's tail): evidence-cards, friction-map,
// projection, forecast, funnel-velocity, ticket-sla, property-size,
// call-analytics (call quality). Every endpoint returns the engine's run()
// output directly; `from_cache` is present on cached responses.

export interface StatsWindow {
  since_iso: string;
  until_iso: string;
  months?: number;
}

export interface StatsDelta {
  absolute: number;
  pct_change?: number | null;
  trend: 'good' | 'bad' | 'flat';
}

// --- Efficacy hero (Section 1) ---

export interface EfficacyCohort {
  total_closed: number;
  won_count: number;
  lost_count: number;
  win_rate_pct: number | null;
  median_days_to_decision: number | null;
  median_days_to_close_won: number | null;
  median_days_to_close_lost: number | null;
  n_with_decision_days: number;
  hectares_per_won_deal_mean: number | null;
  hectares_won: number;
}

export interface EfficacyPipelineEra {
  direct_per_week: number | null;
  direct_count: number;
  weeks: number;
  excluded_lawrieco: number;
}

export interface EfficacyResponse {
  empty?: boolean;
  reason?: string;
  window: StatsWindow;
  stormboy_launch_date: string;
  cohorts: {
    stormboy: EfficacyCohort;
    control: EfficacyCohort;
    lawrieco?: { total_closed?: number } & Partial<EfficacyCohort>;
  };
  deltas: {
    win_rate_pp?: StatsDelta;
    median_days_to_decision?: StatsDelta;
    hectares_per_won_deal_mean?: StatsDelta;
    pipeline_entry_direct_per_week?: StatsDelta;
  };
  pipeline_entry?: {
    stormboy_era: EfficacyPipelineEra;
    pre_stormboy: EfficacyPipelineEra;
  };
  caveats?: string[];
}

// --- Cohort funnel (Section 2) ---

export interface CohortFunnelSummaryEntry {
  entered_pipeline: number;
  reached_won: number;
  total_funnel_conversion_pct: number | null;
  overall_win_rate_pct: number | null;
}

export interface CohortFunnelStage {
  name: string;
  stormboy?: number;
  control?: number;
  lawrieco?: number;
  stormboy_conversion_pct?: number | null;
  control_conversion_pct?: number | null;
  lawrieco_conversion_pct?: number | null;
}

export interface CohortFunnelResponse {
  empty?: boolean;
  reason?: string;
  window: StatsWindow;
  summary: {
    stormboy: CohortFunnelSummaryEntry;
    control: CohortFunnelSummaryEntry;
    lawrieco?: CohortFunnelSummaryEntry;
  };
  stages: CohortFunnelStage[];
  biggest_delta?: {
    stage_name?: string;
    delta_pp?: number;
  };
}

// --- Trajectory (Section 3) ---

export interface TrajectoryWeek {
  week_start: string;
  rolling_win_rate_pct: number | null;
  rolling_won: number;
  rolling_closed: number;
  hectares: number | null;
  direct_pipeline_entries?: number;
}

export interface TrajectoryResponse {
  weeks: TrajectoryWeek[];
  window: StatsWindow;
  rolling_window_weeks: number;
  stormboy_launch_date: string;
  caveats: string[];
}

// --- Call monitoring (Section 0) ---

export interface CallMonitoringThisWeek {
  storm_boy_connected: number;
  total_connected: number;
  other_campaigns_connected: number;
  target: number;
  pct_of_target: number;
  remaining: number;
}

export interface CallMonitoringVolumeTiles {
  unique_contacts_engaged: number;
  via_date_called: number;
  via_last_contacted_only: number;
  storm_boy_call_volume: number;
  all_outbound_volume: number;
  other_campaigns_volume: number;
}

export interface CallMonitoringEfficacyTiles {
  visits_booked: number;
  calls_per_visit_booked: number | null;
  visits_per_100_calls: number | null;
  tasks_completed: number;
  avg_touches_per_contact: number | null;
  first_engagement: string;
  last_engagement: string;
}

export interface CallMonitoringDay {
  day: string; // ISO date
  cumulative_unique_contacts: number;
  date_called_count: number;
  last_contacted_only_count: number;
}

export interface CallMonitoringResponse {
  this_week: CallMonitoringThisWeek;
  volume_tiles: CallMonitoringVolumeTiles;
  efficacy_tiles: CallMonitoringEfficacyTiles;
  days: CallMonitoringDay[];
  caveats: string[];
}

// --- Lead-response time ---

export interface LeadResponseBucket {
  label: string;
  count: number;
  pct: number;
}

export interface LeadResponseOutcome {
  median_h: number | null;
  p75_h?: number | null;
  p90_h?: number | null;
  n: number;
}

export interface LeadResponseResponse {
  headline: string;
  buckets: LeadResponseBucket[];
  overall: { median_h: number; p75_h: number; p90_h: number; n: number };
  by_outcome: { booked_visit: LeadResponseOutcome; no_visit: LeadResponseOutcome };
  caveats: string[];
}

// --- Snapshot pipeline ---

export type SnapshotState =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'IN_PRODUCTION'
  | 'SENT_VIA_TICKET'
  | 'SENT_AWAITING_REPLY'
  | 'SENT_NO_REPLY_STALE'
  | 'SENT_REPLIED'
  | 'WILLING_TO_PROGRESS'
  | 'TICKET_EXISTS_STAGE_UNKNOWN'
  | 'REQUESTED_NO_EMAIL'
  | 'DISCUSSED_NOT_SENT'
  | 'COLD';

export interface SnapshotExample {
  name: string;
  hubspot_url: string;
}

export interface SnapshotPipelineResponse {
  headline: string;
  total_completed_visits: number;
  total_on_pipeline: number;
  stuck_in_production_pct?: number;
  ready_for_kct_count?: number;
  pipeline_order: SnapshotState[];
  off_pipeline_states: SnapshotState[];
  counts: Record<string, number>;
  examples: Record<string, SnapshotExample[]>;
  caveats: string[];
}

// --- Geographic (NRM) ---

export interface GeographicRegion {
  region_name: string;
  region_kind?: 'state' | 'nrm' | string;
  closed_deals: number;
  won_count?: number;
  lost_count?: number;
  win_rate_pct?: number | null;
  won_hectares: number;
  median_cycle_d?: number | null;
  active_pipeline?: number;
  sample_won_deals?: string[];
}

export interface GeographicResponse {
  headline?: string;
  regions: GeographicRegion[];
  unknown_count?: number;
  caveats?: string[];
}

// --- Hobbs calendar ---

export type HobbsVisitState =
  | 'completed'
  | 'confirmed_via_transcript'
  | 'likely_happened'
  | 'no_show'
  | 'booked'
  | 'canceled'
  | 'rescheduled';

export interface HobbsTranscriptMatch {
  slug: string;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
}

export interface HobbsVisit {
  name: string;
  state: HobbsVisitState;
  state_label: string;
  start_iso?: string;
  start_local_time?: string;
  nrm_region?: string;
  state_au?: string;
  city?: string;
  hubspot_url?: string;
  meeting_url?: string;
  transcript_match?: HobbsTranscriptMatch | null;
}

export interface HobbsCalendarDay {
  date: string;
  day_of_month: number;
  is_today?: boolean;
  is_past?: boolean;
  is_future?: boolean;
  visit_count: number;
  visits: HobbsVisit[];
}

export interface HobbsCalendarWeek {
  week_start: string;
  is_current_week?: boolean;
  days: HobbsCalendarDay[];
}

export interface HobbsCalendarTotals {
  completed?: number;
  confirmed_via_transcript?: number;
  booked?: number;
  likely_happened?: number;
  no_show?: number;
  canceled?: number;
  rescheduled?: number;
  scheduled?: number;
}

export interface HobbsUpcomingWeek {
  week_start: string;
  booked: number;
}

export interface HobbsCalendarResponse {
  headline: string;
  totals: HobbsCalendarTotals;
  weeks: HobbsCalendarWeek[];
  visits_per_upcoming_week?: HobbsUpcomingWeek[];
  window: { since_iso: string; until_iso: string; future_weeks?: number };
  caveats: string[];
}

// =====================================================================
// Pass 3 — the eight sections completing the STATS port
// =====================================================================

// --- Evidence cards ---

export interface EvidenceCard {
  source_file: string;
  written_at: string | null;
  title: string;
  category: string;
  confidence: string;
  headline_evidence: string | null;
  applicability_count: number;
  accent: string;
  tone: 'good' | 'flat' | 'bad';
  body_preview: string;
}

export interface EvidenceCardsResponse {
  generated_at: string;
  cards: EvidenceCard[];
  patterns_dir?: string;
  from_cache?: boolean;
  empty?: boolean;
  reason?: string;
  error?: string;
}

// --- Friction map ---
// NB: /api/stats/friction-map computes live from cohort-funnel; the
// coaching/cache/friction.json file is an UNRELATED bundle artifact.

export interface FrictionLossReason {
  reason: string;
  count: number;
}

export interface FrictionRankedItem {
  stage_id: string;
  stage_name: string;
  stormboy_conversion_pct: number | null;
  control_conversion_pct: number | null;
  lawrieco_conversion_pct: number | null;
  gap_pp_vs_control: number | null;
  direction: 'stormboy_winning' | 'stormboy_lagging' | 'flat' | 'unknown';
  stormboy_volume_in_prev: number;
  control_volume_in_prev: number;
  estimated_impact_n: number;
  loss_reasons_at_stage: {
    stormboy: FrictionLossReason[];
    control: FrictionLossReason[];
    lawrieco: FrictionLossReason[];
  };
  lost_at_prev_stage: string;
  recommended_fix: { hint: string; pattern_file: string } | null;
}

export interface FrictionCohortLossTop {
  reason: string;
  count: number;
  pct_of_losses: number;
}

export interface FrictionFunnelSummaryEntry {
  entered_pipeline: number;
  reached_won: number;
  reached_lost: number;
  overall_win_rate_pct: number | null;
  total_funnel_conversion_pct: number | null;
}

export interface FrictionMapResponse {
  generated_at: string;
  window: { months: number; since_iso: string; until_iso: string };
  items_ranked: FrictionRankedItem[];
  items_all: FrictionRankedItem[];
  top_lagging: FrictionRankedItem | null;
  top_winning: FrictionRankedItem | null;
  loss_reasons_top: {
    stormboy: FrictionCohortLossTop[];
    control: FrictionCohortLossTop[];
    lawrieco: FrictionCohortLossTop[];
  };
  funnel_summary: Record<string, FrictionFunnelSummaryEntry>;
  data_hygiene: {
    losses_with_stage_before_close: number;
    losses_without_stage_before_close: number;
    populated_pct: number | null;
  };
  caveats: string[];
  from_cache?: boolean;
  empty?: boolean;
  reason?: string;
}

// --- 30K hectare projection ---

export interface ProjectionPacePoint {
  weeks_to_hit: number | null;
  eta: string | null;
}

export interface ProjectionResponse {
  generated_at: string;
  target_hectares: number;
  target_set_date: string;
  registered_hectares: number;
  remaining_hectares: number;
  pct_of_target: number;
  weeks_since_anchor: number;
  pace: {
    since_anchor_weekly_ha: number;
    short_window_weeks: number;
    short_window_weekly_ha: number;
    long_window_weeks: number;
    long_window_weekly_ha: number;
    needed_weekly_ha_by_fy_end: number;
    weeks_to_fy_end: number;
  };
  projection: {
    at_short_pace: ProjectionPacePoint;
    at_long_pace: ProjectionPacePoint;
    at_since_anchor_pace: ProjectionPacePoint;
    fy_end_target_date: string;
  };
  caveats: string[];
  from_cache?: boolean;
  empty?: boolean;
}

// --- Forward forecast ---

export type ForecastCohort = 'stormboy' | 'control' | 'lawrieco';

export interface ForecastByStage {
  stage_id: string;
  stage_name: string;
  count: number;
  hectares: number;
  expected_hectares: number;
}

export interface ForecastByCohort {
  cohort: ForecastCohort;
  count: number;
  hectares: number;
  expected_hectares: number;
}

export interface ForecastResponse {
  generated_at: string;
  target_hectares: number;
  target_set_date: string;
  already_registered_hectares: number;
  open_pipeline_hectares: number;
  expected_to_register_hectares: number;
  projected_total_hectares: number;
  gap_to_30k_hectares: number;
  gap_direction: 'short' | 'over';
  pct_covered_by_pipeline: number;
  win_prob_by_stage_cohort: Record<string, Record<string, number>>;
  win_prob_raw_by_stage_cohort: Record<string, Record<string, number | null>>;
  cohort_overall_win_rate: Record<string, number>;
  by_stage: ForecastByStage[];
  by_cohort: ForecastByCohort[];
  at_risk: { count: number; hectares: number; threshold_days: number };
  caveats: string[];
  from_cache?: boolean;
}

// --- Stormboy funnel velocity ---

export interface VelocityStage {
  stage: string;
  stage_index: number;
  currently_at: number;
  median_days_in_stage: number | null;
  p75_days_in_stage: number | null;
  stuck_count: number;
  stuck_pct: number;
  ever_reached: number;
  conversion_to_next_pct?: number | null;
  dropoff_count?: number;
}

export interface FunnelVelocityResponse {
  generated_at: string;
  total_contacts: number;
  unstaged: number;
  not_eligible: number;
  total_ever_entered_funnel: number;
  stages: VelocityStage[];
  biggest_dropoff: {
    from_stage: string;
    to_stage: string;
    from_ever: number;
    to_ever: number;
    dropoff_count: number;
    conversion_pct: number | null;
  } | null;
  caveats: string[];
  from_cache?: boolean;
}

// --- Snapshot ticket SLA ---

export interface SlaPipelineStage {
  id: string;
  label: string;
  open: boolean;
  display_order: number;
}

export interface SlaOldestStuck {
  id: string;
  subject: string;
  age_d: number;
  hubspot_url: string;
}

export interface SlaStage {
  stage_id: string;
  stage_label: string;
  is_open: boolean;
  count: number;
  median_age_d: number | null;
  p75_age_d: number | null;
  p90_age_d: number | null;
  max_age_d: number | null;
  oldest_stuck: SlaOldestStuck[];
}

export interface SlaWeeklyTrend {
  week_start: string;
  completed: number;
  median_cycle_d: number | null;
}

export interface TicketSlaResponse {
  generated_at: string;
  pipeline: { id: string; label: string; stages: SlaPipelineStage[] };
  total_tickets: number;
  open_total: number;
  closed_total: number;
  stages: SlaStage[];
  completion: {
    count: number;
    median_d: number | null;
    p75_d: number | null;
    p90_d: number | null;
    max_d: number | null;
  };
  weekly_completion_trend: SlaWeeklyTrend[];
  headline: string;
  real_worked: { total: number; in_progress: number; completed: number };
  automation_noise: { new_count: number; note: string };
  caveats: string[];
  from_cache?: boolean;
}

// --- Property size × cycle × win-rate ---

export interface PropertySizeBucket {
  key: 'small' | 'medium' | 'large' | 'very_large';
  label: string;
  sub: string;
  bounds: { min: number; max: number | null };
  n: number;
  won: number;
  lost: number;
  win_rate_pct: number | null;
  median_cycle_d: number | null;
  p75_cycle_d: number | null;
  median_size_ha: number | null;
  total_hectares_won: number;
}

export interface PropertySizeResponse {
  generated_at: string;
  window_months: number;
  total_closed_deals: number;
  excluded: string;
  buckets: PropertySizeBucket[];
  sweet_spot: PropertySizeBucket | null;
  worst_bucket: PropertySizeBucket | null;
  headline: string;
  caveats: string[];
  from_cache?: boolean;
}

// --- Call quality (call analytics) ---

export type CallOutcomeCounts = Record<string, number>;

export interface CallRep {
  owner_id: string;
  name: string;
  is_sales_rep: boolean;
  total_calls: number;
  connected: number;
  connect_rate_pct: number | null;
  by_outcome: CallOutcomeCounts;
  median_connected_duration_s: number | null;
  daily: Record<string, number>;
  rolling_30d_calls: number;
  rolling_30d_per_day: number;
}

export interface CallWeek {
  week_start: string;
  total: number;
  connected: number;
  by_outcome: CallOutcomeCounts;
  connect_rate_pct: number | null;
}

export interface HeatmapCell {
  hour: number;
  total: number;
  connected: number;
  connect_rate_pct: number | null;
}

export interface HeatmapRow {
  day_label: string;
  hours: HeatmapCell[];
}

export interface CallBestWindow {
  day_of_week: number;
  day_label: string;
  hour_aest: number;
  total: number;
  connected: number;
  connect_rate_pct: number | null;
}

export interface CallLeaderboardEntry {
  name: string;
  owner_id: string;
  calls: number;
  per_day: number;
  connect_rate_pct: number | null;
  is_sales_rep: boolean;
}

export interface CallAnalyticsResponse {
  generated_at: string;
  window_days: number;
  timezone: string;
  totals: {
    calls: number;
    connected: number;
    connect_rate_pct: number | null;
    by_outcome: CallOutcomeCounts;
  };
  by_rep: CallRep[];
  weekly: CallWeek[];
  heatmap: { grid: HeatmapRow[]; best_windows: CallBestWindow[] };
  duration_connected_s: {
    n: number;
    p25_s: number;
    median_s: number;
    p75_s: number;
    p90_s: number;
    max_s: number;
  } | null;
  leaderboard_30d: CallLeaderboardEntry[];
  caveats: string[];
  from_cache?: boolean;
}
