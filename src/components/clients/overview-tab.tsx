'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Mail, Phone, Building2, Calendar, Plus, X, Check, Lock,
  Sparkles, Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client, CoachingStep, ClientProgram, Program } from '@/lib/types'

interface OverviewTabProps {
  client: Client
  coachingSteps: CoachingStep[]
  clientPrograms: ClientProgram[]
  availablePrograms: Program[]
}

function DonutChart({ pct, completed, total }: { pct: number; completed: number; total: number }) {
  const radius = 52
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="130" height="130" className="-rotate-90">
        <circle cx="65" cy="65" r={radius} strokeWidth={stroke} className="fill-none stroke-white/10" />
        <circle
          cx="65" cy="65" r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-violet-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{completed}</span>
        <span className="text-xs text-muted-foreground">/ {total}</span>
      </div>
    </div>
  )
}

export function OverviewTab({ client, coachingSteps, clientPrograms, availablePrograms }: OverviewTabProps) {
  const router = useRouter()
  const [startDate, setStartDate] = useState(client.start_date ?? '')
  const [savingDate, setSavingDate] = useState(false)
  const [addingProgram, setAddingProgram] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const completed = coachingSteps.filter((s) => s.status === 'completed').length
  const total = coachingSteps.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const linkedProgramIds = new Set(clientPrograms.map((cp) => cp.program_id))
  const selectablePrograms = availablePrograms.filter((p) => !linkedProgramIds.has(p.id))

  async function handleDateBlur() {
    if (startDate === (client.start_date ?? '')) return
    setSavingDate(true)
    const supabase = createClient()
    await supabase.from('clients').update({ start_date: startDate || null }).eq('id', client.id)
    setSavingDate(false)
    router.refresh()
  }

  async function handleAddProgram(programId: string) {
    setAddingProgram(true)
    const program = availablePrograms.find((p) => p.id === programId)
    const supabase = createClient()
    await supabase.from('client_programs').insert({ client_id: client.id, program_id: programId })
    if (program?.price != null) {
      const currentTotal = Number(client.total_amount ?? 0)
      const linkedTotal = clientPrograms.reduce((s, cp) => s + (cp.program?.price ?? 0), 0)
      const newTotal = linkedTotal + program.price
      await supabase.from('clients').update({ total_amount: newTotal }).eq('id', client.id)
    }
    setAddingProgram(false)
    router.refresh()
  }

  async function handleRemoveProgram(cpId: string, programId: string) {
    setRemovingId(cpId)
    const program = availablePrograms.find((p) => p.id === programId)
    const supabase = createClient()
    await supabase.from('client_programs').delete().eq('id', cpId)
    if (program?.price != null) {
      const newTotal = clientPrograms
        .filter((cp) => cp.id !== cpId)
        .reduce((s, cp) => s + (cp.program?.price ?? 0), 0)
      await supabase.from('clients').update({ total_amount: newTotal || null }).eq('id', client.id)
    }
    setRemovingId(null)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* LEFT COLUMN — 3/5 */}
      <div className="lg:col-span-3 space-y-5">
        {/* Contact info */}
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
            {client.phone ? (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.phone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>—</span>
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-2.5 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.company}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Programme(s) */}
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Programme(s)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientPrograms.length === 0 && !client.program_name && (
              <p className="text-sm text-muted-foreground">Aucun programme associé.</p>
            )}
            {/* Legacy program_name (migration compat) */}
            {client.program_name && clientPrograms.length === 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-violet-500/10 text-violet-300 border-violet-500/30">
                  {client.program_name}
                </Badge>
                <span className="text-xs text-muted-foreground">(hérité)</span>
              </div>
            )}
            {/* Linked programs */}
            <div className="flex flex-wrap gap-2">
              {clientPrograms.map((cp) => (
                <div key={cp.id} className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-violet-500/10 text-violet-300 border-violet-500/30 gap-1.5">
                    {cp.program?.name ?? 'Programme'}
                    {cp.program?.price != null && (
                      <span className="text-violet-200/70">{cp.program.price.toLocaleString('fr-FR')} €</span>
                    )}
                    <button
                      className="hover:text-destructive transition-colors ml-0.5"
                      onClick={() => handleRemoveProgram(cp.id, cp.program_id)}
                      disabled={removingId === cp.id}
                      title="Retirer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              ))}
            </div>
            {/* Add program select */}
            {selectablePrograms.length > 0 && (
              <Select onValueChange={handleAddProgram} disabled={addingProgram} value="">
                <SelectTrigger className="h-8 text-xs border-dashed border-white/20 bg-transparent w-full">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" />
                    {addingProgram ? 'Ajout en cours…' : 'Ajouter un programme'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {selectablePrograms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}{p.price != null ? ` — ${p.price.toLocaleString('fr-FR')} €` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {availablePrograms.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Crée des programmes dans <span className="text-violet-400">Compte → Mes programmes</span>.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Date de début */}
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date de début
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={handleDateBlur}
                className="h-8 text-sm bg-white/5 border-white/10 max-w-[180px]"
              />
              {savingDate && <span className="text-xs text-muted-foreground">Sauvegarde…</span>}
            </div>
          </CardContent>
        </Card>

        {/* Résumé IA */}
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Résumé IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground italic">
              L&apos;analyse IA sera disponible prochainement. Elle résumera l&apos;activité du client, ses dernières sessions et ses paiements.
            </p>
            <Button variant="outline" size="sm" className="gap-2 border-white/10" disabled>
              <Sparkles className="h-3.5 w-3.5" />
              Analyser ce client
              <span className="text-xs text-muted-foreground">(bientôt)</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN — 2/5 */}
      <div className="lg:col-span-2 space-y-5">
        <Card className="border-white/10 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progression du coaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Aucune étape définie pour ce client.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Donut */}
                <div className="flex flex-col items-center gap-2">
                  <DonutChart pct={pct} completed={completed} total={total} />
                  <p className="text-xs text-muted-foreground">{pct}% complété</p>
                </div>

                {/* Step list */}
                <div className="space-y-2">
                  {coachingSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2.5 text-sm">
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0',
                          step.status === 'completed' && 'bg-violet-500',
                          step.status === 'in_progress' && 'border-2 border-violet-500 bg-transparent',
                          step.status === 'locked' && 'bg-white/10'
                        )}
                      >
                        {step.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                        {step.status === 'in_progress' && <div className="h-2 w-2 rounded-full bg-violet-500" />}
                        {step.status === 'locked' && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                      </div>
                      <span className={cn('flex-1 truncate text-xs', step.status === 'locked' && 'text-muted-foreground')}>
                        {step.title}
                      </span>
                      {step.completed_at && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(step.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
