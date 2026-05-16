/**
 * Ask Hobbs / Ask the team — natural-language query interface.
 *
 * Loads the captured team brain (profiles + distillates) into a prompt-cached
 * system block, then runs multi-turn conversations against it.
 *
 * Caching:
 *   The 30K-token team brain sits in a cache_control: ephemeral system block.
 *   First turn pays full input cost; subsequent turns (within ~5 min) pay 10%.
 *   This makes conversations dramatically cheaper without losing context.
 *
 * Memory:
 *   Caller passes `history` — an array of prior {question, answer} pairs.
 *   We thread them as user/assistant messages so Claude follows the thread.
 *
 * Sources loaded per query:
 *   - hobbs-profile.md (digital replica: signature moves, language bank, plays)
 *   - hobbs-distillates-bulk.json (6 farm visits, topic distillates)
 *   - hobbs-calls-distillates.json (6 Aircall calls, cold-open framings)
 *   - ben-profile.md (performance profile, call patterns)
 *   - claudia-profile.md (operating model + tool philosophy)
 *   - will-profile.md (command profile + operating doctrine)
 *   - team-brain/objection-plays/*.md (Hobbs's objection handbook + AgriProve
 *     FAQ + objection-handling guide + Storm Boy cold-call script)
 */

const fs = require('fs');
const path = require('path');
const anthropic = require('./anthropic');

const COACHING_ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(COACHING_ROOT, 'cache');
const BUS_ROOT = process.env.BUS_PATH || path.join('C:', 'Dylan PM', 'shared-growth-memory');
const OBJECTION_PLAYS_DIR = path.join(BUS_ROOT, 'team-brain', 'objection-plays');
const MAX_HISTORY_TURNS = 10;

let _brain = null;
let _brainText = null;

function loadFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; }
}

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

function summariseFarmVisits(data) {
  if (!data || !data.visits) return '';
  return data.visits.map(v => {
    const summary = v.visit_summary || {};
    const topics = (v.topic_distillates || []).slice(0, 3).map(t => {
      return `    Topic: ${t.topic_label}\n      Customer: ${t.customer_position || '—'}\n      Hobbs: ${t.hobbs_response || '—'}${t.landed_or_failed ? `\n      Outcome: ${t.landed_or_failed}` : ''}`;
    }).join('\n');
    return `### ${v.transcript_id} (${v.region_nrm || '?'})\n  Outcome: ${summary.overall_outcome || '?'}\n  Summary: ${summary.one_line_summary || ''}\n${topics}`;
  }).join('\n\n');
}

function summariseCalls(data) {
  if (!data || !data.calls) return '';
  return data.calls.map(c => {
    const summary = c.visit_summary || {};
    const topics = (c.topic_distillates || []).slice(0, 2).map(t => {
      return `    Topic: ${t.topic_label}\n      Customer: ${t.customer_position || '—'}\n      Hobbs: ${t.hobbs_response || '—'}`;
    }).join('\n');
    return `### ${c.transcript_id} (${c.call_type || '?'})\n  Outcome: ${summary.overall_outcome || '?'}\n  Summary: ${summary.one_line_summary || ''}\n${topics}`;
  }).join('\n\n');
}

function loadObjectionPlays() {
  // Two-part brain content:
  //   1. STRUCTURED CARDS — parsed from Hobbs's handbook. Compact, retrievable.
  //   2. RAW MARKDOWN — the supporting docs (FAQ, general guide, cold-call script)
  //      that haven't been fully structured yet.
  //
  // INDEX.md and the now-structured Hobbs handbook are excluded from the raw
  // dump to avoid duplication with the structured cards.
  if (!fs.existsSync(OBJECTION_PLAYS_DIR)) return '';

  // Structured cards first — they're the highest-signal content
  let structured = '';
  try {
    const oc = require('./objection-cards');
    structured = oc.buildCompactBrainText();
  } catch (_) { /* fall through to raw only */ }

  const skipFiles = new Set(['INDEX.md', 'hobbs-farmer-objection-handbook.md']);
  const files = fs.readdirSync(OBJECTION_PLAYS_DIR)
    .filter(f => f.endsWith('.md') && !skipFiles.has(f))
    .sort();
  const raw = files.map(f => `\n--- ${f} ---\n${loadFile(path.join(OBJECTION_PLAYS_DIR, f))}`).join('\n');

  return structured + '\n\n=== SUPPORTING DOCS (FAQ + general guide + cold-call script) ===\n' + raw;
}

