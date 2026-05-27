// Mirrors /api/feedback (coaching/engine/feedback.js).

export type FeedbackType = 'error' | 'preference' | 'comment' | 'correction';
export type FeedbackTargetKind =
  | 'deal' | 'contact' | 'persona' | 'pattern' | 'suggestion' | 'system';
export type FeedbackSeverity = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'wontfix';

export interface FeedbackResolution {
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
  action_taken: string | null;
}

export interface FeedbackEntry {
  id: string;
  created_at: string;
  created_by: string;
  type: FeedbackType;
  target_kind: FeedbackTargetKind;
  target_id: string | null;
  severity: FeedbackSeverity;
  title: string;
  body: string;
  system_context: unknown | null;
  status: FeedbackStatus;
  resolution: FeedbackResolution;
  tags: string[];
}

export interface FeedbackStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  wontfix: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  by_target_kind: Record<string, number>;
  recent: FeedbackEntry[];
}

export interface FeedbackListResponse {
  count: number;
  items: FeedbackEntry[];
  stats: FeedbackStats;
}

export interface FeedbackCreateInput {
  type: FeedbackType;
  target_kind: FeedbackTargetKind;
  target_id?: string;
  severity: FeedbackSeverity;
  title: string;
  body?: string;
  system_context?: unknown;
}

export interface FeedbackPatch {
  status?: FeedbackStatus;
  severity?: FeedbackSeverity;
  resolution_note?: string;
  action_taken?: string;
}
