// Verifies the bundle substrate: create→claim→submit→read round-trip,
// queue-health alerting, and retention prune (keeps queued, drops old done).
const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

process.env.BUS_PATH = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-bundles-'));
const ib = require('../coaching/engine/intelligence-bundles');

test('create → claim → submitResult → readResult round-trip', () => {
  const meta = ib.create({ purpose: 'other', system_prompt: 's', input_data: 'i' });
  assert.strictEqual(meta.status, 'queued');
  const claimed = ib.claim(meta.id, 'tester');
  assert.strictEqual(claimed.status, 'claimed');
  const sub = ib.submitResult(meta.id, { result: { x: 1 }, completed_by: 'tester' });
  assert.strictEqual(sub.ok, true);
  const r = ib.readResult(meta.id);
  assert.deepStrictEqual(r.result, { x: 1 });
});

test('queueHealth alerts when queued count exceeds the threshold', () => {
  for (let i = 0; i < 21; i++) {
    ib.create({ purpose: 'other', system_prompt: 's', input_data: `q${i}` });
  }
  const h = ib.queueHealth({ maxQueued: 20 });
  assert.ok(h.queued >= 21, 'counts the queued bundles');
  assert.strictEqual(h.alert, true);
  assert.match(h.alert_reason, /queued/);
});

test('prune drops old completed bundles but keeps queued ones', () => {
  const done = ib.create({ purpose: 'other', system_prompt: 's', input_data: 'old' });
  // Backdate to a completed state via the exported path helper (the same
  // extension point a processor uses to write results back).
  const metaPath = ib.bundleJsonPath(done.id);
  const m = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  m.status = 'completed';
  m.completed_at = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  fs.writeFileSync(metaPath, JSON.stringify(m, null, 2));
  const fresh = ib.create({ purpose: 'other', system_prompt: 's', input_data: 'fresh' });

  const res = ib.prune({ maxAgeDays: 14 });
  assert.ok(res.pruned >= 1, 'pruned at least the old completed bundle');
  assert.strictEqual(ib.readMeta(done.id), null, 'old completed bundle removed');
  assert.ok(ib.readMeta(fresh.id), 'fresh queued bundle preserved');
});