function loadBrain() {
  if (_brain) return _brain;
  _brain = {
    hobbs_profile: loadFile(path.join(COACHING_ROOT, 'hobbs-profile.md')),
    ben_profile:   loadFile(path.join(COACHING_ROOT, 'ben-profile.md')),
    claudia_profile: loadFile(path.join(COACHING_ROOT, 'claudia-profile.md')),
    will_profile: loadFile(path.join(COACHING_ROOT, 'will-profile.md')),
    farm_visits:  summariseFarmVisits(loadJson(path.join(CACHE_DIR, 'hobbs-distillates-bulk.json'))),
    calls:        summariseCalls(loadJson(path.join(CACHE_DIR, 'hobbs-calls-distillates.json'))),
    objection_plays: loadObjectionPlays(),
  };
  return _brain;
}

/**
 * Build the big "team brain" text block — this becomes a cache_control block
 * so it's only billed at full price on the first turn of a conversation.
 */
function buildBrainText() {
  if (_brainText) return _brainText;
  const brain = loadBrain();
  _brainText = `=== TEAM PROFILES ===

## Hobbs profile
${brain.hobbs_profile.slice(0, 14000)}

## Ben profile
${brain.ben_profile.slice(0, 10000)}

## Claudia profile
${brain.claudia_profile.slice(0, 6000)}

## Will profile
${brain.will_profile.slice(0, 6000)}

=== HOBBS FARM-VISIT DISTILLATES (6 visits) ===
${brain.farm_visits}

=== HOBBS CALL DISTILLATES (6 Aircall transcripts) ===
${brain.calls}

=== OBJECTION PLAYS (Hobbs's handbook + AgriProve FAQ + cold-call script) ===
${brain.objection_plays}`;
  return _brainText;
}

const ROLE_PROMPT = `You are the AgriProve Storm Boy team's collective intelligence — drawing on the captured experience of Hobbs Magaret (the grazier-in-residence closer), Ben Payne (lead sales rep), Claudia Bryant (operations + tool-builder), and Will Frecheville (Head of Operations).

A rep asks a question. Your job: answer it as if Hobbs, Ben, or whoever has the relevant experience were on the call with them. Use the team's actual framings, language, and patterns from the source material — quote verbatim where it lands harder than paraphrase.

This is a multi-turn conversation. The rep may follow up, refine, or shift topic. Use prior turns as context but don't repeat ground already covered.

CRITICAL RULES:
- Quote the team's verbatim language whenever it answers the question. Attribute it ("Hobbs's framing:", "Ben's pattern:") so the rep knows where it came from.
- If you don't have grounding in the source material, say so honestly. Don't invent.
- Be tight. Sales reps reading this are mid-workflow. 200-400 words for most answers.
- Lead with the answer. Then the supporting evidence/quotes.
- If the question is about a specific situation (objection, stage, region), say so explicitly: "For X situation, here's what Y does."
- Cite which source you're drawing from in a "Sources" block at the end: which profile, which call/visit transcript.

Output strict JSON only, no preamble:
{
  "answer": "<the full answer in markdown, with **bold** for key phrases and > for quoted material>",
  "sources": [
    {"source": "Hobbs profile / Ben profile / call-2026-04-20-ian-cameron / visit-3-containment-feeding / etc.", "excerpt": "<short verbatim or paraphrase>"}
  ],
  "confidence": "high" | "medium" | "low"
}`;

function buildSystemBlocks() {
  return [
    { type: 'text', text: ROLE_PROMPT },
    { type: 'text', text: buildBrainText(), cache_control: { type: 'ephemeral' } },
  ];
}

/**
 * Build messages array from history + new question.
 * Anthropic expects alternating user/assistant turns; we serialise the
 * assistant's prior answer back into the JSON shape it would have produced.
 */
function buildMessages(question, context, history) {
  const messages = [];
  const trimmedHistory = (history || []).slice(-MAX_HISTORY_TURNS);
  for (const turn of trimmedHistory) {
    if (turn.question) {
      messages.push({ role: 'user', content: turn.question });
    }
    if (turn.answer) {
      // Serialise back into the JSON the model emitted, so the assistant
      // "remembers" what it said and we keep the contract consistent.
      const asJson = JSON.stringify({
        answer: turn.answer,
        sources: turn.sources || [],
        confidence: turn.confidence || 'medium',
      });
      messages.push({ role: 'assistant', content: asJson });
    }
  }
  const final = context ? `Context: ${context}\n\n${question}` : question;
  messages.push({ role: 'user', content: final });
  return messages;
}

async function ask({ question, context, history, model = 'haiku' }) {
  if (!question || !question.trim()) throw new Error('question required');
  const start = Date.now();
  const result = await anthropic.callJson({
    model,
    system: buildSystemBlocks(),
    messages: buildMessages(question, context, history),
    maxTokens: 2500,
  });
  return {
    question,
    answer: result.answer || '',
    sources: result.sources || [],
    confidence: result.confidence || 'medium',
    model_used: model,
    history_turns_used: (history || []).slice(-MAX_HISTORY_TURNS).length,
    latency_ms: Date.now() - start,
    asked_at: new Date().toISOString(),
  };
}

module.exports = { ask, loadBrain };
