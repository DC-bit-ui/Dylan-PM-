// Mirrors the /api/ask/prompts catalog + /api/ask/prompt/:id response.
// Source-of-truth backend file: server.js + curated-questions.json on
// the bus.

export interface AskCategory {
  id: string;
  label: string;
  icon: string;
}

export interface AskQuestion {
  id: string;
  category: string;
  icon?: string;
  label: string;
  hint?: string;
  question: string;
  brain_sources?: string[];
}

export interface AskCatalog {
  version: number;
  updated_at: string;
  description?: string;
  categories: AskCategory[];
  questions: AskQuestion[];
  error?: string;
}

export interface AskPromptResponse {
  id: string;
  label: string;
  category?: string;
  hint?: string;
  question: string;
  brain_sources?: string[];
  prompt: string;
}
