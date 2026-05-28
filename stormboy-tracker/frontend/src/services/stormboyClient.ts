import { rest } from './restClient';
import type { StormboySummaryResponse } from '@/types/stormboy';

export const stormboyClient = {
  summary: (): Promise<StormboySummaryResponse> =>
    rest.get<StormboySummaryResponse>('/api/stormboy/summary'),
};
