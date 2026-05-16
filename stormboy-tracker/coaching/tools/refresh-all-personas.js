/**
 * One-shot driver: refresh every persona in the registry sequentially,
 * printing per-rep progress + final summary.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
  });
}

const { buildPersona, loadRegistry } = require('../engine/persona-builder');

// Inter-rep cooldown — Haiku has larger TPM headroom than Sonnet at this
// org tier, but a brief gap protects against bursting if a rep's corpus
// trips the per-minute limit. 75s is enough headroom for back-to-back reps
// when each call is ~7K tokens.
const COOLDOWN_MS = 75_000;
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const t0 = Date.now();
  const reg = loadRegistry();
  console.log(`[refresh-all] ${reg.personas.length} personas in registry`);
  const results = [];
  for (let i = 0; i < reg.personas.length; i++) {
    const p = reg.personas[i];
    const sub = Date.now();
    console.log(`\n========== ${p.slug} (${p.name}) ==========`);
    try {
      const r = await buildPersona({
        slug: p.slug, name: p.name, email: p.email, seed: p.seed || undefined,
      });
      const took = ((Date.now() - sub) / 1000).toFixed(1);
      console.log(`[refresh-all] ${p.slug} → ${r.ok ? 'OK' : 'FAIL'} in ${took}s`);
      if (r.ok) {
        console.log(`  discovery: ${JSON.stringify(r.discovery)}`);
      } else {
        console.log(`  error: ${r.error}`);
      }
      results.push({ slug: p.slug, ok: r.ok, took_s: took, discovery: r.discovery || null, error: r.error || null });
    } catch (e) {
      console.error(`[refresh-all] ${p.slug} threw:`, e.message);
      results.push({ slug: p.slug, ok: false, error: e.message });
    }
    if (i < reg.personas.length - 1) {
      const wait = Math.round(COOLDOWN_MS / 1000);
      console.log(`[refresh-all] cooldown ${wait}s before next rep (Anthropic 10K TPM cap)`);
      await sleep(COOLDOWN_MS);
    }
  }
  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n========== DONE in ${total}s ==========`);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})().catch(e => { console.error('top-level fail:', e); process.exit(1); });
