'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePaymentAlerts(infopreneurId: string): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    async function fetchCount() {
      const today = new Date().toISOString().split('T')[0]

      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('infopreneur_id', infopreneurId)

      const clientIds = (clients ?? []).map((c: { id: string }) => c.id)
      if (clientIds.length === 0) {
        setCount(0)
        return
      }

      const { count: alertCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .lte('next_payment_date', today)
        .neq('status', 'paid')

      setCount(alertCount ?? 0)
    }

    fetchCount()

    const channel = supabase
      .channel(`payment-alerts-${infopreneurId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, fetchCount)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments' }, fetchCount)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'payments' }, fetchCount)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [infopreneurId])

  return count
}
