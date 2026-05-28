// Mirrors /api/stormboy/summary + /api/work/contact-diagnoses. Feeds the
// Storm Boy funnel + upcoming visits + synthesis cards on the WORK page.

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface UpcomingVisit {
  id: string;
  name: string;
  owner_id?: string;
  meeting_date: string;
  last_contacted?: string | null;
  meeting_completed?: string | null;
  horizon_snapshot_created?: string | null;
  hubspot_url: string;
}

export interface CallQueueItem {
  id: string;
  name: string;
  owner_id?: string;
  last_contacted?: string | null;
  days_since_contact?: number | null;
  hubspot_url: string;
}

export interface RecentVisit {
  id: string;
  name: string;
  owner_id?: string;
  meeting_date: string;
  days_since?: number | null;
  hubspot_url: string;
}

export interface StormboySummaryResponse {
  generated_at: string;
  total_contacts: number;
  unstaged: number;
  not_eligible: number;
  funnel: FunnelStage[];
  upcoming: UpcomingVisit[];
  call_queue: CallQueueItem[];
  recent_visits: RecentVisit[];
}

export type ContactHeat = 'HOT' | 'WARM' | 'COLD' | string;

export interface DiagnosisStep {
  step: number;
  header: string;
  body: string;
}

export interface ContactDiagnosis {
  contact_id: string;
  name: string;
  stage: string;
  heat: ContactHeat;
  owner_id?: string;
  diagnosis: DiagnosisStep[];
  next_step_short?: string;
  next_step_qualifier?: string;
  diagnosis_assessment?: string;
  timeline_used?: number;
  regenerated_at?: string;
  from_bundle?: string | null;
  refresh_in_flight?: boolean;
}

export interface ContactDiagnosesResponse {
  generated_at: string;
  contacts: Record<string, ContactDiagnosis>;
}
