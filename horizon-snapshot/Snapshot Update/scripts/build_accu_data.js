// Build public/data/accu_issued_companies.json from the raw HubSpot extract.
// Steps: clean project name, geocode address via Nominatim (OSM), output JSON.
//
// Refresh procedure:
//   1. Re-fetch HubSpot data via MCP, save as data/accu_companies_raw.json
//   2. Run: node scripts/build_accu_data.js
//
// Nominatim policy: 1 req/sec max, identifying User-Agent required.
// https://operations.osmfoundation.org/policies/nominatim/

const fs   = require('fs');
const path = require('path');
const https = require('https');

const RAW_FILE = path.join(__dirname, '..', 'data', 'accu_companies_raw.json');
const OUT_FILE = path.join(__dirname, '..', 'public', 'data', 'accu_issued_companies.json');
const USER_AGENT = 'AgriProve-HORIZON-Snapshot/0.1 (dylan@agriprove.io)';

// Pull project name out of the "OWNERS - PROJECT NAME CP[s]" pattern.
// Falls back to the full company name when the pattern doesn't match.
function extractProjectName(rawName) {
  const split = rawName.split(' - ');
  if (split.length < 2) {
    // No " - " separator — use the whole name minus any "CP" suffix
    return rawName.replace(/\s+CPs?$/i, '').trim();
  }
  const tail = split.slice(1).join(' - ').trim(); // handle multiple " - "
  // Strip trailing " CP" or " CPs"
  const stripped = tail.replace(/\s+CPs?$/i, '').trim();
  return stripped || rawName;
}

// For multi-project entries like "Mountain View/Truss/Page/Greenwood",
// keep only the first project for clean narrative copy.
function narrativeName(projectName) {
  const first = projectName.split('/')[0].trim();
  return first || projectName;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Bad JSON: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('timeout')); });
  });
}

// Try a sequence of progressively-broader address strings until one geocodes.
// Most precise first (full street address) → fall back to city+state+postcode.
async function geocode(company) {
  const candidates = [
    company.address,
    `${company.city}, ${company.state} ${company.zip}, Australia`,
    `${company.city}, ${company.state}, Australia`,
    `${company.zip}, Australia`
  ].filter(Boolean).map(s => s.trim().replace(/\s+/g, ' '));

  for (const q of candidates) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=au`;
    try {
      const result = await fetchUrl(url);
      if (Array.isArray(result) && result.length > 0) {
        const lat = parseFloat(result[0].lat);
        const lng = parseFloat(result[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng, matchedAddress: q };
        }
      }
    } catch (e) {
      console.warn(`  geocode error for "${q}": ${e.message}`);
    }
    await sleep(1100); // respect Nominatim's 1 req/sec policy
  }
  return null;
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(RAW_FILE, 'utf-8'));
  console.log(`Loaded ${raw.companies.length} companies from raw extract\n`);

  const out = [];
  for (let i = 0; i < raw.companies.length; i++) {
    const c = raw.companies[i];
    const projectName = extractProjectName(c.name);
    const narrName = narrativeName(projectName);
    process.stdout.write(`[${i+1}/${raw.companies.length}] ${c.name} → "${narrName}" ... `);

    const geo = await geocode(c);
    if (!geo) {
      console.log('FAILED to geocode');
      out.push({
        id: c.id,
        rawName: c.name,
        projectName,
        narrativeName: narrName,
        accusIssued: c.accusIssued,
        address: c.address,
        city: c.city,
        state: c.state,
        zip: c.zip,
        lat: null,
        lng: null,
        geocodeNote: 'geocode failed — manual entry required'
      });
    } else {
      console.log(`${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}  [${geo.matchedAddress}]`);
      out.push({
        id: c.id,
        rawName: c.name,
        projectName,
        narrativeName: narrName,
        accusIssued: c.accusIssued,
        address: c.address,
        city: c.city,
        state: c.state,
        zip: c.zip,
        lat: geo.lat,
        lng: geo.lng,
        matchedAddress: geo.matchedAddress
      });
    }
    await sleep(1100); // pause between companies as well
  }

  const doc = {
    _source: 'HubSpot AP1 portal — companies with landholder_total_issued_accus___company > 0',
    _generated: new Date().toISOString(),
    _count: out.length,
    _geocoded: out.filter(c => c.lat !== null).length,
    companies: out
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(doc, null, 2));
  console.log(`\nWrote ${out.length} companies (${doc._geocoded} geocoded) to ${OUT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
