import { useEffect, useState } from 'react';
import { bundleQueueClient } from '@/services/bundleQueueClient';
import type { BundleQueueHealth } from '@/types/bundleQueue';

interface UseBundleQueueHealthResult {
  data: BundleQueueHealth | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBundleQueueHealth(): UseBundleQueueHealthResult {
  const [data, setData] = useState<BundleQueueHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bundleQueueClient
      .health()
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
  }, [tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}
