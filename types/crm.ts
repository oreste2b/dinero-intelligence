export type LeadTemperature = 'cold' | 'warm' | 'hot';

export type LeadSource =
  | 'website' | 'referral' | 'linkedin' | 'webinar'
  | 'whatsapp' | 'social' | 'otro' | 'webhook';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'follow_up';

// ─── DB row types ─────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: LeadSource | null;
  temperature: LeadTemperature | null;
  score: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string | null;
  isWon: boolean | null;
  isLost: boolean | null;
}

export interface Deal {
  id: string;
  title: string;
  value: number;        // in øre/cents
  stageId: string | null;
  contactId: string | null;
  expectedClose: string | null;
  probability: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  contactId: string | null;
  dealId: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ─── Enriched / joined types ──────────────────────────────────────────────────

export interface DealWithContact extends Deal {
  contact: Contact | null;
  stage: PipelineStage | null;
}

export interface ContactWithDeals extends Contact {
  deals: Deal[];
  activities: Activity[];
}

export interface PipelineColumn {
  stage: PipelineStage;
  deals: DealWithContact[];
  totalValue: number;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalContacts: number;
  activeDeals: number;
  pipelineValue: number;   // in øre/cents
  conversionRate: number;  // 0-100
  hotLeads: number;
  pipeline: PipelineColumn[];
  recentActivities: Activity[];
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreateContactPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: LeadSource;
  temperature?: LeadTemperature;
  notes?: string | null;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {
  score?: number;
}

export interface CreateDealPayload {
  title: string;
  value?: number;
  stageId?: string | null;
  contactId?: string | null;
  expectedClose?: string | null;
  probability?: number;
  notes?: string | null;
}

export interface UpdateDealPayload extends Partial<CreateDealPayload> {}

export interface CreateActivityPayload {
  type: ActivityType;
  description: string;
  contactId?: string | null;
  dealId?: string | null;
  scheduledAt?: string | null;
}

export interface ClassifyResult {
  temperature: LeadTemperature;
  score: number;
  nextAction: string;
  reasoning: string;
}
