import { useEffect, useState } from 'react';
import { systemHealthClient } from '@/services/systemHealthClient';
import type { SystemHealth } from '@/types/systemHealth';

interface UseSystemHealthResult {
  data: SystemHealth | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSystemHealth(): UseSystemHealthResult {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    systemHealthClient
      .fetch()
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
