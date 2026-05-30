import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { InvitationMembreEmail } from '@/lib/emails/invitation-membre'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { email, name, role } = await request.json() as { email: string; name?: string; role?: string }
  if (!email) return Response.json({ error: 'Email requis' }, { status: 400 })

  const admin = createAdminClient()
  const origin = new URL(request.url).origin

  // Get infopreneur name from profile
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  const infopreneurName = (profile?.full_name as string | null) ?? user.email ?? 'Votre coach'

  // Generate magic link for member
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[invite-member] generateLink error:', linkError?.message)
    return Response.json({ error: linkError?.message ?? 'Lien non généré' }, { status: 500 })
  }

  const magicLink = linkData.properties.action_link
  const memberFirstName = (name ?? email).split(' ')[0]
  const roleLabel = role === 'closer' ? 'Closer' : role === 'setter' ? 'Setter' : role ?? 'Membre équipe'

  const { error: sendError } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? 'noreply@infopulse.fr',
    to: email,
    subject: `Tu es invité à rejoindre l'équipe ${infopreneurName}`,
    react: InvitationMembreEmail({
      memberFirstName,
      infopreneurName,
      role: roleLabel,
      magicLink,
    }),
  })

  if (sendError) {
    console.error('[invite-member] resend error:', sendError)
    return Response.json({ error: 'Erreur envoi email', link: magicLink, name, email }, { status: 500 })
  }

  return Response.json({ link: magicLink, emailSent: true, name, email })
}
