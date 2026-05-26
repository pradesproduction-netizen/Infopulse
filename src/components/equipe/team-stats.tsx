'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, TrendingUp, UserCheck, Euro } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call, TeamMember } from '@/lib/types'

interface TeamStatsProps {
  calls: Call[]
  teamMembers: TeamMember[]
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function TeamStats({ calls, teamMembers }: TeamStatsProps) {
  const thisMonthCalls = calls.filter((c) => isThisMonth(c.date))
  const completed = thisMonthCalls.filter((c) => c.status === 'completed').length
  const noShow = thisMonthCalls.filter((c) => c.status === 'no_show').length
  const showUpRate =
    completed + noShow > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0

  const closed = thisMonthCalls.filter((c) => c.is_closed).length
  const closingRate = completed > 0 ? Math.round((closed / completed) * 100) : 0

  const ca = thisMonthCalls.reduce((sum, c) => sum + (c.amount_closed ?? 0), 0)

  const stats = [
    {
      title: 'Appels ce mois',
      value: String(thisMonthCalls.length),
      sub: `${teamMembers.filter((m) => m.is_active).length} membres actifs`,
      icon: Phone,
      iconBg: 'bg-violet-500',
    },
    {
      title: 'Taux de closing',
      value: `${closingRate}%`,
      sub: `${closed} vente${closed !== 1 ? 's' : ''} close${closed !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      iconBg: 'bg-green-500',
    },
    {
      title: 'Show-up rate',
      value: `${showUpRate}%`,
      sub: `${completed} appel${completed !== 1 ? 's' : ''} honoré${completed !== 1 ? 's' : ''}`,
      icon: UserCheck,
      iconBg: 'bg-blue-500',
    },
    {
      title: 'CA équipe',
      value: ca > 0 ? `${ca.toLocaleString('fr-FR')} €` : '—',
      sub: 'Ce mois-ci',
      icon: Euro,
      iconBg: 'bg-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ title, value, sub, icon: Icon, iconBg }) => (
        <Card key={title} className="border-white/10 bg-card/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconBg)}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
