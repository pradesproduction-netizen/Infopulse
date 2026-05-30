import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClientsList } from '@/components/dashboard/clients-list'
import { NewClientButton } from '@/components/dashboard/new-client-button'
import { PaymentLinks } from '@/components/clients/payment-links'
import { Bell, X } from 'lucide-react'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>
}) {
  const { filtre } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('infopreneur_id', user.id)
    .order('created_at', { ascending: false })

  const allClients = clients ?? []
  const isOverdueFilter = filtre === 'retard'

  let displayClients = allClients
  const overdueAmounts: Record<string, number> = {}

  if (isOverdueFilter && allClients.length > 0) {
    const clientIds = allClients.map((c) => c.id)
    const { data: overduePayments } = await supabase
      .from('payments')
      .select('client_id, amount')
      .in('client_id', clientIds)
      .eq('status', 'a_relancer')

    for (const p of overduePayments ?? []) {
      overdueAmounts[p.client_id] = (overdueAmounts[p.client_id] ?? 0) + Number(p.amount)
    }
    displayClients = allClients.filter((c) => overdueAmounts[c.id] != null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {allClients.length} client{allClients.length !== 1 ? 's' : ''} dans ton portefeuille
          </p>
        </div>
        <NewClientButton />
      </div>

      {isOverdueFilter && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <Bell className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm flex-1">
            <span className="font-semibold text-red-300">{displayClients.length} client{displayClients.length !== 1 ? 's' : ''}</span>
            {' '}avec des paiements en retard
          </p>
          <Link
            href="/dashboard/clients"
            className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Effacer le filtre
          </Link>
        </div>
      )}

      <PaymentLinks infopreneurId={user.id} />
      <ClientsList clients={displayClients} overdueAmounts={isOverdueFilter ? overdueAmounts : {}} />
    </div>
  )
}
