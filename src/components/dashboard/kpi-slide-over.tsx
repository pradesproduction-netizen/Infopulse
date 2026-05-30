'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, Loader2, Mail, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export type PanelType = 'ca_mois' | 'rdv_booke' | 'paiements' | 'relances'

interface ProspectItem {
  id: string
  full_name: string
  estimated_value: number | null
  updated_at: string | null
  email?: string | null
  client_id?: string | null
}

interface PaymentItem {
  amount: number
  payment_date: string
  status: string
  client: { id: string; full_name: string }
}

interface RelanceItem {
  id: string
  amount: number
  next_payment_date: string
  client: { id: string; full_name: string; email: string | null } | null
}

const TITLES: Record<PanelType, string> = {
  ca_mois:   'CA du mois — Prospects gagnés',
  rdv_booke: 'Appels prévus — RDV bookés',
  paiements: 'Paiements à venir — En attente ce mois',
  relances:  '💸 Relances paiement',
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
  const [relances, setRelances] = useState<RelanceItem[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [loadingPayId, setLoadingPayId] = useState<string | null>(null)

  useEffect(() => {
    if (!type) return
    setLoading(true)
    setProspects([])
    setPayments([])
    setRelances([])
    setDismissedIds(new Set())

    const supabase = createClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    const startOfMonthDate = startOfMonth.split('T')[0]
    const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    if (type === 'ca_mois') {
      supabase
        .from('prospects')
        .select('id, full_name, estimated_value, updated_at, email')
        .eq('infopreneur_id', infopreneurId)
        .eq('pipeline_stage', 'Gagné')
        .gte('updated_at', startOfMonth)
        .lt('updated_at', startOfNextMonth)
        .order('estimated_value', { ascending: false })
        .then(async ({ data }) => {
          const prospects = (data ?? []) as ProspectItem[]
          const emails = prospects.map((p) => p.email).filter(Boolean) as string[]
          if (emails.length > 0) {
            const { data: clients } = await supabase
              .from('clients')
              .select('id, email')
              .eq('infopreneur_id', infopreneurId)
              .in('email', emails)
            const emailToId: Record<string, string> = {}
            for (const c of clients ?? []) {
              if (c.email) emailToId[c.email] = c.id
            }
            setProspects(prospects.map((p) => ({ ...p, client_id: p.email ? (emailToId[p.email] ?? null) : null })))
          } else {
            setProspects(prospects)
          }
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
    } else if (type === 'relances') {
      supabase
        .from('payments')
        .select('id, amount, next_payment_date, client:clients(id, full_name, email)')
        .eq('infopreneur_id', infopreneurId)
        .lte('next_payment_date', today)
        .neq('status', 'paid')
        .order('next_payment_date', { ascending: true })
        .then(({ data }) => {
          setRelances((data ?? []) as unknown as RelanceItem[])
          setLoading(false)
        })
    } else {
      // paiements (pending ce mois)
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
            .eq('status', 'pending')
            .gte('payment_date', startOfMonthDate)
            .lte('payment_date', endOfMonthDate)
            .order('payment_date')

          setPayments((data ?? []) as unknown as PaymentItem[])
          setLoading(false)
        })
    }
  }, [type, infopreneurId])

  async function markPaid(id: string) {
    setLoadingPayId(id)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: today })
      .eq('id', id)
    setLoadingPayId(null)
    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      setDismissedIds((prev) => new Set([...prev, id]))
      toast.success('Paiement marqué comme payé ✓')
    }
  }

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const visibleRelances = relances.filter((r) => !dismissedIds.has(r.id))

  function getDaysOverdue(dateStr: string): number {
    return Math.max(0, Math.floor((Date.now() - new Date(dateStr + 'T00:00:00').getTime()) / 86_400_000))
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

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
          ) : type === 'relances' ? (
            visibleRelances.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                Aucune relance en cours. 🎉
              </p>
            ) : (
              <ul className="space-y-3">
                {visibleRelances.map((r) => {
                  const days = getDaysOverdue(r.next_payment_date)
                  const clientName = r.client?.full_name ?? 'Client inconnu'
                  const clientEmail = r.client?.email ?? ''
                  const isPaying = loadingPayId === r.id
                  const subject = encodeURIComponent('Rappel paiement')
                  const body = encodeURIComponent(
                    `Bonjour ${clientName},\n\nVotre paiement de ${r.amount.toLocaleString('fr-FR')} € est dû depuis le ${formatDate(r.next_payment_date)}.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\nCordialement`
                  )

                  return (
                    <li
                      key={r.id}
                      className="rounded-lg border border-red-500/20 bg-red-500/[0.04] px-4 py-3 space-y-2.5"
                    >
                      {/* Top row: name + badge */}
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-medium truncate flex-1">{clientName}</p>
                        <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">
                          À relancer
                        </span>
                      </div>

                      {/* Amount + date + days */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-red-400">
                          {r.amount.toLocaleString('fr-FR')} €
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          {new Date(r.next_payment_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long',
                          })}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className={cn(
                          'flex items-center gap-1',
                          days > 0 ? 'text-red-400' : 'text-muted-foreground'
                        )}>
                          <Clock className="h-3 w-3" />
                          {days === 0 ? "Aujourd'hui" : `${days}j de retard`}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {clientEmail && (
                          <a
                            href={`mailto:${clientEmail}?subject=${subject}&body=${body}`}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs rounded-md border border-white/20 hover:border-violet-500/50 hover:text-violet-400 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Relancer
                          </a>
                        )}
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs rounded-md bg-green-600/80 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => void markPaid(r.id)}
                          disabled={isPaying}
                        >
                          {isPaying
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <CheckCircle className="h-3.5 w-3.5" />
                          }
                          Payé
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )
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
                      href={p.client_id ? `/dashboard/clients/${p.client_id}` : `/dashboard/prospects`}
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
