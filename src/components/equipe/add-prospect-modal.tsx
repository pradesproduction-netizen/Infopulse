'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import type { Prospect } from '@/lib/types'

interface AddProspectModalProps {
  defaultStage: Prospect['pipeline_stage']
  assignedTo?: string | null
}

const SOURCES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'other', label: 'Autre' },
]

const STAGES: { value: Prospect['pipeline_stage']; label: string }[] = [
  { value: 'Nouveau lead', label: 'Nouveau lead' },
  { value: 'Set en cours', label: 'Set en cours' },
  { value: 'RDV booké', label: 'RDV booké' },
  { value: 'No show', label: 'No show' },
  { value: 'Proposition envoyée', label: 'Proposition envoyée' },
  { value: 'Follow-up', label: 'Follow-up' },
  { value: 'Gagné', label: 'Gagné' },
  { value: 'Perdu', label: 'Perdu' },
]

export function AddProspectModal({ defaultStage, assignedTo }: AddProspectModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: '',
    estimated_value: '',
    pipeline_stage: defaultStage,
    instagram_url: '',
    linkedin_url: '',
  })

  function reset() {
    setForm({ full_name: '', email: '', phone: '', source: '', estimated_value: '', pipeline_stage: defaultStage, instagram_url: '', linkedin_url: '' })
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/add-prospect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        source: form.source || null,
        estimated_value: form.estimated_value || null,
        pipeline_stage: form.pipeline_stage,
        instagram_url: form.instagram_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        team_member_id: assignedTo ?? null,
      }),
    })

    setLoading(false)

    if (res.ok) {
      setOpen(false)
      reset()
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de l\'ajout')
    }
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
                <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
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
                <Label htmlFor="p_amount">Valeur estimée (€)</Label>
                <Input
                  id="p_amount"
                  type="number"
                  min="0"
                  value={form.estimated_value}
                  onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))}
                  placeholder="2000"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="p_instagram">Instagram</Label>
                <Input
                  id="p_instagram"
                  value={form.instagram_url}
                  onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                  placeholder="instagram.com/user"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_linkedin">LinkedIn</Label>
                <Input
                  id="p_linkedin"
                  value={form.linkedin_url}
                  onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                  placeholder="linkedin.com/in/user"
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
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                ⚠️ {error}
              </p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
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
