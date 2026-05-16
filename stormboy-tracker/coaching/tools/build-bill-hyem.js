/**
 * One-shot script: build Bill Hyem's deep persona from HubSpot.
 * Loads .env via the same parser server.js uses.
 */

const fs = require('fs');
const path = require('path');

// .env loader (matches server.js)
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
  });
}

const { buildPersona } = require('../engine/persona-builder');

(async () => {
  try {
    const result = await buildPersona({
      slug: 'bill-hyem',
      name: 'Bill Hyem',
      email: 'william@agriprove.io',
      seed: {
        // Bill's own AgriProve contact record (his sent emails are associated here)
        // + the 7 T4T deals tagged with his name
        contacts: ['118163008068'],
        deals: ['18117967175', '18117953717', '18117677957', '18106767386',
                '18025326217', '18021547788', '18021291606'],
      },
    });
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('FAILED:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
