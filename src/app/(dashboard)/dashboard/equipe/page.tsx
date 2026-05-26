import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamStats } from '@/components/equipe/team-stats'
import { TeamLeaderboard } from '@/components/equipe/team-leaderboard'
import { TeamMembersGrid } from '@/components/equipe/team-members-grid'
import { AddMemberModal } from '@/components/equipe/add-member-modal'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: teamMembers }, { data: calls }] = await Promise.all([
    supabase.from('team_members').select('*').eq('infopreneur_id', user.id),
    supabase.from('calls').select('*').eq('infopreneur_id', user.id),
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

      <TeamStats calls={calls ?? []} teamMembers={teamMembers ?? []} />
      <TeamLeaderboard teamMembers={teamMembers ?? []} calls={calls ?? []} />
      <TeamMembersGrid teamMembers={teamMembers ?? []} calls={calls ?? []} />
    </div>
  )
}
