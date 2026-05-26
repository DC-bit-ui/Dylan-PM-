import { useEffect, useState } from 'react';
import { headerStatsClient } from '@/services/headerStatsClient';
import type { HeaderStats } from '@/types/headerStats';

// Apollo-shape hook over the REST endpoint. Returns the same
// { data, loading, error } shape that useQuery() returns — so when
// this code ports into the main frontend, the only thing that
// changes is swapping the body for `useQuery(HEADER_STATS_QUERY)`.

interface UseHeaderStatsResult {
  data: HeaderStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHeaderStats(): UseHeaderStatsResult {
  const [data, setData] = useState<HeaderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    headerStatsClient
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
