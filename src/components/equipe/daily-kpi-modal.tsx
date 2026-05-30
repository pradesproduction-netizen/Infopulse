'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, Trash2 } from 'lucide-react'

interface DailyKpiModalProps {
  date: string
  teamMemberId: string
  role: 'closer' | 'setter'
  isFilled: boolean
  onClose: () => void
  onSaved: (date: string) => void
  onCleared: (date: string) => void
}

interface CloserForm {
  r1_showup: string; r1_noshow: string; r2_showup: string; r2_noshow: string
  pas_qualifie: string; pas_qualifie_note: string; signe: string
  ca_contracte: string; ca_collecte: string
}

interface SetterForm {
  messages_envoyes: string; reponses_recues: string; followup: string; calls_bookes: string
}

const CLOSER_DEFAULTS: CloserForm = {
  r1_showup: '0', r1_noshow: '0', r2_showup: '0', r2_noshow: '0',
  pas_qualifie: '0', pas_qualifie_note: '', signe: '0', ca_contracte: '0', ca_collecte: '0',
}

const SETTER_DEFAULTS: SetterForm = {
  messages_envoyes: '0', reponses_recues: '0', followup: '0', calls_bookes: '0',
}

function NumInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm" />
    </div>
  )
}

function EurInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-9 text-sm pr-7" />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
      </div>
    </div>
  )
}

export function DailyKpiModal({ date, teamMemberId, role, isFilled, onClose, onSaved, onCleared }: DailyKpiModalProps) {
  const [closerForm, setCloserForm] = useState<CloserForm>(CLOSER_DEFAULTS)
  const [setterForm, setSetterForm] = useState<SetterForm>(SETTER_DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isFilled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFilled) return
    setFetching(true)
    fetch(`/api/daily-kpi?team_member_id=${teamMemberId}&date=${date}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return
        if (role === 'closer') {
          setCloserForm({
            r1_showup: String(data.r1_showup ?? 0),
            r1_noshow: String(data.r1_noshow ?? 0),
            r2_showup: String(data.r2_showup ?? 0),
            r2_noshow: String(data.r2_noshow ?? 0),
            pas_qualifie: String(data.pas_qualifie ?? 0),
            pas_qualifie_note: data.pas_qualifie_note ?? '',
            signe: String(data.signe ?? 0),
            ca_contracte: String(data.ca_contracte ?? 0),
            ca_collecte: String(data.ca_collecte ?? 0),
          })
        } else {
          setSetterForm({
            messages_envoyes: String(data.messages_envoyes ?? 0),
            reponses_recues: String(data.reponses_recues ?? 0),
            followup: String(data.followup ?? 0),
            calls_bookes: String(data.calls_bookes ?? 0),
          })
        }
      })
      .finally(() => setFetching(false))
  }, [isFilled, date, teamMemberId, role])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = role === 'closer'
      ? {
          team_member_id: teamMemberId, date, role,
          r1_showup: Number(closerForm.r1_showup),
          r1_noshow: Number(closerForm.r1_noshow),
          r2_showup: Number(closerForm.r2_showup),
          r2_noshow: Number(closerForm.r2_noshow),
          pas_qualifie: Number(closerForm.pas_qualifie),
          pas_qualifie_note: closerForm.pas_qualifie_note || null,
          signe: Number(closerForm.signe),
          ca_contracte: Number(closerForm.ca_contracte),
          ca_collecte: Number(closerForm.ca_collecte),
        }
      : {
          team_member_id: teamMemberId, date, role,
          messages_envoyes: Number(setterForm.messages_envoyes),
          reponses_recues: Number(setterForm.reponses_recues),
          followup: Number(setterForm.followup),
          calls_bookes: Number(setterForm.calls_bookes),
        }

    const res = await fetch('/api/daily-kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      onSaved(date)
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? "Erreur lors de l'enregistrement")
    }
  }

  async function handleClear() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/daily-kpi?team_member_id=${teamMemberId}&date=${date}`, {
      method: 'DELETE',
    })
    setLoading(false)
    if (res.ok) {
      onCleared(date)
    } else {
      setError('Erreur lors de la suppression')
    }
  }

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-white/10 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-semibold capitalize">{displayDate}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {role === 'closer' ? 'KPI Closer' : 'KPI Setter'}
            </p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {role === 'closer' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput label="R1 Show-up" value={closerForm.r1_showup}
                    onChange={(v) => setCloserForm((f) => ({ ...f, r1_showup: v }))} />
                  <NumInput label="R1 No-show" value={closerForm.r1_noshow}
                    onChange={(v) => setCloserForm((f) => ({ ...f, r1_noshow: v }))} />
                  <NumInput label="R2 Show-up" value={closerForm.r2_showup}
                    onChange={(v) => setCloserForm((f) => ({ ...f, r2_showup: v }))} />
                  <NumInput label="R2 No-show" value={closerForm.r2_noshow}
                    onChange={(v) => setCloserForm((f) => ({ ...f, r2_noshow: v }))} />
                  <NumInput label="Pas qualifié" value={closerForm.pas_qualifie}
                    onChange={(v) => setCloserForm((f) => ({ ...f, pas_qualifie: v }))} />
                  <NumInput label="Signés" value={closerForm.signe}
                    onChange={(v) => setCloserForm((f) => ({ ...f, signe: v }))} />
                  <EurInput label="CA contracté" value={closerForm.ca_contracte}
                    onChange={(v) => setCloserForm((f) => ({ ...f, ca_contracte: v }))} />
                  <EurInput label="CA collecté" value={closerForm.ca_collecte}
                    onChange={(v) => setCloserForm((f) => ({ ...f, ca_collecte: v }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Note "Pas qualifié"</Label>
                  <Textarea
                    placeholder="Raisons de non-qualification..."
                    value={closerForm.pas_qualifie_note}
                    onChange={(e) => setCloserForm((f) => ({ ...f, pas_qualifie_note: e.target.value }))}
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Messages envoyés" value={setterForm.messages_envoyes}
                  onChange={(v) => setSetterForm((f) => ({ ...f, messages_envoyes: v }))} />
                <NumInput label="Réponses reçues" value={setterForm.reponses_recues}
                  onChange={(v) => setSetterForm((f) => ({ ...f, reponses_recues: v }))} />
                <NumInput label="Follow-ups" value={setterForm.followup}
                  onChange={(v) => setSetterForm((f) => ({ ...f, followup: v }))} />
                <NumInput label="Calls bookés" value={setterForm.calls_bookes}
                  onChange={(v) => setSetterForm((f) => ({ ...f, calls_bookes: v }))} />
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" className="flex-1 bg-violet-500 hover:bg-violet-600" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </Button>
              {isFilled && (
                <Button type="button" variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 px-3"
                  onClick={handleClear} disabled={loading} title="Effacer">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
