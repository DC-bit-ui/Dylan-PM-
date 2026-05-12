/**
 * Claude API Client
 * Server-side calls to the Anthropic API — no CORS issues.
 *
 * Pricing (Claude Sonnet 4.6 — claude-sonnet-4-6):
 *   $3 per 1M input tokens
 *   $15 per 1M output tokens
 *   $0.30 per 1M cache-read tokens (90% discount)
 *   $3.75 per 1M cache-creation tokens (25% premium)
 *
 * Update MODEL_PRICING when you migrate to a newer model.
 */

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-6';
const MODEL_PRICING = {
  inputPer1M: 3,
  outputPer1M: 15,
  cacheReadPer1M: 0.30,
  cacheCreationPer1M: 3.75
};

let client = null;
function initClient(apiKey) { client = new Anthropic({ apiKey }); }

function costFromUsage(usage) {
  if (!usage) return 0;
  const i = usage.input_tokens || 0;
  const o = usage.output_tokens || 0;
  const cr = usage.cache_read_input_tokens || 0;
  const cc = usage.cache_creation_input_tokens || 0;
  return (
    (i * MODEL_PRICING.inputPer1M +
     o * MODEL_PRICING.outputPer1M +
     cr * MODEL_PRICING.cacheReadPer1M +
     cc * MODEL_PRICING.cacheCreationPer1M) / 1_000_000
  );
}

/**
 * Generate narrative text from a prompt.
 * Returns { text, usage, costUSD }.
 */
async function generateNarrative(prompt, maxTokens = 500) {
  if (!client) throw new Error('Claude API client not initialised. Call initClient(apiKey) first.');
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  });
  const usage = response.usage || {};
  return {
    text: response.content[0].text,
    usage,
    costUSD: costFromUsage(usage)
  };
}

/**
 * Generate multiple narratives in parallel.
 * Returns an object of { [key]: text } plus a meta block { _usage: {...}, _costUSD: number }.
 */
async function generateAllNarratives(prompts) {
  const results = {};
  const usageTotals = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 };
  let totalCost = 0;

  const tasks = Object.entries(prompts).map(async ([key, prompt]) => {
    const r = await generateNarrative(prompt);
    results[key] = r.text;
    usageTotals.input_tokens          += r.usage.input_tokens || 0;
    usageTotals.output_tokens         += r.usage.output_tokens || 0;
    usageTotals.cache_read_input_tokens += r.usage.cache_read_input_tokens || 0;
    usageTotals.cache_creation_input_tokens += r.usage.cache_creation_input_tokens || 0;
    totalCost += r.costUSD;
  });
  await Promise.all(tasks);

  results._usage = usageTotals;
  results._costUSD = totalCost;
  return results;
}

module.exports = { initClient, generateNarrative, generateAllNarratives, costFromUsage, MODEL, MODEL_PRICING };
