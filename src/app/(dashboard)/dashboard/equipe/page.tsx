import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamProspectsKpi } from '@/components/equipe/team-prospects-kpi'
import { TeamLeaderboard } from '@/components/equipe/team-leaderboard'
import { TeamMembersGrid } from '@/components/equipe/team-members-grid'
import { AddMemberModal } from '@/components/equipe/add-member-modal'
import { ProspectsPipeline } from '@/components/equipe/prospects-pipeline'
import type { Prospect } from '@/lib/types'

export default async function EquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [{ data: teamMembers }, { data: monthKpis }, { data: allProspects }, { data: closers }, { data: profile }] = await Promise.all([
    supabase.from('team_members').select('*').eq('infopreneur_id', user.id),
    supabase
      .from('daily_kpis')
      .select('team_member_id, role, r1_showup, r1_noshow, r2_showup, r2_noshow, signe, ca_contracte, ca_collecte, messages_envoyes, reponses_recues, followup, calls_bookes')
      .eq('infopreneur_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd),
    supabase.from('prospects').select('*').eq('infopreneur_id', user.id).order('created_at', { ascending: false }),
    supabase.from('team_members').select('id, full_name').eq('infopreneur_id', user.id).eq('role', 'closer'),
    supabase.from('profiles').select('tally_base_url').eq('id', user.id).single(),
  ])

  type KpiAgg = { team_member_id: string; messages_envoyes: number; reponses_recues: number; calls_bookes: number; showup: number; noshow: number; signe: number }
  const kpiMap = new Map<string, KpiAgg>()
  for (const k of (monthKpis ?? [])) {
    const prev = kpiMap.get(k.team_member_id) ?? { team_member_id: k.team_member_id, messages_envoyes: 0, reponses_recues: 0, calls_bookes: 0, showup: 0, noshow: 0, signe: 0 }
    prev.messages_envoyes += Number(k.messages_envoyes ?? 0)
    prev.reponses_recues += Number(k.reponses_recues ?? 0)
    prev.calls_bookes += Number(k.calls_bookes ?? 0)
    prev.showup += Number(k.r1_showup ?? 0) + Number(k.r2_showup ?? 0)
    prev.noshow += Number(k.r1_noshow ?? 0) + Number(k.r2_noshow ?? 0)
    prev.signe += Number(k.signe ?? 0)
    kpiMap.set(k.team_member_id, prev)
  }
  const memberKpis = Array.from(kpiMap.values())

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

      <TeamProspectsKpi teamMembers={teamMembers ?? []} infopreneurId={user.id} />
      <TeamLeaderboard teamMembers={teamMembers ?? []} dailyKpis={monthKpis ?? []} />
      <TeamMembersGrid teamMembers={teamMembers ?? []} memberKpis={memberKpis} />
      <ProspectsPipeline
        prospects={(allProspects ?? []) as Prospect[]}
        closers={closers ?? []}
        tallyBaseUrl={profile?.tally_base_url ?? null}
      />
    </div>
  )
}
