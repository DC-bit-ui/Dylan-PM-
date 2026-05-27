import { rest } from './restClient';
import type {
  FeedbackListResponse,
  FeedbackEntry,
  FeedbackCreateInput,
  FeedbackPatch,
} from '@/types/feedback';

export const feedbackClient = {
  list: (params?: { status?: string }): Promise<FeedbackListResponse> => {
    const q = params?.status ? `?status=${encodeURIComponent(params.status)}` : '';
    return rest.get<FeedbackListResponse>(`/api/feedback${q}`);
  },
  create: (body: FeedbackCreateInput): Promise<FeedbackEntry> =>
    rest.post<FeedbackEntry>('/api/feedback', body),
  update: (id: string, patch: FeedbackPatch): Promise<FeedbackEntry> =>
    rest.patch<FeedbackEntry>(`/api/feedback/${encodeURIComponent(id)}`, patch),
};
