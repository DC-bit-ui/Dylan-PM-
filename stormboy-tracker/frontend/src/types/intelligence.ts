// Mirrors /api/intelligence/* (coaching/engine/intelligence-bundles.js).
// Queue-health shape lives in ./bundleQueue (BundleQueueHealth).

export type BundleStatus = 'queued' | 'claimed' | 'completed' | 'failed';

export interface BundleMeta {
  id: string;
  created_at: string;
  created_by: string;
  purpose: string;
  target_file: string | null;
  target_kind: string | null;
  input_summary: string;
  output_schema: string;
  model_hint: string;
  status: BundleStatus;
  claimed_at: string | null;
  claimed_by: string | null;
  completed_at: string | null;
  error: string | null;
  result_file: string | null;
}

export interface BundleStats {
  total: number;
  by_status: Record<string, number>;
  by_purpose: Record<string, number>;
  oldest_queued_age_seconds: number | null;
  recent: BundleMeta[];
}

export interface BundleListResponse {
  count: number;
  items: BundleMeta[];
  stats: BundleStats;
}

export interface BundleDetail {
  meta: BundleMeta;
  markdown: string | null;
}

export interface BundleResult {
  id: string;
  completed_at: string;
  completed_by: string;
  result: unknown;
}

export interface PruneResult {
  pruned: number;
  kept: number;
  scanned: number;
  max_age_days: number;
}
