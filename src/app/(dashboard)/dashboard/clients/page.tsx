import { createClient } from '@/lib/supabase/server'
import { ClientsList } from '@/components/dashboard/clients-list'
import { NewClientButton } from '@/components/dashboard/new-client-button'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('infopreneur_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients?.length ?? 0} client{(clients?.length ?? 0) !== 1 ? 's' : ''} dans ton portefeuille
          </p>
        </div>
        <NewClientButton />
      </div>
      <ClientsList clients={clients ?? []} />
    </div>
  )
}
