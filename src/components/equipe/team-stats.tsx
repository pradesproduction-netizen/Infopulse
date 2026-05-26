'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, TrendingUp, UserCheck, Euro } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call, TeamMember } from '@/lib/types'

interface Payment {
  amount: number
  status: string
  payment_date: string
}

interface TeamStatsProps {
  calls: Call[]
  teamMembers: TeamMember[]
  payments: Payment[]
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function TeamStats({ calls, teamMembers, payments }: TeamStatsProps) {
  const thisMonthCalls = calls.filter((c) => isThisMonth(c.call_date))
  const completed = thisMonthCalls.filter((c) => c.status === 'completed').length
  const noShow = thisMonthCalls.filter((c) => c.status === 'no_show').length
  const showUpRate =
    completed + noShow > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0

  const caMonth = payments
    .filter((p) => p.status === 'paid' && isThisMonth(p.payment_date))
    .reduce((sum, p) => sum + p.amount, 0)

  const stats = [
    {
      title: 'Appels ce mois',
      value: String(thisMonthCalls.length),
      sub: `${teamMembers.filter((m) => m.active).length} membres actifs`,
      icon: Phone,
      iconBg: 'bg-violet-500',
    },
    {
      title: 'Appels complétés',
      value: String(completed),
      sub: `${noShow} no-show${noShow !== 1 ? 's' : ''}`,
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
      value: caMonth > 0 ? `${caMonth.toLocaleString('fr-FR')} €` : '— €',
      sub: caMonth > 0 ? 'Paiements encaissés ce mois' : 'Aucun paiement ce mois',
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
