// Mirrors /api/brain/* endpoints. Source-of-truth: server.js routes
// at /api/brain/personas, /:slug, /distillates, /objection-cards.

export interface BrainPersona {
  slug: string;
  name: string;
  email?: string | null;
  owner_id?: string | null;
  status?: 'active' | 'historical' | string;
  notes?: string;
}

export interface BrainPersonasResponse {
  _comment?: string;
  _last_refreshed?: string;
  personas: BrainPersona[];
}

export interface BrainTocEntry {
  slug: string;
  text: string;
  level: number;
}

export interface BrainProfile {
  slug: string;
  name: string;
  description?: string;
  markdown: string;
  toc: BrainTocEntry[];
  size_bytes: number;
}

export interface BrainTopicDistillate {
  topic_label: string;
  customer_position?: string;
  hobbs_response?: string;
  rep_response?: string;
  landed_or_friction?: 'landed' | 'friction' | 'unknown';
  quotable_phrasing?: string;
  confidence?: 'low' | 'moderate' | 'high';
}

export interface BrainDistillate {
  transcript_id: string;
  visit_date?: string;
  call_date?: string;
  region_nrm?: string;
  size_bucket?: string;
  topic_distillates?: BrainTopicDistillate[];
  topic_count?: number;
}

export interface BrainDistillatesResponse {
  generated_at: string;
  farm_visits: BrainDistillate[];
  calls: BrainDistillate[];
}

export interface BrainObjectionCard {
  id: string;
  number: number;
  objection: string;
  subtext?: string | null;
  reframe: string;
  closing_line?: string | null;
  tags?: string[];
  source?: string;
  source_section?: string;
}

export interface BrainObjectionCardsResponse {
  version: string;
  generated_at: string;
  card_count: number;
  by_source?: Record<string, number>;
  cards: BrainObjectionCard[];
}
