'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Package, Video, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client, CoachingStep, Call } from '@/lib/types'

interface CoachProfile {
  first_name: string | null
  last_name: string | null
}

interface AccueilClientProps {
  client: Client
  coachProfile: CoachProfile | null
  coachingSteps: CoachingStep[]
  nextCall: Call | null
}

function getMotivationMessage(pct: number) {
  if (pct === 0) return "Ton parcours commence maintenant. Bienvenue !"
  if (pct < 30) return "Tu viens de démarrer, continue sur cette lancée !"
  if (pct < 60) return "Tu es bien lancé(e), continue comme ça !"
  if (pct < 90) return "Tu y es presque, plus que quelques étapes !"
  if (pct < 100) return "La ligne d'arrivée est en vue, fonce !"
  return "Parcours terminé ! Félicitations, tu as tout donné."
}

export function AccueilClient({ client, coachProfile, coachingSteps, nextCall }: AccueilClientProps) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const firstName = client.full_name.split(' ')[0]

  const completedSteps = coachingSteps.filter((s) => s.status === 'completed').length
  const totalSteps = coachingSteps.length
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  const coachName =
    [coachProfile?.first_name, coachProfile?.last_name].filter(Boolean).join(' ') ||
    'Ton coach'

  const coachInitials =
    [coachProfile?.first_name?.[0], coachProfile?.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'C'

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
        <h1 className="text-3xl font-bold mt-1">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">{getMotivationMessage(progressPct)}</p>
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progression globale</span>
            <span className="text-violet-400 font-bold">{progressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completedSteps} étape{completedSteps !== 1 ? 's' : ''} complétée{completedSteps !== 1 ? 's' : ''} sur {totalSteps}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mon coach */}
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Mon coach</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold">
                {coachInitials}
              </div>
              <div>
                <p className="font-semibold">{coachName}</p>
                <p className="text-xs text-muted-foreground">Ton accompagnateur</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 border-white/20">
              <MessageCircle className="h-4 w-4" />
              Envoyer un message
            </Button>
          </CardContent>
        </Card>

        {/* Mon programme */}
        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Mon programme</p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Package className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{client.program_name || 'Programme en cours'}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalSteps} module{totalSteps !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {client.start_date && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Début le</p>
                    <p className="text-sm font-medium">
                      {new Date(client.start_date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prochain appel */}
      <Card className={cn(
        'border-white/10',
        nextCall ? 'bg-violet-500/[0.06] border-violet-500/30' : 'bg-card/50'
      )}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prochain appel</p>
              {nextCall ? (
                <div>
                  <p className="font-semibold text-lg">
                    {new Date(nextCall.date).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })}
                  </p>
                  {nextCall.duration && (
                    <p className="text-sm text-muted-foreground">{nextCall.duration} min</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun appel planifié pour l&apos;instant</p>
              )}
            </div>
            {nextCall && (
              <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Video className="h-4 w-4" />
                Rejoindre l&apos;appel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
