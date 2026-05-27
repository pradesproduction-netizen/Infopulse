import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ClientHeader } from '@/components/clients/client-header'
import { ClientTabs } from '@/components/clients/client-tabs'
import type { ClientProgram, Program } from '@/lib/types'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: client },
    { data: coachingSteps },
    { data: payments },
    { data: contracts },
    { data: calls },
    { data: clientPrograms },
    { data: programs },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('coaching_steps').select('*').eq('client_id', id).order('order'),
    supabase.from('payments').select('*').eq('client_id', id).order('payment_date'),
    supabase.from('contracts').select('*').eq('client_id', id),
    supabase.from('calls').select('*').eq('client_id', id),
    supabase.from('client_programs').select('*, program:programs(*)').eq('client_id', id).order('created_at'),
    supabase.from('programs').select('*').eq('infopreneur_id', user.id).order('name'),
  ])

  if (!client) notFound()
  if (client.infopreneur_id !== user.id) redirect('/dashboard/clients')

  const caGenere = (payments ?? [])
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0)

  const steps = coachingSteps ?? []
  const progressionPct = steps.length > 0
    ? Math.round((steps.filter((s) => s.status === 'completed').length / steps.length) * 100)
    : 0

  const typedClientPrograms = (clientPrograms ?? []) as ClientProgram[]
  const programName = typedClientPrograms[0]?.program?.name ?? client.program_name ?? null

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Tous les clients
      </Link>
      <ClientHeader
        client={client}
        caGenere={caGenere}
        progressionPct={progressionPct}
        programName={programName}
      />
      <ClientTabs
        client={client}
        coachingSteps={steps}
        payments={payments ?? []}
        contracts={contracts ?? []}
        calls={calls ?? []}
        clientPrograms={typedClientPrograms}
        availablePrograms={(programs ?? []) as Program[]}
      />
    </div>
  )
}
