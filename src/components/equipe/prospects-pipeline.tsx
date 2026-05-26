'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddProspectModal } from './add-prospect-modal'
import type { Prospect } from '@/lib/types'

interface ProspectsPipelineProps {
  prospects: Prospect[]
}

const COLUMNS: {
  stage: Prospect['pipeline_stage']
  label: string
  borderColor: string
  headerClass: string
  badgeClass: string
}[] = [
  {
    stage: 'nouveau_lead',
    label: 'Nouveau lead',
    borderColor: 'border-slate-500/30',
    headerClass: 'bg-slate-500/10 text-slate-300',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  },
  {
    stage: 'set_en_cours',
    label: 'Set en cours',
    borderColor: 'border-blue-500/30',
    headerClass: 'bg-blue-500/10 text-blue-300',
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  },
  {
    stage: 'rdv_booke',
    label: 'RDV booké',
    borderColor: 'border-violet-500/30',
    headerClass: 'bg-violet-500/10 text-violet-300',
    badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  },
  {
    stage: 'no_show',
    label: 'No show',
    borderColor: 'border-orange-500/30',
    headerClass: 'bg-orange-500/10 text-orange-300',
    badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  },
  {
    stage: 'proposition_envoyee',
    label: 'Proposition envoyée',
    borderColor: 'border-yellow-500/30',
    headerClass: 'bg-yellow-500/10 text-yellow-300',
    badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  },
  {
    stage: 'follow_up',
    label: 'Follow-up',
    borderColor: 'border-sky-500/30',
    headerClass: 'bg-sky-500/10 text-sky-300',
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  },
  {
    stage: 'gagne',
    label: 'Gagné',
    borderColor: 'border-green-500/30',
    headerClass: 'bg-green-500/10 text-green-300',
    badgeClass: 'bg-green-500/10 text-green-300 border-green-500/30',
  },
  {
    stage: 'perdu',
    label: 'Perdu',
    borderColor: 'border-red-500/30',
    headerClass: 'bg-red-500/10 text-red-300',
    badgeClass: 'bg-red-500/10 text-red-300 border-red-500/30',
  },
]

function ProspectCard({ prospect, badgeClass }: { prospect: Prospect; badgeClass: string }) {
  const initials = prospect.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="border-white/10 bg-card/80 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{prospect.full_name}</p>
            {prospect.estimated_amount && (
              <p className="text-xs text-muted-foreground">
                {prospect.estimated_amount.toLocaleString('fr-FR')} €
              </p>
            )}
          </div>
        </div>
        {prospect.source && (
          <div className="mt-2">
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', badgeClass)}>
              {prospect.source}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ProspectsPipeline({ prospects }: ProspectsPipelineProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        Pipeline prospects
        <span className="text-sm font-normal text-muted-foreground">({prospects.length})</span>
      </h2>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colProspects = prospects.filter((p) => p.pipeline_stage === col.stage)

            return (
              <div
                key={col.stage}
                className={cn(
                  'w-52 flex-shrink-0 rounded-xl border bg-card/30 flex flex-col',
                  col.borderColor
                )}
              >
                <div className={cn('rounded-t-xl px-3 py-2 flex items-center justify-between', col.headerClass)}>
                  <span className="text-xs font-semibold">{col.label}</span>
                  <span className="text-xs font-bold opacity-70">{colProspects.length}</span>
                </div>

                <div className="flex-1 p-2 space-y-2 min-h-[100px]">
                  {colProspects.map((p) => (
                    <ProspectCard key={p.id} prospect={p} badgeClass={col.badgeClass} />
                  ))}
                </div>

                <div className="px-2 pb-2">
                  <AddProspectModal defaultStage={col.stage} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
