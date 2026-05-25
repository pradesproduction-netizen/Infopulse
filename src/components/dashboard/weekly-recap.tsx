import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles, TrendingUp, AlertTriangle, FileDown, ArrowRight } from 'lucide-react'

export function WeeklyRecap() {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-violet-500/5 to-green-500/5 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              📊 Bilan hebdomadaire
            </CardTitle>
            <CardDescription className="mt-1">
              Semaine du 18 au 24 mai 2026 • Généré lundi à 8h00
            </CardDescription>
          </div>

          {/* Score global */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Score de performance</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-green-400 bg-clip-text text-transparent">
              78/100
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* KPI vs objectifs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CA réalisé</span>
              <span className="font-medium">8 240 € / 10 000 €</span>
            </div>
            <Progress value={82} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taux closing</span>
              <span className="font-medium">42% / 50%</span>
            </div>
            <Progress value={84} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Show-up rate</span>
              <span className="font-medium">68% / 80%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </div>

        {/* Points forts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
            <h3 className="text-sm font-medium text-green-300 flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              Ce qui a bien fonctionné
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• CA en hausse de 18% vs semaine précédente</li>
              <li>• 3 nouveaux clients signés (objectif: 2)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-4">
            <h3 className="text-sm font-medium text-orange-300 flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Axes d&apos;amélioration
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Taux de show-up en baisse de 12% le jeudi</li>
              <li>• 2 clients en retard de paiement à relancer</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
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