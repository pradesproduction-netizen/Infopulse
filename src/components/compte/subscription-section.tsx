'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Building2, Zap } from 'lucide-react'

const STARTER_FEATURES = [
  '10 clients max',
  '2 membres équipe',
  'Dashboard KPI',
  'Chat IA basique',
]

const PRO_FEATURES = [
  'Clients illimités',
  'Équipe illimitée',
  'IA avancée',
  'Recordings & transcriptions',
  'Contrats YouSign',
  'Emails Resend',
]

const ENTERPRISE_FEATURES = [
  'Tout le plan Pro',
  'Onboarding dédié',
  'Support prioritaire',
  'Intégrations custom',
]

interface SubscriptionSectionProps {
  currentPlan?: string | null
}

export function SubscriptionSection({ currentPlan }: SubscriptionSectionProps) {
  const router = useRouter()
  const plan = currentPlan ?? 'free'
return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Abonnement</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gère ton plan et accède aux fonctionnalités avancées
        </p>
      </div>

      {/* Current plan banner */}
      <Card className="border-white/10 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Plan actuel</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-semibold capitalize">
                  {plan === 'free' ? 'Starter' : plan === 'starter' ? 'Starter' : plan === 'pro' ? 'Pro' : 'Enterprise'}
                </p>
                {plan === 'free' || plan === 'starter' ? (
                  <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-300 border-gray-500/30">
                    Gratuit
                  </Badge>
                ) : plan === 'pro' ? (
                  <Badge className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Pro
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Enterprise
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {plan === 'free' || plan === 'starter' ? '0 €' : plan === 'pro' ? '97 €' : 'Sur devis'}
              </p>
              {(plan === 'free' || plan === 'starter' || plan === 'pro') && (
                <p className="text-xs text-muted-foreground">/ mois</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Starter */}
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-blue-400" />
                Starter
              </CardTitle>
              {(plan === 'free' || plan === 'starter') && (
                <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-300 border-gray-500/30">
                  Actuel
                </Badge>
              )}
            </div>
            <div className="pt-1">
              <p className="text-2xl font-bold">
                29 €<span className="text-sm font-normal text-muted-foreground"> / mois</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">ou 290 € / an (-20%)</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {STARTER_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                {f}
              </div>
            ))}
            {plan === 'free' || plan === 'starter' ? (
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/dashboard/checkout/starter')}
              >
                Passer au Starter
              </Button>
            ) : plan === 'pro' ? (
              <Button variant="outline" className="w-full mt-4" disabled>
                Plan inférieur
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-violet-500/50 bg-violet-500/[0.04] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-400" />
                Pro
              </CardTitle>
              {plan === 'pro' ? (
                <Badge className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Actuel
                </Badge>
              ) : (
                <Badge className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Recommandé
                </Badge>
              )}
            </div>
            <div className="pt-1">
              <p className="text-2xl font-bold">
                97 €<span className="text-sm font-normal text-muted-foreground"> / mois</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">ou 970 € / an (-20%)</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
                {f}
              </div>
            ))}
            {plan === 'pro' ? (
              <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700" disabled>
                Plan actuel
              </Button>
            ) : (
              <Button
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
                onClick={() => router.push('/dashboard/checkout/pro')}
              >
                Passer au Pro
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Enterprise */}
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400" />
              Enterprise
            </CardTitle>
            <p className="text-2xl font-bold pt-1">Sur mesure</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <p className="text-sm text-muted-foreground">
              Besoins spécifiques, grande équipe ou intégrations custom ?
            </p>
            {ENTERPRISE_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-amber-400 flex-shrink-0" />
                {f}
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full mt-4 border-amber-500/30 hover:border-amber-500/60 hover:text-amber-300"
              asChild
            >
              <a href="mailto:contact@infopulse.fr">Nous contacter</a>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
