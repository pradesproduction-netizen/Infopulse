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
import { ChevronDown, Pencil } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" strokeWidth="0" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function socialHref(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}
import type { Client } from '@/lib/types'
import { EditClientModal } from './edit-client-modal'
import { DeleteClientButton } from './delete-client-button'
import { InviteClientButton } from './invite-client-button'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  onboarding: { label: 'Onboarding', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  actif:      { label: 'Actif',      className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  termine:    { label: 'Terminé',    className: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
  en_pause:   { label: 'En pause',   className: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
}

interface ClientHeaderProps {
  client: Client
  totalAmount: number
  progressionPct: number
  programName: string | null
}

export function ClientHeader({ client, totalAmount, progressionPct, programName }: ClientHeaderProps) {
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
    ? `client depuis le ${new Date(client.start_date).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })}`
    : null

  const subtitle = [programName, sinceLabel].filter(Boolean).join(' · ')

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
      <div className="rounded-xl border border-white/10 bg-card/60 px-6 py-5">
        <div className="flex items-center gap-5 flex-wrap">

          {/* Avatar */}
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md shadow-violet-500/25 ring-2 ring-violet-500/20">
            {initials}
          </div>

          {/* Name + status + subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold leading-tight">{client.full_name}</h1>

              {client.instagram_url && (
                <a
                  href={socialHref(client.instagram_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-6 w-6 flex items-center justify-center rounded text-pink-400 hover:text-pink-300 hover:bg-pink-500/15 transition-colors"
                  title="Instagram"
                  onClick={(e) => e.stopPropagation()}
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {client.linkedin_url && (
                <a
                  href={socialHref(client.linkedin_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-6 w-6 flex items-center justify-center rounded text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 transition-colors"
                  title="LinkedIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={statusLoading}>
                  <button className="focus:outline-none">
                    <Badge
                      variant="outline"
                      className={cn(
                        statusConfig[status].className,
                        'cursor-pointer hover:opacity-75 transition-opacity gap-1 pr-1.5 select-none'
                      )}
                    >
                      {statusConfig[status].label}
                      <ChevronDown className="h-3 w-3 opacity-70" />
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[150px]">
                  <DropdownMenuItem onClick={() => handleStatusChange('onboarding')}>
                    🟡 Onboarding
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('actif')}>
                    🟢 Actif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('en_pause')}>
                    🟠 En pause
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('termine')}>
                    ⚪ Terminé
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
          </div>

          {/* KPIs */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Montant total</p>
              <p className="text-xl font-bold text-white">
                {totalAmount > 0 ? `${totalAmount.toLocaleString('fr-FR')} €` : '— €'}
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-0.5">Progression</p>
              <p className={cn('text-xl font-bold', progressionPct === 100 ? 'text-green-400' : 'text-white')}>
                {progressionPct} %
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 border-l border-white/10 pl-5">
            <InviteClientButton clientId={client.id} clientEmail={client.email} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white"
              onClick={() => setEditOpen(true)}
              title="Modifier"
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
