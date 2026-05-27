// Verifies ask.js degrades to a queued intelligence bundle (no metered call)
// when the direct API is disabled.
const { test } = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

// Isolate the bus to a temp dir BEFORE requiring modules that read BUS_PATH.
process.env.BUS_PATH = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-ask-'));
delete process.env.USE_API_FALLBACK;

const { ask } = require('../coaching/engine/ask');

test('ask() returns a queued bundle when the API is disabled', async () => {
  const r = await ask({ question: 'What works on price objections?' });
  assert.strictEqual(r.status, 'queued');
  assert.ok(r.bundle_id, 'a bundle_id is returned');
  assert.strictEqual(r.answer, '');
  assert.ok(typeof r.note === 'string' && r.note.length > 0, 'a human-readable note is returned');
});

test('the brain-ask bundle is written to the substrate', async () => {
  const r = await ask({ question: 'How do we frame the carbon co-benefit?' });
  const bundlesDir = path.join(process.env.BUS_PATH, 'intelligence-bundles');
  const written = fs.readdirSync(bundlesDir).some((f) => f.includes(r.bundle_id));
  assert.ok(written, 'bundle file exists on the bus');
});
