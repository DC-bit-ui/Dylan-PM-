// Mirrors /api/work/* contracts. The exemplar shape is the spine of the WORK
// page — same shape covers stuck deals, completed visits, stalled calls.

export type WorkHeat = 'HOT' | 'WARM' | 'COLD';
export type WorkLookupType = 'deal' | 'contact' | string;
export type ExemplarKind = 'stuck_deal' | 'completed_visit' | 'stalled_call' | string;

export interface ExemplarDiagnosisStep {
  step: number | string;
  header: string;
  body: string;
}

export interface ExemplarCounterfactual {
  if_act_now: string;
  if_dont_act: string;
  data_quality?: string;
}

export interface ExemplarEvidence {
  source: string;
  content: string;
}

export interface ExemplarDraft {
  kind?: string; // 'email', 'sms', ...
  label?: string;
  subject?: string;
  body: string;
  to?: string;
  to_placeholder?: boolean;
}

export interface ExemplarAction {
  label: string;
  type: 'copy' | 'mailto' | 'open_url' | 'bus_write' | 'expand' | string;
  payload?: unknown;
  payload_field?: string;
}

export interface ExemplarDiagnosisMetadata {
  regenerated_at?: string;
  assessment?: string;
  timeline_used?: unknown;
}

export interface Exemplar {
  id: string;
  kind?: ExemplarKind;
  lookup_type?: WorkLookupType;
  lookup_id?: string;
  hubspot_id?: string;
  hubspot_url?: string;
  title: string;
  subtitle?: string;
  heat?: WorkHeat;
  assigned_to_id?: string;
  assigned_to_name?: string;
  next_step_short?: string;
  next_step_qualifier?: string;
  diagnosis?: ExemplarDiagnosisStep[];
  diagnosis_pending?: boolean;
  counterfactual?: ExemplarCounterfactual | null;
  evidence?: ExemplarEvidence[];
  draft?: ExemplarDraft | null;
  one_question?: string | null;
  actions?: ExemplarAction[];
  diagnosis_metadata?: ExemplarDiagnosisMetadata | null;
}

export interface ExemplarsResponse {
  exemplars: Exemplar[];
  generated_at?: string;
}

// --- Recent wins ---

export interface RecentWinAnalysis {
  one_line_why?: string;
  replicable_pattern?: string[];
  key_moment?: string;
  confidence?: 'low' | 'moderate' | 'high';
}

export interface RecentWinChannel {
  stormboy?: boolean;
  partner?: string;
}

export interface RecentWin {
  deal_id: string;
  deal_name?: string;
  hubspot_url?: string;
  closedate?: string;
  days_to_close?: number | null;
  estimated_project_ha?: number | null;
  total_property_hectares?: number | null;
  partner?: string;
  lead_source?: string;
  channel?: RecentWinChannel;
  analysis?: RecentWinAnalysis;
}

export interface RecentWinsResponse {
  wins: RecentWin[];
  generated_at?: string;
}

// --- Open probes ---

export interface OpenProbe {
  probe_id: string;
  rep_id?: string;
  rep_name?: string;
  question: string;
  context?: string;
  created_at?: string;
  days_open?: number;
  source_kind?: string;
  source_url?: string;
  status?: 'open' | 'answered' | 'expired' | string;
}

export interface OpenProbesResponse {
  probes: OpenProbe[];
  generated_at?: string;
}

// --- Active deals (for stream 1 / re-engage warm pipeline) ---

export interface CoachingActiveDeal {
  deal_id: string;
  deal_name: string;
  current_stage: string;
  days_in_current_stage: number;
  attribution?: string;
  risk_class?: 'red' | 'amber' | 'green';
  risk_score?: number;
  median_won_at_stage?: number;
  median_lost_at_stage?: number;
  coaching_message?: string;
  enablement?: {
    inline_draft?: {
      type?: string;
      subject?: string;
      body?: string;
    };
  };
}

export interface CoachingActiveResponse {
  deals: CoachingActiveDeal[];
  generated_at?: string;
}

// --- Diagnose-job state (async LLM job) ---

export interface DiagnoseJobState {
  status: 'idle' | 'running' | 'done' | 'failed' | string;
  progress?: number;
  total?: number;
  started_at?: string;
  finished_at?: string;
  error?: string;
}
