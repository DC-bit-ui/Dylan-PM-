// Mirrors the /api/system/health response. Source-of-truth backend
// file: coaching/engine/system-health.js.

export interface BusStatus {
  canonical_path: string;
  reachable: boolean;
}

export interface ApexHeartbeat {
  ok: boolean;
  reason?: string;
  last_run?: string;
  run_type?: string;
  age_seconds?: number;
  counts?: Record<string, number>;
  total_runs_logged?: number;
}

export interface SupplementsStatus {
  contact: number;
  deal: number;
  persona: number;
  today: number;
  week: number;
  month: number;
  by_source?: Record<string, number>;
  entities?: number;
}

export interface PatternRecent {
  filename: string;
  title?: string;
  confidence: 'low' | 'moderate' | 'high' | 'unknown';
  age_days: number;
  systems?: string[];
}

export interface PatternsStatus {
  total: number;
  archived: number;
  by_confidence: { low: number; moderate: number; high: number; unknown: number };
  by_age?: Record<string, number>;
  cross_confirmed: number;
  recent?: PatternRecent[];
}

export interface ProbesStatus {
  total: number;
  open: number;
  closed: number;
  populated_rate: number | null;
  by_age?: Record<string, number>;
  outcome_mix?: Record<string, number>;
}

export interface HeuristicErrorsStatus {
  total: number;
  wrong: number;
  rate: number;
}

export interface FeedbackRecent {
  id: string;
  type?: string;
  severity?: string;
  target_kind?: string;
  status?: string;
  age_days?: number;
  summary?: string;
}

export interface FeedbackStatus {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  wontfix: number;
  by_type?: Record<string, number>;
  by_severity?: Record<string, number>;
  by_target_kind?: Record<string, number>;
  recent?: FeedbackRecent[];
}

export interface SystemHealth {
  generated_at: string;
  bus: BusStatus;
  apex: ApexHeartbeat;
  supplements: SupplementsStatus;
  patterns: PatternsStatus;
  probes: ProbesStatus;
  heuristic_errors: HeuristicErrorsStatus;
  feedback: FeedbackStatus;
}
