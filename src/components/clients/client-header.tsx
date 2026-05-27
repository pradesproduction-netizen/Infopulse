'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Euro, TrendingUp, Pencil, Trash2 } from 'lucide-react'
import type { Client } from '@/lib/types'
import { EditClientModal } from './edit-client-modal'
import { DeleteClientButton } from './delete-client-button'
import { InviteClientButton } from './invite-client-button'
import { cn } from '@/lib/utils'

const statusConfig = {
  onboarding: { label: 'Onboarding', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  actif: { label: 'Actif', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  termine: { label: 'Terminé', className: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
}

interface ClientHeaderProps {
  client: Client
  caGenere: number
  progressionPct: number
  programName: string | null
}

export function ClientHeader({ client, caGenere, progressionPct, programName }: ClientHeaderProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [status, setStatus] = useState<Client['status']>(client.status)
  const [statusLoading, setStatusLoading] = useState(false)

  const initials = client.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sinceLabel = client.start_date
    ? `client depuis le ${new Date(client.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : null

  async function handleStatusChange(next: Client['status']) {
    setStatusLoading(true)
    setStatus(next)
    const supabase = createClient()
    await supabase.from('clients').update({ status: next }).eq('id', client.id)
    setStatusLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-start gap-5 flex-wrap">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg shadow-violet-500/20">
          {initials}
        </div>

        {/* Name + status + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{client.full_name}</h1>

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={statusLoading}>
                <button className="focus:outline-none">
                  <Badge
                    variant="outline"
                    className={cn(
                      statusConfig[status].className,
                      'cursor-pointer hover:opacity-80 transition-opacity gap-1 pr-1.5'
                    )}
                  >
                    {statusConfig[status].label}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleStatusChange('onboarding')}>
                  🟡 Onboarding
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('actif')}>
                  🟢 Actif
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('termine')}>
                  ⚪ Terminé
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {[programName, sinceLabel].filter(Boolean).join(' · ') || 'Aucun programme'}
          </p>
        </div>

        {/* KPIs + actions */}
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center min-w-[90px]">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
                <Euro className="h-3 w-3" />
                CA généré
              </p>
              <p className="text-lg font-bold text-violet-300">
                {caGenere > 0 ? `${caGenere.toLocaleString('fr-FR')} €` : '— €'}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center min-w-[90px]">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-0.5">
                <TrendingUp className="h-3 w-3" />
                Progression
              </p>
              <p className="text-lg font-bold text-violet-300">{progressionPct} %</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <InviteClientButton clientId={client.id} clientEmail={client.email} />
            <Button
              variant="outline"
              size="icon"
              className="border-white/10 hover:border-violet-500/40 h-8 w-8"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <DeleteClientButton clientId={client.id} clientName={client.full_name} />
          </div>
        </div>
      </div>

      <EditClientModal client={client} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}
