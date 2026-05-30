import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DailyTasks } from '@/components/dashboard/daily-tasks'
import { DashboardProspectsWidget } from '@/components/dashboard/dashboard-prospects-widget'
import type { Prospect, PaymentToChase } from '@/lib/types'

const HONORED_STAGES: Prospect['pipeline_stage'][] = [
  'Proposition envoyée', 'Follow-up', 'Gagné', 'Perdu',
]

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const { monday, sunday } = getWeekBounds()
  const mondayStr = toDateStr(monday)
  const sundayStr = toDateStr(sunday)

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [
    { data: tasks },
    { data: clients },
    { data: prospects },
    { data: objective },
    { data: paymentsToChaseRaw },
    { data: upcomingPayments },
    { data: weekKpis },
  ] = await Promise.all([
    supabase.from('daily_tasks').select('*')
      .eq('infopreneur_id', user.id)
      .gte('generated_at', `${today}T00:00:00.000Z`)
      .lte('generated_at', `${today}T23:59:59.999Z`)
      .order('generated_at'),
    supabase.from('clients').select('id').eq('infopreneur_id', user.id),
    supabase.from('prospects').select('*').eq('infopreneur_id', user.id),
    supabase.from('objectives').select('*')
      .eq('infopreneur_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('payments')
      .select('id, amount, next_payment_date, clients(full_name, email, phone)')
      .eq('infopreneur_id', user.id)
      .lte('next_payment_date', today)
      .neq('status', 'paid')
      .order('next_payment_date', { ascending: true }),
    supabase.from('payments')
      .select('*, clients(full_name, id)')
      .eq('infopreneur_id', user.id)
      .eq('status', 'pending')
      .gte('next_payment_date', monthStart)
      .lte('next_payment_date', monthEnd)
      .order('next_payment_date', { ascending: true }),
    supabase.from('daily_kpis')
      .select('ca_collecte, ca_contracte, r1_showup, r1_noshow, r2_showup, r2_noshow, signe')
      .eq('infopreneur_id', user.id)
      .eq('role', 'closer')
      .gte('date', mondayStr)
      .lte('date', sundayStr),
  ])

  const upcomingList = upcomingPayments ?? []
  const upcomingTotal = upcomingList.reduce((s, p) => s + Number(p.amount), 0)
  const upcomingCount = upcomingList.length

  const allProspects = (prospects ?? []) as Prospect[]
  const paymentsToChase = (paymentsToChaseRaw ?? []) as unknown as PaymentToChase[]
  const overdueCount = paymentsToChase.length

  const prospectTotal = allProspects.length
  const prospectWon = allProspects.filter((p) => p.pipeline_stage === 'Gagné').length
  const prospectNoShows = allProspects.filter((p) => p.pipeline_stage === 'No show').length
  const prospectHonored = allProspects.filter((p) => HONORED_STAGES.includes(p.pipeline_stage)).length
  const closingRateFromProspects = prospectTotal > 0 ? Math.round((prospectWon / prospectTotal) * 100) : 0
  const showUpRateFromProspects = prospectHonored + prospectNoShows > 0
    ? Math.round((prospectHonored / (prospectHonored + prospectNoShows)) * 100)
    : 0

  // Weekly recap from daily_kpis (closers)
  const kpiList = weekKpis ?? []
  const caWeekFromKpis = kpiList.reduce((s, k) => s + Number(k.ca_collecte ?? 0), 0)
  const totalShowup = kpiList.reduce((s, k) => s + Number(k.r1_showup ?? 0) + Number(k.r2_showup ?? 0), 0)
  const totalAllCalls = kpiList.reduce((s, k) => s + Number(k.r1_showup ?? 0) + Number(k.r1_noshow ?? 0) + Number(k.r2_showup ?? 0) + Number(k.r2_noshow ?? 0), 0)
  const totalSigned = kpiList.reduce((s, k) => s + Number(k.signe ?? 0), 0)
  const showUpRateFromKpis = totalAllCalls > 0 ? Math.round((totalShowup / totalAllCalls) * 100) : 0
  const closingRateFromKpis = totalShowup > 0 ? Math.round((totalSigned / totalShowup) * 100) : 0

  // Prefer daily_kpis data when available, fallback to prospect-based calculations
  const hasKpiData = kpiList.length > 0
  const caWeek = hasKpiData ? caWeekFromKpis : (() => {
    const clientIds = clients?.map((c) => c.id) ?? []
    return 0 // fallback: no payment fetch needed since we use daily_kpis
  })()
  const closingRate = hasKpiData ? closingRateFromKpis : closingRateFromProspects
  const showUpRate = hasKpiData ? showUpRateFromKpis : showUpRateFromProspects

  const weeklyTarget = objective?.revenue_target
    ? Math.round(objective.revenue_target / 4)
    : 0

  const weekLabel = `Semaine du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className="p-6 space-y-6">
      <DashboardProspectsWidget
        infopreneurId={user.id}
        overdueCount={overdueCount}
        caWeek={caWeek}
        caTarget={weeklyTarget}
        closingRate={closingRate}
        closingRateTarget={objective?.closing_rate_target ?? 0}
        showUpRate={showUpRate}
        showUpRateTarget={objective?.show_up_rate_target ?? 0}
        weekLabel={weekLabel}
        upcomingTotal={upcomingTotal}
        upcomingCount={upcomingCount}
        upcomingPayments={upcomingPayments ?? []}
      >
        <DailyTasks tasks={tasks ?? []} userId={user.id} />
      </DashboardProspectsWidget>
    </div>
  )
}
