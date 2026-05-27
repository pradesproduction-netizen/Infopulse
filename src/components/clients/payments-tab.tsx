'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Check, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Payment } from '@/lib/types'

function effectiveStatus(p: Payment): 'paid' | 'pending' | 'overdue' {
  if (p.status === 'paid') return 'paid'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (new Date(p.payment_date + 'T00:00:00') < today) return 'overdue'
  return 'pending'
}

const statusConfig = {
  paid: { label: 'Payé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  pending: { label: 'En attente', className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  overdue: { label: 'En retard', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
}

interface PaymentsTabProps {
  payments: Payment[]
  clientId: string
}

export function PaymentsTab({ payments, clientId }: PaymentsTabProps) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ payment_date: '', amount: '' })
  const [saving, setSaving] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('payments').insert({
      client_id: clientId,
      payment_date: form.payment_date,
      amount: Number(form.amount),
      status: 'pending',
      paid_at: null,
    })
    setSaving(false)
    setAddOpen(false)
    setForm({ payment_date: '', amount: '' })
    router.refresh()
  }

  async function handleMarkPaid(p: Payment) {
    setMarkingId(p.id)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('payments').update({ status: 'paid', paid_at: today }).eq('id', p.id)
    setMarkingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('payments').delete().eq('id', id)
    setDeletingId(null)
    router.refresh()
  }

  const overdueCount = payments.filter((p) => effectiveStatus(p) === 'overdue').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Échéancier de paiement</h3>
          {overdueCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-xs">
              {overdueCount} en retard
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 gap-1.5"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une échéance
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card className="border-white/10 bg-card/50 p-8">
          <p className="text-center text-sm text-muted-foreground">
            Aucune échéance enregistrée. Clique sur &quot;+&quot; pour en ajouter une.
          </p>
        </Card>
      ) : (
        <Card className="border-white/10 bg-card/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date prévue</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Montant</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date réelle</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const status = effectiveStatus(p)
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        'border-b border-white/5 last:border-0 transition-colors',
                        status === 'overdue' ? 'bg-red-500/[0.03] hover:bg-red-500/[0.05]' : 'hover:bg-white/[0.02]'
                      )}
                    >
                      <td className="p-3">
                        {new Date(p.payment_date + 'T00:00:00').toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3 font-medium">
                        {Number(p.amount).toLocaleString('fr-FR')} €
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={cn('text-xs', statusConfig[status].className)}>
                          {statusConfig[status].label}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {p.paid_at
                          ? new Date(p.paid_at + 'T00:00:00').toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-end">
                          {status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 text-xs"
                              onClick={() => handleMarkPaid(p)}
                              disabled={markingId === p.id}
                            >
                              {markingId === p.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Check className="h-3 w-3" />}
                              Payé
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={addOpen} onOpenChange={(v) => { if (!v) { setAddOpen(false); setForm({ payment_date: '', amount: '' }) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajouter une échéance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pay_date">Date prévue *</Label>
              <Input
                id="pay_date"
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
                required
                disabled={saving}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay_amount">Montant (€) *</Label>
              <Input
                id="pay_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="1000"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving || !form.payment_date || !form.amount}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
