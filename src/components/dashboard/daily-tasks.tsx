'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Phone, FileText, MessageCircle, Trophy, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  type: 'reminder' | 'followup' | 'contract' | 'call' | 'review' | 'celebrate'
  description: string
  clientName?: string
  clientId?: string
  priority: 'critical' | 'high' | 'normal'
  completed: boolean
}

const initialTasks: Task[] = [
  {
    id: '1',
    type: 'reminder',
    description: 'Relancer pour paiement en retard de 3 jours',
    clientName: 'Marie Dupont',
    clientId: 'client-1',
    priority: 'critical',
    completed: false,
  },
  {
    id: '2',
    type: 'call',
    description: 'Appel de coaching prévu à 14h',
    clientName: 'Thomas Bernard',
    clientId: 'client-2',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    type: 'contract',
    description: 'Envoyer le contrat à signer',
    clientName: 'Sophie Martin',
    clientId: 'client-3',
    priority: 'high',
    completed: false,
  },
  {
    id: '4',
    type: 'followup',
    description: 'Follow-up prospect après RDV de découverte',
    clientName: 'Lucas Petit',
    clientId: 'prospect-1',
    priority: 'normal',
    completed: false,
  },
  {
    id: '5',
    type: 'review',
    description: 'Reviewer le recording d\'appel de vente',
    clientName: 'Hayden (closer)',
    priority: 'normal',
    completed: false,
  },
  {
    id: '6',
    type: 'celebrate',
    description: 'Féliciter pour étape "Positionnement" franchie',
    clientName: 'Ambre Roussel',
    clientId: 'client-4',
    priority: 'normal',
    completed: false,
  },
]

const typeConfig = {
  reminder: { icon: AlertCircle, color: 'text-red-400 bg-red-500/10' },
  followup: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10' },
  contract: { icon: FileText, color: 'text-yellow-400 bg-yellow-500/10' },
  call: { icon: Phone, color: 'text-violet-400 bg-violet-500/10' },
  review: { icon: Clock, color: 'text-orange-400 bg-orange-500/10' },
  celebrate: { icon: Trophy, color: 'text-green-400 bg-green-500/10' },
}

export function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              ✅ Tes actions du jour
            </CardTitle>
            <CardDescription className="mt-1">
              Généré aujourd&apos;hui à 6h00 par ton assistant IA
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="text-violet-400 font-medium">{completedCount}</span>
            <span className="mx-1">/</span>
            <span>{totalCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => {
            const config = typeConfig[task.type]
            const Icon = config.icon

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all',
                  task.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    'mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                    task.completed
                      ? 'bg-violet-500 border-violet-500'
                      : 'border-white/30 hover:border-violet-400'
                  )}
                >
                  {task.completed && <Check className="h-3 w-3 text-white" />}
                </button>

                {/* Icône type */}
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm',
                    task.completed && 'line-through text-muted-foreground'
                  )}>
                    {task.description}
                  </p>
                  {task.clientName && (
                    <Link
                      href={task.clientId ? `/dashboard/clients/${task.clientId}` : '#'}
                      className="text-xs text-violet-400 hover:text-violet-300 mt-0.5 inline-block"
                    >
                      → {task.clientName}
                    </Link>
                  )}
                </div>

                {/* Badge priorité */}
                {task.priority === 'critical' && !task.completed && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    Urgent
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}