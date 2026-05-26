import { useCallback, useEffect, useState } from 'react';
import { workClient } from '@/services/workClient';
import type {
  ExemplarsResponse,
  RecentWinsResponse,
  OpenProbesResponse,
  CoachingActiveResponse,
} from '@/types/work';

function makeFetchHook<T>(fetcher: () => Promise<T>) {
  return function useFetched() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(() => {
      let cancelled = false;
      setLoading(true);
      fetcher()
        .then((d) => {
          if (!cancelled) {
            setData(d);
            setError(null);
          }
        })
        .catch((e: Error) => {
          if (!cancelled) setError(e);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      const cancel = fetch();
      return cancel;
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
  };
}

export const useExemplars = makeFetchHook<ExemplarsResponse>(() => workClient.exemplars());
export const useRecentWins = makeFetchHook<RecentWinsResponse>(() => workClient.recentWins());
export const useOpenProbes = makeFetchHook<OpenProbesResponse>(() => workClient.openProbes());
export const useCoachingActive = makeFetchHook<CoachingActiveResponse>(() =>
  workClient.coachingActive(),
);
