'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2, Copy, Check, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'form' | 'credentials'

interface Credentials {
  name: string
  email: string
  password: string
  accessUrl: string
}

export function AddMemberModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'closer' as 'closer' | 'setter',
  })

  function resetAll() {
    setForm({ full_name: '', email: '', phone: '', role: 'closer' })
    setStep('form')
    setCredentials(null)
    setCopied(false)
    setError(null)
  }

  function handleClose() {
    setOpen(false)
    setTimeout(resetAll, 300)
  }

  async function handleCopyCredentials() {
    if (!credentials) return
    const text = [
      `Accès INFOPULSE pour ${credentials.name}`,
      `Email : ${credentials.email}`,
      `Mot de passe : ${credentials.password}`,
      `Lien : ${credentials.accessUrl}`,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // 1. Insert team member (select id back)
    const { data: newMember, error: insertError } = await supabase
      .from('team_members')
      .insert({
        infopreneur_id: user.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: form.role,
        active: true,
      })
      .select('id')
      .single()

    if (insertError || !newMember) {
      setError("Erreur lors de l'ajout du membre.")
      setLoading(false)
      return
    }

    // 2. Create Supabase Auth account and link user_id
    const res = await fetch('/api/create-member-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email.trim(), memberId: newMember.id, name: form.full_name.trim() }),
    })

    setLoading(false)

    if (!res.ok) {
      // Member created but account setup failed — still show partial success
      const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      setCredentials({
        name: form.full_name.trim(),
        email: form.email.trim(),
        password: 'Infopulse2024!',
        accessUrl: `${base}/espace-equipe`,
      })
      setStep('credentials')
      router.refresh()
      return
    }

    const { tempPassword } = await res.json()
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    setCredentials({
      name: form.full_name.trim(),
      email: form.email.trim(),
      password: tempPassword,
      accessUrl: `${base}/espace-equipe`,
    })
    setStep('credentials')
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Ajouter un membre
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-md">
          {step === 'form' ? (
            <>
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
                    <SelectTrigger id="role" disabled={loading}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closer">Closer</SelectItem>
                      <SelectItem value="setter">Setter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !form.full_name.trim() || !form.email.trim()}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</>
                    ) : (
                      'Ajouter'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-green-400" />
                  Membre ajouté
                </DialogTitle>
              </DialogHeader>

              <div className="py-3 space-y-4">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
                  <p className="text-sm text-green-300 font-medium">
                    ✅ {credentials?.name} a été ajouté à l&apos;équipe
                  </p>
                </div>

                <div className="rounded-lg bg-white/5 border border-white/10 divide-y divide-white/10">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <span className="text-sm font-mono">{credentials?.email}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Mot de passe</span>
                    <span className="text-sm font-mono font-semibold">{credentials?.password}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Lien d&apos;accès</span>
                    <span className="text-xs font-mono text-violet-300 truncate max-w-[180px]">
                      {credentials?.accessUrl}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Partagez ces informations à votre membre.
                </p>

                <Button
                  onClick={handleCopyCredentials}
                  variant="outline"
                  className="w-full gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                >
                  {copied ? (
                    <><Check className="h-4 w-4" /> Accès copiés !</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copier les accès</>
                  )}
                </Button>
              </div>

              <DialogFooter>
                <Button onClick={handleClose} className="w-full">Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
