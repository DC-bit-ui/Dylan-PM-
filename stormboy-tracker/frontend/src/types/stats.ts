// Mirrors /api/stats/* contracts. Pass 1 covers efficacy, cohort funnel,
// trajectory, and call monitoring. Pass 2 will add evidence, friction-map,
// projection, snapshot-pipeline, lead-response, property-size, geographic,
// hobbs-calendar, and the call analytics heatmap.

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
