import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccueilClient } from '@/components/espace-client/accueil-client'

export default async function EspaceClientPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('client_user_id', user.id)
    .single()

  if (!client) redirect('/login')

  const [{ data: coachProfile }, { data: coachingSteps }, { data: calls }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name').eq('id', client.infopreneur_id).single(),
    supabase.from('coaching_steps').select('*').eq('client_id', client.id).order('order'),
    supabase
      .from('calls')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'scheduled')
      .gte('date', new Date().toISOString())
      .order('date')
      .limit(1),
  ])

  const nextCall = calls?.[0] ?? null

  return (
    <AccueilClient
      client={client}
      coachProfile={coachProfile ?? null}
      coachingSteps={coachingSteps ?? []}
      nextCall={nextCall}
    />
  )
}
