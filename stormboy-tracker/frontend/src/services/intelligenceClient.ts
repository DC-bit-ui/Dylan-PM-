import { rest } from './restClient';
import type {
  BundleListResponse,
  BundleDetail,
  BundleResult,
  PruneResult,
} from '@/types/intelligence';

export const intelligenceClient = {
  list: (status?: string): Promise<BundleListResponse> =>
    rest.get<BundleListResponse>(
      `/api/intelligence/bundles${status ? `?status=${encodeURIComponent(status)}` : ''}`,
    ),
  detail: (id: string): Promise<BundleDetail> =>
    rest.get<BundleDetail>(`/api/intelligence/bundles/${encodeURIComponent(id)}`),
  result: (id: string): Promise<BundleResult> =>
    rest.get<BundleResult>(`/api/intelligence/results/${encodeURIComponent(id)}`),
  submitResult: (
    id: string,
    body: { result: unknown; completed_by?: string },
  ): Promise<{ ok: boolean; result_file?: string; error?: string }> =>
    rest.post(`/api/intelligence/results/${encodeURIComponent(id)}`, body),
  prune: (maxAgeDays?: number): Promise<PruneResult> =>
    rest.post<PruneResult>('/api/intelligence/prune', maxAgeDays != null ? { maxAgeDays } : {}),
};
