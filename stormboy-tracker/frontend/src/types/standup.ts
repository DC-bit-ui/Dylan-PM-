// Mirrors /api/stats/standup-summary (coaching/engine/standup-summary.js).
// Consumed by the BRAIN page's "Team workshopping" section.

export interface StandupSection {
  section: string;
  priority?: string | number;
  bullets: string[];
}

export interface StandupDiff {
  section: string;
  bullet: string;
}

export type StandupParticipant = string | { name?: string; role?: string };

export interface StandupEntry {
  meeting_date: string;
  weekday?: string;
  title: string;
  participants: StandupParticipant[];
  sections: StandupSection[];
  diff_vs_previous: StandupDiff[];
  file_name?: string;
  rep_folder?: string;
}

export interface StandupSummaryResponse {
  generated_at: string;
  headline?: string;
  total_standups_indexed?: number;
  display_count?: number;
  standups: StandupEntry[];
  caveats?: string[];
  from_cache?: boolean;
}
