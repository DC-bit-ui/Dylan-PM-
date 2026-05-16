/**
 * One-shot: build Kieren's persona from his HubSpot email footprint.
 * Loads .env, runs buildPersona for the kieren slug in the registry.
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
const { refreshOne } = require('../engine/persona-builder');
(async () => {
  try {
    const r = await refreshOne('kieren');
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify({ ok: r.ok, discovery: r.discovery, error: r.error }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('FAILED:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
