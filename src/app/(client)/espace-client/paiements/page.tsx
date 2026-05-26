import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PaiementsClient } from '@/components/espace-client/paiements-client'

export default async function PaiementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('client_user_id', user.id)
    .single()

  if (!client) redirect('/login')

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', client.id)
    .order('payment_date', { ascending: true })

  return <PaiementsClient payments={payments ?? []} client={client} />
}
