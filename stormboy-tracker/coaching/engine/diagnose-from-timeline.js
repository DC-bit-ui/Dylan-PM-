/**
 * Diagnose-from-timeline — LLM-driven generation of the 3-step diagnosis
 * for an exemplar (or any contact/deal) using the verbatim engagement
 * timeline + other available evidence.
 *
 * Replaces hand-crafted diagnoses with artifact-grounded ones. The prompt
 * forces every step to quote a specific date or verbatim from the timeline
 * — no abstraction without grounding.
 *
 * Usage:
 *   const result = await diagnose({
 *     title, subtitle, kind, lookup_type, lookup_id,
 *     assigned_to_name, next_step_short, other_evidence
 *   });
 *   // result.diagnosis = [{step, header, body}, ...]
 *   // result.next_step_short / .next_step_qualifier (rewritten by LLM if needed)
 */

const fs = require('fs');
const path = require('path');
const { create: createBundle, readResult: readBundleResult } = require('./intelligence-bundles');
const timeline = require('./engagement-timeline');

// Migrated from direct Anthropic API to bundle-based subscription compute
// per Cadel directive 2026-05-18. One bundle per (lookup_type, lookup_id);
// pending state tracked in coaching/cache/diagnose-pending.json so the
// batch orchestrator can detect completions on subsequent runs.

const PENDING_PATH = path.join(__dirname, '..', 'cache', 'diagnose-pending.json');

