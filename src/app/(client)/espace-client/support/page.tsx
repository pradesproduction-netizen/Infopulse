import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SupportClient } from '@/components/espace-client/support-client'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('infopreneur_id')
    .eq('client_user_id', user.id)
    .single()

  if (!client) redirect('/login')

  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', client.infopreneur_id)
    .single()

  const coachName =
    [coachProfile?.first_name, coachProfile?.last_name].filter(Boolean).join(' ') ||
    'Votre coach'

  return (
    <SupportClient
      coachName={coachName}
      coachEmail={coachProfile?.email ?? null}
    />
  )
}
