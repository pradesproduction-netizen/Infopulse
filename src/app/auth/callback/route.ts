import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        const admin = createAdminClient()

        const { data: teamMember } = await admin
          .from('team_members')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        if (teamMember) {
          return NextResponse.redirect(`${origin}/espace-equipe`)
        }

        const { data: client } = await admin
          .from('clients')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()

        if (client) {
          return NextResponse.redirect(`${origin}/espace-client`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
