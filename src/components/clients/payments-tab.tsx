'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CreditCard, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Payment } from '@/lib/types'

const statusConfig = {
  paid: { label: 'Payé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  pending: { label: 'En attente', className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  overdue: { label: 'En retard', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
}

export function PaymentsTab({ payments }: { payments: Payment[]; clientId: string }) {
  const nextPayment = payments.find((p) => p.status === 'pending' || p.status === 'overdue')

  return (
    <div className="space-y-6">
      {/* Prochain paiement */}
      {nextPayment && (
        <Card
          className={cn(
            'border',
            nextPayment.status === 'overdue'
              ? 'border-red-500/20 bg-red-500/5'
              : 'border-violet-500/20 bg-violet-500/5'
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={cn(
                'text-sm flex items-center gap-2',
                nextPayment.status === 'overdue' ? 'text-red-300' : 'text-violet-300'
              )}
            >
              <CreditCard className="h-4 w-4" />
              {nextPayment.status === 'overdue' ? 'Paiement en retard' : 'Prochain paiement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-3xl font-bold">
                  {Number(nextPayment.amount).toLocaleString('fr-FR')} €
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(nextPayment.payment_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge
                variant="outline"
                className={statusConfig[nextPayment.status].className}
              >
                {statusConfig[nextPayment.status].label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header + bouton */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Historique des paiements</h3>
        <Button variant="outline" size="sm" className="border-white/10 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Enregistrer un paiement
        </Button>
      </div>

      {/* Tableau */}
      {payments.length === 0 ? (
        <Card className="border-white/10 bg-card/50 p-8">
          <p className="text-center text-sm text-muted-foreground">
            Aucun paiement enregistré.
          </p>
        </Card>
      ) : (
        <Card className="border-white/10 bg-card/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground">Montant</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-sm">
                      {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {Number(payment.amount).toLocaleString('fr-FR')} €
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusConfig[payment.status].className)}
                      >
                        {statusConfig[payment.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {payment.receipt_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-violet-400 hover:text-violet-300"
                          asChild
                        >
                          <a
                            href={payment.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-3 w-3" />
                            Télécharger
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
