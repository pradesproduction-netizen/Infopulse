'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Prospect } from '@/lib/types'

export function useProspects(infopreneurId: string): Prospect[] {
  const [prospects, setProspects] = useState<Prospect[]>([])

  useEffect(() => {
    const supabase = createClient()

    async function refetch() {
      const { data } = await supabase
        .from('prospects')
        .select('*')
        .eq('infopreneur_id', infopreneurId)
      if (data) setProspects(data as Prospect[])
    }

    void refetch()

    const channel = supabase
      .channel(`prospects-${infopreneurId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` }, () => { void refetch() })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` }, () => { void refetch() })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` }, () => { void refetch() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [infopreneurId])

  return prospects
}
