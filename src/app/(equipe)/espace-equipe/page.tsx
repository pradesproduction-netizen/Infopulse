import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { findTeamMemberOrNull } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { DailyKpiCalendar } from '@/components/equipe/daily-kpi-calendar'
import { AutoRefresh } from '@/components/ui/auto-refresh'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart2, MessageSquare, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DailyKpi, TeamMember } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ member?: string }>
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

function KpiTile({ label, value, accent, sub }: { label: string; value: string | number; accent?: string; sub?: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center">
      <p className={cn('text-lg font-bold', accent ?? '')}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/50 mt-0.5">{sub}</p>}
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
  const tauxRep = totalMessages > 0 ? Math.round((totalReplies / totalMessages) * 100) : 0
  const tauxRepAccent = tauxRep >= 50 ? 'text-green-400' : tauxRep >= 30 ? 'text-orange-400' : 'text-red-400'
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiTile label="Messages" value={totalMessages} />
      <KpiTile label="Taux de réponses" value={`${tauxRep}%`} accent={tauxRepAccent} sub={`${totalReplies} rép. / ${totalMessages} msg`} />
      <KpiTile label="Follow-ups" value={totalFollowups} />
      <KpiTile label="Calls bookés" value={totalCallsBooked} />
    </div>
  )
}

function CloserMonthKpis({ kpis }: { kpis: DailyKpi[] }) {
  const r1Showup = kpis.reduce((s, k) => s + k.r1_showup, 0)
  const r1Noshow = kpis.reduce((s, k) => s + k.r1_noshow, 0)
  const r2Showup = kpis.reduce((s, k) => s + k.r2_showup, 0)
  const r2Noshow = kpis.reduce((s, k) => s + k.r2_noshow, 0)
  const signe = kpis.reduce((s, k) => s + k.signe, 0)
  const caContracte = kpis.reduce((s, k) => s + Number(k.ca_contracte), 0)
  const caCollecte = kpis.reduce((s, k) => s + Number(k.ca_collecte), 0)
  const totalShowup = r1Showup + r2Showup
  const tauxClosing = totalShowup > 0 ? Math.round((signe / totalShowup) * 100) : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiTile label="R1 Show-up" value={r1Showup} />
      <KpiTile label="R1 No-show" value={r1Noshow} />
      <KpiTile label="R2 Show-up" value={r2Showup} />
      <KpiTile label="R2 No-show" value={r2Noshow} />
      <KpiTile label="Signés" value={signe} accent="text-green-400" />
      <KpiTile label="CA contracté" value={caContracte > 0 ? `${caContracte.toLocaleString('fr-FR')} €` : '0 €'} accent="text-violet-400" />
      <KpiTile label="CA collecté" value={caCollecte > 0 ? `${caCollecte.toLocaleString('fr-FR')} €` : '0 €'} accent="text-emerald-400" />
      <KpiTile label="Taux de closing" value={`${tauxClosing}%`} accent={tauxClosing >= 30 ? 'text-green-400' : 'text-orange-400'} />
    </div>
  )
}

function ColorCard({
  label,
  value,
  bg,
  border,
  text,
  sub,
}: {
  label: string
  value: string | number
  bg: string
  border: string
  text: string
  sub?: string
}) {
  return (
    <div className={cn('rounded-xl p-4 text-center border', bg, border)}>
      <p className={cn('text-2xl font-bold', text)}>{value}</p>
      <p className={cn('text-xs mt-1 opacity-75', text)}>{label}</p>
      {sub && <p className={cn('text-xs mt-0.5 opacity-50', text)}>{sub}</p>}
    </div>
  )
}

