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
  // Use limit(1) + order to avoid maybeSingle() failing on duplicate user_ids (data integrity issue)
  const { data: byUserId } = await admin
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
  const member = byUserId?.[0] ?? null

  if (!member) {
    const { data: byEmail } = await admin
      .from('team_members')
      .select('*')
      .eq('email', user.email ?? '')
      .order('created_at', { ascending: true })
      .limit(1)
    const memberByEmail = byEmail?.[0] ?? null
    if (!memberByEmail) redirect('/login')
    return memberByEmail as TeamMember
  }

  return member as TeamMember
}

export async function findTeamMemberOrNull(userId: string, email: string): Promise<TeamMember | null> {
  const admin = createAdminClient()

  const { data: byUserId } = await admin
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
  const member = byUserId?.[0] ?? null

  if (!member) {
    const { data: byEmail } = await admin
      .from('team_members')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true })
      .limit(1)
    return (byEmail?.[0] as TeamMember) ?? null
  }

  return member as TeamMember
}
