import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DailyTasks } from '@/components/dashboard/daily-tasks'
import { DashboardProspectsWidget } from '@/components/dashboard/dashboard-prospects-widget'
import type { Prospect } from '@/lib/types'

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const in7Days = new Date(now.getTime() + 7 * 86400 * 1000).toISOString().split('T')[0]
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
  const { monday, sunday } = getWeekBounds()
  const mondayStr = monday.toISOString().split('T')[0]
  const sundayStr = sunday.toISOString().split('T')[0]

  const [
    { data: tasks },
    { data: clients },
    { data: prospects },
    { data: objective },
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
  ])

  const clientIds = clients?.map((c) => c.id) ?? []
  const { data: payments } = clientIds.length > 0
    ? await supabase.from('payments').select('amount, status, payment_date').in('client_id', clientIds)
    : { data: [] as { amount: number; status: string; payment_date: string }[] }

  const allPayments = payments ?? []
  const allProspects = (prospects ?? []) as Prospect[]

  // Static values for WeeklyRecap (not realtime — computed once at render)
  const prospectTotal = allProspects.length
  const prospectWon = allProspects.filter((p) => p.pipeline_stage === 'Gagné').length
  const prospectNoShows = allProspects.filter((p) => p.pipeline_stage === 'No show').length
  const prospectHonored = allProspects.filter((p) => HONORED_STAGES.includes(p.pipeline_stage)).length
  const closingRate = prospectTotal > 0 ? Math.round((prospectWon / prospectTotal) * 100) : 0
  const showUpRate = prospectHonored + prospectNoShows > 0
    ? Math.round((prospectHonored / (prospectHonored + prospectNoShows)) * 100)
    : 0

  const upcomingPaymentsTotal = allPayments
    .filter((p) => p.status === 'pending' && p.payment_date >= today && p.payment_date <= in7Days)
    .reduce((s, p) => s + p.amount, 0)

  const overdueCount = allPayments.filter((p) => p.status === 'overdue').length

  const caWeek = allPayments
    .filter((p) => p.status === 'paid' && p.payment_date >= mondayStr && p.payment_date <= sundayStr)
    .reduce((s, p) => s + p.amount, 0)

  const weeklyTarget = objective?.revenue_target
    ? Math.round(objective.revenue_target / 4)
    : 0

  const weekLabel = `Semaine du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className="p-6 space-y-6">
      <DashboardProspectsWidget
        infopreneurId={user.id}
        upcomingPaymentsTotal={upcomingPaymentsTotal}
        overdueCount={overdueCount}
        caWeek={caWeek}
        caTarget={weeklyTarget}
        closingRate={closingRate}
        closingRateTarget={objective?.closing_rate_target ?? 0}
        showUpRate={showUpRate}
        showUpRateTarget={objective?.show_up_rate_target ?? 0}
        weekLabel={weekLabel}
      >
        <DailyTasks tasks={tasks ?? []} userId={user.id} />
      </DashboardProspectsWidget>
    </div>
  )
}
