import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { findTeamMemberOrNull } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { MemberKpiCards } from '@/components/equipe/member-kpi-cards'
import { DailyKpiCalendar } from '@/components/equipe/daily-kpi-calendar'
import { AutoRefresh } from '@/components/ui/auto-refresh'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhoneCall, Calendar, TrendingUp, BarChart2, MessageSquare, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call, Prospect, DailyKpi, TeamMember } from '@/lib/types'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Planifié', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  completed: { label: 'Terminé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  cancelled: { label: 'Annulé', className: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  no_show: { label: 'No-show', className: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { monday, sunday }
}

function KpiTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function CloserWeekSummary({ kpis }: { kpis: DailyKpi[] }) {
  const totalCalls = kpis.reduce((s, k) => s + k.r1_showup + k.r1_noshow + k.r2_showup + k.r2_noshow, 0)
  const totalShowup = kpis.reduce((s, k) => s + k.r1_showup + k.r2_showup, 0)
  const totalSigned = kpis.reduce((s, k) => s + k.signe, 0)
  const caContracte = kpis.reduce((s, k) => s + Number(k.ca_contracte), 0)
  const showUpRate = totalCalls > 0 ? Math.round((totalShowup / totalCalls) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiTile label="Appels" value={totalCalls} />
      <KpiTile label="Show-up" value={`${showUpRate}%`} />
      <KpiTile label="Signés" value={totalSigned} />
      <KpiTile label="CA contracté" value={caContracte > 0 ? `${caContracte.toLocaleString('fr-FR')} €` : '0 €'} />
    </div>
  )
}

function SetterWeekSummary({ kpis }: { kpis: DailyKpi[] }) {
  const totalMessages = kpis.reduce((s, k) => s + k.messages_envoyes, 0)
  const totalReplies = kpis.reduce((s, k) => s + k.reponses_recues, 0)
  const totalFollowups = kpis.reduce((s, k) => s + k.followup, 0)
  const totalCallsBooked = kpis.reduce((s, k) => s + k.calls_bookes, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiTile label="Messages" value={totalMessages} />
      <KpiTile label="Réponses" value={totalReplies} />
      <KpiTile label="Follow-ups" value={totalFollowups} />
      <KpiTile label="Calls bookés" value={totalCallsBooked} />
    </div>
  )
}

export default async function EspaceEquipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const member = await findTeamMemberOrNull(user.id, user.email ?? '')

  if (!member) {
    return (
      <div className="p-6 max-w-lg mx-auto pt-24 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
          <BarChart2 className="h-8 w-8 text-orange-400" />
        </div>
        <h1 className="text-xl font-bold">Compte non lié</h1>
        <p className="text-muted-foreground text-sm">
          Votre compte n&apos;est pas encore lié à un membre d&apos;équipe.
          Contactez votre coach pour qu&apos;il associe votre profil.
        </p>
      </div>
    )
  }

  const admin = createAdminClient()
  const now = new Date()
  const today = toDateStr(now)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const { monday, sunday } = getWeekBounds()
  const mondayStr = toDateStr(monday)
  const sundayStr = toDateStr(sunday)

  const [{ data: calls }, { data: prospects }, { data: monthKpis }, { data: weekKpis }] = await Promise.all([
    admin.from('calls').select('*').eq('team_member_id', member.id).order('call_date', { ascending: false }),
    admin.from('prospects').select('*').eq('team_member_id', member.id),
    admin.from('daily_kpis').select('date').eq('team_member_id', member.id).gte('date', monthStart).lte('date', monthEnd),
    admin.from('daily_kpis').select('*').eq('team_member_id', member.id).gte('date', mondayStr).lte('date', sundayStr),
  ])

  const allCalls = (calls ?? []) as Call[]
  const allProspects = (prospects ?? []) as Prospect[]
  const filledDates = (monthKpis ?? []).map((k: { date: string }) => k.date)
  const todayFilled = filledDates.includes(today)
  const weekKpiList = (weekKpis ?? []) as DailyKpi[]
  const hasWeekData = weekKpiList.length > 0

  const scheduledCalls = allCalls.filter((c) => c.status === 'scheduled')
  const recentCalls = allCalls.slice(0, 10)

  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const firstName = (member as TeamMember).full_name.split(' ')[0]
  const role = (member as TeamMember & { role: 'closer' | 'setter' }).role

  const weekLabel = `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <AutoRefresh ms={30000} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
          <h1 className="text-2xl font-bold mt-1">Bonjour {firstName} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Voici un aperçu de tes performances.</p>
        </div>
        {todayFilled ? (
          <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-sm px-3 py-1 h-auto">
            ✅ KPI rempli aujourd&apos;hui
          </Badge>
        ) : (
          <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-sm px-3 py-1 h-auto">
            ⚠ Non rempli aujourd&apos;hui
          </Badge>
        )}
      </div>

      {/* Calendrier mensuel + modale */}
      <DailyKpiCalendar
        teamMemberId={member.id}
        role={role}
        initialFilledDates={filledDates}
      />

      {/* Résumé semaine en cours */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {role === 'closer' ? <TrendingUp className="h-5 w-5 text-violet-400" /> : <MessageSquare className="h-5 w-5 text-blue-400" />}
            KPI de la semaine
            <span className="text-xs font-normal text-muted-foreground ml-1">{weekLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasWeekData ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune donnée cette semaine — remplis tes KPI du jour depuis le calendrier.
            </p>
          ) : role === 'closer' ? (
            <CloserWeekSummary kpis={weekKpiList} />
          ) : (
            <SetterWeekSummary kpis={weekKpiList} />
          )}
        </CardContent>
      </Card>

      {/* KPI cards prospects */}
      <MemberKpiCards initialProspects={allProspects} teamMemberId={member.id} />

      {/* Appels planifiés */}
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

      {/* Derniers appels */}
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
                      <p className="text-sm font-medium truncate">{call.prospect_name ?? 'Prospect'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.call_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
