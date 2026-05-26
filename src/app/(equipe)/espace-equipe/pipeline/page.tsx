import { getAuthenticatedTeamMember } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProspectsPipeline } from '@/components/equipe/prospects-pipeline'
import type { Prospect } from '@/lib/types'

export default async function PipelinePage() {
  const member = await getAuthenticatedTeamMember()
  const admin = createAdminClient()

  const { data: prospects } = await admin
    .from('prospects')
    .select('*')
    .eq('infopreneur_id', member.infopreneur_id)
    .order('created_at', { ascending: false })

  const allProspects = (prospects ?? []) as Prospect[]

  return (
    <div className="p-6 space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-bold">Mon pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {allProspects.length} prospect{allProspects.length !== 1 ? 's' : ''} au total
        </p>
      </div>
      <ProspectsPipeline prospects={allProspects} noAdd />
    </div>
  )
}
