import { rest } from './restClient';
import type { AskCatalog, AskPromptResponse } from '@/types/askPrompts';

// Service client for the ASK prompts catalog + per-id prompt builder.
// SWAP-OUT POINT for GraphQL later; same hook signatures.

export const askPromptsClient = {
  catalog: (): Promise<AskCatalog> => rest.get<AskCatalog>('/api/ask/prompts'),
  prompt: (id: string): Promise<AskPromptResponse> =>
    rest.get<AskPromptResponse>(`/api/ask/prompt/${encodeURIComponent(id)}`),
};
