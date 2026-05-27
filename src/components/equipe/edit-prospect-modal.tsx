'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Prospect } from '@/lib/types'

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

interface EditProspectModalProps {
  prospect: Prospect
  open: boolean
  onClose: () => void
  onSaved: (updated: Prospect) => void
}

export function EditProspectModal({ prospect, open, onClose, onSaved }: EditProspectModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: '',
    estimated_value: '',
    pipeline_stage: prospect.pipeline_stage,
    instagram_url: '',
    linkedin_url: '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        full_name: prospect.full_name,
        email: prospect.email ?? '',
        phone: prospect.phone ?? '',
        source: prospect.source ?? '',
        estimated_value: prospect.estimated_value?.toString() ?? '',
        pipeline_stage: prospect.pipeline_stage,
        instagram_url: prospect.instagram_url ?? '',
        linkedin_url: prospect.linkedin_url ?? '',
        notes: prospect.notes ?? '',
      })
      setError(null)
    }
  }, [open, prospect])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/update-prospect/${prospect.id}`, {
      method: 'PATCH',
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
        notes: form.notes.trim() || null,
      }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      if (data.client_created) {
        const clientId = data.client_id as string
        toast.success(`${data.client_name} ajouté automatiquement dans Clients`, {
          action: {
            label: 'Voir le profil →',
            onClick: () => { window.location.href = `/dashboard/clients/${clientId}` },
          },
          duration: 6000,
        })
      }
      onSaved(data.prospect as Prospect)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la sauvegarde')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le prospect</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ep_full_name">Nom complet *</Label>
            <Input
              id="ep_full_name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Prénom Nom"
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ep_email">Email</Label>
              <Input
                id="ep_email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@exemple.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep_phone">Téléphone</Label>
              <Input
                id="ep_phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+33 6..."
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ep_source">Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                <SelectTrigger id="ep_source" disabled={loading}>
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
              <Label htmlFor="ep_amount">Valeur estimée (€)</Label>
              <Input
                id="ep_amount"
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
              <Label htmlFor="ep_instagram">Instagram</Label>
              <Input
                id="ep_instagram"
                value={form.instagram_url}
                onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                placeholder="instagram.com/user"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep_linkedin">LinkedIn</Label>
              <Input
                id="ep_linkedin"
                value={form.linkedin_url}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                placeholder="linkedin.com/in/user"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ep_stage">Étape *</Label>
            <Select
              value={form.pipeline_stage}
              onValueChange={(v: Prospect['pipeline_stage']) => setForm((f) => ({ ...f, pipeline_stage: v }))}
            >
              <SelectTrigger id="ep_stage" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ep_notes">Notes</Label>
            <Textarea
              id="ep_notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Notes sur ce prospect..."
              rows={3}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              ⚠️ {error}
            </p>
          )}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !form.full_name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
