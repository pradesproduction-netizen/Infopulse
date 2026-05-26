import type { ElementType } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Euro, Phone, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: ElementType
  iconColor: string
}

function StatCard({ title, value, change, changeType, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card className="border-white/10 bg-card/50 hover:bg-card/70 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconColor)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            'text-xs mt-1 flex items-center gap-1',
            changeType === 'positive' && 'text-green-400',
            changeType === 'negative' && 'text-red-400',
            changeType === 'neutral' && 'text-muted-foreground'
          )}>
            {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
            {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  caMonth: number
  todayCalls: number
  upcomingPaymentsTotal: number
  overdueCount: number
}

export function StatsCards({ caMonth, todayCalls, upcomingPaymentsTotal, overdueCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="CA du mois"
        value={caMonth > 0 ? `${caMonth.toLocaleString('fr-FR')} €` : '— €'}
        change={caMonth > 0 ? 'Paiements encaissés' : 'Aucun paiement ce mois'}
        changeType={caMonth > 0 ? 'positive' : 'neutral'}
        icon={Euro}
        iconColor="bg-violet-500"
      />
      <StatCard
        title="Appels prévus"
        value={String(todayCalls)}
        change={todayCalls > 0 ? "Planifiés aujourd'hui" : "Aucun appel aujourd'hui"}
        changeType="neutral"
        icon={Phone}
        iconColor="bg-blue-500"
      />
      <StatCard
        title="Paiements à venir"
        value={upcomingPaymentsTotal > 0 ? `${upcomingPaymentsTotal.toLocaleString('fr-FR')} €` : '— €'}
        change="Dans les 7 prochains jours"
        changeType="neutral"
        icon={TrendingUp}
        iconColor="bg-green-500"
      />
      <StatCard
        title="Alertes critiques"
        value={String(overdueCount)}
        change={overdueCount > 0 ? 'Clients en retard de paiement' : 'Aucun retard'}
        changeType={overdueCount > 0 ? 'negative' : 'neutral'}
        icon={AlertTriangle}
        iconColor={overdueCount > 0 ? 'bg-red-500' : 'bg-gray-500'}
      />
    </div>
  )
}
