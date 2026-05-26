import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles, TrendingUp, AlertTriangle, FileDown, ArrowRight } from 'lucide-react'

interface WeeklyRecapProps {
  caWeek: number
  caTarget: number
  closingRate: number
  closingRateTarget: number
  showUpRate: number
  showUpRateTarget: number
  weekLabel: string
}

export function WeeklyRecap({
  caWeek,
  caTarget,
  closingRate,
  closingRateTarget,
  showUpRate,
  showUpRateTarget,
  weekLabel,
}: WeeklyRecapProps) {
  const caProgress = caTarget > 0 ? Math.min(100, Math.round((caWeek / caTarget) * 100)) : 0
  const closingProgress = closingRateTarget > 0 ? Math.min(100, Math.round((closingRate / closingRateTarget) * 100)) : 0
  const showUpProgress = showUpRateTarget > 0 ? Math.min(100, Math.round((showUpRate / showUpRateTarget) * 100)) : 0

  const score = Math.round((caProgress + closingProgress + showUpProgress) / 3)

  const positives: string[] = []
  const improvements: string[] = []

  if (caProgress >= 80) positives.push(`CA à ${caProgress}% de l'objectif hebdomadaire`)
  else improvements.push(`CA à ${caProgress}% de l'objectif (${caWeek.toLocaleString('fr-FR')} € / ${caTarget.toLocaleString('fr-FR')} €)`)

  if (closingProgress >= 80) positives.push(`Taux de closing à ${closingRate}% (objectif ${closingRateTarget}%)`)
  else improvements.push(`Taux de closing à ${closingRate}% — objectif ${closingRateTarget}%`)

  if (showUpProgress >= 80) positives.push(`Show-up rate à ${showUpRate}% (objectif ${showUpRateTarget}%)`)
  else improvements.push(`Show-up rate à ${showUpRate}% — objectif ${showUpRateTarget}%`)

  if (positives.length === 0 && caTarget === 0) {
    positives.push('Définis tes objectifs dans Compte → Objectifs pour débloquer le score')
  }

  return (
    <Card className="border-white/10 bg-gradient-to-br from-violet-500/5 to-green-500/5 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              📊 Bilan hebdomadaire
            </CardTitle>
            <CardDescription className="mt-1">
              {weekLabel}
            </CardDescription>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Score de performance</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-green-400 bg-clip-text text-transparent">
              {caTarget > 0 ? `${score}/100` : '—/100'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CA réalisé</span>
              <span className="font-medium">
                {caWeek.toLocaleString('fr-FR')} € {caTarget > 0 ? `/ ${caTarget.toLocaleString('fr-FR')} €` : ''}
              </span>
            </div>
            <Progress value={caProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taux closing</span>
              <span className="font-medium">
                {closingRate}% {closingRateTarget > 0 ? `/ ${closingRateTarget}%` : ''}
              </span>
            </div>
            <Progress value={closingProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Show-up rate</span>
              <span className="font-medium">
                {showUpRate}% {showUpRateTarget > 0 ? `/ ${showUpRateTarget}%` : ''}
              </span>
            </div>
            <Progress value={showUpProgress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
            <h3 className="text-sm font-medium text-green-300 flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              Ce qui a bien fonctionné
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {positives.length > 0
                ? positives.map((p, i) => <li key={i}>• {p}</li>)
                : <li>• Aucun objectif atteint cette semaine</li>
              }
            </ul>
          </div>

          <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-4">
            <h3 className="text-sm font-medium text-orange-300 flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Axes d&apos;amélioration
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {improvements.length > 0
                ? improvements.map((p, i) => <li key={i}>• {p}</li>)
                : <li>• Tous les objectifs sont atteints 🎉</li>
              }
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" className="border-white/10">
            Voir le bilan complet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
            <Sparkles className="mr-2 h-4 w-4" />
            Affiner avec l&apos;IA
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            <FileDown className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
