/**
 * Ask-prompts — curated starter questions for the launcher pattern.
 *
 * The dashboard's ASK tab is a launcher, not a chat. Users click a question;
 * the dashboard copies a self-contained prompt to clipboard; the user pastes
 * it into their Claude Code Desktop session. Claude reads the listed brain
 * sources (from the bus, OneDrive-synced) and answers in the user's own
 * Claude Code conversation — where multi-turn happens naturally and uses
 * the user's flat-fee subscription.
 *
 * Source of truth: shared-growth-memory/ask-prompts/curated-questions.json
 * Editable by Dylan/Kieren directly. Reload happens on every request.
 */

const fs = require('fs');
const path = require('path');
const { BUS_ROOT } = require('./supplements');

const QUESTIONS_PATH = path.join(BUS_ROOT, 'ask-prompts', 'curated-questions.json');

function load() {
  try {
    if (!fs.existsSync(QUESTIONS_PATH)) {
      return { version: 0, categories: [], questions: [], error: 'curated-questions.json not found in bus' };
    }
    return JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
  } catch (e) {
    return { version: 0, categories: [], questions: [], error: e.message };
  }
}

function formatPrompt(question, template) {
  const sources = (question.brain_sources || [])
    .map(s => `- ${s}`)
    .join('\n');
  const t = template || load().instruction_template || '';
  return t
    .replace('{SOURCES}', sources || '(no specific sources — search the bus broadly)')
    .replace('{QUESTION}', question.question);
}

function listQuestions() {
  const data = load();
  return {
    version: data.version,
    updated_at: data.updated_at,
    categories: data.categories || [],
    questions: (data.questions || []).map(q => ({
      id: q.id,
      category: q.category,
      icon: q.icon,
      label: q.label,
      hint: q.hint,
      brain_sources: q.brain_sources || [],
      question: q.question,
    })),
    error: data.error || null,
  };
}

function getPrompt(id) {
  const data = load();
  const q = (data.questions || []).find(x => x.id === id);
  if (!q) return null;
  return {
    id: q.id,
    label: q.label,
    category: q.category,
    question: q.question,
    brain_sources: q.brain_sources || [],
    prompt: formatPrompt(q, data.instruction_template),
  };
}

module.exports = { listQuestions, getPrompt };
