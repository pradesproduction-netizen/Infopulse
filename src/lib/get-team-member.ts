import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { TeamMember } from '@/lib/types'

export async function getAuthenticatedTeamMember(): Promise<TeamMember> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('team_members')
    .select('*')
    .eq('email', user.email ?? '')
    .single()

  if (!member) redirect('/login')
  return member as TeamMember
}
