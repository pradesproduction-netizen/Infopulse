'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileSectionProps {
  profile: Profile | null
  userEmail: string
}

export function ProfileSection({ profile, userEmail }: ProfileSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    bio: profile?.bio ?? '',
  })

  const initials =
    [form.first_name[0], form.last_name[0]].filter(Boolean).join('').toUpperCase() ||
    userEmail[0]?.toUpperCase() ||
    'U'

  const displayName =
    [form.first_name, form.last_name].filter(Boolean).join(' ') || 'Ton nom'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('profiles').upsert({
      id: user.id,
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
    })

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tes informations personnelles visibles sur le compte
        </p>
      </div>

      <Card className="border-white/10 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold select-none">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-card border border-white/20 flex items-center justify-center">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
              <button className="text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors">
                Changer la photo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder="Prénom"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder="Nom"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                L&apos;adresse email ne peut pas être modifiée ici.
              </p>
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
              <Label htmlFor="bio">Bio courte</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Coach business, j'aide les entrepreneurs à..."
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
              {saved && (
                <span className="text-sm text-green-400">Enregistré ✓</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
