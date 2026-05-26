import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgressionTimeline } from '@/components/espace-client/progression-timeline'

export default async function ProgressionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('client_user_id', user.id)
    .single()

  if (!client) redirect('/login')

  const { data: coachingSteps } = await supabase
    .from('coaching_steps')
    .select('*')
    .eq('client_id', client.id)
    .order('order')

  const steps = coachingSteps ?? []
  const completedSteps = steps.filter((s) => s.status === 'completed').length
  const progressPct = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0

  return <ProgressionTimeline steps={steps} progressPct={progressPct} />
}
