'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProspectsKpis {
  caMonth: number
  total: number
  rdvBooke: number
}

export function useProspectsKpis(infopreneurId: string): ProspectsKpis {
  const [kpis, setKpis] = useState<ProspectsKpis>({ caMonth: 0, total: 0, rdvBooke: 0 })

  useEffect(() => {
    const supabase = createClient()

    async function refetch() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

      const [caRes, totalRes, rdvRes] = await Promise.all([
        supabase
          .from('prospects')
          .select('estimated_value')
          .eq('infopreneur_id', infopreneurId)
          .eq('pipeline_stage', 'Gagné')
          .gte('updated_at', startOfMonth)
          .lt('updated_at', startOfNextMonth),
        supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('infopreneur_id', infopreneurId),
        supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('infopreneur_id', infopreneurId)
          .eq('pipeline_stage', 'RDV booké'),
      ])

      setKpis({
        caMonth: (caRes.data ?? []).reduce((s, p) => s + (p.estimated_value ?? 0), 0),
        total: totalRes.count ?? 0,
        rdvBooke: rdvRes.count ?? 0,
      })
    }

    void refetch()

    const channel = supabase
      .channel(`kpis-${infopreneurId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` }, () => { void refetch() })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` }, () => { void refetch() })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'prospects', filter: `infopreneur_id=eq.${infopreneurId}` }, () => { void refetch() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [infopreneurId])

  return kpis
}
