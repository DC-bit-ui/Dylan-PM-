// Mirrors /api/messaging/customer-themes. Source-of-truth:
// coaching/engine/customer-themes.js.

export interface CustomerPosition {
  text: string;
  rep?: string;
  surface?: string;
  landed?: 'landed' | 'friction' | 'unknown' | string;
}

export interface ThemeQuote {
  text: string;
  rep?: string;
  surface?: string;
}

export interface CustomerTheme {
  theme: string;
  marketing_angle?: string | null;
  headline_candidate?: string | null;
  supporting_quote?: string | null;
  member_labels: string[];
  member_label_count: number;
  occurrences: number;
  landed_count: number;
  friction_count: number;
  land_rate: number;
  customer_positions: CustomerPosition[];
  quotes: ThemeQuote[];
  reps: string[];
  surfaces: string[];
}

export interface ThemeSourceLoaded {
  file: string;
  label: string;
  surface?: string;
  rep?: string;
  distillates: number;
}

export interface CustomerThemesSummary {
  total_topic_distillates: number;
  total_themes: number;
  total_landed: number;
  total_friction: number;
  overall_land_rate: number;
  sources_loaded: ThemeSourceLoaded[];
}

export interface ClusteringStatus {
  status: 'queued' | 'completed';
  bundle_id: string | null;
  clustered_at: string | null;
}

export interface CustomerThemesResponse {
  generated_at: string;
  clustering?: ClusteringStatus;
  summary: CustomerThemesSummary;
  themes: CustomerTheme[];
  top_landed_themes: CustomerTheme[];
  top_friction_themes: CustomerTheme[];
}
