import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, UserCheck, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call } from '@/lib/types'

interface MemberKpiCardsProps {
  calls: Call[]
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function MemberKpiCards({ calls }: MemberKpiCardsProps) {
  const thisMonth = calls.filter((c) => isThisMonth(c.call_date))
  const completed = thisMonth.filter((c) => c.status === 'completed').length
  const noShow = thisMonth.filter((c) => c.status === 'no_show').length
  const showUpRate = completed + noShow > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0

  const kpis = [
    {
      title: 'Appels ce mois',
      value: String(thisMonth.length),
      sub: 'Total planifiés + complétés',
      icon: Phone,
      iconBg: 'bg-violet-500',
    },
    {
      title: 'Appels complétés',
      value: String(completed),
      sub: 'Appels honorés',
      icon: CheckCircle,
      iconBg: 'bg-green-500',
    },
    {
      title: 'Show-up rate',
      value: `${showUpRate}%`,
      sub: `${noShow} no-show${noShow !== 1 ? 's' : ''}`,
      icon: UserCheck,
      iconBg: 'bg-blue-500',
    },
    {
      title: 'No-shows',
      value: String(noShow),
      sub: 'Appels non honorés',
      icon: XCircle,
      iconBg: 'bg-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(({ title, value, sub, icon: Icon, iconBg }) => (
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
