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

/**
 * Call Claude with a prompt; expect strict JSON back.
 * @param {object} opts
 * @param {string} opts.model — 'haiku' | 'sonnet' | 'opus'
 * @param {string} opts.system — system prompt (the contract / role)
 * @param {string} opts.user — user message (the data + task)
 * @param {number} [opts.maxTokens=4096]
 * @returns {Promise<object>} parsed JSON
 */
async function callJson({ model, system, user, maxTokens = 4096 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  const modelId = MODELS[model] || model;

  const body = {
    model: modelId,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }]
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
  const cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${e.message}\nResponse: ${cleaned.slice(0, 500)}`);
  }
}

/**
 * Plain-text completion (for narrative outputs like coaching messages).
 */
async function callText({ model, system, user, maxTokens = 1024 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
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

module.exports = { callJson, callText, MODELS };
