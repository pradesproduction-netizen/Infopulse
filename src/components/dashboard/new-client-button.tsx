'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import type { Program } from '@/lib/types'

export function NewClientButton() {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    status: 'onboarding' as 'onboarding' | 'actif' | 'termine' | 'en_pause',
    start_date: new Date().toISOString().split('T')[0],
    program_id: '',
    total_amount: '',
    notes: '',
  })

  // Load programs when modal opens
  useEffect(() => {
    if (!open) return
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('programs')
        .select('*')
        .eq('infopreneur_id', user.id)
        .order('name')
        .then(({ data }) => setPrograms(data ?? []))
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleProgramChange(programId: string) {
    const program = programs.find((p) => p.id === programId)
    setFormData((f) => ({
      ...f,
      program_id: programId,
      total_amount: program?.price != null ? String(program.price) : f.total_amount,
    }))
  }

  const selectedProgram = programs.find((p) => p.id === formData.program_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Tu dois être connectée'); setLoading(false); return }

    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        infopreneur_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        status: formData.status,
        start_date: formData.start_date || null,
        program_name: selectedProgram?.name ?? null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        notes: formData.notes || null,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      // Création automatique du premier paiement
      if (newClient && formData.total_amount && formData.start_date) {
        await supabase.from('payments').insert({
          client_id: newClient.id,
          amount: parseFloat(formData.total_amount),
          payment_date: formData.start_date,
          status: 'paid',
          paid_at: null,
        })
      }

      setFormData({
        full_name: '', email: '', phone: '', company: '',
        status: 'onboarding', start_date: new Date().toISOString().split('T')[0],
        program_id: '', total_amount: '', notes: '',
      })
      setOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-500 hover:bg-violet-600">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogDescription>
            Ajoute un client à ton portefeuille. Tu pourras éditer ces infos plus tard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet <span className="text-red-400">*</span></Label>
            <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required disabled={loading} placeholder="Marie Dupont" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-400">*</span></Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} placeholder="marie@exemple.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={loading} placeholder="06 12 34 56 78" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} disabled={loading} placeholder="Optionnel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(v: 'onboarding' | 'actif' | 'termine' | 'en_pause') => setFormData({ ...formData, status: v })}>
                <SelectTrigger id="status" disabled={loading}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">🟡 Onboarding</SelectItem>
                  <SelectItem value="actif">🟢 Actif</SelectItem>
                  <SelectItem value="en_pause">🟠 En pause</SelectItem>
                  <SelectItem value="termine">⚪ Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début <span className="text-red-400">*</span></Label>
              <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program_id">Programme</Label>
              {programs.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                  Créez d&apos;abord un programme dans Compte → Programmes
                </div>
              ) : (
                <Select value={formData.program_id} onValueChange={handleProgramChange}>
                  <SelectTrigger id="program_id" disabled={loading}>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}{p.price != null ? ` — ${p.price.toLocaleString('fr-FR')} €` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Montant total (€) <span className="text-red-400">*</span></Label>
              <Input id="total_amount" type="number" step="0.01" min="0" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} required disabled={loading} placeholder="3000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes initiales</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} disabled={loading} placeholder="Contexte, objectifs, particularités..." rows={3} />
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading} className="bg-violet-500 hover:bg-violet-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : 'Créer le client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
