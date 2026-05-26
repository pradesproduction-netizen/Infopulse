import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, UserCheck, CheckCircle, XCircle, TrendingUp, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call, Prospect } from '@/lib/types'

interface MemberKpiCardsProps {
  calls: Call[]
  prospects: Prospect[]
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function KpiCard({ title, value, sub, icon: Icon, iconBg }: {
  title: string; value: string; sub: string
  icon: React.ElementType; iconBg: string
}) {
  return (
    <Card className="border-white/10 bg-card/50">
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
  )
}

export function MemberKpiCards({ calls, prospects }: MemberKpiCardsProps) {
  // Call KPIs (this month)
  const thisMonth = calls.filter((c) => isThisMonth(c.call_date))
  const completed = thisMonth.filter((c) => c.status === 'completed').length
  const noShowCalls = thisMonth.filter((c) => c.status === 'no_show').length
  const showUpRate = completed + noShowCalls > 0
    ? Math.round((completed / (completed + noShowCalls)) * 100)
    : 0

  // Prospect KPIs (all-time)
  const totalProspects = prospects.length
  const wonProspects = prospects.filter((p) => p.pipeline_stage === 'Gagné').length
  const noShowProspects = prospects.filter((p) => p.pipeline_stage === 'No show').length
  const closingRate = totalProspects > 0
    ? Math.round((wonProspects / totalProspects) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Appels ce mois" value={String(thisMonth.length)} sub="Total planifiés + complétés" icon={Phone} iconBg="bg-violet-500" />
        <KpiCard title="Appels complétés" value={String(completed)} sub="Appels honorés" icon={CheckCircle} iconBg="bg-green-500" />
        <KpiCard title="Show-up rate" value={`${showUpRate}%`} sub={`${noShowCalls} no-show${noShowCalls !== 1 ? 's' : ''}`} icon={UserCheck} iconBg="bg-blue-500" />
        <KpiCard title="No-shows" value={String(noShowCalls)} sub="Appels non honorés" icon={XCircle} iconBg="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Prospects total"
          value={String(totalProspects)}
          sub={`${wonProspects} gagné${wonProspects !== 1 ? 's' : ''}`}
          icon={TrendingUp}
          iconBg="bg-violet-500"
        />
        <KpiCard
          title="Taux de closing"
          value={`${closingRate}%`}
          sub="Prospects → Gagnés"
          icon={Target}
          iconBg="bg-green-500"
        />
        <KpiCard
          title="No-shows pipeline"
          value={String(noShowProspects)}
          sub="Prospects no-show"
          icon={XCircle}
          iconBg="bg-orange-500"
        />
      </div>
    </div>
  )
}
