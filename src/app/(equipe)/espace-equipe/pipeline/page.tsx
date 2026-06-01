import { getAuthenticatedTeamMember } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProspectsPipeline } from '@/components/equipe/prospects-pipeline'
import type { Prospect } from '@/lib/types'

export default async function PipelinePage() {
  const member = await getAuthenticatedTeamMember()
  const admin = createAdminClient()

  const prospectsQuery = admin
    .from('prospects')
    .select('*')
    .eq('infopreneur_id', member.infopreneur_id)
    .order('created_at', { ascending: false })

  const filteredQuery = member.role === 'setter'
    ? prospectsQuery.eq('team_member_id', member.id)
    : prospectsQuery.eq('assigned_closer_id', member.id)

  const [{ data: prospects }, { data: closers }, { data: profile }] = await Promise.all([
    filteredQuery,
    admin.from('team_members').select('id, full_name').eq('infopreneur_id', member.infopreneur_id).eq('role', 'closer'),
    admin.from('profiles').select('tally_base_url').eq('id', member.infopreneur_id).maybeSingle(),
  ])

  const allProspects = (prospects ?? []) as Prospect[]

  return (
    <div className="p-6 space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-bold">Mon pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {allProspects.length} prospect{allProspects.length !== 1 ? 's' : ''} au total
        </p>
      </div>
      <ProspectsPipeline
        prospects={allProspects}
        noAdd={member.role === 'closer'}
        memberId={member.id}
        closers={closers ?? []}
        tallyBaseUrl={profile?.tally_base_url ?? null}
      />
    </div>
  )
}
