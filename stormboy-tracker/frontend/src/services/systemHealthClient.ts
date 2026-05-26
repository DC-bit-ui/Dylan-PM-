import { rest } from './restClient';
import type { SystemHealth } from '@/types/systemHealth';

export const systemHealthClient = {
  fetch: (): Promise<SystemHealth> => rest.get<SystemHealth>('/api/system/health'),
};
