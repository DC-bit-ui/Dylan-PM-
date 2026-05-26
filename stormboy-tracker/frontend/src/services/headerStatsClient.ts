import { rest } from './restClient';
import type { HeaderStats } from '@/types/headerStats';

// Service client for header stats. SWAP-OUT POINT — when this code
// merges into frontend/src/, replace the body of `fetch()` with a
// generated GraphQL query. The hook signature in useHeaderStats()
// doesn't change because the return shape is identical.

export const headerStatsClient = {
  fetch: (): Promise<HeaderStats> => rest.get<HeaderStats>('/api/work/header-stats'),
};
