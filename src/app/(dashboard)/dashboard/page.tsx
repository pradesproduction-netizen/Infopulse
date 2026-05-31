import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardProspectsWidget } from '@/components/dashboard/dashboard-prospects-widget'
import type { PaymentToChase } from '@/lib/types'

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
    { data: objective },
    { data: paymentsToChaseRaw },
    { data: upcomingPayments },
    { data: weekKpis },
  ] = await Promise.all([
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
      .select('ca_contracte, ca_collecte, signe, r1_showup, r2_showup')
      .eq('infopreneur_id', user.id)
      .eq('role', 'closer')
      .gte('date', mondayStr)
      .lte('date', sundayStr),
  ])

  const upcomingList = upcomingPayments ?? []
  const upcomingTotal = upcomingList.reduce((s, p) => s + Number(p.amount), 0)
  const upcomingCount = upcomingList.length

  const paymentsToChase = (paymentsToChaseRaw ?? []) as unknown as PaymentToChase[]
  const overdueCount = paymentsToChase.length

  // Weekly KPI totals from daily_kpis (closers)
  const kpiList = weekKpis ?? []
  const caContracte = kpiList.reduce((s, k) => s + Number(k.ca_contracte ?? 0), 0)
  const caCollecte = kpiList.reduce((s, k) => s + Number(k.ca_collecte ?? 0), 0)
  const totalShowup = kpiList.reduce((s, k) => s + Number(k.r1_showup ?? 0) + Number(k.r2_showup ?? 0), 0)
  const totalSigned = kpiList.reduce((s, k) => s + Number(k.signe ?? 0), 0)
  const closingRate = totalShowup > 0 ? Math.round((totalSigned / totalShowup) * 100) : 0

  const caContracteTarget = objective?.ca_contracte_target ?? 0
  const caCollecteTarget = objective?.ca_collecte_target ?? 0

  const weekLabel = `Semaine du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`

  return (
    <div className="p-6 space-y-6">
      <DashboardProspectsWidget
        infopreneurId={user.id}
        overdueCount={overdueCount}
        caContracte={caContracte}
        caContracteTarget={caContracteTarget}
        caCollecte={caCollecte}
        caCollecteTarget={caCollecteTarget}
        closingRate={closingRate}
        closingRateTarget={objective?.closing_rate_target ?? 0}
        weekLabel={weekLabel}
        upcomingTotal={upcomingTotal}
        upcomingCount={upcomingCount}
        upcomingPayments={upcomingPayments ?? []}
      />
    </div>
  )
}
