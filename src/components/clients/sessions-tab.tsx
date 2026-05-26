'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Phone, Clock, Mic2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Call } from '@/lib/types'

const statusConfig = {
  scheduled: { label: 'Planifié', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  completed: { label: 'Terminé', className: 'bg-green-500/10 text-green-300 border-green-500/30' },
  cancelled: { label: 'Annulé', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
  no_show: { label: 'No-show', className: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
}

export function SessionsTab({ calls }: { calls: Call[]; clientId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Sessions & appels</h3>
        <Button variant="outline" size="sm" className="border-white/10 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nouvelle session
        </Button>
      </div>

      {/* Placeholder AssemblyAI */}
      <Card className="border-violet-500/10 bg-violet-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Mic2 className="h-4 w-4 text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-violet-200">Transcription & analyse IA</p>
            <p className="text-xs text-muted-foreground">
              Recordings AssemblyAI — bientôt disponible
            </p>
          </div>
          <Badge
            variant="outline"
            className="flex-shrink-0 border-violet-500/30 text-violet-400 text-xs"
          >
            Bientôt
          </Badge>
        </div>
      </Card>

      {/* Liste des sessions */}
      {calls.length === 0 ? (
        <Card className="border-white/10 bg-card/50 p-8">
          <p className="text-center text-sm text-muted-foreground">
            Aucune session enregistrée.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <Card
              key={call.id}
              className="border-white/10 bg-card/50 p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-medium">
                      {new Date(call.call_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    {call.duration_seconds && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {call.duration_seconds} min
                      </span>
                    )}
                  </div>
                  {call.outcome && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {call.outcome}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-xs flex-shrink-0', statusConfig[call.status].className)}
                >
                  {statusConfig[call.status].label}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
