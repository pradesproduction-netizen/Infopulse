import { getAuthenticatedTeamMember } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { MemberKpiCards } from '@/components/equipe/member-kpi-cards'
import { AutoRefresh } from '@/components/ui/auto-refresh'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhoneCall, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call, Prospect } from '@/lib/types'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Planifié', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  completed: { label: 'Terminé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  cancelled: { label: 'Annulé', className: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  no_show: { label: 'No-show', className: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
}

export default async function EspaceEquipePage() {
  const member = await getAuthenticatedTeamMember()
  const admin = createAdminClient()

  const [{ data: calls }, { data: prospects }] = await Promise.all([
    admin
      .from('calls')
      .select('*')
      .eq('team_member_id', member.id)
      .order('call_date', { ascending: false }),
    admin
      .from('prospects')
      .select('*')
      .eq('team_member_id', member.id),
  ])

  const allCalls = (calls ?? []) as Call[]
  const allProspects = (prospects ?? []) as Prospect[]

  const scheduledCalls = allCalls.filter((c) => c.status === 'scheduled')
  const recentCalls = allCalls.slice(0, 10)

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const firstName = member.full_name.split(' ')[0]

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <AutoRefresh ms={30000} />

      <div>
        <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
        <h1 className="text-2xl font-bold mt-1">Bonjour {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Voici un aperçu de tes performances.</p>
      </div>

      <MemberKpiCards initialProspects={allProspects} teamMemberId={member.id} />

      {scheduledCalls.length > 0 && (
        <Card className="border-violet-500/30 bg-violet-500/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-semibold text-violet-300">
                {scheduledCalls.length} appel{scheduledCalls.length !== 1 ? 's' : ''} planifié{scheduledCalls.length !== 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground"> à venir</span>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
          Derniers appels
          <span className="text-sm font-normal text-muted-foreground">({allCalls.length} total)</span>
        </h2>
        {recentCalls.length === 0 ? (
          <Card className="border-white/10 bg-card/50">
            <p className="text-center text-sm text-muted-foreground py-8">Aucun appel enregistré pour l&apos;instant.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentCalls.map((call) => {
              const cfg = STATUS_CONFIG[call.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.scheduled
              return (
                <Card key={call.id} className="border-white/10 bg-card/50 hover:border-white/20 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {call.prospect_name ?? 'Prospect'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.call_date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn('text-xs flex-shrink-0', cfg.className)}>
                      {cfg.label}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
