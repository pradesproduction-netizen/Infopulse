import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/espace-client/client-sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify this user has a client record (not a coach)
  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id, full_name, infopreneur_id')
    .eq('client_user_id', user.id)
    .single()

  if (!clientRecord) redirect('/dashboard')

  // Fetch coach name for sidebar footer
  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', clientRecord.infopreneur_id)
    .single()

  const coachName =
    [coachProfile?.first_name, coachProfile?.last_name].filter(Boolean).join(' ') ||
    'Votre coach'

  return (
    <div className="min-h-screen bg-background">
      <ClientSidebar coachName={coachName} />
      <main className="md:ml-56 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
