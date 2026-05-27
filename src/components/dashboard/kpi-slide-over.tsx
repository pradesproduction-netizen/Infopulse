'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PanelType = 'ca_mois' | 'rdv_booke' | 'paiements'

interface ProspectItem {
  id: string
  full_name: string
  estimated_value: number | null
  updated_at: string | null
}

interface PaymentItem {
  amount: number
  payment_date: string
  status: string
  client: { id: string; full_name: string }
}

const TITLES: Record<PanelType, string> = {
  ca_mois:   'CA du mois — Prospects gagnés',
  rdv_booke: 'Appels prévus — RDV bookés',
  paiements: 'Paiements à venir ce mois',
}

interface KpiSlideOverProps {
  type: PanelType | null
  infopreneurId: string
  onClose: () => void
}

export function KpiSlideOver({ type, infopreneurId, onClose }: KpiSlideOverProps) {
  const open = type !== null
  const [loading, setLoading] = useState(false)
  const [prospects, setProspects] = useState<ProspectItem[]>([])
  const [payments, setPayments] = useState<PaymentItem[]>([])

  useEffect(() => {
    if (!type) return
    setLoading(true)
    setProspects([])
    setPayments([])

    const supabase = createClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    const startOfMonthDate = startOfMonth.split('T')[0]
    const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    if (type === 'ca_mois') {
      supabase
        .from('prospects')
        .select('id, full_name, estimated_value, updated_at')
        .eq('infopreneur_id', infopreneurId)
        .eq('pipeline_stage', 'Gagné')
        .gte('updated_at', startOfMonth)
        .lt('updated_at', startOfNextMonth)
        .order('estimated_value', { ascending: false })
        .then(({ data }) => {
          setProspects((data ?? []) as ProspectItem[])
          setLoading(false)
        })
    } else if (type === 'rdv_booke') {
      supabase
        .from('prospects')
        .select('id, full_name, estimated_value, updated_at')
        .eq('infopreneur_id', infopreneurId)
        .eq('pipeline_stage', 'RDV booké')
        .order('updated_at', { ascending: false })
        .then(({ data }) => {
          setProspects((data ?? []) as ProspectItem[])
          setLoading(false)
        })
    } else {
      supabase
        .from('clients')
        .select('id')
        .eq('infopreneur_id', infopreneurId)
        .then(async ({ data: clients }) => {
          const clientIds = (clients ?? []).map((c: { id: string }) => c.id)
          if (clientIds.length === 0) {
            setPayments([])
            setLoading(false)
            return
          }
          const { data } = await supabase
            .from('payments')
            .select('amount, payment_date, status, client:clients(id, full_name)')
            .in('client_id', clientIds)
            .in('status', ['pending', 'a_relancer'])
            .gte('payment_date', startOfMonthDate)
            .lte('payment_date', endOfMonthDate)
            .order('payment_date')
          setPayments((data ?? []) as unknown as PaymentItem[])
          setLoading(false)
        })
    }
  }, [type, infopreneurId])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-[420px] max-w-[95vw] bg-card border-l border-white/10 z-50',
          'flex flex-col shadow-2xl transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="font-semibold text-sm">{type ? TITLES[type] : ''}</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : type === 'paiements' ? (
            payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                Aucun paiement à venir ce mois-ci.
              </p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.client?.full_name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(p.amount).toLocaleString('fr-FR')} €
                        {' · '}
                        {new Date(p.payment_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long',
                        })}
                        {p.status === 'a_relancer' && (
                          <span className="ml-1.5 text-red-400">· À relancer</span>
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/clients/${p.client?.id}`}
                      onClick={onClose}
                      className="flex-shrink-0 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      Voir le profil <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            prospects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                {type === 'ca_mois'
                  ? 'Aucun prospect gagné ce mois-ci.'
                  : 'Aucun RDV booké pour le moment.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {prospects.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {type === 'ca_mois'
                          ? p.estimated_value != null
                            ? `${Number(p.estimated_value).toLocaleString('fr-FR')} €`
                            : 'Valeur non renseignée'
                          : p.updated_at
                            ? `Booké le ${new Date(p.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                            : 'Date inconnue'}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/prospects"
                      onClick={onClose}
                      className="flex-shrink-0 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      Voir le profil <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </>
  )
}
