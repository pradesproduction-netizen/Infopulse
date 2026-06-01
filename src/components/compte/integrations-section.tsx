'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const INTEGRATIONS = [
  { name: 'Stripe', description: 'Paiements', abbr: 'S', bgColor: 'bg-indigo-600' },
  { name: 'Resend', description: 'Emails automatiques', abbr: 'R', bgColor: 'bg-zinc-700' },
  { name: 'YouSign', description: 'Contrats PDF & signature électronique', abbr: 'Y', bgColor: 'bg-emerald-600' },
  { name: 'AssemblyAI', description: 'Transcription recordings', abbr: 'A', bgColor: 'bg-cyan-600' },
  { name: 'ManyChat', description: 'Automatisation DM', abbr: 'M', bgColor: 'bg-orange-600' },
  { name: 'Google Meet', description: 'Visioconférence', abbr: 'G', bgColor: 'bg-green-600' },
  { name: 'Zoom', description: 'Visioconférence', abbr: 'Z', bgColor: 'bg-blue-600' },
]

interface IntegrationsSectionProps {
  userId: string
  tallyBaseUrl?: string | null
}

export function IntegrationsSection({ userId, tallyBaseUrl }: IntegrationsSectionProps) {
  const [tallyUrl, setTallyUrl] = useState(tallyBaseUrl ?? '')
  const [tallyLoading, setTallyLoading] = useState(false)
  const [tallySaved, setTallySaved] = useState(false)

  async function handleSaveTally() {
    setTallyLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ tally_base_url: tallyUrl.trim() || null }).eq('id', userId)
    setTallyLoading(false)
    setTallySaved(true)
    setTimeout(() => setTallySaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Intégrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connecte tes outils pour automatiser ton activité
        </p>
      </div>

      {/* Tally — active integration */}
      <Card className="border-white/10 bg-card/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                T
              </div>
              <div>
                <p className="font-medium text-sm">Tally</p>
                <p className="text-xs text-muted-foreground">Formulaires d&apos;onboarding prospects</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs whitespace-nowrap',
                tallyUrl
                  ? 'bg-green-500/10 text-green-300 border-green-500/30'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
              )}
            >
              {tallyUrl ? 'Connecté' : 'Non connecté'}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tally_url" className="text-xs">URL de base du formulaire</Label>
            <div className="flex gap-2">
              <Input
                id="tally_url"
                value={tallyUrl}
                onChange={(e) => setTallyUrl(e.target.value)}
                placeholder="https://tally.so/r/..."
                className="flex-1 text-sm"
                disabled={tallyLoading}
              />
              <Button
                size="sm"
                onClick={handleSaveTally}
                disabled={tallyLoading}
                className="flex-shrink-0 gap-1.5"
              >
                {tallyLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : tallySaved
                  ? <Check className="h-3.5 w-3.5" />
                  : null}
                {tallySaved ? 'Sauvegardé' : 'Sauvegarder'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le lien sera enrichi automatiquement avec le nom, l&apos;email et le closer attribué.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Other integrations (coming soon) */}
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
