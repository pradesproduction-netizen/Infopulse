'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link2, Plus, ExternalLink, Copy, Check, Trash2, Loader2 } from 'lucide-react'
import type { PaymentLink } from '@/lib/types'

interface PaymentLinksProps {
  infopreneurId: string
}

export function PaymentLinks({ infopreneurId }: PaymentLinksProps) {
  const [links, setLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', url: '' })
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('payment_links')
      .select('*')
      .eq('infopreneur_id', infopreneurId)
      .order('created_at', { ascending: false })
    if (data) setLinks(data as PaymentLink[])
    setLoading(false)
  }, [infopreneurId])

  useEffect(() => {
    void fetchLinks()
  }, [fetchLinks])

  function closeModal() {
    setModalOpen(false)
    setForm({ name: '', url: '' })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('payment_links')
      .insert({ infopreneur_id: infopreneurId, name: form.name.trim(), url: form.url.trim() })
      .select()
      .single()
    if (data) setLinks((prev) => [data as PaymentLink, ...prev])
    setSaving(false)
    closeModal()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('payment_links').delete().eq('id', id)
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setDeletingId(null)
  }

  async function handleCopy(link: PaymentLink) {
    await navigator.clipboard.writeText(link.url)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <>
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            Liens de paiement
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-1">Chargement…</p>
          ) : links.length === 0 ? (
            <p className="text-sm text-muted-foreground py-1">Aucun lien de paiement. Ajoute un lien Stripe, PayPal ou SumUp.</p>
          ) : (
            <ul className="space-y-2">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="flex-1 text-sm font-medium truncate">{link.name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden md:block">{link.url}</span>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Ouvrir" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      title="Copier le lien"
                      onClick={() => handleCopy(link)}
                    >
                      {copiedId === link.id
                        ? <Check className="h-3.5 w-3.5 text-green-400" />
                        : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      title="Supprimer"
                      onClick={() => handleDelete(link.id)}
                      disabled={deletingId === link.id}
                    >
                      {deletingId === link.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) closeModal() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un lien de paiement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="link_name">Nom du lien *</Label>
              <Input
                id="link_name"
                placeholder="ex : Acompte 50%, Solde final, Formation complète…"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                disabled={saving}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">URL du lien *</Label>
              <Input
                id="link_url"
                type="url"
                placeholder="https://…"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving || !form.name.trim() || !form.url.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
