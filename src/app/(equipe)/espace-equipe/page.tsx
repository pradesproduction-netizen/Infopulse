import { getAuthenticatedTeamMember } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, CheckCircle2, TrendingUp, XCircle, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call } from '@/lib/types'

const statusConfig = {
  scheduled: { label: 'Planifié', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  completed: { label: 'Terminé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  cancelled: { label: 'Annulé', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
  no_show: { label: 'No-show', className: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
}

export default async function EspaceEquipePage() {
  const member = await getAuthenticatedTeamMember()
  const admin = createAdminClient()

  const { data: calls } = await admin
    .from('calls')
    .select('*')
    .eq('team_member_id', member.id)
    .order('call_date', { ascending: false })

  const allCalls = (calls ?? []) as Call[]
  const completed = allCalls.filter((c) => c.status === 'completed').length
  const noShows = allCalls.filter((c) => c.status === 'no_show').length
  const scheduled = allCalls.filter((c) => c.status === 'scheduled').length
  const showUpRate = allCalls.length > 0 ? Math.round((completed / allCalls.length) * 100) : 0
  const recentCalls = allCalls.slice(0, 10)

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const firstName = member.full_name.split(' ')[0]

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
        <h1 className="text-2xl font-bold mt-1">Bonjour {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Voici un aperçu de tes performances.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total appels</p>
            </div>
            <p className="text-2xl font-bold">{allCalls.length}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <p className="text-xs text-muted-foreground">Terminés</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{completed}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              <p className="text-xs text-muted-foreground">Taux de show-up</p>
            </div>
            <p className="text-2xl font-bold text-violet-400">{showUpRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-orange-400" />
              <p className="text-xs text-muted-foreground">No-shows</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{noShows}</p>
          </CardContent>
        </Card>
      </div>

      {scheduled > 0 && (
        <Card className="border-violet-500/30 bg-violet-500/[0.06]">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-semibold text-violet-300">{scheduled} appel{scheduled !== 1 ? 's' : ''} planifié{scheduled !== 1 ? 's' : ''}</span>
              <span className="text-muted-foreground"> à venir</span>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">Derniers appels</h2>
        {recentCalls.length === 0 ? (
          <Card className="border-white/10 bg-card/50 p-8">
            <p className="text-center text-sm text-muted-foreground">Aucun appel enregistré pour l&apos;instant.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentCalls.map((call) => (
              <Card key={call.id} className="border-white/10 bg-card/50 p-4 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between gap-4">
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
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full border flex-shrink-0',
                    statusConfig[call.status as keyof typeof statusConfig]?.className ?? ''
                  )}>
                    {statusConfig[call.status as keyof typeof statusConfig]?.label ?? call.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
