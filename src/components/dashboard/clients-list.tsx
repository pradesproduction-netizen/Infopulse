'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Phone, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  status: 'onboarding' | 'actif' | 'termine' | 'en_pause'
  start_date: string | null
  total_amount: number | null
  program_name: string | null
}

interface ClientsListProps {
  clients: Client[]
  overdueAmounts?: Record<string, number>
}

const statusConfig: Record<string, { label: string; color: string }> = {
  onboarding: { label: 'Onboarding', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  actif:      { label: 'Actif',      color: 'bg-green-500/10 text-green-300 border-green-500/30' },
  termine:    { label: 'Terminé',    color: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
  en_pause:   { label: 'En pause',   color: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
}

export function ClientsList({ clients, overdueAmounts = {} }: ClientsListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.full_name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // État vide
  if (clients.length === 0) {
    return (
      <Card className="border-white/10 bg-card/50 p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="h-14 w-14 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Aucun client pour l&apos;instant
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Ajoute ton premier client pour commencer à suivre sa progression, ses paiements et ses contrats.
          </p>
          <p className="text-xs text-muted-foreground">
            Clique sur le bouton <span className="text-violet-300">+ Nouveau client</span> en haut à droite.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'onboarding', label: 'Onboarding' },
            { value: 'actif', label: 'Actif' },
            { value: 'en_pause', label: 'En pause' },
            { value: 'termine', label: 'Terminé' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                statusFilter === tab.value
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-muted-foreground hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {filteredClients.length === 0 ? (
          <Card className="border-white/10 bg-card/50 p-8 text-center text-sm text-muted-foreground">
            Aucun client ne correspond à ta recherche.
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="block"
            >
              <Card className="border-white/10 bg-card/50 hover:bg-card/80 hover:border-violet-500/30 transition-all p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border border-violet-500/30">
                    <AvatarFallback className="bg-violet-500/20 text-violet-300 font-medium">
                      {client.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Infos principales */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{client.full_name}</h3>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusConfig[client.status].color)}
                      >
                        {statusConfig[client.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      )}
                      {client.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Depuis le {new Date(client.start_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Programme + montant + overdue */}
                  <div className="text-right hidden sm:block">
                    {overdueAmounts[client.id] != null && (
                      <div className="flex items-center gap-1 justify-end text-red-400 text-xs font-semibold mb-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {overdueAmounts[client.id].toLocaleString('fr-FR')} € en retard
                      </div>
                    )}
                    {client.program_name && (
                      <div className="text-sm font-medium">{client.program_name}</div>
                    )}
                    {client.total_amount && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {Number(client.total_amount).toLocaleString('fr-FR')} €
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}