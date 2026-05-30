'use client'

import { useState } from 'react'
import { useProspectsKpis } from '@/hooks/use-prospects-kpis'
import { usePaymentAlerts } from '@/hooks/use-payment-alerts'
import { KpiSlideOver, type PanelType } from '@/components/dashboard/kpi-slide-over'
import { WeeklyRecap } from '@/components/dashboard/weekly-recap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Euro, Phone, TrendingUp, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'


function StatCard({
  title, value, sub, icon: Icon, iconBg, onClick, danger,
}: {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  iconBg: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <Card
      className={cn(
        'border-white/10 bg-card/50 hover:bg-card/70 transition-colors',
        onClick && 'cursor-pointer',
        danger && 'border-red-500/40 bg-red-500/[0.06] hover:bg-red-500/[0.10]'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', danger && 'text-red-400')}>{value}</div>
        <p className={cn('text-xs mt-1', danger ? 'text-red-400' : 'text-muted-foreground')}>{sub}</p>
      </CardContent>
    </Card>
  )
}

interface UpcomingPaymentItem {
  amount: number
  next_payment_date: string | null
  clients: { id: string; full_name: string } | null
  [key: string]: unknown
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
  upcomingTotal: number
  upcomingCount: number
  upcomingPayments?: UpcomingPaymentItem[]
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
  upcomingTotal,
  upcomingCount,
  upcomingPayments,
  children,
}: DashboardProspectsWidgetProps) {
  const { caMonth, rdvBooke } = useProspectsKpis(infopreneurId)
  const alertCount = usePaymentAlerts(infopreneurId)
  const [openPanel, setOpenPanel] = useState<PanelType | null>(null)

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="CA du mois"
            value={caMonth > 0 ? `${caMonth.toLocaleString('fr-FR')} €` : '— €'}
            sub={caMonth > 0 ? 'Prospects gagnés ce mois' : 'Aucun prospect gagné ce mois'}
            icon={Euro}
            iconBg="bg-violet-500"
            onClick={() => setOpenPanel('ca_mois')}
          />
          <StatCard
            title="Appels prévus"
            value={String(rdvBooke)}
            sub={rdvBooke > 0 ? `RDV booké${rdvBooke !== 1 ? 's' : ''}` : 'Aucun RDV planifié'}
            icon={Phone}
            iconBg="bg-blue-500"
            onClick={() => setOpenPanel('rdv_booke')}
          />
          <StatCard
            title="Paiements à venir"
            value={upcomingTotal > 0 ? `${upcomingTotal.toLocaleString('fr-FR')} €` : '— €'}
            sub={upcomingCount > 0
              ? `${upcomingCount} paiement${upcomingCount !== 1 ? 's' : ''} ce mois · En attente`
              : 'Aucun paiement en attente'
            }
            icon={TrendingUp}
            iconBg="bg-green-500"
            onClick={() => setOpenPanel('paiements')}
          />
          <StatCard
            title="Relances paiement"
            value={String(alertCount)}
            sub={alertCount > 0 ? `${alertCount} client${alertCount !== 1 ? 's' : ''} à relancer` : 'Aucun retard de paiement'}
            icon={Bell}
            iconBg={alertCount > 0 ? 'bg-red-500' : 'bg-gray-500'}
            danger={alertCount > 0}
            onClick={alertCount > 0 ? () => setOpenPanel('relances') : undefined}
          />
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

      <KpiSlideOver
        type={openPanel}
        infopreneurId={infopreneurId}
        onClose={() => setOpenPanel(null)}
        upcomingPayments={upcomingPayments}
      />
    </>
  )
}
