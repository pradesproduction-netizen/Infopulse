'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, Euro, TrendingUp, UserCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Objective } from '@/lib/types'
import type { ElementType } from 'react'

interface ObjectivesSectionProps {
  objective: Objective | null
  userId: string
}

const FIELDS: {
  key: keyof Pick<Objective, 'revenue_target' | 'closing_rate_target' | 'show_up_rate_target'>
  label: string
  icon: ElementType
  placeholder: string
  suffix: string
  max?: number
}[] = [
  { key: 'revenue_target', label: 'CA mensuel cible', icon: Euro, placeholder: '10000', suffix: '€' },
  { key: 'closing_rate_target', label: 'Taux de closing cible', icon: TrendingUp, placeholder: '30', suffix: '%', max: 100 },
  { key: 'show_up_rate_target', label: 'Show-up rate cible', icon: UserCheck, placeholder: '80', suffix: '%', max: 100 },
]

export function ObjectivesSection({ objective, userId }: ObjectivesSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    revenue_target: String(objective?.revenue_target ?? ''),
    closing_rate_target: String(objective?.closing_rate_target ?? ''),
    show_up_rate_target: String(objective?.show_up_rate_target ?? ''),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const now = new Date()
    const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const payload = {
      infopreneur_id: userId,
      period: 'monthly',
      period_start: periodStart,
      revenue_target: form.revenue_target ? Number(form.revenue_target) : null,
      closing_rate_target: form.closing_rate_target ? Number(form.closing_rate_target) : null,
      show_up_rate_target: form.show_up_rate_target ? Number(form.show_up_rate_target) : null,
    }

    let dbError
    if (objective?.id) {
      // Update existing
      const { error } = await supabase.from('objectives').update(payload).eq('id', objective.id)
      dbError = error
    } else {
      // Insert new
      const { error } = await supabase.from('objectives').insert(payload)
      dbError = error
    }

    setLoading(false)
    if (dbError) {
      setError(dbError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Objectifs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ces valeurs alimentent les barres de progression du bilan hebdomadaire
        </p>
      </div>

      <Card className="border-white/10 bg-card/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {FIELDS.map(({ key, label, icon: Icon, placeholder, suffix, max }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    max={max}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    disabled={loading}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {suffix}
                  </span>
                </div>
              </div>
            ))}

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Target className="mr-2 h-4 w-4" />
                Enregistrer les objectifs
              </Button>
              {saved && <span className="text-sm text-green-400">Enregistré ✓</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Les objectifs s&apos;appliquent au mois en cours et se réinitialisent automatiquement chaque mois.
      </p>
    </div>
  )
}
