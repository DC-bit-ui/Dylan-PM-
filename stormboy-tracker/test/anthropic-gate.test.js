// Verifies the metered-API kill switch: by default the direct Anthropic
// client is disabled and throws a typed, catchable ApiDisabledError.
const { test } = require('node:test');
const assert = require('node:assert');

delete process.env.USE_API_FALLBACK;
delete process.env.ANTHROPIC_API_KEY;

const anthropic = require('../coaching/engine/anthropic');

test('isApiEnabled() is false by default (USE_API_FALLBACK unset)', () => {
  assert.strictEqual(anthropic.isApiEnabled(), false);
});

test('callJson rejects with API_DISABLED by default', async () => {
  await assert.rejects(
    () => anthropic.callJson({ model: 'haiku', user: 'hi' }),
    (err) => err.code === 'API_DISABLED' && err.name === 'ApiDisabledError',
  );
});

test('callText rejects with API_DISABLED by default', async () => {
  await assert.rejects(
    () => anthropic.callText({ model: 'haiku', user: 'hi' }),
    (err) => err.code === 'API_DISABLED',
  );
});

test('flag on but no key => still disabled, still typed', async () => {
  process.env.USE_API_FALLBACK = '1';
  delete process.env.ANTHROPIC_API_KEY;
  assert.strictEqual(anthropic.isApiEnabled(), false);
  await assert.rejects(
    () => anthropic.callJson({ model: 'haiku', user: 'hi' }),
    (err) => err.code === 'API_DISABLED',
  );
  delete process.env.USE_API_FALLBACK;
});
