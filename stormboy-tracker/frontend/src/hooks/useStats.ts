import { useEffect, useState } from 'react';
import { statsClient } from '@/services/statsClient';
import type {
  EfficacyResponse,
  CohortFunnelResponse,
  TrajectoryResponse,
  CallMonitoringResponse,
} from '@/types/stats';

function makeFetchHook<T>(fetcher: () => Promise<T>) {
  return function useFetched() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    useEffect(() => {
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
    return { data, loading, error };
  };
}

export const useEfficacy = makeFetchHook<EfficacyResponse>(() => statsClient.efficacy());
export const useCohortFunnel = makeFetchHook<CohortFunnelResponse>(() => statsClient.cohortFunnel());
export const useTrajectory = makeFetchHook<TrajectoryResponse>(() => statsClient.trajectory());
export const useCallMonitoring = makeFetchHook<CallMonitoringResponse>(() => statsClient.callMonitoring());
