'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AddMemberModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'closer' as 'closer' | 'setter',
  })

  function reset() {
    setForm({ full_name: '', email: '', phone: '', role: 'closer' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('team_members').insert({
      infopreneur_id: user.id,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      active: true,
    })

    setLoading(false)
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Ajouter un membre
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau membre</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Prénom Nom"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="prenom@exemple.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+33 6 00 00 00 00"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={form.role}
                onValueChange={(v: 'closer' | 'setter') => setForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger id="role" disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closer">Closer</SelectItem>
                  <SelectItem value="setter">Setter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !form.full_name.trim() || !form.email.trim()}>
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
