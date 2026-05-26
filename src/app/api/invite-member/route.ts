import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { email, name } = await request.json()
  if (!email) return Response.json({ error: 'Email requis' }, { status: 400 })

  const origin = new URL(request.url).origin
  const redirectTo = `${origin}/auth/callback`

  const admin = createAdminClient()

  // Run both in parallel: email send + link generation
  const [inviteResult, linkResult] = await Promise.allSettled([
    admin.auth.admin.inviteUserByEmail(email, { redirectTo }),
    admin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: { redirectTo },
    }),
  ])

  const emailSent =
    inviteResult.status === 'fulfilled' && !inviteResult.value.error

  const link =
    linkResult.status === 'fulfilled' && !linkResult.value.error
      ? (linkResult.value.data?.properties?.action_link ?? null)
      : null

  if (!link) {
    const linkError =
      linkResult.status === 'rejected'
        ? linkResult.reason?.message
        : linkResult.value.error?.message
    console.error('[invite-member] generateLink error:', linkError)
    return Response.json({ error: linkError ?? 'Lien non généré' }, { status: 500 })
  }

  if (!emailSent) {
    const reason =
      inviteResult.status === 'rejected'
        ? inviteResult.reason?.message
        : inviteResult.value.error?.message
    console.warn('[invite-member] inviteUserByEmail failed:', reason)
  }

  return Response.json({ link, emailSent, name, email })
}
