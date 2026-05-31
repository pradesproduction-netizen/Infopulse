import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles, TrendingUp, AlertTriangle, FileDown, ArrowRight } from 'lucide-react'

interface WeeklyRecapProps {
  caContracte: number
  caContracteTarget: number
  caCollecte: number
  caCollecteTarget: number
  closingRate: number
  closingRateTarget: number
  weekLabel: string
}

export function WeeklyRecap({
  caContracte,
  caContracteTarget,
  caCollecte,
  caCollecteTarget,
  closingRate,
  closingRateTarget,
  weekLabel,
}: WeeklyRecapProps) {
  const contracteProgress = caContracteTarget > 0 ? Math.min(100, Math.round((caContracte / caContracteTarget) * 100)) : 0
  const collecteProgress = caCollecteTarget > 0 ? Math.min(100, Math.round((caCollecte / caCollecteTarget) * 100)) : 0
  const closingProgress = closingRateTarget > 0 ? Math.min(100, Math.round((closingRate / closingRateTarget) * 100)) : 0

  const positives: string[] = []
  const improvements: string[] = []

  if (contracteProgress >= 80) positives.push(`CA contracté à ${contracteProgress}% de l'objectif`)
  else improvements.push(`CA contracté : ${caContracte.toLocaleString('fr-FR')} € / ${caContracteTarget.toLocaleString('fr-FR')} € (${contracteProgress}%)`)

  if (collecteProgress >= 80) positives.push(`CA collecté à ${collecteProgress}% de l'objectif`)
  else improvements.push(`CA collecté : ${caCollecte.toLocaleString('fr-FR')} € / ${caCollecteTarget.toLocaleString('fr-FR')} € (${collecteProgress}%)`)

  if (closingProgress >= 80) positives.push(`Taux de closing à ${closingRate}% (objectif ${closingRateTarget}%)`)
  else improvements.push(`Taux de closing à ${closingRate}% — objectif ${closingRateTarget}%`)

  if (caContracteTarget === 0 && caCollecteTarget === 0) {
    positives.length = 0
    improvements.length = 0
    positives.push('Définis tes objectifs dans Compte → Objectifs pour débloquer le suivi')
  }

  return (
    <Card className="border-white/10 bg-gradient-to-br from-violet-500/5 to-green-500/5 backdrop-blur-xl">
      <CardHeader>
        <div>
          <CardTitle>Bilan hebdomadaire</CardTitle>
          <CardDescription className="mt-1">{weekLabel}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CA contracté</span>
              <span className="font-medium">
                {caContracte.toLocaleString('fr-FR')} €{caContracteTarget > 0 ? ` / ${caContracteTarget.toLocaleString('fr-FR')} €` : ''}
              </span>
            </div>
            <Progress value={contracteProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CA collecté</span>
              <span className="font-medium">
                {caCollecte.toLocaleString('fr-FR')} €{caCollecteTarget > 0 ? ` / ${caCollecteTarget.toLocaleString('fr-FR')} €` : ''}
              </span>
            </div>
            <Progress value={collecteProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taux de closing</span>
              <span className="font-medium">
                {closingRate}%{closingRateTarget > 0 ? ` / ${closingRateTarget}%` : ''}
              </span>
            </div>
            <Progress value={closingProgress} className="h-2" />
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
