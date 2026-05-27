import { useEffect, useState } from 'react';
import { feedbackClient } from '@/services/feedbackClient';
import type { FeedbackListResponse } from '@/types/feedback';

interface UseFeedbackResult {
  data: FeedbackListResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Triage view of the feedback queue. `status` narrows server-side; pass
// undefined for the full list. refetch() re-pulls after a submit or a
// status transition.
export function useFeedback(status?: string): UseFeedbackResult {
  const [data, setData] = useState<FeedbackListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    feedbackClient
      .list(status ? { status } : undefined)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}
