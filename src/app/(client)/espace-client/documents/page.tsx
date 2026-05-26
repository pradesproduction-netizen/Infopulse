import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DocumentsClient } from '@/components/espace-client/documents-client'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('client_user_id', user.id)
    .single()

  if (!client) redirect('/login')

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return <DocumentsClient contracts={contracts ?? []} />
}
