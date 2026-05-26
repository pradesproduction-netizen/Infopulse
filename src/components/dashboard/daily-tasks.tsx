'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check, AlertCircle, Phone, FileText, MessageCircle,
  Trophy, Clock, RefreshCw, Loader2, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  task_type: 'reminder' | 'followup' | 'contract' | 'call' | 'review' | 'celebrate'
  description: string
  related_client_id?: string | null
  priority: 'high' | 'medium' | 'normal' | 'low'
  is_completed: boolean
}

interface DailyTasksProps {
  tasks: Task[]
  userId: string
}

const typeConfig: Record<Task['task_type'], { icon: React.ElementType; color: string }> = {
  reminder: { icon: AlertCircle, color: 'text-red-400 bg-red-500/10' },
  followup: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10' },
  contract: { icon: FileText, color: 'text-yellow-400 bg-yellow-500/10' },
  call: { icon: Phone, color: 'text-violet-400 bg-violet-500/10' },
  review: { icon: Clock, color: 'text-orange-400 bg-orange-500/10' },
  celebrate: { icon: Trophy, color: 'text-green-400 bg-green-500/10' },
}

export function DailyTasks({ tasks: initialTasks, userId }: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [regenerating, setRegenerating] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => { setTasks(initialTasks) }, [initialTasks])

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t)))
  }

  async function handleRegenerate() {
    setRegenerating(true)
    setDbError(null)
    try {
      const res = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infopreneur_id: userId }),
      })
      const data = await res.json()
      if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        setTasks(data.tasks)
        if (data.persisted) {
          router.refresh()
        } else {
          setDbError(data.dbError ?? 'Tâches générées mais non sauvegardées (table manquante ou policy RLS)')
        }
      }
    } catch {
      setDbError('Erreur réseau — réessaie dans un instant.')
    } finally {
      setRegenerating(false)
    }
  }

  const completedCount = tasks.filter((t) => t.is_completed).length

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              ✅ Tes actions du jour
            </CardTitle>
            <CardDescription className="mt-1">
              {tasks.length > 0
                ? `${completedCount}/${tasks.length} complétée${completedCount !== 1 ? 's' : ''}`
                : 'Clique sur Générer pour obtenir tes tâches IA du jour'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="gap-1.5 text-xs h-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {regenerating ? 'Génération…' : 'Régénérer'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {dbError && (
          <div className="mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
            ⚠️ {dbError}
          </div>
        )}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Aucune tâche générée aujourd&apos;hui</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique sur &quot;Régénérer&quot; pour que l&apos;IA analyse tes données et crée tes tâches du jour.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="gap-2 bg-violet-600 hover:bg-violet-700"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {regenerating ? 'Génération en cours…' : 'Générer mes tâches IA'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const config = typeConfig[task.task_type] ?? typeConfig.review
              const Icon = config.icon

              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-all',
                    task.is_completed
                      ? 'bg-white/[0.02] border-white/5 opacity-50'
                      : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                  )}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      'mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                      task.is_completed
                        ? 'bg-violet-500 border-violet-500'
                        : 'border-white/30 hover:border-violet-400'
                    )}
                  >
                    {task.is_completed && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', task.is_completed && 'line-through text-muted-foreground')}>
                      {task.description}
                    </p>
                    {task.related_client_id && (
                      <Link
                        href={`/dashboard/clients/${task.related_client_id}`}
                        className="text-xs text-violet-400 hover:text-violet-300 mt-0.5 inline-block"
                      >
                        → Voir le client
                      </Link>
                    )}
                  </div>

                  {task.priority === 'high' && !task.is_completed && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
