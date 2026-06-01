export interface PaymentToChase {
  id: string
  amount: number
  next_payment_date: string
  clients: { full_name: string; email: string; phone: string | null } | null
}

export interface Profile {
  id: string
  role: 'infopreneur' | 'team_member' | 'client' | null
  full_name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null
  company: string | null
  subscription_plan: string | null
  tally_base_url: string | null
}

export interface Objective {
  id?: string
  infopreneur_id: string
  period: string
  period_start?: string | null
  ca_contracte_target: number | null
  ca_collecte_target: number | null
  closing_rate_target: number | null
  show_up_rate_target: number | null
}

export interface Client {
  id: string
  infopreneur_id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  client_user_id: string | null
  status: 'onboarding' | 'actif' | 'termine' | 'en_pause'
  start_date: string | null
  total_amount: number | null
  program_name: string | null
  notes: string | null
  instagram_url: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string | null
}

export interface CoachingStep {
  id: string
  client_id: string
  title: string
  description: string | null
  status: 'locked' | 'in_progress' | 'completed'
  order: number
  completed_at: string | null
}

export interface Payment {
  id: string
  client_id: string
  infopreneur_id?: string | null
  amount: number
  payment_date: string
  next_payment_date?: string | null
  status: 'paid' | 'pending' | 'overdue' | 'a_relancer' | 'en_pause'
  paid_at: string | null
  receipt_url: string | null
  notes: string | null
}

export interface ClientProgram {
  id: string
  client_id: string
  program_id: string
  created_at: string
  program?: Program
}

export interface Contract {
  id: string
  client_id: string
  name: string
  amount: number | null
  duration: string | null
  status: 'draft' | 'sent' | 'signed' | 'cancelled'
  file_url: string | null
  created_at: string
}

export interface Call {
  id: string
  infopreneur_id?: string
  team_member_id?: string | null
  client_id: string | null
  prospect_name: string | null
  call_date: string
  duration_seconds: number | null
  recording_url: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  outcome: string | null
  notes: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  infopreneur_id: string
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  role: 'closer' | 'setter'
  active: boolean
  created_at: string
  messages_sent: number | null
  follow_ups: number | null
  calls_booked: number | null
  signed_clients: number | null
}

export interface Prospect {
  id: string
  infopreneur_id: string
  full_name: string
  email: string | null
  phone: string | null
  source: string | null
  estimated_value: number | null
  pipeline_stage: 'nouveau_lead' | 'set_en_cours' | 'r1_booke' | 'r1_noshow' | 'r2_booke' | 'r2_show' | 'follow_up' | 'signes' | 'perdu'
  team_member_id: string | null
  assigned_closer_id: string | null
  client_id: string | null
  rdv_r1_date: string | null
  rdv_r2_date: string | null
  tally_link: string | null
  instagram_url: string | null
  linkedin_url: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface Notification {
  id: string
  team_member_id: string
  infopreneur_id: string
  type: string
  message: string
  prospect_id: string | null
  read: boolean
  created_at: string
}

export interface Program {
  id: string
  infopreneur_id: string
  name: string
  price: number | null
  description: string | null
  created_at: string
}

export interface DailyKpi {
  id: string
  team_member_id: string
  infopreneur_id: string
  date: string
  role: 'closer' | 'setter'
  r1_showup: number
  r1_noshow: number
  r2_showup: number
  r2_noshow: number
  pas_qualifie: number
  pas_qualifie_note: string | null
  signe: number
  ca_contracte: number
  ca_collecte: number
  messages_envoyes: number
  reponses_recues: number
  followup: number
  calls_bookes: number
  created_at: string
}

export interface SopDocument {
  id: string
  infopreneur_id: string
  type: 'setter' | 'closer'
  file_name: string
  storage_path: string
  created_at: string
}

export interface PaymentLink {
  id: string
  infopreneur_id: string
  name: string
  url: string
  created_at: string
}

export interface RdvProspect {
  id: string
  full_name: string
  rdv_r1_date?: string | null
  rdv_r2_date?: string | null
  team_members?: { full_name: string } | null
}
