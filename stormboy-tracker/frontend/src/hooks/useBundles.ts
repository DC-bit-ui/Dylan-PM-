import { useEffect, useState } from 'react';
import { intelligenceClient } from '@/services/intelligenceClient';
import type { BundleListResponse } from '@/types/intelligence';

interface UseBundlesResult {
  data: BundleListResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Intelligence bundle queue list. `status` narrows server-side; pass undefined
// for all. refetch() re-pulls after a prune / manual drain / result submit.
export function useBundles(status?: string): UseBundlesResult {
  const [data, setData] = useState<BundleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    intelligenceClient
      .list(status || undefined)
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