function loadPending() {
  try {
    if (!fs.existsSync(PENDING_PATH)) return {};
    return JSON.parse(fs.readFileSync(PENDING_PATH, 'utf8')) || {};
  } catch (_) { return {}; }
}
function savePending(obj) {
  const tmp = PENDING_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, PENDING_PATH);
}
function pendingKey(type, id) { return `${type}-${id}`; }
function safeParseJson(s) {
  if (typeof s !== 'string') return s;
  try { return JSON.parse(s); } catch (_) {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
}

const SYSTEM_PROMPT = `You are a sales coach for AgriProve, a soil-carbon project company. Your job is to write a 3-step diagnosis of a sales situation (stuck deal, completed farm visit, or stalled call) that helps a rep decide WHAT to do next.

The diagnosis must follow this structure:
- Step 1: WHAT specifically happened. Quote a date and verbatim language from the timeline. No abstraction here.
- Step 2: WHY this matters. The pattern, the stakes, what's at risk. Reference base rates or comparable data if available.
- Step 3: WHAT specifically would change the outcome. The lever, not the action. The action is captured separately.

CRITICAL RULES:
- Every step must quote a specific date or verbatim from the timeline. No abstraction without grounding.
- Do not use signal-only language ("orphan", "stalled", "warm", "cooling") UNLESS immediately backed by the actual artifact.
- 1-3 sentences per body. Be tight. No filler.
- Quote the actual people, dates, and content from the timeline. Use double-quotes around verbatim.
- If the timeline contradicts a heuristic assumption (e.g. a "stalled warm lead" was actually marked out-of-scope), say so plainly.
- The header should be a sharp one-line summary. The body fleshes it out.

Also assess whether the planned next_step is correct given the artifact-level truth, and rewrite it if needed.

LENGTH CONSTRAINTS (strict):
- next_step_short: 4-10 words. A short imperative phrase. Examples: "Contact Harry at LawrieCo", "Send HORIZON snapshot today", "Close the lead honestly". NOT a sentence with multiple clauses.
- next_step_qualifier: 1-2 sentences (≤30 words). The pre-flight check or rationale.
- diagnosis step header: ≤15 words. Sharp summary, not the body.
- diagnosis step body: 1-3 sentences.

Output strict JSON only, no preamble or trailing commentary:
{
  "diagnosis": [
    {"step": 1, "header": "...", "body": "..."},
    {"step": 2, "header": "...", "body": "..."},
    {"step": 3, "header": "...", "body": "..."}
  ],
  "next_step_short": "...",
  "next_step_qualifier": "...",
  "diagnosis_assessment": "ok" | "next_step_revised" | "heuristic_was_wrong"
}`;

function compactEngagement(e) {
  const ts = (e.timestamp || '').slice(0, 10);
  const lines = [`[${ts}] ${e.kind.toUpperCase()} — ${e.title}`];
  if (e.subline) lines.push(`  ${e.subline}`);
  if (e.body) lines.push(`  "${e.body.slice(0, 500)}"`);
  return lines.join('\n');
}

function compactEvidence(item) {
  return `${item.source}: ${item.content.slice(0, 400)}`;
}

function buildUserPrompt(input) {
  const tl = (input.timeline && input.timeline.engagements) || [];
  const tlHeader = input.timeline && input.timeline.last_contact_date
    ? `Last contact: ${input.timeline.last_contact_date.slice(0, 10)} (${input.timeline.days_since_last_contact}d ago)`
    : 'No engagement timeline available.';

  const tlText = tl.length
    ? tl.map(compactEngagement).join('\n\n')
    : '(no engagements found)';

  const evText = (input.other_evidence || []).length
    ? input.other_evidence.map(compactEvidence).join('\n')
    : '(none)';

  return `KIND: ${input.kind}
TITLE: ${input.title}
SUBTITLE: ${input.subtitle}
ASSIGNED TO: ${input.assigned_to_name || 'unassigned'}
PLANNED NEXT STEP: ${input.next_step_short}
PLANNED QUALIFIER: ${input.next_step_qualifier || '(none)'}

ENGAGEMENT TIMELINE (verbatim from HubSpot):
${tlHeader}

${tlText}

OTHER EVIDENCE (cross-source, not from HubSpot):
${evText}

Write the 3-step diagnosis. Quote specific dates and verbatim. If the artifact reveals the planned next_step is wrong, revise it and set diagnosis_assessment to "heuristic_was_wrong" or "next_step_revised".`;
}

// Bundle-based diagnose. Returns one of:
//   - The parsed result (with generated_at + timeline_used) when a previously
//     queued bundle has completed.
//   - { _pending: true, bundle_id, queued_at } when a bundle is in flight.
// One bundle in flight per (lookup_type, lookup_id) at a time.
async function diagnose(input) {
  const type = input.lookup_type, id = input.lookup_id;
  const key = (type && id) ? pendingKey(type, id) : null;

  // Fetch timeline once (needed either for the bundle prompt OR to populate
  // timeline_used on a completed result).
  let tl = input.timeline;
  if (!tl && type && id) {
    try { tl = await timeline.run(type, id); }
    catch (e) { console.error('[diagnose] timeline fetch failed:', e.message); }
  }
  const timelineUsed = tl ? { days_since_last_contact: tl.days_since_last_contact, engagement_count: tl.engagements_returned } : null;

  // (a) Check existing pending bundle for this key
  const pendingMap = loadPending();
  const pending = key ? pendingMap[key] : null;
  if (pending && pending.bundle_id) {
    const result = readBundleResult(pending.bundle_id);
    if (result && result.result != null) {
      const parsed = safeParseJson(result.result);
      if (parsed) {
        delete pendingMap[key];
        savePending(pendingMap);
        return { ...parsed, generated_at: result.completed_at, timeline_used: timelineUsed, from_bundle: pending.bundle_id };
      }
      console.error(`[diagnose] bundle ${pending.bundle_id} unparseable for ${key}; clearing and re-queueing`);
      delete pendingMap[key];
      savePending(pendingMap);
      // fall through to (b)
    } else {
      // Still queued
      return { _pending: true, bundle_id: pending.bundle_id, queued_at: pending.queued_at, timeline_used: timelineUsed };
    }
  }

  // (b) Create a new bundle
  const enrichedInput = { ...input, timeline: tl };
  const meta = createBundle({
    purpose: 'deal-diagnosis',
    system_prompt: SYSTEM_PROMPT,
    input_data: buildUserPrompt(enrichedInput),
    output_spec: 'Strict JSON: { "diagnosis": [{step,header,body}*3], "next_step_short": "...", "next_step_qualifier": "...", "diagnosis_assessment": "ok|next_step_revised|heuristic_was_wrong" }',
    output_schema: 'json',
    model_hint: 'haiku',
    target_kind: 'diagnosis',
    target_file: `coaching/cache/deal-diagnoses.json#${id}`,
    input_summary: `Diagnose ${input.kind || type || 'item'}: ${(input.title || id || '').slice(0, 80)}`,
    created_by: 'diagnose-from-timeline.js',
  });
  if (key) {
    pendingMap[key] = { bundle_id: meta.id, queued_at: new Date().toISOString() };
    savePending(pendingMap);
  }
  return { _pending: true, bundle_id: meta.id, queued_at: pendingMap[key] ? pendingMap[key].queued_at : new Date().toISOString(), timeline_used: timelineUsed };
}

module.exports = { diagnose };
