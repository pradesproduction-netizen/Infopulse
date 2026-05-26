import { getAuthenticatedTeamMember } from '@/lib/get-team-member'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Mail, Calendar, CheckCircle2, TrendingUp, XCircle, User } from 'lucide-react'

export default async function ProfilPage() {
  const member = await getAuthenticatedTeamMember()
  const admin = createAdminClient()

  const { data: calls } = await admin
    .from('calls')
    .select('*')
    .eq('team_member_id', member.id)

  const allCalls = calls ?? []
  const completed = allCalls.filter((c: { status: string }) => c.status === 'completed').length
  const noShows = allCalls.filter((c: { status: string }) => c.status === 'no_show').length
  const cancelled = allCalls.filter((c: { status: string }) => c.status === 'cancelled').length
  const showUpRate = allCalls.length > 0 ? Math.round((completed / allCalls.length) * 100) : 0

  const memberInitials = member.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(member.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <Card className="border-white/10 bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {memberInitials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{member.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 capitalize">
                  {member.role}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${member.active ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-red-500/10 text-red-300 border-red-500/20'}`}>
                  {member.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{member.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Membre depuis le {memberSince}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-4">Statistiques globales</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-white/10 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total appels</p>
              </div>
              <p className="text-3xl font-bold">{allCalls.length}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                <p className="text-xs text-muted-foreground">Taux de show-up</p>
              </div>
              <p className="text-3xl font-bold text-violet-400">{showUpRate}%</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <p className="text-xs text-muted-foreground">Appels terminés</p>
              </div>
              <p className="text-3xl font-bold text-green-400">{completed}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-orange-400" />
                <p className="text-xs text-muted-foreground">No-shows</p>
              </div>
              <p className="text-3xl font-bold text-orange-400">{noShows}</p>
            </CardContent>
          </Card>
        </div>

        {cancelled > 0 && (
          <Card className="border-white/10 bg-card/50 mt-4">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Appels annulés</p>
              <p className="text-lg font-semibold text-red-400">{cancelled}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
