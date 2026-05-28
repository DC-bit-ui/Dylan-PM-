import { rest } from './restClient';
import type {
  BrainPersonasResponse,
  BrainProfile,
  BrainDistillatesResponse,
  BrainObjectionCardsResponse,
} from '@/types/brain';
import type { StandupSummaryResponse } from '@/types/standup';

export const brainClient = {
  personas: (): Promise<BrainPersonasResponse> =>
    rest.get<BrainPersonasResponse>('/api/brain/personas'),
  profile: (slug: string): Promise<BrainProfile> =>
    rest.get<BrainProfile>(`/api/brain/profile/${encodeURIComponent(slug)}`),
  distillates: (): Promise<BrainDistillatesResponse> =>
    rest.get<BrainDistillatesResponse>('/api/brain/distillates'),
  objectionCards: (): Promise<BrainObjectionCardsResponse> =>
    rest.get<BrainObjectionCardsResponse>('/api/brain/objection-cards'),
  // Team workshopping — standup transcripts. Lives under /api/stats/* on the
  // backend but is a BRAIN surface concern.
  standupSummary: (): Promise<StandupSummaryResponse> =>
    rest.get<StandupSummaryResponse>('/api/stats/standup-summary'),
};
