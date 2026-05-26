'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const INTEGRATIONS = [
  {
    name: 'Stripe',
    description: 'Paiements',
    abbr: 'S',
    bgColor: 'bg-indigo-600',
  },
  {
    name: 'Resend',
    description: 'Emails automatiques',
    abbr: 'R',
    bgColor: 'bg-zinc-700',
  },
  {
    name: 'YouSign',
    description: 'Contrats PDF & signature électronique',
    abbr: 'Y',
    bgColor: 'bg-emerald-600',
  },
  {
    name: 'AssemblyAI',
    description: 'Transcription recordings',
    abbr: 'A',
    bgColor: 'bg-cyan-600',
  },
  {
    name: 'ManyChat',
    description: 'Automatisation DM',
    abbr: 'M',
    bgColor: 'bg-orange-600',
  },
  {
    name: 'Google Meet',
    description: 'Visioconférence',
    abbr: 'G',
    bgColor: 'bg-green-600',
  },
  {
    name: 'Zoom',
    description: 'Visioconférence',
    abbr: 'Z',
    bgColor: 'bg-blue-600',
  },
]

export function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Intégrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connecte tes outils pour automatiser ton activité
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.name} className="border-white/10 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                      integration.bgColor
                    )}
                  >
                    {integration.abbr}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/30 whitespace-nowrap"
                  >
                    Non connecté
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5 flex-shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Connecter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Les intégrations seront disponibles dans le plan Pro.
      </p>
    </div>
  )
}
