/**
 * Re-run only the personas that failed in the last refresh-all run.
 * Reads the registry for current entry data (so the Hobbs email fix is picked up).
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

const COOLDOWN_MS = 75_000;
const FAILED_SLUGS = ['ben', 'claudia', 'hobbs', 'will'];
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const t0 = Date.now();
  const reg = loadRegistry();
  const personas = reg.personas.filter(p => FAILED_SLUGS.includes(p.slug));
  console.log(`[refresh-failed] re-running ${personas.length} previously-failed personas`);
  const results = [];
  for (let i = 0; i < personas.length; i++) {
    const p = personas[i];
    const sub = Date.now();
    console.log(`\n========== ${p.slug} (${p.name}) ==========`);
    try {
      const r = await buildPersona({
        slug: p.slug, name: p.name, email: p.email, seed: p.seed || undefined,
      });
      const took = ((Date.now() - sub) / 1000).toFixed(1);
      console.log(`[refresh-failed] ${p.slug} → ${r.ok ? 'OK' : 'FAIL'} in ${took}s`);
      if (!r.ok) console.log(`  error: ${r.error}`);
      else console.log(`  discovery: ${JSON.stringify(r.discovery)}`);
      results.push({ slug: p.slug, ok: r.ok, took_s: took, discovery: r.discovery || null, error: r.error || null });
    } catch (e) {
      console.error(`[refresh-failed] ${p.slug} threw:`, e.message);
      results.push({ slug: p.slug, ok: false, error: e.message });
    }
    if (i < personas.length - 1) {
      console.log(`[refresh-failed] cooldown ${Math.round(COOLDOWN_MS / 1000)}s`);
      await sleep(COOLDOWN_MS);
    }
  }
  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n========== DONE in ${total}s ==========`);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})().catch(e => { console.error('top-level fail:', e); process.exit(1); });
