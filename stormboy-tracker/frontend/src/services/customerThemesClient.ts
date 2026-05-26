import { rest } from './restClient';
import type { CustomerThemesResponse } from '@/types/customerThemes';

export const customerThemesClient = {
  fetch: (force = false): Promise<CustomerThemesResponse> =>
    rest.get<CustomerThemesResponse>(
      '/api/messaging/customer-themes' + (force ? '?force=1' : ''),
    ),
};
