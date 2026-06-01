'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, Calendar, UserCheck, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Prospect } from '@/lib/types'

// Stages that indicate the prospect showed up to at least one call
const HONORED_STAGES: Prospect['pipeline_stage'][] = [
  'r2_booke', 'r2_show', 'follow_up', 'signes', 'perdu',
]

interface MemberKpiCardsProps {
  initialProspects: Prospect[]
  teamMemberId: string
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

function computeKpis(prospects: Prospect[]) {
  const total = prospects.length
  const won = prospects.filter((p) => p.pipeline_stage === 'signes').length
  const scheduled = prospects.filter((p) => p.pipeline_stage === 'r1_booke').length
  const noShows = prospects.filter((p) => p.pipeline_stage === 'r1_noshow').length
  const honored = prospects.filter((p) => HONORED_STAGES.includes(p.pipeline_stage)).length
  const closingRate = total > 0 ? Math.round((won / total) * 100) : 0
  const showUpRate = honored + noShows > 0 ? Math.round((honored / (honored + noShows)) * 100) : 0
  return { total, won, scheduled, noShows, honored, closingRate, showUpRate }
}

export function MemberKpiCards({ initialProspects, teamMemberId }: MemberKpiCardsProps) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)

  // Sync when server re-renders with fresh props (after router.refresh)
  useEffect(() => {
    setProspects(initialProspects)
  }, [initialProspects])

  // Supabase Realtime — live updates on prospects table
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`kpi-prospects-${teamMemberId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospects',
          filter: `team_member_id=eq.${teamMemberId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProspects((prev) => [...prev, payload.new as Prospect])
          } else if (payload.eventType === 'UPDATE') {
            setProspects((prev) =>
              prev.map((p) => p.id === (payload.new as Prospect).id ? (payload.new as Prospect) : p)
            )
          } else if (payload.eventType === 'DELETE') {
            setProspects((prev) =>
              prev.filter((p) => p.id !== (payload.old as { id: string }).id)
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [teamMemberId])

  const { total, won, scheduled, noShows, closingRate, showUpRate } = computeKpis(prospects)

  const kpis = [
    {
      title: 'Prospects total',
      value: String(total),
      sub: `${won} gagné${won !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      iconBg: 'bg-violet-500',
    },
    {
      title: 'Taux de closing',
      value: `${closingRate}%`,
      sub: 'Prospects → Signés',
      icon: Target,
      iconBg: 'bg-green-600',
    },
    {
      title: 'Appels planifiés',
      value: String(scheduled),
      sub: 'Étape R1 booké',
      icon: Calendar,
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Show-up rate',
      value: `${showUpRate}%`,
      sub: `${noShows} no-show${noShows !== 1 ? 's' : ''}`,
      icon: UserCheck,
      iconBg: 'bg-sky-500',
    },
    {
      title: 'No-shows',
      value: String(noShows),
      sub: 'Étape R1 no-show',
      icon: XCircle,
      iconBg: 'bg-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map(({ title, value, sub, icon, iconBg }) => (
        <KpiCard key={title} title={title} value={value} sub={sub} icon={icon} iconBg={iconBg} />
      ))}
    </div>
  )
}
