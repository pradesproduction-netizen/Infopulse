import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { InvitationClientEmail } from '@/lib/emails/invitation-client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { email, clientId } = await request.json() as { email: string; clientId: string }
  if (!email || !clientId) {
    return NextResponse.json({ error: 'email et clientId requis' }, { status: 400 })
  }

  // Verify coach owns this client and get client name
  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name')
    .eq('id', clientId)
    .eq('infopreneur_id', user.id)
    .single()

  if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

  const origin = new URL(request.url).origin
  const admin = createAdminClient()

  // Get infopreneur name
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  const coachName = (profile?.full_name as string | null) ?? user.email ?? 'Votre coach'

  // Generate magic link
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${origin}/auth/callback?next=/espace-client` },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const magicLink = data.properties.action_link
  const clientFirstName = ((client.full_name as string | null) ?? email).split(' ')[0]

  const { error: sendError } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? 'noreply@infopulse.fr',
    to: email,
    subject: `Votre coach vous invite sur INFOPULSE`,
    react: InvitationClientEmail({ clientFirstName, coachName, magicLink }),
  })

  if (sendError) {
    console.error('[invite-client] resend error:', sendError)
    // Return the link anyway so the UI can copy it manually
    return NextResponse.json({ link: magicLink, emailSent: false })
  }

  return NextResponse.json({ link: magicLink, emailSent: true })
}
