'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Package, Euro, Plus, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client, CoachingStep } from '@/lib/types'

interface OverviewTabProps {
  client: Client
  coachingSteps: CoachingStep[]
}

export function OverviewTab({ client, coachingSteps }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Date de début
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {client.start_date
                ? new Date(client.start_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              Programme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{client.program_name || '—'}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              <Euro className="h-3.5 w-3.5" />
              Montant total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {client.total_amount
                ? `${Number(client.total_amount).toLocaleString('fr-FR')} €`
                : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline orbitale */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Parcours de coaching</CardTitle>
            <Button variant="outline" size="sm" className="border-white/10 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Ajouter une étape
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {coachingSteps.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aucune étape définie. Clique sur &quot;Ajouter une étape&quot; pour commencer.
              </p>
            </div>
          ) : (
            <div className="relative pt-2 pb-4 overflow-x-auto">
              {/* Ligne de connexion horizontale */}
              <div
                className="absolute top-8 h-0.5 bg-white/10"
                style={{ left: '24px', right: '24px' }}
              />

              <div className="relative flex justify-between gap-2 min-w-max">
                {coachingSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center gap-2 w-28 px-1"
                  >
                    {/* Cercle */}
                    <div
                      className={cn(
                        'relative z-10 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                        step.status === 'completed' &&
                          'bg-violet-500 shadow-md shadow-violet-500/30',
                        step.status === 'in_progress' &&
                          'bg-background border-2 border-violet-500 animate-pulse',
                        step.status === 'locked' &&
                          'bg-white/5 border border-white/20'
                      )}
                    >
                      {step.status === 'completed' && (
                        <Check className="h-5 w-5 text-white" />
                      )}
                      {step.status === 'in_progress' && (
                        <div className="h-3 w-3 rounded-full bg-violet-500" />
                      )}
                      {step.status === 'locked' && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Titre */}
                    <p
                      className={cn(
                        'text-xs text-center font-medium leading-tight',
                        step.status === 'locked'
                          ? 'text-muted-foreground'
                          : 'text-white'
                      )}
                    >
                      {step.title}
                    </p>

                    {/* Date complétion */}
                    {step.completed_at && (
                      <p className="text-xs text-muted-foreground text-center">
                        {new Date(step.completed_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
