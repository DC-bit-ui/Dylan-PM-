/**
 * Minimal Anthropic API client for the coaching pipeline.
 * Reads ANTHROPIC_API_KEY from process.env (loaded by server.js .env parser).
 *
 * Single responsibility: send a prompt + system message, parse strict JSON
 * back. Models specified per-call. Retries on transient failures.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

const MODELS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-7'
};

// ---------------------------------------------------------------------------
// Metered-API kill switch (revised direction, Cadel standup 2026-05-18).
// The shared ANTHROPIC_API_KEY is removed from scope: analytic synthesis now
// routes through the intelligence-bundle substrate (flat-fee subscription
// compute via Cowork / Claude Code). This direct client is DISABLED by default
// and only re-enabled for emergency local debugging via USE_API_FALLBACK=1.
// See briefings/api-to-subscription-migration-plan.md.
// ---------------------------------------------------------------------------
class ApiDisabledError extends Error {
  constructor(message) {
    super(message || 'Direct Anthropic API is disabled (USE_API_FALLBACK!=1). Route analytic work via intelligence bundles.');
    this.name = 'ApiDisabledError';
    this.code = 'API_DISABLED';
  }
}

// True only when the operator has explicitly opted into the metered API AND a
// key is present. Default (flag unset) is false — the dependency is removed.
function isApiEnabled() {
  return process.env.USE_API_FALLBACK === '1' && !!process.env.ANTHROPIC_API_KEY;
}

// Throw a typed, catchable error when the metered API is gated off. Callers
// catch `err.code === 'API_DISABLED'` and degrade (serve cache / queue a bundle).
function assertApiEnabled() {
  if (process.env.USE_API_FALLBACK !== '1') {
    throw new ApiDisabledError();
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ApiDisabledError('USE_API_FALLBACK=1 but ANTHROPIC_API_KEY is not set.');
  }
}

/**
 * Call Claude with a prompt; expect strict JSON back.
 * @param {object} opts
 * @param {string} opts.model — 'haiku' | 'sonnet' | 'opus'
 * @param {string|Array} opts.system — system prompt. String OR array of content blocks
 *                                     (use array form to set cache_control: { type: 'ephemeral' }
 *                                      on large reusable context blocks for prompt caching).
 * @param {string} [opts.user] — single user message (if messages not provided)
 * @param {Array}  [opts.messages] — full conversation: [{role:'user'|'assistant', content:'...'}]
 *                                   takes precedence over `user` when present.
 * @param {number} [opts.maxTokens=4096]
 * @returns {Promise<object>} parsed JSON
 */
async function callJson({ model, system, user, messages, maxTokens = 4096 }) {
  assertApiEnabled();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelId = MODELS[model] || model;

  const body = {
    model: modelId,
    max_tokens: maxTokens,
    system,
    messages: messages || [{ role: 'user', content: user }]
  };

  const resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${txt.slice(0, 500)}`);
  }

  const data = await resp.json();
  const text = data.content && data.content[0] ? data.content[0].text : '';

  // Strip Markdown code-block fences if the model wraps JSON in ```json
  let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

  // Try strict parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Fall through to extraction
  }

  // Extract the first balanced JSON object from the text. Handles models that
  // append prose after the JSON block (common with stricter instruction sets).
  const start = cleaned.indexOf('{');
  if (start === -1) {
    throw new Error(`Failed to parse JSON response: no '{' found.\nResponse: ${cleaned.slice(0, 500)}`);
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = false; continue; }
    } else {
      if (ch === '"') { inString = true; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const block = cleaned.slice(start, i + 1);
          try {
            return JSON.parse(block);
          } catch (e) {
            throw new Error(`Failed to parse JSON response: ${e.message}\nExtracted: ${block.slice(0, 500)}`);
          }
        }
      }
    }
  }
  throw new Error(`Failed to parse JSON response: unbalanced braces.\nResponse: ${cleaned.slice(0, 500)}`);
}

/**
 * Plain-text completion (for narrative outputs like coaching messages).
 */
async function callText({ model, system, user, maxTokens = 1024 }) {
  assertApiEnabled();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelId = MODELS[model] || model;

  const resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Anthropic ${resp.status}: ${txt.slice(0, 500)}`);
  }

  const data = await resp.json();
  return data.content && data.content[0] ? data.content[0].text : '';
}

module.exports = { callJson, callText, MODELS, ApiDisabledError, isApiEnabled, assertApiEnabled };
