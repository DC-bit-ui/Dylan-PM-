import { rest } from './restClient';
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

export const statsClient = {
  efficacy: (): Promise<EfficacyResponse> =>
    rest.get<EfficacyResponse>('/api/stats/stormboy-efficacy'),
  cohortFunnel: (): Promise<CohortFunnelResponse> =>
    rest.get<CohortFunnelResponse>('/api/stats/cohort-funnel'),
  trajectory: (): Promise<TrajectoryResponse> =>
    rest.get<TrajectoryResponse>('/api/stats/trajectory'),
  callMonitoring: (): Promise<CallMonitoringResponse> =>
    rest.get<CallMonitoringResponse>('/api/stats/call-monitoring'),
  leadResponse: (): Promise<LeadResponseResponse> =>
    rest.get<LeadResponseResponse>('/api/stats/lead-response-time'),
  snapshotPipeline: (): Promise<SnapshotPipelineResponse> =>
    rest.get<SnapshotPipelineResponse>('/api/stats/snapshot-pipeline'),
  geographic: (): Promise<GeographicResponse> =>
    rest.get<GeographicResponse>('/api/stats/geographic'),
  hobbsCalendar: (): Promise<HobbsCalendarResponse> =>
    rest.get<HobbsCalendarResponse>('/api/stats/hobbs-calendar'),
  evidenceCards: (): Promise<EvidenceCardsResponse> =>
    rest.get<EvidenceCardsResponse>('/api/stats/evidence-cards'),
  frictionMap: (): Promise<FrictionMapResponse> =>
    rest.get<FrictionMapResponse>('/api/stats/friction-map'),
  projection: (): Promise<ProjectionResponse> =>
    rest.get<ProjectionResponse>('/api/stats/projection'),
  forecast: (): Promise<ForecastResponse> =>
    rest.get<ForecastResponse>('/api/stats/forecast'),
  funnelVelocity: (): Promise<FunnelVelocityResponse> =>
    rest.get<FunnelVelocityResponse>('/api/stats/funnel-velocity'),
  ticketSla: (): Promise<TicketSlaResponse> =>
    rest.get<TicketSlaResponse>('/api/stats/snapshot-ticket-sla'),
  propertySize: (): Promise<PropertySizeResponse> =>
    rest.get<PropertySizeResponse>('/api/stats/property-size'),
  callAnalytics: (): Promise<CallAnalyticsResponse> =>
    rest.get<CallAnalyticsResponse>('/api/stats/call-analytics'),
};
