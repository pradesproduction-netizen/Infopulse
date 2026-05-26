'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'

interface NotesTabProps {
  clientId: string
  initialNotes: string | null
}

export function NotesTab({ clientId, initialNotes }: NotesTabProps) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('clients').update({ notes }).eq('id', clientId)
    setSaving(false)
    setSavedAt(new Date())
  }

  return (
    <Card className="border-white/10 bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notes & journal</CardTitle>
          {savedAt && (
            <p className="text-xs text-muted-foreground">
              Sauvegardé à{' '}
              {savedAt.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes, observations, points importants sur ce client..."
          className="min-h-[400px] resize-none bg-white/5 border-white/10 focus-visible:ring-violet-500/30 font-mono text-sm leading-relaxed"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-violet-500 hover:bg-violet-600 gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
