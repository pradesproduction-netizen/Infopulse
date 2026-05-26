'use client'

import { Check, Lock, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoachingStep } from '@/lib/types'

interface ProgressionTimelineProps {
  steps: CoachingStep[]
  progressPct: number
}

function getMotivationMessage(pct: number) {
  if (pct === 0) return "Ton parcours commence — tu vas y arriver !"
  if (pct < 30) return "Bon démarrage, continue sur ta lancée !"
  if (pct < 60) return "Tu avances bien, garde ce rythme !"
  if (pct < 90) return "Tu y es presque, fonce !"
  if (pct < 100) return "Dernière ligne droite, tu assures !"
  return "Parcours terminé — bravo pour ton engagement !"
}

export function ProgressionTimeline({ steps, progressPct }: ProgressionTimelineProps) {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Ma progression</h1>
        <p className="text-muted-foreground mt-1">{getMotivationMessage(progressPct)}</p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {steps.filter((s) => s.status === 'completed').length} / {steps.length} étapes complétées
          </span>
          <span className="text-violet-400 font-bold">{progressPct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Vertical timeline */}
      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Ton coach n&apos;a pas encore défini les étapes de ton parcours.
        </p>
      ) : (
        <div className="relative space-y-0">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            return (
              <div key={step.id} className="flex gap-4">
                {/* Left: circle + connector line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all',
                      step.status === 'completed' &&
                        'bg-violet-500 shadow-md shadow-violet-500/30',
                      step.status === 'in_progress' &&
                        'bg-background border-2 border-violet-500 animate-pulse',
                      step.status === 'locked' &&
                        'bg-white/5 border border-white/20'
                    )}
                  >
                    {step.status === 'completed' && <Check className="h-4 w-4 text-white" />}
                    {step.status === 'in_progress' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                    )}
                    {step.status === 'locked' && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'w-0.5 flex-1 my-1 min-h-[2rem]',
                        step.status === 'completed' ? 'bg-violet-500/40' : 'bg-white/10'
                      )}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div className={cn('pb-8 flex-1', isLast && 'pb-0')}>
                  <div
                    className={cn(
                      'rounded-xl border p-4',
                      step.status === 'completed' &&
                        'border-violet-500/20 bg-violet-500/[0.05]',
                      step.status === 'in_progress' &&
                        'border-violet-500/40 bg-violet-500/[0.08]',
                      step.status === 'locked' &&
                        'border-white/10 bg-white/[0.02] opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p
                          className={cn(
                            'font-semibold',
                            step.status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
                          )}
                        >
                          {step.title}
                        </p>
                        {step.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 text-xs text-violet-400 mt-1">
                            <Loader className="h-3 w-3 animate-spin" />
                            En cours
                          </span>
                        )}
                      </div>
                      {step.completed_at && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(step.completed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long',
                          })}
                        </span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
