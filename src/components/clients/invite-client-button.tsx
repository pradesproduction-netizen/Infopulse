'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Mail, Copy, Check, Loader2, RefreshCw } from 'lucide-react'

interface InviteClientButtonProps {
  clientId: string
  clientEmail: string
}

export function InviteClientButton({ clientId, clientEmail }: InviteClientButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function generateLink() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/invite-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clientEmail, clientId }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Erreur lors de la génération du lien')
    } else {
      setLink(data.link)
    }
  }

  async function handleOpen() {
    setOpen(true)
    await generateLink()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose(v: boolean) {
    setOpen(v)
    if (!v) { setLink(''); setError('') }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2 border-white/10">
        <Mail className="h-4 w-4" />
        Inviter le client
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter le client</DialogTitle>
            <DialogDescription>
              Partage ce lien à{' '}
              <span className="font-medium text-foreground">{clientEmail}</span> pour accéder à son espace client.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération du lien…
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {link && !loading && (
              <>
                <p className="text-xs text-muted-foreground">
                  Lien valable 24h · à usage unique · redirige vers /espace-client
                </p>
                <div className="flex gap-2">
                  <Input
                    value={link}
                    readOnly
                    className="text-xs font-mono bg-white/5"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-shrink-0 border-white/10"
                    onClick={copyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {link && !loading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={generateLink}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Régénérer
              </Button>
            )}
            <Button variant="outline" onClick={() => handleClose(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
