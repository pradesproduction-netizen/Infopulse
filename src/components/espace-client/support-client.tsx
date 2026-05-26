'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Mail, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SupportClientProps {
  coachName: string
  coachEmail: string | null
}

const FAQ = [
  {
    question: 'Comment accéder à mon prochain appel ?',
    answer:
      'Rends-toi sur la page Accueil de ton espace client. Le bouton "Rejoindre l\'appel" apparaît automatiquement lorsqu\'un appel est planifié par ton coach.',
  },
  {
    question: 'Comment suivre ma progression ?',
    answer:
      'Va dans la section "Ma progression" pour voir toutes les étapes de ton parcours avec leur statut (complété, en cours, à venir).',
  },
  {
    question: 'Je n\'arrive pas à me connecter. Que faire ?',
    answer:
      'Demande à ton coach de te renvoyer un lien de connexion. Le lien magic link est valable 24h et à usage unique.',
  },
  {
    question: 'Où trouver mes factures ?',
    answer:
      'Tes paiements et reçus se trouvent dans la section "Mes paiements". Si une facture manque, contacte ton coach.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export function SupportClient({ coachName, coachEmail }: SupportClientProps) {
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-1">Besoin d&apos;aide ? On est là pour toi.</p>
      </div>

      {/* Contact coach */}
      <Card className="border-violet-500/30 bg-violet-500/[0.05]">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0">
              {coachName[0]?.toUpperCase() || 'C'}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{coachName}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Ton accompagnateur</p>
              {coachEmail ? (
                <Button
                  className="mt-3 gap-2 bg-violet-600 hover:bg-violet-700"
                  asChild
                >
                  <a href={`mailto:${coachEmail}`}>
                    <Mail className="h-4 w-4" />
                    Envoyer un email
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Contacte ton coach via le canal habituel (email, WhatsApp, etc.)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Questions fréquentes</h2>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>

      {/* Technical issue */}
      <Card className="border-white/10 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            Problème technique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Si tu rencontres un bug ou un problème technique sur la plateforme, clique ci-dessous pour nous le signaler.
          </p>
          <Button
            variant="outline"
            className="gap-2 border-white/20"
            asChild
          >
            <a href="mailto:support@infopulse.fr?subject=Problème technique espace client">
              <AlertTriangle className="h-4 w-4" />
              Signaler un problème
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
