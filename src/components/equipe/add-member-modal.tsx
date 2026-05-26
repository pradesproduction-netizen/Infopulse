'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2, Copy, Link2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'form' | 'link'

export function AddMemberModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
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
    setInviteLink('')
    setInviteName('')
    setInviteEmail('')
    setEmailSent(false)
    setCopied(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setOpen(false)
    setTimeout(resetAll, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Insert team member
    const { error: insertError } = await supabase.from('team_members').insert({
      infopreneur_id: user.id,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      active: true,
    })

    if (insertError) {
      setLoading(false)
      return
    }

    // Generate magic link
    try {
      const res = await fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), name: form.full_name.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setInviteLink(data.link ?? '')
        setInviteName(form.full_name.trim())
        setInviteEmail(form.email.trim())
        setEmailSent(data.emailSent ?? false)
        setStep('link')
        router.refresh()
      } else {
        handleClose()
        router.refresh()
      }
    } catch {
      handleClose()
      router.refresh()
    } finally {
      setLoading(false)
    }
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
                  <Select value={form.role} onValueChange={(v: 'closer' | 'setter') => setForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger id="role" disabled={loading}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closer">Closer</SelectItem>
                      <SelectItem value="setter">Setter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Annuler</Button>
                  <Button type="submit" disabled={loading || !form.full_name.trim() || !form.email.trim()}>
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</>
                    ) : (
                      'Ajouter et inviter'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-violet-400" />
                  Lien d&apos;invitation
                </DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
                  <p className="text-sm text-green-300 font-medium">
                    ✓ {inviteName} a été ajouté à l&apos;équipe
                  </p>
                </div>

                {emailSent ? (
                  <div className="flex items-center gap-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3">
                    <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-300">
                      ✅ Email envoyé à <span className="font-medium">{inviteEmail}</span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
                    <p className="text-sm text-yellow-300 font-medium">
                      ⚠️ Email non envoyé (limite atteinte)
                    </p>
                    <p className="text-xs text-yellow-200/70 mt-0.5">
                      Envoyez ce lien manuellement à {inviteName} :
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  {emailSent && (
                    <p className="text-xs text-muted-foreground">
                      Lien de secours <span className="text-yellow-400">(expire dans 24h)</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2 flex-1 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground">
                        {inviteLink.length > 42 ? `${inviteLink.slice(0, 42)}…` : inviteLink}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-shrink-0 border-white/20 gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copier
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-400">✅ Lien copié !</p>
                  )}
                </div>
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
