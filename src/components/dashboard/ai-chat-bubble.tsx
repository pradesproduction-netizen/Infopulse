'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full bg-violet-500 hover:bg-violet-600',
          'flex items-center justify-center shadow-lg shadow-violet-500/30',
          'transition-all duration-300 z-50',
          'before:absolute before:inset-0 before:rounded-full before:bg-violet-500',
          'before:animate-ping before:opacity-20',
          isOpen && 'rotate-180'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white relative z-10" />
        ) : (
          <Sparkles className="h-6 w-6 text-white relative z-10" />
        )}
      </button>

      {/* Panneau slide-in */}
      <div
        className={cn(
          'fixed right-0 top-0 h-screen w-[450px] bg-background/95 backdrop-blur-2xl',
          'border-l border-white/10 shadow-2xl z-40',
          'transition-transform duration-300 ease-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header du chat */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h2 className="font-semibold">Assistant INFOPULSE</h2>
              <p className="text-xs text-muted-foreground">
                Pose-moi une question sur ton business
              </p>
            </div>
          </div>
        </div>

        {/* Zone messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4 max-w-[85%]">
            <p className="text-sm text-violet-100">
              👋 Salut ! Je suis ton assistant IA. Bientôt je pourrai répondre à toutes tes questions sur tes clients, ton équipe et tes KPI en temps réel.
            </p>
          </div>
        </div>

        {/* Suggestions rapides */}
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {['Clients en retard', 'Meilleur closer', 'CA cette semaine'].map((suggestion) => (
            <button
              key={suggestion}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/5">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pose ta question..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/40"
            />
            <Button
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-violet-500 hover:bg-violet-600"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ⚡ Connexion IA bientôt disponible
          </p>
        </div>
      </div>

      {/* Overlay derrière le panneau */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        />
      )}
    </>
  )
}