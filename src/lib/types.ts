export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null
  company: string | null
  subscription_plan: string | null
}

export interface Objective {
  id?: string
  infopreneur_id: string
  period: string
  period_start?: string | null
  revenue_target: number | null
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
  status: 'onboarding' | 'actif' | 'termine'
  start_date: string | null
  total_amount: number | null
  program_name: string | null
  notes: string | null
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
  amount: number
  payment_date: string
  status: 'paid' | 'pending' | 'overdue'
  receipt_url: string | null
  notes: string | null
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
  full_name: string
  email: string
  phone: string | null
  role: 'closer' | 'setter'
  active: boolean
  created_at: string
}

export interface Prospect {
  id: string
  infopreneur_id: string
  full_name: string
  email: string | null
  phone: string | null
  source: string | null
  estimated_value: number | null
  pipeline_stage: 'Nouveau lead' | 'Set en cours' | 'RDV booké' | 'No show' | 'Proposition envoyée' | 'Follow-up' | 'Gagné' | 'Perdu'
  instagram_url: string | null
  linkedin_url: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface Program {
  id: string
  infopreneur_id: string
  name: string
  price: number | null
  description: string | null
  created_at: string
}
