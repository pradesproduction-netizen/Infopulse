import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemberProfileHeader } from '@/components/equipe/member-profile-header'
import { MemberKpiCards } from '@/components/equipe/member-kpi-cards'
import { MemberPipeline } from '@/components/equipe/member-pipeline'
import { MemberCallsList } from '@/components/equipe/member-calls-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, TrendingUp, Target, Calendar, UserCheck, MessageSquare, Phone } from 'lucide-react'

interface PageProps {
  params: Promise<{ memberId: string }>
}

function PerformanceChart({ calls }: { calls: { call_date: string; status: string }[] }) {
  const now = new Date()
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (3 - i) * 7 - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const count = calls.filter((c) => { const d = new Date(c.call_date); return d >= weekStart && d <= weekEnd }).length
    const completed = calls.filter((c) => { const d = new Date(c.call_date); return d >= weekStart && d <= weekEnd && c.status === 'completed' }).length
    return { label: `S${i + 1}`, count, completed }
  })
  const max = Math.max(...weeks.map((w) => w.count), 1)

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-muted-foreground" />
          Performance sur 4 semaines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 h-36">
          {weeks.map((week) => (
            <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: '100px' }}>
                <div className="relative w-full flex flex-col justify-end" style={{ height: '100px' }}>
                  <div className="w-full rounded-t-md bg-violet-500/30 relative"
                    style={{ height: `${(week.count / max) * 100}%`, minHeight: week.count > 0 ? '4px' : '0' }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-violet-500"
                      style={{ height: week.count > 0 ? `${(week.completed / week.count) * 100}%` : '0' }} />
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{week.label}</span>
              <span className="text-xs font-semibold">{week.count}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-violet-500 inline-block" />Complétés</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-violet-500/30 inline-block" />Total</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface KpiStatProps { label: string; value: string; sub: string; icon: React.ElementType; color: string }

function KpiStat({ label, value, sub, icon: Icon, color }: KpiStatProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/10">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function CloserDailyStats({ kpis }: {
  kpis: { r1_showup: number; r1_noshow: number; r2_showup: number; r2_noshow: number; signe: number; ca_contracte: number }[]
}) {
  const totalShowup = kpis.reduce((s, k) => s + k.r1_showup + k.r2_showup, 0)
  const totalCalls = kpis.reduce((s, k) => s + k.r1_showup + k.r1_noshow + k.r2_showup + k.r2_noshow, 0)
  const totalSigned = kpis.reduce((s, k) => s + k.signe, 0)
  const caContracte = kpis.reduce((s, k) => s + Number(k.ca_contracte), 0)
  const showUpRate = totalCalls > 0 ? Math.round((totalShowup / totalCalls) * 100) : 0
  const closingRate = totalCalls > 0 ? Math.round((totalSigned / totalCalls) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiStat label="Appels ce mois" value={String(totalCalls)} sub={`${totalShowup} show-ups`} icon={Calendar} color="bg-blue-500" />
      <KpiStat label="Show-up rate" value={`${showUpRate}%`} sub={`${totalCalls - totalShowup} no-shows`} icon={UserCheck} color="bg-sky-500" />
      <KpiStat label="Taux closing" value={`${closingRate}%`} sub={`${totalSigned} signé${totalSigned !== 1 ? 's' : ''}`} icon={Target} color="bg-green-600" />
      <KpiStat label="CA contracté" value={`${caContracte.toLocaleString('fr-FR')} €`} sub="Ce mois" icon={TrendingUp} color="bg-violet-500" />
    </div>
  )
}

function SetterDailyStats({ kpis }: {
  kpis: { messages_envoyes: number; reponses_recues: number; followup: number; calls_bookes: number }[]
}) {
  const totalMessages = kpis.reduce((s, k) => s + k.messages_envoyes, 0)
  const totalReplies = kpis.reduce((s, k) => s + k.reponses_recues, 0)
  const totalFollowups = kpis.reduce((s, k) => s + k.followup, 0)
  const totalCallsBooked = kpis.reduce((s, k) => s + k.calls_bookes, 0)
  const replyRate = totalMessages > 0 ? Math.round((totalReplies / totalMessages) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiStat label="Messages envoyés" value={String(totalMessages)} sub="Ce mois" icon={MessageSquare} color="bg-blue-500" />
      <KpiStat label="Calls bookés" value={String(totalCallsBooked)} sub="Ce mois" icon={Phone} color="bg-violet-500" />
      <KpiStat label="Taux de réponse" value={`${replyRate}%`} sub={`${totalReplies} réponses`} icon={UserCheck} color="bg-green-600" />
      <KpiStat label="Follow-ups" value={String(totalFollowups)} sub="Ce mois" icon={TrendingUp} color="bg-sky-500" />
    </div>
  )
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { memberId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [{ data: member }, { data: calls }, { data: prospects }, { data: monthKpis }] = await Promise.all([
    supabase.from('team_members').select('*').eq('id', memberId).eq('infopreneur_id', user.id).single(),
    supabase.from('calls').select('*').eq('team_member_id', memberId).eq('infopreneur_id', user.id).order('call_date', { ascending: false }),
    supabase.from('prospects').select('*').eq('infopreneur_id', user.id).eq('team_member_id', memberId),
    supabase.from('daily_kpis').select('*').eq('team_member_id', memberId).gte('date', monthStart).lte('date', monthEnd),
  ])

  if (!member) notFound()

  const kpis = monthKpis ?? []
  const hasKpis = kpis.length > 0

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <MemberProfileHeader member={member} />

      {hasKpis && (
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              Performances du mois (daily KPIs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {member.role === 'closer' ? (
              <CloserDailyStats kpis={kpis as Parameters<typeof CloserDailyStats>[0]['kpis']} />
            ) : (
              <SetterDailyStats kpis={kpis as Parameters<typeof SetterDailyStats>[0]['kpis']} />
            )}
          </CardContent>
        </Card>
      )}

      <MemberKpiCards initialProspects={prospects ?? []} teamMemberId={memberId} />
      <PerformanceChart calls={(calls ?? []).map((c) => ({ call_date: c.call_date, status: c.status }))} />
      <MemberPipeline prospects={prospects ?? []} memberId={memberId} />
      <MemberCallsList calls={calls ?? []} />
    </div>
  )
}
