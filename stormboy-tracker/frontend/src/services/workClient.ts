import { rest } from './restClient';
import type {
  ExemplarsResponse,
  RecentWinsResponse,
  OpenProbesResponse,
  CoachingActiveResponse,
  ExemplarAction,
} from '@/types/work';
import type { ContactDiagnosesResponse } from '@/types/stormboy';

export const workClient = {
  exemplars: (): Promise<ExemplarsResponse> => rest.get<ExemplarsResponse>('/api/work/exemplars'),
  recentWins: (): Promise<RecentWinsResponse> =>
    rest.get<RecentWinsResponse>('/api/work/recent-wins'),
  openProbes: (): Promise<OpenProbesResponse> =>
    rest.get<OpenProbesResponse>('/api/work/open-probes'),
  coachingActive: (): Promise<CoachingActiveResponse> =>
    rest.get<CoachingActiveResponse>('/api/coaching/active'),
  // Bundle-backed contact diagnoses (synthesis cards on the Storm Boy funnel).
  contactDiagnoses: (): Promise<ContactDiagnosesResponse> =>
    rest.get<ContactDiagnosesResponse>('/api/work/contact-diagnoses'),

  // Record an exemplar action against the bus (e.g. 'Marked engaged').
  recordAction: (params: {
    exemplar_id: string;
    label: string;
    payload: ExemplarAction['payload'];
  }) =>
    rest.post<{ ok: boolean }>('/api/work/exemplar-action', params as unknown as Record<string, unknown>),
};
