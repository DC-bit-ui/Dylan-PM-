/**
 * Shared HubSpot HTTP helper — drop-in replacement for `fetch()` against
 * api.hubapi.com that transparently retries on 429.
 *
 * HubSpot enforces a per-second account-wide rate limit (~10 req/s across
 * the whole org). When this dashboard's engines run in parallel — persona-
 * builder syncs, live-pipeline scheduler, dashboard endpoints firing on
 * page load — they collectively breach it and HubSpot returns 429 with
 * a transient error that's safe to retry after a brief backoff.
 *
 * Usage:
 *   const { hubspotFetch } = require('./hubspot-client');
 *   const res = await hubspotFetch(url, { method: 'POST', headers, body });
 *   // res is a standard Response object — same as global fetch
 *
 * Replaces this pattern (which can fail under load):
 *   const res = await fetch(url, opts);
 *   if (!res.ok) throw new Error(...);
 *
 * Behaviour:
 *   - On 200..399: returns the Response unchanged
 *   - On 429: respects Retry-After header if present (seconds); otherwise
 *     uses exponential backoff (500ms · 1s · 2s · 4s) with 0-200ms jitter
 *     to avoid thundering-herd. Up to 4 attempts total.
 *   - On other 4xx/5xx: returns the Response unchanged (caller decides
 *     whether to retry — these are usually real errors, not transient)
 *   - On network failures (fetch throws): bubbles up to caller
 *
 * Worst-case latency under sustained 429: ~7.5s (500 + 1000 + 2000 + 4000).
 * In practice contention windows are brief and first retry usually succeeds.
 */

const DEFAULT_MAX_ATTEMPTS = 4;
const BASE_BACKOFF_MS = 500;

async function hubspotFetch(url, options = {}, retryOpts = {}) {
  const maxAttempts = retryOpts.maxAttempts || DEFAULT_MAX_ATTEMPTS;
  const tag = retryOpts.tag || urlTag(url);
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    if (attempt >= maxAttempts - 1) return res;
    const retryAfterRaw = res.headers.get('Retry-After');
    const retryAfterMs = retryAfterRaw && !isNaN(+retryAfterRaw)
      ? (+retryAfterRaw) * 1000
      : (BASE_BACKOFF_MS * Math.pow(2, attempt)) + Math.floor(Math.random() * 200);
    console.warn(`[hubspot] 429 (attempt ${attempt + 1}/${maxAttempts}) on ${tag}; backing off ${retryAfterMs}ms`);
    // Release the response body so the connection can be reused
    try { await res.text(); } catch (_) {}
    await new Promise(r => setTimeout(r, retryAfterMs));
  }
  // Unreachable under normal control flow
  throw new Error('hubspotFetch: exhausted retries (unreachable)');
}

// Short tag from the URL path for log clarity — strips the host + querystring
function urlTag(url) {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, '').slice(0, 80);
  } catch (_) { return String(url).slice(0, 80); }
}

module.exports = { hubspotFetch };
