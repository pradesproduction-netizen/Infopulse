'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Lock, Plus, Trash2, Loader2, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Program } from '@/lib/types'

interface ProgramsSectionProps {
  programs: Program[]
  subscriptionPlan: string | null
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-semibold">
      <Lock className="h-3 w-3" />
      Pro
    </span>
  )
}

interface CreateModalProps {
  open: boolean
  onClose: () => void
}

function CreateProgramModal({ open, onClose }: CreateModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', description: '' })

  function reset() {
    setForm({ name: '', price: '', description: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('programs').insert({
      infopreneur_id: user.id,
      name: form.name.trim(),
      price: form.price ? Number(form.price) : null,
      description: form.description.trim() || null,
    })

    setLoading(false)
    onClose()
    reset()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau programme</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="prog_name">Nom du programme *</Label>
            <Input
              id="prog_name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="ENERGY RESET™"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prog_price">Prix (€)</Label>
            <Input
              id="prog_price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="3000"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prog_desc">Description (optionnel)</Label>
            <Input
              id="prog_desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Programme 3 mois..."
              disabled={loading}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading || !form.name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le programme
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProgramsSection({ programs, subscriptionPlan }: ProgramsSectionProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const isPro = subscriptionPlan === 'pro'

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.from('programs').delete().eq('id', deleteTarget.id)
    setDeleteLoading(false)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Mes programmes
            {!isPro && <ProBadge />}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Les programmes disponibles pour tes clients
          </p>
        </div>
        {isPro && (
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4" />
            Créer un programme
          </Button>
        )}
      </div>

      {!isPro ? (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="font-semibold text-sm mb-1">Fonctionnalité Pro</p>
            <p className="text-xs text-muted-foreground">
              Crée et gère tes programmes à partir du plan Pro à 97€/mois.
            </p>
            <Button size="sm" className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              Passer au plan Pro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {programs.length === 0 ? (
            <Card className="border-white/10 bg-card/50">
              <CardContent className="py-10 text-center">
                <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-5 w-5 text-violet-400" />
                </div>
                <p className="text-sm font-medium mb-1">Aucun programme créé</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Crée ton premier programme pour l&apos;associer à tes clients.
                </p>
                <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  Créer un programme
                </Button>
              </CardContent>
            </Card>
          ) : (
            programs.map((prog) => (
              <Card key={prog.id} className="border-white/10 bg-card/50">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{prog.name}</p>
                      {prog.description && (
                        <p className="text-xs text-muted-foreground truncate">{prog.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {prog.price != null && (
                      <span className="text-sm font-semibold text-violet-300">
                        {prog.price.toLocaleString('fr-FR')} €
                      </span>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => setDeleteTarget(prog)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <CreateProgramModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Supprimer ce programme ?"
        description={`"${deleteTarget?.name}" sera définitivement supprimé. Les clients associés ne seront pas affectés.`}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />
    </div>
  )
}
