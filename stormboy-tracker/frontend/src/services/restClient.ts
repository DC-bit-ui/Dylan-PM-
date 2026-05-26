// Thin REST client — the SWAP-OUT POINT for GraphQL later.
//
// Per CPO vibe-coding guide:
//   "Never call fetch directly from components. Always go through a
//    hook in src/hooks/, and have that hook call a thin client
//    function in src/services/."
//
// All Stormboy backend endpoints are resource-shaped REST today. When
// this code merges into frontend/src/, the per-endpoint client
// functions get replaced by GraphQL ops (generated). The hook
// signatures stay identical because they return { data, loading,
// error } — matching what useQuery() returns.

const BASE_URL = ''; // empty = same-origin (Vite proxies /api → 3401)

export class RestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'RestError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new RestError(res.status, `${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ''}`);
  }
  return (await res.json()) as T;
}

export const rest = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
