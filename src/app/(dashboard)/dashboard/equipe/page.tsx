import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamProspectsKpi } from '@/components/equipe/team-prospects-kpi'
import { TeamLeaderboard } from '@/components/equipe/team-leaderboard'
import { TeamMembersGrid } from '@/components/equipe/team-members-grid'
import { AddMemberModal } from '@/components/equipe/add-member-modal'
import type { Prospect } from '@/lib/types'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: teamMembers }, { data: calls }, { data: prospects }] = await Promise.all([
    supabase.from('team_members').select('*').eq('infopreneur_id', user.id),
    supabase.from('calls').select('*').eq('infopreneur_id', user.id),
    supabase.from('prospects').select('*').eq('infopreneur_id', user.id),
  ])

  const activeCount = teamMembers?.filter((m) => m.active).length ?? 0

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} membre{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <AddMemberModal />
      </div>

      <TeamProspectsKpi
        initialProspects={(prospects ?? []) as Prospect[]}
        teamMembers={teamMembers ?? []}
        infopreneurId={user.id}
      />
      <TeamLeaderboard teamMembers={teamMembers ?? []} calls={calls ?? []} />
      <TeamMembersGrid teamMembers={teamMembers ?? []} calls={calls ?? []} />
    </div>
  )
}
