import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhoneCall } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call } from '@/lib/types'

interface MemberCallsListProps {
  calls: Call[]
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: 'Complété', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  scheduled: { label: 'Planifié', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  no_show: { label: 'No show', className: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
  cancelled: { label: 'Annulé', className: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}min${s > 0 ? ` ${s}s` : ''}`
}

export function MemberCallsList({ calls }: MemberCallsListProps) {
  const sorted = [...calls].sort((a, b) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime()).slice(0, 15)

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-muted-foreground" />
          Appels récents
          <span className="text-sm font-normal text-muted-foreground">({calls.length} total)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun appel enregistré pour ce membre.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((call) => {
              const statusCfg = STATUS_CONFIG[call.status] ?? STATUS_CONFIG.scheduled
              const duration = formatDuration(call.duration_seconds)
              return (
                <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {call.prospect_name ?? call.client_id ?? 'Appel'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(call.call_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {duration && ` · ${duration}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {call.outcome && (
                      <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">
                        {call.outcome}
                      </span>
                    )}
                    <Badge variant="outline" className={cn('text-xs', statusCfg.className)}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
