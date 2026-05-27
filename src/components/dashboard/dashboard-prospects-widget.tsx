'use client'

import { useProspectsKpis } from '@/hooks/use-prospects-kpis'
import { usePaymentAlerts } from '@/hooks/use-payment-alerts'
import { useUpcomingPayments } from '@/hooks/use-upcoming-payments'
import { WeeklyRecap } from '@/components/dashboard/weekly-recap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Euro, Phone, TrendingUp, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

function getUpcomingPaymentsSub(): string {
  const now = new Date()
  const raw = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const monthLabel = raw.charAt(0).toUpperCase() + raw.slice(1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = lastDayOfMonth - now.getDate()
  return `${monthLabel} · ${daysLeft} jour${daysLeft !== 1 ? 's' : ''} restant${daysLeft !== 1 ? 's' : ''}`
}

function StatCard({ title, value, sub, icon: Icon, iconBg }: {
  title: string; value: string; sub: string; icon: React.ElementType; iconBg: string
}) {
  return (
    <Card className="border-white/10 bg-card/50 hover:bg-card/70 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

interface DashboardProspectsWidgetProps {
  infopreneurId: string
  overdueCount: number
  caWeek: number
  caTarget: number
  closingRate: number
  closingRateTarget: number
  showUpRate: number
  showUpRateTarget: number
  weekLabel: string
  children?: React.ReactNode
}

export function DashboardProspectsWidget({
  infopreneurId,
  overdueCount,
  caWeek,
  caTarget,
  closingRate,
  closingRateTarget,
  showUpRate,
  showUpRateTarget,
  weekLabel,
  children,
}: DashboardProspectsWidgetProps) {
  const { caMonth, rdvBooke } = useProspectsKpis(infopreneurId)
  const alertCount = usePaymentAlerts(infopreneurId)
  const upcomingTotal = useUpcomingPayments(infopreneurId)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CA du mois"
          value={caMonth > 0 ? `${caMonth.toLocaleString('fr-FR')} €` : '— €'}
          sub={caMonth > 0 ? 'Prospects gagnés ce mois' : 'Aucun prospect gagné ce mois'}
          icon={Euro}
          iconBg="bg-violet-500"
        />
        <StatCard
          title="Appels prévus"
          value={String(rdvBooke)}
          sub={rdvBooke > 0 ? `RDV booké${rdvBooke !== 1 ? 's' : ''}` : 'Aucun RDV planifié'}
          icon={Phone}
          iconBg="bg-blue-500"
        />
        <StatCard
          title="Paiements à venir"
          value={upcomingTotal > 0 ? `${upcomingTotal.toLocaleString('fr-FR')} €` : '— €'}
          sub={getUpcomingPaymentsSub()}
          icon={TrendingUp}
          iconBg="bg-green-500"
        />
        {alertCount > 0 ? (
          <Link href="/dashboard/clients?filtre=retard" className="block group">
            <StatCard
              title="Relances paiement"
              value={String(alertCount)}
              sub="Voir les clients concernés →"
              icon={Bell}
              iconBg="bg-red-500"
            />
          </Link>
        ) : (
          <StatCard
            title="Relances paiement"
            value="0"
            sub="Aucun retard de paiement"
            icon={Bell}
            iconBg="bg-gray-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
        <WeeklyRecap
          caWeek={caWeek}
          caTarget={caTarget}
          closingRate={closingRate}
          closingRateTarget={closingRateTarget}
          showUpRate={showUpRate}
          showUpRateTarget={showUpRateTarget}
          weekLabel={weekLabel}
        />
      </div>
    </div>
  )
}