function SetterTodayCards({ kpi }: { kpi: DailyKpi | null }) {
  const k = kpi ?? {} as Partial<DailyKpi>
  const messages = k.messages_envoyes ?? 0
  const reponses = k.reponses_recues ?? 0
  const tauxRep = messages > 0 ? Math.round((reponses / messages) * 100) : 0
  const tauxRepColor = tauxRep >= 50
    ? { bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-300' }
    : tauxRep >= 30
    ? { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-300' }
    : { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-300' }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <ColorCard label="Messages envoyés" value={messages} bg="bg-blue-500/15" border="border-blue-500/30" text="text-blue-300" />
      <ColorCard
        label="Taux de réponses"
        value={`${tauxRep}%`}
        sub={`${reponses} rép. / ${messages} msg`}
        bg={tauxRepColor.bg}
        border={tauxRepColor.border}
        text={tauxRepColor.text}
      />
      <ColorCard label="Calls bookés" value={k.calls_bookes ?? 0} bg="bg-violet-500/15" border="border-violet-500/30" text="text-violet-300" />
      <ColorCard label="Follow-up" value={k.followup ?? 0} bg="bg-orange-500/15" border="border-orange-500/30" text="text-orange-300" />
    </div>
  )
}

function CloserTodayCards({ kpi }: { kpi: DailyKpi | null }) {
  const k = kpi ?? {} as Partial<DailyKpi>
  const r1Showup = k.r1_showup ?? 0
  const r1Noshow = k.r1_noshow ?? 0
  const r2Showup = k.r2_showup ?? 0
  const r2Noshow = k.r2_noshow ?? 0
  const signe = k.signe ?? 0
  const caContracte = Number(k.ca_contracte ?? 0)
  const caCollecte = Number(k.ca_collecte ?? 0)
  const totalShowup = r1Showup + r2Showup
  const tauxClosing = totalShowup > 0 ? Math.round((signe / totalShowup) * 100) : 0
  const closingGood = tauxClosing >= 30

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <ColorCard label="R1 Show-up" value={r1Showup} bg="bg-green-500/15" border="border-green-500/30" text="text-green-300" />
      <ColorCard label="R1 No-show" value={r1Noshow} bg="bg-red-500/15" border="border-red-500/30" text="text-red-300" />
      <ColorCard label="R2 Show-up" value={r2Showup} bg="bg-green-500/15" border="border-green-500/30" text="text-green-300" />
      <ColorCard label="R2 No-show" value={r2Noshow} bg="bg-red-500/15" border="border-red-500/30" text="text-red-300" />
      <ColorCard label="Signés" value={signe} bg="bg-violet-500/15" border="border-violet-500/30" text="text-violet-300" />
      <ColorCard label="CA contracté" value={caContracte > 0 ? `${caContracte.toLocaleString('fr-FR')} €` : '0 €'} bg="bg-blue-500/15" border="border-blue-500/30" text="text-blue-300" />
      <ColorCard label="CA collecté" value={caCollecte > 0 ? `${caCollecte.toLocaleString('fr-FR')} €` : '0 €'} bg="bg-emerald-500/15" border="border-emerald-500/30" text="text-emerald-300" />
      <ColorCard
        label="Taux de closing"
        value={`${tauxClosing}%`}
        bg={closingGood ? 'bg-green-500/15' : 'bg-orange-500/15'}
        border={closingGood ? 'border-green-500/30' : 'border-orange-500/30'}
        text={closingGood ? 'text-green-300' : 'text-orange-300'}
      />
    </div>
  )
}

function SetterMonthKpis({ kpis }: { kpis: DailyKpi[] }) {
  const messages = kpis.reduce((s, k) => s + k.messages_envoyes, 0)
  const reponses = kpis.reduce((s, k) => s + k.reponses_recues, 0)
  const callsBookes = kpis.reduce((s, k) => s + k.calls_bookes, 0)
  const followup = kpis.reduce((s, k) => s + k.followup, 0)
  const tauxRep = messages > 0 ? Math.round((reponses / messages) * 100) : 0
  const tauxRepAccent = tauxRep >= 50 ? 'text-green-400' : tauxRep >= 30 ? 'text-orange-400' : 'text-red-400'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <KpiTile label="Messages envoyés" value={messages} />
      <KpiTile label="Taux de réponses" value={`${tauxRep}%`} accent={tauxRepAccent} sub={`${reponses} rép. / ${messages} msg`} />
      <KpiTile label="Calls bookés" value={callsBookes} accent="text-violet-400" />
      <KpiTile label="Follow-up" value={followup} />
    </div>
  )
}

