import { rest } from './restClient';
import type {
  EfficacyResponse,
  CohortFunnelResponse,
  TrajectoryResponse,
  CallMonitoringResponse,
} from '@/types/stats';

export const statsClient = {
  efficacy: (): Promise<EfficacyResponse> =>
    rest.get<EfficacyResponse>('/api/stats/stormboy-efficacy'),
  cohortFunnel: (): Promise<CohortFunnelResponse> =>
    rest.get<CohortFunnelResponse>('/api/stats/cohort-funnel'),
  trajectory: (): Promise<TrajectoryResponse> =>
    rest.get<TrajectoryResponse>('/api/stats/trajectory'),
  callMonitoring: (): Promise<CallMonitoringResponse> =>
    rest.get<CallMonitoringResponse>('/api/stats/call-monitoring'),
};
