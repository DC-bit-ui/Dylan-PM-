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

const anthropic = require('./anthropic');
const timeline = require('./engagement-timeline');

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

async function diagnose(input) {
  // Fetch timeline if not provided
  let tl = input.timeline;
  if (!tl && input.lookup_type && input.lookup_id) {
    tl = await timeline.run(input.lookup_type, input.lookup_id);
  }
  const enrichedInput = { ...input, timeline: tl };

  const result = await anthropic.callJson({
    model: 'haiku',
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(enrichedInput),
    maxTokens: 2000,
  });

  return {
    ...result,
    generated_at: new Date().toISOString(),
    timeline_used: tl ? { days_since_last_contact: tl.days_since_last_contact, engagement_count: tl.engagements_returned } : null,
  };
}

module.exports = { diagnose };
