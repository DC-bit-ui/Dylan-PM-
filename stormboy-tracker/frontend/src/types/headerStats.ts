// Mirrors the /api/work/header-stats response shape. When the
// backend swaps to GraphQL, these types become the generated types
// from the GraphQL schema — same shape, same nullability.
//
// Source-of-truth backend file: coaching/engine/work-header-stats.js

export interface FarmVisitsHeaderStats {
  lifetime_booked: number;
  booked_this_week: number;
  completed_this_week: number;
  week_start: string;
}

export interface MostRecentWin {
  deal_name: string;
  closedate: string;
  days_ago: number;
  channel: {
    stormboy: boolean;
    partner: boolean;
    direct: boolean;
  };
}

export interface StormboyWinsHeaderStats {
  count_since_target: number;
  most_recent: MostRecentWin | null;
}

export interface HeaderStats {
  generated_at: string;
  target_set_date: string;
  project_ha_since_target: number;
  project_ha_target: number;
  project_ha_pct: number;
  farm_visits: FarmVisitsHeaderStats;
  stormboy_wins: StormboyWinsHeaderStats;
  most_recent_win: MostRecentWin | null;
  wins_since_target: number;
  wins_lifetime: number;
}
