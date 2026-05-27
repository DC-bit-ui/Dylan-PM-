import { useEffect, useRef, useState } from 'react';
import { statsClient } from '@/services/statsClient';
import type {
  EfficacyResponse,
  CohortFunnelResponse,
  TrajectoryResponse,
  CallMonitoringResponse,
  LeadResponseResponse,
  SnapshotPipelineResponse,
  GeographicResponse,
  HobbsCalendarResponse,
  EvidenceCardsResponse,
  FrictionMapResponse,
  ProjectionResponse,
  ForecastResponse,
  FunnelVelocityResponse,
  TicketSlaResponse,
  PropertySizeResponse,
  CallAnalyticsResponse,
} from '@/types/stats';

// `enabled` defers the fetch until the section is actually open. Collapsed
// STATS sections no longer fire a request on load — the 16 sections only hit
// the backend when expanded. The fetch runs once (guarded by startedRef) the
// first time `enabled` is true, then never refetches.
function makeFetchHook<T>(fetcher: () => Promise<T>) {
  return function useFetched(enabled = true) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<Error | null>(null);
    const startedRef = useRef(false);
    useEffect(() => {
      if (!enabled || startedRef.current) return;
      startedRef.current = true;
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
    }, [enabled]);
    return { data, loading, error };
  };
}

export const useEfficacy = makeFetchHook<EfficacyResponse>(() => statsClient.efficacy());
export const useCohortFunnel = makeFetchHook<CohortFunnelResponse>(() => statsClient.cohortFunnel());
export const useTrajectory = makeFetchHook<TrajectoryResponse>(() => statsClient.trajectory());
export const useCallMonitoring = makeFetchHook<CallMonitoringResponse>(() => statsClient.callMonitoring());
export const useLeadResponse = makeFetchHook<LeadResponseResponse>(() => statsClient.leadResponse());
export const useSnapshotPipeline = makeFetchHook<SnapshotPipelineResponse>(() => statsClient.snapshotPipeline());
export const useGeographic = makeFetchHook<GeographicResponse>(() => statsClient.geographic());
export const useHobbsCalendar = makeFetchHook<HobbsCalendarResponse>(() => statsClient.hobbsCalendar());
export const useEvidenceCards = makeFetchHook<EvidenceCardsResponse>(() => statsClient.evidenceCards());
export const useFrictionMap = makeFetchHook<FrictionMapResponse>(() => statsClient.frictionMap());
export const useProjection = makeFetchHook<ProjectionResponse>(() => statsClient.projection());
export const useForecast = makeFetchHook<ForecastResponse>(() => statsClient.forecast());
export const useFunnelVelocity = makeFetchHook<FunnelVelocityResponse>(() => statsClient.funnelVelocity());
export const useTicketSla = makeFetchHook<TicketSlaResponse>(() => statsClient.ticketSla());
export const usePropertySize = makeFetchHook<PropertySizeResponse>(() => statsClient.propertySize());
export const useCallAnalytics = makeFetchHook<CallAnalyticsResponse>(() => statsClient.callAnalytics());
