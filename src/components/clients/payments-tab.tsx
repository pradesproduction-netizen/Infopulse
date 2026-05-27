'use client'

import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Trash2, Loader2, ChevronDown, Check, X, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Payment } from '@/lib/types'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:    { label: 'En attente', className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  a_relancer: { label: 'À relancer', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
  paid:       { label: 'Payé',       className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  en_pause:   { label: 'En pause',   className: 'bg-gray-500/10 text-gray-300 border-gray-500/30' },
  overdue:    { label: 'En retard',  className: 'bg-red-500/10 text-red-300 border-red-500/30' },
}

interface PaymentsTabProps {
  payments: Payment[]
  clientId: string
}

export function PaymentsTab({ payments, clientId }: PaymentsTabProps) {
  const router = useRouter()

  // Add modal
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ payment_date: '', amount: '' })
  const [addSaving, setAddSaving] = useState(false)

  // Inline edit (date + amount only)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ payment_date: '', amount: '' })
  const [editSaving, setEditSaving] = useState(false)

  // Per-row loading states
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auto-upgrade pending → a_relancer pour les échéances du jour
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const toUpgrade = payments.filter(
      (p) => p.status === 'pending' && p.payment_date === today
    )
    if (toUpgrade.length === 0) return
    const supabase = createClient()
    supabase
      .from('payments')
      .update({ status: 'a_relancer' })
      .in('id', toUpgrade.map((p) => p.id))
      .then(() => router.refresh())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = [...payments].sort(
    (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  )
  const firstPayment = sorted[0] ?? null
  const rest = sorted.slice(1)
  const aRelancerCount = payments.filter((p) => p.status === 'a_relancer').length

  // ── Handlers ──────────────────────────────────────────────────

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddSaving(true)
    const supabase = createClient()
    await supabase.from('payments').insert({
      client_id: clientId,
      payment_date: form.payment_date,
      amount: Number(form.amount),
      status: 'pending',
      paid_at: null,
    })
    setAddSaving(false)
    setAddOpen(false)
    setForm({ payment_date: '', amount: '' })
    router.refresh()
  }

  // Statut du premier paiement (2 options seulement)
  async function handleFirstStatusChange(p: Payment, next: 'pending' | 'paid') {
    setStatusLoadingId(p.id)
    const supabase = createClient()
    const update: Record<string, unknown> = { status: next }
    if (next === 'paid') update.paid_at = new Date().toISOString().split('T')[0]
    await supabase.from('payments').update(update).eq('id', p.id)
    setStatusLoadingId(null)
    router.refresh()
  }

  // Statut direct pour l'échéancier (4 options, sauvegarde immédiate)
  async function handleStatusChange(p: Payment, next: Payment['status']) {
    setStatusLoadingId(p.id)
    const supabase = createClient()
    const update: Record<string, unknown> = { status: next }
    if (next === 'paid') update.paid_at = new Date().toISOString().split('T')[0]
    await supabase.from('payments').update(update).eq('id', p.id)
    setStatusLoadingId(null)
    router.refresh()
  }

  // Sauvegarde date + montant via crayon
  async function handleSaveEdit() {
    if (!editingId) return
    setEditSaving(true)
    const supabase = createClient()
    await supabase.from('payments').update({
      payment_date: editValues.payment_date,
      amount: Number(editValues.amount),
    }).eq('id', editingId)
    setEditSaving(false)
    setEditingId(null)
    router.refresh()
  }

  // Date du premier paiement → sync clients.start_date
  async function handleFirstDateChange(date: string) {
    if (!firstPayment || !date) return
    const supabase = createClient()
    await Promise.all([
      supabase.from('payments').update({ payment_date: date }).eq('id', firstPayment.id),
      supabase.from('clients').update({ start_date: date }).eq('id', clientId),
    ])
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('payments').delete().eq('id', id)
    setDeletingId(null)
    router.refresh()
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Bloc 1 : Premier paiement ─────────────────────────── */}
      {firstPayment && (
        <div
          key={firstPayment.id + firstPayment.payment_date}
          className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4"
        >
          <p className="text-xs font-medium text-violet-400 mb-3 uppercase tracking-wide">
            Premier paiement
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
              <span className="text-lg font-bold">
                {Number(firstPayment.amount).toLocaleString('fr-FR')} €
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={statusLoadingId === firstPayment.id}>
                  <button className="focus:outline-none">
                    <Badge
                      variant="outline"
                      className={cn(
                        (statusConfig[firstPayment.status] ?? statusConfig.pending).className,
                        'cursor-pointer hover:opacity-75 transition-opacity gap-1 pr-1.5 select-none text-xs'
                      )}
                    >
                      {(statusConfig[firstPayment.status] ?? statusConfig.pending).label}
                      {statusLoadingId === firstPayment.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <ChevronDown className="h-3 w-3 opacity-70" />}
                    </Badge>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                  <DropdownMenuItem onClick={() => handleFirstStatusChange(firstPayment, 'pending')}>
                    🟡 En attente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFirstStatusChange(firstPayment, 'paid')}>
                    ✅ Payé
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="date"
                defaultValue={firstPayment.payment_date}
                onBlur={(e) => {
                  if (e.target.value && e.target.value !== firstPayment.payment_date) {
                    handleFirstDateChange(e.target.value)
                  }
                }}
                className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500/50 w-36"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:text-destructive"
                onClick={() => handleDelete(firstPayment.id)}
                disabled={deletingId === firstPayment.id}
              >
                {deletingId === firstPayment.id
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Trash2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bloc 2 : Échéancier à venir ───────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Échéancier à venir</h3>
            {aRelancerCount > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-xs">
                {aRelancerCount} à relancer
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
            Ajouter
          </Button>
        </div>

        {payments.length === 0 ? (
          <Card className="border-white/10 bg-card/50 p-8">
            <p className="text-center text-sm text-muted-foreground">
              Aucune échéance enregistrée. Clique sur &quot;+ Ajouter&quot; pour commencer.
            </p>
          </Card>
        ) : rest.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-0.5">Aucune autre échéance prévue.</p>
        ) : (
          <Card className="border-white/10 bg-card/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date prévue</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Montant</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Statut</th>
                    <th className="p-3 w-36" />
                  </tr>
                </thead>
                <tbody>
                  {rest.map((p) => {
                    const isEditing = editingId === p.id
                    const cfg = statusConfig[p.status] ?? statusConfig.pending
                    return (
                      <Fragment key={p.id}>
                        <tr className={cn(
                          'border-b border-white/5 transition-colors',
                          isEditing
                            ? 'bg-white/[0.04]'
                            : cn(
                                p.status === 'a_relancer' && 'bg-red-500/[0.03]',
                                p.status === 'en_pause' && 'bg-gray-500/[0.03]',
                              )
                        )}>

                          {/* Date — input en mode édition */}
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editValues.payment_date}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, payment_date: e.target.value }))
                                }
                                className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500/50 w-36"
                                autoFocus
                              />
                            ) : (
                              <span className="text-muted-foreground">
                                {new Date(p.payment_date + 'T00:00:00').toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </td>

                          {/* Montant — input en mode édition */}
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editValues.amount}
                                onChange={(e) =>
                                  setEditValues((v) => ({ ...v, amount: e.target.value }))
                                }
                                className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500/50 w-28"
                              />
                            ) : (
                              <span className="font-medium">
                                {Number(p.amount).toLocaleString('fr-FR')} €
                              </span>
                            )}
                          </td>

                          {/* Statut — toujours un dropdown direct */}
                          <td className="p-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={statusLoadingId === p.id}>
                                <button className="focus:outline-none">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      cfg.className,
                                      'cursor-pointer hover:opacity-75 transition-opacity gap-1 pr-1.5 select-none text-xs'
                                    )}
                                  >
                                    {cfg.label}
                                    {statusLoadingId === p.id
                                      ? <Loader2 className="h-3 w-3 animate-spin" />
                                      : <ChevronDown className="h-3 w-3 opacity-70" />}
                                  </Badge>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="min-w-[160px]">
                                <DropdownMenuItem onClick={() => handleStatusChange(p, 'pending')}>
                                  🟡 En attente
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(p, 'a_relancer')}>
                                  🔴 À relancer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(p, 'paid')}>
                                  ✅ Payé
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(p, 'en_pause')}>
                                  ⏸ En pause
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 gap-1 text-xs"
                                  onClick={handleSaveEdit}
                                  disabled={editSaving}
                                >
                                  {editSaving
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <Check className="h-3 w-3" />}
                                  Sauvegarder
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground hover:text-white"
                                  onClick={() => setEditingId(null)}
                                  disabled={editSaving}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground hover:text-white"
                                  onClick={() => {
                                    setEditingId(p.id)
                                    setEditValues({
                                      payment_date: p.payment_date,
                                      amount: String(p.amount),
                                    })
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
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
                            )}
                          </td>
                        </tr>
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add modal */}
      <Dialog
        open={addOpen}
        onOpenChange={(v) => { if (!v) { setAddOpen(false); setForm({ payment_date: '', amount: '' }) } }}
      >
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
                disabled={addSaving}
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
                disabled={addSaving}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={addSaving}>
                Annuler
              </Button>
              <Button type="submit" disabled={addSaving || !form.payment_date || !form.amount}>
                {addSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
