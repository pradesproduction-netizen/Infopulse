import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { DailyTasks } from '@/components/dashboard/daily-tasks'
import { WeeklyRecap } from '@/components/dashboard/weekly-recap'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const { data: tasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('infopreneur_id', user.id)
    .gte('generated_at', `${today}T00:00:00.000Z`)
    .lte('generated_at', `${today}T23:59:59.999Z`)
    .order('generated_at')

  return (
    <div className="p-6 space-y-6">
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTasks tasks={tasks ?? []} userId={user.id} />
        <WeeklyRecap />
      </div>
    </div>
  )
}
