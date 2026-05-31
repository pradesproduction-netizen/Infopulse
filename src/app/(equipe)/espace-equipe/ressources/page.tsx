import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { findTeamMemberOrNull } from '@/lib/get-team-member'
import { PaymentLinkCard } from '@/components/equipe/payment-link-card'
import { Link as LinkIcon } from 'lucide-react'
import type { PaymentLink } from '@/lib/types'

export default async function RessourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const member = await findTeamMemberOrNull(user.id, user.email ?? '')
  if (!member || member.role !== 'closer') redirect('/espace-equipe')

  const admin = createAdminClient()
  const { data: links } = await admin
    .from('payment_links')
    .select('*')
    .eq('infopreneur_id', member.infopreneur_id)
    .order('created_at', { ascending: false })

  const paymentLinks = (links ?? []) as PaymentLink[]

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Ressources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Liens de paiement mis à disposition par votre coach
        </p>
      </div>

      {paymentLinks.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-card/50 p-10 text-center">
          <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun lien de paiement disponible pour l&apos;instant.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentLinks.map((link) => (
            <PaymentLinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  )
}
