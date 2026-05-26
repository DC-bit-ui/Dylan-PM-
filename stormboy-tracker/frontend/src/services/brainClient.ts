import { rest } from './restClient';
import type {
  BrainPersonasResponse,
  BrainProfile,
  BrainDistillatesResponse,
  BrainObjectionCardsResponse,
} from '@/types/brain';

export const brainClient = {
  personas: (): Promise<BrainPersonasResponse> =>
    rest.get<BrainPersonasResponse>('/api/brain/personas'),
  profile: (slug: string): Promise<BrainProfile> =>
    rest.get<BrainProfile>(`/api/brain/profile/${encodeURIComponent(slug)}`),
  distillates: (): Promise<BrainDistillatesResponse> =>
    rest.get<BrainDistillatesResponse>('/api/brain/distillates'),
  objectionCards: (): Promise<BrainObjectionCardsResponse> =>
    rest.get<BrainObjectionCardsResponse>('/api/brain/objection-cards'),
};
