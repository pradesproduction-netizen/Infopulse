import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { findTeamMemberOrNull } from '@/lib/get-team-member'
import { PaymentLinkCard } from '@/components/equipe/payment-link-card'
import { SopDownloadButton } from '@/components/equipe/sop-download-button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Link as LinkIcon } from 'lucide-react'
import type { PaymentLink, SopDocument } from '@/lib/types'

export default async function RessourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const member = await findTeamMemberOrNull(user.id, user.email ?? '')
  if (!member) redirect('/espace-equipe')

  const admin = createAdminClient()
  const role = member.role as 'closer' | 'setter'
  const sopType = role // setter gets 'setter' SOP, closer gets 'closer' SOP

  // Fetch SOP for this member's infopreneur
  const { data: sopRaw } = await admin
    .from('sop_documents')
    .select('*')
    .eq('infopreneur_id', member.infopreneur_id)
    .eq('type', sopType)
    .maybeSingle()
  const sop = sopRaw as SopDocument | null

  // Fetch payment links (closers only)
  let paymentLinks: PaymentLink[] = []
  if (role === 'closer') {
    const { data } = await admin
      .from('payment_links')
      .select('*')
      .eq('infopreneur_id', member.infopreneur_id)
      .order('created_at', { ascending: false })
    paymentLinks = (data ?? []) as PaymentLink[]
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Ressources</h1>

      {/* SOP Document */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">
          SOP {role === 'closer' ? 'Closer' : 'Setter'}
        </h2>
        {sop ? (
          <Card className="border-white/10 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{sop.file_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mis à jour le {new Date(sop.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <SopDownloadButton type={sopType} />
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-white/10 bg-card/50 p-8 text-center">
            <FileText className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Votre coach n&apos;a pas encore partagé de SOP.
            </p>
          </div>
        )}
      </div>

      {/* Payment links — closers only */}
      {role === 'closer' && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Liens de paiement</h2>
          {paymentLinks.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-card/50 p-8 text-center">
              <LinkIcon className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucun lien de paiement disponible pour l&apos;instant.
              </p>
            </div>
          ) : (
            paymentLinks.map((link) => (
              <PaymentLinkCard key={link.id} link={link} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
