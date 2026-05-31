'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export function SopDownloadButton({ type }: { type: 'setter' | 'closer' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/sop/download?type=${type}`)
    const json = await res.json()
    if (!res.ok || !json.url) {
      setError('Impossible de générer le lien de téléchargement.')
    } else {
      window.open(json.url, '_blank')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" variant="outline" className="border-white/10 gap-1.5" onClick={handleDownload} disabled={loading}>
        {loading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Download className="h-3.5 w-3.5" />
        }
        Télécharger
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
