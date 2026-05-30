import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { ConfirmationSignupEmail } from '@/lib/emails/confirmation-signup'

export async function POST(request: Request) {
  const { email, firstName } = await request.json() as { email: string; firstName: string }
  if (!email) return Response.json({ error: 'email requis' }, { status: 400 })

  const admin = createAdminClient()
  const origin = new URL(request.url).origin

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error || !data?.properties?.action_link) {
    console.error('[send-confirmation] generateLink error:', error?.message)
    return Response.json({ error: error?.message ?? 'Lien non généré' }, { status: 500 })
  }

  const confirmationLink = data.properties.action_link
  const name = firstName?.trim() || 'là'

  const { error: sendError } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? 'noreply@infopulse.fr',
    to: email,
    subject: 'Confirme ton compte INFOPULSE',
    react: ConfirmationSignupEmail({ firstName: name, confirmationLink }),
  })

  if (sendError) {
    console.error('[send-confirmation] resend error:', sendError)
    return Response.json({ error: 'Erreur envoi email' }, { status: 500 })
  }

  return Response.json({ sent: true })
}
