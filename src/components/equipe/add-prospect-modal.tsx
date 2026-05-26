'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Prospect } from '@/lib/types'

interface AddProspectModalProps {
  defaultStage: Prospect['pipeline_stage']
}

const SOURCES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'referral', label: 'Référence' },
  { value: 'other', label: 'Autre' },
]

const STAGES: { value: Prospect['pipeline_stage']; label: string }[] = [
  { value: 'nouveau_lead', label: 'Nouveau lead' },
  { value: 'set_en_cours', label: 'Set en cours' },
  { value: 'rdv_booke', label: 'RDV booké' },
  { value: 'no_show', label: 'No show' },
  { value: 'proposition_envoyee', label: 'Proposition envoyée' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'gagne', label: 'Gagné' },
  { value: 'perdu', label: 'Perdu' },
]

export function AddProspectModal({ defaultStage }: AddProspectModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: '',
    estimated_amount: '',
    pipeline_stage: defaultStage,
  })

  function reset() {
    setForm({ full_name: '', email: '', phone: '', source: '', estimated_amount: '', pipeline_stage: defaultStage })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('prospects').insert({
      infopreneur_id: user.id,
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      source: form.source || null,
      estimated_amount: form.estimated_amount ? Number(form.estimated_amount) : null,
      pipeline_stage: form.pipeline_stage,
    })

    setLoading(false)
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="w-full mt-2 border border-dashed border-white/20 hover:border-white/40 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Ajouter
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau prospect</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="p_full_name">Nom complet *</Label>
              <Input
                id="p_full_name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Prénom Nom"
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="p_email">Email</Label>
                <Input
                  id="p_email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_phone">Téléphone</Label>
                <Input
                  id="p_phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+33 6..."
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="p_source">Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
                >
                  <SelectTrigger id="p_source" disabled={loading}>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_amount">Montant estimé (€)</Label>
                <Input
                  id="p_amount"
                  type="number"
                  min="0"
                  value={form.estimated_amount}
                  onChange={(e) => setForm((f) => ({ ...f, estimated_amount: e.target.value }))}
                  placeholder="2000"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p_stage">Étape *</Label>
              <Select
                value={form.pipeline_stage}
                onValueChange={(v: Prospect['pipeline_stage']) => setForm((f) => ({ ...f, pipeline_stage: v }))}
              >
                <SelectTrigger id="p_stage" disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !form.full_name.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
