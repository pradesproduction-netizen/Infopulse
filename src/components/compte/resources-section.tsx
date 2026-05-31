'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Trash2, Upload, Loader2 } from 'lucide-react'

interface SopRecord {
  id: string
  type: 'setter' | 'closer'
  file_name: string
  created_at: string
}

function SopUploadZone({
  type,
  label,
  sop,
  onRefresh,
}: {
  type: 'setter' | 'closer'
  label: string
  sop: SopRecord | null
  onRefresh: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch('/api/sop/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok) setError(json.error ?? 'Erreur lors de l\'upload')
    else onRefresh()
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete() {
    if (!confirm(`Supprimer le SOP ${label} ?`)) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/sop/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const json = await res.json()
    if (!res.ok) setError(json.error ?? 'Erreur lors de la suppression')
    else onRefresh()
    setLoading(false)
  }

  return (
    <Card className="border-white/10 bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              {sop ? (
                <>
                  <p className="text-xs text-muted-foreground truncate">{sop.file_name}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">
                    Mis à jour le {new Date(sop.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Aucun document uploadé</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {sop && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Upload className="h-3.5 w-3.5" />
              }
              {sop ? 'Remplacer' : 'Uploader'}
            </Button>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}

export function ResourcesSection({ userId }: { userId: string }) {
  const [sops, setSops] = useState<SopRecord[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchSops() {
    const supabase = createClient()
    const { data } = await supabase
      .from('sop_documents')
      .select('id, type, file_name, created_at')
      .eq('infopreneur_id', userId)
    setSops(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchSops() }, [userId])

  const setterSop = sops.find((s) => s.type === 'setter') ?? null
  const closerSop = sops.find((s) => s.type === 'closer') ?? null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ressources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Documents partagés avec votre équipe
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      ) : (
        <div className="space-y-3">
          <SopUploadZone type="setter" label="SOP Setter" sop={setterSop} onRefresh={fetchSops} />
          <SopUploadZone type="closer" label="SOP Closer" sop={closerSop} onRefresh={fetchSops} />
        </div>
      )}
    </div>
  )
}
