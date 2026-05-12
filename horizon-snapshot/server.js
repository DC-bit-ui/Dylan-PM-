/**
 * HORIZON Snapshot Generator — Server
 *
 * Express server that:
 * 1. Serves the snapshot tool UI
 * 2. Handles model output zip uploads
 * 3. Proxies Claude API calls (server-side, no CORS)
 * 4. Generates PDF via Puppeteer
 *
 * Run: npm start (or npm run dev for auto-reload)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');

const { parseMetadata, parseLandscapeGeoJSON, computeCentroid, parsePaddocks } = require('./src/engine/parser');
const { calculateAll } = require('./src/engine/calculator');
const { buildPage2Prompt, buildPage4Prompt, buildEmailPrompt, buildCombinedPrompt, parseCombinedOutput } = require('./src/engine/prompts');
const { initClient, generateNarrative, generateAllNarratives } = require('./src/api/claude');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Editorial-memory helper ──────────────────────────────────
// Composes a context block with three layers:
//   1. STANDING NARRATIVE GUIDE — persistent rules from Settings (user-level)
//   2. EDITORIAL CONTEXT — guidance accumulated within THIS snapshot's regens
//      + current state of sibling narratives (snapshot-level)
// Both layers travel through the same return string so prompt builders only
// need to inject one variable. Returns '' when nothing applies.
function buildEditorialContext(editHistory, siblingNarratives, currentSection, narrativeGuide) {
  const blocks = [];

  // Layer 1 — standing narrative guide (always wins, applies to every snapshot)
  if (narrativeGuide && narrativeGuide.trim()) {
    blocks.push(
      'STANDING NARRATIVE GUIDE (persistent user-level copy preferences — apply to every section, every time):\n' +
      narrativeGuide.trim()
    );
  }

  // Layer 2 — per-snapshot editorial memory
  const memLines = [];
  if (Array.isArray(editHistory) && editHistory.length > 0) {
    memLines.push('Editorial guidance previously applied to this snapshot (carry across — do NOT contradict even when regenerating a different section):');
    for (const h of editHistory) {
      const when = h.ts ? new Date(h.ts).toISOString().slice(0, 16).replace('T', ' ') : '';
      const tag = h.section || 'general';
      memLines.push(`- [${when} · ${tag}] ${h.guidance}`);
    }
  }
  if (siblingNarratives && typeof siblingNarratives === 'object') {
    const siblings = [];
    const keys = ['page2', 'page4', 'email', 'growth'];
    for (const k of keys) {
      if (k === currentSection) continue;          // don't leak the section we're regenerating
      const v = (siblingNarratives[k] || '').trim();
      if (!v) continue;
      siblings.push(`${k.toUpperCase()}:\n${v}`);
    }
    if (siblings.length) {
      if (memLines.length) memLines.push('');
      memLines.push('Current approved copy for sibling sections of this snapshot (match voice + facts; do not contradict):');
      siblings.forEach(s => memLines.push(s));
    }
  }
  if (memLines.length) blocks.push('EDITORIAL CONTEXT\n' + memLines.join('\n'));

  if (!blocks.length) return '';
  return '\n\n' + blocks.join('\n\n') + '\n';
}

// ── Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// File upload config
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Ensure directories exist
['uploads', 'output'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ── API: Upload and parse model output ──────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);

    let result;
    if (req.file.originalname.endsWith('.zip')) {
      result = await processZip(buffer);
    } else if (req.file.originalname === 'metadata.txt') {
      const text = buffer.toString('utf-8');
      result = { parsed: parseMetadata(text) };
    } else {
      return res.status(400).json({ error: 'Upload a .zip or metadata.txt file' });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Run calculations
    result.calcs = calculateAll(result.parsed);

    res.json(result);
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ error: e.message });
  }
});

async function processZip(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const result = { parsed: null, images: {}, geojson: {}, centroid: null, zoneStats: null, paddocks: null };

  // Helper: find a file by name anywhere in the ZIP (handles nested folders)
  function findFile(name) {
    // Try root first
    const direct = zip.file(name);
    if (direct) return direct;
    // Search all paths for a matching filename
    const matches = zip.file(new RegExp('(^|/)' + name.replace(/\./g, '\\.') + '$', 'i'));
    return matches.length > 0 ? matches[0] : null;
  }

  // Parse metadata.txt
  const metaFile = findFile('metadata.txt');
  if (metaFile) {
    const text = await metaFile.async('string');
    result.parsed = parseMetadata(text);
  }

  if (!result.parsed) {
    const contents = Object.keys(zip.files).filter(n => !zip.files[n].dir);
    const allPngs = contents.every(n => /^\d+\.png$/i.test(n.split('/').pop()));
    if (allPngs && contents.length >= 10) {
      throw new Error(
        'This ZIP contains Canva template page images (1.png, 2.png, ...), not HORIZON model output. ' +
        'Upload the model output ZIP from the HORIZON run — it contains metadata.txt, map.png, and GeoJSON files. ' +
        'Test data available in test-data/ folder (dawlish.zip, castle_hill.zip).'
      );
    }
    const preview = contents.length ? contents.slice(0, 15).join(', ') : '(zip contained no files)';
    const more = contents.length > 15 ? ` ... (+${contents.length - 15} more)` : '';
    throw new Error(
      'No metadata.txt found in ZIP. Expected a HORIZON model output ZIP containing: metadata.txt, map.png, map_depth.png, map_ph.png, horizon_landscape.geojson, input.geojson, classified.geojson. ' +
      'This ZIP contains: ' + preview + more
    );
  }

  // Extract map images as base64
  for (const name of ['map.png', 'map_depth.png', 'map_ph.png']) {
    const imgFile = findFile(name);
    if (imgFile) {
      const b64 = await imgFile.async('base64');
      result.images[name.replace('.png', '')] = 'data:image/png;base64,' + b64;
    }
  }

  // Parse GeoJSON files
  const landscapeFile = findFile('horizon_landscape.geojson');
  if (landscapeFile) {
    const json = JSON.parse(await landscapeFile.async('string'));
    result.zoneStats = parseLandscapeGeoJSON(json);
    result.geojson.landscape = json;
  }

  const inputFile = findFile('input.geojson');
  if (inputFile) {
    const json = JSON.parse(await inputFile.async('string'));
    result.centroid = computeCentroid(json);
    result.paddocks = parsePaddocks(json);
    result.geojson.input = json;
  }

  const classifiedFile = findFile('classified.geojson');
  if (classifiedFile) {
    result.geojson.classified = JSON.parse(await classifiedFile.async('string'));
  }

  return result;
}

// ── API: Set API key ────────────────────────────────────────
app.post('/api/config', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return res.status(400).json({ error: 'Invalid API key format' });
  }
  try {
    initClient(apiKey);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: Generate narratives ────────────────────────────────
app.post('/api/generate', async (req, res) => {
  try {
    const { parsed, calcs, zoneStats, style, guidance, page, geoContext, editHistory, siblingNarratives, narrativeGuide } = req.body;
    // Compose the editorial-context block once — folds in the persistent
    // Narrative Guide (Settings) + per-snapshot guidance log + sibling
    // narrative state. Fed into every prompt builder.
    const editorialContext = buildEditorialContext(editHistory, siblingNarratives, page, narrativeGuide);

    if (page) {
      // Growth Summary has no standalone prompt — re-run combined and extract.
      // Slightly more tokens than a single-page regen, but still one round-trip.
      if (page === 'growth') {
        const combinedPrompt = buildCombinedPrompt(parsed, calcs, zoneStats, style, guidance, geoContext, editorialContext);
        const r = await generateNarrative(combinedPrompt, 2000);
        const sections = parseCombinedOutput(r.text);
        const growth = sections?.growth || '';
        logSnapshotCost(parsed, 'growth-regen', r.usage, r.costUSD);
        return res.json({ growth, _usage: r.usage, _costUSD: r.costUSD });
      }
      // Generate single page narrative — return text + usage so the UI can show cost
      const prompt = page === 'page2'
        ? buildPage2Prompt(parsed, calcs, zoneStats, style, guidance, editorialContext)
        : page === 'page4'
          ? buildPage4Prompt(parsed, calcs, zoneStats, style, guidance, geoContext, editorialContext)
          : buildEmailPrompt(parsed, calcs, style, editorialContext);
      const r = await generateNarrative(prompt);
      logSnapshotCost(parsed, page, r.usage, r.costUSD);
      return res.json({ [page]: r.text, _usage: r.usage, _costUSD: r.costUSD });
    }

    // Generate all three narratives in a SINGLE API call (combined prompt) to
    // save ~50% input tokens. If parsing fails (delimiters off / sections short),
    // fall back to three separate calls — no quality regression.
    const combinedPrompt = buildCombinedPrompt(parsed, calcs, zoneStats, style, guidance, geoContext, editorialContext);
    const combined = await generateNarrative(combinedPrompt, 2000);
    const parsedSections = parseCombinedOutput(combined.text);
    if (parsedSections) {
      const out = {
        page2: parsedSections.page2,
        page4: parsedSections.page4,
        email: parsedSections.email,
        growth: parsedSections.growth || '',
        _usage: combined.usage,
        _costUSD: combined.costUSD
      };
      logSnapshotCost(parsed, 'full-snapshot-combined', combined.usage, combined.costUSD);
      return res.json(out);
    }

    // Fallback: legacy parallel generation
    console.warn('Combined prompt parse failed; falling back to per-page generation');
    const prompts = {
      page2: buildPage2Prompt(parsed, calcs, zoneStats, style, guidance),
      page4: buildPage4Prompt(parsed, calcs, zoneStats, style, guidance, geoContext),
      email: buildEmailPrompt(parsed, calcs, style)
    };
    const results = await generateAllNarratives(prompts);
    logSnapshotCost(parsed, 'full-snapshot-fallback', results._usage, results._costUSD);
    res.json(results);
  } catch (e) {
    console.error('Generation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── Append a per-snapshot cost line to an audit log on disk ─────────
function logSnapshotCost(parsed, scope, usage, costUSD) {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      property: parsed?.name || null,
      scope,
      input_tokens: usage?.input_tokens || 0,
      output_tokens: usage?.output_tokens || 0,
      cache_read: usage?.cache_read_input_tokens || 0,
      cache_creation: usage?.cache_creation_input_tokens || 0,
      cost_usd: Number((costUSD || 0).toFixed(6))
    }) + '\n';
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'token-usage.jsonl'), line);
  } catch (e) { console.warn('Cost log error:', e.message); }
}

// ── API: Get prompt text (for manual copy-paste) ────────────
app.post('/api/prompt', (req, res) => {
  const { parsed, calcs, zoneStats, style, guidance, page } = req.body;

  const prompt = page === 'page2'
    ? buildPage2Prompt(parsed, calcs, zoneStats, style, guidance)
    : page === 'page4'
      ? buildPage4Prompt(parsed, calcs, zoneStats, style, guidance)
      : buildEmailPrompt(parsed, calcs, style);

  res.json({ prompt });
});

// ── API: Export PDF via Puppeteer ────────────────────────────
app.post('/api/export-pdf', async (req, res) => {
  try {
    const puppeteer = require('puppeteer');
    const { html, filename } = req.body;

    // Inject <base href> so relative paths like /templates/template_page_*.png
    // resolve against this same server when Puppeteer renders.
    const baseHref = `http://localhost:${PORT}/`;
    const htmlWithBase = html.includes('<base ')
      ? html
      : html.replace(/<head>/i, `<head><base href="${baseHref}">`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setContent(htmlWithBase, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    const outName = filename || 'HORIZON_Snapshot.pdf';
    const outPath = path.join(__dirname, 'output', outName);
    // Puppeteer v23+ returns Uint8Array; coerce to Buffer for fs + Express compatibility.
    const pdfBuf = Buffer.from(pdf);
    fs.writeFileSync(outPath, pdfBuf);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + outName + '"',
      'Content-Length': pdfBuf.length
    });
    res.send(pdfBuf);
  } catch (e) {
    console.error('PDF export error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── API: ACCU-issued projects status + resync ──────────────
// Status read — cheap, used to populate the Settings panel indicator.
app.get('/api/accu-data-status', (req, res) => {
  try {
    const outFile = path.join(__dirname, 'public', 'data', 'accu_issued_companies.json');
    if (!fs.existsSync(outFile)) return res.json({ exists: false });
    const doc = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
    res.json({
      exists: true,
      count: doc._count,
      geocoded: doc._geocoded,
      generated: doc._generated
    });
  } catch (e) {
    res.json({ exists: false, error: e.message });
  }
});

// Resync — re-runs the geocoder against data/accu_companies_raw.json. Takes
// ~50s for 24 companies (Nominatim rate limit). When fresh HubSpot data is
// needed, the raw extract must be re-fetched first (currently a manual step
// via the Claude Code MCP integration; future Option-A version with a
// HubSpot API key will fold that fetch into this same endpoint).
app.post('/api/refresh-accu-data', (req, res) => {
  const { spawn } = require('child_process');
  const proc = spawn('node', ['scripts/build_accu_data.js'], { cwd: __dirname });
  let stdout = '', stderr = '';
  proc.stdout.on('data', d => stdout += d.toString());
  proc.stderr.on('data', d => stderr += d.toString());
  proc.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({
        error: 'Geocoder script failed',
        exitCode: code,
        stderr: stderr.slice(-2000)
      });
    }
    try {
      const outFile = path.join(__dirname, 'public', 'data', 'accu_issued_companies.json');
      const doc = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
      res.json({
        ok: true,
        count: doc._count,
        geocoded: doc._geocoded,
        generated: doc._generated
      });
    } catch (e) {
      res.status(500).json({ error: 'Output JSON unreadable: ' + e.message });
    }
  });
  proc.on('error', e => {
    res.status(500).json({ error: 'Failed to spawn geocoder: ' + e.message });
  });
});

// ── API: Rolling usage statistics ──────────────────────────
// Aggregates logs/token-usage.jsonl into all-time + last-30-day buckets.
// Cheap to compute at our volume (one append per snapshot) — no caching needed.
app.get('/api/usage-stats', (req, res) => {
  try {
    const logFile = path.join(__dirname, 'logs', 'token-usage.jsonl');
    if (!fs.existsSync(logFile)) {
      return res.json({ allTime: zeroBucket(), last30: zeroBucket() });
    }
    const text = fs.readFileSync(logFile, 'utf-8');
    const lines = text.split('\n').filter(Boolean);
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const all = zeroBucket();
    const recent = zeroBucket();
    for (const line of lines) {
      let entry;
      try { entry = JSON.parse(line); } catch { continue; }
      // Count only full-snapshot generations (not single-page regens) so
      // "average cost per snapshot" reflects end-to-end snapshot cost.
      if (!entry.scope || !entry.scope.startsWith('full-snapshot')) {
        // Still tally tokens/cost into all-time totals, just don't bump count
        addToBucket(all, entry, false);
        if (new Date(entry.ts).getTime() >= cutoff) addToBucket(recent, entry, false);
        continue;
      }
      addToBucket(all, entry, true);
      if (new Date(entry.ts).getTime() >= cutoff) addToBucket(recent, entry, true);
    }
    res.json({ allTime: finaliseBucket(all), last30: finaliseBucket(recent) });
  } catch (e) {
    console.error('usage-stats error:', e);
    res.status(500).json({ error: e.message });
  }
});
function zeroBucket() { return { snapshots: 0, regens: 0, inputTokens: 0, outputTokens: 0, totalCostUSD: 0 }; }
function addToBucket(b, entry, isSnapshot) {
  if (isSnapshot) b.snapshots++; else b.regens++;
  b.inputTokens  += entry.input_tokens || 0;
  b.outputTokens += entry.output_tokens || 0;
  b.totalCostUSD += entry.cost_usd || 0;
}
function finaliseBucket(b) {
  return {
    ...b,
    avgCostPerSnapshotUSD: b.snapshots > 0 ? b.totalCostUSD / b.snapshots : 0
  };
}

// ── API: Feedback / issue report ────────────────────────────
// Saves an issue report (note + screenshot + state snapshot) under feedback/.
// Reviewable by the team and / or fed back to Claude Code for triage.
app.post('/api/feedback', express.json({ limit: '50mb' }), (req, res) => {
  try {
    const fbDir = path.join(__dirname, 'feedback');
    if (!fs.existsSync(fbDir)) fs.mkdirSync(fbDir, { recursive: true });
    const id = new Date().toISOString().replace(/[:.]/g, '-') + '_' + Math.random().toString(36).slice(2, 8);
    const dir = path.join(fbDir, id);
    fs.mkdirSync(dir, { recursive: true });

    const { screenshot, ...meta } = req.body || {};
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(meta, null, 2));

    if (screenshot && typeof screenshot === 'string' && screenshot.startsWith('data:image/png;base64,')) {
      const b64 = screenshot.slice('data:image/png;base64,'.length);
      fs.writeFileSync(path.join(dir, 'screenshot.png'), Buffer.from(b64, 'base64'));
    }
    console.log('Feedback saved:', id, '— ' + (meta.note || '(no note)').slice(0, 80));
    res.json({ ok: true, id });
  } catch (e) {
    console.error('Feedback error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── API: Recalculate with overrides ─────────────────────────
app.post('/api/calculate', (req, res) => {
  try {
    const { parsed, landUseOverride } = req.body;
    const calcs = calculateAll(parsed, landUseOverride || undefined);
    res.json(calcs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n  HORIZON Snapshot Generator');
  console.log('  Running at http://localhost:' + PORT);
  console.log('  Upload a model output .zip to get started\n');
});
