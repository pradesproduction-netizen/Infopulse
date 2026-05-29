'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteClientButtonProps {
  clientId: string
  clientName: string
}

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()

    // 1. Delete payments first so realtime payment channels fire
    await supabase.from('payments').delete().eq('client_id', clientId)

    // 2. Delete client — ON DELETE CASCADE automatically removes the linked prospect
    const { error } = await supabase.from('clients').delete().eq('id', clientId)

    setLoading(false)
    setOpen(false)

    if (error) {
      toast.error('Erreur lors de la suppression')
      return
    }

    toast.success(`🗑️ ${clientName} supprimé des clients et de la pipeline`, { duration: 4000 })
    router.push('/dashboard/clients')
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="border-white/10 hover:border-red-500/40 hover:text-red-400"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Supprimer ce client ?"
        description={`Cette action est irréversible. ${clientName} et toutes ses données associées (paiements, contrats, sessions) seront définitivement supprimés.`}
        confirmLabel="Supprimer définitivement"
        cancelLabel="Annuler"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
