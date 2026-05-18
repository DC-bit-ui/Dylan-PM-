/**
 * Intelligence bundles — subscription-LLM compute substrate.
 *
 * Replaces direct Anthropic API calls. Dashboard writes a bundle (prompt +
 * inputs as markdown + metadata JSON) to <bus>/intelligence-bundles/.
 * Cowork-scheduled task or interactive Claude Code session reads the
 * bundle, runs analysis under Dylan's subscription, writes result to
 * <bus>/intelligence-results/. Dashboard polls/reads results.
 *
 * See shared-growth-memory/schemas/intelligence-bundle.md for the contract.
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');

const VALID_PURPOSES = [
  'persona-refresh', 'deal-diagnosis', 'customer-themes-cluster',
  'brain-ask', 'objection-cards', 'win-pattern-extraction',
  'ai-analyze', 'other',
];
const VALID_STATUSES = ['queued', 'claimed', 'completed', 'failed'];
const VALID_OUTPUT_SCHEMAS = ['json', 'markdown', 'text'];
const CLAIM_TIMEOUT_MS = 30 * 60 * 1000;

function bundlesDir() { return path.join(BUS_ROOT, 'intelligence-bundles'); }
function resultsDir() { return path.join(BUS_ROOT, 'intelligence-results'); }

function ensureDirs() {
  fs.mkdirSync(bundlesDir(), { recursive: true });
  fs.mkdirSync(resultsDir(), { recursive: true });
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function writeAtomic(filePath, content) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

function bundleJsonPath(id) { return path.join(bundlesDir(), `${id}.json`); }
function bundleMdPath(id)   { return path.join(bundlesDir(), `${id}.md`);   }
function resultPath(id)     { return path.join(resultsDir(),  `${id}.json`); }

function renderMarkdown(meta, systemPrompt, inputData, outputSpec) {
  return `# Intelligence bundle ${meta.id}

**Purpose:** ${meta.purpose}
**Target file:** \`${meta.target_file || '(none)'}\`
**Target kind:** ${meta.target_kind || '(unspecified)'}
**Output schema:** ${meta.output_schema}
**Model hint:** ${meta.model_hint || 'haiku'} — guidance only; Claude Code/Cowork run under whichever subscription model is active.
**Created:** ${meta.created_at}

---

## System prompt

${systemPrompt}

---

## Input data

${inputData}

---

## Expected output

${outputSpec}

---

## Where to write the result

When done, write the result JSON to:

\`shared-growth-memory/intelligence-results/${meta.id}.json\`

with shape:

\`\`\`json
{
  "id": "${meta.id}",
  "completed_at": "<ISO timestamp>",
  "completed_by": "claude_code:<session> | cowork:apex | manual_paste",
  "result": <the output${meta.output_schema === 'json' ? ' as a JSON object' : ' as a string'}>
}
\`\`\`

Then update this bundle's metadata JSON (\`shared-growth-memory/intelligence-bundles/${meta.id}.json\`):

\`\`\`json
{
  ...existing fields,
  "status": "completed",
  "completed_at": "<same ISO timestamp>",
  "result_file": "shared-growth-memory/intelligence-results/${meta.id}.json"
}
\`\`\`

Both files use atomic write (\`.tmp\` then rename).
`;
}

function create({ purpose, system_prompt, input_data, output_spec, target_file, target_kind, output_schema = 'json', model_hint = 'haiku', input_summary, created_by = 'dashboard:/api/intelligence-bundles' } = {}) {
  if (!purpose || !VALID_PURPOSES.includes(purpose)) {
    throw new Error(`purpose required, one of: ${VALID_PURPOSES.join(', ')}`);
  }
  if (!system_prompt) throw new Error('system_prompt required');
  if (!input_data) throw new Error('input_data required');
  if (!VALID_OUTPUT_SCHEMAS.includes(output_schema)) throw new Error('invalid output_schema');

  ensureDirs();
  const id = genId();
  const createdAt = new Date().toISOString();
  const meta = {
    id,
    created_at: createdAt,
    created_by,
    purpose,
    target_file: target_file || null,
    target_kind: target_kind || null,
    input_summary: (input_summary || '').slice(0, 200),
    output_schema,
    model_hint,
    status: 'queued',
    claimed_at: null,
    claimed_by: null,
    completed_at: null,
    error: null,
    result_file: null,
  };
  const markdown = renderMarkdown(meta, system_prompt, input_data, output_spec || `Match the output_schema = \`${output_schema}\`.`);
  writeAtomic(bundleMdPath(id), markdown);
  writeAtomic(bundleJsonPath(id), JSON.stringify(meta, null, 2));
  return meta;
}

function readMeta(id) {
  const p = bundleJsonPath(id);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

function readMarkdown(id) {
  const p = bundleMdPath(id);
  if (!fs.existsSync(p)) return null;
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; }
}

function updateMeta(id, patch) {
  const existing = readMeta(id);
  if (!existing) throw new Error('bundle not found: ' + id);
  const merged = { ...existing, ...patch };
  writeAtomic(bundleJsonPath(id), JSON.stringify(merged, null, 2));
  return merged;
}

function listBundles({ status } = {}) {
  ensureDirs();
  return fs.readdirSync(bundlesDir())
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(bundlesDir(), f), 'utf8')); }
      catch (_) { return null; }
    })
    .filter(Boolean)
    .filter(b => !status || b.status === status)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function isClaimStale(bundle) {
  if (bundle.status !== 'claimed') return false;
  if (!bundle.claimed_at) return true;
  return Date.now() - Date.parse(bundle.claimed_at) > CLAIM_TIMEOUT_MS;
}

function claim(id, processor) {
  const meta = readMeta(id);
  if (!meta) throw new Error('not found');
  if (meta.status === 'completed') throw new Error('already completed');
  if (meta.status === 'claimed' && !isClaimStale(meta)) {
    throw new Error('already claimed by ' + meta.claimed_by);
  }
  return updateMeta(id, { status: 'claimed', claimed_at: new Date().toISOString(), claimed_by: processor });
}

function submitResult(id, { result, completed_by, error }) {
  const meta = readMeta(id);
  if (!meta) throw new Error('not found');
  const completedAt = new Date().toISOString();
  if (error) {
    updateMeta(id, { status: 'failed', error, completed_at: completedAt, completed_by });
    return { ok: false, error };
  }
  const payload = { id, completed_at: completedAt, completed_by: completed_by || 'unspecified', result };
  ensureDirs();
  writeAtomic(resultPath(id), JSON.stringify(payload, null, 2));
  updateMeta(id, { status: 'completed', completed_at: completedAt, completed_by, result_file: `shared-growth-memory/intelligence-results/${id}.json` });
  return { ok: true, result_file: `shared-growth-memory/intelligence-results/${id}.json` };
}

function readResult(id) {
  const p = resultPath(id);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

function stats() {
  const all = listBundles();
  const byStatus = {};
  const byPurpose = {};
  all.forEach(b => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    byPurpose[b.purpose] = (byPurpose[b.purpose] || 0) + 1;
  });
  const queued = all.filter(b => b.status === 'queued');
  const oldestQueuedAge = queued.length
    ? Math.floor((Date.now() - Date.parse(queued[queued.length - 1].created_at)) / 1000)
    : null;
  return {
    total: all.length,
    by_status: byStatus,
    by_purpose: byPurpose,
    oldest_queued_age_seconds: oldestQueuedAge,
    recent: all.slice(0, 5),
  };
}

module.exports = {
  create, readMeta, readMarkdown, listBundles, claim, submitResult, readResult, stats,
  VALID_PURPOSES, bundleMdPath, bundleJsonPath, resultPath,
};
