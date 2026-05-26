'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react'
import type { Client } from '@/lib/types'
import { EditClientModal } from './edit-client-modal'
import { DeleteClientButton } from './delete-client-button'
import { InviteClientButton } from './invite-client-button'

const statusConfig = {
  onboarding: { label: 'Onboarding', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  actif: { label: 'Actif', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  termine: { label: 'Terminé', className: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
}

export function ClientHeader({ client }: { client: Client }) {
  const [editOpen, setEditOpen] = useState(false)

  const initials = client.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const status = statusConfig[client.status]

  return (
    <>
      <div className="flex items-start gap-6 flex-wrap">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg shadow-violet-500/20">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{client.full_name}</h1>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {client.email}
            </span>
            {client.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {client.phone}
              </span>
            )}
            {client.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {client.company}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InviteClientButton clientId={client.id} clientEmail={client.email} />
          <Button
            variant="outline"
            size="icon"
            className="border-white/10 hover:border-violet-500/40"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteClientButton clientId={client.id} clientName={client.full_name} />
        </div>
      </div>

      <EditClientModal
        client={client}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
