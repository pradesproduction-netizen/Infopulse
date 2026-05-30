'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-violet-500" />
            <h1 className="text-3xl font-bold tracking-tight">INFOPULSE</h1>
          </div>
        </div>

        <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
            <CardDescription>
              Saisis ton email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-300">Email envoyé !</p>
                    <p className="text-xs text-green-300/70 mt-0.5">
                      Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
                    </p>
                  </div>
                </div>
                <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-violet-500 hover:bg-violet-600"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</>
                  ) : (
                    'Envoyer le lien'
                  )}
                </Button>

                <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
