/**
 * Feedback — read/write user-raised feedback entries to the bus.
 *
 * Stored at <bus>/feedback/feedback-<id>.json per the schema at
 * shared-growth-memory/schemas/feedback.md.
 *
 * Three things the system does with feedback:
 *   1. Surfaces it at point-of-use (deal expand overlay, etc.) so reps see
 *      that someone has flagged this target before they act.
 *   2. Coaching engines check open type=error feedback for a target before
 *      generating a fresh suggestion (suppress-then-annotate flow).
 *   3. Curator/retro pipelines aggregate by target_kind to surface "what's
 *      the system getting wrong most often".
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');

const VALID_TYPES = ['error', 'preference', 'comment', 'correction'];
const VALID_TARGET_KINDS = ['deal', 'contact', 'persona', 'pattern', 'suggestion', 'system'];
const VALID_SEVERITY = ['low', 'medium', 'high'];
const VALID_STATUS = ['open', 'in_progress', 'resolved', 'wontfix'];

function feedbackDir() {
  return path.join(BUS_ROOT, 'feedback');
}

function ensureDir() {
  fs.mkdirSync(feedbackDir(), { recursive: true });
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function writeAtomic(filePath, content) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

function pathFor(id) {
  return path.join(feedbackDir(), `feedback-${id}.json`);
}

function validate(input) {
  const errors = [];
  if (!input.title || typeof input.title !== 'string') errors.push('title required');
  if (input.title && input.title.length > 200) errors.push('title >200 chars');
  if (input.type && !VALID_TYPES.includes(input.type)) errors.push('invalid type');
  if (input.target_kind && !VALID_TARGET_KINDS.includes(input.target_kind)) errors.push('invalid target_kind');
  if (input.severity && !VALID_SEVERITY.includes(input.severity)) errors.push('invalid severity');
  if (input.status && !VALID_STATUS.includes(input.status)) errors.push('invalid status');
  return errors;
}

function create(input, { createdBy = 'manual_dashboard' } = {}) {
  const errors = validate(input);
  if (errors.length) throw new Error('validation: ' + errors.join(', '));
  ensureDir();
  const id = genId();
  const entry = {
    id,
    created_at: new Date().toISOString(),
    created_by: input.created_by || createdBy,
    type: input.type || 'comment',
    target_kind: input.target_kind || 'system',
    target_id: input.target_id || null,
    severity: input.severity || 'medium',
    title: input.title,
    body: input.body || '',
    system_context: input.system_context || null,
    status: 'open',
    resolution: { resolved_at: null, resolved_by: null, resolution_note: null, action_taken: null },
    tags: Array.isArray(input.tags) ? input.tags : [],
  };
  writeAtomic(pathFor(id), JSON.stringify(entry, null, 2));
  return entry;
}

function listAll() {
  ensureDir();
  return fs.readdirSync(feedbackDir())
    .filter(f => f.startsWith('feedback-') && f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(feedbackDir(), f), 'utf8')); }
      catch (_) { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function list({ status, target_kind, target_id, severity, type } = {}) {
  return listAll().filter(e => {
    if (status && e.status !== status) return false;
    if (target_kind && e.target_kind !== target_kind) return false;
    if (target_id != null && String(e.target_id) !== String(target_id)) return false;
    if (severity && e.severity !== severity) return false;
    if (type && e.type !== type) return false;
    return true;
  });
}

function get(id) {
  const p = pathFor(id);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (_) { return null; }
}

function update(id, patch, { updatedBy = 'manual_dashboard' } = {}) {
  const existing = get(id);
  if (!existing) throw new Error('feedback not found: ' + id);
  const merged = { ...existing };
  if (patch.title != null) merged.title = patch.title;
  if (patch.body != null) merged.body = patch.body;
  if (patch.severity && VALID_SEVERITY.includes(patch.severity)) merged.severity = patch.severity;
  if (patch.status && VALID_STATUS.includes(patch.status)) merged.status = patch.status;
  if (patch.tags && Array.isArray(patch.tags)) merged.tags = patch.tags;
  if (patch.type && VALID_TYPES.includes(patch.type)) merged.type = patch.type;
  if (merged.status === 'resolved' && !merged.resolution.resolved_at) {
    merged.resolution = {
      resolved_at: new Date().toISOString(),
      resolved_by: patch.resolved_by || updatedBy,
      resolution_note: patch.resolution_note || null,
      action_taken: patch.action_taken || null,
    };
  }
  if (patch.resolution_note != null) merged.resolution.resolution_note = patch.resolution_note;
  if (patch.action_taken != null) merged.resolution.action_taken = patch.action_taken;
  writeAtomic(pathFor(id), JSON.stringify(merged, null, 2));
  return merged;
}

function stats() {
  const all = listAll();
  const byStatus = {};
  const byType = {};
  const bySeverity = {};
  const byTargetKind = {};
  all.forEach(e => {
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    byType[e.type] = (byType[e.type] || 0) + 1;
    bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
    byTargetKind[e.target_kind] = (byTargetKind[e.target_kind] || 0) + 1;
  });
  return {
    total: all.length,
    open: byStatus.open || 0,
    in_progress: byStatus.in_progress || 0,
    resolved: byStatus.resolved || 0,
    wontfix: byStatus.wontfix || 0,
    by_type: byType,
    by_severity: bySeverity,
    by_target_kind: byTargetKind,
    recent: all.slice(0, 5),
  };
}

module.exports = { create, list, listAll, get, update, stats, VALID_TYPES, VALID_TARGET_KINDS, VALID_SEVERITY };
