/**
 * Supplements — read access to Apex-generated supplement files for deals,
 * contacts, and the apex-runs.log heartbeat.
 *
 * Apex (Cowork) writes daily to shared-growth-memory/{deal,contact}-supplements/<id>/
 * per the 2026-05-15 system-enrichment-pipeline commission. This module
 * surfaces those drops to the dashboard via /api/work/* endpoints.
 *
 * Path resolution mirrors persona-builder.js (BUS_PATH env override).
 */

const fs = require('fs');
const path = require('path');

const FALLBACK_BUS = path.join(__dirname, '..', '..', '..', 'shared-growth-memory');
const BUS_ROOT = process.env.BUS_PATH || FALLBACK_BUS;

const INLINE_THRESHOLD_BYTES = 64 * 1024;
const PREVIEW_CHARS = 400;
const VALID_KINDS = ['deal', 'contact', 'persona'];

function classify(filename) {
  if (filename.startsWith('confluence-aircall-')) return 'aircall-transcript';
  if (filename.startsWith('confluence-farmvisit-')) return 'farm-visit-transcript';
  if (filename.startsWith('outlook-email-')) return 'outlook-email';
  if (filename.startsWith('teams-deals-channel-') || filename.startsWith('teams-channel-')) return 'teams-message';
  if (filename.startsWith('granola-meeting-')) return 'granola-meeting';
  if (filename.startsWith('hubspot-engagement-snapshot-')) return 'hubspot-snapshot';
  return 'other';
}

function readSafe(fullPath, size) {
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    if (size <= INLINE_THRESHOLD_BYTES) return { content: raw, preview: null };
    return { content: null, preview: raw.slice(0, PREVIEW_CHARS) };
  } catch (e) {
    return { content: null, preview: null, error: e.message };
  }
}

function listSupplements(kind, id) {
  if (!VALID_KINDS.includes(kind)) {
    throw new Error(`Unknown supplement kind: ${kind}. Expected one of ${VALID_KINDS.join(', ')}`);
  }
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) throw new Error('Invalid id');
  const dir = path.join(BUS_ROOT, `${kind}-supplements`, safeId);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return { kind, id: safeId, count: 0, files: [], bus_root: BUS_ROOT };
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => {
      const full = path.join(dir, d.name);
      const stat = fs.statSync(full);
      const { content, preview, error } = readSafe(full, stat.size);
      return {
        filename: d.name,
        type: classify(d.name),
        size_bytes: stat.size,
        mtime: stat.mtime.toISOString(),
        content,
        preview,
        ...(error ? { error } : {}),
      };
    })
    .sort((a, b) => b.mtime.localeCompare(a.mtime));
  return { kind, id: safeId, count: entries.length, files: entries };
}

function readApexHeartbeat() {
  const logPath = path.join(BUS_ROOT, 'apex-runs.log');
  if (!fs.existsSync(logPath)) {
    return { ok: false, last_run: null, reason: 'apex-runs.log not found — Apex daily-enrichment has not run yet' };
  }
  let raw;
  try {
    raw = fs.readFileSync(logPath, 'utf-8');
  } catch (e) {
    return { ok: false, last_run: null, reason: `read failed: ${e.message}` };
  }
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    return { ok: false, last_run: null, reason: 'apex-runs.log is empty' };
  }
  const last = lines[lines.length - 1];
  const parts = last.split('·').map(s => s.trim());
  const counts = {};
  if (parts[2]) {
    parts[2].split(/\s+/).forEach(pair => {
      const eq = pair.indexOf('=');
      if (eq > 0) {
        const k = pair.slice(0, eq);
        const v = pair.slice(eq + 1);
        counts[k] = /^-?\d+$/.test(v) ? parseInt(v, 10) : v;
      }
    });
  }
  const lastRun = parts[0] || null;
  let ageSeconds = null;
  if (lastRun) {
    const t = Date.parse(lastRun);
    if (!isNaN(t)) ageSeconds = Math.floor((Date.now() - t) / 1000);
  }
  return {
    ok: true,
    last_run: lastRun,
    run_type: parts[1] || null,
    age_seconds: ageSeconds,
    counts,
    raw: last,
    total_runs_logged: lines.length,
  };
}

module.exports = { listSupplements, readApexHeartbeat, BUS_ROOT, classify };