export default async function EspaceEquipePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { member: memberIdParam } = await searchParams
  const admin = createAdminClient()

  // Guard: infopreneurs are redirected to their dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role === 'infopreneur') {
    redirect('/dashboard')
  }

  // --- Résolution de l'identité ---
  // 1. Cherche le membre lié AU compte connecté (priorité absolue)
  const ownMember = await findTeamMemberOrNull(user.id, user.email ?? '')

  let member: TeamMember | null = ownMember
  let isReadOnly = false

  // 2. Si ?member param ET l'utilisateur connecté n'est PAS ce membre
  //    → vérifier si c'est l'infopreneur (vue lecture seule)
  if (memberIdParam && (!ownMember || ownMember.id !== memberIdParam)) {
    const { data: targetMember } = await admin
      .from('team_members')
      .select('*')
      .eq('id', memberIdParam)
      .maybeSingle()

    if (targetMember && targetMember.infopreneur_id === user.id) {
      member = targetMember as TeamMember
      isReadOnly = true
    } else if (!ownMember) {
      redirect('/login')
    }
  }

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

  const now = new Date()
  const today = toDateStr(now)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const { monday, sunday } = getWeekBounds()
  const mondayStr = toDateStr(monday)
  const sundayStr = toDateStr(sunday)

  const [{ data: monthKpisRaw }, { data: weekKpis }] = await Promise.all([
    admin.from('daily_kpis').select('*').eq('team_member_id', member.id).gte('date', monthStart).lte('date', monthEnd),
    admin.from('daily_kpis').select('*').eq('team_member_id', member.id).gte('date', mondayStr).lte('date', sundayStr),
  ])

  const monthKpiList = (monthKpisRaw ?? []) as DailyKpi[]
  const filledDates = monthKpiList.map((k) => k.date)
  const todayFilled = filledDates.includes(today)
  const todayKpi = monthKpiList.find((k) => k.date === today) ?? null
  const weekKpiList = (weekKpis ?? []) as DailyKpi[]
  const hasWeekData = weekKpiList.length > 0
  const hasMonthData = monthKpiList.length > 0

  const firstName = member.full_name.split(' ')[0]
  const role = member.role as 'closer' | 'setter'

  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const weekLabel = `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <AutoRefresh ms={30000} />

      {/* Bandeau lecture seule pour l'infopreneur */}
      {isReadOnly && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 flex items-center gap-2 text-sm text-blue-300">
          <BarChart2 className="h-4 w-4 flex-shrink-0" />
          Vous consultez les KPI de{' '}
          <span className="font-semibold">{member.full_name}</span>
          <span className="text-blue-300/60 ml-1">(lecture seule)</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
          <h1 className="text-2xl font-bold mt-1">
            {isReadOnly ? `KPI de ${firstName}` : `Bonjour ${firstName} 👋`}
          </h1>
          {!isReadOnly && (
            <p className="text-muted-foreground text-sm mt-1">Voici un aperçu de tes performances.</p>
          )}
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

      {/* Calendrier mensuel — lecture seule si infopreneur */}
      <DailyKpiCalendar
        teamMemberId={member.id}
        role={role}
        initialFilledDates={filledDates}
        readOnly={isReadOnly}
      />

      {/* KPI du mois */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {role === 'closer'
              ? <TrendingUp className="h-5 w-5 text-violet-400" />
              : <MessageSquare className="h-5 w-5 text-blue-400" />}
            KPI du mois
            <span className="text-xs font-normal text-muted-foreground ml-1 capitalize">{monthLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasMonthData ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isReadOnly
                ? 'Aucune donnée ce mois-ci.'
                : 'Aucune donnée ce mois-ci — remplis tes KPI du jour depuis le calendrier.'}
            </p>
          ) : role === 'closer' ? (
            <CloserMonthKpis kpis={monthKpiList} />
          ) : (
            <SetterMonthKpis kpis={monthKpiList} />
          )}
        </CardContent>
      </Card>

      {/* Résumé semaine en cours */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {role === 'closer'
              ? <TrendingUp className="h-5 w-5 text-violet-400" />
              : <MessageSquare className="h-5 w-5 text-blue-400" />}
            KPI de la semaine
            <span className="text-xs font-normal text-muted-foreground ml-1">{weekLabel}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasWeekData ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isReadOnly
                ? 'Aucune donnée cette semaine.'
                : 'Aucune donnée cette semaine — remplis tes KPI du jour depuis le calendrier.'}
            </p>
          ) : role === 'closer' ? (
            <CloserWeekSummary kpis={weekKpiList} />
          ) : (
            <SetterWeekSummary kpis={weekKpiList} />
          )}
        </CardContent>
      </Card>

      {/* KPI du jour */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            KPI du jour
            <span className="text-xs font-normal text-muted-foreground ml-1 capitalize">{dateStr}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {role === 'closer' ? (
            <CloserTodayCards kpi={todayKpi} />
          ) : (
            <SetterTodayCards kpi={todayKpi} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
