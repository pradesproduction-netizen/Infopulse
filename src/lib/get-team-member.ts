import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { TeamMember } from '@/lib/types'

export async function getAuthenticatedTeamMember(): Promise<TeamMember> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Try user_id first (preferred), fallback to email for legacy accounts
  let { data: member } = await admin
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) {
    const { data: byEmail } = await admin
      .from('team_members')
      .select('*')
      .eq('email', user.email ?? '')
      .maybeSingle()
    member = byEmail
  }

  if (!member) redirect('/login')
  return member as TeamMember
}

export async function findTeamMemberOrNull(userId: string, email: string): Promise<TeamMember | null> {
  const admin = createAdminClient()

  let { data: member } = await admin
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!member) {
    const { data: byEmail } = await admin
      .from('team_members')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    member = byEmail
  }

  return (member as TeamMember) ?? null
}
