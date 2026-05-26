'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Prospect } from '@/lib/types'

export function useProspects(infopreneurId: string, initial: Prospect[]): Prospect[] {
  const [prospects, setProspects] = useState<Prospect[]>(initial)

  useEffect(() => {
    setProspects(initial)
  }, [initial])

  useEffect(() => {
    const supabase = createClient()

    async function refetch() {
      const { data } = await supabase
        .from('prospects')
        .select('*')
        .eq('infopreneur_id', infopreneurId)
      if (data) setProspects(data as Prospect[])
    }

    const channel = supabase
      .channel(`prospects-${infopreneurId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` },
        () => { void refetch() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [infopreneurId])

  return prospects
}
