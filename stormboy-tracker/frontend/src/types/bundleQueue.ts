// Mirrors GET /api/intelligence/health (coaching/engine/intelligence-bundles.js
// queueHealth()). Monitors the subscription-compute bundle queue so a stalled
// processor is visible before it causes stale dashboards.

export interface BundleQueueHealth {
  queued: number;
  claimed: number;
  completed: number;
  failed: number;
  total: number;
  oldest_queued_age_seconds: number | null;
  oldest_queued_age_human: string;
  alert: boolean;
  alert_reason: string | null;
  thresholds: { max_queued: number; max_oldest_seconds: number };
}
