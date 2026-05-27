import { rest } from './restClient';
import type { BundleQueueHealth } from '@/types/bundleQueue';

export const bundleQueueClient = {
  health: (): Promise<BundleQueueHealth> =>
    rest.get<BundleQueueHealth>('/api/intelligence/health'),
};
