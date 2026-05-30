'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PaymentToChase } from '@/lib/types'

interface PaymentRemindersProps {
  payments: PaymentToChase[]
}

export function PaymentReminders({ payments: initialPayments }: PaymentRemindersProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = initialPayments.filter((p) => !dismissed.has(p.id))
  if (visible.length === 0) return null

  function getDaysOverdue(dateStr: string): number {
    return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000))
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  async function markPaid(paymentId: string) {
    setLoadingId(paymentId)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: today })
      .eq('id', paymentId)
    setLoadingId(null)
    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      setDismissed((prev) => new Set([...prev, paymentId]))
      toast.success('Paiement marqué comme payé ✓')
      router.refresh()
    }
  }

  return (
    <Card id="payment-reminders" className="border-red-500/30 bg-red-500/[0.04]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-red-400" />
          </div>
          <CardTitle className="text-base flex items-center gap-2">
            💸 Relances paiement
            <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs px-1.5">
              {visible.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {visible.map((payment) => {
          const days = getDaysOverdue(payment.next_payment_date)
          const clientName = payment.clients?.full_name ?? 'Client inconnu'
          const clientEmail = payment.clients?.email ?? ''
          const isLoading = loadingId === payment.id

          const subject = encodeURIComponent('Rappel paiement')
          const body = encodeURIComponent(
            `Bonjour ${clientName},\n\nVotre paiement de ${payment.amount.toLocaleString('fr-FR')} € est dû depuis le ${formatDate(payment.next_payment_date)}.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\nCordialement`
          )

          return (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{clientName}</p>
                  <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] px-1.5 py-0 flex-shrink-0">
                    À relancer
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-semibold text-red-400">
                    {payment.amount.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className={`text-xs flex items-center gap-1 ${days > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    <Clock className="h-3 w-3" />
                    {days === 0 ? "Échéance aujourd'hui" : `${days}j de retard`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {clientEmail && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-white/20 hover:border-violet-500/50 hover:text-violet-400 gap-1.5"
                    asChild
                  >
                    <a href={`mailto:${clientEmail}?subject=${subject}&body=${body}`}>
                      <Mail className="h-3.5 w-3.5" />
                      Relancer
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-8 bg-green-600/80 hover:bg-green-600 gap-1.5"
                  onClick={() => void markPaid(payment.id)}
                  disabled={isLoading}
                >
                  {isLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <CheckCircle className="h-3.5 w-3.5" />
                  }
                  Payé
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
