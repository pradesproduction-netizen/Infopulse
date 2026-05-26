'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Payment, Client } from '@/lib/types'

interface PaiementsClientProps {
  payments: Payment[]
  client: Client
}

const statusConfig = {
  paid: {
    label: 'Payé',
    icon: CheckCircle2,
    badgeClass: 'bg-green-500/10 text-green-300 border-green-500/30',
    iconClass: 'text-green-400',
  },
  pending: {
    label: 'En attente',
    icon: Clock,
    badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    iconClass: 'text-yellow-400',
  },
  overdue: {
    label: 'En retard',
    icon: AlertCircle,
    badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
    iconClass: 'text-red-400',
  },
}

export function PaiementsClient({ payments, client }: PaiementsClientProps) {
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalAmount = client.total_amount ?? 0
  const remaining = Math.max(0, totalAmount - totalPaid)
  const paidCount = payments.filter((p) => p.status === 'paid').length
  const totalCount = payments.length
  const paymentPct = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0

  const nextPayment = payments.find((p) => p.status === 'pending' || p.status === 'overdue')

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Mes paiements</h1>
        <p className="text-muted-foreground mt-1">Suivi de ton programme</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total programme</p>
            <p className="text-2xl font-bold mt-1">
              {totalAmount > 0 ? `${totalAmount.toLocaleString('fr-FR')} €` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Déjà payé</p>
            <p className="text-2xl font-bold mt-1 text-green-400">
              {totalPaid > 0 ? `${totalPaid.toLocaleString('fr-FR')} €` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Reste à payer</p>
            <p className={cn('text-2xl font-bold mt-1', remaining > 0 ? 'text-orange-400' : 'text-green-400')}>
              {remaining > 0 ? `${remaining.toLocaleString('fr-FR')} €` : 'Soldé ✓'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment progress */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {paidCount} versement{paidCount !== 1 ? 's' : ''} sur {totalCount}
            </span>
            <span className="text-violet-400 font-bold">{paymentPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${paymentPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Next payment */}
      {nextPayment && (
        <Card className={cn(
          'border',
          nextPayment.status === 'overdue'
            ? 'border-red-500/40 bg-red-500/[0.04]'
            : 'border-yellow-500/30 bg-yellow-500/[0.04]'
        )}>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {nextPayment.status === 'overdue' ? 'Paiement en retard' : 'Prochain paiement'}
            </p>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-2xl font-bold">
                  {nextPayment.amount.toLocaleString('fr-FR')} €
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(nextPayment.payment_date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <Badge
                variant="outline"
                className={statusConfig[nextPayment.status].badgeClass}
              >
                {statusConfig[nextPayment.status].label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Historique</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Aucun paiement enregistré pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => {
              const cfg = statusConfig[payment.status]
              const StatusIcon = cfg.icon
              return (
                <Card key={payment.id} className="border-white/10 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={cn('h-5 w-5 flex-shrink-0', cfg.iconClass)} />
                        <div>
                          <p className="font-semibold">
                            {payment.amount.toLocaleString('fr-FR')} €
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('text-xs', cfg.badgeClass)}>
                          {cfg.label}
                        </Badge>
                        {payment.receipt_url && (
                          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                            <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground mt-2">{payment.notes}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
