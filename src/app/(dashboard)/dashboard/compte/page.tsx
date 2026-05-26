import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompteLayout } from '@/components/compte/compte-layout'

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: objective }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('objectives').select('*').eq('infopreneur_id', user.id).eq('period', 'monthly').single(),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gère ton profil, ton abonnement et tes préférences
        </p>
      </div>

      <CompteLayout
        profile={profile ?? null}
        objective={objective ?? null}
        userEmail={user.email ?? ''}
        userId={user.id}
      />
    </div>
  )
}
