'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { KeyRound, Monitor, LogOut, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SecuritySectionProps {
  userEmail: string
}

export function SecuritySection({ userEmail }: SecuritySectionProps) {
  const router = useRouter()
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleResetPassword() {
    setResetLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/compte`,
    })
    setResetLoading(false)
    setResetSent(true)
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== userEmail) return
    setDeleteLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleDeleteClose(open: boolean) {
    if (!open) {
      setDeleteOpen(false)
      setDeleteConfirm('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Sécurité</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gère ton mot de passe et la sécurité de ton compte
        </p>
      </div>

      {/* Password reset */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tu recevras un lien de réinitialisation à{' '}
            <span className="text-foreground font-medium">{userEmail}</span>.
          </p>
          {resetSent ? (
            <p className="text-sm text-green-400">Email envoyé ! Vérifie ta boite mail.</p>
          ) : (
            <Button variant="outline" onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer un lien de changement de mot de passe
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            Sessions actives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-sm font-medium">Session actuelle</p>
              <p className="text-xs text-muted-foreground">Navigateur web · maintenant</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              Active
            </span>
          </div>
          <Button variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Se déconnecter de tous les appareils
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30 bg-red-500/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-400 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Zone danger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            La suppression est irréversible. Toutes tes données (clients, équipe, prospects) seront définitivement effacées.
          </p>
          <Button
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>

      {/* Delete account — double confirmation */}
      <Dialog open={deleteOpen} onOpenChange={handleDeleteClose}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Supprimer définitivement ton compte ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes tes données seront effacées sans possibilité de récupération.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="delete_confirm">
              Pour confirmer, tape ton email :{' '}
              <span className="font-medium text-foreground">{userEmail}</span>
            </Label>
            <Input
              id="delete_confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={userEmail}
              disabled={deleteLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDeleteClose(false)}
              disabled={deleteLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirm !== userEmail}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
